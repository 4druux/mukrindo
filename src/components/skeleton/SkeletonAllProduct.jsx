// components/product/SkeletonAllProduct.jsx

const SkeletonAllProduct = () => {
  return (
    <div className="rounded-2xl overflow-hidden shadow-md">
      <div className="w-full h-40 bg-gray-300 animate-pulse"></div>
      <div className="p-4">
        <div className="h-4 bg-gray-300 rounded w-3/4 animate-pulse mb-2"></div>
        <div className="h-5 bg-gray-300 rounded w-1/2 animate-pulse mb-4"></div>
        <div className="flex justify-between gap-2 ">
          <div className="w-1/4 h-5 bg-gray-300 rounded animate-pulse"></div>
          <div className="w-1/4 h-5 bg-gray-300 rounded animate-pulse"></div>
          <div className="w-1/4 h-5 bg-gray-300 rounded animate-pulse"></div>
          <div className="w-1/4 h-5 bg-gray-300 rounded animate-pulse"></div>
        </div>
        <div className="flex justify-end mt-8 gap-3">
          <div className="w-8 h-6 bg-gray-300 rounded animate-pulse"></div>
          <div className="w-8 h-6 bg-gray-300 rounded animate-pulse"></div>
        </div>
      </div>
    </div>
  );
};

export default SkeletonAllProduct;
