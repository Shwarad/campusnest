/**
 * otp.ts — OTP generation, hashing, and delivery helpers.
 *
 * Delivery channels:
 *   - SMS via Twilio (production)
 *   - Email via Nodemailer / SMTP (production)
 *   - Console log (local dev when credentials absent)
 */

import bcrypt from 'bcryptjs';
import crypto from 'crypto';

// ── Generate a 6-digit OTP ────────────────────────────────────────────────────

export function generateOtp(): string {
  return String(crypto.randomInt(100_000, 999_999));
}

export async function hashOtp(otp: string): Promise<string> {
  return bcrypt.hash(otp, 10);
}

export async function verifyOtp(otp: string, hash: string): Promise<boolean> {
  return bcrypt.compare(otp, hash);
}

export function otpExpiry(minutes = 10): Date {
  return new Date(Date.now() + minutes * 60 * 1000);
}

// ── SMS via Twilio ────────────────────────────────────────────────────────────

export async function sendSmsOtp(phone: string, otp: string): Promise<void> {
  const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER } = process.env;

  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_PHONE_NUMBER) {
    // Dev fallback — log to console
    console.info(`[OTP-SMS] Phone: ${phone} → OTP: ${otp}  (Twilio not configured)`);
    return;
  }

  // Dynamic import so the module only loads when Twilio is configured
  const twilio = await import('twilio');
  const client = twilio.default(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
  await client.messages.create({
    body: `Your CampusNest verification code is ${otp}. Valid for 10 minutes. Do not share it with anyone.`,
    from: TWILIO_PHONE_NUMBER,
    to:   phone,
  });
}

// ── Email OTP via Nodemailer ──────────────────────────────────────────────────

export async function sendEmailOtp(email: string, otp: string, name = 'there'): Promise<void> {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM } = process.env;

  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    console.info(`[OTP-EMAIL] To: ${email} → OTP: ${otp}  (SMTP not configured)`);
    return;
  }

  const nodemailer = await import('nodemailer');
  const transporter = nodemailer.default.createTransport({
    host:   SMTP_HOST,
    port:   Number(SMTP_PORT ?? 587),
    secure: Number(SMTP_PORT ?? 587) === 465,
    auth:   { user: SMTP_USER, pass: SMTP_PASS },
  });

  await transporter.sendMail({
    from:    SMTP_FROM ?? `CampusNest <${SMTP_USER}>`,
    to:      email,
    subject: 'Your CampusNest sign-in code',
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto">
        <h2 style="color:#3b82f6">CampusNest</h2>
        <p>Hi ${name},</p>
        <p>Your one-time sign-in code is:</p>
        <p style="font-size:36px;font-weight:bold;letter-spacing:8px;color:#1f2328;text-align:center;padding:16px;background:#f7f8fa;border-radius:8px">${otp}</p>
        <p style="color:#57606a;font-size:13px">This code expires in <strong>10 minutes</strong>. Never share it with anyone.</p>
        <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0"/>
        <p style="color:#57606a;font-size:12px">If you did not request this code, please ignore this email.</p>
      </div>
    `,
  });
}
