"use client";
import { useState } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  async function requestToken(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    const res = await fetch("/api/auth/reset/request", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) });
    setMessage(res.ok ? "If the email exists, a reset link was sent" : "Request failed");
  }

  async function resetPassword(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    const res = await fetch("/api/auth/reset/confirm", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token, password }) });
    setMessage(res.ok ? "Password updated. You can sign in now." : "Reset failed");
  }

  return (
    <div className="min-h-screen grid place-items-center bg-neutral-50">
      <div className="w-full max-w-sm space-y-6">
        <form onSubmit={requestToken} className="space-y-4 bg-white p-6 rounded-lg shadow">
          <h1 className="text-lg font-semibold">Request reset link</h1>
          <Input label="Email" type="email" value={email} onChange={e=>setEmail(e.target.value)} required />
          <Button type="submit" className="w-full">Send reset</Button>
        </form>
        <form onSubmit={resetPassword} className="space-y-4 bg-white p-6 rounded-lg shadow">
          <h2 className="text-base font-semibold">Reset with token</h2>
          <Input label="Token" value={token} onChange={e=>setToken(e.target.value)} required />
          <Input label="New password" type="password" value={password} onChange={e=>setPassword(e.target.value)} required />
          <Button type="submit" className="w-full">Reset password</Button>
          {message && <div className="text-sm text-neutral-700">{message}</div>}
        </form>
      </div>
    </div>
  );
}
