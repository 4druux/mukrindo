// src/components/admin/dashboard/RequestView.jsx

"use client";

import React, { useState, useMemo, useEffect } from "react";
import useSWR from "swr";
import axiosInstance from "@/utils/axiosInstance";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchParams } from "next/navigation";

import Pagination from "@/components/global/Pagination";
import SkeletonRequest from "@/components/skeleton/skeleton-admin/SkeletonRequest";
import RequestList from "@/components/product-admin/BuySell-TradeIn/RequestList";
import ModalRequestDetail from "@/components/product-admin/BuySell-TradeIn/ModalRequestDetail";
import RequestNotifyList from "@/components/product-admin/NotifyStock/RequestNotifyList";
import ModalNotifyDetail from "@/components/product-admin/NotifyStock/ModalNotifyDetail";
import RequestFilter, {
  TRADE_IN_STATUS_FILTER,
  TRADE_IN_LOCATION_FILTER,
  TRADE_IN_SORT_ORDER,
  SELL_REQUEST_STATUS_FILTER,
  SELL_REQUEST_LOCATION_FILTER,
  SELL_REQUEST_SORT_ORDER,
  NOTIFY_STATUS_FILTER,
  NOTIFY_SORT_ORDER,
} from "@/components/product-admin/BuySell-TradeIn/RequestFilter";
import { useRequestContact } from "@/hooks/useRequestContact";
import { FaBoxOpen } from "react-icons/fa";

// --- Constants ---
const fetcher = (url) => axiosInstance.get(url).then((res) => res.data);
const REQUESTS_PER_PAGE = 12;

const requestConfigs = {
  tradeIn: {
    apiEndpoint: "/trade-in",
    statusConstants: TRADE_IN_STATUS_FILTER,
    locationConstants: TRADE_IN_LOCATION_FILTER,
    sortConstants: TRADE_IN_SORT_ORDER,
    defaultFilters: {
      status: TRADE_IN_STATUS_FILTER.ALL,
      location: TRADE_IN_LOCATION_FILTER.ALL,
      sortBy: TRADE_IN_SORT_ORDER.LATEST_CREATED,
    },
    pageTitle: "Permintaan Tukar Tambah",
    requestType: "tradeIn",
    emptyStateMessage:
      "Tidak ada permintaan tukar tambah yang cocok dengan filter yang dipilih.",
    errorTitle: "Permintaan Tukar Tambah",
  },
  buySell: {
    apiEndpoint: "/sell-requests",
    statusConstants: SELL_REQUEST_STATUS_FILTER,
    locationConstants: SELL_REQUEST_LOCATION_FILTER,
    sortConstants: SELL_REQUEST_SORT_ORDER,
    defaultFilters: {
      status: SELL_REQUEST_STATUS_FILTER.ALL,
      location: SELL_REQUEST_LOCATION_FILTER.ALL,
      sortBy: SELL_REQUEST_SORT_ORDER.LATEST_CREATED,
    },
    pageTitle: "Permintaan Jual Beli",
    requestType: "buySell",
    emptyStateMessage:
      "Tidak ada permintaan jual beli yang cocok dengan filter yang dipilih.",
    errorTitle: "Permintaan Jual Beli",
  },
  notifyMe: {
    apiEndpoint: "/notif-stock",
    statusConstants: NOTIFY_STATUS_FILTER,
    locationConstants: {},
    sortConstants: NOTIFY_SORT_ORDER,
    defaultFilters: {
      status: NOTIFY_STATUS_FILTER.ALL,
      location: null,
      sortBy: NOTIFY_SORT_ORDER.LATEST_CREATED,
    },
    pageTitle: "Permintaan Notifikasi Stok",
    requestType: "notifyMe",
    emptyStateMessage:
      "Tidak ada permintaan notifikasi yang cocok dengan filter yang dipilih.",
    errorTitle: "Permintaan Notifikasi",
  },
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
};

const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3 } },
  exit: { opacity: 0, transition: { duration: 0.3 } },
};

const modalVariants = {
  hidden: { opacity: 0, scale: 0.9, y: 20 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: "spring", stiffness: 300, damping: 25 },
  },
  exit: {
    opacity: 0,
    scale: 0.9,
    y: 20,
    transition: { duration: 0.2, ease: "easeOut" },
  },
};

const RequestView = () => {
  const [activeTab, setActiveTab] = useState("buySell");
  const [currentPage, setCurrentPage] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState(null);
  const searchParams = useSearchParams();

  useEffect(() => {
    const fromNotification = searchParams.get("fromNotification");
    const id = searchParams.get("id");

    if (fromNotification === "true" && id) {
      const element = document.getElementById(`request-${id}`);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: "smooth", block: "center" });
        }, 500);
      }
    }
  }, [searchParams]);

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab && ["buySell", "tradeIn", "notifyMe"].includes(tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const config = requestConfigs[activeTab];

  const [activeFilters, setActiveFilters] = useState(config.defaultFilters);
  const [visuallyActiveFilter, setVisuallyActiveFilter] = useState({
    type: "status",
    value: config.defaultFilters.status,
  });

  useEffect(() => {
    const newConfig = requestConfigs[activeTab];
    setActiveFilters(newConfig.defaultFilters);
    setVisuallyActiveFilter({
      type: "status",
      value: newConfig.defaultFilters.status,
    });
    setCurrentPage(0);
  }, [activeTab]);

  const {
    data: response,
    error,
    isLoading,
    mutate: mutateList,
  } = useSWR(config.apiEndpoint, fetcher, {
    revalidateOnFocus: true,
  });

  const handleTabChange = (tab) => {
    if (["tradeIn", "buySell", "notifyMe"].includes(tab) && tab !== activeTab) {
      setActiveTab(tab);
    }
  };

  const handleFilterClick = (clickedType, clickedValue) => {
    const currentDefaultFilters = config.defaultFilters;
    const newLogicalFilters = { ...currentDefaultFilters };

    newLogicalFilters[clickedType] = clickedValue;

    if (clickedType !== "sortBy") {
      newLogicalFilters.sortBy = currentDefaultFilters.sortBy;
    }
    if (
      clickedType !== "location" &&
      config.locationConstants &&
      Object.keys(config.locationConstants).length > 0
    ) {
      newLogicalFilters.location = currentDefaultFilters.location;
    }
    if (clickedType !== "status") {
      newLogicalFilters.status = currentDefaultFilters.status;
    }

    setActiveFilters(newLogicalFilters);
    setVisuallyActiveFilter({ type: clickedType, value: clickedValue });
    setCurrentPage(0);
  };

  const { handleContact: handleContactFromList, updatingRequestId } =
    useRequestContact({
      apiEndpoint: config.apiEndpoint,
      mutateList,
      handleFilterClick: handleFilterClick,
      requestType: config.requestType,
      statusConstants: config.statusConstants,
      locationConstants: config.locationConstants,
    });

  const handleStatusUpdateFilter = (updatedRequestId, newStatus) => {
    const relevantStatuses = [
      config.statusConstants.PENDING,
      config.statusConstants.CONTACTED,
      config.statusConstants.COMPLETED,
      config.statusConstants.CANCELLED,
    ].filter(Boolean);

    if (
      relevantStatuses.includes(newStatus) &&
      (visuallyActiveFilter.type !== "status" ||
        visuallyActiveFilter.value !== newStatus)
    ) {
      handleFilterClick("status", newStatus);
    }
  };

  const filteredAndSortedRequests = useMemo(() => {
    let requests =
      response && Array.isArray(response.data) ? response.data : [];

    // Apply Status Filter
    if (activeFilters.status !== config.statusConstants.ALL) {
      requests = requests.filter((req) => req.status === activeFilters.status);
    }

    // Apply Location Filter (if applicable)
    if (
      config.requestType !== "notifyMe" &&
      activeFilters.location !== config.locationConstants.ALL
    ) {
      const targetLocationType = activeFilters.location;
      requests = requests.filter((req) => {
        if (targetLocationType === config.locationConstants.HOME) {
          return (
            req.inspectionLocationType !== config.locationConstants.SHOWROOM
          );
        }
        return req.inspectionLocationType === targetLocationType;
      });
    }

    // Apply Sorting
    if (
      config.requestType !== "notifyMe" &&
      activeFilters.sortBy === config.sortConstants.NEAREST_INSPECTION
    ) {
      requests = [...requests].sort((a, b) => {
        const parseDateTime = (date, time) =>
          date ? new Date(`${date}T${time || "00:00:00"}`) : null;
        const dateTimeA = parseDateTime(a.inspectionDate, a.inspectionTime);
        const dateTimeB = parseDateTime(b.inspectionDate, b.inspectionTime);
        const timeA =
          dateTimeA && !isNaN(dateTimeA.getTime())
            ? dateTimeA.getTime()
            : Infinity;
        const timeB =
          dateTimeB && !isNaN(dateTimeB.getTime())
            ? dateTimeB.getTime()
            : Infinity;

        if (timeA === Infinity && timeB !== Infinity) return 1;
        if (timeA !== Infinity && timeB === Infinity) return -1;
        if (timeA === Infinity && timeB === Infinity) return 0;
        return timeA - timeB;
      });
    } else if (activeFilters.sortBy === config.sortConstants.LATEST_CREATED) {
      requests = [...requests].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
    }

    return requests;
  }, [response?.data, activeFilters, config]);

  const currentRequestsData = Array.isArray(filteredAndSortedRequests)
    ? filteredAndSortedRequests
    : [];
  const pageCount = Math.ceil(currentRequestsData.length / REQUESTS_PER_PAGE);
  const indexOfLastRequest = (currentPage + 1) * REQUESTS_PER_PAGE;
  const indexOfFirstRequest = indexOfLastRequest - REQUESTS_PER_PAGE;
  const currentPagedRequests = currentRequestsData.slice(
    indexOfFirstRequest,
    indexOfLastRequest
  );

  const handlePageChange = (data) => {
    setCurrentPage(data.selected);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleRowClick = (requestId) => {
    setSelectedRequestId(requestId);
    setIsModalOpen(true);
    document.body.style.overflow = "hidden";
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedRequestId(null);
    document.body.style.overflow = "auto";
  };

  const getInspectionLocationText = (locationType) => {
    if (config.requestType === "notifyMe" || !locationType) return "-";
    if (locationType === config.locationConstants?.SHOWROOM) return "Showroom";
    if (locationType !== config.locationConstants?.SHOWROOM)
      return "Rumah Pelanggan";
    return locationType;
  };

  const renderContent = () => {
    if (isLoading && !response) {
      return <SkeletonRequest requestType={config.requestType} />;
    }

    if (error) {
      console.error(`Error fetching ${config.requestType} requests:`, error);
      return (
        <div className="mt-6 p-4 border rounded-lg shadow bg-white">
          <h2 className="text-xl font-semibold mb-4 text-red-700">
            {config.errorTitle}
          </h2>
          <p className="text-center text-red-600">
            Gagal memuat data permintaan. Silakan coba lagi nanti.
          </p>
        </div>
      );
    }

    if (isLoading && currentRequestsData.length > 0) {
      return <SkeletonRequest requestType={config.requestType} />;
    }

    if (currentRequestsData.length === 0 && !isLoading) {
      return (
        <div className="flex justify-center items-center h-[50vh] text-center mt-6">
          <div className="flex flex-col sm:flex-row gap-4 items-center text-center sm:text-left">
            <FaBoxOpen className="w-24 h-24 sm:w-36 sm:h-36 text-gray-500" />
            <div className="flex flex-col text-gray-600 mt-4 sm:mt-0">
              <p className="text-2xl font-semibold">Oops!</p>
              <p>{config.emptyStateMessage}</p>
            </div>
          </div>
        </div>
      );
    }

    const listProps = {
      requests: currentPagedRequests,
      onRowClick: handleRowClick,
      onContactClick: (e, request) =>
        handleContactFromList(e, request, response?.data || []),
      updatingStatusRequestId: updatingRequestId,
    };

    if (config.requestType === "notifyMe") {
      return <RequestNotifyList {...listProps} />;
    } else {
      return (
        <RequestList
          {...listProps}
          requestType={config.requestType}
          getInspectionLocationText={getInspectionLocationText}
        />
      );
    }
  };

  const renderModalContent = () => {
    if (!isModalOpen || !selectedRequestId) return null;

    const modalProps = {
      requestId: selectedRequestId,
      onClose: handleCloseModal,
      mutateList: mutateList,
      currentRequests: response?.data || [],
      onStatusUpdated: handleStatusUpdateFilter,
    };

    return (
      <>
        <motion.div
          key="backdrop"
          className="fixed inset-0 bg-black/60 z-50"
          variants={backdropVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          onClick={handleCloseModal}
        />
        <motion.div
          key="modal-content"
          variants={modalVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="fixed bottom-0 left-0 right-0 h-full md:flex md:items-center md:justify-center z-50"
          onClick={handleCloseModal}
        >
          <div
            className="bg-white w-full h-full md:max-w-7xl md:max-h-[70vh] md:rounded-2xl md:shadow-2xl relative flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {config.requestType === "notifyMe" ? (
              <ModalNotifyDetail {...modalProps} />
            ) : (
              <ModalRequestDetail
                {...modalProps}
                requestType={config.requestType}
              />
            )}
          </div>
        </motion.div>
      </>
    );
  };

  return (
    <motion.div
      className="bg-gradient-to-b from-white to-gray-50 md:bg-transparent lg:p-6 lg:rounded-xl lg:shadow-lg lg:bg-white"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div
        className="flex flex-col gap-2 md:gap-5 pt-6 md:pt-0 mb-6 md:flex-row md:items-center md:justify-between px-3 md:px-0"
        variants={itemVariants}
      >
        <h1 className="text-md lg:text-lg font-medium text-gray-700">
          {config.pageTitle}
        </h1>

        <nav
          className="flex items-center gap-0.5 rounded-full bg-gray-100 p-1 w-full sm:w-auto"
          aria-label="Tabs"
        >
          <button
            onClick={() => handleTabChange("buySell")}
            className={`px-3 py-1.5 font-semibold w-full rounded-full text-xs cursor-pointer transition-colors duration-150 flex items-center justify-center gap-1 whitespace-nowrap ${
              activeTab === "buySell"
                ? "bg-white shadow-sm text-orange-500"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
            }`}
          >
            Jual Mobil
          </button>
          <button
            onClick={() => handleTabChange("tradeIn")}
            className={`px-3 py-1.5 font-semibold w-full rounded-full text-xs cursor-pointer transition-colors duration-150 flex items-center justify-center gap-1 whitespace-nowrap ${
              activeTab === "tradeIn"
                ? "bg-white shadow-sm text-orange-500"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
            }`}
          >
            Tukar Tambah
          </button>
          <button
            onClick={() => handleTabChange("notifyMe")}
            className={`px-3 py-1.5 font-semibold w-full rounded-full text-xs cursor-pointer transition-colors duration-150 flex items-center justify-center gap-1 whitespace-nowrap ${
              activeTab === "notifyMe"
                ? "bg-white shadow-sm text-orange-500"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
            }`}
          >
            Notifikasi Stok
          </button>
        </nav>
      </motion.div>

      <motion.div variants={itemVariants}>
        <RequestFilter
          key={activeTab}
          requestType={config.requestType}
          visuallyActiveFilter={visuallyActiveFilter}
          onFilterClick={handleFilterClick}
          statusOptions={config.statusConstants}
          locationOptions={config.locationConstants}
          sortOptions={config.sortConstants}
        />
      </motion.div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          className="mt-4 lg:mt-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          variants={itemVariants}
        >
          {renderContent()}
        </motion.div>
      </AnimatePresence>

      <AnimatePresence>{renderModalContent()}</AnimatePresence>

      {pageCount > 1 && (
        <motion.div className="pb-4" variants={itemVariants}>
          <Pagination
            key={`pagination-${activeTab}-${activeFilters.status}-${
              activeFilters.location ?? "none"
            }-${activeFilters.sortBy}`}
            pageCount={pageCount}
            forcePage={currentPage}
            onPageChange={handlePageChange}
          />
        </motion.div>
      )}
    </motion.div>
  );
};

export default RequestView;
