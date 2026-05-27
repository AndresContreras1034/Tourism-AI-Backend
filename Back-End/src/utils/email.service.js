import nodemailer from "nodemailer";
import { createRequire } from "module";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { generateInvoicePDF } from "./pdf.service.js";
import { logInfo, logError, logSuccess } from "./logger.js";

const require = createRequire(import.meta.url);
const handlebars = require("handlebars");

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_PORT === "465",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: {
    rejectUnauthorized: false, // ✅ fix: self-signed certificate in certificate chain
  },
});

function compileTemplate(templateName, data) {
  const templatePath = path.join(
    __dirname,
    "../templates/emails",
    `${templateName}.hbs`
  );
  const source = fs.readFileSync(templatePath, "utf-8");
  return handlebars.compile(source)(data);
}

async function sendPaymentEmail({ to, subject, template, data }) {
  try {
    const html = compileTemplate(template, {
      ...data,
      amount: (data.amount / 100).toFixed(2),
      currency: (data.currency || "USD").toUpperCase(),
    });
    const pdfBuffer = await generateInvoicePDF(data);

    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to,
      subject,
      html,
      attachments: [
        {
          filename: `factura-${data.invoiceNumber}.pdf`,
          content: pdfBuffer,
          contentType: "application/pdf",
        },
      ],
    });

    logSuccess("EMAIL", `Enviado a ${to} | messageId: ${info.messageId}`);
    return info;
  } catch (error) {
    logError("EMAIL", `Error enviando a ${to}`, error.message);
    throw error;
  }
}

export async function sendPaymentSuccessEmail(data) {
  return sendPaymentEmail({
    to: data.to,
    subject: `✅ Pago confirmado – Factura #${data.invoiceNumber}`,
    template: "payment-success",
    data: { ...data, status: "paid" },
  });
}

export async function sendPaymentFailedEmail(data) {
  return sendPaymentEmail({
    to: data.to,
    subject: `❌ Pago fallido – Referencia #${data.invoiceNumber}`,
    template: "payment-failed",
    data: { ...data, status: "failed" },
  });
}