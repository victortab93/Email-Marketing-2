import { prisma } from "@/lib/prisma";
import { z } from "zod";
import argon2 from "argon2";

const registerSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8)
});

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: "Invalid input" }, { status: 400 });
  }
  const { name, email, password } = parsed.data;
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return Response.json({ error: "User already exists" }, { status: 409 });
  }
  const passwordHash = await argon2.hash(password);
  const user = await prisma.user.create({
    data: { name, email, passwordHash }
  });
  return Response.json({ id: user.id, email: user.email });
}
