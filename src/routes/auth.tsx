import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ParticleCanvas } from "@/components/ParticleCanvas";
import { useApp } from "@/lib/store";
import { 
  Mail, 
  Lock, 
  User, 
  GraduationCap, 
  Building2, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  Loader2, 
  ChevronDown,
  Trophy,
  CalendarDays,
  Activity,
  ShieldCheck
} from "lucide-react";

export const Route = createFileRoute("/auth")({ 
  component: AuthPage,
  validateSearch: (search: Record<string, unknown>) => {
    return {
      mode: (search.mode as "login" | "signup" | "forgot") || undefined,
      admin: (search.admin as string) || undefined
    };
  }
});

const validateEmail = (email: string) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const getPasswordStrength = (pass: string) => {
  if (!pass) return "";
  let score = 0;
  if (pass.length >= 6) score++;
  if (pass.length >= 8) score++;
  if (/[A-Z]/.test(pass)) score++;
  if (/[0-9]/.test(pass)) score++;
  if (/[^A-Za-z0-9]/.test(pass)) score++;
  
  if (score <= 2) return "Weak";
  if (score <= 4) return "Medium";
  return "Strong";
};

function AuthPage() {
  const nav = useNavigate();
  const search = Route.useSearch();
  const { login } = useApp();
  const [mode, setMode] = useState<"login" | "signup" | "forgot">(
    (search.mode as "login" | "signup" | "forgot") || "signup"
  );
  
  // Forgot Password flow states
  const [forgotStep, setForgotStep] = useState<"request" | "reset">("request");
  const [forgotEmail, setForgotEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [f, setF] = useState({ username: "", email: "", password: "", branch: "CSE", year: "1" });
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (search.admin === "true" && mode !== "login" && mode !== "forgot") {
      setMode("login");
    }
  }, [search.admin, mode]);

  // Email and Strength evaluations
  const emailValid = mode === "forgot" ? validateEmail(forgotEmail) : validateEmail(f.email);
  const strength = mode === "forgot" ? getPasswordStrength(newPassword) : getPasswordStrength(f.password);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    
    const identifier = f.email.trim();
    const password = f.password.trim();

    if (mode === "signup") {
      if (!f.username.trim() || !identifier || !password) {
        return setErr("Please fill in all fields");
      }
      if (!validateEmail(identifier)) {
        return setErr("Please enter a valid email address");
      }
      
      let usersList: any[] = [];
      try {
        const stored = localStorage.getItem("users");
        if (stored) usersList = JSON.parse(stored);
      } catch {}

      const exists = usersList.some(
        (u: any) => 
          u.username.toLowerCase() === f.username.trim().toLowerCase() || 
          u.email.toLowerCase() === identifier.toLowerCase()
      );
      if (exists) {
        return setErr("Username or Email already registered");
      }
    } else {
      if (!identifier || !password) {
        return setErr("Please fill in all fields");
      }
    }

    setLoading(true);

    // Simulate 1.2s network/process loading delay for premium feel
    await new Promise((resolve) => setTimeout(resolve, 1200));

    if (mode === "signup") {
      let usersList: any[] = [];
      try {
        const stored = localStorage.getItem("users");
        if (stored) usersList = JSON.parse(stored);
      } catch {}

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

      setLoading(false);
      setSuccess(true);

      // Display animated success screen for 1 second before redirecting
      await new Promise((resolve) => setTimeout(resolve, 1000));

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
      let foundUser = null;
      
      // Hardcoded validation fallback checks
      if (identifier.toLowerCase() === "shanmukh" && password === "Shannu@123") {
        foundUser = {
          username: "Shanmukh",
          email: "shanmukh@kridaverse.io",
          branch: "CSE",
          year: "3",
          isAdmin: false,
        };
      } else if (identifier.toLowerCase() === "kridaverseadmin" && password === "admin@123") {
        foundUser = {
          username: "KridaVerseAdmin",
          email: "admin@kridaverse.io",
          branch: "CSE",
          year: "4",
          isAdmin: true,
        };
      } else {
        let usersList: any[] = [];
        try {
          const stored = localStorage.getItem("users");
          if (stored) usersList = JSON.parse(stored);
        } catch {}

        const found = usersList.find(
          (u: any) => 
            (u.email.toLowerCase() === identifier.toLowerCase() || u.username.toLowerCase() === identifier.toLowerCase()) && 
            u.password === password
        );
        if (found) {
          foundUser = found;
        }
      }

      if (foundUser) {
        setLoading(false);
        setSuccess(true);

        await new Promise((resolve) => setTimeout(resolve, 1000));

        login({
          username: foundUser.username,
          email: foundUser.email,
          branch: foundUser.branch,
          year: foundUser.year,
          token: "mock." + btoa(foundUser.email) + "." + Date.now(),
          isAdmin: foundUser.isAdmin,
        });
        nav({ to: "/" });
      } else {
        setLoading(false);
        setErr("Invalid username/email or password");
      }
    }
  };

  const handleForgotRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");

    const email = forgotEmail.trim();
    if (!email) {
      return setErr("Please enter your email address");
    }
    if (!validateEmail(email)) {
      return setErr("Please enter a valid email address");
    }

    // Verify account exists
    let usersList: any[] = [];
    try {
      const stored = localStorage.getItem("users");
      if (stored) usersList = JSON.parse(stored);
    } catch {}

    const emailLower = email.toLowerCase();
    const exists = 
      emailLower === "shanmukh@kridaverse.io" || 
      emailLower === "admin@kridaverse.io" || 
      usersList.some((u: any) => u.email.toLowerCase() === emailLower);

    if (!exists) {
      return setErr("No account found with this email address");
    }

    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1200));
    setLoading(false);
    setForgotStep("reset");
  };

  const handleForgotReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");

    const code = verificationCode.trim();
    const password = newPassword.trim();
    const confirm = confirmPassword.trim();

    if (!code || !password || !confirm) {
      return setErr("Please fill in all fields");
    }
    if (code.length !== 6) {
      return setErr("Please enter a valid 6-digit verification code");
    }
    if (password !== confirm) {
      return setErr("Passwords do not match");
    }

    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1200));

    // Update password in mock database (localStorage)
    let usersList: any[] = [];
    try {
      const stored = localStorage.getItem("users");
      if (stored) usersList = JSON.parse(stored);
    } catch {}

    const emailLower = forgotEmail.trim().toLowerCase();
    const userIndex = usersList.findIndex((u: any) => u.email.toLowerCase() === emailLower);
    
    if (userIndex !== -1) {
      usersList[userIndex].password = password;
      try {
        localStorage.setItem("users", JSON.stringify(usersList));
      } catch {}
    } else if (emailLower !== "shanmukh@kridaverse.io" && emailLower !== "admin@kridaverse.io") {
      setLoading(false);
      return setErr("Account session not found. Please try again.");
    }

    setLoading(false);
    setSuccess(true);

    // Wait and redirect to login state
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    setSuccess(false);
    setMode("login");
    setForgotStep("request");
    setForgotEmail("");
    setVerificationCode("");
    setNewPassword("");
    setConfirmPassword("");
  };

  return (
    <div className="relative flex min-h-[calc(100vh-80px)] items-center justify-center overflow-hidden px-6 py-12">
      {/* Slow camera drift particle canvas */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-20">
        <ParticleCanvas className="absolute inset-0 h-full w-full opacity-60 scale-105" style={{ animation: "cameraDrift 40s ease-in-out infinite alternate" }} />
      </div>

      {/* Cyber Grid Background overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:40px_40px] opacity-40 [mask-image:radial-gradient(ellipse_at_center,black_60%,transparent_100%)] pointer-events-none -z-15" style={{ animation: "gridShift 40s linear infinite" }} />

      {/* Moving light streaks in background */}
      <div className="absolute top-[25%] left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#6ea8ff]/30 to-transparent blur-[3px] pointer-events-none -z-10" style={{ animation: "streak-1 25s linear infinite" }} />
      <div className="absolute top-[65%] left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#8b5cf6]/25 to-transparent blur-[3px] pointer-events-none -z-10" style={{ animation: "streak-2 30s linear infinite" }} />

      {/* Decorative low-opacity glow backdrops behind card */}
      <div className="absolute left-1/2 top-1/2 md:left-[72%] -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] rounded-full bg-[radial-gradient(circle,rgba(110,168,255,0.11)_0%,rgba(139,92,246,0.07)_50%,transparent_70%)] blur-[70px] pointer-events-none -z-10 animate-pulse" style={{ animationDuration: "9s" }} />

      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-6 relative z-10">
        
        {/* Left Side: Premium Branding & Features info list (Offset vertically upward) */}
        <div className="hidden lg:flex flex-col max-w-lg text-left lg:-translate-y-6">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex items-center gap-3 mb-6"
          >
            <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#6ea8ff] via-[#8b5cf6] to-[#35e6a4] shadow-[0_0_36px_rgba(110,168,255,0.6)] transition-shadow duration-300">
              <span className="text-2xl font-bold text-black">K</span>
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight text-white">Krida<span className="hero-title-gradient">Verse</span></h1>
          </motion.div>
          
          <motion.h2 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="text-3xl font-extrabold text-white/90 leading-[1.3] mb-4"
          >
            The collegiate sports <br />
            <span className="bg-gradient-to-r from-[#6ea8ff] via-[#8b5cf6] to-[#35e6a4] bg-clip-text text-transparent">command console.</span>
          </motion.h2>
          
          <motion.p 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="text-white/60 mb-8 text-base leading-relaxed max-w-[340px]"
          >
            Register teams, track schedules, and follow live statistics all from a single interactive dashboard.
          </motion.p>

          <div className="space-y-5">
            {[
              { t: "Live Scoreboards", d: "Instantly broadcast match points and statistics.", icon: Trophy },
              { t: "Tournament Registration", d: "Submit rosters and verify team credentials in minutes.", icon: CalendarDays },
              { t: "Live Analytics", d: "Review athlete profiles and game performances.", icon: Activity }
            ].map((feat, idx) => (
              <motion.div 
                key={feat.t}
                initial={{ opacity: 0, x: -25 }}
                animate={{ opacity: 1, x: 0 }}
                whileHover={{ x: 6 }}
                transition={{ 
                  x: { type: "spring", stiffness: 300, damping: 20 },
                  default: { delay: idx * 0.12 + 0.35, duration: 0.5 }
                }}
                className="flex items-start gap-4 group cursor-default"
              >
                <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#6ea8ff]/10 border border-[#6ea8ff]/30 text-[#6ea8ff] group-hover:bg-[#6ea8ff]/25 group-hover:border-[#6ea8ff]/50 group-hover:shadow-[0_0_15px_rgba(110,168,255,0.25)] transition-all duration-300">
                  <feat.icon className="h-[22px] w-[22px]" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white/90 group-hover:text-white transition duration-300">{feat.t}</h4>
                  <p className="text-xs text-white/50 mt-0.5">{feat.d}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Vertical fading divider */}
        <div className="hidden lg:block w-[1px] h-96 bg-gradient-to-b from-transparent via-white/10 to-transparent self-center shrink-0 mx-6" />

        {/* Right Side: Glassmorphic Auth Card Form (Offset vertically downward + Spring on load) */}
        <div className="flex flex-1 justify-center lg:justify-end lg:translate-y-6">
          <motion.div 
            initial={{ opacity: 0, scale: 0.94, y: 30 }} 
            animate={{ opacity: 1, scale: 1, y: 0 }} 
            transition={{ type: "spring", stiffness: 100, damping: 15, delay: 0.1 }}
            className="relative w-full max-w-md rounded-3xl p-8 border border-white/20 bg-[#181d30]/65 backdrop-blur-[28px]"
            style={{ boxShadow: "0 40px 80px rgba(0, 0, 0, 0.75), 0 0 50px rgba(110, 168, 255, 0.16), inset 0 1px 0 rgba(255, 255, 255, 0.12)" }}
          >
            <AnimatePresence mode="wait">
              {success ? (
                <motion.div 
                  key="success"
                  initial={{ opacity: 0, scale: 0.9, y: 15 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: -15 }}
                  transition={{ duration: 0.3 }}
                  className="flex flex-col items-center justify-center py-16 text-center"
                >
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.15 }}
                    className="flex h-16 w-16 items-center justify-center rounded-full bg-[color:var(--neon-emerald)]/10 border border-[color:var(--neon-emerald)]/30 text-[color:var(--neon-emerald)] mb-6 shadow-[0_0_24px_rgba(52,211,153,0.3)]"
                  >
                    <CheckCircle2 className="h-8 w-8" />
                  </motion.div>
                  <h3 className="text-2xl font-bold text-white mb-2">Success!</h3>
                  <p className="text-sm text-white/70">
                    {mode === "forgot" ? "Password reset successfully" : mode === "login" ? "Login successful" : "Account created successfully"}
                  </p>
                  <p className="text-xs text-white/40 mt-6 animate-pulse">Redirecting...</p>
                </motion.div>
              ) : mode === "forgot" ? (
                <motion.div 
                  key="forgot"
                  initial={{ opacity: 0, scale: 0.95, y: 15 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -15 }}
                  transition={{ duration: 0.3 }}
                >
                  {forgotStep === "request" ? (
                    <div>
                      <div className="mb-10 text-center">
                        <h1 className="text-3xl font-extrabold neon-text tracking-tight">Reset Password 🔒</h1>
                        <p className="mt-2 text-sm text-white/60">
                          Enter your email to receive a password reset code
                        </p>
                      </div>

                      <form onSubmit={handleForgotRequest} className="space-y-4">
                        <div className="space-y-1">
                          <Field 
                            icon={Mail} 
                            type="text" 
                            placeholder="Email Address" 
                            value={forgotEmail} 
                            onChange={setForgotEmail} 
                          />
                          {forgotEmail && (
                            <AnimatePresence>
                              {emailValid ? (
                                <motion.div 
                                  initial={{ opacity: 0, y: -5 }} 
                                  animate={{ opacity: 1, y: 0 }} 
                                  exit={{ opacity: 0, y: -5 }}
                                  className="text-xs text-[color:var(--neon-emerald)] flex items-center gap-1.5 mt-1.5 pl-1.5"
                                >
                                  <CheckCircle2 className="h-3.5 w-3.5" /> Valid email address
                                </motion.div>
                              ) : (
                                <motion.div 
                                  initial={{ opacity: 0, y: -5 }} 
                                  animate={{ opacity: 1, y: 0 }} 
                                  exit={{ opacity: 0, y: -5 }}
                                  className="text-xs text-rose-400 flex items-center gap-1.5 mt-1.5 pl-1.5"
                                >
                                  Email is incomplete
                                </motion.div>
                              )}
                            </AnimatePresence>
                          )}
                        </div>

                        {err && (
                          <motion.div 
                            initial={{ opacity: 0, y: -5 }} 
                            animate={{ opacity: 1, y: 0 }}
                            className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2.5 text-sm text-red-300"
                          >
                            {err}
                          </motion.div>
                        )}

                        <motion.button 
                          type="submit" 
                          disabled={loading}
                          whileHover={{ y: -3, scale: 1.01 }}
                          whileTap={{ scale: 0.98 }}
                          transition={{ type: "spring", stiffness: 400, damping: 20 }}
                          className="relative w-full h-12 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-[#6ea8ff] to-[#8b5cf6] border border-[#6ea8ff]/30 shadow-[0_4px_20px_rgba(110,168,255,0.3),_0_0_15px_rgba(139,92,246,0.2)] hover:shadow-[0_12px_30px_rgba(110,168,255,0.5),_0_0_25px_rgba(139,92,246,0.35)] hover:brightness-110 active:scale-[0.98] transition-all duration-300 cursor-pointer disabled:pointer-events-none disabled:opacity-50 flex items-center justify-center"
                        >
                          {loading ? (
                            <>
                              <Loader2 className="animate-spin h-4 w-4 mr-2" />
                              Sending...
                            </>
                          ) : (
                            "Send Reset Code"
                          )}
                        </motion.button>
                      </form>

                      <div className="mt-6 text-center text-xs">
                        <button
                          type="button"
                          onClick={() => {
                            setMode("login");
                            setErr("");
                          }}
                          className="text-[#6ea8ff] hover:text-[#8b5cf6] font-semibold transition-colors duration-300 underline underline-offset-4 cursor-pointer inline-flex items-center gap-0.5"
                        >
                          &larr; Back to Login
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="mb-10 text-center">
                        <h1 className="text-3xl font-extrabold neon-text tracking-tight">Set New Password 🔑</h1>
                        <p className="mt-2 text-sm text-white/60">
                          We sent a code to email. Enter it below with your new password.
                        </p>
                      </div>

                      <form onSubmit={handleForgotReset} className="space-y-4">
                        <Field 
                          icon={ShieldCheck} 
                          type="text" 
                          placeholder="6-Digit Verification Code" 
                          maxLength={6}
                          value={verificationCode} 
                          onChange={(v: string) => setVerificationCode(v.replace(/[^0-9]/g, ""))} 
                        />

                        <div className="space-y-1">
                          <Field 
                            icon={Lock} 
                            type="password" 
                            placeholder="New Password" 
                            value={newPassword} 
                            onChange={setNewPassword} 
                          />
                          {newPassword && (
                            <motion.div 
                              initial={{ opacity: 0, y: -5 }} 
                              animate={{ opacity: 1, y: 0 }}
                              className="mt-2.5 pl-1.5"
                            >
                              <div className="flex justify-between items-center text-xs">
                                <span className="text-white/50">Password strength:</span>
                                <span className={`font-semibold transition-colors duration-300 ${
                                  strength === "Weak" ? "text-rose-400" :
                                  strength === "Medium" ? "text-amber-400" :
                                  "text-[color:var(--neon-emerald)]"
                                }`}>{strength}</span>
                              </div>
                              <div className="mt-1.5 flex gap-1 h-1 w-full rounded-full bg-white/10 overflow-hidden">
                                <motion.div 
                                  initial={{ width: 0 }}
                                  animate={{ 
                                    width: strength === "Weak" ? "33.33%" : strength === "Medium" ? "66.66%" : "100%",
                                    backgroundColor: strength === "Weak" ? "#f87171" : strength === "Medium" ? "#fbbf24" : "#34d399"
                                  }}
                                  transition={{ duration: 0.3 }}
                                  className="h-full rounded-full"
                                />
                              </div>
                            </motion.div>
                          )}
                        </div>

                        <Field 
                          icon={Lock} 
                          type="password" 
                          placeholder="Confirm New Password" 
                          value={confirmPassword} 
                          onChange={setConfirmPassword} 
                        />

                        {err && (
                          <motion.div 
                            initial={{ opacity: 0, y: -5 }} 
                            animate={{ opacity: 1, y: 0 }}
                            className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2.5 text-sm text-red-300"
                          >
                            {err}
                          </motion.div>
                        )}

                        <motion.button 
                          type="submit" 
                          disabled={loading}
                          whileHover={{ y: -3, scale: 1.01 }}
                          whileTap={{ scale: 0.98 }}
                          transition={{ type: "spring", stiffness: 400, damping: 20 }}
                          className="relative w-full h-12 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-[#6ea8ff] to-[#8b5cf6] border border-[#6ea8ff]/30 shadow-[0_4px_20px_rgba(110,168,255,0.3),_0_0_15px_rgba(139,92,246,0.2)] hover:shadow-[0_12px_30px_rgba(110,168,255,0.5),_0_0_25px_rgba(139,92,246,0.35)] hover:brightness-110 active:scale-[0.98] transition-all duration-300 cursor-pointer disabled:pointer-events-none disabled:opacity-50 flex items-center justify-center"
                        >
                          {loading ? (
                            <>
                              <Loader2 className="animate-spin h-4 w-4 mr-2" />
                              Resetting...
                            </>
                          ) : (
                            "Update Password"
                          )}
                        </motion.button>
                      </form>

                      <div className="mt-6 text-center text-xs">
                        <button
                          type="button"
                          onClick={() => {
                            setMode("login");
                            setForgotStep("request");
                            setErr("");
                          }}
                          className="text-[#6ea8ff] hover:text-[#8b5cf6] font-semibold transition-colors duration-300 underline underline-offset-4 cursor-pointer inline-flex items-center gap-0.5"
                        >
                          &larr; Back to Login
                        </button>
                      </div>
                    </div>
                  )}
                </motion.div>
              ) : (
                <motion.div 
                  key="auth-forms" 
                  initial={{ opacity: 0, scale: 0.95, y: 15 }} 
                  animate={{ opacity: 1, scale: 1, y: 0 }} 
                  exit={{ opacity: 0, scale: 0.95, y: -15 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="mb-10 text-center">
                    <h1 className="text-3xl font-extrabold neon-text tracking-tight">
                      {search.admin === "true" && mode === "login" ? "Admin Login 🛡️" : mode === "login" ? "Welcome Back 👋" : "Welcome to KridaVerse"}
                    </h1>
                    <p className="mt-2 text-sm text-white/60">
                      {search.admin === "true" && mode === "login" ? "Enter administrator credentials to open command console" : mode === "login" ? "Sign in to continue" : "Create an account to register your team"}
                    </p>
                  </div>

                  {/* iOS Style Segmented Control (Sliding Animation) */}
                  {search.admin !== "true" && (
                    <div className="mb-6 relative grid grid-cols-2 gap-1 rounded-xl bg-black/40 p-1 border border-white/5 h-11 items-center">
                      <motion.div
                        className="absolute top-[3px] bottom-[3px] rounded-lg bg-gradient-to-r from-[#6ea8ff]/20 to-[#8b5cf6]/20 border border-[#6ea8ff]/30 shadow-[0_0_12px_rgba(110,168,255,0.15)]"
                        animate={{ x: mode === "login" ? 0 : "99%" }}
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                        style={{
                          width: "calc(50% - 4px)",
                          left: "2px",
                        }}
                      />
                      {(["login", "signup"] as const).map((m) => (
                        <button
                          key={m}
                          type="button"
                          onClick={() => {
                            setMode(m);
                            setErr("");
                          }}
                          className="relative z-10 w-full h-full text-sm font-semibold transition-colors duration-300 rounded-lg outline-none cursor-pointer"
                        >
                          <span className={`transition-colors duration-300 ${mode === m ? "text-white" : "text-white/50 hover:text-white"}`}>
                            {m === "login" ? "Login" : "Sign up"}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}

                  <form onSubmit={submit} className="space-y-4">
                    {mode === "signup" && (
                      <Field 
                        icon={User} 
                        type="text"
                        placeholder="Username" 
                        value={f.username} 
                        onChange={(v: string) => setF({ ...f, username: v })} 
                      />
                    )}
                    
                    <div className="space-y-1">
                      <Field 
                        icon={Mail} 
                        type="text" 
                        placeholder={mode === "signup" ? "Email Address" : "Username or Email"} 
                        value={f.email} 
                        onChange={(v: string) => setF({ ...f, email: v })} 
                      />
                      {mode === "signup" && f.email && (
                        <AnimatePresence>
                          {emailValid ? (
                            <motion.div 
                              initial={{ opacity: 0, y: -5 }} 
                              animate={{ opacity: 1, y: 0 }} 
                              exit={{ opacity: 0, y: -5 }}
                              className="text-xs text-[color:var(--neon-emerald)] flex items-center gap-1.5 mt-1.5 pl-1.5"
                            >
                              <CheckCircle2 className="h-3.5 w-3.5" /> Valid email address
                            </motion.div>
                          ) : (
                            <motion.div 
                              initial={{ opacity: 0, y: -5 }} 
                              animate={{ opacity: 1, y: 0 }} 
                              exit={{ opacity: 0, y: -5 }}
                              className="text-xs text-rose-400 flex items-center gap-1.5 mt-1.5 pl-1.5"
                            >
                              Email is incomplete
                            </motion.div>
                          )}
                        </AnimatePresence>
                      )}
                    </div>

                    <div className="space-y-1">
                      <Field 
                        icon={Lock} 
                        type="password" 
                        placeholder="Password" 
                        value={f.password} 
                        onChange={(v: string) => setF({ ...f, password: v })} 
                      />
                      {mode === "login" && (
                        <div className="text-right mt-1.5 pl-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              setMode("forgot");
                              setForgotStep("request");
                              setErr("");
                            }}
                            className="text-xs text-[#6ea8ff]/75 hover:text-[#6ea8ff] hover:underline transition cursor-pointer"
                          >
                            Forgot password?
                          </button>
                        </div>
                      )}
                      {mode === "signup" && f.password && (
                        <motion.div 
                          initial={{ opacity: 0, y: -5 }} 
                          animate={{ opacity: 1, y: 0 }}
                          className="mt-2.5 pl-1.5"
                        >
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-white/50">Password strength:</span>
                            <span className={`font-semibold transition-colors duration-300 ${
                              strength === "Weak" ? "text-rose-400" :
                              strength === "Medium" ? "text-amber-400" :
                              "text-[color:var(--neon-emerald)]"
                            }`}>{strength}</span>
                          </div>
                          <div className="mt-1.5 flex gap-1 h-1 w-full rounded-full bg-white/10 overflow-hidden">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ 
                                width: strength === "Weak" ? "33.33%" : strength === "Medium" ? "66.66%" : "100%",
                                backgroundColor: strength === "Weak" ? "#f87171" : strength === "Medium" ? "#fbbf24" : "#34d399"
                              }}
                              transition={{ duration: 0.3 }}
                              className="h-full rounded-full"
                            />
                          </div>
                        </motion.div>
                      )}
                    </div>

                    {mode === "signup" && (
                      <div className="grid grid-cols-2 gap-3">
                        <Select 
                          icon={Building2} 
                          value={f.branch} 
                          onChange={(v: string) => setF({ ...f, branch: v })} 
                          options={["CSE", "IT", "ECE", "EEE", "MECH", "CIVIL", "AIML", "DS", "CSBS", "AERO"]} 
                          label="Branch" 
                        />
                        <Select 
                          icon={GraduationCap} 
                          value={f.year} 
                          onChange={(v: string) => setF({ ...f, year: v })} 
                          options={["1", "2", "3", "4"]} 
                          label="Year" 
                        />
                      </div>
                    )}

                    {err && (
                      <motion.div 
                        initial={{ opacity: 0, y: -5 }} 
                        animate={{ opacity: 1, y: 0 }}
                        className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2.5 text-sm text-red-300"
                      >
                        {err}
                      </motion.div>
                    )}

                    <motion.button 
                      type="submit" 
                      disabled={loading}
                      whileHover={{ y: -3, scale: 1.01 }}
                      whileTap={{ scale: 0.98 }}
                      transition={{ type: "spring", stiffness: 400, damping: 20 }}
                      className="relative w-full h-12 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-[#6ea8ff] to-[#8b5cf6] border border-[#6ea8ff]/30 shadow-[0_4px_20px_rgba(110,168,255,0.3),_0_0_15px_rgba(139,92,246,0.2)] hover:shadow-[0_12px_30px_rgba(110,168,255,0.5),_0_0_25px_rgba(139,92,246,0.35)] hover:brightness-110 active:scale-[0.98] transition-all duration-300 cursor-pointer disabled:pointer-events-none disabled:opacity-50 flex items-center justify-center"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="animate-spin h-4 w-4 mr-2" />
                          {mode === "login" ? "Signing in..." : "Creating..."}
                        </>
                      ) : (
                        mode === "login" ? "Sign In" : "Create Account"
                      )}
                    </motion.button>
                  </form>

                  {/* Mode Toggle Switcher Links */}
                  {search.admin !== "true" && (
                    <div className="mt-6 text-center text-xs">
                      <span className="text-white/40">
                        {mode === "login" ? "Don't have an account? " : "Already have an account? "}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setMode(mode === "login" ? "signup" : "login");
                          setErr("");
                        }}
                        className="text-[#6ea8ff] hover:text-[#8b5cf6] font-semibold transition-colors duration-300 underline underline-offset-4 cursor-pointer ml-1 inline-flex items-center gap-0.5 hover:translate-x-0.5 transform"
                      >
                        {mode === "login" ? "Create one" : "Sign In"} &rarr;
                      </button>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>

      </div>
    </div>
  );
}

function Field({ icon: Icon, type, placeholder, value, onChange, ...props }: any) {
  const [showPass, setShowPass] = useState(false);
  const isPassword = type === "password";
  const actualType = isPassword ? (showPass ? "text" : "password") : type;

  return (
    <div className="group relative">
      <Icon className="pointer-events-none absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-white/40 transition-colors duration-300 group-focus-within:text-[#6ea8ff] group-hover:text-white/60" />
      <input 
        {...props} 
        type={actualType}
        placeholder={placeholder}
        value={value}
        onChange={(e: any) => onChange(e.target.value)}
        className="w-full h-12 rounded-xl border border-white/10 bg-black/40 py-3 pl-11 pr-10 text-sm text-white placeholder-white/40 outline-none transition-all duration-300 focus:border-[#6ea8ff] focus:bg-black/60 focus:shadow-[0_0_15px_rgba(110,168,255,0.25)] focus:placeholder-transparent hover:border-white/20 hover:bg-black/50" 
      />
      {isPassword && (
        <button
          type="button"
          onClick={() => setShowPass(!showPass)}
          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors p-1 cursor-pointer"
        >
          {showPass ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
        </button>
      )}
    </div>
  );
}

function Select({ icon: Icon, value, onChange, options, label }: any) {
  return (
    <div className="relative group">
      <Icon className="pointer-events-none absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-white/40 transition-colors duration-300 group-focus-within:text-[#6ea8ff]" />
      <select 
        value={value} 
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-12 appearance-none rounded-xl border border-white/10 bg-black/40 py-3 pl-11 pr-10 text-sm text-white outline-none transition-all duration-300 focus:border-[#6ea8ff] focus:bg-black/60 focus:shadow-[0_0_15px_rgba(110,168,255,0.25)] hover:border-white/20 hover:bg-black/50 cursor-pointer"
        style={{ borderRadius: "12px" }}
      >
        {options.map((o: string) => <option key={o} value={o} className="bg-[#121320] text-white">{label} {o}</option>)}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40 group-hover:text-white/60 transition-colors duration-300" />
    </div>
  );
}
