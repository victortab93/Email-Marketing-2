"use client";
import useSWR from "swr";
import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function SendPage() {
  const { data } = useSWR("/api/campaigns", fetcher);
  const [campaignId, setCampaignId] = useState<string>("");
  const [emails, setEmails] = useState<string>("");
  const [message, setMessage] = useState<string | null>(null);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    const list = emails.split(",").map(e => e.trim()).filter(Boolean);
    const res = await fetch("/api/campaigns/send", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ campaignId, emails: list.length ? list : undefined }) });
    setMessage(res.ok ? "Sent" : "Failed");
  }

  return (
    <div className="grid gap-6 max-w-3xl">
      <Card title="Send Campaign">
        <form onSubmit={send} className="grid gap-3">
          <label className="grid gap-1">
            <span className="text-sm text-neutral-700">Campaign</span>
            <select className="h-10 rounded-md border border-neutral-300 px-3 text-sm" value={campaignId} onChange={e=>setCampaignId(e.target.value)} required>
              <option value="" disabled>Select a campaign</option>
              {data?.campaigns?.map((c: any) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </label>
          <Input label="Emails (comma separated, optional)" value={emails} onChange={e=>setEmails(e.target.value)} />
          <Button type="submit">Send</Button>
          {message && <div className="text-sm text-neutral-700">{message}</div>}
        </form>
      </Card>
    </div>
  );
}
