import NextAuth, { type NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { z } from "zod";
import argon2 from "argon2";
import { query } from "@/lib/db";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture
        };
      }
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: { email: {}, password: {} },
      async authorize(raw) {
        const parsed = credentialsSchema.safeParse(raw);
        if (!parsed.success) return null;
        const { email, password } = parsed.data;
        const { rows } = await query<{ id: string; name: string | null; email: string | null; image: string | null; password_hash: string | null }>(
          `SELECT id, name, email, image, password_hash FROM users WHERE email = $1`,
          [email]
        );
        const user = rows[0];
        if (!user || !user.password_hash) return null;
        const valid = await argon2.verify(user.password_hash, password);
        if (!valid) return null;
        return { id: user.id, name: user.name ?? null, email: user.email ?? null, image: user.image ?? null } as any;
      }
    })
  ],
  callbacks: {
    async signIn({ account, profile }) {
      if (account?.provider === "google") {
        const email = (profile as any)?.email as string | undefined;
        if (!email) return false;
        if (!email.endsWith("@gmail.com")) {
          return false;
        }
        // Upsert the user for Google sign-in
        const name = (profile as any)?.name ?? null;
        const image = (profile as any)?.picture ?? null;
        await query(
          `INSERT INTO users (name, email, image)
             VALUES ($1,$2,$3)
           ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name, image = EXCLUDED.image, updated_at = now()`,
          [name, email, image]
        );
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        const { rows } = await query<{ id: string; role: string | null }>(`SELECT id, role FROM users WHERE id = $1`, [(user as any).id]);
        const dbUser = rows[0];
        token.id = dbUser?.id;
        token.role = (dbUser?.role as any) ?? "USER";
      } else if (token?.email) {
        const { rows } = await query<{ id: string; role: string | null }>(`SELECT id, role FROM users WHERE email = $1`, [token.email as string]);
        const dbUser = rows[0];
        if (dbUser) {
          token.id = dbUser.id;
          token.role = (dbUser.role as any) ?? "USER";
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = (token.role as any) ?? "USER";
      }
      return session;
    }
  },
  cookies: {
    // Defaults are httpOnly cookies; no localStorage tokens
  },
  debug: process.env.NODE_ENV !== "production"
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
