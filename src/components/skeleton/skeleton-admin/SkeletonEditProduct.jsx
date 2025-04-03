// components/skeleton/SkeletonEditProduct.jsx

const SkeletonEditProduct = () => {
  return (
    <div className="p-6 rounded-xl shadow-lg">
      <h2 className="text-2xl font-medium mb-4">Edit Produk Mobil</h2>

      <div className="space-y-4">
        {/* Image Upload Placeholder */}
        <div>
          <label className="block text-sm mb-2 font-medium text-gray-700">
            Gambar Mobil
          </label>
          <div className="flex items-center gap-4">
            <div className="w-[200px] h-[120px] bg-gray-300 rounded-md animate-pulse"></div>
            <div className="w-[200px] h-[120px] bg-gray-300 rounded-md animate-pulse"></div>
            <div className="w-[200px] h-[120px] bg-gray-300 rounded-md animate-pulse"></div>
          </div>
        </div>

        {/* Input Placeholders (repeated for multiple inputs) */}
        <div className="mb-4">
          <label >
            <div className="block text-sm font-medium text-gray-700">
              Nama Mobil
            </div>
          </label>
          <div className="h-8 bg-gray-300 rounded-xl animate-pulse"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 mb-4 gap-4">
          <label >
            <div className="block text-sm font-medium text-gray-700">
              Merek Mobil
            </div>
            <div className="h-8 bg-gray-300 rounded-xl animate-pulse"></div>
          </label>

          <label >
            <div className="block text-sm font-medium text-gray-700">
              Model Mobil
            </div>
            <div className="h-8 bg-gray-300 rounded-xl animate-pulse"></div>
          </label>

          <label >
            <div className="block text-sm font-medium text-gray-700">
              Varian Mobil
            </div>
            <div className="h-8 bg-gray-300 rounded-xl animate-pulse"></div>
          </label>
        </div>

        <div className="mb-4">
          <label >
            <div className="block text-sm font-medium text-gray-700">
              Tipe Mobil
            </div>
          </label>
          <div className="h-8 bg-gray-300 rounded-xl animate-pulse"></div>
        </div>

        <div className="mb-4">
          <label >
            <div className="block text-sm font-medium text-gray-700">
              Warna Mobil
            </div>
          </label>
          <div className="h-8 bg-gray-300 rounded-xl animate-pulse"></div>
        </div>

        <div className="mb-4">
          <label >
            <div className="block text-sm font-medium text-gray-700">
              Kapasitas Mesin (CC)
            </div>
          </label>
          <div className="h-8 bg-gray-300 rounded-xl animate-pulse"></div>
        </div>

        <div className="mb-4">
          <label >
            <div className="block text-sm font-medium text-gray-700">
              Jarak Tempuh (KM)
            </div>
          </label>
          <div className="h-8 bg-gray-300 rounded-xl animate-pulse"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 mb-4 gap-4">
          <label >
            <div className="block text-sm font-medium text-gray-700">
              Sistem Penggerak
            </div>
            <div className="h-8 bg-gray-300 rounded-xl animate-pulse"></div>
          </label>

          <label >
            <div className="block text-sm font-medium text-gray-700">
              Tranmisi
            </div>
            <div className="h-8 bg-gray-300 rounded-xl animate-pulse"></div>
          </label>

          <label >
            <div className="block text-sm font-medium text-gray-700">
              Bahan Bakar
            </div>
            <div className="h-8 bg-gray-300 rounded-xl animate-pulse"></div>
          </label>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 mb-4 gap-4">
          <label >
            <div className="block text-sm font-medium text-gray-700">
              Masa Berlaku STNK
            </div>
            <div className="h-8 bg-gray-300 rounded-xl animate-pulse"></div>
          </label>

          <label >
            <div className="block text-sm font-medium text-gray-700">
              Plat Nomor
            </div>
            <div className="h-8 bg-gray-300 rounded-xl animate-pulse"></div>
          </label>

          <label >
            <div className="block text-sm font-medium text-gray-700">
              Tahun Perakitan
            </div>
            <div className="h-8 bg-gray-300 rounded-xl animate-pulse"></div>
          </label>
        </div>

        <div className="mb-4">
          <label >
            <div className="block text-sm font-medium text-gray-700">
              Harga Mobil
            </div>
          </label>
          <div className="h-8 bg-gray-300 rounded-xl animate-pulse"></div>
        </div>

        <div className="mb-4">
          <label >
            <div className="block text-sm font-medium text-gray-700">
              Status
            </div>
          </label>
          <div className="h-8 bg-gray-300 rounded-xl animate-pulse"></div>
        </div>

        {/* Buttons Placeholder */}
        <div className="col-span-2 flex justify-end space-x-4 mt-4">
          <div className="h-10 w-24 bg-gray-300 rounded-full animate-pulse"></div>
          <div className="h-10 w-32 bg-gray-300 rounded-full animate-pulse"></div>
        </div>
      </div>
    </div>
  );
};

export default SkeletonEditProduct;
