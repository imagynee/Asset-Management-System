import { useState, useEffect, useRef } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import {
  Package,
  Users,
  Bell,
  BarChart3,
  Truck,
  Wrench,
  ArrowRight,
  Zap,
  ChevronDown,
  Building2,
} from 'lucide-react';
import Logo from '../components/ui/Logo';

/* ─── Feature cards data ─── */
const features = [
  {
    icon: Package,
    title: 'Asset Registration & Lifecycle',
    desc: 'Register and track organizational hardware and software assets from procurement to retirement.',
    color: 'from-blue-500/20 to-indigo-500/10',
    iconColor: '#3b82f6',
    delay: 0,
  },
  {
    icon: Users,
    title: 'Employee Allocation',
    desc: 'Assign assets to employees, monitor active usage, and streamline returns and handovers.',
    color: 'from-violet-500/20 to-purple-500/10',
    iconColor: '#8b5cf6',
    delay: 80,
  },
  {
    icon: Bell,
    title: 'Warranty Tracking',
    desc: 'Monitor asset warranties to prevent lapses and receive timely alerts before they expire.',
    color: 'from-blue-400/20 to-sky-500/10',
    iconColor: '#60a5fa',
    delay: 160,
  },
  {
    icon: BarChart3,
    title: 'Reports & Analytics',
    desc: 'Export structured lists of assets, employee allocations, and maintenance histories.',
    color: 'from-indigo-500/20 to-blue-600/10',
    iconColor: '#6366f1',
    delay: 240,
  },
  {
    icon: Building2,
    title: 'Vendor & Departments',
    desc: 'Keep vendor records and department data linked directly to asset purchases and support contracts.',
    color: 'from-violet-400/20 to-fuchsia-500/10',
    iconColor: '#a78bfa',
    delay: 320,
  },
  {
    icon: Wrench,
    title: 'Maintenance Log',
    desc: 'Track assets currently undergoing repair or service, keeping inventory counts accurate.',
    color: 'from-blue-600/20 to-violet-500/10',
    iconColor: '#818cf8',
    delay: 400,
  },
];

/* ─── Hook: detect element visibility ─── */
function useInView(options = {}) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setInView(true); obs.disconnect(); } },
      { threshold: 0.12, ...options }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return [ref, inView];
}

/* ─── Feature Card ─── */
function FeatureCard({ icon: Icon, title, desc, color, iconColor, delay, inView }) {
  return (
    <div
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? 'translateY(0)' : 'translateY(32px)',
        transition: `opacity 0.6s ease ${delay}ms, transform 0.6s ease ${delay}ms`,
      }}
      className="home-feature-card"
    >
      <div className={`home-feature-card-glow bg-linear-to-br ${color}`} />
      <div
        className="home-feature-icon"
        style={{ background: `${iconColor}22`, color: iconColor }}
      >
        <Icon size={22} />
      </div>
      <h3 className="home-feature-title">{title}</h3>
      <p className="home-feature-desc">{desc}</p>
    </div>
  );
}

/* ─── Main Component ─── */
export default function Home() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [heroVisible, setHeroVisible] = useState(false);

  const [featuresRef, featuresInView] = useInView();
  const [techRef, techInView] = useInView();

  useEffect(() => {
    const t = setTimeout(() => setHeroVisible(true), 100);
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => { clearTimeout(t); window.removeEventListener('scroll', onScroll); };
  }, []);

  if (localStorage.getItem('isAdminLoggedIn') === 'true') {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <>
      {/* ── Inline styles & keyframes ── */}
      <style>{`
        /* ── Animated gradient mesh ── */
        @keyframes gradient-shift {
          0%   { background-position: 0% 50%; }
          25%  { background-position: 100% 0%; }
          50%  { background-position: 100% 100%; }
          75%  { background-position: 0% 100%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes gradient-rotate {
          0%   { transform: rotate(0deg)   scale(1.6); }
          100% { transform: rotate(360deg) scale(1.6); }
        }
        @keyframes mesh-breathe {
          0%, 100% { opacity: 0.55; transform: scale(1); }
          50%       { opacity: 0.75; transform: scale(1.08); }
        }

        /* Orb float */
        @keyframes orb-float {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33%       { transform: translate(30px, -20px) scale(1.05); }
          66%       { transform: translate(-20px, 15px) scale(0.97); }
        }
        @keyframes orb-float-rev {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33%       { transform: translate(-25px, 18px) scale(1.04); }
          66%       { transform: translate(20px, -12px) scale(0.96); }
        }
        @keyframes shimmer {
          0%   { background-position: -400px 0; }
          100% { background-position: 400px 0; }
        }
        @keyframes pulse-ring {
          0%   { transform: scale(1); opacity: 0.6; }
          100% { transform: scale(1.7); opacity: 0; }
        }
        @keyframes bounce-arrow {
          0%, 100% { transform: translateY(0); }
          50%       { transform: translateY(6px); }
        }

        /* ── Gradient canvas ── */
        .home-gradient-canvas {
          position: absolute;
          inset: -60px;
          background: conic-gradient(
            from 0deg at 30% 40%,
            rgba(37,99,235,0.28),
            rgba(99,102,241,0.22),
            rgba(139,92,246,0.2),
            rgba(59,130,246,0.26),
            rgba(37,99,235,0.28)
          );
          filter: blur(90px);
          animation: gradient-rotate 18s linear infinite;
          border-radius: 50%;
          pointer-events: none;
          will-change: transform;
        }
        /* secondary softer layer counter-rotating */
        .home-gradient-canvas-2 {
          position: absolute;
          inset: -80px;
          background: conic-gradient(
            from 180deg at 70% 60%,
            rgba(139,92,246,0.18),
            rgba(37,99,235,0.14),
            rgba(99,102,241,0.2),
            rgba(139,92,246,0.18)
          );
          filter: blur(110px);
          animation: gradient-rotate 26s linear infinite reverse;
          border-radius: 50%;
          pointer-events: none;
          will-change: transform;
        }
        /* light-mode — dial back opacity a lot */
        html:not(.dark) .home-gradient-canvas {
          background: conic-gradient(
            from 0deg at 30% 40%,
            rgba(37,99,235,0.1),
            rgba(99,102,241,0.08),
            rgba(139,92,246,0.07),
            rgba(59,130,246,0.1),
            rgba(37,99,235,0.1)
          );
        }
        html:not(.dark) .home-gradient-canvas-2 {
          background: conic-gradient(
            from 180deg at 70% 60%,
            rgba(139,92,246,0.06),
            rgba(37,99,235,0.05),
            rgba(99,102,241,0.07),
            rgba(139,92,246,0.06)
          );
        }

        /* ── Background orbs ── */
        .home-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          pointer-events: none;
          will-change: transform;
        }
        /* Primary blue orb — top-left */
        .home-orb-1 {
          width: 520px; height: 520px;
          background: radial-gradient(circle, rgba(59,130,246,0.32) 0%, transparent 70%);
          top: -140px; left: -140px;
          animation: orb-float 12s ease-in-out infinite;
        }
        /* Violet accent orb — bottom-right */
        .home-orb-2 {
          width: 440px; height: 440px;
          background: radial-gradient(circle, rgba(139,92,246,0.22) 0%, transparent 70%);
          bottom: -100px; right: -100px;
          animation: orb-float-rev 15s ease-in-out infinite;
        }
        /* Indigo mid orb */
        .home-orb-3 {
          width: 300px; height: 300px;
          background: radial-gradient(circle, rgba(99,102,241,0.18) 0%, transparent 70%);
          top: 40%; left: 50%;
          animation: orb-float 18s ease-in-out infinite reverse;
        }

        /* ── Badge ── */
        .home-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 6px 16px 6px 8px;
          border-radius: 999px;
          border: 1px solid rgba(59,130,246,0.4);
          background: rgba(59,130,246,0.09);
          backdrop-filter: blur(12px);
          font-size: 0.75rem;
          font-weight: 600;
          color: #93c5fd;
          letter-spacing: 0.04em;
          position: relative;
          overflow: hidden;
        }
        .home-badge::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
          background-size: 400px 100%;
          animation: shimmer 3s linear infinite;
        }
        .home-badge-dot {
          width: 8px; height: 8px;
          border-radius: 50%;
          background: #3b82f6;
          position: relative;
          flex-shrink: 0;
        }
        .home-badge-dot::after {
          content: '';
          position: absolute;
          inset: -2px;
          border-radius: 50%;
          border: 2px solid #3b82f6;
          animation: pulse-ring 1.5s ease-out infinite;
        }

        /* ── Gradient headline ── */
        .home-gradient-text {
          background: linear-gradient(135deg, #3b82f6 0%, #6366f1 50%, #8b5cf6 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        /* ── CTA button ── */
        .home-cta-btn {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 14px 32px;
          border-radius: 14px;
          font-size: 0.95rem;
          font-weight: 700;
          border: none;
          cursor: pointer;
          background: linear-gradient(135deg, #2563eb, #7c3aed);
          color: #fff;
          box-shadow: 0 8px 32px rgba(37,99,235,0.35), 0 2px 8px rgba(139,92,246,0.18);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
          position: relative;
          overflow: hidden;
        }
        .home-cta-btn::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.16) 0%, transparent 60%);
          pointer-events: none;
        }
        .home-cta-btn:hover {
          transform: translateY(-2px) scale(1.02);
          box-shadow: 0 12px 40px rgba(37,99,235,0.45), 0 4px 14px rgba(139,92,246,0.25);
        }
        .home-cta-btn:active { transform: translateY(0) scale(0.99); }

        /* ── Ghost button ── */
        .home-ghost-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 13px 28px;
          border-radius: 14px;
          font-size: 0.9rem;
          font-weight: 600;
          cursor: pointer;
          border: 1px solid rgba(148,163,184,0.28);
          background: rgba(255,255,255,0.05);
          backdrop-filter: blur(8px);
          color: inherit;
          text-decoration: none;
          transition: background 0.2s ease, border-color 0.2s ease, transform 0.2s ease;
        }
        .home-ghost-btn:hover {
          background: rgba(255,255,255,0.1);
          border-color: rgba(59,130,246,0.45);
          transform: translateY(-1px);
        }

        /* ── Feature cards ── */
        .home-feature-card {
          position: relative;
          padding: 28px 24px;
          border-radius: 20px;
          border: 1px solid rgba(148,163,184,0.12);
          background: rgba(255,255,255,0.04);
          backdrop-filter: blur(16px);
          overflow: hidden;
          cursor: default;
          transition: transform 0.25s ease, box-shadow 0.25s ease;
        }
        .home-feature-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 14px 40px rgba(37,99,235,0.12), 0 4px 16px rgba(139,92,246,0.1);
        }
        .home-feature-card-glow {
          position: absolute;
          inset: 0;
          opacity: 0;
          transition: opacity 0.25s ease;
          border-radius: inherit;
          pointer-events: none;
        }
        .home-feature-card:hover .home-feature-card-glow { opacity: 1; }
        .home-feature-icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 48px; height: 48px;
          border-radius: 14px;
          margin-bottom: 16px;
        }
        .home-feature-title {
          font-size: 0.95rem;
          font-weight: 700;
          margin: 0 0 8px;
          color: inherit;
        }
        .home-feature-desc {
          font-size: 0.82rem;
          line-height: 1.65;
          color: #94a3b8;
          margin: 0;
        }

        /* ── Tech stack badges ── */
        .home-tech-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 7px 16px;
          border-radius: 999px;
          border: 1px solid rgba(59,130,246,0.22);
          background: rgba(59,130,246,0.07);
          font-size: 0.8rem;
          font-weight: 600;
          color: #93c5fd;
          transition: background 0.2s ease, transform 0.2s ease;
        }
        .home-tech-badge:hover {
          background: rgba(59,130,246,0.13);
          transform: translateY(-1px);
        }

        /* ── Section fade ── */
        .home-section-fade {
          opacity: 0;
          transform: translateY(24px);
          transition: opacity 0.7s ease, transform 0.7s ease;
        }
        .home-section-fade.visible {
          opacity: 1;
          transform: translateY(0);
        }

        /* ── Divider ── */
        .home-divider {
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(99,102,241,0.3), rgba(139,92,246,0.2), transparent);
          margin: 0 auto;
          max-width: 600px;
        }

        /* ── Scroll indicator ── */
        .home-scroll-indicator {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          font-size: 0.7rem;
          color: #64748b;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          animation: bounce-arrow 2s ease-in-out infinite;
        }

        /* ── Sticky header ── */
        .home-header {
          position: sticky;
          top: 0;
          z-index: 50;
          transition: background 0.3s ease, box-shadow 0.3s ease;
        }
        .home-header.scrolled {
          background: rgba(10,14,25,0.88) !important;
          backdrop-filter: blur(20px);
          box-shadow: 0 1px 0 rgba(99,102,241,0.12);
        }

        /* ── Light-mode overrides ── */
        html:not(.dark) .home-feature-card {
          background: rgba(255,255,255,0.72);
          border-color: rgba(148,163,184,0.2);
        }
        html:not(.dark) .home-feature-card:hover {
          box-shadow: 0 14px 40px rgba(37,99,235,0.1), 0 4px 16px rgba(139,92,246,0.08);
        }
        html:not(.dark) .home-orb-1 {
          background: radial-gradient(circle, rgba(59,130,246,0.18) 0%, transparent 70%);
        }
        html:not(.dark) .home-orb-2 {
          background: radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%);
        }
        html:not(.dark) .home-orb-3 {
          background: radial-gradient(circle, rgba(99,102,241,0.1) 0%, transparent 70%);
        }
        html:not(.dark) .home-feature-desc { color: #64748b; }
        html:not(.dark) .home-ghost-btn { background: rgba(0,0,0,0.03); }
        html:not(.dark) .home-header.scrolled {
          background: rgba(248,250,252,0.9) !important;
          box-shadow: 0 1px 0 rgba(99,102,241,0.1);
        }
        html:not(.dark) .home-badge {
          border-color: rgba(37,99,235,0.3);
          background: rgba(37,99,235,0.06);
          color: #2563eb;
        }
        html:not(.dark) .home-badge-dot { background: #2563eb; }
        html:not(.dark) .home-badge-dot::after { border-color: #2563eb; }
        html:not(.dark) .home-tech-badge {
          border-color: rgba(37,99,235,0.25);
          background: rgba(37,99,235,0.06);
          color: #2563eb;
        }
        html:not(.dark) .home-tech-badge:hover { background: rgba(37,99,235,0.11); }
      `}</style>

      <div className="min-h-screen text-slate-900 dark:text-white transition-colors duration-300 flex flex-col">

        {/* ── Animated Background Layer ── */}
        <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }}>
          {/* Moving gradient mesh */}
          <div className="home-gradient-canvas" />
          <div className="home-gradient-canvas-2" />
          {/* Floating radial orbs on top of mesh */}
          <div className="home-orb home-orb-1" />
          <div className="home-orb home-orb-2" />
          <div className="home-orb home-orb-3" />
          {/* Subtle dot grid */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundImage: `
                radial-gradient(rgba(99,102,241,0.07) 1px, transparent 1px)
              `,
              backgroundSize: '28px 28px',
            }}
          />
        </div>

        {/* ── Header ── */}
        <header
          className={`home-header border-b border-transparent ${scrolled ? 'scrolled' : ''}`}
        >
          <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
            {/* Brand */}
            <div className="flex items-center gap-3">
              <div
                style={{
                  padding: '8px',
                  borderRadius: '12px',
                  background: 'rgba(59,130,246,0.12)',
                  border: '1px solid rgba(59,130,246,0.22)',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <Logo className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-bold tracking-tight">Asset Management</p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium tracking-widest uppercase">
                  System
                </p>
              </div>
            </div>

            {/* Nav + CTA */}
            <div className="flex items-center gap-3">
              <a
                href="#features"
                className="hidden sm:block text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors duration-200 px-3 py-1.5"
              >
                Features
              </a>
              <a
                href="#tech"
                className="hidden sm:block text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors duration-200 px-3 py-1.5"
              >
                Tech
              </a>
              <button
                className="home-cta-btn"
                style={{ padding: '10px 22px', fontSize: '0.85rem' }}
                onClick={() => navigate('/login')}
              >
                Admin Login
                <ArrowRight size={15} />
              </button>
            </div>
          </div>
        </header>

        {/* ── Main ── */}
        <main className="flex-1" style={{ position: 'relative', zIndex: 1 }}>

          {/* ── Hero ── */}
          <section className="mx-auto max-w-5xl px-6 pt-20 pb-16 sm:pt-28 sm:pb-24 text-center">

            {/* Badge */}
            <div
              style={{
                opacity: heroVisible ? 1 : 0,
                transform: heroVisible ? 'translateY(0)' : 'translateY(16px)',
                transition: 'opacity 0.7s ease 0.1s, transform 0.7s ease 0.1s',
                marginBottom: '28px',
                display: 'flex',
                justifyContent: 'center',
              }}
            >
              <span className="home-badge">
                <span className="home-badge-dot" />
                Centralized Asset Tracking Platform
              </span>
            </div>

            {/* Headline */}
            <h1
              className="font-extrabold tracking-tight leading-tight"
              style={{
                fontSize: 'clamp(2.2rem, 6vw, 4rem)',
                opacity: heroVisible ? 1 : 0,
                transform: heroVisible ? 'translateY(0)' : 'translateY(24px)',
                transition: 'opacity 0.7s ease 0.22s, transform 0.7s ease 0.22s',
                marginBottom: '24px',
              }}
            >
              Manage Your{' '}
              <span className="home-gradient-text">Organization&apos;s</span>
              <br />
              Assets — Effortlessly
            </h1>

            {/* Sub-headline */}
            <p
              className="mx-auto text-slate-500 dark:text-slate-400 leading-relaxed"
              style={{
                maxWidth: '600px',
                fontSize: 'clamp(0.95rem, 2vw, 1.1rem)',
                opacity: heroVisible ? 1 : 0,
                transform: heroVisible ? 'translateY(0)' : 'translateY(24px)',
                transition: 'opacity 0.7s ease 0.34s, transform 0.7s ease 0.34s',
                marginBottom: '40px',
              }}
            >
              A web-based portal to monitor asset allocations, warranty records,
              employee assignments, and maintenance &amp; return status through
              one central dashboard.
            </p>

            {/* CTA buttons */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                gap: '14px',
                flexWrap: 'wrap',
                opacity: heroVisible ? 1 : 0,
                transform: heroVisible ? 'translateY(0)' : 'translateY(24px)',
                transition: 'opacity 0.7s ease 0.46s, transform 0.7s ease 0.46s',
                marginBottom: '48px',
              }}
            >
              <button className="home-cta-btn" onClick={() => navigate('/login')}>
                <Zap size={17} />
                Access Admin Portal
                <ArrowRight size={17} />
              </button>
              <a href="#features" className="home-ghost-btn">
                Explore Features
                <ChevronDown size={16} />
              </a>
            </div>

            {/* Scroll indicator */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                opacity: heroVisible ? 1 : 0,
                transition: 'opacity 0.7s ease 0.62s',
              }}
            >
              <div className="home-scroll-indicator">
                <ChevronDown size={18} />
              </div>
            </div>
          </section>

          {/* ── Divider ── */}
          <div className="home-divider" />

          {/* ── Features Section ── */}
          <section
            id="features"
            ref={featuresRef}
            className={`mx-auto max-w-6xl px-6 py-20 home-section-fade ${featuresInView ? 'visible' : ''}`}
          >
            <div className="text-center mb-14">
              <span
                style={{
                  display: 'inline-block',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: '#3b82f6',
                  marginBottom: '10px',
                }}
              >
                Capabilities
              </span>
              <h2
                className="font-extrabold tracking-tight"
                style={{ fontSize: 'clamp(1.6rem, 4vw, 2.2rem)', marginBottom: '12px' }}
              >
                Everything you need to manage assets
              </h2>
              <p
                className="text-slate-500 dark:text-slate-400"
                style={{ maxWidth: '480px', margin: '0 auto', fontSize: '0.92rem' }}
              >
                Six powerful modules designed to cover every aspect of
                organizational asset management.
              </p>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: '20px',
              }}
            >
              {features.map((f) => (
                <FeatureCard key={f.title} {...f} inView={featuresInView} />
              ))}
            </div>
          </section>

          {/* ── Divider ── */}
          <div className="home-divider" />

          {/* ── Tech Stack ── */}
          <section
            id="tech"
            ref={techRef}
            className={`mx-auto max-w-4xl px-6 py-20 home-section-fade ${techInView ? 'visible' : ''}`}
          >
            <div
              style={{
                borderRadius: '24px',
                border: '1px solid rgba(99,102,241,0.15)',
                background: 'rgba(255,255,255,0.03)',
                backdropFilter: 'blur(16px)',
                padding: '40px 44px',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {/* Inner glow */}
              <div
                style={{
                  position: 'absolute',
                  top: '-80px', right: '-80px',
                  width: '260px', height: '260px',
                  background: 'radial-gradient(circle, rgba(139,92,246,0.14) 0%, transparent 70%)',
                  filter: 'blur(40px)',
                  pointerEvents: 'none',
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  bottom: '-60px', left: '-60px',
                  width: '200px', height: '200px',
                  background: 'radial-gradient(circle, rgba(59,130,246,0.13) 0%, transparent 70%)',
                  filter: 'blur(40px)',
                  pointerEvents: 'none',
                }}
              />

              <div style={{ position: 'relative' }}>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5 mb-8">
                  <div>
                    <span
                      style={{
                        display: 'block',
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        letterSpacing: '0.12em',
                        textTransform: 'uppercase',
                        color: '#3b82f6',
                        marginBottom: '6px',
                      }}
                    >
                      Technology Stack
                    </span>
                    <h2 className="font-extrabold" style={{ fontSize: '1.5rem', margin: 0 }}>
                      Built for the modern enterprise
                    </h2>
                    <p
                      className="text-slate-500 dark:text-slate-400"
                      style={{ marginTop: '8px', fontSize: '0.85rem', lineHeight: 1.7 }}
                    >
                      Administrator access is required to manage assets, employee
                      assignments, departments, and audit logs.
                    </p>
                  </div>
                  <button
                    className="home-cta-btn"
                    style={{ padding: '10px 24px', fontSize: '0.85rem', flexShrink: 0 }}
                    onClick={() => navigate('/login')}
                  >
                    Get Started
                    <ArrowRight size={15} />
                  </button>
                </div>

                {/* Tech pills */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                  {['React', 'Node.js', 'Express', 'MongoDB'].map((t) => (
                    <span key={t} className="home-tech-badge">
                      <span
                        style={{
                          width: 7, height: 7,
                          borderRadius: '50%',
                          background: 'currentColor',
                          display: 'inline-block',
                          opacity: 0.7,
                        }}
                      />
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </main>

        {/* ── Footer ── */}
        <footer
          style={{
            position: 'relative',
            zIndex: 1,
            borderTop: '1px solid rgba(99,102,241,0.1)',
            padding: '28px 24px',
          }}
        >
          <div className="mx-auto max-w-6xl flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Logo className="h-4 w-4" />
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Asset Management System
              </span>
            </div>
            <span className="text-xs text-slate-400 dark:text-slate-600">
              © {new Date().getFullYear()} — All rights reserved
            </span>
            
          </div>
        </footer>
      </div>
    </>
  );
}
