// frontend/src/app/admin/profile/page.jsx
"use client";

import React from "react";
import EditProfileForm from "@/components/auth/EditProfileForm";
import BreadcrumbNav from "@/components/common/BreadcrumbNav";
import { useAuth } from "@/context/AuthContext";
import DotLoader from "@/components/common/DotLoader";
import { useRouter } from "next/navigation";

export default function AdminProfilePage() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace("/login?redirect=/admin/profile");
    }
  }, [authLoading, isAuthenticated, router]);

  const breadcrumbItems = [
    { label: "Beranda", href: "/admin" },
    { label: "Profil Saya", href: "" },
  ];

  if (authLoading || !isAuthenticated) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-100px)]">
        <DotLoader />
      </div>
    );
  }

  return (
    <>
      <BreadcrumbNav items={breadcrumbItems} />
      <EditProfileForm isUserPage={false} />
    </>
  );
}
