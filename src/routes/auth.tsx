import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { ParticleCanvas } from "@/components/ParticleCanvas";
import { useApp } from "@/lib/store";
import { Mail, Lock, User, GraduationCap, Building2 } from "lucide-react";

export const Route = createFileRoute("/auth")({ component: AuthPage });

function AuthPage() {
  const nav = useNavigate();
  const { login } = useApp();
  const [mode, setMode] = useState<"login" | "signup">("signup");
  const [f, setF] = useState({ username: "", email: "", password: "", branch: "CSE", year: "1" });
  const [err, setErr] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    
    const identifier = f.email.trim();
    const password = f.password.trim();

    // 1. Hardcoded fallback checks
    if (identifier.toLowerCase() === "shanmukh" && password === "Shannu@123") {
      login({
        username: "Shanmukh",
        email: "shanmukh@kridaverse.io",
        branch: "CSE",
        year: "3",
        token: "mock.shanmukh." + Date.now(),
        isAdmin: false,
      });
      nav({ to: "/" });
      return;
    }

    if (identifier.toLowerCase() === "kridaverseadmin" && password === "admin@123") {
      login({
        username: "KridaVerseAdmin",
        email: "admin@kridaverse.io",
        branch: "CSE",
        year: "4",
        token: "mock.admin." + Date.now(),
        isAdmin: true,
      });
      nav({ to: "/" });
      return;
    }

    if (mode === "signup") {
      if (!f.username.trim() || !identifier || !password) {
        return setErr("Please fill in all fields");
      }
      let usersList: any[] = [];
      try {
        const stored = localStorage.getItem("users");
        if (stored) usersList = JSON.parse(stored);
      } catch {}

      const exists = usersList.some((u: any) => u.username.toLowerCase() === f.username.trim().toLowerCase() || u.email.toLowerCase() === identifier.toLowerCase());
      if (exists) {
        return setErr("Username or Email already registered");
      }

      const newUser = {
        username: f.username.trim(),
        email: identifier,
        password: password,
        branch: f.branch,
        year: f.year,
        isAdmin: f.username.toLowerCase().includes("admin") || identifier.toLowerCase().includes("admin")
      };

      usersList.push(newUser);
      try {
        localStorage.setItem("users", JSON.stringify(usersList));
      } catch {}

      login({
        username: newUser.username,
        email: newUser.email,
        branch: newUser.branch,
        year: newUser.year,
        token: "mock." + btoa(newUser.email) + "." + Date.now(),
        isAdmin: newUser.isAdmin,
      });
      nav({ to: "/" });
    } else {
      if (!identifier || !password) {
        return setErr("Please fill in all fields");
      }
      let usersList: any[] = [];
      try {
        const stored = localStorage.getItem("users");
        if (stored) usersList = JSON.parse(stored);
      } catch {}

      const found = usersList.find((u: any) => 
        (u.email.toLowerCase() === identifier.toLowerCase() || u.username.toLowerCase() === identifier.toLowerCase()) && 
        u.password === password
      );

      if (found) {
        login({
          username: found.username,
          email: found.email,
          branch: found.branch,
          year: found.year,
          token: "mock." + btoa(found.email) + "." + Date.now(),
          isAdmin: found.isAdmin,
        });
        nav({ to: "/" });
      } else {
        setErr("Invalid username/email or password");
      }
    }
  };

  return (
    <div className="relative flex min-h-[calc(100vh-80px)] items-center justify-center overflow-hidden px-6 py-12">
      <ParticleCanvas className="absolute inset-0 h-full w-full" />
      <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}
        className="glass neon-border relative w-full max-w-md rounded-3xl p-8">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold neon-text">{mode === "login" ? "Welcome back" : "Join KridaVerse"}</h1>
          <p className="mt-2 text-sm text-white/60">{mode === "login" ? "Sign in to continue" : "Create an account to register your team"}</p>
        </div>

        <div className="mb-6 grid grid-cols-2 gap-1 rounded-xl bg-white/5 p-1">
          {(["login", "signup"] as const).map((m) => (
            <button key={m} onClick={() => setMode(m)} className={`rounded-lg py-2 text-sm font-medium transition ${mode === m ? "bg-gradient-to-r from-[#6ea8ff]/30 to-[#8b5cf6]/30 text-white shadow-[0_0_20px_rgba(110,168,255,0.3)]" : "text-white/60 hover:text-white"}`}>
              {m === "login" ? "Login" : "Sign up"}
            </button>
          ))}
        </div>

        <form onSubmit={submit} className="space-y-4">
          {mode === "signup" && (
            <Field icon={User} placeholder="Username" value={f.username} onChange={(v: string) => setF({ ...f, username: v })} />
          )}
          <Field icon={Mail} type="text" placeholder="Username or Email" value={f.email} onChange={(v: string) => setF({ ...f, email: v })} />
          <Field icon={Lock} type="password" placeholder="Password" value={f.password} onChange={(v: string) => setF({ ...f, password: v })} />
          {mode === "signup" && (
            <div className="grid grid-cols-2 gap-3">
              <Select icon={Building2} value={f.branch} onChange={(v: string) => setF({ ...f, branch: v })} options={["CSE", "IT", "ECE"]} label="Branch" />
              <Select icon={GraduationCap} value={f.year} onChange={(v: string) => setF({ ...f, year: v })} options={["1", "2", "3", "4"]} label="Year" />
            </div>
          )}
          {err && <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">{err}</div>}
          <button type="submit" className="btn-neon w-full rounded-xl py-3 text-sm font-semibold">
            {mode === "login" ? "Sign In" : "Create Account"}
          </button>
          <p className="text-center text-xs text-white/40">Tip: use admin credentials or sign up</p>
        </form>
      </motion.div>
    </div>
  );
}

function Field({ icon: Icon, ...props }: any) {
  return (
    <div className="group relative">
      <Icon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
      <input {...props} onChange={(e: any) => props.onChange(e.target.value)}
        className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-10 pr-3 text-sm text-white placeholder-white/40 outline-none transition focus:border-[color:var(--neon-blue)] focus:bg-white/10 focus:shadow-[0_0_0_3px_rgba(110,168,255,0.15)]" />
    </div>
  );
}

function Select({ icon: Icon, value, onChange, options, label }: any) {
  return (
    <div className="relative">
      <Icon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
      <select value={value} onChange={(e) => onChange(e.target.value)}
        className="w-full appearance-none rounded-xl border border-white/10 bg-white/5 py-3 pl-10 pr-3 text-sm text-white outline-none transition focus:border-[color:var(--neon-blue)]">
        {options.map((o: string) => <option key={o} value={o} className="bg-[#121320]">{label} {o}</option>)}
      </select>
    </div>
  );
}
