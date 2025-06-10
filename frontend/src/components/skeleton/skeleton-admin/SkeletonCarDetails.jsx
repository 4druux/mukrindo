// components/skeleton/SkeletonCarDetails.jsx
const SkeletonCarDetails = () => {
  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-pulse">
        {/* Image Gallery Skeleton */}
        <div>
          <div className="w-full h-96 bg-gray-300 rounded-lg mb-4"></div>
          <div className="grid grid-cols-3 gap-2">
            {Array(3)
              .fill(null)
              .map((_, index) => (
                <div
                  key={index}
                  className="w-full h-32 bg-gray-300 rounded-lg"
                ></div>
              ))}
          </div>
        </div>

        {/* Product Details Skeleton */}
        <div>
          <div className="h-8 bg-gray-300 rounded-lg w-2/3 mb-4"></div>
          <div className="h-6 bg-gray-300 rounded-lg w-1/2 mb-6"></div>

          <div className="grid grid-cols-2 gap-4">
            {Array(10)
              .fill(null)
              .map((_, index) => (
                <div key={index} className="h-6 bg-gray-300 rounded-lg"></div>
              ))}
          </div>
          <div className="mt-8 w-1/4 h-10 bg-gray-300 rounded-lg"></div>
        </div>
      </div>
    </div>
  );
};

export default SkeletonCarDetails;
