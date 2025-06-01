//app/layout.client.jsx (admin)
"use client";
import { usePathname } from "next/navigation";
import ClientLayout from "./client-layout";
import { SidebarProvider } from "@/context/SidebarContext";
import { HeaderProvider } from "@/context/HeaderContext";
import { AuthProvider } from "@/context/AuthContext";
import { ProductProvider } from "@/context/ProductContext";
import { TradeInProvider } from "@/context/TradeInContext";
import { BuySellProvider } from "@/context/BuySellContext";
import { NotifStockProvider } from "@/context/NotifStockContext";
import { NotificationProvider } from "@/context/NotificationContext";
import { TrafficProvider } from "@/context/TrafficContext";
import { CarDataProvider } from "@/context/CarDataContext";
import { Toaster } from "react-hot-toast";

export default function RootLayoutClient({ children }) {
  const pathname = usePathname();
  const isAdminPage =
    pathname.startsWith("/admin") ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/register");

  return (
    <TrafficProvider>
      <AuthProvider>
        <ProductProvider>
          <NotificationProvider>
            <CarDataProvider>
              <TradeInProvider>
                <BuySellProvider>
                  <NotifStockProvider>
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
                  </NotifStockProvider>
                </BuySellProvider>
              </TradeInProvider>
            </CarDataProvider>
          </NotificationProvider>
        </ProductProvider>
      </AuthProvider>
    </TrafficProvider>
  );
}
