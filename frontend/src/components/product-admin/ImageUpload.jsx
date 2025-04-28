//components/product-admin/ImageUpload.jsx
"use client";
import { useEffect, useState } from "react";
import ModalCropImage from "../common/ModalCropImage";
import toast from "react-hot-toast";

// Import Swiper
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";

// Import Icon
import { Trash2, UploadCloud, Plus, Pencil } from "lucide-react";

export default function ImageUpload({ mediaFiles, setMediaFiles, error }) {
  const [internalMediaFiles, setInternalMediaFiles] = useState(
    mediaFiles || []
  );
  const [previewURLs, setPreviewURLs] = useState([]);
  const [croppingIndex, setCroppingIndex] = useState(null);
  const [cropSource, setCropSource] = useState(null);
  const [activeOverlayIndex, setActiveOverlayIndex] = useState(null);

  useEffect(() => {
    if (mediaFiles !== internalMediaFiles) {
      setInternalMediaFiles(mediaFiles || []);
    }
  }, [mediaFiles]);

  useEffect(() => {
    const urls = [];
    internalMediaFiles.forEach((fileObj) => {
      if (
        fileObj.cropped &&
        (fileObj.cropped instanceof Blob || fileObj.cropped instanceof File)
      ) {
        try {
          urls.push(URL.createObjectURL(fileObj.cropped));
        } catch (e) {
          console.error("Error creating object URL:", e);
          urls.push(null);
        }
      } else {
        urls.push(null);
      }
    });
    setPreviewURLs(urls);

    return () => {
      urls.forEach((url) => {
        if (url) {
          try {
            URL.revokeObjectURL(url);
          } catch (e) {
            console.error("Error revoking object URL:", e);
          }
        }
      });
    };
  }, [internalMediaFiles]);

  const handleAddImage = () => {
    if (internalMediaFiles.length < 10) {
      setInternalMediaFiles([
        ...internalMediaFiles,
        { original: null, cropped: null },
      ]);
    }
  };

  const handleRemoveImage = (index) => {
    const updatedFiles = internalMediaFiles.filter((_, i) => i !== index);
    setInternalMediaFiles(updatedFiles);
    setMediaFiles(updatedFiles); // <-- TAMBAHKAN BARIS INI

    if (activeOverlayIndex === index) {
      setActiveOverlayIndex(null);
    } else if (activeOverlayIndex > index) {
      setActiveOverlayIndex(activeOverlayIndex - 1);
    }
  };

  const handleImageChange = (index, event) => {
    const file = event.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      alert("Only image files are allowed.");
      event.target.value = null;
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const updatedFiles = [...internalMediaFiles];
      if (file.type === "image/gif") {
        // Langsung update karena GIF tidak di-crop
        updatedFiles[index] = { original: file, cropped: file };
        setInternalMediaFiles(updatedFiles);
        setMediaFiles(updatedFiles); // <-- TAMBAHKAN BARIS INI (untuk GIF)
      } else {
        // Untuk non-GIF, update internal dulu, lalu trigger crop
        updatedFiles[index] = { original: file, cropped: null };
        setInternalMediaFiles(updatedFiles);
        setCropSource(reader.result);
        setCroppingIndex(index);
        // Jangan panggil setMediaFiles di sini, tunggu handleCropComplete
      }
    };
    reader.onerror = (error) => {
      console.error("File reading error:", error);
      toast.error("Gagal membaca file.", {
        className: "custom-toast",
      });
    };
    reader.readAsDataURL(file);
    event.target.value = null;
  };

  const handleCropComplete = (croppedFile) => {
    if (croppingIndex !== null) {
      const updatedFiles = [...internalMediaFiles];
      if (updatedFiles[croppingIndex]) {
        updatedFiles[croppingIndex] = {
          ...updatedFiles[croppingIndex],
          cropped: croppedFile, // croppedFile should be a Blob
        };
        setInternalMediaFiles(updatedFiles);
        setMediaFiles(updatedFiles); // <-- TAMBAHKAN BARIS INI
      }
    }
    setCroppingIndex(null);
    setCropSource(null);
  };

  const handleEditImage = (index) => {
    const fileObj = internalMediaFiles[index];
    if (!fileObj?.original) return;
    if (fileObj.original.type === "image/gif") {
      const inputId = `file-input-desktop-${index}`;
      const fileInput = document.getElementById(inputId);
      if (fileInput) {
        fileInput.click();
      } else {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = "image/*";
        input.onchange = (e) => handleImageChange(index, e);
        input.click();
      }
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setCropSource(reader.result);
      setCroppingIndex(index);
    };
    reader.onerror = (error) => {
      console.error("File reading error for edit:", error);
      alert("Gagal membaca file untuk diedit.");
    };
    reader.readAsDataURL(fileObj.original);
  };

  const handleClick = (index) => {
    setActiveOverlayIndex(activeOverlayIndex === index ? null : index);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (activeOverlayIndex !== null) {
        const imageContainer = document.querySelector(
          `.swiper-slide-active .mobile-image-container`
        );
        if (imageContainer && !imageContainer.contains(event.target)) {
          setActiveOverlayIndex(null);
        }
      }
    };
    if (activeOverlayIndex !== null) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
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
        {error && internalMediaFiles.length === 0 && (
          <p className="text-sm text-red-500 mt-1 sm:hidden">{error}</p>
        )}
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
          <div
            className={`w-[200px] h-[120px] rounded-lg flex justify-center items-center group ${
              error && internalMediaFiles.length === 0
                ? "border border-red-500"
                : "border-2 border-dashed border-gray-400 hover:border-gray-700"
            }`}
          >
            <button
              type="button"
              onClick={handleAddImage}
              className="flex flex-col items-center gap-1"
            >
              <Plus
                className={`w-6 h-6 cursor-pointer ${
                  error && internalMediaFiles.length === 0
                    ? "text-red-500"
                    : "text-gray-400 group-hover:text-gray-700"
                }`}
              />
              <span
                className={`text-xs ${
                  error && internalMediaFiles.length === 0
                    ? "text-red-500"
                    : "text-gray-400 group-hover:text-gray-700"
                }`}
              >
                Tambah
              </span>
            </button>
          </div>
        )}

        {error && internalMediaFiles.length === 0 && (
          <p className="text-sm text-red-500 mt-1 hidden sm:block w-full">
            {error}
          </p>
        )}
      </div>
      {cropSource && croppingIndex !== null && (
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
