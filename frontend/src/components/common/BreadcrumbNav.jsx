// src/components/common/BreadcrumbNav.jsx
import React from "react";
import Link from "next/link";
import { FaChevronRight } from "react-icons/fa";

const BreadcrumbNav = ({ items }) => {
  if (!items || items.length === 0) {
    return null;
  }

  return (
    <nav
      aria-label="Breadcrumb"
      className="mb-2 text-sm text-gray-700 hidden md:block"
    >
      <ol className="flex items-center space-x-1.5">
        {items.map((item, index) => (
          <React.Fragment key={index}>
            <li>
              {index === items.length - 1 ? (
                <span
                  className="font-medium text-orange-500 truncate"
                  aria-current="page"
                >
                  {item.label}
                </span>
              ) : (
                <Link
                  href={item.href}
                  className="hover:text-orange-500 hover:underline"
                >
                  {item.label}
                </Link>
              )}
            </li>
            {index < items.length - 1 && (
              <li>
                <FaChevronRight className="w-3 h-3 text-gray-500" />
              </li>
            )}
          </React.Fragment>
        ))}
      </ol>
    </nav>
  );
};

export default BreadcrumbNav;
