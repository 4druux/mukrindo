// app/client-layout.jsx (user)
"use client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import AppHeader from "@/layout/user/AppHeader";
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
      setIsMobile(window.innerWidth <= 768);
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
        <div className="min-h-screen bg-gray-50">
          {showHeader && <AppHeader />}
          <BookmarkRightbar />
          <div className="sm:px-[6vw] md:px-[9vw] lg:px-[10vw]">{children}</div>
        </div>
      </HeaderProvider>
    </>
  );
}
