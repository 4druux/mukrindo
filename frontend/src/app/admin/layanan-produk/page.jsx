import React, { Suspense } from "react";
import RequestView from "@/layout/admin/layanan-produk/RequestView";

const RequestListPage = () => {
  return (
    <div className="">
      <Suspense fallback={<div>Loading...</div>}>
        <RequestView />
      </Suspense>
    </div>
  );
};

export default RequestListPage;
