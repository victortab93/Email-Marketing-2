import { NextResponse } from "next/server";

export async function POST() {
  // NextAuth exposes signOut via client; server BFF clears cookies by redirect.
  // Here we return a 200 and the client should call signOut().
  return NextResponse.json({ ok: true });
}
