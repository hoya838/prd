"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform, AnimatePresence, type Variants } from "framer-motion";
import { useRouter } from "next/navigation";
import { ArrowRight, FileText, Layers, GitBranch, Menu, X } from "lucide-react";
import Link from "next/link";

// ── Design tokens (design.md) ──────────────────────────────────────────────
const C = {
  canvas:       "#000000",
  surface1:     "#1a1a1a",
  surface2:     "#262626",
  ink:          "#ffffff",
  inkMuted:     "#999999",
  hairline:     "rgba(255,255,255,0.10)",
  hairlineSoft: "rgba(255,255,255,0.06)",
} as const;

const G = {
  violet:  "linear-gradient(135deg,#2d1b69 0%,#6d28d9 50%,#4f46e5 100%)",
  orange:  "linear-gradient(135deg,#7c2d12 0%,#ea580c 55%,#f59e0b 100%)",
  coral:   "linear-gradient(135deg,#881337 0%,#e11d48 50%,#fb923c 100%)",
} as const;

// ── Shared styles ───────────────────────────────────────────────────────────
const pill     = { borderRadius: "100px" } as const;
const card20   = { borderRadius: "20px"  } as const;
const card30   = { borderRadius: "30px"  } as const;
const btnPrimary: React.CSSProperties = {
  ...pill,
  background:  C.ink,
  color:       C.canvas,
  fontSize:    14,
  fontWeight:  500,
  padding:     "10px 20px",
  letterSpacing: "-0.14px",
  display:     "inline-flex",
  alignItems:  "center",
  gap:         6,
  border:      "none",
  cursor:      "pointer",
  whiteSpace:  "nowrap",
  transition:  "opacity 0.15s",
} as const;
const btnSecondary: React.CSSProperties = {
  ...pill,
  background:  C.surface1,
  color:       C.ink,
  fontSize:    14,
  fontWeight:  500,
  padding:     "10px 20px",
  letterSpacing: "-0.14px",
  display:     "inline-flex",
  alignItems:  "center",
  gap:         6,
  border:      `1px solid ${C.hairline}`,
  cursor:      "pointer",
  whiteSpace:  "nowrap",
  transition:  "opacity 0.15s",
} as const;

// ── Animations ──────────────────────────────────────────────────────────────
const fadeUp: Variants = {
  hidden:  { opacity: 0, y: 28, filter: "blur(6px)" },
  visible: (i: number = 0) => ({
    opacity: 1, y: 0, filter: "blur(0px)",
    transition: { delay: i * 0.08, duration: 0.55, ease: "easeOut" },
  }),
};

// ── Header ──────────────────────────────────────────────────────────────────
function Header() {
  const { data: session, status } = useSession();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 48);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const headerBg = scrolled
    ? "rgba(0,0,0,0.85)"
    : "transparent";

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        background:    headerBg,
        backdropFilter: scrolled ? "blur(16px) saturate(180%)" : "none",
        borderBottom:  scrolled ? `1px solid ${C.hairlineSoft}` : "1px solid transparent",
        height:        56,
      }}
    >
      <div
        className="mx-auto flex items-center justify-between px-6 h-full"
        style={{ maxWidth: 1200 }}
      >
        {/* Logo */}
        <Link href="/" style={{ textDecoration: "none", display: "inline-flex", alignItems: "center" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="기획뷰어" style={{ height: 18, width: "auto", display: "block" }} />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          <a href="#features" style={{ padding: "6px 12px", fontSize: 14, color: C.inkMuted, textDecoration: "none", borderRadius: 8, transition: "color 0.15s" }}
            onMouseEnter={e => (e.currentTarget.style.color = C.ink)}
            onMouseLeave={e => (e.currentTarget.style.color = C.inkMuted)}>기능</a>
          <a href="#how" style={{ padding: "6px 12px", fontSize: 14, color: C.inkMuted, textDecoration: "none", borderRadius: 8, transition: "color 0.15s" }}
            onMouseEnter={e => (e.currentTarget.style.color = C.ink)}
            onMouseLeave={e => (e.currentTarget.style.color = C.inkMuted)}>사용법</a>

          <div className="flex items-center gap-2 ml-3">
            {status === "authenticated" ? (
              <>
                <button
                  style={btnSecondary}
                  onClick={() => signOut({ callbackUrl: "/" })}
                  onMouseEnter={e => ((e.currentTarget as HTMLElement).style.opacity = "0.7")}
                  onMouseLeave={e => ((e.currentTarget as HTMLElement).style.opacity = "1")}
                >
                  로그아웃
                </button>
                <button
                  style={btnPrimary}
                  onClick={() => router.push("/dashboard")}
                  onMouseEnter={e => ((e.currentTarget as HTMLElement).style.opacity = "0.85")}
                  onMouseLeave={e => ((e.currentTarget as HTMLElement).style.opacity = "1")}
                >
                  대시보드 <ArrowRight style={{ width: 14, height: 14 }} />
                </button>
              </>
            ) : (
              <button
                style={btnPrimary}
                onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
                onMouseEnter={e => ((e.currentTarget as HTMLElement).style.opacity = "0.85")}
                onMouseLeave={e => ((e.currentTarget as HTMLElement).style.opacity = "1")}
              >
                로그인
              </button>
            )}
          </div>
        </nav>

        {/* Mobile hamburger */}
        <button
          className="md:hidden"
          style={{ color: C.ink, padding: 6, background: "none", border: "none", cursor: "pointer" }}
          onClick={() => setOpen(!open)}
          aria-label="메뉴"
        >
          {open ? <X style={{ width: 20, height: 20 }} /> : <Menu style={{ width: 20, height: 20 }} />}
        </button>
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
            className="md:hidden flex flex-col gap-1 px-6 pb-5 pt-3"
            style={{ background: "rgba(0,0,0,0.95)", backdropFilter: "blur(16px)", borderBottom: `1px solid ${C.hairlineSoft}` }}
          >
            <a href="#features" style={{ padding: "10px 0", fontSize: 15, color: C.inkMuted, textDecoration: "none" }} onClick={() => setOpen(false)}>기능</a>
            <a href="#how"      style={{ padding: "10px 0", fontSize: 15, color: C.inkMuted, textDecoration: "none" }} onClick={() => setOpen(false)}>사용법</a>
            <div className="flex flex-col gap-2 mt-3">
              {status === "authenticated" ? (
                <>
                  <button style={{ ...btnSecondary, justifyContent: "center" }} onClick={() => signOut({ callbackUrl: "/" })}>로그아웃</button>
                  <button style={{ ...btnPrimary,   justifyContent: "center" }} onClick={() => router.push("/dashboard")}>대시보드</button>
                </>
              ) : (
                <button style={{ ...btnPrimary, justifyContent: "center" }} onClick={() => signIn("google", { callbackUrl: "/dashboard" })}>Google로 로그인</button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

// ── Landing Page ─────────────────────────────────────────────────────────────
export default function LandingPage() {
  const { data: session, status } = useSession();
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 48]);

  return (
    <div style={{ background: C.canvas, minHeight: "100vh", fontFamily: "var(--font-sans)" }}>
      <Header />

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section
        ref={heroRef}
        className="relative flex flex-col items-center justify-center overflow-hidden"
        style={{ minHeight: "100svh", padding: "96px 24px 80px" }}
      >
        {/* Subtle dot grid */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle, ${C.hairlineSoft} 1px, transparent 1px)`,
            backgroundSize: "40px 40px",
          }}
        />
        {/* Ambient glow */}
        <div className="absolute pointer-events-none" style={{
          top: "30%", left: "50%", transform: "translate(-50%,-50%)",
          width: 800, height: 800, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(109,40,217,0.06) 0%, transparent 70%)",
        }} />

        <motion.div style={{ y: heroY, maxWidth: 780, margin: "0 auto", textAlign: "center" }} className="relative z-10 w-full">
          {/* Badge */}
          <motion.div custom={0} initial="hidden" animate="visible" variants={fadeUp}>
            <span style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "6px 14px", ...pill,
              background: C.surface1, border: `1px solid ${C.hairline}`,
              fontSize: 12, fontWeight: 500, color: C.inkMuted, letterSpacing: "0.02em",
              textTransform: "uppercase", marginBottom: 32,
            }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e", flexShrink: 0 }} />
              ai_pm_editor 산출물 뷰어
            </span>
          </motion.div>

          {/* Headline — display-xl level */}
          <motion.h1
            custom={1}
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            style={{
              fontSize: "clamp(48px, 8vw, 85px)",
              fontWeight: 500,
              lineHeight: 0.95,
              letterSpacing: "clamp(-2px, -0.05em, -4.25px)",
              color: C.ink,
              margin: "0 0 24px",
            }}
          >
            기획 산출물을
            <br />
            <span style={{ color: C.inkMuted }}>한눈에 파악</span>
          </motion.h1>

          {/* Subhead — body-lg */}
          <motion.p
            custom={2}
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            style={{
              fontSize: 18,
              fontWeight: 400,
              lineHeight: 1.5,
              letterSpacing: "-0.18px",
              color: C.inkMuted,
              margin: "0 auto 40px",
              maxWidth: 520,
            }}
          >
            PRD부터 ERD까지, ai_pm_editor가 생성한 기획 산출물을
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
                  style={{ ...btnPrimary, textDecoration: "none" }}
                  onMouseEnter={e => ((e.currentTarget as HTMLElement).style.opacity = "0.85")}
                  onMouseLeave={e => ((e.currentTarget as HTMLElement).style.opacity = "1")}
                >
                  대시보드 바로가기 <ArrowRight style={{ width: 16, height: 16 }} />
                </Link>
                <span style={{ fontSize: 14, color: C.inkMuted }}>
                  {session?.user?.name ?? session?.user?.email} 님 로그인 중
                </span>
              </>
            ) : (
              <>
                <button
                  style={btnPrimary}
                  onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
                  onMouseEnter={e => ((e.currentTarget as HTMLElement).style.opacity = "0.85")}
                  onMouseLeave={e => ((e.currentTarget as HTMLElement).style.opacity = "1")}
                >
                  Google로 시작하기 <ArrowRight style={{ width: 16, height: 16 }} />
                </button>
                <span style={{ fontSize: 14, color: C.surface2.replace("#262626","#555") }}>허용된 계정만 접근 가능</span>
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
          className="relative z-10 w-full"
          style={{ maxWidth: 900, margin: "64px auto 0" }}
        >
          <div style={{
            ...card20,
            background: C.surface1,
            border: `1px solid ${C.hairline}`,
            boxShadow: `0 0 0 1px ${C.hairlineSoft}, 0 40px 80px rgba(0,0,0,0.6)`,
            overflow: "hidden",
          }}>
            {/* Topbar */}
            <div className="flex items-center gap-2 px-4 py-3" style={{ borderBottom: `1px solid ${C.hairlineSoft}`, background: C.canvas }}>
              {["#ff5f56","#ffbd2e","#27c93f"].map((c,i) => (
                <span key={i} style={{ width: 10, height: 10, borderRadius: "50%", background: c, opacity: 0.7 }} />
              ))}
              <div className="flex-1 mx-4 flex items-center px-3" style={{ height: 22, background: C.surface1, ...card30, border: `1px solid ${C.hairlineSoft}` }}>
                <span style={{ fontSize: 11, color: "#444" }}>localhost:3000/dashboard</span>
              </div>
            </div>
            {/* Body */}
            <div className="flex" style={{ height: 200 }}>
              {/* Sidebar mock */}
              <div className="flex-none flex flex-col gap-2 p-3" style={{ width: 180, borderRight: `1px solid ${C.hairlineSoft}`, background: "#0a0a0a" }}>
                {["기획뷰어", "포토부스앱", "디자인시스템"].map((n, i) => (
                  <div key={i} className="flex items-center px-3" style={{
                    height: 34, ...card20,
                    background: i === 0 ? C.surface2 : "transparent",
                    border: i === 0 ? `1px solid ${C.hairline}` : "none",
                  }}>
                    <span style={{ fontSize: 11, color: i === 0 ? C.ink : "#444" }}>{n}</span>
                  </div>
                ))}
              </div>
              {/* Content mock */}
              <div className="flex-1 p-4 flex flex-col gap-3">
                <div className="flex gap-2 flex-wrap">
                  {["PRD", "IA 구조", "화면 명세", "스프린트", "ERD"].map((t, i) => (
                    <div key={i} className="flex items-center justify-center" style={{
                      padding: "4px 12px", borderRadius: 100,
                      background: i === 0 ? C.ink : C.surface1,
                      color: i === 0 ? C.canvas : C.inkMuted,
                      fontSize: 11, fontWeight: 500,
                    }}>{t}</div>
                  ))}
                </div>
                <div className="flex-1 flex flex-col gap-2.5 p-4" style={{ background: C.canvas, ...card20, border: `1px solid ${C.hairlineSoft}` }}>
                  {[78, 55, 68, 42].map((w, i) => (
                    <div key={i} style={{ height: 10, width: `${w}%`, borderRadius: 5, background: C.surface2 }} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ── Features ──────────────────────────────────────────────────────── */}
      <section id="features" style={{ padding: "96px 24px", borderTop: `1px solid ${C.hairlineSoft}` }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 64 }}>
            <p style={{ fontSize: 12, fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase", color: C.inkMuted, marginBottom: 12 }}>기능</p>
            <h2 style={{
              fontSize: "clamp(32px, 5vw, 62px)",
              fontWeight: 500,
              lineHeight: 1.0,
              letterSpacing: "clamp(-1.5px, -0.05em, -3.1px)",
              color: C.ink,
              margin: 0,
            }}>
              기획 문서를 보는<br />새로운 방법
            </h2>
          </div>

          {/* 2-col grid: 3 charcoal cards + 1 gradient spotlight */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Gradient spotlight — violet */}
            <motion.div
              custom={0} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }} variants={fadeUp}
              className="md:row-span-2 flex flex-col justify-between"
              style={{ background: G.violet, ...card30, padding: 32, minHeight: 280 }}
            >
              <div>
                <div style={{ marginBottom: 16 }}>
                  <GitBranch style={{ width: 28, height: 28, color: "rgba(255,255,255,0.8)" }} />
                </div>
                <h3 style={{ fontSize: 22, fontWeight: 500, lineHeight: 1.2, letterSpacing: "-0.8px", color: C.ink, margin: "0 0 12px" }}>산출물 플로우</h3>
                <p style={{ fontSize: 15, lineHeight: 1.5, letterSpacing: "-0.15px", color: "rgba(255,255,255,0.65)", margin: 0 }}>
                  PRD에서 ERD까지 문서 간 파급 관계를 n8n 스타일 노드 그래프로 시각화합니다. 노드 클릭 시 해당 산출물이 슬라이드 패널로 열립니다.
                </p>
              </div>
              <div style={{ marginTop: 32, padding: "8px 16px", background: "rgba(255,255,255,0.15)", borderRadius: 100, display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, color: C.ink, fontWeight: 500, width: "fit-content" }}>
                노드 드래그 이동 가능
              </div>
            </motion.div>

            {/* Feature card 1 */}
            <motion.div
              custom={1} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }} variants={fadeUp}
              style={{ background: C.surface1, ...card20, padding: 28, border: `1px solid ${C.hairline}` }}
            >
              <div style={{ marginBottom: 16 }}>
                <FileText style={{ width: 24, height: 24, color: C.inkMuted }} />
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 500, letterSpacing: "-0.5px", color: C.ink, margin: "0 0 10px" }}>산출물 열람</h3>
              <p style={{ fontSize: 14, lineHeight: 1.5, letterSpacing: "-0.14px", color: C.inkMuted, margin: 0 }}>
                PRD · IA · 화면명세 · 스프린트 · ERD · 정책 문서를 탭으로 빠르게 전환하며 열람합니다.
              </p>
            </motion.div>

            {/* Feature card 2 */}
            <motion.div
              custom={2} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }} variants={fadeUp}
              style={{ background: C.surface1, ...card20, padding: 28, border: `1px solid ${C.hairline}` }}
            >
              <div style={{ marginBottom: 16 }}>
                <Layers style={{ width: 24, height: 24, color: C.inkMuted }} />
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 500, letterSpacing: "-0.5px", color: C.ink, margin: "0 0 10px" }}>화면 플로우</h3>
              <p style={{ fontSize: 14, lineHeight: 1.5, letterSpacing: "-0.14px", color: C.inkMuted, margin: 0 }}>
                IA 구조 기반으로 화면 간 내비게이션과 인증 흐름을 드래그 가능한 그래프로 표현합니다.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── How-to ────────────────────────────────────────────────────────── */}
      <section id="how" style={{ padding: "96px 24px", borderTop: `1px solid ${C.hairlineSoft}` }}>
        <div style={{ maxWidth: 680, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <p style={{ fontSize: 12, fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase", color: C.inkMuted, marginBottom: 12 }}>사용법</p>
            <h2 style={{
              fontSize: "clamp(32px, 5vw, 62px)",
              fontWeight: 500,
              lineHeight: 1.0,
              letterSpacing: "clamp(-1.5px, -0.05em, -3.1px)",
              color: C.ink,
              margin: 0,
            }}>3단계로 시작</h2>
          </div>

          <div className="flex flex-col gap-3">
            {[
              { n: "01", title: "Google 로그인",  desc: "허용된 구글 계정으로 로그인합니다." },
              { n: "02", title: "프로젝트 선택",  desc: "OUTPUT_BASE_PATH 폴더의 프로젝트 목록이 자동으로 표시됩니다." },
              { n: "03", title: "산출물 열람",    desc: "탭 전환으로 PRD·IA·명세서·ERD를 확인하고 플로우 그래프를 탐색합니다." },
            ].map(({ n, title, desc }, i) => (
              <motion.div
                key={n}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-40px" }}
                variants={fadeUp}
                className="flex gap-5 items-start"
                style={{ background: C.surface1, ...card20, padding: "22px 24px", border: `1px solid ${C.hairline}` }}
              >
                <span style={{ fontSize: 11, fontWeight: 500, color: "#444", letterSpacing: "0.08em", textTransform: "uppercase", paddingTop: 2, flexShrink: 0, width: 24 }}>{n}</span>
                <div>
                  <p style={{ fontSize: 15, fontWeight: 500, color: C.ink, margin: "0 0 6px", letterSpacing: "-0.15px" }}>{title}</p>
                  <p style={{ fontSize: 14, color: C.inkMuted, margin: 0, lineHeight: 1.5, letterSpacing: "-0.14px" }}>{desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA band ──────────────────────────────────────────────────────── */}
      <section style={{ padding: "96px 24px", borderTop: `1px solid ${C.hairlineSoft}`, textAlign: "center" }}>
        <p style={{ fontSize: 12, fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase", color: C.inkMuted, marginBottom: 20 }}>지금 시작</p>
        <h2 style={{
          fontSize: "clamp(36px, 6vw, 85px)",
          fontWeight: 500,
          lineHeight: 0.95,
          letterSpacing: "clamp(-2px, -0.05em, -4.25px)",
          color: C.ink,
          margin: "0 0 40px",
        }}>
          기획 산출물을<br />팀과 함께 확인하세요
        </h2>
        {status === "authenticated" ? (
          <Link href="/dashboard" style={{ ...btnPrimary, textDecoration: "none" }}
            onMouseEnter={e => ((e.currentTarget as HTMLElement).style.opacity = "0.85")}
            onMouseLeave={e => ((e.currentTarget as HTMLElement).style.opacity = "1")}
          >
            대시보드 열기 <ArrowRight style={{ width: 16, height: 16 }} />
          </Link>
        ) : (
          <button style={btnPrimary}
            onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
            onMouseEnter={e => ((e.currentTarget as HTMLElement).style.opacity = "0.85")}
            onMouseLeave={e => ((e.currentTarget as HTMLElement).style.opacity = "1")}
          >
            Google로 시작하기 <ArrowRight style={{ width: 16, height: 16 }} />
          </button>
        )}
      </section>

      {/* ── Footer ────────────────────────────────────────────────────────── */}
      <footer
        className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6"
        style={{ borderTop: `1px solid ${C.hairlineSoft}`, padding: "40px 24px", maxWidth: "none" }}
      >
        <div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="기획뷰어" style={{ height: 18, width: "auto", display: "block", opacity: 0.4 }} />
        </div>
        <p style={{ fontSize: 12, color: "#333", letterSpacing: "-0.12px", margin: 0 }}>ai_pm_editor 산출물 뷰어 · 내부 도구</p>
      </footer>
    </div>
  );
}
