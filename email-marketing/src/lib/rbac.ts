import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export type AppRole = "ADMIN" | "MANAGER" | "USER";

export async function requireRole(required: AppRole | AppRole[]) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.role) {
    return { authorized: false as const, session: null };
  }
  const roles = Array.isArray(required) ? required : [required];
  const authorized = roles.includes(session.user.role);
  return { authorized: authorized as const, session };
}
