import { prisma } from "@/lib/prisma";
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
  const template = await prisma.template.upsert({
    where: { campaignId },
    update: { name, subject, html },
    create: { campaignId, name, subject, html },
  });
  return Response.json({ template });
}
