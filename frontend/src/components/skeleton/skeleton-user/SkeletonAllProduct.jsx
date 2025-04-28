// components/product/SkeletonAllProduct.jsx

const SkeletonAllProduct = () => {
  return (
    <div className="rounded-2xl overflow-hidden shadow-md">
      <div className="w-full h-52 bg-gray-200 animate-pulse"></div>
      <div className="p-4">
        <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse mb-4"></div>
        <div className="h-5 bg-gray-200 rounded w-1/2 animate-pulse mb-4"></div>
        <div className="border border-gray-200 mb-6 animate-pulse"></div>
        <div className="flex justify-between gap-8 mb-8">
          <div className="w-1/4 h-8 bg-gray-200 rounded animate-pulse"></div>
          <div className="w-1/4 h-8 bg-gray-200 rounded animate-pulse"></div>
          <div className="w-1/4 h-8 bg-gray-200 rounded animate-pulse"></div>
          <div className="w-1/4 h-8 bg-gray-200 rounded animate-pulse"></div>
        </div>
      </div>
    </div>
  );
};

export default SkeletonAllProduct;
