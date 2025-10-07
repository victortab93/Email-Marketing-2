import { query } from "@/lib/db";
import { z } from "zod";
import { requireRole } from "@/lib/rbac";

const templateSchema = z.object({
  id: z.string().optional(),
  campaignId: z.string(),
  name: z.string().min(1),
  subject: z.string().min(1),
  html: z.string().min(1),
});

export async function POST(req: Request) {
  const gate = await requireRole(["ADMIN", "MANAGER"]);
  if (!gate.authorized) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const parsed = templateSchema.safeParse(body);
  if (!parsed.success) return Response.json({ error: "Invalid" }, { status: 400 });
  const { campaignId, name, subject, html } = parsed.data;
  const upsert = await query(
    `INSERT INTO templates (campaign_id, name, subject, html)
       VALUES ($1,$2,$3,$4)
     ON CONFLICT (campaign_id) DO UPDATE SET name = EXCLUDED.name, subject = EXCLUDED.subject, html = EXCLUDED.html, updated_at = now()
     RETURNING id, campaign_id AS "campaignId", name, subject, html`,
    [campaignId, name, subject, html]
  );
  return Response.json({ template: upsert.rows[0] });
}
