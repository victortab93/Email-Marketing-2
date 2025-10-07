import { query } from "@/lib/db";
import { z } from "zod";
import { requireRole } from "@/lib/rbac";
import nodemailer from "nodemailer";

const schema = z.object({
  campaignId: z.string(),
  emails: z.array(z.string().email()).min(1).optional(),
});

export async function POST(req: Request) {
  const gate = await requireRole(["ADMIN", "MANAGER"]);
  if (!gate.authorized) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return Response.json({ error: "Invalid" }, { status: 400 });
  const { campaignId, emails } = parsed.data;

  const { rows: cr } = await query(
    `SELECT c.id, t.subject, t.html
       FROM campaigns c
  LEFT JOIN templates t ON t.campaign_id = c.id
      WHERE c.id = $1`,
    [campaignId]
  );
  const campaign = cr[0];
  if (!campaign || !campaign.subject || !campaign.html) {
    return Response.json({ error: "Campaign or template not found" }, { status: 404 });
  }

  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_SERVER_HOST ?? "localhost",
    port: Number(process.env.EMAIL_SERVER_PORT ?? 1025),
    secure: false,
    auth: process.env.EMAIL_SERVER_USER && process.env.EMAIL_SERVER_PASS
      ? { user: process.env.EMAIL_SERVER_USER, pass: process.env.EMAIL_SERVER_PASS }
      : undefined,
  });

  let toSend = emails;
  if (!toSend) {
    const { rows } = await query<{ email: string }>(
      `SELECT ct.email FROM campaign_recipients cr
         JOIN contacts ct ON ct.id = cr.contact_id
        WHERE cr.campaign_id = $1`,
      [campaignId]
    );
    toSend = rows.map(r => r.email);
  }
  const from = process.env.EMAIL_FROM ?? "no-reply@emailmarketing.local";

  for (const to of toSend) {
    try {
      await transporter.sendMail({ from, to, subject: campaign.subject, html: campaign.html });
      const contact = await ensureContact(to, gate.session!.user.id);
      await query(
        `INSERT INTO campaign_recipients (campaign_id, contact_id, status, sent_at)
           VALUES ($1,$2,'SENT', now())
         ON CONFLICT (campaign_id, contact_id) DO UPDATE SET status = 'SENT', sent_at = now()`,
        [campaignId, contact.id]
      );
    } catch (err: any) {
      const contact = await ensureContact(to, gate.session!.user.id);
      await query(
        `INSERT INTO campaign_recipients (campaign_id, contact_id, status, last_error)
           VALUES ($1,$2,'FAILED',$3)
         ON CONFLICT (campaign_id, contact_id) DO UPDATE SET status = 'FAILED', last_error = EXCLUDED.last_error`,
        [campaignId, contact.id, String(err?.message ?? err)]
      );
    }
  }

  await query(`UPDATE campaigns SET status = 'SENT', sent_at = now(), updated_at = now() WHERE id = $1`, [campaignId]);

  return Response.json({ ok: true });
}

async function ensureContact(email: string, userId: string) {
  const { rows } = await query<{ id: string }>(`SELECT id FROM contacts WHERE email = $1`, [email]);
  if (rows[0]) return rows[0];
  const result = await query<{ id: string }>(
    `INSERT INTO contacts (email, created_by_id) VALUES ($1,$2) RETURNING id`,
    [email, userId]
  );
  return result.rows[0];
}
