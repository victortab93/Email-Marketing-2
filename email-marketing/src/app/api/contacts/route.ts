import { query } from "@/lib/db";
import { z } from "zod";
import { requireRole } from "@/lib/rbac";

const upsertSchema = z.object({
  id: z.string().optional(),
  email: z.string().email(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
});

export async function GET() {
  const gate = await requireRole(["ADMIN", "MANAGER", "USER"]);
  if (!gate.authorized) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const { rows } = await query(
    `SELECT id, email, first_name AS "firstName", last_name AS "lastName", status, created_at AS "createdAt" 
       FROM contacts ORDER BY created_at DESC`
  );
  return Response.json({ contacts: rows });
}

export async function POST(req: Request) {
  const gate = await requireRole(["ADMIN", "MANAGER"]);
  if (!gate.authorized) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const parsed = upsertSchema.safeParse(body);
  if (!parsed.success) return Response.json({ error: "Invalid" }, { status: 400 });
  const { email, firstName, lastName } = parsed.data;
  const result = await query(
    `INSERT INTO contacts (email, first_name, last_name, created_by_id) VALUES ($1,$2,$3,$4) 
     RETURNING id, email, first_name AS "firstName", last_name AS "lastName", status`,
    [email, firstName ?? null, lastName ?? null, gate.session!.user.id]
  );
  return Response.json({ contact: result.rows[0] });
}

export async function PUT(req: Request) {
  const gate = await requireRole(["ADMIN", "MANAGER"]);
  if (!gate.authorized) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const parsed = upsertSchema.safeParse(body);
  if (!parsed.success || !parsed.data.id) return Response.json({ error: "Invalid" }, { status: 400 });
  const { id, email, firstName, lastName } = parsed.data;
  const result = await query(
    `UPDATE contacts SET email = $1, first_name = $2, last_name = $3, updated_at = now() WHERE id = $4
     RETURNING id, email, first_name AS "firstName", last_name AS "lastName", status`,
    [email, firstName ?? null, lastName ?? null, id]
  );
  return Response.json({ contact: result.rows[0] });
}

export async function DELETE(req: Request) {
  const gate = await requireRole(["ADMIN", "MANAGER"]);
  if (!gate.authorized) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return Response.json({ error: "Missing id" }, { status: 400 });
  await query(`DELETE FROM contacts WHERE id = $1`, [id]);
  return Response.json({ ok: true });
}
