import { prisma } from "@/lib/prisma";
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
  const campaigns = await prisma.campaign.findMany({ include: { template: true }, orderBy: { createdAt: "desc" } });
  return Response.json({ campaigns });
}

export async function POST(req: Request) {
  const gate = await requireRole(["ADMIN", "MANAGER"]);
  if (!gate.authorized) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const parsed = campaignSchema.safeParse(body);
  if (!parsed.success) return Response.json({ error: "Invalid" }, { status: 400 });
  const { name, description } = parsed.data;
  const campaign = await prisma.campaign.create({ data: { name, description, createdById: gate.session!.user.id } });
  return Response.json({ campaign });
}

export async function PUT(req: Request) {
  const gate = await requireRole(["ADMIN", "MANAGER"]);
  if (!gate.authorized) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const parsed = campaignSchema.safeParse(body);
  if (!parsed.success || !parsed.data.id) return Response.json({ error: "Invalid" }, { status: 400 });
  const { id, name, description } = parsed.data;
  const campaign = await prisma.campaign.update({ where: { id }, data: { name, description } });
  return Response.json({ campaign });
}

export async function DELETE(req: Request) {
  const gate = await requireRole(["ADMIN", "MANAGER"]);
  if (!gate.authorized) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return Response.json({ error: "Missing id" }, { status: 400 });
  await prisma.campaign.delete({ where: { id } });
  return Response.json({ ok: true });
}
