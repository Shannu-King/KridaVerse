import { Outlet, Link, useLocation, useNavigate } from "@tanstack/react-router";
import { AppProvider, useApp } from "@/lib/store";
import { Zap, LayoutDashboard, CalendarDays, Trophy, ShieldCheck, LogOut, LogIn, Github, Twitter, Mail, ArrowLeft } from "lucide-react";
import { Toaster } from "sonner";
import { useEffect, useState } from "react";
import KineticField from "@/components/KineticField";

function BroadcastBanner() {
  const { broadcasts } = useApp();
  if (!broadcasts.length) return null;
  const b = broadcasts[0];
  return (
    <div className="sticky top-0 z-50 border-b border-[oklch(0.35_0.05_260/0.4)] bg-gradient-to-r from-[#6ea8ff22] via-[#8b5cf622] to-[#35e6a422] backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-6 py-2 text-sm">
        <Zap className="h-4 w-4 text-[color:var(--neon-purple)] animate-pulse" />
        <span className="font-medium text-white/90">Broadcast:</span>
        <span className="text-white/80">{b.message}</span>
      </div>
    </div>
  );
}

function Header() {
  const { user, logout } = useApp();
  const [scrolled, setScrolled] = useState(false);
  const loc = useLocation();
  const isAuth = loc.pathname === "/auth";

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const nav = [
    { to: "/", label: "Home" },
    { to: "/schedules", label: "Schedules" },
    { to: "/sports", label: "Register" },
  ];

  if (isAuth) {
    return (
      <header className="sticky top-0 z-40 w-full px-4 md:px-6">
        <div className="mx-auto w-full mt-4 max-w-7xl py-4 px-6 bg-[#0d0e15]/25 rounded-[18px] backdrop-blur-[14px] border border-white/5 flex items-center justify-between">
          <Link to="/" className="group flex items-center gap-2">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#6ea8ff] via-[#8b5cf6] to-[#35e6a4] shadow-[0_0_28px_rgba(110,168,255,0.55),_0_0_12px_rgba(139,92,246,0.3)] transition-shadow duration-300 group-hover:shadow-[0_0_32px_rgba(110,168,255,0.65),_0_0_16px_rgba(139,92,246,0.45)]">
              <span className="text-xl font-bold text-black">K</span>
            </div>
            <span className="text-2xl font-bold tracking-tight neon-text">KridaVerse</span>
          </Link>
          <Link to="/" className="text-sm font-medium text-white/70 hover:text-white transition flex items-center gap-1.5 group">
            <ArrowLeft className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1" /> Back to Home
          </Link>
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-40 w-full transition-all duration-300 px-4 md:px-6">
      <div className={`mx-auto w-full transition-all duration-300 ${
        scrolled 
          ? "mt-2 max-w-6xl py-2 px-5 bg-[#0d0e15]/55 shadow-[0_20px_50px_rgba(0,0,0,0.5)] rounded-[18px] backdrop-blur-[18px]" 
          : "mt-4 max-w-7xl py-4 px-6 bg-[#0d0e15]/25 rounded-[18px] backdrop-blur-[14px]"
      } border border-white/5 flex items-center justify-between`}>
        <Link to="/" className="group flex items-center gap-2">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#6ea8ff] via-[#8b5cf6] to-[#35e6a4] shadow-[0_0_28px_rgba(110,168,255,0.55),_0_0_12px_rgba(139,92,246,0.3)] transition-shadow duration-300 group-hover:shadow-[0_0_32px_rgba(110,168,255,0.65),_0_0_16px_rgba(139,92,246,0.45)]">
            <span className="text-xl font-bold text-black">K</span>
          </div>
          <span className="text-2xl font-bold tracking-tight neon-text">KridaVerse</span>
        </Link>
        
        <nav className="hidden items-center gap-1 md:flex">
          {nav.map((n) => (
            <Link 
              key={n.to} 
              to={n.to} 
              className="relative rounded-lg px-4 py-2 text-sm font-medium text-white/70 transition hover:text-white group" 
              activeProps={{ className: "text-white after:absolute after:bottom-0 after:left-4 after:right-4 after:h-[2px] after:bg-gradient-to-r after:from-[#6ea8ff] after:to-[#8b5cf6] after:rounded-full after:shadow-[0_0_8px_rgba(110,168,255,0.8)]" }}
            >
              {n.label}
              <span className="absolute bottom-0 left-4 right-4 h-[2px] bg-gradient-to-r from-[#6ea8ff] to-[#8b5cf6] scale-x-0 transition-transform duration-300 group-hover:scale-x-100 origin-center rounded-full" />
            </Link>
          ))}
          <Link 
            to="/dashboard" 
            className="relative rounded-lg px-4 py-2 text-sm font-medium text-white/70 transition hover:text-white flex items-center gap-1.5 group" 
            activeProps={{ className: "text-white after:absolute after:bottom-0 after:left-4 after:right-4 after:h-[2px] after:bg-gradient-to-r after:from-[#6ea8ff] after:to-[#8b5cf6] after:rounded-full after:shadow-[0_0_8px_rgba(110,168,255,0.8)]" }}
          >
            <LayoutDashboard className="h-4 w-4" /> Live
            <span className="absolute bottom-0 left-4 right-4 h-[2px] bg-gradient-to-r from-[#6ea8ff] to-[#8b5cf6] scale-x-0 transition-transform duration-300 group-hover:scale-x-100 origin-center rounded-full" />
          </Link>
          <Link 
            to="/admin" 
            className="relative rounded-lg px-4 py-2 text-sm font-medium text-white/70 transition hover:text-white flex items-center gap-1.5 group" 
            activeProps={{ className: "text-white after:absolute after:bottom-0 after:left-4 after:right-4 after:h-[2px] after:bg-gradient-to-r after:from-[#6ea8ff] after:to-[#8b5cf6] after:rounded-full after:shadow-[0_0_8px_rgba(110,168,255,0.8)]" }}
          >
            <ShieldCheck className="h-4 w-4" /> Admin
            <span className="absolute bottom-0 left-4 right-4 h-[2px] bg-gradient-to-r from-[#6ea8ff] to-[#8b5cf6] scale-x-0 transition-transform duration-300 group-hover:scale-x-100 origin-center rounded-full" />
          </Link>
        </nav>
        
        <div className="flex items-center gap-2">
          {user ? (
            <>
              <span className="hidden text-sm text-white/70 sm:inline">Hi, {user.username}</span>
              <button onClick={logout} className="btn-neon inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm">
                <LogOut className="h-4 w-4" /> Logout
              </button>
            </>
          ) : (
            <Link to="/auth" className="btn-neon inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm">
              <LogIn className="h-4 w-4" /> Sign in
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

function Footer() {
  const sportsData = [
    { name: "Cricket", emoji: "🏏" },
    { name: "Football", emoji: "⚽" },
    { name: "Kabaddi", emoji: "🤼" },
    { name: "Volleyball", emoji: "🏐" },
    { name: "Basketball", emoji: "🏀" },
    { name: "Hockey", emoji: "🏑" },
  ];

  return (
    <footer className="mt-32 border-t border-white/5 bg-[#0a0b12]/85 backdrop-blur-2xl relative overflow-hidden">
      {/* Subtle fading gradient divider overlay */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      
      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="flex flex-col items-center text-center">
          {/* Logo */}
          <Link to="/" className="group mb-2 flex items-center gap-2">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#6ea8ff] via-[#8b5cf6] to-[#35e6a4] shadow-[0_0_36px_rgba(110,168,255,0.7),_0_0_16px_rgba(139,92,246,0.4)] transition-shadow duration-300 group-hover:shadow-[0_0_42px_rgba(110,168,255,0.8),_0_0_20px_rgba(139,92,246,0.5)]">
              <span className="text-xl font-bold text-black">K</span>
            </div>
            <span className="text-2xl font-bold tracking-tight neon-text">KridaVerse</span>
          </Link>
          <div className="text-[10px] uppercase tracking-widest text-white/35 mb-4 font-bold">
            Built for Aditya University Sports
          </div>

          <p className="max-w-md text-xs text-white/60 mb-6 leading-relaxed">
            Premium tournament management and real-time analytics command center for collegiate sports.
          </p>

          {/* Platform Quick Links */}
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 mb-6 text-xs font-semibold uppercase tracking-wider text-white/50">
            <Link to="/" className="hover:text-[#6ea8ff] transition-colors duration-300">Home</Link>
            <Link to="/schedules" className="hover:text-[#6ea8ff] transition-colors duration-300">Schedule</Link>
            <Link to="/sports" className="hover:text-[#6ea8ff] transition-colors duration-300">Register</Link>
            <Link to="/dashboard" className="hover:text-[#6ea8ff] transition-colors duration-300">Live Scores</Link>
            <Link to="/admin" className="hover:text-[#6ea8ff] transition-colors duration-300">Admin</Link>
          </div>

          {/* Interactive Sports Chips */}
          <div className="flex flex-wrap justify-center gap-2 mb-8 max-w-xl">
            {sportsData.map((s) => (
              <span 
                key={s.name} 
                className="group/chip flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-3.5 py-1 text-xs text-white/70 hover:border-[#8b5cf6]/40 hover:text-white hover:bg-white/[0.08] hover:shadow-[0_0_10px_rgba(139,92,246,0.1)] transition-all duration-300 cursor-default"
              >
                <span className="max-w-0 overflow-hidden group-hover/chip:max-w-[20px] transition-all duration-500 ease-out inline-block">
                  {s.emoji}
                </span>
                {s.name}
              </span>
            ))}
          </div>

          {/* Circular Glass Social Icons */}
          <div className="flex gap-4 mb-8">
            <a 
              href="https://github.com" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 backdrop-blur-md text-white/60 hover:border-[#6ea8ff]/50 hover:text-white hover:shadow-[0_0_15px_rgba(110,168,255,0.3)] hover:-translate-y-1 transition-all duration-300 group/social"
            >
              <Github className="h-4.5 w-4.5 group-hover/social:scale-110 transition-transform duration-300" />
            </a>
            <a 
              href="https://twitter.com" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 backdrop-blur-md text-white/60 hover:border-[#8b5cf6]/50 hover:text-white hover:shadow-[0_0_15px_rgba(139,92,246,0.3)] hover:-translate-y-1 transition-all duration-300 group/social"
            >
              <Twitter className="h-4.5 w-4.5 group-hover/social:scale-110 transition-transform duration-300" />
            </a>
            <a 
              href="mailto:tarunturpudi@gmail.com" 
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 backdrop-blur-md text-white/60 hover:border-[#35e6a4]/50 hover:text-white hover:shadow-[0_0_15px_rgba(53,230,164,0.3)] hover:-translate-y-1 transition-all duration-300 group/social"
            >
              <Mail className="h-4.5 w-4.5 group-hover/social:scale-110 transition-transform duration-300" />
            </a>
          </div>

          {/* Copyright */}
          <p className="text-[10px] text-white/30 uppercase tracking-widest font-medium">
            &copy; {new Date().getFullYear()} KridaVerse. All Rights Reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

function Chrome() {
  const { user } = useApp();
  const loc = useLocation();
  const navigate = useNavigate();
  const isHome = loc.pathname === "/";
  const isAuth = loc.pathname === "/auth";

  useEffect(() => {
    if (!user && !isHome && !isAuth) {
      navigate({ to: "/auth" });
    }
  }, [user, isHome, isAuth, navigate]);

  const hideChrome = loc.pathname.startsWith("/dashboard") || loc.pathname.startsWith("/admin");

  if (!user && !isHome && !isAuth) {
    return null;
  }

  return (
    <>
      {!isHome && (
        <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden opacity-60">
          <KineticField />
        </div>
      )}
      <BroadcastBanner />
      {!hideChrome && <Header />}
      <main className="min-h-screen">
        <Outlet />
      </main>
      {!hideChrome && <Footer />}
      <Toaster theme="dark" position="top-right" />
    </>
  );
}

export function AppShell() {
  return (
    <AppProvider>
      <Chrome />
    </AppProvider>
  );
}


