import { prisma } from "@/lib/prisma";
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
  const contacts = await prisma.contact.findMany({ orderBy: { createdAt: "desc" } });
  return Response.json({ contacts });
}

export async function POST(req: Request) {
  const gate = await requireRole(["ADMIN", "MANAGER"]);
  if (!gate.authorized) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const parsed = upsertSchema.safeParse(body);
  if (!parsed.success) return Response.json({ error: "Invalid" }, { status: 400 });
  const { email, firstName, lastName } = parsed.data;
  const contact = await prisma.contact.create({
    data: {
      email,
      firstName,
      lastName,
      createdById: gate.session!.user.id,
    },
  });
  return Response.json({ contact });
}

export async function PUT(req: Request) {
  const gate = await requireRole(["ADMIN", "MANAGER"]);
  if (!gate.authorized) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const parsed = upsertSchema.safeParse(body);
  if (!parsed.success || !parsed.data.id) return Response.json({ error: "Invalid" }, { status: 400 });
  const { id, email, firstName, lastName } = parsed.data;
  const contact = await prisma.contact.update({
    where: { id },
    data: { email, firstName, lastName },
  });
  return Response.json({ contact });
}

export async function DELETE(req: Request) {
  const gate = await requireRole(["ADMIN", "MANAGER"]);
  if (!gate.authorized) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return Response.json({ error: "Missing id" }, { status: 400 });
  await prisma.contact.delete({ where: { id } });
  return Response.json({ ok: true });
}
