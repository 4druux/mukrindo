// frontend/src/components/auth/EditProfileForm.jsx
"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import TittleText from "@/components/common/TittleText";
import Input from "@/components/common/Input";
import InputPassword from "@/components/common/InputPassword";
import { Loader2, Save, UploadCloud, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import DotLoader from "@/components/common/DotLoader";
import { useRouter } from "next/navigation";

export default function EditProfileForm({ isUserPage = false }) {
  const {
    user,
    updateUser,
    loading: authLoading,
    authError,
    setAuthError,
  } = useAuth();
  const router = useRouter();

  const [initialUserData, setInitialUserData] = useState(null);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    newPassword: "",
    confirmNewPassword: "",
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [imageLoadError, setImageLoadError] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [removeAvatarFlag, setRemoveAvatarFlag] = useState(false);

  const fileInputRef = useRef(null);

  useEffect(() => {
    if (user) {
      const userData = {
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        avatar: user.avatar || null,
      };
      setInitialUserData(userData);
      setFormData({
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        newPassword: "",
        confirmNewPassword: "",
      });
      setAvatarPreview(userData.avatar);
      setAvatarFile(null);
      setRemoveAvatarFlag(false);
      setImageLoadError(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      if (authError) setAuthError(null);
    } else if (!authLoading) {
      setInitialUserData(null);
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        newPassword: "",
        confirmNewPassword: "",
      });
      setAvatarPreview(null);
      setAvatarFile(null);
      setRemoveAvatarFlag(false);
      setImageLoadError(false);
    }
  }, [user, authLoading, authError, setAuthError]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prevErrors) => ({ ...prevErrors, [name]: null }));
    }
    if (authError) setAuthError(null);

    if (name === "newPassword" && formData.confirmNewPassword) {
      if (value === formData.confirmNewPassword) {
        setErrors((prev) => ({ ...prev, confirmNewPassword: null }));
      } else {
        setErrors((prev) => ({
          ...prev,
          confirmNewPassword: "Konfirmasi kata sandi baru tidak cocok.",
        }));
      }
    }
    if (name === "confirmNewPassword" && formData.newPassword) {
      if (value === formData.newPassword) {
        setErrors((prev) => ({ ...prev, confirmNewPassword: null }));
      } else {
        setErrors((prev) => ({
          ...prev,
          confirmNewPassword: "Konfirmasi kata sandi baru tidak cocok.",
        }));
      }
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error("Ukuran gambar maksimal 2MB.", {
          className: "custom-toast",
        });
        if (fileInputRef.current) fileInputRef.current.value = "";
        return;
      }
      if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
        toast.error("Hanya format JPG, PNG, atau WEBP yang diizinkan.", {
          className: "custom-toast",
        });
        if (fileInputRef.current) fileInputRef.current.value = "";
        return;
      }
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
        setImageLoadError(false);
        setRemoveAvatarFlag(false);
      };
      reader.readAsDataURL(file);
      if (errors.avatar) {
        setErrors((prev) => ({ ...prev, avatar: null }));
      }
      if (authError) setAuthError(null);
    }
  };

  const removeAvatar = () => {
    setAvatarFile(null);
    setAvatarPreview(null);
    setImageLoadError(false);
    setRemoveAvatarFlag(true);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    if (authError) setAuthError(null);
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.firstName.trim())
      newErrors.firstName = "Nama depan wajib diisi.";
    if (!formData.lastName.trim())
      newErrors.lastName = "Nama belakang wajib diisi.";

    const isAttemptingPasswordChange =
      formData.newPassword || formData.confirmNewPassword;

    if (isAttemptingPasswordChange) {
      if (formData.newPassword.length < 6) {
        newErrors.newPassword = "Kata sandi baru minimal 6 karakter.";
      }
      if (formData.newPassword !== formData.confirmNewPassword) {
        newErrors.confirmNewPassword =
          "Konfirmasi kata sandi baru tidak cocok.";
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const checkForChanges = () => {
    if (!initialUserData) return true;

    const firstNameChanged =
      formData.firstName.trim() !== initialUserData.firstName;
    const lastNameChanged =
      formData.lastName.trim() !== initialUserData.lastName;
    const passwordChanged = !!formData.newPassword;
    const avatarChanged = !!avatarFile;
    const avatarRemoved = removeAvatarFlag && initialUserData.avatar;

    return (
      firstNameChanged ||
      lastNameChanged ||
      passwordChanged ||
      avatarChanged ||
      avatarRemoved
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (authError) setAuthError(null);
    setIsSubmitting(true);

    if (!validateForm()) {
      toast.error("Harap perbaiki eror pada form.", {
        className: "custom-toast",
      });
      setIsSubmitting(false);
      return;
    }

    if (!checkForChanges()) {
      toast.error("Tidak ada perubahan untuk disimpan.", {
        className: "custom-toast",
      });
      setIsSubmitting(false);
      return;
    }

    const submissionFormData = new FormData();

    if (formData.firstName.trim() !== (initialUserData?.firstName || "")) {
      submissionFormData.append("firstName", formData.firstName.trim());
    }
    if (formData.lastName.trim() !== (initialUserData?.lastName || "")) {
      submissionFormData.append("lastName", formData.lastName.trim());
    }

    if (avatarFile) {
      submissionFormData.append("avatar", avatarFile);
    } else if (removeAvatarFlag && initialUserData?.avatar) {
      submissionFormData.append("removeAvatarFlag", "true");
    }

    if (formData.newPassword) {
      submissionFormData.append("newPassword", formData.newPassword);
    }

    const result = await updateUser(submissionFormData);

    if (result.success) {
      setFormData((prev) => ({
        ...prev,
        newPassword: "",
        confirmNewPassword: "",
        firstName: result.user?.firstName || prev.firstName,
        lastName: result.user?.lastName || prev.lastName,
      }));
      setAvatarFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      setRemoveAvatarFlag(false);
      setErrors({});

      if (result.user?.role === "admin") {
        router.push("/admin");
      } else {
        router.push("/");
      }
    }
    setIsSubmitting(false);
  };

  if (authLoading && !user) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)] md:h-[calc(100vh-100px)]">
        <DotLoader />
      </div>
    );
  }
  if (!user && !authLoading) {
    return (
      <div className="text-center py-10 text-gray-600">
        Gagal memuat data pengguna atau Anda belum login.
      </div>
    );
  }

  const displayAvatarSrc =
    imageLoadError || !avatarPreview
      ? "/images/placeholder-avatar.png"
      : avatarPreview;

  return (
    <div
      className={`bg-white p-4 md:p-6 rounded-xl ${
        isUserPage ? "shadow-none md:shadow-md" : "shadow-lg"
      }`}
    >
      <TittleText text="Profil Saya" className="mb-6" />
      {authError && !isSubmitting && (
        <p className="text-red-500 mb-4 text-xs p-2 bg-red-50 border border-red-200 rounded">
          Error: {authError}
        </p>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex flex-col items-center space-y-3">
          <div className="relative w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden border-2 border-gray-200 bg-gray-100">
            <Image
              src={displayAvatarSrc}
              alt={user?.firstName ? `${user.firstName}'s Avatar` : "Avatar"}
              fill
              sizes="(max-width: 768px) 96px, 128px"
              style={{ objectFit: "cover" }}
              onError={() => {
                setImageLoadError(true);
              }}
              priority={true}
              key={avatarPreview || user?.avatar}
            />
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-orange-600 bg-orange-100 border border-orange-200 rounded-full hover:bg-orange-200 transition-colors cursor-pointer"
            >
              <UploadCloud size={14} /> Unggah Foto
            </button>
            {(avatarPreview || user?.avatar) && (
              <button
                type="button"
                onClick={removeAvatar}
                className="p-1.5 text-red-500 bg-red-100 border border-red-200 rounded-full hover:bg-red-200 transition-colors cursor-pointer"
                aria-label="Hapus foto profil"
              >
                <Trash2 size={14} />
              </button>
            )}
          </div>
          <input
            type="file"
            ref={fileInputRef}
            name="avatar"
            accept="image/jpeg, image/png, image/webp"
            onChange={handleAvatarChange}
            className="hidden"
          />
          {errors.avatar && (
            <p className="text-xs text-red-500">{errors.avatar}</p>
          )}
          <p className="text-xs text-gray-500">JPG, PNG, WEBP. Maks 2MB.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          <Input
            label="Nama Depan"
            id="firstName"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            error={errors.firstName}
            placeholder="Masukkan nama depan"
            maxLength={50}
            disabled={isSubmitting}
          />
          <Input
            label="Nama Belakang"
            id="lastName"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            error={errors.lastName}
            placeholder="Masukkan nama belakang"
            maxLength={50}
            disabled={isSubmitting}
          />
        </div>

        <Input
          label="Email"
          id="email"
          name="email"
          type="email"
          value={formData.email}
          error={errors.email}
          disabled={true}
          readOnly
        />

        <div className="border-t border-gray-200 pt-4 md:pt-6">
          <h3 className="text-md font-medium text-gray-700 mb-4 md:mb-6">
            Ubah Kata Sandi
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <InputPassword
              label="Kata Sandi Baru"
              id="newPassword"
              name="newPassword"
              value={formData.newPassword}
              onChange={handleChange}
              error={errors.newPassword}
              placeholder="Min. 6 karakter"
              autoComplete="new-password"
              disabled={isSubmitting}
            />
            <InputPassword
              label="Konfirmasi Kata Sandi Baru"
              id="confirmNewPassword"
              name="confirmNewPassword"
              value={formData.confirmNewPassword}
              onChange={handleChange}
              error={errors.confirmNewPassword}
              placeholder="Ulangi kata sandi baru"
              autoComplete="new-password"
              disabled={isSubmitting}
            />
          </div>
        </div>

        <div className="flex justify-end items-center pt-2 gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="cursor-pointer border text-orange-600 border-orange-500 hover:bg-orange-100 hover:border-orange-500
            hover:text-orange-600 text-sm font-medium py-2.5 px-6 rounded-full"
            disabled={isSubmitting || authLoading}
          >
            Kembali
          </button>
          <button
            type="submit"
            disabled={isSubmitting || authLoading}
            className="flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-medium text-white transition-colors duration-200 transform bg-gradient-to-br from-red-500 via-orange-400 to-yellow-400 hover:bg-orange-600 hover:from-transparent hover:to-transparent rounded-full focus:outline-none disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
          >
            {isSubmitting || authLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Save className="w-5 h-5" />
            )}
            Simpan Perubahan
          </button>
        </div>
      </form>
    </div>
  );
}
