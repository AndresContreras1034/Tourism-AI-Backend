import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Paleta de colores Tourism AI
const C = {
  bgDark: "#12131C",
  bgMid: "#1A1B2E",
  bgAccent: "#261C39",
  borderCyan: "#1C3B3F",
  cyan: "#5BE3EC",
  orange: "#FFA827",
  purple: "#4754BC",
  pink: "#B44666",
  white: "#FFFFFF",
  whiteDim: "#C8CDE8",
  whiteMuted: "#8B90B8",
  divider: "#231D2E",
  rowAlt: "#16172A",
  success: "#22C55E",
  error: "#EF4444",
  successBg: "#0F2A1A",
  errorBg: "#2A0F0F",
};

// ✅ FIX: PDFKit safe drawing
function fillRect(doc, x, y, w, h, hex) {
  doc.save().fillColor(hex).rect(x, y, w, h).fill().restore();
}

function strokeRect(doc, x, y, w, h, hex, lw = 0.5) {
  doc.save().strokeColor(hex).lineWidth(lw).rect(x, y, w, h).stroke().restore();
}

function hline(doc, x1, x2, y, hex, lw = 0.5) {
  doc.save().strokeColor(hex).lineWidth(lw).moveTo(x1, y).lineTo(x2, y).stroke().restore();
}

function txt(doc, text, x, y, hex, size, font = "Helvetica", opts = {}) {
  doc.font(font).fontSize(size).fillColor(hex).text(text, x, y, opts);
}

export async function generateInvoicePDF(data) {
  const {
    invoiceNumber,
    userName,
    to,
    plan,
    amount,
    currency,
    paymentDate,
    status,
    failureReason,
  } = data;

  const isPaid = status === "paid";
  const formattedAmount = (amount / 100).toFixed(2);
  const currencyUpper = (currency || "USD").toUpperCase();

  const logoPath = path.join(__dirname, "../assets/Logo.png");
  const hasLogo = fs.existsSync(logoPath);

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: "A4",
      margin: 0,
      info: {
        Title: `Factura ${invoiceNumber} - Tourism AI`,
        Author: "Tourism AI",
      },
    });

    const chunks = [];
    doc.on("data", (c) => chunks.push(c));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const PW = 595.28;
    const PH = 841.89;
    const M = 40;

    // =========================
    // BACKGROUND
    // =========================
    fillRect(doc, 0, 0, PW, PH, C.bgDark);

    // =========================
    // HEADER
    // =========================
    fillRect(doc, 0, 0, PW, 110, C.bgMid);
    hline(doc, 0, PW, 110, C.divider, 1);
    fillRect(doc, 0, 0, 4, 110, C.cyan);

    if (hasLogo) {
      doc.image(logoPath, M, 18, { height: 50 });
    } else {
      txt(doc, "✦ TOURISM", M, 22, C.cyan, 20, "Helvetica-Bold");
      txt(doc, "AI", M + 116, 22, C.orange, 20, "Helvetica-Bold");
      txt(doc, "Plataforma de viajes inteligentes", M, 50, C.whiteMuted, 9);
    }

    const badgeW = 140;
    const badgeX = PW - M - badgeW;

    fillRect(doc, badgeX, 30, badgeW, 28, isPaid ? C.successBg : C.errorBg);
    strokeRect(doc, badgeX, 30, badgeW, 28, isPaid ? C.success : C.error, 0.8);

    txt(
      doc,
      isPaid ? "✓ PAGO CONFIRMADO" : "✗ PAGO FALLIDO",
      badgeX + 10,
      40,
      isPaid ? C.success : C.error,
      8,
      "Helvetica-Bold",
      { width: badgeW - 20, align: "center" }
    );

    txt(doc, isPaid ? "FACTURA DE VENTA" : "COMPROBANTE DE COBRO", M, 76, C.whiteDim, 9);

    // =========================
    // INFO HEADER
    // =========================
    let Y = 130;

    txt(doc, "NÚMERO DE DOCUMENTO", M, Y, C.whiteMuted, 7);
    txt(doc, invoiceNumber, M, Y + 12, C.cyan, 15, "Helvetica-Bold");

    const col2X = PW / 2 + 20;
    txt(doc, "FECHA DE EMISIÓN", col2X, Y, C.whiteMuted, 7);
    txt(doc, paymentDate, col2X, Y + 12, C.white, 13, "Helvetica-Bold");

    Y += 50;
    hline(doc, M, PW - M, Y, C.divider, 0.8);

    // =========================
    // EMISOR / RECEPTOR
    // =========================
    Y += 20;

    txt(doc, "EMITIDO POR", M, Y, C.whiteMuted, 7);
    Y += 14;
    txt(doc, "Tourism AI SaaS", M, Y, C.white, 11, "Helvetica-Bold");
    Y += 14;
    txt(doc, "soporte@tourism-ai.com", M, Y, C.whiteDim, 9);

    const recX = PW / 2 + 20;
    let recY = Y - 40;

    txt(doc, "FACTURADO A", recX, recY, C.whiteMuted, 7);
    recY += 14;
    txt(doc, userName || "Cliente", recX, recY, C.white, 11, "Helvetica-Bold");
    recY += 14;
    txt(doc, to, recX, recY, C.whiteDim, 9);

    Y += 30;
    hline(doc, M, PW - M, Y, C.divider, 0.8);

    // =========================
    // TABLE
    // =========================
    Y += 20;

    const tableW = PW - M * 2;

    fillRect(doc, M, Y, tableW, 26, C.bgAccent);
    strokeRect(doc, M, Y, tableW, 26, C.purple, 0.5);

    const cDesc = M + 12;
    const cPlan = M + 200;
    const cQty = M + 320;
    const cPrice = M + 420;

    txt(doc, "DESCRIPCIÓN", cDesc, Y + 8, C.whiteMuted, 7);
    txt(doc, "PLAN", cPlan, Y + 8, C.whiteMuted, 7);
    txt(doc, "TOKENS", cQty, Y + 8, C.whiteMuted, 7);
    txt(doc, "MONTO", cPrice, Y + 8, C.whiteMuted, 7);

    Y += 26;

    fillRect(doc, M, Y, tableW, 34, C.rowAlt);
    strokeRect(doc, M, Y, tableW, 34, C.divider, 0.5);

    txt(doc, "Suscripción de tokens", cDesc, Y + 10, C.white, 9, "Helvetica-Bold");
    txt(doc, plan || "—", cPlan, Y + 18, C.cyan, 9, "Helvetica-Bold");
    txt(doc, String(data.tokens || "—"), cQty, Y + 18, C.orange, 9, "Helvetica-Bold");
    txt(doc, `${currencyUpper} ${formattedAmount}`, cPrice, Y + 18, C.white, 9, "Helvetica-Bold");

    Y += 34;

    // TOTAL
    fillRect(doc, M, Y, tableW, 36, C.bgAccent);
    strokeRect(doc, M, Y, tableW, 36, C.cyan, 0.6);

    txt(doc, "TOTAL", cPrice - 60, Y + 11, C.cyan, 10, "Helvetica-Bold");
    txt(doc, `${currencyUpper} ${formattedAmount}`, cPrice, Y + 11, C.cyan, 14, "Helvetica-Bold");

    Y += 36;

    // =========================
    // FOOTER
    // =========================
    const footerY = PH - 70;

    hline(doc, 0, PW, footerY, C.divider, 1);
    fillRect(doc, 0, footerY, PW, PH - footerY, C.bgMid);
    fillRect(doc, 0, footerY, 4, PH - footerY, C.cyan);

    txt(
      doc,
      "Documento generado automáticamente por Tourism AI",
      M,
      footerY + 14,
      C.whiteMuted,
      8,
      "Helvetica",
      { width: PW - M * 2, align: "center" }
    );

    txt(
      doc,
      "soporte@tourism-ai.com · tourism-ai.com · © 2026",
      M,
      footerY + 30,
      C.whiteMuted,
      7,
      "Helvetica",
      { width: PW - M * 2, align: "center" }
    );

    doc.end();
  });
}