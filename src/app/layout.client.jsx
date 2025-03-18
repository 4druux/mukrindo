"use client";
import { usePathname } from "next/navigation";
import ClientLayout from "./client-layout";
import { SidebarProvider } from "@/context/SidebarContext";

export default function RootLayoutClient({ children }) {
  const pathname = usePathname();
  const isAdminPage =
    pathname.startsWith("/admin") ||
    pathname.startsWith("/sign-in") ||
    pathname.startsWith("/sign-up");

  return (
    <SidebarProvider>
      {isAdminPage ? children : <ClientLayout>{children}</ClientLayout>}
    </SidebarProvider>
  );
}
