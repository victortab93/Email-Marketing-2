import Link from "next/link";
import { ReactNode } from "react";

const navItems = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/users", label: "User Info" },
  { href: "/admin/campaigns", label: "Campaigns" },
  { href: "/admin/contacts", label: "Contacts" },
  { href: "/admin/send", label: "Send Campaign" },
];

export default function AdminShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen grid grid-cols-[240px_1fr]">
      <aside className="border-r border-neutral-200 bg-white">
        <div className="px-4 py-4 text-lg font-bold">EmailMarketing</div>
        <nav className="px-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block rounded-md px-3 py-2 text-sm text-neutral-800 hover:bg-neutral-100"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      <div className="grid grid-rows-[56px_1fr]">
        <header className="flex items-center justify-between border-b border-neutral-200 bg-white px-4">
          <div className="font-medium">Admin</div>
          <form action="/api/auth/logout" method="post">
            <button className="text-sm text-neutral-700 hover:underline">Logout</button>
          </form>
        </header>
        <main className="p-6 bg-neutral-50">{children}</main>
      </div>
    </div>
  );
}
