import { InfoCards } from "@/layout/admin/dashboard/InfoCards";
import ProductReportChart from "@/layout/admin/dashboard/ProductReportChart";
import MonthlyTarget from "@/layout/admin/dashboard/MonthlyTarget";
import LastUpdatedInfo from "@/layout/admin/dashboard/LastUpdateInfo";
import SalesStatsChart from "@/layout/admin/dashboard/SalesStatsChart";
import CarProductsTable from "@/layout/admin/dashboard/CarProductsTable";
import TopViewedCarsChart from "@/layout/admin/dashboard/TopViewedCarsChart";
import WebTrafficChart from "@/layout/admin/dashboard/WebTrafficChart";

import React from "react";

export const metadata = {
  title: "Admin Mukrindo Motor",
  description: "This is Admin Page for Mukrindo Motor",
};

export default function DashboardPage() {
  return (
    <div className="grid grid-cols-12 gap-4 md:gap-6">
      <div className="col-span-12">
        <div className="block xl:hidden">
          <LastUpdatedInfo />
        </div>
      </div>

      <div className="col-span-12 xl:space-y-6 xl:col-span-8">
        <InfoCards />
        <div className="hidden xl:block space-y-6">
          <ProductReportChart />
          <WebTrafficChart />
        </div>
      </div>

      <div className="col-span-12 space-y-6 xl:col-span-4">
        <div className="hidden xl:block">
          <LastUpdatedInfo />
        </div>
        <MonthlyTarget />
        <TopViewedCarsChart />
      </div>

      <div className="col-span-12 space-y-6 block xl:hidden">
        <ProductReportChart />
        <WebTrafficChart />
      </div>

      <div className="col-span-12">
        <SalesStatsChart />
      </div>

      <div className="col-span-12">
        <CarProductsTable />
      </div>
    </div>
  );
}
