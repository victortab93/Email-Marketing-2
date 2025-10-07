import { query } from "@/lib/db";
import { z } from "zod";
import { requireRole } from "@/lib/rbac";

const schema = z.object({ userId: z.string(), role: z.enum(["ADMIN", "MANAGER", "USER"]) });

export async function POST(req: Request) {
  const gate = await requireRole(["ADMIN"]);
  if (!gate.authorized) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return Response.json({ error: "Invalid" }, { status: 400 });
  const { userId, role } = parsed.data;
  const result = await query<{ id: string; role: string }>(
    `UPDATE users SET role = $1, updated_at = now() WHERE id = $2 RETURNING id, role`,
    [role, userId]
  );
  return Response.json(result.rows[0]);
}
