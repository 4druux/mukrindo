import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import ShareMobile from "./ShareMobile";
import ShareDekstop from "./ShareDekstop";

// Import Icon
import { Share2 } from "lucide-react";
import { FaWhatsapp, FaFacebook, FaTelegramPlane } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";

const COPY_SUCCESS_DURATION = 2000;

const ShareProduct = ({
  url: propUrl,
  title = "Check this out!",
  isMobile,
  buttonClass,
  iconClass,
}) => {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [currentUrl, setCurrentUrl] = useState("");
  const [copySuccess, setCopySuccess] = useState("");
  const buttonRef = useRef(null);
  const [isClient, setIsClient] = useState(false);
  const popoverCloseTimerRef = useRef(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    const urlToShare = propUrl || window.location.href;
    setCurrentUrl(urlToShare);
  }, [propUrl]);

  const handleShareClick = useCallback(() => {
    setIsPopoverOpen((prevIsOpen) => {
      if (popoverCloseTimerRef.current) {
        clearTimeout(popoverCloseTimerRef.current);
      }
      if (!prevIsOpen) {
        setCopySuccess("");
      }
      return !prevIsOpen;
    });
  }, []);

  const closePopover = useCallback(() => {
    if (popoverCloseTimerRef.current) {
      clearTimeout(popoverCloseTimerRef.current);
    }
    setIsPopoverOpen(false);
  }, []);

  const handleCopyUrl = useCallback(async () => {
    if (!currentUrl) return;

    if (popoverCloseTimerRef.current) {
      clearTimeout(popoverCloseTimerRef.current);
    }

    try {
      await navigator.clipboard.writeText(currentUrl);
      setCopySuccess("Disalin");

      const resetCopySuccessTimer = setTimeout(() => {
        setCopySuccess("");
      }, COPY_SUCCESS_DURATION);

      popoverCloseTimerRef.current = setTimeout(() => {
        if (isPopoverOpen) {
          closePopover();
        }
      }, COPY_SUCCESS_DURATION);

      return () => {
        clearTimeout(resetCopySuccessTimer);
        if (popoverCloseTimerRef.current) {
          clearTimeout(popoverCloseTimerRef.current);
        }
      };
    } catch (err) {
      console.error("Failed to copy URL: ", err);
      setCopySuccess("Gagal");
      const timer = setTimeout(() => setCopySuccess(""), COPY_SUCCESS_DURATION);
      return () => clearTimeout(timer);
    }
  }, [currentUrl, closePopover, isPopoverOpen]);

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
      <div ref={buttonRef} className="relative group">
        <button
          onClick={handleShareClick}
          className={buttonClass}
          aria-haspopup="dialog"
          aria-expanded={isPopoverOpen}
          aria-controls={
            isMobile ? "share-popover-mobile" : "share-popover-desktop"
          }
        >
          <Share2 className={iconClass} />
        </button>
        <span
          className={`absolute left-1/2 -translate-x-1/2 top-full mt-2
            whitespace-nowrap rounded-lg bg-black/50 px-2 py-1 text-xs text-white
            opacity-0 group-hover:opacity-100 transition-opacity duration-300
            invisible group-hover:visible
            pointer-events-none z-20
            ${isPopoverOpen ? "hidden" : "block"}`}
          role="tooltip"
        >
          Bagikan
        </span>
      </div>

      {isClient &&
        (isMobile ? (
          createPortal(
            <ShareMobile
              isOpen={isPopoverOpen}
              onClose={closePopover}
              url={currentUrl}
              title={title}
              shareOptions={shareOptions}
              onCopy={handleCopyUrl}
              copySuccess={copySuccess}
            />,
            document.body
          )
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
        ))}
    </div>
  );
};

export default ShareProduct;
