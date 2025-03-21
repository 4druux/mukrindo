// EditProduct.jsx
"use client";
import { useState, useEffect } from "react";
import Input from "@/components/common/Input";
import Select from "@/components/common/Select";
import ImageUpload from "@/components/product/ImageUpload";
import CarBrands from "@/components/product/CarBrands";
import CarSystems from "@/components/product/CarSystems";
import CarPapers from "@/components/product/CarPapers";
import { validateProductData } from "@/utils/validateProductData";
import { formatNumber, unformatNumber } from "@/utils/formatNumber";
import carData from "@/utils/carData";
import { useRouter } from "next/navigation";

const EditProduct = ({ productId }) => {
  const [productData, setProductData] = useState({
    carName: "",
    brand: "",
    model: "",
    variant: "",
    type: "",
    carColor: "",
    cc: "",
    travelDistance: "",
    driveSystem: "",
    transmission: "",
    fuelType: "",
    stnkExpiry: "",
    plateNumber: "",
    yearOfAssembly: "",
    price: "",
    status: "", // Inisialisasi status
  });
  const [mediaFiles, setMediaFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  const handleChange = (e) => {
    const { name, value } = e.target;
    let updatedValue = value;
    if (name === "price" || name === "cc" || name === "travelDistance") {
      updatedValue = unformatNumber(value);
    }
    setProductData((prevData) => ({
      ...prevData,
      [name]: updatedValue,
    }));
  };

  const handleBrandChange = (field, value, modelValue, variantValue) => {
    setProductData((prev) => ({
      ...prev,
      brand: field === "brand" ? value : prev.brand,
      model: field === "model" ? value : field === "brand" ? "" : modelValue,
      variant:
        field === "variant"
          ? value
          : field === "brand" || field === "model"
          ? ""
          : variantValue,
    }));
  };

  useEffect(() => {
    const fetchProduct = async () => {
      if (!productId) return;
      try {
        const response = await fetch(
          `http://localhost:5000/api/products/${productId}`
        );
        if (!response.ok) {
          throw new Error("Gagal mengambil data produk");
        }
        const data = await response.json();
        setProductData({
          carName: data.carName,
          brand: data.brand,
          model: data.model,
          variant: data.variant,
          type: data.type,
          carColor: data.carColor,
          cc: data.cc,
          travelDistance: data.travelDistance,
          driveSystem: data.driveSystem,
          transmission: data.transmission,
          fuelType: data.fuelType,
          stnkExpiry: data.stnkExpiry,
          plateNumber: data.plateNumber,
          yearOfAssembly: data.yearOfAssembly,
          price: data.price,
          status: data.status, // Set status dari data yang diambil
        });

        const initialMediaFiles = await Promise.all(
          data.images.map(async (base64, index) => {
            const response = await fetch(base64);
            const blob = await response.blob();
            const file = new File([blob], `image${index}.jpg`, {
              type: "image/jpeg",
            });
            return { original: file, cropped: file, originalBase64: base64 }; // Simpan Base64 asli
          })
        );
        setMediaFiles(initialMediaFiles);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [productId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    // Validasi (gunakan validateProductData yang sudah dimodifikasi)
    const validationError = validateProductData(productData, mediaFiles);
    if (validationError) {
      setError(validationError);
      return;
    }
    setLoading(true);

    try {
      // 1. Proses Gambar:  Hanya upload gambar yang *berubah*.
      const base64Images = await Promise.all(
        mediaFiles.map(async (fileObj) => {
          if (fileObj.cropped) {
            // Gambar diubah (ada crop baru) -> Konversi ke Base64
            return new Promise((resolve, reject) => {
              const reader = new FileReader();
              reader.onload = () => resolve(reader.result);
              reader.onerror = reject;
              reader.readAsDataURL(fileObj.cropped);
            });
          } else if (fileObj.originalBase64) {
            // Gambar tidak diubah -> Gunakan Base64 yang asli
            return fileObj.originalBase64;
          }
          return null; // Seharusnya tidak terjadi, tapi handle untuk keamanan
        })
      );

      // 2. Siapkan Data untuk Dikirim
      const submitData = {
        ...productData,
        images: base64Images, // Kirim semua Base64 (yang baru dan yang lama)
      };

      // 3. Kirim Request ke Backend
      const response = await fetch(
        `http://localhost:5000/api/products/${productId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(submitData),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "Gagal memperbarui produk. Silakan coba lagi."
        );
      }

      const responseData = await response.json();
      console.log("Produk berhasil diperbarui:", responseData);
      router.push("/admin");
    } catch (error) {
      console.error("Error:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center p-4">Loading...</div>;
  }
  if (error) {
    return <div className="text-center p-4 text-red-500">{error}</div>;
  }

  return (
    <div className="p-6 rounded-xl shadow-lg">
      <h2 className="text-2xl font-medium mb-4">Edit Produk Mobil</h2>
      {error && <div className="text-red-500 mb-4">{error}</div>}
      {loading && <div className="text-orange-500 mb-4">Memperbarui...</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Image Upload */}
        <div>
          <label className="block text-sm mb-2 font-medium text-gray-700">
            Gambar Mobil
          </label>
          <ImageUpload mediaFiles={mediaFiles} setMediaFiles={setMediaFiles} />
        </div>
        <Input
          label="Nama Mobil"
          id="carName"
          name="carName"
          placeholderTexts={[
            "Nama mobil anda",
            "Nama mobil anda",
            "Nama mobil anda",
          ]}
          value={productData.carName}
          onChange={handleChange}
        />
        <CarBrands
          carData={carData}
          brand={productData.brand}
          model={productData.model}
          variant={productData.variant}
          onChange={handleBrandChange}
        />
        <Select
          label="Tipe Mobil"
          id="type"
          name="type"
          value={productData.type}
          title="Tipe Mobil"
          description="Jenis Tipe Mobil"
          onChange={(value) =>
            handleChange({ target: { name: "type", value } })
          }
          options={[
            { value: "sedan", label: "Sedan" },
            { value: "hatchback", label: "Hatchback" },
            { value: "suv", label: "SUV" },
            { value: "mpv", label: "MPV" },
            { value: "minibus", label: "Minibus" },
          ]}
        />
        <Input
          label="Warna Mobil"
          id="carColor"
          name="carColor"
          placeholderTexts={[
            "Warna mobil anda",
            "Warna mobil anda",
            "Warna mobil anda",
          ]}
          value={productData.carColor}
          onChange={handleChange}
        />
        <Input
          label="Kapasitas Mesin (CC)"
          id="cc"
          name="cc"
          placeholderTexts={[
            "Kapasitas mesin mobil anda",
            "Kapasitas mesin mobil anda",
            "Kapasitas mesin mobil anda",
          ]}
          value={productData.cc}
          onChange={handleChange}
          formatter={formatNumber}
        />
        <Input
          label="Jarak Tempuh (KM)"
          id="travelDistance"
          name="travelDistance"
          placeholderTexts={[
            "Jarak tempuh mobil anda",
            "Jarak tempuh mobil anda",
            "Jarak tempuh mobil anda",
          ]}
          value={productData.travelDistance}
          onChange={handleChange}
          formatter={formatNumber}
        />
        <CarSystems
          data={{
            driveSystem: productData.driveSystem,
            transmission: productData.transmission,
            fuelType: productData.fuelType,
          }}
          onChange={handleChange}
        />
        <CarPapers
          data={{
            stnkExpiry: productData.stnkExpiry,
            plateNumber: productData.plateNumber,
            yearOfAssembly: productData.yearOfAssembly,
          }}
          onChange={handleChange}
        />
        <Input
          label="Harga Mobil"
          id="price"
          name="price"
          value={productData.price}
          onChange={handleChange}
          formatter={formatNumber}
          prefix="Rp "
        />

        {/* Status Select */}
        <Select
          label="Status"
          id="status"
          name="status"
          value={productData.status}
          onChange={(value) =>
            handleChange({ target: { name: "status", value } })
          }
          options={[
            { value: "available", label: "Available" },
            { value: "sold out", label: "Sold Out" },
          ]}
        />

        <div className="col-span-2 flex justify-end space-x-2 sm:space-x-4 mt-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="cursor-pointer border text-gray-600 border-gray-500 hover:bg-orange-100 hover:border-orange-500 
            hover:text-orange-600 text-sm font-medium py-2.5 px-6 rounded-full focus:outline-none focus:shadow-outline"
          >
            Back
          </button>
          <button
            type="submit"
            className="cursor-pointer bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium py-2.5 px-6 rounded-full 
            focus:outline-none focus:shadow-outline"
            disabled={loading}
          >
            {loading ? "Memperbarui..." : "Update Produk"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditProduct;
