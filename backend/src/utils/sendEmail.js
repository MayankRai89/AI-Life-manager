import nodemailer from "nodemailer";

/**
 * Sends an email using SMTP or logs to console in development when SMTP is not configured.
 * @param {Object} options
 * @param {string} options.to
 * @param {string} options.subject
 * @param {string} options.text
 * @param {string} [options.html]
 */
export async function sendEmail({ to, subject, text, html }) {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, EMAIL_FROM, NODE_ENV } =
    process.env;

  const isSmtpConfigured = Boolean(
    SMTP_HOST && SMTP_PORT && SMTP_USER && SMTP_PASS
  );

  if (!isSmtpConfigured) {
    if (NODE_ENV !== "production") {
      console.log("\n================ [DEV EMAIL SIMULATOR] ================");
      console.log(`To: ${to}`);
      console.log(`Subject: ${subject}`);
      console.log(`Body:\n${text}`);
      console.log("=========================================================\n");
      return { simulated: true };
    }
    // Never leak or silently pass unconfigured email in production
    throw new Error("SMTP email transport is not configured on this server.");
  }

  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: Number(SMTP_PORT) === 465, // true for 465, false for 587 or others
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });

  const mailOptions = {
    from: EMAIL_FROM || "AI Life Manager <no-reply@ailifemanager.app>",
    to,
    subject,
    text,
    html: html || text,
  };

  return await transporter.sendMail(mailOptions);
}

export default sendEmail;
