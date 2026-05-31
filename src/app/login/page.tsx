"use client";

import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { Button } from "@/components/ui/button";

type Step = "select" | "credentials";

function LoginContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  const callbackUrl = searchParams.get("callbackUrl") ?? "/dashboard";

  const [step, setStep] = useState<Step>("select");
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

        {step === "select" && (
          <div className="flex flex-col gap-3 w-full">
            <button
              type="button"
              onClick={() => setStep("credentials")}
              className="w-full rounded-lg border px-4 py-3 text-left text-sm font-medium transition-colors hover:bg-gray-50 flex items-center gap-3"
            >
              <span className="text-base">🏢</span>
              <span>회사계정 로그인</span>
            </button>
            <button
              type="button"
              onClick={() => signIn("google", { callbackUrl })}
              className="w-full rounded-lg border px-4 py-3 text-left text-sm font-medium transition-colors hover:bg-gray-50 flex items-center gap-3"
            >
              <svg width="16" height="16" viewBox="0 0 48 48" className="shrink-0">
                <path fill="#4285F4" d="M46.6 24.5c0-1.6-.1-3.1-.4-4.5H24v8.5h12.7c-.5 2.9-2.2 5.4-4.7 7v5.8h7.6c4.5-4.1 7-10.2 7-16.8z"/>
                <path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.6-5.8c-2.2 1.5-5 2.3-8.3 2.3-6.4 0-11.8-4.3-13.7-10.1H2.4v6c4 7.9 12.1 13.4 21.6 13.4z"/>
                <path fill="#FBBC05" d="M10.3 28.6A14.7 14.7 0 0 1 9.8 24c0-1.6.3-3.1.7-4.6v-6H2.4A24 24 0 0 0 0 24c0 3.9.9 7.5 2.4 10.7l7.9-6.1z"/>
                <path fill="#EA4335" d="M24 9.5c3.6 0 6.8 1.2 9.3 3.6l7-7C36 2.1 30.5 0 24 0 14.5 0 6.4 5.5 2.4 13.3l7.9 6.1C12.2 13.8 17.6 9.5 24 9.5z"/>
              </svg>
              <span>Google로 로그인</span>
            </button>
          </div>
        )}

        {step === "credentials" && (
          <form onSubmit={handleCredentials} className="flex flex-col gap-3 w-full">
            <input
              type="email"
              placeholder="이메일"
              value={email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
              required
              autoComplete="email"
              autoFocus
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
            <button
              type="button"
              onClick={() => { setStep("select"); setCredError(""); }}
              className="text-xs text-gray-400 hover:text-gray-600 text-center mt-1"
            >
              ← 뒤로
            </button>
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
