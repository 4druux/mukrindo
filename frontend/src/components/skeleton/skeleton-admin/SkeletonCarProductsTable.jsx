// components/skeleton/skeleton-admin/SkeletonCarProductsTable.jsx

const SkeletonCarProductsTable = () => {
  return (
    <div className="flex md:grid md:grid-cols-12 md:gap-x-4 py-4 border-b border-gray-200 animate-pulse items-start md:items-center">
      <div className="flex flex-1 items-start md:col-span-4 md:flex md:items-center md:gap-x-3">
        {/* Image  */}
        <div className="flex-shrink-0">
          <div className="w-20 h-16 md:w-20 md:h-12 bg-gray-200 rounded"></div>
        </div>

        {/* Text  */}
        <div className="ml-3 sm:ml-0 flex-1 min-w-0">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-20 mb-2"></div>

          {/* Mobile Price/Status  */}
          <div className="mt-2 sm:hidden">
            <div className="flex items-center gap-2">
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-6 bg-gray-200 rounded-full w-20"></div>
            </div>
          </div>

          {/* Mobile in/out */}
          <div className="mt-2 sm:hidden">
            <div className="flex items-start gap-2 mt-2">
              <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop price,in,out,status  */}
      <div className="hidden sm:flex sm:col-span-2 sm:items-center">
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
      </div>

      <div className="hidden sm:flex sm:col-span-2 sm:items-center">
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
      </div>

      <div className="hidden sm:flex sm:col-span-2 sm:items-center">
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
      </div>

      <div className="hidden sm:flex sm:col-span-2 sm:items-center">
        <div className="h-6 bg-gray-200 rounded-full w-20"></div>
      </div>
    </div>
  );
};

export default SkeletonCarProductsTable;
