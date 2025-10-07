import { query } from "@/lib/db";
import { requireRole } from "@/lib/rbac";
import { Card } from "@/components/ui/Card";

export default async function AdminHome() {
  const gate = await requireRole(["ADMIN", "MANAGER", "USER"]);
  if (!gate.authorized) return <div className="p-6">Unauthorized</div>;
  const [{ rows: c1 }, { rows: c2 }] = await Promise.all([
    query<{ count: string }>(`SELECT COUNT(*)::text as count FROM campaigns`),
    query<{ count: string }>(`SELECT COUNT(*)::text as count FROM contacts`),
  ]);
  const campaignCount = Number(c1[0]?.count ?? 0);
  const contactCount = Number(c2[0]?.count ?? 0);
  return (
    <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
      <Card title="Overview">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-3xl font-bold">{campaignCount}</div>
            <div className="text-sm text-neutral-600">Campaigns</div>
          </div>
          <div>
            <div className="text-3xl font-bold">{contactCount}</div>
            <div className="text-sm text-neutral-600">Contacts</div>
          </div>
        </div>
      </Card>
    </div>
  );
}
