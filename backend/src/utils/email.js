import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

function createTransporter() {
  if (!process.env.SENDGRID_API_KEY) {
    return nodemailer.createTransport({ jsonTransport: true });
  }

  return nodemailer.createTransport({
    host: "smtp.sendgrid.net",
    port: 587,
    auth: {
      user: "apikey",
      pass: process.env.SENDGRID_API_KEY
    }
  });
}

export async function sendAdminBookingAlertEmail({ booking, user }) {
  const recipients = (process.env.ADMIN_BOOKING_ALERT_EMAILS || "avinashsreekumar007@gmail.com")
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);

  if (!recipients.length) {
    return;
  }

  const html = template({
    title: "New Puja Waitlist Request Received",
    preheader: "A new puja booking request has been filed.",
    heroUrl: booking.templeHeroImage,
    ctaLabel: "Open Admin Dashboard",
    ctaUrl: process.env.ADMIN_DASHBOARD_URL || "http://localhost:5173",
    bodyHtml: `
      <p>A new puja request was filed in Prarthana.</p>
      <p><strong>Reference:</strong> ${booking.bookingReference}<br />
      <strong>Puja:</strong> ${booking.pujaName}<br />
      <strong>Devotee Name:</strong> ${booking.devoteeName}<br />
      <strong>Gothram:</strong> ${booking.gothram}<br />
      <strong>Nakshatra:</strong> ${booking.nakshatra || "Not provided"}<br />
      <strong>Intention:</strong> ${booking.prayerIntention}<br />
      <strong>Amount:</strong> ${booking.presentedCurrency} ${booking.presentedAmount}</p>
      <p><strong>User:</strong> ${user.name} (${user.email})</p>
      <p><strong>Status:</strong> ${booking.status}</p>
    `
  });

  return sendMail({
    to: recipients.join(","),
    subject: `New Puja Request ${booking.bookingReference} - ${booking.pujaName}`,
    html
  });
}

export async function sendContactRequestAlertEmail({ contactRequest }) {
  const recipients = (
    process.env.CONTACT_ALERT_EMAILS ||
    process.env.ADMIN_BOOKING_ALERT_EMAILS ||
    "avinashsreekumar007@gmail.com"
  )
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);

  if (!recipients.length) {
    return;
  }

  const html = template({
    title: "New Support Contact Request",
    preheader: "A new profile contact request was submitted.",
    heroUrl: null,
    ctaLabel: "Open Admin Dashboard",
    ctaUrl: process.env.ADMIN_DASHBOARD_URL || "http://localhost:5173",
    bodyHtml: `
      <p>A support contact request has been submitted in Prarthana.</p>
      <p><strong>Name:</strong> ${contactRequest.name}<br />
      <strong>Email:</strong> ${contactRequest.email}<br />
      <strong>Category:</strong> ${contactRequest.category}<br />
      <strong>Subject:</strong> ${contactRequest.subject}<br />
      <strong>Status:</strong> ${contactRequest.status}<br />
      <strong>Request ID:</strong> ${contactRequest.id}</p>
      <p><strong>Message:</strong><br />${contactRequest.message}</p>
      <p><strong>Context:</strong><br />
      Platform: ${contactRequest.context?.platform || "unknown"}<br />
      App version: ${contactRequest.context?.appVersion || "unknown"}<br />
      Screen: ${contactRequest.context?.screen || "unknown"}<br />
      Booking reference: ${contactRequest.context?.bookingReference || "n/a"}</p>
    `
  });

  return sendMail({
    to: recipients.join(","),
    subject: `New Contact Request - ${contactRequest.category} - ${contactRequest.subject}`,
    html
  });
}

const transporter = createTransporter();

const brandColors = {
  saffron: "#FF6B00",
  gold: "#D9A826",
  warm: "#FFF8F0",
  text: "#32251C"
};

function template({ title, preheader, heroUrl, bodyHtml, ctaLabel, ctaUrl }) {
  return `
  <!doctype html>
  <html>
    <body style="margin:0;background:${brandColors.warm};font-family:Helvetica,Arial,sans-serif;color:${brandColors.text};">
      <div style="display:none;max-height:0;overflow:hidden;">${preheader}</div>
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:${brandColors.warm};padding:24px 0;">
        <tr>
          <td align="center">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:640px;background:#ffffff;border-radius:24px;overflow:hidden;">
              <tr>
                <td style="padding:32px 32px 12px 32px;background:linear-gradient(135deg, ${brandColors.warm}, #fff4db);">
                  <div style="font-size:28px;font-weight:700;color:${brandColors.saffron};">Prarthana</div>
                  <div style="font-size:14px;color:${brandColors.text};opacity:0.8;">Your temple connection, wherever you live</div>
                </td>
              </tr>
              ${heroUrl ? `<tr><td><img src="${heroUrl}" alt="Temple" style="display:block;width:100%;height:auto;" /></td></tr>` : ""}
              <tr>
                <td style="padding:32px;">
                  <h1 style="margin:0 0 16px 0;color:${brandColors.saffron};font-size:28px;line-height:1.2;">${title}</h1>
                  <div style="font-size:16px;line-height:1.7;">${bodyHtml}</div>
                  ${
                    ctaLabel && ctaUrl
                      ? `<p style="margin:32px 0 0 0;"><a href="${ctaUrl}" style="display:inline-block;background:${brandColors.saffron};color:#ffffff;text-decoration:none;padding:14px 22px;border-radius:999px;font-weight:700;">${ctaLabel}</a></p>`
                      : ""
                  }
                </td>
              </tr>
              <tr>
                <td style="padding:24px 32px;background:#fff4db;font-size:13px;line-height:1.6;">
                  Om Shanti 🙏<br />
                  The Prarthana Team<br />
                  Bhadra Bhagavathi Temple, Karunagapally, Kerala
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
  </html>
  `;
}

async function sendMail({ to, subject, html }) {
  return transporter.sendMail({
    from: `${process.env.FROM_NAME || "Prarthana"} <${process.env.FROM_EMAIL || "noreply@prarthana.app"}>`,
    to,
    subject,
    html
  });
}

export async function sendPasswordResetEmail({ to, name, resetUrl }) {
  const html = template({
    title: "Reset your Prarthana password",
    preheader: "Use this secure link to choose a new password.",
    heroUrl: null,
    ctaLabel: "Choose a new password",
    ctaUrl: resetUrl,
    bodyHtml: `
      <p>Namaste ${name || "Devotee"},</p>
      <p>A password reset was requested for your Prarthana account.</p>
      <p>This secure link remains valid for 60 minutes. If you did not request a reset, you can ignore this email and your current password will continue to work.</p>
      <p style="word-break:break-word;"><strong>Reset link:</strong><br /><a href="${resetUrl}">${resetUrl}</a></p>
    `
  });

  return sendMail({
    to,
    subject: "Reset your Prarthana password",
    html
  });
}

export async function sendWaitlistConfirmationEmail({ to, name, booking, ctaUrl }) {
  const html = template({
    title: `Your Puja Waitlist Booking - ${booking.bookingReference} 🙏`,
    preheader: "Your puja waitlist booking has been received.",
    heroUrl: booking.heroImage,
    ctaLabel: "View Booking in App",
    ctaUrl,
    bodyHtml: `
      <p>Dear ${name},</p>
      <p>Your puja booking has been received. 🙏</p>
      <p><strong>Booking Reference:</strong> ${booking.bookingReference}<br />
      <strong>Puja:</strong> ${booking.pujaName}<br />
      <strong>Temple:</strong> Bhadra Bhagavathi Temple, Karunagapally, Kerala<br />
      <strong>Devotee Name:</strong> ${booking.devoteeName}<br />
      <strong>Nakshatra:</strong> ${booking.nakshatra || "To be shared"}<br />
      <strong>Prayer Intention:</strong> ${booking.prayerIntention}</p>
      <p><strong>Amount Charged:</strong> ${booking.presentedCurrency} ${booking.presentedAmount}</p>
      <p>Estimated wait: approximately ${booking.estimatedWaitWeeks} weeks. We will notify you by email and app notification when your puja date is confirmed.</p>
    `
  });
  return sendMail({ to, subject: `Your Puja Waitlist Booking - ${booking.bookingReference} 🙏`, html });
}

export async function sendPujaDateConfirmedEmail({ to, booking, ctaUrl }) {
  const html = template({
    title: `Your Puja Date is Confirmed - ${booking.pujaName} 🪔`,
    preheader: "Your puja has been scheduled.",
    heroUrl: booking.heroImage,
    ctaLabel: "View Booking in App",
    ctaUrl,
    bodyHtml: `
      <p>Your puja has been scheduled.</p>
      <p><strong>Date:</strong> ${booking.scheduledDate}<br />
      <strong>Time:</strong> ${booking.scheduledTimeIST} IST (${booking.userLocalTime})<br />
      <strong>Temple:</strong> Bhadra Bhagavathi Temple, Karunagapally</p>
      <p>You will receive a video recording within 48 hours of completion.</p>
    `
  });
  return sendMail({ to, subject: `Your Puja Date is Confirmed - ${booking.pujaName} 🪔`, html });
}

export async function sendVideoReadyEmail({ to, booking, ctaUrl }) {
  const html = template({
    title: "Your Sacred Puja Video is Ready 🎬",
    preheader: "Your sacred puja recording is ready to watch.",
    heroUrl: booking.videoThumbnailUrl || booking.heroImage,
    ctaLabel: "Watch Your Sacred Video",
    ctaUrl,
    bodyHtml: `
      <p>Your ${booking.pujaName} has been performed at Bhadra Bhagavathi Temple, Karunagapally.</p>
      <p>Your sacred video is ready to watch. This recording is your personal spiritual keepsake - your prayers, offered at the feet of the Goddess, preserved for you forever.</p>
    `
  });
  return sendMail({ to, subject: "Your Sacred Puja Video is Ready 🎬", html });
}

export async function sendPaymentFailedEmail({ to, booking, ctaUrl }) {
  const html = template({
    title: "Action Required - Payment Issue for Your Puja Booking",
    preheader: "We were unable to process your payment.",
    heroUrl: booking.heroImage,
    ctaLabel: "Update Payment Method",
    ctaUrl,
    bodyHtml: `
      <p>We were unable to process payment for your ${booking.pujaName} booking.</p>
      <p>Please update your payment method to secure your waitlist spot.</p>
    `
  });
  return sendMail({ to, subject: "Action Required - Payment Issue for Your Puja Booking", html });
}

export async function sendCardExpiryReminderEmail({ to, booking, ctaUrl }) {
  const html = template({
    title: "Please Update Your Card Before Your Puja",
    preheader: "Your card on file may have expired before the scheduled puja date.",
    heroUrl: booking.heroImage,
    ctaLabel: "Update Payment Method",
    ctaUrl,
    bodyHtml: `
      <p>Your card on file ends in ${booking.cardLast4 || "XXXX"} and may have expired.</p>
      <p>Please update your payment method before ${booking.scheduledDate} to avoid cancellation.</p>
    `
  });
  return sendMail({ to, subject: "Please Update Your Card Before Your Puja", html });
}

export async function sendGiftReceivedEmail({
  to,
  recipientName,
  giftedByName,
  pujaName,
  templeImage,
  personalMessage,
  ctaUrl
}) {
  const html = template({
    title: `${giftedByName} has offered a sacred puja in your name 🙏`,
    preheader: "A sacred puja has been offered for you.",
    heroUrl: templeImage,
    ctaLabel: "View Puja in App",
    ctaUrl,
    bodyHtml: `
      <p>Dear ${recipientName || "Devotee"},</p>
      <p>${giftedByName} has booked a <strong>${pujaName}</strong> at Bhadra Bhagavathi Temple, Karunagapally, Kerala in your name.</p>
      ${personalMessage ? `<p style="padding:12px 14px;border-left:3px solid ${brandColors.gold};background:#fff9ef;">"${personalMessage}"</p>` : ""}
      <p>You will receive updates in the app as the puja moves from waitlist to completion, including the sacred video once ready.</p>
      <p>With love and blessings 🙏</p>
    `
  });
  return sendMail({
    to,
    subject: `${giftedByName} has offered a sacred puja in your name 🙏`,
    html
  });
}
