import { NextRequest } from "next/server";
import { requireRole } from "@/lib/rbac";
import { query } from "@/lib/db";
import fs from "fs";
import path from "path";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const gate = await requireRole(["ADMIN", "MANAGER"]);
  if (!gate.authorized) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const data = await req.formData();
  const file = data.get("file");
  const templateId = data.get("templateId");
  if (!file || typeof file === "string") return Response.json({ error: "Missing file" }, { status: 400 });
  if (!templateId || typeof templateId === "string" && templateId.length === 0) return Response.json({ error: "Missing templateId" }, { status: 400 });

  const bytes = await (file as File).arrayBuffer();
  const buffer = Buffer.from(bytes);
  const uploadDir = process.env.UPLOAD_DIR || "public/uploads";
  const absDir = path.join(process.cwd(), uploadDir);
  if (!fs.existsSync(absDir)) fs.mkdirSync(absDir, { recursive: true });
  const fileName = `${Date.now()}-${(file as File).name}`.replace(/\s+/g, "-");
  const filePath = path.join(absDir, fileName);
  fs.writeFileSync(filePath, buffer);

  const publicUrl = `/${uploadDir.replace(/^public\/?/, "")}/${fileName}`;

  const result = await query(
    `INSERT INTO media_assets (template_id, uploaded_by_id, url, content_type, size)
       VALUES ($1,$2,$3,$4,$5) RETURNING id, template_id AS "templateId", url, content_type AS "contentType", size`,
    [String(templateId), gate.session!.user.id, publicUrl, (file as File).type || "application/octet-stream", buffer.length]
  );
  return Response.json({ asset: result.rows[0] });
}
