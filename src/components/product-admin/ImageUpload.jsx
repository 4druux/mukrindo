//components/common/ImageUpload.jsx
"use client";
import { useEffect, useState } from "react";
import ModalCropImage from "../common/ModalCropImage";

// Import Swiper
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";

// Import Icon
import { Trash2, UploadCloud, Plus, Pencil } from "lucide-react";

export default function ImageUpload({ mediaFiles, setMediaFiles }) {
  const [internalMediaFiles, setInternalMediaFiles] = useState(
    mediaFiles || []
  );
  const [previewURLs, setPreviewURLs] = useState([]);
  const [croppingIndex, setCroppingIndex] = useState(null);
  const [cropSource, setCropSource] = useState(null);
  const [activeOverlayIndex, setActiveOverlayIndex] = useState(null);

  useEffect(() => {
    const urls = [];
    internalMediaFiles.forEach((fileObj) => {
      if (fileObj.cropped) {
        urls.push(URL.createObjectURL(fileObj.cropped));
      } else {
        urls.push(null);
      }
    });
    setPreviewURLs(urls);
    return () => urls.forEach((url) => URL.revokeObjectURL(url));
  }, [internalMediaFiles]);

  useEffect(() => {
    setMediaFiles(internalMediaFiles);
  }, [internalMediaFiles, setMediaFiles]);

  const handleAddImage = () => {
    if (internalMediaFiles.length < 10) {
      setInternalMediaFiles([
        ...internalMediaFiles,
        { original: null, cropped: null },
      ]);
    }
  };

  const handleRemoveImage = (index) => {
    const updatedFiles = [...internalMediaFiles];
    updatedFiles.splice(index, 1);
    setInternalMediaFiles(updatedFiles);
  };

  const handleImageChange = (index, event) => {
    const file = event.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      alert("Only image files are allowed.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const updatedFiles = [...internalMediaFiles];
      if (file.type === "image/gif") {
        updatedFiles[index] = { original: file, cropped: file };
        setInternalMediaFiles(updatedFiles);
      } else {
        updatedFiles[index] = { original: file, cropped: null };
        setInternalMediaFiles(updatedFiles);
        setCropSource(reader.result);
        setCroppingIndex(index);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleCropComplete = (croppedFile) => {
    const updatedFiles = [...internalMediaFiles];
    updatedFiles[croppingIndex] = {
      ...updatedFiles[croppingIndex],
      cropped: croppedFile,
    };
    setInternalMediaFiles(updatedFiles);
    setCroppingIndex(null);
    setCropSource(null);
  };

  const handleEditImage = (index) => {
    const fileObj = internalMediaFiles[index];
    if (!fileObj?.original) return;
    if (fileObj.original.type === "image/gif") {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "image/*";
      input.onchange = (e) => handleImageChange(index, e);
      input.click();
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setCropSource(reader.result);
      setCroppingIndex(index);
    };
    reader.readAsDataURL(fileObj.original);
  };

  const handleClick = (index) => {
    if (activeOverlayIndex === index) {
      setActiveOverlayIndex(null);
    } else {
      setActiveOverlayIndex(index);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (activeOverlayIndex !== null) {
        const imageContainer = document.querySelector(
          `.swiper-slide:nth-child(${activeOverlayIndex + 1}) .relative`
        );

        if (imageContainer && !imageContainer.contains(event.target)) {
          setActiveOverlayIndex(null);
        }
      }
    };

    if (activeOverlayIndex !== null) {
      document.addEventListener("click", handleClickOutside);
    }

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [activeOverlayIndex]);

  return (
    <div className="flex flex-wrap gap-4">
      {/* Mobile Slider */}
      <div className="sm:hidden w-full">
        <Swiper
          slidesPerView={1}
          spaceBetween={10}
          pagination={{ clickable: true }}
          modules={[Pagination]}
          className="w-full"
        >
          {internalMediaFiles.map((fileObj, index) => (
            <SwiperSlide key={index}>
              <div
                onClick={() => handleClick(index)}
                className={`relative h-[200px] rounded-lg bg-gray-100 flex justify-center items-center ${
                  fileObj.cropped
                    ? "border-0"
                    : "border-2 border-dashed border-gray-400 hover:border-gray-800"
                }`}
              >
                {fileObj.cropped ? (
                  <>
                    <img
                      src={previewURLs[index]}
                      className="w-full h-full object-cover rounded-lg"
                      alt={`Uploaded image ${index}`}
                    />
                    <div
                      className={`absolute inset-0 flex justify-center gap-4 items-center rounded-lg bg-black/40 ${
                        activeOverlayIndex === index
                          ? "opacity-100"
                          : "opacity-0"
                      }`}
                    >
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveImage(index);
                        }}
                        className="p-2 rounded-full bg-orange-200 border border-orange-300"
                      >
                        <Trash2 className="w-5 h-5 text-orange-500" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditImage(index);
                        }}
                        className="p-2 rounded-full bg-orange-200 border border-orange-300"
                      >
                        <Pencil className="w-5 h-5 text-orange-500" />
                      </button>
                    </div>
                  </>
                ) : (
                  <label className="cursor-pointer flex flex-col justify-center items-center gap-2">
                    <UploadCloud className="w-10 h-10 text-gray-400" />
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleImageChange(index, e)}
                    />
                    <span className="text-xs text-gray-400">Upload</span>
                  </label>
                )}
              </div>
            </SwiperSlide>
          ))}
          {internalMediaFiles.length < 10 && (
            <SwiperSlide>
              <div className="w-auto h-[200px] rounded-lg border-2 border-dashed border-gray-400 flex justify-center items-center">
                <button type="button" onClick={handleAddImage}>
                  <Plus className="w-10 h-10 text-gray-400  cursor-pointer" />
                </button>
              </div>
            </SwiperSlide>
          )}
        </Swiper>
      </div>

      {/* Desktop Grid */}
      <div className="hidden sm:flex flex-wrap gap-4">
        {internalMediaFiles.map((fileObj, index) => (
          <div
            key={index}
            className={`relative w-[200px] h-[120px] bg-gray-100 rounded-lg flex justify-center items-center group ${
              fileObj.cropped
                ? "border-0"
                : "border-2 border-dashed border-gray-400 hover:border-gray-800"
            }`}
          >
            {fileObj.cropped ? (
              <>
                <img
                  src={previewURLs[index]}
                  className="w-full h-full object-cover rounded-lg"
                  alt={`Uploaded image ${index}`}
                />
                <div className="absolute inset-0 flex justify-center items-center rounded-lg bg-black/40 opacity-0 group-hover:opacity-100">
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(index)}
                  >
                    <Trash2 className="w-12 h-12 text-white hover:text-orange-600 p-3 rounded-full hover:bg-orange-100 cursor-pointer" />
                  </button>
                  <button type="button" onClick={() => handleEditImage(index)}>
                    <Pencil className="w-12 h-12 text-white hover:text-orange-600 p-3 rounded-full hover:bg-orange-100 cursor-pointer" />
                  </button>
                </div>
              </>
            ) : (
              <label className="cursor-pointer flex flex-col justify-center items-center gap-2">
                <UploadCloud className="w-6 h-6 text-gray-400 group-hover:text-gray-700" />
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleImageChange(index, e)}
                />
                <span className="text-xs text-gray-400 group-hover:text-gray-700">
                  Upload
                </span>
              </label>
            )}
          </div>
        ))}
        {internalMediaFiles.length < 10 && (
          <div className="w-[200px] h-[120px] rounded-lg border-2 border-dashed border-gray-400 hover:border-gray-700  flex justify-center items-center group">
            <button type="button" onClick={handleAddImage}>
              <Plus className="w-6 h-6 text-gray-400 group-hover:text-gray-700 cursor-pointer" />
            </button>
          </div>
        )}
      </div>
      {cropSource && (
        <ModalCropImage
          mediaSrc={cropSource}
          onCropComplete={handleCropComplete}
          onClose={() => {
            setCroppingIndex(null);
            setCropSource(null);
          }}
        />
      )}
    </div>
  );
}
