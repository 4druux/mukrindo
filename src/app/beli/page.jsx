import React from "react";
import BuyCar from "@/layout/user/beli/BuyCar";
import Testimoni from "@/components/product-user/Testimoni";
import BuyAccordion from "@/layout/user/beli/BuyAccordion";
import NotifyMeForm from "@/components/product-user/NotifyMeForm";

const CarShopPage = () => {
  return (
    <div className="container mx-auto">
      <div className="lg:pt-10 border-t-2 border-gray-200">
        <div className="space-y-8 lg:space-y-16 mt-4 lg:mt-0">
          <BuyCar />
          <Testimoni />
          <div className="px-3 lg:px-0 space-y-8 lg:space-y-16">
            <NotifyMeForm />
            <BuyAccordion />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CarShopPage;
