// app/client-layout.jsx (user)
"use client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import AppHeader from "@/layout/user/AppHeader";
import AppFooter from "@/layout/user/AppFooter";
import { HeaderProvider } from "@/context/HeaderContext";
import BookmarkRightbar from "@/layout/user/BookmarkRightbar";

export default function ClientLayout({ children }) {
  const pathname = usePathname();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth <= 760);
    };
    checkIsMobile();
    window.addEventListener("resize", checkIsMobile);
    return () => {
      window.removeEventListener("resize", checkIsMobile);
    };
  }, []);

  const isNotHeader =
    pathname.startsWith("/admin") ||
    pathname.startsWith("/sign-in") ||
    pathname.startsWith("/sign-up");

  const hideHeaderOnBeliMobilMobile =
    isMobile && pathname.startsWith("/beli-mobil");

  const showHeader = !isNotHeader && !hideHeaderOnBeliMobilMobile;

  return (
    <>
      <HeaderProvider>
        <div className="min-h-screen bg-gray-50 mb-25 md:mb-0">
          {showHeader && <AppHeader />}
          <BookmarkRightbar />
          <div className="">{children}</div>
          <AppFooter />
        </div>
      </HeaderProvider>
    </>
  );
}
