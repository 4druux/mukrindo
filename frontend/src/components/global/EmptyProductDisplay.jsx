// components/global/EmptyProductDisplay.jsx
import Link from "next/link";
import { FaBoxOpen } from "react-icons/fa";
import Image from "next/image";
import { FaWhatsapp } from "react-icons/fa6";
import AnimatedBell from "@/components/animate-icon/AnimatedBell";
import CarProductCard from "./CarProductCard";
import ButtonAction from "../common/ButtonAction";
import ButtonMagnetic from "../common/ButtonMagnetic";

const EmptyProductDisplay = ({
  emptyMessage,
  suggestedQuery,
  searchQuery,
  filterBrand,
  filterModel,
  suggestionLinkHref,
  onSuggestionClick,
  showFilterRecommendations,
  filterRecommendations,
  onProductClick,
  isAdminRoute = false,
}) => {
  const handleChatAdminUnitNotAvailable = () => {
    let message;
    let searchedItem = "";

    if (filterBrand || filterModel) {
      searchedItem = [filterBrand, filterModel].filter(Boolean).join(" ");
    } else if (searchQuery) {
      searchedItem = searchQuery;
    }

    if (searchedItem) {
      message =
        `Halo Kak, saya mencari mobil "${searchedItem}" di website MukrindoMotor.id tapi unitnya tidak tersedia.\n\n` +
        `Apakah ada rekomendasi unit lain yang serupa?\n\n` +
        `Terima kasih.`;
    } else {
      message =
        `Halo Kak, saya tidak menemukan mobil yang saya cari di website MukrindoMotor.id.\n\n` +
        `Bisa bantu saya dengan rekomendasi unit lain?\n\n` +
        `Terima kasih.`;
    }

    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/6282123736730?text=${encodedMessage}`, "_blank");
  };

  const handleNotifyMeClick = () => {
    const notifyFormSection = document.getElementById("notify-me-form-section");
    if (notifyFormSection) {
      notifyFormSection.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className={isAdminRoute ? "" : "px-3 md:px-0"}>
        <div
          className={`flex justify-center items-center ${
            isAdminRoute ? " h-[50vh]" : "bg-white rounded-2xl p-6 shadow-md"
          }`}
        >
          <div
            className={`flex items-center ${
              isAdminRoute
                ? "gap-4"
                : "md:gap-4 flex-col md:flex-row-reverse md:justify-evenly w-full"
            }`}
          >
            <div className={isAdminRoute ? "block" : "hidden"}>
              <FaBoxOpen className="w-24 h-24 md:w-36 md:h-36 text-gray-500" />
            </div>

            <div className={isAdminRoute ? "hidden" : "block"}>
              <Image
                src="/images/Badge/customer.png"
                alt="Ilustrasi Kontak - Beritahu Saya"
                width={200}
                height={100}
                className="rounded-lg object-cover max-w-[200px] lg:max-w-full"
                priority
              />
            </div>

            <div className="flex flex-col text-gray-600">
              <p className="text-2xl font-semibold">Oops!</p>
              <p className="text-sm font-medium">{emptyMessage}</p>
              <p
                className={`text-sm mt-2 text-gray-500 ${
                  isAdminRoute ? "hidden" : "block"
                }`}
              >
                Anda dapat menghubungi admin kami untuk unit serupa atau mengisi
                form beritahu saya untuk informasi lebih lanjut.
              </p>

              <div className={isAdminRoute ? "block" : "hidden"}>
                {suggestedQuery && searchQuery && suggestionLinkHref && (
                  <p className="mt-2 text-sm">
                    Mungkin maksud Anda:{" "}
                    <Link
                      href={suggestionLinkHref}
                      className="text-orange-500 hover:underline"
                      onClick={onSuggestionClick}
                    >
                      {suggestedQuery}
                    </Link>
                    ?
                  </p>
                )}
              </div>

              <div
                className={
                  isAdminRoute
                    ? "hidden"
                    : "flex flex-col md:flex-row gap-2 mt-4"
                }
              >
                <ButtonMagnetic
                  type="button"
                  onClick={handleChatAdminUnitNotAvailable}
                  className="!m-0 !py-1.5 !px-6 text-green-600 group-hover:text-white"
                  icon={<FaWhatsapp className="w-5 h-5" />}
                  textColor="#16a34a"
                  borderColor="#16a34a"
                  gradientFrom="#d3f5e8"
                  gradientVia="#34c89a"
                  gradientTo="#075E54"
                >
                  Chat Admin
                </ButtonMagnetic>

                <ButtonAction onClick={handleNotifyMeClick} type="button">
                  <AnimatedBell size={20} color="white" className="w-5 h-5" />
                  Beritahu Saya
                </ButtonAction>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showFilterRecommendations &&
        filterRecommendations &&
        filterRecommendations.length > 0 && (
          <div>
            <h1 className="text-md lg:text-lg font-medium text-gray-700 px-3 md:px-0">
              Rekomendasi serupa
            </h1>
            <div className="">
              <CarProductCard
                products={filterRecommendations}
                loading={false}
                error={null}
                onProductClick={onProductClick}
                emptyMessage={null}
                isBuyCarRoute={true}
                skeletonCount={filterRecommendations.length}
              />
            </div>
          </div>
        )}
    </div>
  );
};

export default EmptyProductDisplay;
