"use client";
import useSWR from "swr";
import { useParams } from "next/navigation";
import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function CampaignDetailPage() {
  const params = useParams<{ id: string }>();
  const { data, mutate } = useSWR(`/api/campaigns`, fetcher);
  const campaign = data?.campaigns?.find((c: any) => c.id === params.id);
  const [name, setName] = useState<string>("");
  const [subject, setSubject] = useState<string>("");
  const [html, setHtml] = useState<string>("");

  async function saveTemplate(e: React.FormEvent) {
    e.preventDefault();
    await fetch(`/api/templates`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ campaignId: params.id, name, subject, html }) });
    mutate();
  }

  async function upload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const form = new FormData();
    form.set("templateId", campaign?.template?.id || "");
    form.set("file", file);
    await fetch("/api/uploads", { method: "POST", body: form });
    mutate();
  }

  return (
    <div className="grid gap-6 max-w-4xl">
      <Card title="Campaign">
        <div className="text-sm">
          <div className="font-medium">{campaign?.name}</div>
          <div className="text-neutral-600">{campaign?.description}</div>
        </div>
      </Card>
      <Card title="Template">
        <form onSubmit={saveTemplate} className="grid gap-3">
          <Input label="Template name" value={name} onChange={e=>setName(e.target.value)} />
          <Input label="Subject" value={subject} onChange={e=>setSubject(e.target.value)} />
          <label className="grid gap-1">
            <span className="text-sm text-neutral-700">HTML</span>
            <textarea className="min-h-[200px] rounded-md border border-neutral-300 p-2 text-sm" value={html} onChange={e=>setHtml(e.target.value)} />
          </label>
          <div className="flex items-center gap-3">
            <Button type="submit">Save Template</Button>
            <input type="file" onChange={upload} />
          </div>
        </form>
      </Card>
      {campaign?.template?.mediaAssets?.length ? (
        <Card title="Assets">
          <ul className="grid grid-cols-2 gap-3">
            {campaign.template.mediaAssets.map((a: any) => (
              <li key={a.id} className="text-sm">
                <a href={a.url} target="_blank" className="text-blue-600 hover:underline">{a.url}</a>
              </li>
            ))}
          </ul>
        </Card>
      ) : null}
    </div>
  );
}
