import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SPORT_META, type Sport, mockApi } from "@/lib/mockApi";
import { 
  ArrowRight, 
  Check, 
  CheckCircle2, 
  MapPin, 
  CalendarDays, 
  Users, 
  X, 
  Plus, 
  Loader2,
  Trophy,
  Activity,
  AlertCircle
} from "lucide-react";
import { SportIcon } from "@/components/SportIcon";
import { ParticleCanvas } from "@/components/ParticleCanvas";
import { toast } from "sonner";

export const Route = createFileRoute("/sports")({ 
  component: SportsPage,
  validateSearch: (search: Record<string, unknown>) => {
    return {
      sport: (search.sport as string) || undefined,
      register: (search.register as string) || undefined
    };
  }
});

const sportsDetails: Record<Sport, {
  badge: string;
  badgeColor: string;
  venue: string;
  ends: string;
  registered: number;
  slots: number;
  accent: string;
  glow: string;
}> = {
  cricket: {
    badge: "POPULAR",
    badgeColor: "text-blue-400 bg-blue-500/10 border-blue-500/20",
    venue: "Outdoor Ground",
    ends: "2 Days Left",
    registered: 24,
    slots: 8,
    accent: "#6ea8ff",
    glow: "rgba(110, 168, 255, 0.2)"
  },
  football: {
    badge: "LIVE EVENT",
    badgeColor: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    venue: "Athletic Arena",
    ends: "3 Days Left",
    registered: 18,
    slots: 6,
    accent: "#35e6a4",
    glow: "rgba(53, 230, 164, 0.2)"
  },
  kabaddi: {
    badge: "HIGH DEMAND",
    badgeColor: "text-rose-400 bg-rose-500/10 border-rose-500/20",
    venue: "Indoor Court A",
    ends: "4 Days Left",
    registered: 12,
    slots: 4,
    accent: "#f43f5e",
    glow: "rgba(244, 63, 94, 0.2)"
  },
  volleyball: {
    badge: "POPULAR",
    badgeColor: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    venue: "Volleyball Sand Court",
    ends: "5 Days Left",
    registered: 16,
    slots: 8,
    accent: "#f5c451",
    glow: "rgba(245, 196, 81, 0.2)"
  },
  basketball: {
    badge: "LIVE EVENT",
    badgeColor: "text-orange-400 bg-orange-500/10 border-orange-500/20",
    venue: "Indoor Court B",
    ends: "6 Days Left",
    registered: 20,
    slots: 4,
    accent: "#ff8a4c",
    glow: "rgba(255, 138, 76, 0.2)"
  },
  hockey: {
    badge: "POPULAR",
    badgeColor: "text-purple-400 bg-purple-500/10 border-purple-500/20",
    venue: "Athletic Arena",
    ends: "7 Days Left",
    registered: 8,
    slots: 8,
    accent: "#c084fc",
    glow: "rgba(192, 132, 252, 0.2)"
  }
};

const branches = ["CSE", "IT", "ECE", "EEE", "MECH", "CIVIL", "AIML", "DS", "CSBS", "AERO"];

function SportsPage() {
  const search = Route.useSearch();
  const navigate = useNavigate();

  const sports = Object.entries(SPORT_META) as [Sport, typeof SPORT_META[Sport]][];
  
  // Selection & Modal States
  const [selectedSport, setSelectedSport] = useState<Sport | null>((search.sport as Sport) || null);
  const [modalOpen, setModalOpen] = useState(search.register === "true");

  // Roster registration states
  const [teamName, setTeamName] = useState("");
  const [branch, setBranch] = useState("CSE");
  const [year, setYear] = useState("1");
  const [member, setMember] = useState("");
  const [members, setMembers] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Auto-trigger modal if pre-routed
  useEffect(() => {
    if (search.sport && search.register === "true") {
      setSelectedSport(search.sport as Sport);
      setModalOpen(true);
    }
  }, [search.sport, search.register]);

  const activeMeta = selectedSport ? SPORT_META[selectedSport] : null;
  const activeDetails = selectedSport ? sportsDetails[selectedSport] : null;

  const addPlayer = () => {
    const t = member.trim();
    if (!t) return;
    if (!activeMeta) return;
    if (members.length >= activeMeta.max) { 
      toast.error(`Maximum ${activeMeta.max} players allowed for ${activeMeta.label}`); 
      return; 
    }
    if (members.includes(t)) { 
      toast.error("Player already added to roster"); 
      return; 
    }
    setMembers([...members, t]); 
    setMember("");
  };

  const removePlayer = (n: string) => {
    setMembers(members.filter((x) => x !== n));
  };

  const isFormValid = teamName.trim() && activeMeta && members.length >= activeMeta.min && members.length <= activeMeta.max;

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSport || !activeMeta) return;
    if (!isFormValid) {
      toast.error(`Roster must have between ${activeMeta.min} and ${activeMeta.max} players.`);
      return;
    }

    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setLoading(false);
    setSuccess(true);
    
    toast.success(`${teamName} registered successfully for ${activeMeta.label}!`);
    
    await new Promise((resolve) => setTimeout(resolve, 1200));
    setSuccess(false);
    setModalOpen(false);
    
    // Clear state
    setTeamName("");
    setMembers([]);
    setMember("");
    
    navigate({ to: "/schedules" });
  };

  return (
    <div className="relative min-h-[calc(100vh-80px)] overflow-hidden px-6 py-12 flex flex-col justify-center">
      {/* Particle Canvas with cameraDrift animation */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-20">
        <ParticleCanvas className="absolute inset-0 h-full w-full opacity-60 scale-105" style={{ animation: "cameraDrift 40s ease-in-out infinite alternate" }} />
      </div>

      {/* Cyber Grid Background overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:40px_40px] opacity-40 [mask-image:radial-gradient(ellipse_at_center,black_60%,transparent_100%)] pointer-events-none -z-15" style={{ animation: "gridShift 40s linear infinite" }} />

      {/* Moving light streaks in background */}
      <div className="absolute top-[20%] left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#6ea8ff]/20 to-transparent blur-[3px] pointer-events-none -z-10" style={{ animation: "streak-1 25s linear infinite" }} />
      <div className="absolute top-[70%] left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#8b5cf6]/15 to-transparent blur-[3px] pointer-events-none -z-10" style={{ animation: "streak-2 30s linear infinite" }} />

      <div className="relative mx-auto w-full max-w-7xl">
        
        {/* Step Progress Stepper Indicator */}
        <motion.div 
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col items-center mb-12 text-center"
        >
          <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-wider mb-3">
            <span className="text-[#6ea8ff] drop-shadow-[0_0_8px_rgba(110,168,255,0.4)]">01 Choose Sport</span>
            <div className="h-[2px] w-12 bg-gradient-to-r from-[#6ea8ff] to-white/10" />
            <span className="text-white/20">02 Team Details</span>
          </div>
          <div className="relative w-48 h-1 bg-white/10 rounded-full overflow-hidden">
            <div className="absolute top-0 left-0 w-1/2 h-full bg-gradient-to-r from-[#6ea8ff] to-[#8b5cf6] shadow-[0_0_8px_#6ea8ff]" />
          </div>
          <div className="text-[10px] text-white/30 uppercase mt-2.5 font-bold tracking-widest">Step 1 of 2 • 50% Complete</div>
        </motion.div>

        {/* Page Header */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-extrabold md:text-5xl tracking-tight text-white mb-3">Pick your sport</h1>
          <p className="mx-auto max-w-xl text-white/50 text-sm leading-relaxed">
            Choose one sport to begin team registration. Each sport has its own roster size rules.
          </p>
        </div>

        {/* Sports Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {sports.map(([id, meta], i) => {
            const details = sportsDetails[id];
            const isSelected = selectedSport === id;

            return (
              <motion.button 
                key={id} 
                onClick={() => {
                  setSelectedSport(id);
                  setErr("");
                }}
                initial={{ opacity: 0, scale: 0.96, y: 15 }} 
                animate={{ opacity: 1, scale: 1, y: 0 }} 
                transition={{ type: "spring", stiffness: 100, damping: 15, delay: i * 0.05 + 0.1 }}
                className={`group text-left relative overflow-hidden rounded-3xl p-7 transition-all duration-300 ${
                  isSelected 
                    ? "border-2 bg-[#1b1c2e]/75 backdrop-blur-md shadow-[0_20px_50px_rgba(0,0,0,0.6)]" 
                    : "border border-white/10 bg-[#121422]/50 hover:bg-[#181a2e]/60 hover:-translate-y-2 hover:scale-[1.01]"
                }`}
                style={{
                  borderColor: isSelected ? details.accent : "rgba(255,255,255,0.1)",
                  boxShadow: isSelected 
                    ? `0 20px 50px rgba(0,0,0,0.65), 0 0 25px ${details.glow}`
                    : `0 10px 25px rgba(0,0,0,0.3), hover: 0 0 20px ${details.glow}`
                }}
              >
                {/* Background color glow coordinates */}
                <div 
                  className="absolute -right-16 -top-16 h-48 w-48 rounded-full opacity-10 blur-3xl transition duration-500 group-hover:opacity-20"
                  style={{ background: details.accent }} 
                />

                {/* Animated checkmark for selected state */}
                <AnimatePresence>
                  {isSelected && (
                    <motion.div 
                      initial={{ scale: 0, rotate: -45 }}
                      animate={{ scale: 1, rotate: 0 }}
                      exit={{ scale: 0, rotate: -45 }}
                      className="absolute top-4 right-4 h-6 w-6 rounded-full bg-gradient-to-br from-[#35e6a4] to-[#059669] flex items-center justify-center text-black border border-[#35e6a4]/50 shadow-[0_0_12px_rgba(53,230,164,0.4)] z-20"
                    >
                      <Check className="h-4 w-4 stroke-[3px]" />
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Micro Badges (Popular/Live Event) */}
                <span className={`absolute top-4 left-4 border px-2.5 py-0.5 rounded-full text-[9px] font-bold tracking-wider ${details.badgeColor}`}>
                  {details.badge}
                </span>

                <div className="relative mt-4">
                  {/* Glowing, rotating Icon */}
                  <div 
                    className="flex h-14 w-14 items-center justify-center rounded-xl bg-white/5 border border-white/10 transition-all duration-300 group-hover:scale-105 group-hover:rotate-[5deg]"
                    style={{
                      boxShadow: `0 0 16px ${details.glow}`,
                      borderColor: `${details.accent}30`
                    }}
                  >
                    <SportIcon sport={id} className="h-8 w-8" />
                  </div>

                  <h3 className="mt-5 text-2xl font-bold text-white tracking-tight">{meta.label}</h3>
                  <p className="mt-1 text-xs text-white/40 font-medium">Roster: {meta.min}–{meta.max} Players</p>

                  {/* Additional stats cards mock detail */}
                  <div className="mt-5 space-y-2.5 text-xs text-white/60">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-white/30" />
                      <span>{details.venue}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CalendarDays className="h-4 w-4 text-white/30" />
                      <span>Closes: {details.ends}</span>
                    </div>
                  </div>

                  {/* Recruiter metric detail badge */}
                  <div className="mt-5 flex items-center gap-1.5 text-[10px] text-white/30 font-semibold uppercase tracking-wider">
                    <Users className="h-4.5 w-4.5 text-white/20" />
                    <span>{details.registered} Teams • {details.slots} Slots Left</span>
                  </div>

                  {/* CTA link */}
                  <div 
                    className="mt-6 inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider group-hover:brightness-110 transition duration-300" 
                    style={{ color: details.accent }}
                  >
                    Register Team 
                    <ArrowRight className="h-4 w-4 transform group-hover:translate-x-1.5 transition-transform duration-300" />
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* Selected Continue Button overlay */}
        <AnimatePresence>
          {selectedSport && (
            <motion.div 
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 25 }}
              className="mt-16 flex justify-center sticky bottom-8 z-30"
            >
              <button 
                onClick={() => setModalOpen(true)}
                className="relative h-14 px-8 rounded-full text-sm font-bold text-white bg-gradient-to-r from-[#6ea8ff] to-[#8b5cf6] border border-[#6ea8ff]/30 shadow-[0_8px_30px_rgba(110,168,255,0.4),_0_0_20px_rgba(139,92,246,0.25)] hover:shadow-[0_16px_40px_rgba(110,168,255,0.55),_0_0_30px_rgba(139,92,246,0.4)] hover:scale-105 active:scale-[0.98] transition-all duration-300 cursor-pointer flex items-center justify-center gap-2 group"
              >
                <span>Continue to Registration</span>
                <ArrowRight className="h-4 w-4 transform group-hover:translate-x-1 transition-transform duration-300" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

      </div>

      {/* Step 2 Inline registration modal dialog container */}
      <AnimatePresence>
        {modalOpen && activeMeta && activeDetails && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            
            {/* Modal glass backdrop background */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setModalOpen(false)}
              className="absolute inset-0 bg-[#06070d]/80 backdrop-blur-md"
            />

            {/* Modal main content glass panel card */}
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ type: "spring", stiffness: 350, damping: 28 }}
              className="relative w-full max-w-xl rounded-3xl p-6 md:p-8 border border-white/20 bg-[#161a2f]/90 backdrop-blur-2xl max-h-[90vh] overflow-y-auto"
              style={{ boxShadow: "0 40px 80px rgba(0, 0, 0, 0.8), 0 0 50px rgba(110, 168, 255, 0.12)" }}
            >
              
              {/* Close Button */}
              <button 
                onClick={() => setModalOpen(false)}
                className="absolute top-5 right-5 h-8 w-8 rounded-full border border-white/10 bg-white/5 flex items-center justify-center text-white/50 hover:text-white hover:border-white/20 transition-all cursor-pointer"
              >
                <X className="h-4.5 w-4.5" />
              </button>

              {/* Progress visual in Modal (Step 2 active) */}
              <div className="flex flex-col items-center mb-6 text-center">
                <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-wider text-white/30 mb-2">
                  <span>01 Choose Sport</span>
                  <div className="h-[2px] w-8 bg-[#6ea8ff]" />
                  <span className="text-[#6ea8ff] drop-shadow-[0_0_8px_rgba(110,168,255,0.4)]">02 Team Details</span>
                </div>
                <div className="relative w-32 h-1 bg-white/10 rounded-full overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-[#6ea8ff] to-[#8b5cf6] shadow-[0_0_8px_#6ea8ff]" />
                </div>
              </div>

              {/* Header Title details */}
              <div className="mb-6 flex items-center gap-4 border-b border-white/5 pb-5">
                <div 
                  className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-white/5 border border-white/10"
                  style={{
                    boxShadow: `0 0 15px ${activeDetails.glow}`,
                    borderColor: `${activeDetails.accent}40`
                  }}
                >
                  <SportIcon sport={selectedSport as Sport} className="h-8 w-8" />
                </div>
                <div>
                  <h2 className="text-2xl font-extrabold text-white tracking-tight">Team Details</h2>
                  <p className="text-xs text-white/50">Register for {activeMeta.label} ({activeMeta.min}–{activeMeta.max} players)</p>
                </div>
              </div>

              {success ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="flex h-16 w-16 items-center justify-center rounded-full bg-[color:var(--neon-emerald)]/10 border border-[color:var(--neon-emerald)]/30 text-[color:var(--neon-emerald)] mb-6 shadow-[0_0_24px_rgba(52,211,153,0.35)]"
                  >
                    <CheckCircle2 className="h-8 w-8" />
                  </motion.div>
                  <h3 className="text-xl font-bold text-white mb-2">Registration Confirmed!</h3>
                  <p className="text-xs text-white/60">Your team has been enrolled into the system.</p>
                  <p className="text-[10px] text-white/30 mt-6 animate-pulse">Redirecting to Schedules dashboard...</p>
                </div>
              ) : (
                <form onSubmit={handleRegisterSubmit} className="space-y-5">
                  
                  {/* Team Name */}
                  <div>
                    <label className="mb-1.5 block text-[10px] uppercase tracking-wider font-semibold text-white/40">Team name</label>
                    <input 
                      type="text"
                      required
                      placeholder="e.g. CSE Titans"
                      value={teamName} 
                      onChange={(e) => setTeamName(e.target.value)}
                      className="w-full h-12 rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white placeholder-white/30 outline-none transition-all duration-300 focus:border-[#6ea8ff] focus:bg-black/60 focus:shadow-[0_0_15px_rgba(110,168,255,0.2)] hover:border-white/20" 
                    />
                  </div>

                  {/* Branch & Year select */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="mb-1.5 block text-[10px] uppercase tracking-wider font-semibold text-white/40">Branch</label>
                      <select 
                        value={branch} 
                        onChange={(e) => setBranch(e.target.value)}
                        className="w-full h-12 rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-[#6ea8ff] focus:bg-black/60 hover:border-white/20 cursor-pointer"
                        style={{ borderRadius: "12px" }}
                      >
                        {branches.map((b) => <option key={b} value={b} className="bg-[#121320] text-white">Branch {b}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="mb-1.5 block text-[10px] uppercase tracking-wider font-semibold text-white/40">Year</label>
                      <select 
                        value={year} 
                        onChange={(e) => setYear(e.target.value)}
                        className="w-full h-12 rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-[#6ea8ff] focus:bg-black/60 hover:border-white/20 cursor-pointer"
                        style={{ borderRadius: "12px" }}
                      >
                        {["1", "2", "3", "4"].map((y) => <option key={y} value={y} className="bg-[#121320] text-white">Year {y}</option>)}
                      </select>
                    </div>
                  </div>

                  {/* Roster builder lists */}
                  <div>
                    <div className="mb-1.5 flex items-center justify-between">
                      <label className="text-[10px] uppercase tracking-wider font-semibold text-white/40">Roster</label>
                      <span className={`text-[10px] font-bold ${members.length < activeMeta.min ? "text-amber-400 animate-pulse" : "text-[color:var(--neon-emerald)]"}`}>
                        {members.length} / {activeMeta.min}–{activeMeta.max} Players
                      </span>
                    </div>

                    <div className="flex gap-2">
                      <input 
                        type="text"
                        value={member} 
                        onChange={(e) => setMember(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addPlayer(); } }}
                        placeholder="Add player name"
                        className="flex-1 h-12 rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white placeholder-white/30 outline-none transition-all duration-300 focus:border-[#6ea8ff] focus:bg-black/60 hover:border-white/20" 
                      />
                      <button 
                        type="button" 
                        onClick={addPlayer} 
                        className="h-12 flex items-center gap-1 rounded-xl bg-gradient-to-r from-[#6ea8ff] to-[#8b5cf6] px-5 text-sm font-semibold hover:brightness-110 active:scale-95 transition-all cursor-pointer text-white"
                      >
                        <Plus className="h-4.5 w-4.5" /> Add
                      </button>
                    </div>

                    {/* Minimum requirements warning helper */}
                    {members.length < activeMeta.min && (
                      <div className="mt-2 text-[10px] text-amber-400 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3 shrink-0" />
                        <span>Add at least {activeMeta.min - members.length} more players to register.</span>
                      </div>
                    )}

                    {/* Roster lists cards display */}
                    <div className="mt-4 flex flex-wrap gap-2 max-h-40 overflow-y-auto p-1.5 rounded-xl border border-white/5 bg-black/20">
                      <AnimatePresence>
                        {members.map((m) => (
                          <motion.span 
                            key={m}
                            initial={{ opacity: 0, scale: 0.7, y: -6 }} 
                            animate={{ opacity: 1, scale: 1, y: 0 }} 
                            exit={{ opacity: 0, scale: 0.7 }}
                            className="group inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 pl-3 pr-2 py-1 text-xs text-white/95 hover:border-red-500/30 hover:bg-red-500/5 transition duration-300"
                          >
                            {m}
                            <button 
                              type="button" 
                              onClick={() => removePlayer(m)} 
                              className="text-white/40 hover:text-red-400 transition cursor-pointer p-0.5"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </motion.span>
                        ))}
                      </AnimatePresence>
                      {!members.length && (
                        <div className="text-xs text-white/30 py-4 px-2 w-full text-center">
                          No players in roster yet.
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions buttons */}
                  <div className="flex gap-3 pt-4 border-t border-white/5">
                    <button
                      type="button"
                      onClick={() => setModalOpen(false)}
                      className="flex-1 h-12 rounded-xl text-sm font-semibold border border-white/10 bg-white/5 hover:bg-white/10 text-white/80 active:scale-95 transition-all cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      disabled={loading || !isFormValid}
                      className={`flex-[2] h-12 rounded-xl text-sm font-bold text-white flex items-center justify-center cursor-pointer ${
                        isFormValid 
                          ? "bg-gradient-to-r from-[#6ea8ff] to-[#8b5cf6] border border-[#6ea8ff]/30 shadow-[0_4px_20px_rgba(110,168,255,0.25)] hover:shadow-[0_8px_30px_rgba(110,168,255,0.4)] hover:brightness-110 active:scale-95 transition-all" 
                          : "border border-white/10 bg-white/5 text-white/30 cursor-not-allowed pointer-events-none"
                      }`}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="animate-spin h-4.5 w-4.5 mr-2" />
                          Confirming...
                        </>
                      ) : (
                        "Complete Registration"
                      )}
                    </button>
                  </div>

                </form>
              )}

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}