"use client";
import { useState } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    const res = await fetch("/api/auth/register", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, email, password }) });
    if (res.ok) {
      setMessage("Account created. You can sign in now.");
    } else {
      const data = await res.json();
      setMessage(data.error || "Failed to register");
    }
  }

  return (
    <div className="min-h-screen grid place-items-center bg-neutral-50">
      <form onSubmit={onSubmit} className="w-full max-w-sm space-y-4 bg-white p-6 rounded-lg shadow">
        <h1 className="text-lg font-semibold">Create account</h1>
        {message && <div className="text-sm text-neutral-700">{message}</div>}
        <Input label="Name" value={name} onChange={e=>setName(e.target.value)} required />
        <Input label="Email" type="email" value={email} onChange={e=>setEmail(e.target.value)} required />
        <Input label="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)} required />
        <Button type="submit" className="w-full">Register</Button>
        <div className="text-xs text-neutral-700 flex justify-between">
          <a href="/login" className="hover:underline">Back to sign in</a>
        </div>
      </form>
    </div>
  );
}
