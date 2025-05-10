import { InfoCards } from "@/layout/admin/dashboard/InfoCards";
import MonthlySalesChart from "@/layout/admin/dashboard/MonthlySalesChart";
import MonthlyTarget from "@/layout/admin/dashboard/MonthlyTarget";
import LastUpdatedInfo from "@/layout/admin/dashboard/LastUpdateInfo";
import StatisticsChart from "@/layout/admin/dashboard/StatisticsChart";
import RecentCarProductsTable from "@/layout/admin/dashboard/RecentCarProductsTable";

import React from "react";

export const metadata = {
  title: "Admin Mukrindo Motor",
  description: "This is Admin Page for Mukrindo Motor",
};

export default function DashboardPage() {
  return (
    <div className="grid grid-cols-12 gap-4 md:gap-6">
      <div className="col-span-12 block xl:hidden">
        <LastUpdatedInfo />
      </div>

      <div className="col-span-12 space-y-6 xl:col-span-8">
        <InfoCards />
        <MonthlySalesChart />
      </div>

      <div className="col-span-12 xl:space-y-6 xl:col-span-4">
        <div className="hidden xl:block">
          <LastUpdatedInfo />
        </div>
        <MonthlyTarget />
      </div>

      <div className="col-span-12">
        <StatisticsChart />
      </div>

      <div className="col-span-12">
        <RecentCarProductsTable />
      </div>
    </div>
  );
}
