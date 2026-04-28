import nodemailer from 'nodemailer';

const _port = Number(process.env.SMTP_PORT) || 587;
const _needsAuth = _port !== 25;

export const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: _port,
  secure: _port === 465,
  ...(_needsAuth ? {
    requireTLS: true,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    tls: { rejectUnauthorized: false },
  } : {
    ignoreTLS: true,
  }),
});
