import { prisma } from "@/lib/prisma";
import { z } from "zod";
import crypto from "crypto";
import { sendResetEmail } from "@/lib/mailer";

const schema = z.object({ email: z.string().email() });

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return Response.json({ error: "Invalid" }, { status: 400 });
  const { email } = parsed.data;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return Response.json({ ok: true });

  const token = crypto.randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + 1000 * 60 * 30); // 30 min
  await prisma.passwordResetToken.create({ data: { email, token, expires } });
  await sendResetEmail({ to: email, token });
  return Response.json({ ok: true });
}
