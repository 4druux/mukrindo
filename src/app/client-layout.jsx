// app/client-layout.jsx
"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import AppHeader from "@/layout/user/AppHeader";
import { HeaderProvider } from "@/context/HeaderContext";

export default function ClientLayout({ children }) {
  const pathname = usePathname();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  const isAdminPage =
    pathname.startsWith("/admin") ||
    pathname.startsWith("/sign-in") ||
    pathname.startsWith("/sign-up");

  return (
    <>
      <HeaderProvider>
          {!isAdminPage && <AppHeader />}
          <div className="px-4 sm:px-[6vw] md:px-[9vw] lg:px-[10vw] bg-gray-50">
            {children}
          </div>
      </HeaderProvider>
    </>
  );
}
