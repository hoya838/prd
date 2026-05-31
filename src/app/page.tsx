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
        background: scrolled ? "rgba(22,21,15,0.88)" : "transparent",
        backdropFilter: scrolled ? "blur(14px)" : "none",
        borderBottom: scrolled ? "1px solid rgba(247,247,244,0.08)" : "1px solid transparent",
      }}
    >
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="w-6 h-6 rounded flex items-center justify-center bg-[#f7f7f4]">
            <FileText className="w-3.5 h-3.5 text-[#16150f]" />
          </div>
          <span className="text-sm font-semibold text-[#f7f7f4] tracking-tight">기획뷰어</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          <a href="#features" className="px-3 py-1.5 text-sm text-[#807d72] hover:text-[#f7f7f4] transition-colors">기능</a>
          <a href="#how" className="px-3 py-1.5 text-sm text-[#807d72] hover:text-[#f7f7f4] transition-colors">사용법</a>

          {status === "authenticated" ? (
            <button
              onClick={() => router.push("/dashboard")}
              className="ml-3 px-4 py-2 text-sm font-medium text-[#16150f] bg-[#f7f7f4] hover:bg-white transition-colors flex items-center gap-1.5"
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
        <button className="md:hidden text-[#f7f7f4]" onClick={() => setMenuOpen(!menuOpen)}>
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
            className="md:hidden border-t px-6 py-4 flex flex-col gap-2"
            style={{ background: "#1a1917", borderColor: "rgba(247,247,244,0.08)" }}
          >
            <a href="#features" className="py-2 text-sm text-[#807d72]" onClick={() => setMenuOpen(false)}>기능</a>
            <a href="#how" className="py-2 text-sm text-[#807d72]" onClick={() => setMenuOpen(false)}>사용법</a>
            {status === "authenticated" ? (
              <button
                onClick={() => router.push("/dashboard")}
                className="mt-2 px-4 py-2.5 text-sm font-medium text-[#16150f] bg-[#f7f7f4] rounded-lg text-left"
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
    dot: "#9fbbe0",
  },
  {
    icon: GitBranch,
    title: "산출물 플로우",
    desc: "PRD에서 ERD까지 문서 간 파급 관계를 n8n 스타일 노드 그래프로 시각화",
    dot: "#c0a8dd",
  },
  {
    icon: Layers,
    title: "화면 플로우",
    desc: "IA 구조를 기반으로 화면 간 내비게이션과 인증 흐름을 드래그 가능한 그래프로 표현",
    dot: "#9fc9a2",
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
    <div className="min-h-screen" style={{ background: "#16150f", fontFamily: "var(--font-sans)" }}>
      <Header />

      {/* Hero */}
      <section ref={heroRef} className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-24 pb-20 overflow-hidden">
        {/* Dot grid */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(circle, rgba(247,247,244,0.07) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />
        {/* Glow */}
        <div
          className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
          style={{
            width: 600,
            height: 600,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(245,78,0,0.08) 0%, transparent 70%)",
          }}
        />

        <motion.div style={{ y: heroY }} className="relative z-10 max-w-3xl mx-auto text-center">
          {/* Badge */}
          <motion.div custom={0} initial="hidden" animate="visible" variants={fadeUp}>
            <span
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-semibold uppercase tracking-wider mb-8"
              style={{
                background: "rgba(247,247,244,0.06)",
                border: "1px solid rgba(247,247,244,0.12)",
                color: "#807d72",
              }}
            >
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
            className="text-[52px] md:text-[72px] font-normal leading-[1.1] tracking-[-1.5px] mb-6"
            style={{ color: "#f7f7f4" }}
          >
            기획 산출물을
            <br />
            <span style={{ color: "#5a5852" }}>한눈에 파악</span>
          </motion.h1>

          {/* Description */}
          <motion.p
            custom={2}
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="text-lg leading-relaxed mb-10 max-w-xl mx-auto"
            style={{ color: "#5a5852" }}
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
                  className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium text-[#16150f] bg-[#f7f7f4] hover:bg-white transition-colors"
                  style={{ borderRadius: "8px" }}
                >
                  대시보드 바로가기
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <span className="text-sm" style={{ color: "#5a5852" }}>
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
                <span className="text-sm" style={{ color: "#3a3930" }}>허용된 계정만 접근 가능</span>
              </>
            )}
          </motion.div>
        </motion.div>

        {/* Dashboard mockup */}
        <motion.div
          custom={4}
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="relative z-10 mt-16 w-full max-w-4xl mx-auto"
        >
          <div
            className="overflow-hidden"
            style={{
              borderRadius: "12px",
              border: "1px solid rgba(247,247,244,0.08)",
              background: "#1a1917",
              boxShadow: "0 0 0 1px rgba(247,247,244,0.04), 0 32px 64px rgba(0,0,0,0.4)",
            }}
          >
            {/* Topbar */}
            <div
              className="flex items-center gap-1.5 px-4 py-3"
              style={{ borderBottom: "1px solid rgba(247,247,244,0.06)", background: "#16150f" }}
            >
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: "rgba(247,247,244,0.1)" }} />
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: "rgba(247,247,244,0.1)" }} />
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: "rgba(247,247,244,0.1)" }} />
              <div
                className="flex-1 mx-4 h-5 rounded flex items-center px-3"
                style={{ background: "rgba(247,247,244,0.04)", border: "1px solid rgba(247,247,244,0.06)" }}
              >
                <span className="text-[10px]" style={{ color: "#3a3930" }}>localhost:3000/dashboard</span>
              </div>
            </div>
            {/* Body */}
            <div className="flex h-48">
              <div
                className="w-48 p-3 flex flex-col gap-2"
                style={{ borderRight: "1px solid rgba(247,247,244,0.06)", background: "#16150f" }}
              >
                {["기획뷰어", "포토부스앱", "디자인시스템"].map((name, i) => (
                  <div
                    key={i}
                    className="h-8 rounded-lg px-3 flex items-center"
                    style={{
                      background: i === 0 ? "rgba(247,247,244,0.06)" : "transparent",
                      border: i === 0 ? "1px solid rgba(247,247,244,0.08)" : "none",
                    }}
                  >
                    <span className="text-[11px]" style={{ color: i === 0 ? "#a09c92" : "#3a3930" }}>{name}</span>
                  </div>
                ))}
              </div>
              <div className="flex-1 p-4 flex flex-col gap-3">
                <div className="flex gap-2">
                  {["PRD", "IA 구조", "화면 명세", "스프린트", "ERD"].map((tab, i) => (
                    <div
                      key={i}
                      className="px-3 py-1.5 text-[11px]"
                      style={{
                        borderRadius: "6px",
                        background: i === 0 ? "#f54e00" : "rgba(247,247,244,0.05)",
                        color: i === 0 ? "white" : "#3a3930",
                      }}
                    >
                      {tab}
                    </div>
                  ))}
                </div>
                <div
                  className="flex-1 p-4 flex flex-col gap-2"
                  style={{
                    borderRadius: "10px",
                    border: "1px solid rgba(247,247,244,0.06)",
                    background: "rgba(247,247,244,0.02)",
                  }}
                >
                  {[80, 60, 72, 50].map((w, i) => (
                    <div
                      key={i}
                      className="h-2.5 rounded-full"
                      style={{ width: `${w}%`, background: "rgba(247,247,244,0.07)" }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Features */}
      <section
        id="features"
        className="py-24 px-6"
        style={{ background: "#1a1917", borderTop: "1px solid rgba(247,247,244,0.06)" }}
      >
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-[11px] font-semibold uppercase tracking-wider mb-3" style={{ color: "#3a3930" }}>기능</p>
            <h2 className="text-[36px] font-normal tracking-tight leading-snug" style={{ color: "#f7f7f4" }}>
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
                className="p-6"
                style={{
                  borderRadius: "12px",
                  background: "rgba(247,247,244,0.03)",
                  border: "1px solid rgba(247,247,244,0.07)",
                }}
              >
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center mb-4"
                  style={{
                    background: f.dot + "18",
                    border: `1px solid ${f.dot}30`,
                  }}
                >
                  <f.icon className="w-4 h-4" style={{ color: f.dot }} />
                </div>
                <h3 className="text-sm font-semibold mb-2" style={{ color: "#f7f7f4" }}>{f.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "#5a5852" }}>{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How */}
      <section
        id="how"
        className="py-24 px-6"
        style={{ background: "#16150f", borderTop: "1px solid rgba(247,247,244,0.06)" }}
      >
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-[11px] font-semibold uppercase tracking-wider mb-3" style={{ color: "#3a3930" }}>사용법</p>
          <h2 className="text-[36px] font-normal tracking-tight leading-snug mb-8" style={{ color: "#f7f7f4" }}>
            3단계로 시작
          </h2>
          <div className="flex flex-col gap-4 text-left">
            {[
              { step: "01", title: "Google 로그인", desc: "허용된 구글 계정으로 로그인합니다." },
              { step: "02", title: "프로젝트 선택", desc: "OUTPUT_BASE_PATH 폴더의 프로젝트 목록이 자동으로 표시됩니다." },
              { step: "03", title: "산출물 열람", desc: "탭 전환으로 PRD·IA·명세서·ERD를 확인하고 플로우 그래프를 탐색합니다." },
            ].map(({ step, title, desc }) => (
              <div
                key={step}
                className="flex gap-5 items-start p-5"
                style={{
                  borderRadius: "12px",
                  background: "rgba(247,247,244,0.03)",
                  border: "1px solid rgba(247,247,244,0.07)",
                }}
              >
                <span className="text-[11px] font-semibold uppercase tracking-wider pt-0.5 w-6 shrink-0" style={{ color: "#3a3930" }}>{step}</span>
                <div>
                  <p className="text-sm font-semibold mb-1" style={{ color: "#f7f7f4" }}>{title}</p>
                  <p className="text-sm" style={{ color: "#5a5852" }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA band */}
      <section
        className="py-24 px-6 text-center"
        style={{ background: "#1a1917", borderTop: "1px solid rgba(247,247,244,0.06)" }}
      >
        <p className="text-[11px] font-semibold uppercase tracking-wider mb-4" style={{ color: "#3a3930" }}>지금 시작</p>
        <h2 className="text-[36px] font-normal tracking-tight leading-snug mb-8" style={{ color: "#f7f7f4" }}>
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
      <footer
        className="px-6 py-8 flex items-center justify-between"
        style={{ borderTop: "1px solid rgba(247,247,244,0.06)", background: "#16150f" }}
      >
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded flex items-center justify-center" style={{ background: "rgba(247,247,244,0.08)" }}>
            <FileText className="w-3 h-3" style={{ color: "#807d72" }} />
          </div>
          <span className="text-xs font-medium" style={{ color: "#3a3930" }}>기획뷰어</span>
        </div>
        <p className="text-xs" style={{ color: "#2a2922" }}>ai_pm_editor 산출물 뷰어 · 내부 도구</p>
      </footer>
    </div>
  );
}
