"use client";

import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { Button } from "@/components/ui/button";

function LoginContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  const callbackUrl = searchParams.get("callbackUrl") ?? "/dashboard";

  const [tab, setTab] = useState<"google" | "credentials">("google");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [credError, setCredError] = useState("");

  async function handleCredentials(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setCredError("");
    const res = await signIn("credentials", {
      email,
      password,
      callbackUrl,
      redirect: false,
    });
    setLoading(false);
    if (res?.error) {
      setCredError("이메일 또는 비밀번호가 올바르지 않습니다");
    } else if (res?.url) {
      window.location.href = res.url;
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 gap-6">
      <div className="bg-white rounded-xl shadow-sm border p-10 flex flex-col items-center gap-6 w-full max-w-sm">
        <div className="flex flex-col items-center gap-2">
          <h1 className="text-2xl font-bold tracking-tight">기획뷰어</h1>
          <p className="text-sm text-gray-500">허용된 계정만 접근 가능합니다</p>
        </div>

        {error === "AccessDenied" && (
          <div className="w-full bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700 text-center">
            접근이 허용되지 않은 계정입니다
          </div>
        )}

        {/* Tab selector */}
        <div className="flex w-full rounded-lg border overflow-hidden">
          <button
            type="button"
            onClick={() => setTab("google")}
            className="flex-1 py-2 text-sm font-medium transition-colors"
            style={{
              background: tab === "google" ? "#000" : "transparent",
              color: tab === "google" ? "#fff" : "#555",
            }}
          >
            구글로 로그인
          </button>
          <button
            type="button"
            onClick={() => setTab("credentials")}
            className="flex-1 py-2 text-sm font-medium transition-colors"
            style={{
              background: tab === "credentials" ? "#000" : "transparent",
              color: tab === "credentials" ? "#fff" : "#555",
            }}
          >
            회사계정 로그인
          </button>
        </div>

        {tab === "google" ? (
          <Button
            className="w-full"
            onClick={() => signIn("google", { callbackUrl })}
          >
            Google로 계속하기
          </Button>
        ) : (
          <form onSubmit={handleCredentials} className="flex flex-col gap-3 w-full">
            <input
              type="email"
              placeholder="이메일"
              value={email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="w-full rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black"
            />
            <input
              type="password"
              placeholder="비밀번호"
              value={password}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="w-full rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black"
            />
            {credError && (
              <p className="text-sm text-red-600 text-center">{credError}</p>
            )}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "로그인 중..." : "로그인"}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginContent />
    </Suspense>
  );
}
