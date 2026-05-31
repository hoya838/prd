"use client";

import { useSession, signIn } from "next-auth/react";
import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform, AnimatePresence, type Variants } from "framer-motion";
import { useRouter } from "next/navigation";
import { ArrowRight, FileText, Layers, GitBranch, Menu, X } from "lucide-react";
import Link from "next/link";

function Header() {
  const { data: session, status } = useSession();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        background: scrolled ? "rgba(247,247,244,0.85)" : "transparent",
        backdropFilter: scrolled ? "blur(12px)" : "none",
        borderBottom: scrolled ? "1px solid #e6e5e0" : "1px solid transparent",
      }}
    >
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="w-6 h-6 rounded flex items-center justify-center bg-[#26251e]">
            <FileText className="w-3.5 h-3.5 text-[#f7f7f4]" />
          </div>
          <span className="text-sm font-semibold text-[#26251e] tracking-tight">기획뷰어</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          <a href="#features" className="px-3 py-1.5 text-sm text-[#5a5852] hover:text-[#26251e] transition-colors">기능</a>
          <a href="#how" className="px-3 py-1.5 text-sm text-[#5a5852] hover:text-[#26251e] transition-colors">사용법</a>

          {status === "authenticated" ? (
            <button
              onClick={() => router.push("/dashboard")}
              className="ml-3 px-4 py-2 text-sm font-medium text-[#f7f7f4] bg-[#26251e] hover:bg-[#3a3930] transition-colors flex items-center gap-1.5"
              style={{ borderRadius: "8px" }}
            >
              대시보드
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
              className="ml-3 px-4 py-2 text-sm font-medium text-white bg-[#f54e00] hover:bg-[#d04200] transition-colors"
              style={{ borderRadius: "8px" }}
            >
              로그인
            </button>
          )}
        </nav>

        {/* Mobile menu toggle */}
        <button className="md:hidden text-[#26251e]" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
            className="md:hidden border-t border-[#e6e5e0] bg-[#f7f7f4] px-6 py-4 flex flex-col gap-2"
          >
            <a href="#features" className="py-2 text-sm text-[#5a5852]" onClick={() => setMenuOpen(false)}>기능</a>
            <a href="#how" className="py-2 text-sm text-[#5a5852]" onClick={() => setMenuOpen(false)}>사용법</a>
            {status === "authenticated" ? (
              <button
                onClick={() => router.push("/dashboard")}
                className="mt-2 px-4 py-2.5 text-sm font-medium text-[#f7f7f4] bg-[#26251e] rounded-lg text-left"
              >
                대시보드 →
              </button>
            ) : (
              <button
                onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
                className="mt-2 px-4 py-2.5 text-sm font-medium text-white bg-[#f54e00] rounded-lg text-left"
              >
                Google로 로그인
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

const FEATURES = [
  {
    icon: FileText,
    title: "산출물 열람",
    desc: "PRD · IA · 화면명세 · 스프린트 · ERD · 정책 문서를 탭으로 빠르게 전환하며 열람",
  },
  {
    icon: GitBranch,
    title: "산출물 플로우",
    desc: "PRD에서 ERD까지 문서 간 파급 관계를 n8n 스타일 노드 그래프로 시각화",
  },
  {
    icon: Layers,
    title: "화면 플로우",
    desc: "IA 구조를 기반으로 화면 간 내비게이션과 인증 흐름을 드래그 가능한 그래프로 표현",
  },
];

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24, filter: "blur(4px)" },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { delay: i * 0.08, duration: 0.5, ease: "easeOut" },
  }),
};

export default function LandingPage() {
  const { data: session, status } = useSession();
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 60]);

  return (
    <div className="min-h-screen bg-[#f7f7f4]" style={{ fontFamily: "var(--font-sans)" }}>
      <Header />

      {/* Hero */}
      <section ref={heroRef} className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-24 pb-20 overflow-hidden">
        {/* Subtle grid bg */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(circle, #e6e5e0 1px, transparent 1px)",
            backgroundSize: "32px 32px",
            opacity: 0.4,
          }}
        />

        <motion.div style={{ y: heroY }} className="relative z-10 max-w-3xl mx-auto text-center">
          {/* Badge */}
          <motion.div custom={0} initial="hidden" animate="visible" variants={fadeUp}>
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-[#e6e5e0] text-[11px] font-semibold text-[#807d72] uppercase tracking-wider mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-[#1f8a65]" />
              ai_pm_editor 산출물 뷰어
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            custom={1}
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="text-[52px] md:text-[72px] font-normal text-[#26251e] leading-[1.1] tracking-[-1.5px] mb-6"
          >
            기획 산출물을
            <br />
            <span className="text-[#807d72]">한눈에 파악</span>
          </motion.h1>

          {/* Description */}
          <motion.p
            custom={2}
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="text-lg text-[#5a5852] leading-relaxed mb-10 max-w-xl mx-auto"
          >
            PRD부터 ERD까지, ai_pm_editor가 생성한 기획 산출물을
            <br className="hidden md:block" />
            프로젝트별로 열람하고 화면 플로우를 시각화합니다.
          </motion.p>

          {/* CTAs */}
          <motion.div
            custom={3}
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="flex flex-col sm:flex-row items-center justify-center gap-3"
          >
            {status === "authenticated" ? (
              <>
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium text-[#f7f7f4] bg-[#26251e] hover:bg-[#3a3930] transition-colors"
                  style={{ borderRadius: "8px" }}
                >
                  대시보드 바로가기
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <span className="text-sm text-[#807d72]">
                  {session?.user?.name ?? session?.user?.email} 님 로그인 중
                </span>
              </>
            ) : (
              <>
                <button
                  onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
                  className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium text-white bg-[#f54e00] hover:bg-[#d04200] transition-colors"
                  style={{ borderRadius: "8px" }}
                >
                  Google로 시작하기
                  <ArrowRight className="w-4 h-4" />
                </button>
                <span className="text-sm text-[#a09c92]">허용된 계정만 접근 가능</span>
              </>
            )}
          </motion.div>
        </motion.div>

        {/* Dashboard preview mockup */}
        <motion.div
          custom={4}
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="relative z-10 mt-16 w-full max-w-4xl mx-auto"
        >
          <div
            className="bg-white border border-[#e6e5e0] overflow-hidden"
            style={{ borderRadius: "12px", boxShadow: "0 1px 3px rgba(38,37,30,0.06)" }}
          >
            {/* Mockup topbar */}
            <div className="flex items-center gap-1.5 px-4 py-3 border-b border-[#e6e5e0] bg-[#fafaf7]">
              <span className="w-2.5 h-2.5 rounded-full bg-[#e6e5e0]" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#e6e5e0]" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#e6e5e0]" />
              <div className="flex-1 mx-4 h-5 rounded bg-[#f7f7f4] border border-[#e6e5e0] flex items-center px-3">
                <span className="text-[10px] text-[#a09c92]">localhost:3000/dashboard</span>
              </div>
            </div>
            {/* Mockup body */}
            <div className="flex h-48">
              <div className="w-48 border-r border-[#e6e5e0] bg-[#f7f7f4] p-3 flex flex-col gap-2">
                {["기획뷰어", "포토부스앱", "디자인시스템"].map((name, i) => (
                  <div
                    key={i}
                    className={`h-8 rounded-lg px-3 flex items-center ${i === 0 ? "bg-white border border-[#e6e5e0]" : ""}`}
                  >
                    <span className="text-[11px] text-[#5a5852]">{name}</span>
                  </div>
                ))}
              </div>
              <div className="flex-1 p-4 flex flex-col gap-3">
                <div className="flex gap-2">
                  {["PRD", "IA 구조", "화면 명세", "스프린트", "ERD"].map((tab, i) => (
                    <div
                      key={i}
                      className={`px-3 py-1.5 rounded text-[11px] ${i === 0 ? "bg-[#26251e] text-white" : "text-[#807d72]"}`}
                      style={{ borderRadius: "6px" }}
                    >
                      {tab}
                    </div>
                  ))}
                </div>
                <div className="flex-1 bg-[#f7f7f4] rounded-xl border border-[#e6e5e0] p-4 flex flex-col gap-2">
                  {[80, 60, 72, 50].map((w, i) => (
                    <div key={i} className="h-2.5 rounded-full bg-[#e6e5e0]" style={{ width: `${w}%` }} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-6 bg-white border-t border-[#e6e5e0]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-[#807d72] mb-3">기능</p>
            <h2 className="text-[36px] font-normal text-[#26251e] tracking-tight leading-snug">
              기획 문서를 보는 새로운 방법
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {FEATURES.map((f, i) => (
              <motion.div
                key={i}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-60px" }}
                variants={fadeUp}
                className="bg-[#f7f7f4] border border-[#e6e5e0] p-6"
                style={{ borderRadius: "12px" }}
              >
                <div className="w-9 h-9 rounded-lg bg-white border border-[#e6e5e0] flex items-center justify-center mb-4">
                  <f.icon className="w-4.5 h-4.5 text-[#26251e]" />
                </div>
                <h3 className="text-sm font-semibold text-[#26251e] mb-2">{f.title}</h3>
                <p className="text-sm text-[#807d72] leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How */}
      <section id="how" className="py-24 px-6 bg-[#f7f7f4] border-t border-[#e6e5e0]">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-[#807d72] mb-3">사용법</p>
          <h2 className="text-[36px] font-normal text-[#26251e] tracking-tight leading-snug mb-8">
            3단계로 시작
          </h2>
          <div className="flex flex-col gap-4 text-left">
            {[
              { step: "01", title: "Google 로그인", desc: "허용된 구글 계정으로 로그인합니다." },
              { step: "02", title: "프로젝트 선택", desc: "OUTPUT_BASE_PATH 폴더의 프로젝트 목록이 자동으로 표시됩니다." },
              { step: "03", title: "산출물 열람", desc: "탭 전환으로 PRD·IA·명세서·ERD를 확인하고 플로우 그래프를 탐색합니다." },
            ].map(({ step, title, desc }) => (
              <div key={step} className="flex gap-5 items-start bg-white border border-[#e6e5e0] p-5" style={{ borderRadius: "12px" }}>
                <span className="text-[11px] font-semibold text-[#a09c92] uppercase tracking-wider pt-0.5 w-6 shrink-0">{step}</span>
                <div>
                  <p className="text-sm font-semibold text-[#26251e] mb-1">{title}</p>
                  <p className="text-sm text-[#807d72]">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA band */}
      <section className="py-24 px-6 bg-[#26251e] text-center">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-[#807d72] mb-4">지금 시작</p>
        <h2 className="text-[36px] font-normal text-[#f7f7f4] tracking-tight leading-snug mb-8">
          기획 산출물을 팀과 함께 확인하세요
        </h2>
        {status === "authenticated" ? (
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium text-white bg-[#f54e00] hover:bg-[#d04200] transition-colors"
            style={{ borderRadius: "8px" }}
          >
            대시보드 열기 <ArrowRight className="w-4 h-4" />
          </Link>
        ) : (
          <button
            onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
            className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium text-white bg-[#f54e00] hover:bg-[#d04200] transition-colors"
            style={{ borderRadius: "8px" }}
          >
            Google로 시작하기 <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </section>

      {/* Footer */}
      <footer className="bg-[#f7f7f4] border-t border-[#e6e5e0] px-6 py-8 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded flex items-center justify-center bg-[#26251e]">
            <FileText className="w-3 h-3 text-[#f7f7f4]" />
          </div>
          <span className="text-xs font-medium text-[#5a5852]">기획뷰어</span>
        </div>
        <p className="text-xs text-[#a09c92]">ai_pm_editor 산출물 뷰어 · 내부 도구</p>
      </footer>
    </div>
  );
}
