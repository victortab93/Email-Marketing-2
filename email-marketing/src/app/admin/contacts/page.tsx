"use client";
import useSWR from "swr";
import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function ContactsPage() {
  const { data, mutate } = useSWR("/api/contacts", fetcher);
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  async function addContact(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/contacts", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, firstName, lastName }) });
    setEmail(""); setFirstName(""); setLastName("");
    mutate();
  }

  return (
    <div className="grid gap-6 max-w-3xl">
      <Card title="Add Contact">
        <form onSubmit={addContact} className="grid gap-3">
          <Input label="Email" type="email" value={email} onChange={e=>setEmail(e.target.value)} required />
          <div className="grid grid-cols-2 gap-3">
            <Input label="First name" value={firstName} onChange={e=>setFirstName(e.target.value)} />
            <Input label="Last name" value={lastName} onChange={e=>setLastName(e.target.value)} />
          </div>
          <Button type="submit">Add</Button>
        </form>
      </Card>
      <Card title="Contacts">
        <ul className="text-sm">
          {data?.contacts?.map((c: any) => (
            <li key={c.id} className="flex justify-between py-2 border-b">
              <div>
                <div className="font-medium">{c.email}</div>
                <div className="text-neutral-600">{c.firstName} {c.lastName}</div>
              </div>
              <div className="text-neutral-600">{c.status}</div>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
