import AdminShell from "@/components/layout/AdminShell";
import { ReactNode } from "react";

export default function Layout({ children }: { children: ReactNode }) {
  return <AdminShell>{children}</AdminShell>;
}
