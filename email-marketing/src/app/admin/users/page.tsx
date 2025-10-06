import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { Card } from "@/components/ui/Card";

export default async function UserInfoPage() {
  const session = await getServerSession(authOptions);
  if (!session) return <div className="p-6">Unauthorized</div>;
  return (
    <div className="grid gap-6 max-w-2xl">
      <Card title="Your Info">
        <div className="text-sm">
          <div><span className="text-neutral-500">Name:</span> {session.user?.name}</div>
          <div><span className="text-neutral-500">Email:</span> {session.user?.email}</div>
          <div><span className="text-neutral-500">Role:</span> {session.user?.role}</div>
          <div><span className="text-neutral-500">User ID:</span> {session.user?.id}</div>
        </div>
      </Card>
    </div>
  );
}
