//components/product-admin/ImageUpload.jsx
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

// 1. Terima prop 'error' dari parent (AddProduct)
export default function ImageUpload({ mediaFiles, setMediaFiles, error }) {
  const [internalMediaFiles, setInternalMediaFiles] = useState(
    mediaFiles || []
  );
  const [previewURLs, setPreviewURLs] = useState([]);
  const [croppingIndex, setCroppingIndex] = useState(null);
  const [cropSource, setCropSource] = useState(null);
  const [activeOverlayIndex, setActiveOverlayIndex] = useState(null);

  // Sinkronisasi state internal dari prop (jika prop berubah)
  useEffect(() => {
     if (mediaFiles !== internalMediaFiles) {
       setInternalMediaFiles(mediaFiles || []);
     }
  }, [mediaFiles]); // Hanya bergantung pada mediaFiles

  // Generate Preview URLs
  useEffect(() => {
    const urls = [];
    internalMediaFiles.forEach((fileObj) => {
      if (fileObj.cropped && (fileObj.cropped instanceof Blob || fileObj.cropped instanceof File)) {
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
    // Cleanup
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

  // Update parent state
  useEffect(() => {
    // Hanya panggil jika state internal berbeda dari prop untuk mencegah loop
    if (internalMediaFiles !== mediaFiles) {
        setMediaFiles(internalMediaFiles);
    }
  }, [internalMediaFiles, setMediaFiles, mediaFiles]); // Tambahkan mediaFiles untuk perbandingan

  const handleAddImage = () => {
    if (internalMediaFiles.length < 10) {
      setInternalMediaFiles([
        ...internalMediaFiles,
        { original: null, cropped: null },
      ]);
    }
  };

  const handleRemoveImage = (index) => {
    // Gunakan filter untuk membuat array baru tanpa elemen pada index yang dihapus
    const updatedFiles = internalMediaFiles.filter((_, i) => i !== index);
    setInternalMediaFiles(updatedFiles);
     // Reset overlay jika gambar yang aktif dihapus
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
      event.target.value = null; // Reset input
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
     reader.onerror = (error) => {
        console.error("File reading error:", error);
        alert("Gagal membaca file.");
    };
    reader.readAsDataURL(file);
    event.target.value = null; // Reset input setelah file dibaca
  };

  const handleCropComplete = (croppedFile) => {
     if (croppingIndex !== null) {
        const updatedFiles = [...internalMediaFiles];
        if(updatedFiles[croppingIndex]) {
            updatedFiles[croppingIndex] = {
                ...updatedFiles[croppingIndex],
                cropped: croppedFile, // croppedFile should be a Blob
            };
            setInternalMediaFiles(updatedFiles);
        }
     }
    setCroppingIndex(null);
    setCropSource(null);
  };

  const handleEditImage = (index) => {
    const fileObj = internalMediaFiles[index];
    if (!fileObj?.original) return;
    if (fileObj.original.type === "image/gif") {
      // Trigger file input click (assuming an ID exists or create dynamically)
      const inputId = `file-input-desktop-${index}`; // Assuming desktop view ID
      const fileInput = document.getElementById(inputId);
      if (fileInput) {
          fileInput.click();
      } else {
          // Fallback: create temporary input
          const input = document.createElement("input");
          input.type = "file";
          input.accept = "image/*";
          input.onchange = (e) => handleImageChange(index, e);
          input.click();
      }
      return;
    }
    // For non-GIF, open cropper
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

  // Mobile overlay logic
  const handleClick = (index) => {
    setActiveOverlayIndex(activeOverlayIndex === index ? null : index);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (activeOverlayIndex !== null) {
        // More specific selector for the mobile image container
        const imageContainer = document.querySelector(
          `.swiper-slide-active .mobile-image-container` // Add a class like 'mobile-image-container'
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
    // Wrap in a div to allow placing the error message below the grid/swiper
    <div className="flex flex-col gap-4">
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
              {/* Add a specific class for mobile container */}
              <div
                onClick={() => handleClick(index)}
                className={`mobile-image-container relative h-[200px] rounded-lg bg-gray-100 flex justify-center items-center ${
                  fileObj.cropped
                    ? "border-0"
                    : "border-2 border-dashed border-gray-400 hover:border-gray-800"
                }`}
              >
                {fileObj.cropped ? (
                  <>
                    <img
                      src={previewURLs[index] || '/placeholder.png'} // Fallback
                      className="w-full h-full object-cover rounded-lg"
                      alt={`Uploaded ${index + 1}`}
                      onError={(e) => e.target.src='/placeholder.png'}
                    />
                    <div
                      className={`absolute inset-0 flex justify-center gap-4 items-center rounded-lg bg-black/40 transition-opacity ${ // Added transition
                        activeOverlayIndex === index
                          ? "opacity-100"
                          : "opacity-0"
                      }`}
                      onClick={(e) => e.stopPropagation()} // Prevent closing overlay when clicking buttons
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
                  <label className="cursor-pointer flex flex-col justify-center items-center gap-2 w-full h-full">
                    <UploadCloud className="w-10 h-10 text-gray-400" />
                    <input
                      id={`file-input-mobile-${index}`} // Unique ID
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
          {/* Mobile Add Button */}
          {internalMediaFiles.length < 10 && (
            <SwiperSlide>
              <div className="w-full h-[200px] rounded-lg border-2 border-dashed border-gray-400 flex justify-center items-center hover:border-gray-700 group">
                <button type="button" onClick={handleAddImage} className="flex flex-col items-center gap-2">
                  <Plus className="w-10 h-10 text-gray-400 group-hover:text-gray-700 cursor-pointer" />
                   <span className="text-xs text-gray-400 group-hover:text-gray-700">Tambah</span>
                </button>
              </div>
            </SwiperSlide>
          )}
        </Swiper>
         {/* Mobile Error Message */}
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
                  src={previewURLs[index] || '/placeholder.png'} // Fallback
                  className="w-full h-full object-cover rounded-lg"
                  alt={`Uploaded ${index + 1}`}
                   onError={(e) => e.target.src='/placeholder.png'}
                />
                <div className="absolute inset-0 flex justify-center items-center rounded-lg bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(index)}
                    className="p-1" // Add padding for easier click
                  >
                    <Trash2 className="w-10 h-10 text-white hover:text-orange-500 p-2 rounded-full hover:bg-orange-100 cursor-pointer" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleEditImage(index)}
                    className="p-1" // Add padding for easier click
                  >
                    <Pencil className="w-10 h-10 text-white hover:text-orange-500 p-2 rounded-full hover:bg-orange-100 cursor-pointer" />
                  </button>
                </div>
              </>
            ) : (
              <label className="cursor-pointer flex flex-col justify-center items-center gap-2 w-full h-full">
                <UploadCloud className="w-6 h-6 text-gray-400 group-hover:text-gray-700" />
                <input
                  id={`file-input-desktop-${index}`} // Unique ID
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

        {/* Desktop Add Button */}
        {internalMediaFiles.length < 10 && (
          // 2. Apply conditional styling to the container div
          <div className={`w-[200px] h-[120px] rounded-lg flex justify-center items-center group ${
              error && internalMediaFiles.length === 0
                ? 'border border-red-500' // Error state: Red solid border
                : 'border-2 border-dashed border-gray-400 hover:border-gray-700' // Normal state
          }`}>
            <button type="button" onClick={handleAddImage} className="flex flex-col items-center gap-1"> {/* Added flex structure to button */}
              {/* 3. Apply conditional styling to the Plus icon */}
              <Plus className={`w-6 h-6 cursor-pointer ${
                  error && internalMediaFiles.length === 0
                    ? 'text-red-500' // Error state: Red icon
                    : 'text-gray-400 group-hover:text-gray-700' // Normal state
              }`} />
               {/* Optional: Add text below icon, also conditional */}
               <span className={`text-xs ${
                   error && internalMediaFiles.length === 0
                    ? 'text-red-500' // Error state: Red text
                    : 'text-gray-400 group-hover:text-gray-700' // Normal state
               }`}>
                   Tambah
               </span>
            </button>
          </div>
        )}
      </div>

       {/* 4. Add the error message text below the grid (Desktop only) */}
       {error && internalMediaFiles.length === 0 && (
            <p className="text-sm text-red-500 mt-1 hidden sm:block w-full">{error}</p>
       )}


      {/* Modal Crop */}
      {cropSource && croppingIndex !== null && ( // Ensure croppingIndex is not null
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