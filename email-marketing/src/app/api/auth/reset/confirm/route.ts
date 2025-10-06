import { prisma } from "@/lib/prisma";
import { z } from "zod";
import argon2 from "argon2";

const schema = z.object({ token: z.string().min(10), password: z.string().min(8) });

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return Response.json({ error: "Invalid" }, { status: 400 });
  const { token, password } = parsed.data;

  const record = await prisma.passwordResetToken.findFirst({ where: { token } });
  if (!record || record.expires < new Date()) {
    return Response.json({ error: "Token expired" }, { status: 400 });
  }
  const user = await prisma.user.findUnique({ where: { email: record.email } });
  if (!user) return Response.json({ error: "Invalid token" }, { status: 400 });

  const passwordHash = await argon2.hash(password);
  await prisma.user.update({ where: { id: user.id }, data: { passwordHash } });
  await prisma.passwordResetToken.delete({ where: { id: record.id } });

  return Response.json({ ok: true });
}
