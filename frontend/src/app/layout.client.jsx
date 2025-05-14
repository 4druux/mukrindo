//app/layout.client.jsx (admin)
"use client";
import { usePathname } from "next/navigation";
import ClientLayout from "./client-layout";
import { SidebarProvider } from "@/context/SidebarContext";
import { HeaderProvider } from "@/context/HeaderContext";
import { ProductProvider } from "@/context/ProductContext";
import { TradeInProvider } from "@/context/TradeInContext";
import { BuySellProvider } from "@/context/BuySellContext";
import { NotificationProvider } from "@/context/NotifStockContext";
import { TrafficProvider } from "@/context/TrafficContext";
import { Toaster } from "react-hot-toast";

export default function RootLayoutClient({ children }) {
  const pathname = usePathname();
  const isAdminPage =
    pathname.startsWith("/admin") ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/register");

  return (
    <TrafficProvider>
      <ProductProvider>
        <TradeInProvider>
          <BuySellProvider>
            <NotificationProvider>
              <SidebarProvider>
                <HeaderProvider>
                  <Toaster position="top-right" reverseOrder={true} />
                  {isAdminPage ? (
                    children
                  ) : (
                    <ClientLayout>{children}</ClientLayout>
                  )}
                </HeaderProvider>
              </SidebarProvider>
            </NotificationProvider>
          </BuySellProvider>
        </TradeInProvider>
      </ProductProvider>
    </TrafficProvider>
  );
}
