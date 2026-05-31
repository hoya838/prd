import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { scrypt, timingSafeEqual } from "crypto";
import { promisify } from "util";
import fs from "fs";
import path from "path";

const scryptAsync = promisify(scrypt);

interface StoredUser {
  email: string;
  name?: string;
  passwordHash: string; // "salt:hash" hex
}

async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const hashBuf = Buffer.from(hash, "hex");
  const derived = (await scryptAsync(password, salt, 64)) as Buffer;
  return hashBuf.length === derived.length && timingSafeEqual(hashBuf, derived);
}

function loadUsers(): StoredUser[] {
  if (process.env.CREDENTIALS_USERS) {
    try {
      return JSON.parse(process.env.CREDENTIALS_USERS) as StoredUser[];
    } catch {
      return [];
    }
  }
  const filePath = path.join(process.cwd(), "data", "users.json");
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf-8")) as StoredUser[];
  } catch {
    return [];
  }
}

function isAllowedEmail(email: string): boolean {
  const allowedEmails = (process.env.ALLOWED_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

  const allowedDomains = (process.env.ALLOWED_DOMAINS ?? "")
    .split(",")
    .map((d) => d.trim().toLowerCase())
    .filter(Boolean);

  const lowerEmail = email.toLowerCase();

  if (allowedEmails.includes(lowerEmail)) return true;

  const domain = lowerEmail.split("@")[1];
  if (domain && allowedDomains.includes(domain)) return true;

  return false;
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      id: "credentials",
      name: "회사계정",
      credentials: {
        email: { label: "이메일", type: "email" },
        password: { label: "비밀번호", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const domain = credentials.email.toLowerCase().split("@")[1];
        const allowedDomains = ["tkcnco.com", "uxis.co.kr"];
        if (!domain || !allowedDomains.includes(domain)) return null;
        const users = loadUsers();
        const user = users.find((u) => u.email.toLowerCase() === credentials.email.toLowerCase());
        if (!user) return null;
        const ok = await verifyPassword(credentials.password, user.passwordHash);
        if (!ok) return null;
        return { id: user.email, email: user.email, name: user.name ?? user.email };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    async signIn({ user, account }) {
      if (!user.email) return false;
      if (account?.provider === "credentials") return true; // authorize() already validated
      return isAllowedEmail(user.email);
    },
    async session({ session, token }) {
      if (session.user && token.sub) {
        (session.user as { id?: string }).id = token.sub;
      }
      return session;
    },
  },
};
