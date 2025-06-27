// backend/services/emailService.js
const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_ADDRESS = `Mukrindo Motor <${process.env.RESEND_SENDER_EMAIL || "onboarding@resend.dev"}>`;

const createOtpEmailHtml = (userName, otp) => {
  const currentDate = new Date().toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  const currentYear = new Date().getFullYear();
  return `
<!DOCTYPE html>
<html lang="id">

<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>OTP - Mukrindo Motor</title>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet" />
</head>

<body
    style="margin:0;padding:0;background-color:#f1f5f9;font-family:'Poppins',sans-serif;font-size:14px;color:#1e293b;">
    <div style="max-width:680px;margin:0 auto;background-color:#ffffff;">

        <!-- HEADER -->
        <div
            style="background:linear-gradient(135deg,#d35800,#fcac6b);padding:24px 30px;border-bottom-left-radius:40px;border-bottom-right-radius:40px;text-align:left;color:white;">
            <table width="100%">
                <tr>
                    <td align="left">
                        <img src="https://res.cloudinary.com/do1oxpnak/image/upload/v1750925034/mm-logo-white_g8aqoq.png"
                            height="28" alt="Mukrindo Motor Logo" />
                    </td>
                    <td align="right" style="font-size:14px;color:#ffffff;">
                        26 Jun 2025
                    </td>
                </tr>
            </table>
        </div>

        <!-- CONTENT -->
        <div style="max-width:600px;margin:40px auto;padding:40px 30px;text-align:center;">
            <h2 style="margin:0;font-size:22px;font-weight:600;color:#1e293b;">Kode OTP Anda</h2>
            <p style="margin-top:18px;color:#1e293b;">Halo ${userName},</p>
            <p style="margin-top:16px;font-weight:400;color:#64748b;line-height:1.6;">
                Gunakan kode berikut untuk masuk ke akun administrator Mukrindo Motor.<br />
                Kode ini hanya berlaku selama <strong style="color:#f97316;">10 menit</strong>.<br />
                Jangan bagikan kepada siapa pun.
            </p>
            <p style="margin-top:40px;font-size:36px;font-weight:700;letter-spacing:12px;color:#f97316;">
                ${otp.split("").join(" ")}
            </p>
        </div>


        <!-- FOOTER -->
        <div style="max-width:480px;margin:0 auto;text-align:center;border-top:1px solid #e2e8f0;padding:30px 20px;">
            <p style="font-size:16px;font-weight:500;margin-top:0;margin-bottom:8px;color:#1e293b;">Mukrindo Motor</p>
            <p style="margin:0;color:#64748b;">Jl. Sumatra Jl. H. Mukri, Ciputat, Tangerang Selatan</p>
            <div style="margin-top:16px;">
                <a href="#"><img width="28"
                        src="https://res.cloudinary.com/do1oxpnak/image/upload/v1750925334/icons8-facebook-96_kiicng.png"
                        alt="Facebook" /></a>
                <a href="#" style="margin-left:10px;"><img width="28"
                        src="https://res.cloudinary.com/do1oxpnak/image/upload/v1750925333/icons8-instagram-96_jqql1o.png"
                        alt="Instagram" /></a>
                <a href="https://www.tiktok.com/@garasi_mukrindomotor?_t=ZS-8xWRn18vCMi&_r=1" target="_blank"
                    style="margin-left:10px;"><img width="28"
                        src="https://res.cloudinary.com/do1oxpnak/image/upload/v1750925335/icons8-tiktok-96_wywn6i.png"
                        alt="TikTok" /></a>
            </div>
            <p style="margin-top:20px;font-size:12px;color:#64748b;">&copy; ${currentYear} Mukrindo Motor. All rights
                reserved.</p>
        </div>

    </div>
</body>
</html>
`;
};

const createPasswordResetHtml = (userName, resetLink) => {
  const currentDate = new Date().toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  const currentYear = new Date().getFullYear();

  return `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Reset Kata Sandi - Mukrindo Motor</title>
  <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet" />
</head>
<body style="margin:0;padding:0;background-color:#f1f5f9;font-family:'Poppins',sans-serif;font-size:14px;color:#1e293b;">
  <div style="max-width:680px;margin:0 auto;background-color:#ffffff;">

    <!-- HEADER -->
    <div style="background:linear-gradient(135deg,#d35800,#fcac6b);padding:24px 30px;border-bottom-left-radius:40px;border-bottom-right-radius:40px;text-align:left;color:white;">
      <table width="100%">
        <tr>
          <td align="left">
            <img src="https://res.cloudinary.com/do1oxpnak/image/upload/v1750925034/mm-logo-white_g8aqoq.png"
              height="28" alt="Mukrindo Motor Logo" />
          </td>
          <td align="right" style="font-size:14px;color:#ffffff;">
            ${currentDate}
          </td>
        </tr>
      </table>
    </div>

    <!-- CONTENT -->
    <div style="max-width:600px;margin:40px auto;padding:40px 30px;text-align:center;">
      <h2 style="margin:0;font-size:22px;font-weight:600;color:#1e293b;">Reset Kata Sandi Anda</h2>
      <p style="margin-top:18px;color:#1e293b;">Halo ${userName},</p>
      <p style="margin-top:16px;font-weight:400;color:#64748b;line-height:1.6;">
        Kami menerima permintaan untuk mengatur ulang kata sandi akun Anda. Silakan klik tombol di bawah ini untuk melanjutkan.
      </p>
      <div style="margin:30px 0;">
        <a href="${resetLink}" target="_blank"
          style="background-color:#f97316;color:#ffffff;padding:14px 28px;text-decoration:none;border-radius:8px;font-weight:600;display:inline-block;font-size:16px;">
          Reset Kata Sandi
        </a>
      </div>
      <p style="font-weight:400;color:#64748b;line-height:1.6;">
        Tautan ini hanya berlaku selama <strong style="color:#f97316;">10 menit</strong>. Jika Anda tidak merasa meminta ini, Anda bisa mengabaikan email ini dengan aman.
      </p>
    </div>

    <!-- FOOTER -->
    <div style="max-width:480px;margin:0 auto;text-align:center;border-top:1px solid #e2e8f0;padding:30px 20px;">
      <p style="font-size:16px;font-weight:500;margin-top:0;margin-bottom:8px;color:#1e293b;">Mukrindo Motor</p>
      <p style="margin:0;color:#64748b;">Jl. Sumatra Jl. H. Mukri, Ciputat, Tangerang Selatan</p>
      <div style="margin-top:16px;">
        <a href="#"><img width="28"
            src="https://res.cloudinary.com/do1oxpnak/image/upload/v1750925334/icons8-facebook-96_kiicng.png"
            alt="Facebook" /></a>
        <a href="#" style="margin-left:10px;"><img width="28"
            src="https://res.cloudinary.com/do1oxpnak/image/upload/v1750925333/icons8-instagram-96_jqql1o.png"
            alt="Instagram" /></a>
        <a href="https://www.tiktok.com/@garasi_mukrindomotor?_t=ZS-8xWRn18vCMi&_r=1" target="_blank"
          style="margin-left:10px;"><img width="28"
            src="https://res.cloudinary.com/do1oxpnak/image/upload/v1750925335/icons8-tiktok-96_wywn6i.png"
            alt="TikTok" /></a>
      </div>
      <p style="margin-top:20px;font-size:12px;color:#64748b;">&copy; ${currentYear} Mukrindo Motor. All rights reserved.</p>
    </div>

  </div>
</body>
</html>
`;
};

const createAdminNotificationHtml = (title, data, ctaLink) => {
  const currentDate = new Date().toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  const currentYear = new Date().getFullYear();

  return `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Notifikasi Admin - Mukrindo Motor</title>
  <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap" rel="stylesheet" />
</head>
<body style="margin:0;padding:0;background-color:#f1f5f9;font-family:'Poppins',sans-serif;font-size:14px;color:#1e293b;">
  <div style="max-width:680px;margin:0 auto;background-color:#ffffff;">

    <!-- HEADER -->
    <div style="background:linear-gradient(135deg,#d35800,#fcac6b);padding:24px 30px;border-bottom-left-radius:40px;border-bottom-right-radius:40px;text-align:left;color:white;">
      <table width="100%">
        <tr>
          <td align="left">
            <img src="https://res.cloudinary.com/do1oxpnak/image/upload/v1750925034/mm-logo-white_g8aqoq.png"
              height="28" alt="Mukrindo Motor Logo" />
          </td>
          <td align="right" style="font-size:14px;color:#ffffff;">
            ${currentDate}
          </td>
        </tr>
      </table>
    </div>

    <!-- CONTENT -->
    <div style="max-width:600px;margin:40px auto;padding:40px 30px;text-align:left;">
      <h2 style="margin:0 0 24px 0;font-size:22px;font-weight:600;color:#1e293b;text-align:center;">Notifikasi Admin Baru</h2>

      <div style="margin-bottom:24px;border-bottom:1px solid #e2e8f0;padding-bottom:16px;">
        <p style="margin:0 0 4px 0;font-size:14px;color:#64748b;">Jenis Notifikasi</p>
        <p style="margin:0;font-size:16px;font-weight:600;color:#1e293b;">${title}</p>
      </div>

      <div style="margin-bottom:24px;border-bottom:1px solid #e2e8f0;padding-bottom:16px;">
        <p style="margin:0 0 4px 0;font-size:14px;color:#64748b;">Detail Mobil</p>
        <p style="margin:0;font-size:16px;font-weight:600;color:#1e293b;">${data.model}</p>
      </div>

      <div style="margin-bottom:32px;">
        <p style="margin:0 0 4px 0;font-size:14px;color:#64748b;">Info Pelanggan</p>
        <p style="margin:0;font-size:16px;font-weight:600;color:#1e293b;">${data.customer}</p>
      </div>

      <div style="text-align:center;">
        <a href="${ctaLink}" target="_blank"
          style="background-color:#f97316;color:#ffffff;padding:14px 28px;text-decoration:none;border-radius:8px;font-weight:600;display:inline-block;font-size:16px;">
          Lihat di Dashboard
        </a>
      </div>
    </div>

    <!-- FOOTER -->
    <div style="max-width:480px;margin:40px auto 0;text-align:center;border-top:1px solid #e2e8f0;padding:30px 20px;">
      <p style="font-size:16px;font-weight:500;margin-top:0;margin-bottom:8px;color:#1e293b;">Mukrindo Motor</p>
      <p style="margin:0;color:#64748b;">Jl. Sumatra Jl. H. Mukri, Ciputat, Tangerang Selatan</p>
      <div style="margin-top:16px;">
        <a href="#"><img width="28"
            src="https://res.cloudinary.com/do1oxpnak/image/upload/v1750925334/icons8-facebook-96_kiicng.png"
            alt="Facebook" /></a>
        <a href="#" style="margin-left:10px;"><img width="28"
            src="https://res.cloudinary.com/do1oxpnak/image/upload/v1750925333/icons8-instagram-96_jqql1o.png"
            alt="Instagram" /></a>
        <a href="https://www.tiktok.com/@garasi_mukrindomotor?_t=ZS-8xWRn18vCMi&_r=1" target="_blank"
          style="margin-left:10px;"><img width="28"
            src="https://res.cloudinary.com/do1oxpnak/image/upload/v1750925335/icons8-tiktok-96_wywn6i.png"
            alt="TikTok" /></a>
      </div>
      <p style="margin-top:20px;font-size:12px;color:#64748b;">&copy; ${currentYear} Mukrindo Motor. All rights reserved.</p>
    </div>

  </div>
</body>
</html>
`;
};

exports.sendOtpEmail = async (userEmail, userName, otp) => {
  const htmlContent = createOtpEmailHtml(userName, otp);
  try {
    await resend.emails.send({
      from: FROM_ADDRESS,
      to: [userEmail],
      subject: `Kode Verifikasi Anda: ${otp}`,
      html: htmlContent,
    });
    console.log(`Email OTP berhasil dikirim ke ${userEmail}`);
  } catch (error) {
    console.error("Gagal mengirim email OTP:", error);
    throw new Error("Gagal mengirim email OTP.");
  }
};

exports.sendPasswordResetEmail = async (userEmail, userName, resetUrl) => {
  const htmlContent = createPasswordResetHtml(userName, resetUrl);
  try {
    const { data, error } = await resend.emails.send({
      from: FROM_ADDRESS,
      to: [userEmail],
      subject: "Permintaan Reset Kata Sandi",
      html: htmlContent,
    });
    if (error) {
      console.error("Gagal mengirim email dengan Resend:", error);
      throw new Error("Gagal mengirim email reset password.");
    }
    console.log(
      `Email reset password terkirim ke ${userEmail}. ID: ${data.id}`
    );
  } catch (error) {
    console.error("Error saat mencoba mengirim email:", error);
    throw error;
  }
};

exports.sendNotificationEmail = async (notificationType, previewData) => {
  const subjectMap = {
    tradeIn: "Permintaan Tukar Tambah",
    buySell: "Permintaan Jual Mobil",
    notifStock: "Permintaan Notifikasi Stok",
  };
  const title = subjectMap[notificationType] || "Notifikasi Baru";
  const dashboardLink = `${process.env.FRONTEND_URL}/admin/layanan-produk`;
  const htmlContent = createAdminNotificationHtml(
    title,
    previewData,
    dashboardLink
  );
  try {
    await resend.emails.send({
      from: FROM_ADDRESS,
      to: [process.env.ADMIN_EMAIL],
      subject: `Notifikasi Baru: ${title}`,
      html: htmlContent,
    });
    console.log(`Email notifikasi admin terkirim untuk: ${title}`);
  } catch (error) {
    console.error(
      "Gagal mengirim email notifikasi admin dengan Resend:",
      error
    );
  }
};
