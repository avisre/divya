import { cloudinary } from "./cloudinary.js";

function sanitizeText(text) {
  return String(text || "")
    .replace(/[^\w\s'-]/g, "")
    .trim()
    .slice(0, 60);
}

export function generateMilestoneCertificateUrl({ userName, days, achievedAt }) {
  const safeName = sanitizeText(userName) || "Devotee";
  const dateText = new Date(achievedAt || Date.now()).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric"
  });

  if (!process.env.CLOUDINARY_CLOUD_NAME) {
    const params = new URLSearchParams({
      name: safeName,
      days: String(days),
      date: dateText
    });
    return `https://om2.app/certificates/milestone?${params.toString()}`;
  }

  return cloudinary.url("om2/certificate_template", {
    secure: true,
    resource_type: "image",
    format: "pdf",
    transformation: [
      { width: 1600, height: 1130, crop: "fill", background: "#FFF8F0" },
      {
        overlay: {
          font_family: "Times New Roman",
          font_size: 74,
          text: "Certificate of Sacred Devotion"
        },
        color: "#B7791F",
        gravity: "north",
        y: 170
      },
      {
        overlay: {
          font_family: "Times New Roman",
          font_size: 58,
          text: safeName
        },
        color: "#5A3A1E",
        gravity: "center",
        y: -30
      },
      {
        overlay: {
          font_family: "Times New Roman",
          font_size: 44,
          text: `${days} consecutive days of prayer`
        },
        color: "#8C6239",
        gravity: "center",
        y: 45
      },
      {
        overlay: {
          font_family: "Times New Roman",
          font_size: 30,
          text: dateText
        },
        color: "#8C6239",
        gravity: "south",
        y: 180
      },
      {
        overlay: {
          font_family: "Times New Roman",
          font_size: 26,
          text: "Om 2 • Bhadra Bhagavathi Temple"
        },
        color: "#8C6239",
        gravity: "south",
        y: 120
      }
    ]
  });
}
