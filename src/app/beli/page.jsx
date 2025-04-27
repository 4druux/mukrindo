import React from "react";
import BuyCar from "@/layout/user/beli/BuyCar";
import BuyAccordion from "@/layout/user/beli/BuyAccordion";
import NotifyMeForm from "@/components/product-user/NotifyMeForm";

const CarShopPage = () => {
  return (
    <div className="container mx-auto px-4 lg:px-0">
      <div className="lg:pt-10 border-t-2 border-gray-200">
        <div className="space-y-8 lg:space-y-12 mt-4 lg:mt-0">
          <BuyCar />
          <NotifyMeForm />
          <BuyAccordion />
        </div>
      </div>
    </div>
  );
};

export default CarShopPage;
