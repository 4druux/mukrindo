//components/common/ModalCropImage.jsx
import { getCroppedImg } from "@/utils/cropImage";
import { XIcon } from "lucide-react";
import React, { useEffect, useState } from "react";
import Cropper from "react-easy-crop";

export default function ModalCropImage({ mediaSrc, onCropComplete, onClose }) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const handleCropComplete = (_, areaPixels) => {
    setCroppedAreaPixels(areaPixels);
  };

  const handleSave = async () => {
    // --- IMPORTANT: Only Handle Images ---
    const croppedImage = await getCroppedImg(mediaSrc, croppedAreaPixels);
    onCropComplete(croppedImage);
  };

  useEffect(() => {
    const scrollY = window.scrollY;
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = "100%";
    return () => {
      const scrollY = parseInt(document.body.style.top || "0", 10) * -1;
      document.body.style.position = "";
      document.body.style.top = "";
      window.scrollTo(0, scrollY);
    };
  }, []);

  return (
    <div
      className="fixed inset-0 bg-black/20 flex justify-center items-center z-9999"
      onClick={onClose}
    >
      <div
        className="bg-gray-100 w-full max-w-lg rounded-xl overflow-hidden shadow-xl"
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
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm border border-gray-500 text-gray-600 hover:text-orange-600 hover:bg-orange-100 
            hover:border-orange-600 rounded-full cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-6 py-2 text-sm bg-orange-500  text-white hover:bg-orange-600 rounded-full cursor-pointer"
          >
            Crop
          </button>
        </div>
      </div>
    </div>
  );
}
