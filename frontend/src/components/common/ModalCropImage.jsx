// frontend/src/components/common/ModalCropImage.jsx
import { getCroppedImg } from "@/utils/cropImage";
import { XIcon } from "lucide-react";
import { useEffect, useState } from "react";
import Cropper from "react-easy-crop";
import toast from "react-hot-toast";
import ButtonMagnetic from "./ButtonMagnetic";
import ButtonAction from "./ButtonAction";

export default function ModalCropImage({ mediaSrc, onCropComplete, onClose }) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const handleCropComplete = (_, areaPixels) => {
    setCroppedAreaPixels(areaPixels);
  };

  const handleSave = async () => {
    if (!mediaSrc || !croppedAreaPixels) {
      toast.error("Tidak dapat memotong gambar, data tidak lengkap.");
      return;
    }
    try {
      let fileType = "image/jpeg";
      let quality = 0.75;

      if (mediaSrc.startsWith("data:image/")) {
        const match = mediaSrc.match(/^data:(image\/(.+));base64,/);
        if (match && match[1]) {
          const detectedType = match[1].toLowerCase();
          if (detectedType === "image/png") {
            fileType = "image/png";
            quality = 1;
          } else if (detectedType === "image/webp") {
            fileType = "image/webp";
          }
        }
      }

      const croppedImageFile = await getCroppedImg(
        mediaSrc,
        croppedAreaPixels,
        fileType,
        quality
      );
      onCropComplete(croppedImageFile);
    } catch (error) {
      console.error("Error cropping image:", error);
      toast.error("Gagal memotong gambar.");
    }
  };

  useEffect(() => {
    const scrollY = window.scrollY;
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = "100%";
    return () => {
      const scrollYValue = parseInt(document.body.style.top || "0", 10) * -1;
      document.body.style.position = "";
      document.body.style.top = "";
      window.scrollTo(0, scrollYValue);
    };
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-gray-100 w-full max-w-lg md:max-w-2xl rounded-xl overflow-hidden shadow-xl mx-2"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b border-gray-700 flex justify-between">
          <span className="font-medium text-gray-800">Crop Image (16:9)</span>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full hover:bg-orange-100 border border-gray-100 hover:border-orange-500 cursor-pointer transition-colors group"
          >
            <XIcon className="w-5 h-5 text-gray-600 group-hover:text-orange-500" />
          </button>
        </div>
        <div className="relative w-full h-[300px] bg-black/50">
          <Cropper
            image={mediaSrc}
            crop={crop}
            zoom={zoom}
            aspect={16 / 9}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={handleCropComplete}
          />
        </div>
        <div className="p-4 border-t border-gray-700 flex justify-end gap-2">
          <ButtonMagnetic
            type="button"
            onClick={onClose}
            className="!py-2 !px-5 !m-0"
          >
            Batal
          </ButtonMagnetic>

          <ButtonAction type="button" onClick={handleSave}>
            Crop
          </ButtonAction>
        </div>
      </div>
    </div>
  );
}
