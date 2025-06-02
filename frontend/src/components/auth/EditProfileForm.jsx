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

export default function EditProfileForm({ isUserPage = false }) {
  const {
    user, // user sekarang seharusnya memiliki properti 'hasPassword'
    updateUser,
    loading: authLoading,
    authError,
    setAuthError,
  } = useAuth();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    currentPassword: "",
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
  const componentMounted = useRef(false);

  useEffect(() => {
    componentMounted.current = true;
    return () => {
      componentMounted.current = false;
    };
  }, []);

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        currentPassword: "",
        newPassword: "",
        confirmNewPassword: "",
      });
      setAvatarPreview(user.avatar || null);
      setAvatarFile(null);
      setRemoveAvatarFlag(false);
      setImageLoadError(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      setErrors({});
      if (authError) setAuthError(null); // Bersihkan authError saat user data berubah
    }
  }, [user, setAuthError]); // authError ditambahkan sebagai dependency jika setAuthError dipanggil

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
    if (authError) setAuthError(null); // Bersihkan authError saat user mulai mengetik

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
    // ... (sama seperti sebelumnya)
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
        if (componentMounted.current) {
          setAvatarPreview(reader.result);
          setImageLoadError(false);
          setRemoveAvatarFlag(false);
        }
      };
      reader.readAsDataURL(file);
      if (errors.avatar) {
        setErrors((prev) => ({ ...prev, avatar: null }));
      }
      if (authError) setAuthError(null);
    }
  };

  const removeAvatar = () => {
    // ... (sama seperti sebelumnya)
    setAvatarFile(null);
    setAvatarPreview(null);
    setImageLoadError(false);
    setRemoveAvatarFlag(true);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    if (authError) setAuthError(null);
  };

  const isManualUser = user && user.hasPassword; // Menggunakan user.hasPassword

  const validateForm = () => {
    const newErrors = {};
    if (!formData.firstName.trim())
      newErrors.firstName = "Nama depan wajib diisi.";
    if (!formData.lastName.trim())
      newErrors.lastName = "Nama belakang wajib diisi.";

    const isAttemptingPasswordChange =
      formData.newPassword || formData.confirmNewPassword;

    if (isAttemptingPasswordChange) {
      if (isManualUser && !formData.currentPassword) {
        // Validasi hanya jika pengguna manual dan ingin ganti sandi
        newErrors.currentPassword =
          "Kata sandi saat ini wajib diisi untuk mengubah kata sandi.";
      }
      if (formData.newPassword.length < 6) {
        newErrors.newPassword = "Kata sandi baru minimal 6 karakter.";
      }
      if (formData.newPassword !== formData.confirmNewPassword) {
        newErrors.confirmNewPassword =
          "Konfirmasi kata sandi baru tidak cocok.";
      }
    } else if (
      formData.currentPassword &&
      isManualUser &&
      !isAttemptingPasswordChange
    ) {
      newErrors.newPassword =
        "Kata sandi baru wajib diisi jika Anda ingin mengubah kata sandi.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (authError) setAuthError(null); // Bersihkan authError sebelum submit baru

    if (!validateForm()) {
      toast.error("Harap perbaiki eror pada form.", {
        className: "custom-toast",
      });
      setIsSubmitting(false); // Pastikan setIsSubmitting di-set false jika validasi gagal
      return;
    }
    setIsSubmitting(true);

    const submissionFormData = new FormData();
    let hasChanges = false;

    if (formData.firstName.trim() !== (user?.firstName || "")) {
      submissionFormData.append("firstName", formData.firstName.trim());
      hasChanges = true;
    }
    if (formData.lastName.trim() !== (user?.lastName || "")) {
      submissionFormData.append("lastName", formData.lastName.trim());
      hasChanges = true;
    }

    if (avatarFile) {
      submissionFormData.append("avatar", avatarFile);
      hasChanges = true;
    } else if (removeAvatarFlag && user?.avatar) {
      submissionFormData.append("removeAvatarFlag", "true");
      hasChanges = true;
    }

    const isAttemptingPasswordChange =
      formData.newPassword || formData.confirmNewPassword;

    if (isAttemptingPasswordChange) {
      if (isManualUser) {
        // Hanya kirim currentPassword jika pengguna manual
        // Validasi sudah memastikan currentPassword diisi jika diperlukan
        submissionFormData.append("currentPassword", formData.currentPassword);
      }
      submissionFormData.append("newPassword", formData.newPassword);
      hasChanges = true;
    }

    if (!hasChanges) {
      toast.info("Tidak ada perubahan untuk disimpan.", {
        className: "custom-toast",
      });
      setIsSubmitting(false);
      return;
    }

    const result = await updateUser(submissionFormData);

    if (componentMounted.current) {
      if (result.success) {
        setFormData((prev) => ({
          ...prev,
          currentPassword: "",
          newPassword: "",
          confirmNewPassword: "",
        }));
        setAvatarFile(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
        setRemoveAvatarFlag(false);
        setErrors({}); // Bersihkan error sisi klien setelah sukses
      }
      // authError akan di-set oleh updateUser jika gagal, dan akan ditampilkan
      setIsSubmitting(false);
    }
  };

  if (authLoading && !user && !componentMounted.current) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-100px)]">
        <DotLoader />
      </div>
    );
  }
  if (!user && !authLoading) {
    return (
      <div className="text-center py-10">
        Gagal memuat data pengguna atau Anda belum login.
      </div>
    );
  }

  const displayAvatarSrc =
    imageLoadError || !avatarPreview
      ? "/images/placeholder-avatar.png"
      : avatarPreview;

  const isTryingToSetNewPassword =
    formData.newPassword || formData.confirmNewPassword;
  const currentPasswordDisabledCond = isManualUser && !isTryingToSetNewPassword;

  return (
    <div
      className={`bg-white p-4 md:p-6 rounded-xl ${
        isUserPage ? "shadow-none md:shadow-md" : "shadow-lg"
      }`}
    >
      <TittleText text="Profil Saya" className="mb-6" />
      {/* Menampilkan authError dari context jika ada dan bukan dari submit yang sedang berjalan */}
      {authError && !isSubmitting && (
        <p className="text-red-500 mb-4 text-xs p-2 bg-red-50 border border-red-200 rounded">
          Error: {authError}
        </p>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Avatar Section */}
        <div className="flex flex-col items-center space-y-3">
          <div className="relative w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden border-2 border-gray-200 bg-gray-100">
            <Image
              src={displayAvatarSrc}
              alt={user?.firstName ? `${user.firstName}'s Avatar` : "Avatar"}
              fill
              sizes="(max-width: 768px) 96px, 128px"
              style={{ objectFit: "cover" }}
              onError={() => {
                if (componentMounted.current) {
                  setImageLoadError(true);
                }
              }}
              priority={true}
              key={avatarPreview || user?.avatar}
            />
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-orange-600 bg-orange-100 border border-orange-200 rounded-full hover:bg-orange-200 transition-colors"
            >
              <UploadCloud size={14} /> Unggah Foto
            </button>
            {(avatarPreview || user?.avatar) && (
              <button
                type="button"
                onClick={removeAvatar}
                className="p-1.5 text-red-500 bg-red-100 border border-red-200 rounded-full hover:bg-red-200 transition-colors"
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

        {/* Name Inputs */}
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
          />
        </div>

        {/* Email Input */}
        <Input
          label="Email"
          id="email"
          name="email"
          type="email"
          value={formData.email}
          error={errors.email} // Meskipun disabled, mungkin ada error dari server terkait email?
          disabled={true}
          readOnly
        />

        {/* Password Section */}
        <div className="border-t border-gray-200 pt-4 md:pt-6">
          <h3 className="text-md font-medium text-gray-700 mb-4 md:mb-6">
            Ubah Kata Sandi
          </h3>

          {isManualUser && ( // Tampilkan field ini HANYA jika user manual (punya password)
            <div className="mb-4 md:mb-6">
              {" "}
              {/* Tambah margin bottom jika field ini tampil */}
              <InputPassword
                label="Kata Sandi Saat Ini"
                id="currentPassword"
                name="currentPassword"
                value={formData.currentPassword}
                onChange={handleChange}
                error={errors.currentPassword}
                placeholder={
                  currentPasswordDisabledCond
                    ? "••••••••"
                    : "Masukkan kata sandi saat ini"
                }
                autoComplete="current-password"
                disabled={currentPasswordDisabledCond}
                inputClassName={
                  currentPasswordDisabledCond
                    ? "bg-gray-50 placeholder-gray-400"
                    : ""
                }
              />
            </div>
          )}
          {/* Jika bukan user manual (misal OAuth), field di atas tidak akan tampil sama sekali */}

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
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isSubmitting || authLoading}
            className="flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-medium text-white transition-colors duration-200 transform bg-gradient-to-br from-red-500 via-orange-400 to-yellow-400 hover:bg-orange-600 hover:from-red-500 hover:to-orange-500 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-70 disabled:cursor-not-allowed"
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
