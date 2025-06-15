// backend/services/emailService.js
const sgMail = require("@sendgrid/mail");

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Fungsi untuk membuat template HTML email
const createEmailHtml = (title, data, ctaLink) => {
  const primaryColor = "#f97316";

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap');
        body {
          margin: 0;
          padding: 0;
          background-color: #f4f4f4;
          font-family: 'Poppins', sans-serif;
        }
        .container {
          max-width: 600px;
          margin: 20px auto;
          background-color: #ffffff;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 4px 15px rgba(0,0,0,0.05);
          border: 1px solid #e2e8f0;
        }
        .header {
          background-color: ${primaryColor};
          color: #ffffff;
          padding: 24px;
          text-align: center;
        }
        .header h1 {
          margin: 0;
          font-size: 24px;
        }
        .content {
          padding: 32px;
          color: #333333;
          line-height: 1.6;
        }
        .content h2 {
          color: #1a202c;
          margin-top: 0;
        }
        .details-table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 20px;
          margin-bottom: 30px;
        }
        .details-table th, .details-table td {
          padding: 12px;
          text-align: left;
          border-bottom: 1px solid #e2e8f0;
        }
        .details-table th {
          background-color: #f7fafc;
          font-weight: 600;
          color: #4a5568;
        }
        .cta-button {
          display: inline-block;
          background-color: ${primaryColor};
          color: #ffffff;
          padding: 12px 24px;
          text-decoration: none;
          border-radius: 6px;
          font-weight: 600;
          text-align: center;
        }
        .footer {
          padding: 24px;
          text-align: center;
          font-size: 12px;
          color: #718096;
          background-color: #f7fafc;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Demo Showroom</h1>
        </div>
        <div class="content">
          <h2>${title}</h2>
          <p>Halo Admin, ada permintaan baru yang masuk ke sistem. Berikut rinciannya:</p>
          <table class="details-table">
            <tr>
              <th style="width: 30%;">Model Mobil</th>
              <td>${data.model}</td>
            </tr>
            <tr>
              <th>Kontak Pelanggan</th>
              <td>${data.customer}</td>
            </tr>
          </table>
          <a href="${ctaLink}" target="_blank" class="cta-button">
            Lihat Detail di Dashboard
          </a>
          <p style="margin-top: 30px;">Mohon untuk segera ditindaklanjuti. Terima kasih.</p>
        </div>
        <div class="footer">
          &copy; ${new Date().getFullYear()} Demo Showroom. All rights reserved.
        </div>
      </div>
    </body>
    </html>
  `;
};

exports.sendNotificationEmail = async (notificationType, previewData) => {
  console.log("Mencoba mengirim email dengan SendGrid...");

  const subjectMap = {
    tradeIn: "Permintaan Tukar Tambah",
    buySell: "Permintaan Jual Mobil",
    notifStock: "Permintaan Notifikasi Stok",
  };

  const title = subjectMap[notificationType];
  const dashboardLink = "https://mukrindo-motor.vercel.app/admin";

  const htmlContent = createEmailHtml(title, previewData, dashboardLink);

  const msg = {
    to: process.env.ADMIN_EMAIL,
    from: {
      name: "Mukrindo Motor Notifikasi",
      email: process.env.EMAIL_USER,
    },
    replyTo: process.env.ADMIN_EMAIL,
    subject: title,
    html: htmlContent,
  };

  try {
    await sgMail.send(msg);
    console.log("Email notifikasi SendGrid berhasil terkirim!");
  } catch (error) {
    console.error("Gagal mengirim email dengan SendGrid:");
    if (error.response) {
      console.error(error.response.body);
    } else {
      console.error(error);
    }
  }
};
