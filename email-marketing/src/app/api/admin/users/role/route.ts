import { prisma } from "@/lib/prisma";
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
  const user = await prisma.user.update({ where: { id: userId }, data: { role } });
  return Response.json({ id: user.id, role: user.role });
}
