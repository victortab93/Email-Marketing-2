import { query } from "@/lib/db";
import { z } from "zod";
import argon2 from "argon2";

const schema = z.object({ token: z.string().min(10), password: z.string().min(8) });

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return Response.json({ error: "Invalid" }, { status: 400 });
  const { token, password } = parsed.data;

  const { rows } = await query<{ id: string; email: string; expires: Date }>(
    `SELECT id, email, expires FROM password_reset_tokens WHERE token = $1`,
    [token]
  );
  const record = rows[0];
  if (!record || new Date(record.expires) < new Date()) {
    return Response.json({ error: "Token expired" }, { status: 400 });
  }
  const { rows: userRows } = await query<{ id: string }>(`SELECT id FROM users WHERE email = $1`, [record.email]);
  const user = userRows[0];
  if (!user) return Response.json({ error: "Invalid token" }, { status: 400 });

  const passwordHash = await argon2.hash(password);
  await query(`UPDATE users SET password_hash = $1, updated_at = now() WHERE id = $2`, [passwordHash, user.id]);
  await query(`DELETE FROM password_reset_tokens WHERE id = $1`, [record.id]);

  return Response.json({ ok: true });
}
