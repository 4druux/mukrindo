import ForgotPasswordForm from "@/components/auth/ForgotPasswordForm";

export const metadata = {
  title: "Mukrindo Motor | Forgot Password",
  description: "Halaman untuk meminta link reset kata sandi",
};

export default function ForgotPassword() {
  return <ForgotPasswordForm />;
}
