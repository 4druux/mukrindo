//app/reset-password/[token]/page.jsx

import ResetPasswordForm from "@/components/auth/ResetPasswordForm";

export const metadata = {
  title: "Mukrindo Motor | Reset Password",
  description: "Halaman untuk mereset kata sandi pengguna",
};

export default function ResetPassword() {
  return <ResetPasswordForm />;
}
