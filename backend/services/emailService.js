const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

exports.sendNotificationEmail = async (notificationType, previewData) => {
  const subjectMap = {
    tradeIn: "Permintaan Trade-In Baru",
    buySell: "Permintaan Jual Mobil Baru",
    notifStock: "Permintaan Notifikasi Stok Baru",
  };

  const htmlContent = `
    <h2>${subjectMap[notificationType]}</h2>
    <p><strong>Model:</strong> ${previewData.model}</p>
    <p><strong>Customer:</strong> ${previewData.customer}</p>
    <p>Silakan login ke dashboard admin untuk melihat detail lengkap.</p>
  `;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: process.env.ADMIN_EMAIL,
    subject: subjectMap[notificationType],
    html: htmlContent,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Email notifikasi terkirim");
  } catch (error) {
    console.error("Gagal mengirim email notifikasi:", error);
    // Tidak throw error agar tidak mengganggu flow utama
  }
};
