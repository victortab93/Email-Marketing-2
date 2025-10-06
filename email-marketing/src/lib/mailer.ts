import nodemailer from "nodemailer";

export function createTransport() {
  const host = process.env.EMAIL_SERVER_HOST ?? "localhost";
  const port = Number(process.env.EMAIL_SERVER_PORT ?? 1025);
  const authUser = process.env.EMAIL_SERVER_USER || undefined;
  const authPass = process.env.EMAIL_SERVER_PASS || undefined;

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: false,
    auth: authUser && authPass ? { user: authUser, pass: authPass } : undefined,
  });
  return transporter;
}

export async function sendResetEmail(params: { to: string; token: string }) {
  const from = process.env.EMAIL_FROM ?? "no-reply@emailmarketing.local";
  const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${params.token}`;
  const transporter = createTransport();
  await transporter.sendMail({
    from,
    to: params.to,
    subject: "Reset your EmailMarketing password",
    html: `<p>We received a request to reset your password.</p>
           <p><a href="${resetUrl}">Click here to reset your password</a></p>
           <p>If you did not request this, you can ignore this email.</p>`
  });
}
