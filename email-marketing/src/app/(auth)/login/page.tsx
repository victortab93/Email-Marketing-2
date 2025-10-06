"use client";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const res = await signIn("credentials", { email, password, redirect: false });
    if (res?.error) {
      setError("Invalid credentials");
    } else {
      window.location.href = "/admin";
    }
  }

  return (
    <div className="min-h-screen grid place-items-center bg-neutral-50">
      <form onSubmit={onSubmit} className="w-full max-w-sm space-y-4 bg-white p-6 rounded-lg shadow">
        <h1 className="text-lg font-semibold">Sign in</h1>
        {error && <div className="text-sm text-red-600">{error}</div>}
        <Input label="Email" type="email" value={email} onChange={e=>setEmail(e.target.value)} required />
        <Input label="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)} required />
        <Button type="submit" className="w-full">Sign in</Button>
        <Button type="button" variant="secondary" onClick={()=>signIn("google") } className="w-full">Sign in with Google</Button>
        <div className="text-xs text-neutral-700 flex justify-between">
          <a href="/register" className="hover:underline">Create account</a>
          <a href="/reset-password" className="hover:underline">Forgot password?</a>
        </div>
      </form>
    </div>
  );
}
