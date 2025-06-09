// frontend/src/app/profile/page.jsx
"use client";

import React from "react";
import EditProfileForm from "@/components/auth/EditProfileForm";
import BreadcrumbNav from "@/components/common/BreadcrumbNav";
import { useAuth } from "@/context/AuthContext";
import DotLoader from "@/components/common/DotLoader";

export default function UserProfilePage() {
  const { isAuthenticated, loading: authLoading } = useAuth();

  const breadcrumbItems = [
    { label: "Beranda", href: "/" },
    { label: "Profil Saya", href: "" },
  ];

  if (authLoading || !isAuthenticated) {
    return (
      <div className="container mx-auto flex items-center justify-center h-[calc(100vh-200px)]">
        <DotLoader />
      </div>
    );
  }

  return (
    <div className="container mx-auto">
      <p className="md:pt-5 lg:pt-10 border-t-2 border-gray-200"></p>
      <div className="mx-auto">
        <BreadcrumbNav items={breadcrumbItems} />
        <EditProfileForm isUserPage={true} />
      </div>
    </div>
  );
}
