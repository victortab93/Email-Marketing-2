import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/rbac";
import { Card } from "@/components/ui/Card";

export default async function AdminHome() {
  const gate = await requireRole(["ADMIN", "MANAGER", "USER"]);
  if (!gate.authorized) return <div className="p-6">Unauthorized</div>;
  const [campaignCount, contactCount] = await Promise.all([
    prisma.campaign.count(),
    prisma.contact.count(),
  ]);
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
