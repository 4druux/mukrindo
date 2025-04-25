"use client";

import React, { useState, useMemo } from "react";
import useSWR from "swr";
import axios from "axios";

// Import Components
import BreadcrumbNav from "@/components/common/BreadcrumbNav";
import Pagination from "@/components/global/Pagination";
import { motion, AnimatePresence } from "framer-motion";
import RequestList from "@/components/product-admin/BuySell-TradeIn/RequestList";
import ModalRequestDetail from "@/components/product-admin/BuySell-TradeIn/ModalRequestDetail";
import { useRequestContact } from "@/hooks/useRequestContact";
import RequestFilter, {
  TRADE_IN_STATUS_FILTER,
  TRADE_IN_LOCATION_FILTER,
  TRADE_IN_SORT_ORDER,
} from "@/components/product-admin/BuySell-TradeIn/RequestFilter";
import SkeletonRequest from "@/components/skeleton/skeleton-admin/SkeletonRequest";

// Import Icons
import { FaBoxOpen } from "react-icons/fa";

const defaultFilters = {
  status: TRADE_IN_STATUS_FILTER.ALL,
  location: TRADE_IN_LOCATION_FILTER.ALL,
  sortBy: TRADE_IN_SORT_ORDER.LATEST_CREATED,
};

const fetcher = (url) => axios.get(url).then((res) => res.data);
const API_ENDPOINT = "http://localhost:5000/api/trade-in";
const REQUESTS_PER_PAGE = 12;

const TradeInList = () => {
  const [currentPage, setCurrentPage] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRequestId, setselectedRequestId] = useState(null);
  const [activeFilters, setActiveFilters] = useState(defaultFilters);
  const [visuallyActiveFilter, setVisuallyActiveFilter] = useState({
    type: "status",
    value: TRADE_IN_STATUS_FILTER.ALL,
  });

  const {
    data: response,
    error,
    isLoading,
    mutate: mutateList,
  } = useSWR(API_ENDPOINT, fetcher, {
    revalidateOnFocus: true,
  });

  const handleFilterClick = (clickedType, clickedValue) => {
    const newLogicalFilters = {
      ...defaultFilters,
      [clickedType]: clickedValue,
    };
    if (clickedType !== "sortBy") {
      newLogicalFilters.sortBy = defaultFilters.sortBy;
    }
    if (clickedType !== "location") {
      newLogicalFilters.location = defaultFilters.location;
    }
    if (clickedType !== "status") {
      newLogicalFilters.status = defaultFilters.status;
    }
    setActiveFilters(newLogicalFilters);
    setVisuallyActiveFilter({ type: clickedType, value: clickedValue });
    setCurrentPage(0);
  };

  const { handleContact: handleContactFromList, updatingRequestId } =
    useRequestContact({
      apiEndpoint: API_ENDPOINT,
      mutateList,
      handleFilterClick,
      requestType: "tradeIn",
      statusConstants: TRADE_IN_STATUS_FILTER,
      locationConstants: TRADE_IN_LOCATION_FILTER,
    });

  const handleStatusUpdateFilter = (updatedRequestId, newStatus) => {
    if (
      newStatus === TRADE_IN_STATUS_FILTER.CONTACTED ||
      newStatus === TRADE_IN_STATUS_FILTER.COMPLETED ||
      newStatus === TRADE_IN_STATUS_FILTER.CANCELLED
    ) {
      if (
        visuallyActiveFilter.type !== "status" ||
        visuallyActiveFilter.value !== newStatus
      ) {
        handleFilterClick("status", newStatus);
      }
    }
  };

  const filteredAndSortedRequests = useMemo(() => {
    let requests =
      response && Array.isArray(response.data) ? response.data : [];

    if (activeFilters.status !== TRADE_IN_STATUS_FILTER.ALL) {
      requests = requests.filter((req) => req.status === activeFilters.status);
    }

    if (activeFilters.location !== TRADE_IN_LOCATION_FILTER.ALL) {
      const targetLocationType = activeFilters.location;
      requests = requests.filter((req) => {
        if (targetLocationType === TRADE_IN_LOCATION_FILTER.HOME) {
          return (
            req.inspectionLocationType !== TRADE_IN_LOCATION_FILTER.SHOWROOM &&
            req.inspectionLocationType
          );
        }
        return req.inspectionLocationType === targetLocationType;
      });
    }

    // Sorting
    if (activeFilters.sortBy === TRADE_IN_SORT_ORDER.NEAREST_INSPECTION) {
      requests = [...requests].sort((a, b) => {
        const dateTimeA = new Date(
          `${a.inspectionDate}T${a.inspectionTime || "00:00:00"}`
        );
        const dateTimeB = new Date(
          `${b.inspectionDate}T${b.inspectionTime || "00:00:00"}`
        );
        const timeA = !isNaN(dateTimeA.getTime())
          ? dateTimeA.getTime()
          : Infinity;
        const timeB = !isNaN(dateTimeB.getTime())
          ? dateTimeB.getTime()
          : Infinity;
        return timeA - timeB;
      });
    }

    return requests;
  }, [response?.data, activeFilters]);

  // --- Pagination Logic  ---
  const tradeInRequests = Array.isArray(filteredAndSortedRequests)
    ? filteredAndSortedRequests
    : [];
  const pageCount = Math.ceil(tradeInRequests.length / REQUESTS_PER_PAGE);
  const indexOfLastTradeInRequest = (currentPage + 1) * REQUESTS_PER_PAGE;
  const indexOfFirstTradeInRequest =
    indexOfLastTradeInRequest - REQUESTS_PER_PAGE;
  const currentTradeInRequests = tradeInRequests.slice(
    indexOfFirstTradeInRequest,
    indexOfLastTradeInRequest
  );

  const handlePageChange = (data) => {
    setCurrentPage(data.selected);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleRowClick = (tradeInRequestId) => {
    setselectedRequestId(tradeInRequestId);
    setIsModalOpen(true);
    document.body.style.overflow = "hidden";
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setselectedRequestId(null);
    document.body.style.overflow = "auto";
  };

  const getInspectionLocationText = (locationType) => {
    if (!locationType) return "-";
    if (locationType === TRADE_IN_LOCATION_FILTER.SHOWROOM) return "Showroom";
    if (locationType === TRADE_IN_LOCATION_FILTER.HOME)
      return "Rumah Pelanggan";
    return locationType;
  };

  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.3 } },
    exit: { opacity: 0, transition: { duration: 0.3 } },
  };

  const modalVariants = {
    hidden: { y: "100%", opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "tween", duration: 0.4, ease: "easeInOut" },
    },
    exit: {
      y: "100%",
      opacity: 0,
      transition: { type: "tween", duration: 0.4, ease: "easeInOut" },
    },
  };

  const breadcrumbItems = [
    { label: "Beranda", href: "/admin" },
    { label: "Tukar Tambah", href: "" },
  ];

  if (isLoading && !response) {
    return (
      <div>
        <BreadcrumbNav items={breadcrumbItems} />
        <h2 className="text-sm lg:text-lg leading-6 font-semibold text-gray-700 mb-4">
          Permintaan Jual Mobil Terbaru
        </h2>
        <RequestFilter
          requestType="tradeIn"
          visuallyActiveFilter={visuallyActiveFilter}
          onFilterClick={handleFilterClick}
        />
        <div className="mt-6">
          <SkeletonRequest requestType="tradeIn" />
        </div>
      </div>
    );
  }

  if (error) {
    console.error("Error fetching trade-in requests:", error);
    return (
      <div className="mt-6 p-4 border rounded-lg shadow bg-white">
        <h2 className="text-xl font-semibold mb-4 text-red-700">
          Permintaan Tukar Tambah
        </h2>
        <p className="text-center text-red-600">
          Gagal memuat data permintaan. Silakan coba lagi nanti.
        </p>
      </div>
    );
  }

  return (
    <div>
      <BreadcrumbNav items={breadcrumbItems} />

      <h2 className="text-sm lg:text-lg leading-6 font-semibold text-gray-700 mb-4">
        Permintaan Tukar Tambah Terbaru
      </h2>

      <RequestFilter
        requestType="tradeIn"
        visuallyActiveFilter={visuallyActiveFilter}
        onFilterClick={handleFilterClick}
      />

      {isLoading && tradeInRequests.length > 0 ? (
        <div className="mt-6">
          <SkeletonRequest requestType="tradeIn" />
        </div>
      ) : tradeInRequests.length === 0 && !isLoading ? (
        <div className="flex justify-center items-center h-[50vh] text-center mt-6">
          <div className="flex flex-col sm:flex-row gap-4 items-center text-center sm:text-left">
            <FaBoxOpen className="w-24 h-24 sm:w-36 sm:h-36 text-gray-500" />
            <div className="flex flex-col text-gray-600 mt-4 sm:mt-0">
              <p className="text-2xl font-semibold">Oops!</p>
              <p>
                Tidak ada permintaan tukar tambah yang cocok dengan filter yang
                dipilih.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <RequestList
          requests={currentTradeInRequests}
          requestType="tradeIn"
          onRowClick={handleRowClick}
          onContactClick={(e, request) =>
            handleContactFromList(e, request, response?.data || [])
          }
          updatingStatusRequestId={updatingRequestId}
          getInspectionLocationText={getInspectionLocationText}
        />
      )}

      <AnimatePresence>
        {isModalOpen && selectedRequestId && (
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
                className="bg-white w-full h-full
                 md:max-w-7xl md:max-h-[70vh] md:rounded-2xl md:shadow-2xl
                 relative flex flex-col overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                <ModalRequestDetail
                  requestType="tradeIn"
                  requestId={selectedRequestId}
                  onClose={handleCloseModal}
                  mutateList={mutateList}
                  currentRequests={response?.data || []}
                  onStatusUpdated={handleStatusUpdateFilter}
                />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {pageCount > 1 && (
        <div className="py-6">
          <Pagination
            key={`tradein-pagination-${activeFilters.status}-${activeFilters.location}-${activeFilters.sortBy}`}
            pageCount={pageCount}
            forcePage={currentPage}
            onPageChange={handlePageChange}
          />
        </div>
      )}
    </div>
  );
};

export default TradeInList;
