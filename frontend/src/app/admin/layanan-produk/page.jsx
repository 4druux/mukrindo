import React, { Suspense } from "react";
import RequestView from "@/layout/admin/layanan-produk/RequestView";
import DotLoader from "@/components/common/DotLoader";

const RequestListPage = () => {
  return (
    <div className="">
      <Suspense
        fallback={
          <div className="flex items-center justify-center h-screen bg-gray-50">
            <DotLoader dotSize="w-5 h-5" />
          </div>
        }
      >
        <RequestView />
      </Suspense>
    </div>
  );
};

export default RequestListPage;
