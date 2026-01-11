import nodemailer from 'nodemailer';

let transporter;

export const initEmailTransporter = () => {
  if (transporter) return transporter;

  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_SECURE } = process.env;

  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) {
    console.warn(
      '[email] SMTP credentials missing. OTP emails will fail. Please set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS.'
    );
  }

  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT || 587),
    secure: SMTP_SECURE === 'true', // true for 465, false for others
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });

  return transporter;
};

export const sendOtpEmail = async ({ to, code }) => {
  if (!transporter) {
    initEmailTransporter();
  }

  const appName = process.env.APP_NAME || 'E-Attend';
  const fromEmail = process.env.MAIL_FROM || process.env.SMTP_USER;

  const mailOptions = {
    from: `"${appName} OTP" <${fromEmail}>`,
    to,
    subject: `${appName} Login OTP`,
    text: `Your ${appName} OTP is ${code}. It expires in 10 minutes.`,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2>${appName} Login OTP</h2>
        <p>Your one-time password is:</p>
        <p style="font-size: 24px; font-weight: bold; letter-spacing: 4px;">${code}</p>
        <p>This code will expire in 10 minutes.</p>
        <p>If you did not request this, please ignore.</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

