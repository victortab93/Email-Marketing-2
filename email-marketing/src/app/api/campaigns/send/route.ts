import { prisma } from "@/lib/prisma";
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

  const campaign = await prisma.campaign.findUnique({
    where: { id: campaignId },
    include: { template: true, recipients: { include: { contact: true } } },
  });
  if (!campaign || !campaign.template) {
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

  const toSend = emails ?? campaign.recipients.map(r => r.contact.email);
  const from = process.env.EMAIL_FROM ?? "no-reply@emailmarketing.local";

  for (const to of toSend) {
    try {
      await transporter.sendMail({
        from,
        to,
        subject: campaign.template.subject,
        html: campaign.template.html,
      });
      // Record as SENT; in a real system we'd queue and webhook
      await prisma.campaignRecipient.upsert({
        where: { campaignId_contactId: { campaignId: campaign.id, contactId: (await ensureContact(to, gate.session!.user.id)).id } },
        update: { status: "SENT", sentAt: new Date() },
        create: {
          campaignId: campaign.id,
          contactId: (await ensureContact(to, gate.session!.user.id)).id,
          status: "SENT",
          sentAt: new Date(),
        }
      });
    } catch (err: any) {
      // Record failure
      await prisma.campaignRecipient.upsert({
        where: { campaignId_contactId: { campaignId: campaign.id, contactId: (await ensureContact(to, gate.session!.user.id)).id } },
        update: { status: "FAILED", lastError: String(err?.message ?? err) },
        create: {
          campaignId: campaign.id,
          contactId: (await ensureContact(to, gate.session!.user.id)).id,
          status: "FAILED",
          lastError: String(err?.message ?? err),
        }
      });
    }
  }

  await prisma.campaign.update({ where: { id: campaign.id }, data: { status: "SENT", sentAt: new Date() } });

  return Response.json({ ok: true });
}

async function ensureContact(email: string, userId: string) {
  const existing = await prisma.contact.findUnique({ where: { email } });
  if (existing) return existing;
  return prisma.contact.create({ data: { email, createdById: userId } });
}
