"use client";

import React from "react";
import {
  MdKeyboardArrowDown,
  MdKeyboardArrowUp,
  MdCheckBoxOutlineBlank,
  MdGroup,
} from "react-icons/md";

export const EcommerceMetrics = () => {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6">
      {/* <!-- Metric Item Start --> */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
          {/* Use react-icon */}
          <MdGroup className="text-gray-800 size-6 dark:text-white/90" />
        </div>
        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Customers
            </span>
            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
              3,782
            </h4>
          </div>
          {/* Inlined Success Badge */}
          <span className="inline-flex items-center rounded-full bg-success-100 px-2.5 py-0.5 text-xs font-medium text-success-800 dark:bg-success-800/20 dark:text-success-400">
            {/* Use react-icon */}
            <MdKeyboardArrowUp className="w-4 h-4" />
            11.01%
          </span>
        </div>
      </div>
      {/* <!-- Metric Item End --> */}

      {/* <!-- Metric Item Start --> */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
          {/* Use react-icon */}
          <MdCheckBoxOutlineBlank className="text-gray-800 dark:text-white/90" />
        </div>
        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Orders
            </span>
            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
              5,359
            </h4>
          </div>
          {/* Inlined Error Badge */}
          <span className="inline-flex items-center rounded-full bg-error-100 px-2.5 py-0.5 text-xs font-medium text-error-800 dark:bg-error-800/20 dark:text-error-400">
            {/* Use react-icon */}
            <MdKeyboardArrowDown className="w-4 h-4 text-error-500" />
            9.05%
          </span>
        </div>
      </div>
      {/* <!-- Metric Item End --> */}
    </div>
  );
};
