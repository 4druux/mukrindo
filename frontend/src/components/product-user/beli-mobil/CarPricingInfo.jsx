// components/product-user/beli-mobil/CarPricingInfo.jsx
import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useProducts } from "@/context/ProductContext";
import { RefreshCw, Heart, Calculator } from "lucide-react";
import { FaMapMarkerAlt, FaShoppingBag, FaWhatsapp } from "react-icons/fa";
import toast from "react-hot-toast";
import AnimatedArrowRight from "@/components/animate-icon/AnimatedArrowRight";
import AnimatedBell from "@/components/animate-icon/AnimatedBell";
import ButtonMagnetic from "@/components/common/ButtonMagnetic";
import ButtonAction from "@/components/common/ButtonAction";

const CarPricingInfo = ({ product, variants }) => {
  if (!product) {
    return null;
  }

  const { isBookmarked, toggleBookmark } = useProducts();
  const [selectedTenor, setSelectedTenor] = useState(null);
  const [showStickyBar, setShowStickyBar] = useState(false);
  const WHATSAPP_NUMBER = "6282123736730";
  const pricingInfoRef = useRef(null);
  const router = useRouter();
  const liked = isBookmarked(product._id);

  useEffect(() => {
    const handleScroll = () => {
      const isCurrentlyMobile = window.innerWidth <= 760;

      if (isCurrentlyMobile) {
        const scrollThreshold = 800;
        const shouldBeSticky = window.scrollY > scrollThreshold;

        if (shouldBeSticky !== showStickyBar) {
          setShowStickyBar(shouldBeSticky);
        }
      } else {
        if (showStickyBar) {
          setShowStickyBar(false);
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, [showStickyBar]);

  const handleTradeInClick = () => {
    if (product) {
      const queryParams = new URLSearchParams({
        newBrand: product.brand || "",
        newModel: product.model || "",
        newVariant: product.variant || "",
        newTransmission: product.transmission || "",
        newCarColor: product.carColor || "",
      });
      router.push(`/tukar-tambah?${queryParams.toString()}`);
    }
  };

  const generateWhatsAppMessage = (includeTenor = false) => {
    let message = `Halo Kak, Saya lihat mobil ini di website MukrindoMotor.id\n\n`;
    message += `*${product.brand} ${product.model} ${product.variant} ${product.yearOfAssembly}*\n`;
    message += `  • Warna: ${product.carColor}\n`;
    message += `  • Transmisi: ${product.transmission}\n`;
    message += `  • Jarak Tempuh: ${product.travelDistance.toLocaleString(
      "id-ID"
    )} KM\n\n`;
    message += `Link Produk: ${window.location.href}\n\n`;
    message += `Mau tanya dong, apakah unit ini masih ready?\n\n`;

    if (includeTenor && selectedTenor) {
      const tenorLabel = tenorOptions.find(
        (opt) => opt.value === selectedTenor
      )?.label;
      message += `Untuk tenor ${tenorLabel}. Boleh minta tolong diinfokan perkiraan simulasinya?\n`;
      message += ` 1. Perkiraan DP minimalnya berapa ya?\n`;
      message += ` 2. Angsuran per bulannya kira-kira berapa?\n`;
      message += ` 3. Syarat dokumennya apa aja yang perlu disiapkan?\n\n`;
    }

    message += `Ditunggu kabarnya ya. Terima kasih.`;
    return encodeURIComponent(message);
  };

  const handleEstimasiPembiayaanClick = () => {
    if (!selectedTenor && product.status !== "Terjual") {
      toast.error("Silakan pilih tenor terlebih dahulu.", {
        className: "custom-toast",
      });

      const tenorSection = document.getElementById(
        "estimasi-pembiayaan-section"
      );
      if (tenorSection) {
        tenorSection.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }
    const message = generateWhatsAppMessage(true);
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`, "_blank");
  };

  const handleCekSekarangClick = () => {
    const message = generateWhatsAppMessage(false);
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`, "_blank");
  };

  const handleChatAdminForSoldUnit = () => {
    let message = `Halo Kak, saya melihat unit *${product.carName}* di website MukrindoMotor.id sudah terjual.\n\n`;
    message += `Apakah ada unit lain yang serupa atau rekomendasi lainnya yang tersedia?\n\n`;
    message += `Link Produk yang terjual: ${window.location.href}\n\n`;
    message += `Terima kasih.`;
    const encodedMessage = encodeURIComponent(message);
    window.open(
      `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`,
      "_blank"
    );
  };

  const handleNotifyMeClick = () => {
    const notifyFormSection = document.getElementById("notify-me-form-section");
    if (notifyFormSection) {
      notifyFormSection.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  const tenorOptions = [
    { id: "5y", label: "5 Tahun", value: 5 },
    { id: "4y", label: "4 Tahun", value: 4 },
    { id: "3y", label: "3 Tahun", value: 3 },
  ];

  const contentVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 120, damping: 15 },
    },
  };

  return (
    <>
      <motion.div
        variants={variants}
        ref={pricingInfoRef}
        className="p-4 md:p-8 rounded-t-3xl md:rounded-3xl border-t-4 border-t-orange-500 border-b border-gray-300 md:border-none md:shadow-md bg-white"
      >
        <motion.div
          variants={contentVariants}
          className="flex justify-between w-full gap-10 mb-4"
        >
          <h1 className="text-lg font-semibold text-gray-600">
            {product.carName}
          </h1>
          <div
            className="block md:hidden"
            onClick={(e) => {
              e.stopPropagation();
              toggleBookmark(product._id);
            }}
          >
            <Heart
              className={`w-6 h-6 mt-1 ${
                liked ? "text-red-500 fill-red-500" : "text-gray-700 fill-none"
              } ${product.status === "Terjual" ? "hidden" : ""}`}
            />
          </div>
        </motion.div>

        <motion.div
          variants={contentVariants}
          className="flex items-center text-xs md:text-sm text-gray-600 space-x-2 border-b border-gray-300 pb-4"
        >
          <span> {product.travelDistance.toLocaleString("id-ID")} KM</span>
          <span className="text-gray-300">|</span>
          <span>{product.transmission}</span>
          <span className="text-gray-300">|</span>
          <span>{product.plateNumber}</span>{" "}
          <span className="text-gray-300">|</span>
          <div className="flex items-center col-span-2">
            <FaMapMarkerAlt className="mr-1 md:mr-2 w-4 h-4 text-gray-500" />{" "}
            Tangerang Selatan
          </div>
        </motion.div>

        <motion.div variants={contentVariants} className="mt-2">
          <p className="text-xl font-semibold text-orange-600">
            Rp {product.price.toLocaleString("id-ID")}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            *Harga diatas merupakan harga cash.
            {product.status !== "Terjual" &&
              " Untuk perhitungan kredit dapat menghubungi kami melalui estimasi pembiayaan."}
          </p>
        </motion.div>

        {product.status === "Terjual" ? (
          <motion.div variants={contentVariants}>
            <div className="mt-6 mb-2 flex flex-col items-center justify-center text-center p-8 bg-gray-100 rounded-xl">
              <FaShoppingBag className="w-10 h-10 text-gray-500 mb-3" />
              <p className="text-lg font-semibold text-gray-600">
                Unit Telah Terjual
              </p>
              <p className="text-sm text-gray-500 mt-1 md:px-2 text-center">
                Mohon maaf, unit ini sudah tidak tersedia. Anda dapat
                menghubungi admin kami untuk unit serupa atau mengisi form
                beritahu saya untuk informasi lebih lanjut.
              </p>
            </div>
            <div className="mt-6 flex flex-col md:flex-row gap-3 w-full mx-auto">
              <ButtonMagnetic
                type="button"
                onClick={handleChatAdminForSoldUnit}
                className="w-full !py-3.5 !m-0 hover:!shadow-[0_0_20px_rgba(7,94,84,0.4)]"
                icon={
                  <FaWhatsapp className="w-5 h-5 text-green-600 group-hover:text-white" />
                }
                textColor="#16a34a"
                borderColor="#16a34a"
                gradientFrom="#d3f5e8"
                gradientVia="#34c89a"
                gradientTo="#075E54"
              >
                Chat Admin
              </ButtonMagnetic>

              <ButtonAction
                onClick={handleNotifyMeClick}
                type="button"
                className="w-full"
              >
                <AnimatedBell size={20} color="white" className="w-5 h-5" />
                Beritahu Saya
              </ButtonAction>
            </div>
          </motion.div>
        ) : (
          <>
            <motion.div
              variants={contentVariants}
              id="estimasi-pembiayaan-section"
              className="mt-4 p-4 bg-orange-50 rounded-xl"
            >
              <h2 className="text-md text-gray-700 mb-2">
                Estimasi Pembiayaan
              </h2>
              <div className="flex flex-col space-y-0 justify-between text-sm mb-1 p-3 bg-white rounded-lg shadow-sm">
                {tenorOptions.map((option, index) => (
                  <div
                    key={option.id}
                    onClick={() => setSelectedTenor(option.value)}
                    className={`flex items-center justify-between py-3 px-2 rounded-md cursor-pointer transition-colors group
                        ${
                          selectedTenor === option.value
                            ? ""
                            : "hover:bg-gray-50"
                        } 
                        ${
                          index < tenorOptions.length - 1
                            ? "border-b border-gray-200"
                            : ""
                        }`}
                  >
                    <div className="flex items-center">
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mr-3 transition-all
                              ${
                                selectedTenor === option.value
                                  ? "border-orange-500 bg-orange-500"
                                  : "border-gray-300 group-hover:border-gray-400"
                              }`}
                      >
                        {selectedTenor === option.value && (
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        )}
                      </div>
                      <p
                        className={`text-gray-500 ${
                          selectedTenor === option.value
                            ? "font-semibold text-orange-600"
                            : "group-hover:text-gray-800 group-hover:font-medium"
                        }`}
                      >
                        Tenor
                      </p>
                    </div>
                    <p
                      className={`text-gray-500 ${
                        selectedTenor === option.value
                          ? "text-orange-600 font-semibold"
                          : "group-hover:text-gray-800 group-hover:font-medium"
                      }`}
                    >
                      {option.label}
                    </p>
                  </div>
                ))}
              </div>

              <p className="text-xs text-gray-500 mb-4">
                *Hitung estimasi pembiayaan dengan memilih tenor yang anda
                inginkan lalu klik tombol dibawah ini untuk melakukan peritungan
              </p>

              <div className="flex items-center justify-center">
                <ButtonAction onClick={handleEstimasiPembiayaanClick}>
                  <Calculator className="w-5 h-5" />
                  Estimasi Pembiayaan
                </ButtonAction>
              </div>
            </motion.div>

            <motion.div
              variants={contentVariants}
              className="mt-4 flex flex-col lg:flex-row gap-3 w-full"
            >
              <ButtonMagnetic
                onClick={handleTradeInClick}
                icon={<RefreshCw className="w-5 h-5" />}
                className="w-full !py-3 !m-0"
              >
                Tukar Tambah
              </ButtonMagnetic>

              <ButtonAction
                onClick={handleCekSekarangClick}
                className="w-full py-3.5"
              >
                Cek Sekarang
                <AnimatedArrowRight className="w-5 h-5" color="white" />
              </ButtonAction>
            </motion.div>
          </>
        )}
      </motion.div>

      {/* Sticky Bottom Bar for Mobile */}
      <motion.div
        variants={contentVariants}
        className={`
          fixed bottom-0 left-0 right-0 z-30 bg-white shadow-[0_-2px_10px_rgba(0,0,0,0.1)] px-4 py-5 rounded-t-3xl
          flex items-center justify-between md:hidden
          transition-transform duration-300 ease-in-out
          ${showStickyBar ? "translate-y-0" : "translate-y-full"}
        `}
      >
        {product.status === "Terjual" ? (
          <motion.div variants={contentVariants} className="flex gap-3 w-full">
            <ButtonMagnetic
              type="button"
              onClick={handleChatAdminForSoldUnit}
              className="!m-0 w-1/2 !px-4"
              icon={
                <FaWhatsapp className="w-5 h-5 text-green-600 group-hover:text-white" />
              }
              textColor="#16a34a"
              borderColor="#16a34a"
              gradientFrom="#d3f5e8"
              gradientVia="#34c89a"
              gradientTo="#075E54"
            >
              Chat Admin
            </ButtonMagnetic>

            <ButtonAction
              onClick={handleNotifyMeClick}
              type="button"
              className="w-1/2"
            >
              <AnimatedBell size={20} color="white" className="w-5 h-5" />
              Beritahu Saya
            </ButtonAction>
          </motion.div>
        ) : (
          <motion.div
            variants={contentVariants}
            className="flex items-center gap-3 w-full"
          >
            <div className="flex-1">
              <p className="text-md font-semibold text-orange-600 truncate">
                Rp {product.price.toLocaleString("id-ID")}
              </p>
              {selectedTenor && (
                <p className="text-xs text-gray-500">
                  Tenor{" "}
                  {
                    tenorOptions.find((opt) => opt.value === selectedTenor)
                      ?.label
                  }
                </p>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleTradeInClick}
                className="p-3 border border-orange-600 text-orange-600 rounded-full hover:bg-orange-50 transition duration-200"
                aria-label="Tukar Tambah"
              >
                <RefreshCw className="w-4 h-4" />
              </button>

              {selectedTenor ? (
                <ButtonAction
                  onClick={handleEstimasiPembiayaanClick}
                  className="py-3"
                >
                  <Calculator className="w-4 h-4" />
                  Estimasi
                </ButtonAction>
              ) : (
                <ButtonAction onClick={handleCekSekarangClick} className="py-3">
                  Cek Sekarang
                  <AnimatedArrowRight className="w-4 h-4" color="white" />
                </ButtonAction>
              )}
            </div>
          </motion.div>
        )}
      </motion.div>
    </>
  );
};

export default CarPricingInfo;
