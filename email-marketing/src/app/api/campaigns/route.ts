import { query } from "@/lib/db";
import { z } from "zod";
import { requireRole } from "@/lib/rbac";

const campaignSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1),
  description: z.string().optional(),
});

export async function GET() {
  const gate = await requireRole(["ADMIN", "MANAGER", "USER"]);
  if (!gate.authorized) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const { rows } = await query(
    `SELECT c.id, c.name, c.description, c.status,
            t.id as template_id, t.name as template_name, t.subject as template_subject
       FROM campaigns c
       LEFT JOIN templates t ON t.campaign_id = c.id
       ORDER BY c.created_at DESC`
  );
  const grouped = (rows as any[]).map((r) => ({
    id: r.id,
    name: r.name,
    description: r.description,
    status: r.status,
    template: r.template_id ? { id: r.template_id, name: r.template_name, subject: r.template_subject } : null,
  }));
  return Response.json({ campaigns: grouped });
}

export async function POST(req: Request) {
  const gate = await requireRole(["ADMIN", "MANAGER"]);
  if (!gate.authorized) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const parsed = campaignSchema.safeParse(body);
  if (!parsed.success) return Response.json({ error: "Invalid" }, { status: 400 });
  const { name, description } = parsed.data;
  const result = await query(
    `INSERT INTO campaigns (name, description, created_by_id) VALUES ($1,$2,$3)
     RETURNING id, name, description, status`,
    [name, description ?? null, gate.session!.user.id]
  );
  return Response.json({ campaign: result.rows[0] });
}

export async function PUT(req: Request) {
  const gate = await requireRole(["ADMIN", "MANAGER"]);
  if (!gate.authorized) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const parsed = campaignSchema.safeParse(body);
  if (!parsed.success || !parsed.data.id) return Response.json({ error: "Invalid" }, { status: 400 });
  const { id, name, description } = parsed.data;
  const result = await query(
    `UPDATE campaigns SET name = $1, description = $2, updated_at = now() WHERE id = $3
     RETURNING id, name, description, status`,
    [name, description ?? null, id]
  );
  return Response.json({ campaign: result.rows[0] });
}

export async function DELETE(req: Request) {
  const gate = await requireRole(["ADMIN", "MANAGER"]);
  if (!gate.authorized) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return Response.json({ error: "Missing id" }, { status: 400 });
  await query(`DELETE FROM campaigns WHERE id = $1`, [id]);
  return Response.json({ ok: true });
}
