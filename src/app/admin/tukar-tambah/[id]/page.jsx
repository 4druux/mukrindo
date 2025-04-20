// File: frontend/src/app/admin/dashboard/tukar-tambah/[id]/page.jsx
import React from "react";
import TradeInRequestDetail from "@/layout/admin/tukar-tambah/TradeInRequestDetail";

const TradeInDetailPage = ({ params }) => {
  const { id } = params;

  return (
    <div className="">
      <TradeInRequestDetail requestId={id} />
    </div>
  );
};

export default TradeInDetailPage;
