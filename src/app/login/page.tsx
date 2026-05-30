"use client";

import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { Button } from "@/components/ui/button";

function LoginContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

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

        <Button
          className="w-full"
          onClick={() => signIn("google", { callbackUrl: "/" })}
        >
          Google로 로그인
        </Button>
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
