import React from "react";
import TermsAndConditions from "@/layout/user/TermsAndConditions";

export const metadata = {
  title: "Syarat dan Ketentuan | Mukrindo Motor",
  description:
    "Syarat dan Ketentuan penggunaan informasi pribadi di Mukrindo Motor.",
};

const TermsAndConditionspage = () => {
  return (
    <div className="container mx-auto">
      <div className="md:pt-5 lg:pt-10 border-t-2 border-gray-200">
        <div className="mt-4 lg:mt-0">
          <TermsAndConditions />
        </div>
      </div>
    </div>
  );
};

export default TermsAndConditionspage;
