// backend/services/emailService.js
const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_ADDRESS = "Mukrindo Motor <onboarding@resend.dev>";

// Template HTML untuk email OTP
const createOtpEmailHtml = (userName, otp) => {
  const primaryColor = "#f97316";
  return `
    <!DOCTYPE html>
    <html lang="id">
    <head>
      <meta charset="UTF-8">
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap');
        body { margin: 0; padding: 0; background-color: #f4f4f4; font-family: 'Poppins', sans-serif; }
        .container { max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05); border: 1px solid #e2e8f0; }
        .header { background-color: ${primaryColor}; color: #ffffff; padding: 24px; text-align: center; }
        .header h1 { margin: 0; font-size: 24px; }
        .content { padding: 32px; color: #333333; line-height: 1.6; text-align: center; }
        .otp-code { font-size: 36px; font-weight: 700; color: ${primaryColor}; letter-spacing: 8px; margin: 20px 0; padding: 10px; background-color: #f7fafc; border-radius: 6px; display: inline-block; }
        .footer { padding: 24px; text-align: center; font-size: 12px; color: #718096; background-color: #f7fafc; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header"><h1>Kode Verifikasi Login</h1></div>
        <div class="content">
          <h2>Verifikasi Login Anda</h2>
          <p>Halo ${userName},</p>
          <p>Gunakan kode di bawah ini untuk menyelesaikan proses login Anda. Kode ini berlaku selama 10 menit.</p>
          <div class="otp-code">${otp}</div>
        </div>
        <div class="footer">&copy; ${new Date().getFullYear()} Demo Showroom. All rights reserved.</div>
      </div>
    </body>
    </html>
  `;
};

// Fungsi untuk mengirim OTP
exports.sendOtpEmail = async (userEmail, userName, otp) => {
  const htmlContent = createOtpEmailHtml(userName, otp);
  const msg = {
    to: userEmail,
    from: { name: "Demo Showroom", email: process.env.EMAIL_USER },
    subject: `Kode OTP Login Anda: ${otp}`,
    html: htmlContent,
  };
  try {
    const { Resend } = require("resend");
    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      ...msg,
      from: "Demo Showroom <onboarding@resend.dev>",
    });
    console.log("Email OTP berhasil terkirim!");
  } catch (error) {
    console.error("Gagal mengirim email OTP:", error);
    throw new Error("Gagal mengirim email OTP.");
  }
};

const createPasswordResetHtml = (userName, resetLink) => {
  const primaryColor = "#f97316";
  return `
    <!DOCTYPE html>
    <html lang="id">
    <head>
      <meta charset="UTF-8">
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap');
        body { margin: 0; padding: 0; background-color: #f4f4f4; font-family: 'Poppins', sans-serif; }
        .container { max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05); border: 1px solid #e2e8f0; }
        .header { background-color: ${primaryColor}; color: #ffffff; padding: 24px; text-align: center; }
        .header h1 { margin: 0; font-size: 24px; }
        .content { padding: 32px; color: #333333; line-height: 1.6; }
        .cta-button { display: inline-block; background-color: ${primaryColor}; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; text-align: center; margin-top: 20px; }
        .footer { padding: 24px; text-align: center; font-size: 12px; color: #718096; background-color: #f7fafc; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header"><h1>Reset Kata Sandi</h1></div>
        <div class="content">
          <h2>Permintaan Reset Kata Sandi</h2>
          <p>Halo ${userName},</p>
          <p>Kami menerima permintaan untuk mereset kata sandi akun Anda. Silakan klik tombol di bawah ini untuk melanjutkan. Link ini hanya berlaku selama 10 menit.</p>
          <a href="${resetLink}" target="_blank" class="cta-button">Reset Kata Sandi Saya</a>
          <p style="margin-top: 30px;">Jika Anda tidak merasa meminta ini, Anda bisa mengabaikan email ini.</p>
        </div>
        <div class="footer">&copy; ${new Date().getFullYear()} Mukrindo Motor. All rights reserved.</div>
      </div>
    </body>
    </html>
  `;
};

// Fungsi untuk mengirim email reset password
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

// Template HTML untuk notifikasi admin
const createAdminNotificationHtml = (title, data, ctaLink) => {
  const primaryColor = "#f97316";
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <style>
        /* (Gaya CSS Anda yang sebelumnya bisa ditaruh di sini) */
        body { font-family: 'Poppins', sans-serif; }
      </style>
    </head>
    <body>
      <h1>${title}</h1>
      <p>Halo Admin, ada permintaan baru yang masuk ke sistem.</p>
      <p>Model: ${data.model}</p>
      <p>Kontak: ${data.customer}</p>
      <a href="${ctaLink}">Lihat di Dashboard</a>
    </body>
    </html>
  `;
};

exports.sendNotificationEmail = async (notificationType, previewData) => {
  const subjectMap = {
    tradeIn: "Permintaan Tukar Tambah",
    buySell: "Permintaan Jual Mobil",
    notifStock: "Permintaan Notifikasi Stok",
  };

  const title = subjectMap[notificationType] || "Notifikasi Baru";
  const dashboardLink = `${process.env.FRONTEND_URL}/admin`;
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
