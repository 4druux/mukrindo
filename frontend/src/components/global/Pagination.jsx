// components/global/Pagination.jsx
import React from "react";
import ReactPaginate from "react-paginate";

// Import Icons
import { ChevronsLeft, ChevronsRight } from "lucide-react";

const Pagination = ({ pageCount, currentPage, onPageChange }) => {
  return (
    <div className="flex justify-center mt-8">
      <ReactPaginate
        previousLabel={
          <div
            className={`flex items-center space-x-2 ${
              currentPage === 0 ? "cursor-not-allowed" : "cursor-pointer"
            }`}
          >
            <ChevronsLeft
              className={`w-6 h-6 ${
                currentPage === 0
                  ? "text-orange-300"
                  : "text-orange-500 hover:text-orange-600"
              }`}
            />
          </div>
        }
        nextLabel={
          <div
            className={`flex items-center space-x-2 ${
              currentPage === pageCount - 1
                ? "cursor-not-allowed"
                : "cursor-pointer"
            }`}
          >
            <ChevronsRight
              className={`w-6 h-6 ${
                currentPage === pageCount - 1
                  ? "text-orange-300"
                  : "text-orange-500 hover:text-orange-600"
              }`}
            />
          </div>
        }
        breakLabel={"..."}
        pageCount={pageCount}
        marginPagesDisplayed={1}
        pageRangeDisplayed={1}
        onPageChange={onPageChange}
        containerClassName={
          "flex items-center space-x-1 md:space-x-4 border border-gray-100 p-2 rounded-full shadow-md bg-white"
        }
        pageClassName={`relative w-8 h-8 flex items-center justify-center rounded-full cursor-pointer text-sm font-medium 
              transition-all duration-300 hover:-translate-y-1 text-orange-500`}
        previousClassName={`flex items-center space-x-2 px-3 py-2 rounded-full ${
          currentPage === 0
            ? "cursor-not-allowed"
            : "hover:bg-orange-100 hover:-translate-y-1 transition-all duration-300"
        }`}
        nextClassName={`flex items-center space-x-2 px-3 py-2 rounded-full ${
          currentPage === pageCount - 1
            ? "cursor-not-allowed"
            : "hover:bg-orange-100 hover:-translate-y-1 transition-all duration-300"
        }`}
        breakClassName={"px-3 py-2 text-orange-600 select-none"}
        activeClassName={"bg-orange-100 text-orange-600 shadow-md scale-105"}
        pageLinkClassName={`absolute inset-0 flex items-center justify-center`}
        disabledClassName={"opacity-50 cursor-not-allowed"}
        renderOnZeroPageCount={null}
      />
    </div>
  );
};

export default Pagination;
