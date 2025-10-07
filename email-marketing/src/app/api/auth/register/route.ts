import { query } from "@/lib/db";
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
  const existing = await query<{ id: string }>(`SELECT id FROM users WHERE email = $1`, [email]);
  if (existing.rows.length > 0) {
    return Response.json({ error: "User already exists" }, { status: 409 });
  }
  const passwordHash = await argon2.hash(password);
  const result = await query<{ id: string; email: string }>(
    `INSERT INTO users (name, email, password_hash) VALUES ($1,$2,$3) RETURNING id, email`,
    [name, email, passwordHash]
  );
  return Response.json(result.rows[0]);
}
