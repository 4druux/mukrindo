// components/product-user/beli-mobil/ShareProduct.jsx
import  { useState, useEffect, useRef } from "react";
import ShareMobile from "./ShareMobile";
import ShareDekstop from "./ShareDekstop";

// Import Icon
import { Share2 } from "lucide-react";
import { FaWhatsapp, FaFacebook, FaTelegramPlane } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";

const ShareProduct = ({
  url: propUrl,
  title = "Check this out!",
  isMobile,
}) => {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [currentUrl, setCurrentUrl] = useState("");
  const [copySuccess, setCopySuccess] = useState("");
  const buttonRef = useRef(null);

  useEffect(() => {
    const urlToShare = propUrl || window.location.href;
    setCurrentUrl(urlToShare);
  }, [propUrl]);

  const handleShareClick = () => {
    setIsPopoverOpen((prevIsOpen) => {
      if (!prevIsOpen) {
        setCopySuccess("");
      }
      return !prevIsOpen;
    });
  };

  const closePopover = () => {
    setIsPopoverOpen(false);
  };

  const handleCopyUrl = async () => {
    if (!currentUrl) return;
    try {
      await navigator.clipboard.writeText(currentUrl);
      setCopySuccess("Disalin");
      setTimeout(() => setCopySuccess(""), 2000);
    } catch (err) {
      console.error("Failed to copy URL: ", err);
      setCopySuccess("Gagal");
      setTimeout(() => setCopySuccess(""), 2000);
    }
  };

  const encodedUrl = encodeURIComponent(currentUrl);
  const encodedTitle = encodeURIComponent(title);

  const shareOptions = [
    {
      name: "Facebook",
      icon: FaFacebook,
      handler: () =>
        window.open(
          `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
          "_blank",
          "noopener,noreferrer"
        ),
      color: "text-blue-600",
    },
    {
      name: "X",
      icon: FaXTwitter,
      handler: () =>
        window.open(
          `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
          "_blank",
          "noopener,noreferrer"
        ),
      color: "text-gray-800",
    },
    {
      name: "Whatsapp",
      icon: FaWhatsapp,
      handler: () =>
        window.open(
          `https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedUrl}`,
          "_blank",
          "noopener,noreferrer"
        ),
      color: "text-green-500",
    },
    {
      name: "Telegram",
      icon: FaTelegramPlane,
      handler: () =>
        window.open(
          `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`,
          "_blank",
          "noopener,noreferrer"
        ),
      color: "text-sky-500",
    },
  ];

  return (
    <div className="relative">
      {/* --- Tombol Share Utama --- */}
      <div ref={buttonRef} className="relative group">
        <button
          onClick={handleShareClick}
          className={`p-2 rounded-full shadow transition cursor-pointer ${
            isPopoverOpen ? "bg-white" : "bg-white/80 hover:bg-white"
          }`}
          aria-haspopup="dialog"
          aria-expanded={isPopoverOpen}
          aria-controls={
            isMobile ? "share-popover-mobile" : "share-popover-desktop"
          }
        >
          <Share2 className="w-4 h-4 lg:w-5 lg:h-5 text-gray-700" />
        </button>
        <span
          className={`absolute left-1/2 -translate-x-1/2 top-full mt-2
           whitespace-nowrap rounded-lg bg-black/70 px-2 py-1 text-xs text-white
           opacity-0 group-hover:opacity-100 transition-opacity duration-300
           invisible group-hover:visible
           pointer-events-none z-20
          ${isPopoverOpen ? "hidden" : "block"}`}
          role="tooltip"
        >
          Bagikan
        </span>
      </div>

      {/* --- Render Popover Sesuai Kondisi --- */}
      {isMobile ? (
        <ShareMobile
          isOpen={isPopoverOpen}
          onClose={closePopover}
          url={currentUrl}
          title={title}
          shareOptions={shareOptions}
          onCopy={handleCopyUrl}
          copySuccess={copySuccess}
        />
      ) : (
        <ShareDekstop
          isOpen={isPopoverOpen}
          onClose={closePopover}
          url={currentUrl}
          title={title}
          shareOptions={shareOptions}
          onCopy={handleCopyUrl}
          copySuccess={copySuccess}
          buttonRef={buttonRef}
        />
      )}
    </div>
  );
};

export default ShareProduct;
