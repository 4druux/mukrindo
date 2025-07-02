import React from "react";
import PrivacyPolicy from "@/layout/user/PrivacyPolicy";

export const metadata = {
  title: "Kebijakan Privasi | Mukrindo Motor",
  description:
    "Kebijakan privasi penggunaan informasi pribadi di Mukrindo Motor.",
};

const PrivacyPolicypage = () => {
  return (
    <div className="container mx-auto">
      <div className="md:pt-5 lg:pt-10 border-t-2 border-gray-200">
        <div className="mt-4 lg:mt-0">
          <PrivacyPolicy />
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicypage;
