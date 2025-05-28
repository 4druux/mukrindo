// frontend/src/app/client-layout.jsx
"use client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import AppHeader from "@/layout/user/AppHeader";
import AppFooter from "@/layout/user/AppFooter";
import BookmarkRightbar from "@/layout/user/BookmarkRightbar";

export default function ClientLayout({ children }) {
  const pathname = usePathname();
  const [isMobile, setIsMobile] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    if (hasMounted) {
      window.scrollTo(0, 0);
    }
  }, [pathname, hasMounted]);

  useEffect(() => {
    if (!hasMounted) return;

    const checkIsMobile = () => {
      setIsMobile(window.innerWidth <= 760);
    };
    checkIsMobile();
    window.addEventListener("resize", checkIsMobile);
    return () => {
      window.removeEventListener("resize", checkIsMobile);
    };
  }, [hasMounted]);

  useEffect(() => {
    if (hasMounted && typeof window !== "undefined") {
      const cleanupOldViewedProducts = () => {
        const oneDayAgo = new Date();
        oneDayAgo.setDate(oneDayAgo.getDate() - 1);
        oneDayAgo.setHours(0, 0, 0, 0);

        for (let i = localStorage.length - 1; i >= 0; i--) {
          const key = localStorage.key(i);
          if (key && key.startsWith("viewedProduct_")) {
            const parts = key.split("_");
            if (parts.length === 3) {
              const datePart = parts[2];
              try {
                const dateParts = datePart.split("-");
                if (dateParts.length === 3) {
                  const viewedDate = new Date(
                    parseInt(dateParts[0]),
                    parseInt(dateParts[1]) - 1,
                    parseInt(dateParts[2])
                  );
                  viewedDate.setHours(0, 0, 0, 0);
                  if (viewedDate.getTime() < oneDayAgo.getTime()) {
                    localStorage.removeItem(key);
                  }
                } else {
                  localStorage.removeItem(key);
                }
              } catch (e) {
                console.warn(
                  `Error parsing date from localStorage key, removing: ${key}`,
                  e
                );
                localStorage.removeItem(key);
              }
            } else {
              localStorage.removeItem(key);
            }
          }
        }
      };
      cleanupOldViewedProducts();
    }
  }, [hasMounted]);

  const isAuthFlowPage =
    pathname.startsWith("/admin") ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/register") ||
    pathname.startsWith("/auth/callback");

  const hideHeaderOnBeliMobilMobile =
    hasMounted && isMobile && pathname.startsWith("/beli-mobil");

  const showHeaderAndStandardLayout =
    !isAuthFlowPage && !hideHeaderOnBeliMobilMobile;

  if (pathname.startsWith("/auth/callback")) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-gray-50 mb-18 md:mb-0">
      {showHeaderAndStandardLayout && <AppHeader />}
      <BookmarkRightbar />
      <div className="">{children}</div>
      <AppFooter />
    </div>
  );
}
