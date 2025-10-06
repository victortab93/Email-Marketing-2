"use client";
import useSWR from "swr";
import { useMemo, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function CampaignsPage() {
  const { data, mutate } = useSWR("/api/campaigns", fetcher);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  async function addCampaign(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/campaigns", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, description }) });
    setName(""); setDescription("");
    mutate();
  }

  return (
    <div className="grid gap-6 max-w-4xl">
      <Card title="Create Campaign">
        <form onSubmit={addCampaign} className="grid gap-3">
          <Input label="Name" value={name} onChange={e=>setName(e.target.value)} required />
          <Input label="Description" value={description} onChange={e=>setDescription(e.target.value)} />
          <Button type="submit">Create</Button>
        </form>
      </Card>

      <Card title="Campaigns">
        <ul className="text-sm">
          {data?.campaigns?.map((c: any) => (
            <li key={c.id} className="py-2 border-b">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">{c.name}</div>
                  <div className="text-neutral-600">{c.description}</div>
                </div>
                <div className="flex gap-3">
                  <a className="text-blue-600 hover:underline" href={`/admin/campaigns/${c.id}`}>Configure</a>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
