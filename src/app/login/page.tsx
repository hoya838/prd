"use client";

import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

const C = {
  canvas:       "#000000",
  surface1:     "#1a1a1a",
  surface2:     "#262626",
  ink:          "#ffffff",
  inkMuted:     "#999999",
  hairline:     "rgba(255,255,255,0.10)",
  hairlineSoft: "rgba(255,255,255,0.06)",
  accentBlue:   "rgba(0,153,255,0.15)",
};

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
  const [focusedField, setFocusedField] = useState<"email" | "password" | null>(null);

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

  const inputStyle = (focused: boolean): React.CSSProperties => ({
    width: "100%",
    background: C.surface1,
    color: C.ink,
    border: `1px solid ${focused ? "rgba(0,153,255,0.5)" : C.hairline}`,
    boxShadow: focused ? `0 0 0 1px ${C.accentBlue}` : "none",
    borderRadius: 10,
    padding: "10px 14px",
    fontSize: 15,
    outline: "none",
    transition: "border-color 0.15s, box-shadow 0.15s",
    fontFamily: "inherit",
    letterSpacing: "-0.15px",
    boxSizing: "border-box" as const,
  });

  const methodButtonStyle: React.CSSProperties = {
    width: "100%",
    background: C.surface1,
    color: C.ink,
    border: `1px solid ${C.hairline}`,
    borderRadius: 15,
    padding: "14px 20px",
    display: "flex",
    alignItems: "center",
    gap: 12,
    cursor: "pointer",
    fontSize: 14,
    fontWeight: 500,
    letterSpacing: "-0.14px",
    transition: "background 0.15s, border-color 0.15s",
    textAlign: "left" as const,
  };

  return (
    <div style={{
      background: C.canvas,
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "'Inter', system-ui, sans-serif",
      fontFeatureSettings: "'cv01','cv05','cv09','cv11','ss03','ss07','dlig'",
    }}>
      <div style={{
        background: C.surface1,
        border: `1px solid ${C.hairline}`,
        borderRadius: 20,
        padding: "40px 36px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 28,
        width: "100%",
        maxWidth: 360,
        boxShadow: `rgba(255,255,255,0.10) 0px 0.5px 0px 0px inset, rgba(0,0,0,0.25) 0px 10px 30px 0px`,
      }}>
        {/* Logo + title */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="기획뷰어" style={{ height: 22, width: "auto", display: "block", marginBottom: 4 }} />
          <p style={{ fontSize: 13, color: C.inkMuted, letterSpacing: "0.04em", textTransform: "uppercase", fontWeight: 500 }}>
            허용된 계정만 접근 가능
          </p>
        </div>

        {/* Error */}
        {error === "AccessDenied" && (
          <div style={{
            width: "100%",
            background: "rgba(255,60,60,0.08)",
            border: "1px solid rgba(255,60,60,0.20)",
            borderRadius: 10,
            padding: "10px 14px",
            fontSize: 13,
            color: "#ff6b6b",
            textAlign: "center",
            letterSpacing: "-0.13px",
          }}>
            접근이 허용되지 않은 계정입니다
          </div>
        )}

        {/* Select step */}
        {step === "select" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10, width: "100%" }}>
            <button
              type="button"
              onClick={() => setStep("credentials")}
              style={methodButtonStyle}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = C.surface2; (e.currentTarget as HTMLElement).style.borderColor = C.hairline; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = C.surface1; }}
            >
              <span style={{ fontSize: 18, lineHeight: 1 }}>🏢</span>
              <span>회사계정 로그인</span>
            </button>
            <button
              type="button"
              onClick={() => signIn("google", { callbackUrl })}
              style={methodButtonStyle}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = C.surface2; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = C.surface1; }}
            >
              <svg width="16" height="16" viewBox="0 0 48 48" style={{ flexShrink: 0 }}>
                <path fill="#4285F4" d="M46.6 24.5c0-1.6-.1-3.1-.4-4.5H24v8.5h12.7c-.5 2.9-2.2 5.4-4.7 7v5.8h7.6c4.5-4.1 7-10.2 7-16.8z"/>
                <path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.6-5.8c-2.2 1.5-5 2.3-8.3 2.3-6.4 0-11.8-4.3-13.7-10.1H2.4v6c4 7.9 12.1 13.4 21.6 13.4z"/>
                <path fill="#FBBC05" d="M10.3 28.6A14.7 14.7 0 0 1 9.8 24c0-1.6.3-3.1.7-4.6v-6H2.4A24 24 0 0 0 0 24c0 3.9.9 7.5 2.4 10.7l7.9-6.1z"/>
                <path fill="#EA4335" d="M24 9.5c3.6 0 6.8 1.2 9.3 3.6l7-7C36 2.1 30.5 0 24 0 14.5 0 6.4 5.5 2.4 13.3l7.9 6.1C12.2 13.8 17.6 9.5 24 9.5z"/>
              </svg>
              <span>Google로 로그인</span>
            </button>
          </div>
        )}

        {/* Credentials step */}
        {step === "credentials" && (
          <form onSubmit={handleCredentials} style={{ display: "flex", flexDirection: "column", gap: 10, width: "100%" }}>
            <input
              type="email"
              placeholder="이메일"
              value={email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
              onFocus={() => setFocusedField("email")}
              onBlur={() => setFocusedField(null)}
              required
              autoComplete="email"
              autoFocus
              style={inputStyle(focusedField === "email")}
            />
            <input
              type="password"
              placeholder="비밀번호"
              value={password}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
              onFocus={() => setFocusedField("password")}
              onBlur={() => setFocusedField(null)}
              required
              autoComplete="current-password"
              style={inputStyle(focusedField === "password")}
            />
            {credError && (
              <p style={{ fontSize: 13, color: "#ff6b6b", textAlign: "center", margin: 0, letterSpacing: "-0.13px" }}>
                {credError}
              </p>
            )}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                background: loading ? C.surface2 : C.ink,
                color: C.canvas,
                border: "none",
                borderRadius: 100,
                padding: "10px 15px",
                fontSize: 14,
                fontWeight: 500,
                letterSpacing: "-0.14px",
                cursor: loading ? "not-allowed" : "pointer",
                transition: "opacity 0.15s",
                opacity: loading ? 0.6 : 1,
                fontFamily: "inherit",
              }}
            >
              {loading ? "로그인 중..." : "로그인"}
            </button>
            <button
              type="button"
              onClick={() => { setStep("select"); setCredError(""); }}
              style={{
                background: "none",
                border: "none",
                color: C.inkMuted,
                fontSize: 13,
                cursor: "pointer",
                textAlign: "center",
                padding: "4px 0",
                letterSpacing: "-0.13px",
                fontFamily: "inherit",
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = C.ink; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = C.inkMuted; }}
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
