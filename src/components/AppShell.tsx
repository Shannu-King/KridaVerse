import { Outlet, Link, useLocation, useNavigate } from "@tanstack/react-router";
import { AppProvider, useApp } from "@/lib/store";
import { Zap, LayoutDashboard, CalendarDays, Trophy, ShieldCheck, LogOut, LogIn } from "lucide-react";
import { Toaster } from "sonner";
import { useEffect } from "react";
import KineticField from "@/components/KineticField";

function BroadcastBanner() {
  const { broadcasts } = useApp();
  if (!broadcasts.length) return null;
  const b = broadcasts[0];
  return (
    <div className="sticky top-0 z-50 border-b border-[oklch(0.35_0.05_260/0.4)] bg-gradient-to-r from-[#6ea8ff22] via-[#ff3b5c22] to-[#35e6a422] backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-6 py-2 text-sm">
        <Zap className="h-4 w-4 text-[color:var(--neon-crimson)] animate-pulse" />
        <span className="font-medium text-white/90">Broadcast:</span>
        <span className="text-white/80">{b.message}</span>
      </div>
    </div>
  );
}

function Header() {
  const { user, logout } = useApp();
  const nav = [
    { to: "/", label: "Home" },
    { to: "/schedules", label: "Schedules", icon: CalendarDays },
    { to: "/sports", label: "Register", icon: Trophy },
  ];
  return (
    <header className="sticky top-0 z-40 border-b border-white/5 bg-[#0d0e15]/40 backdrop-blur-[12px]">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link to="/" className="group flex items-center gap-2">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#6ea8ff] via-[#ff3b5c] to-[#35e6a4] shadow-[0_0_24px_rgba(110,168,255,0.5)]">
            <span className="text-xl font-bold text-black">K</span>
          </div>
          <span className="text-2xl font-bold tracking-tight neon-text">KridaVerse</span>
        </Link>
        <nav className="hidden items-center gap-1 md:flex">
          {nav.map((n) => (
            <Link key={n.to} to={n.to} className="rounded-lg px-4 py-2 text-sm font-medium text-white/70 transition hover:bg-white/5 hover:text-white" activeProps={{ className: "text-white bg-white/5" }}>
              {n.label}
            </Link>
          ))}
          <Link to="/dashboard" className="rounded-lg px-4 py-2 text-sm font-medium text-white/70 transition hover:bg-white/5 hover:text-white flex items-center gap-1.5" activeProps={{ className: "text-white bg-white/5" }}>
            <LayoutDashboard className="h-4 w-4" /> Live
          </Link>
          <Link to="/admin" className="rounded-lg px-4 py-2 text-sm font-medium text-white/70 transition hover:bg-white/5 hover:text-white flex items-center gap-1.5" activeProps={{ className: "text-white bg-white/5" }}>
            <ShieldCheck className="h-4 w-4" /> Admin
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
  return (
    <footer className="mt-24 border-t border-white/5 bg-[#0a0b12]/60 backdrop-blur-xl">
      <div className="mx-auto grid max-w-7xl gap-8 px-6 py-12 md:grid-cols-4">
        <div>
          <div className="mb-3 text-xl font-bold neon-text">KridaVerse</div>
          <p className="text-sm text-white/60">Premium tournament management and live tracking for collegiate sports.</p>
        </div>
        <div>
          <div className="mb-3 text-sm font-semibold text-white">Platform</div>
          <ul className="space-y-2 text-sm text-white/60">
            <li><Link to="/schedules">Schedules</Link></li>
            <li><Link to="/dashboard">Live Scores</Link></li>
            <li><Link to="/sports">Register Team</Link></li>
          </ul>
        </div>
        <div>
          <div className="mb-3 text-sm font-semibold text-white">Sports</div>
          <ul className="space-y-2 text-sm text-white/60">
            <li>Cricket · Football · Kabaddi</li>
            <li>Basketball · Volleyball · Hockey</li>
          </ul>
        </div>
        <div>
          <div className="mb-3 text-sm font-semibold text-white">Contact</div>
          <p className="text-sm text-white/60">tarunturpudi@gmail.com</p>
        </div>
      </div>
      <div className="border-t border-white/5 py-4 text-center text-xs text-white/40">© 2026 KridaVerse. All rights reserved.</div>
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


