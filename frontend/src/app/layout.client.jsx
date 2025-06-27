// frontend/src/app/layout.client.jsx
"use client";

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
                        <Toaster
                          position="top-right"
                          reverseOrder={true}
                          duration={5000}
                        />
                        {children}
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
