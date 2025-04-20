//app/layout.client.jsx (admin)
"use client";
import { usePathname } from "next/navigation";
import ClientLayout from "./client-layout";
import { SidebarProvider } from "@/context/SidebarContext";
import { HeaderProvider } from "@/context/HeaderContext";
import { ProductProvider } from "@/context/ProductContext";
import { TradeInProvider } from "@/context/TradeInContext";
import { Toaster } from "react-hot-toast";

export default function RootLayoutClient({ children }) {
  const pathname = usePathname();
  const isAdminPage =
    pathname.startsWith("/admin") ||
    pathname.startsWith("/sign-in") ||
    pathname.startsWith("/sign-up");

  return (
    <ProductProvider>
      <TradeInProvider>
        <SidebarProvider>
          <HeaderProvider>
            <Toaster position="top-right" reverseOrder={true} />
            {isAdminPage ? children : <ClientLayout>{children}</ClientLayout>}
          </HeaderProvider>
        </SidebarProvider>
      </TradeInProvider>
    </ProductProvider>
  );
}
