import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { mockApi, SPORT_META, type Match, type Sport } from "@/lib/mockApi";
import { SportIcon } from "@/components/SportIcon";
import { useApp } from "@/lib/store";
import { toast } from "sonner";
import { 
  ArrowLeft, 
  ShieldCheck, 
  Plus, 
  Trash2, 
  Minus, 
  Megaphone, 
  X, 
  ArrowRight, 
  Search, 
  CheckCircle2, 
  Loader2,
  Clock,
  Activity,
  CalendarDays,
  Radio,
  Flame,
  Building2,
  Trophy,
  Users,
  Calendar,
  Grid
} from "lucide-react";
import { StatusBadge } from "./schedules";

export const Route = createFileRoute("/admin")({ 
  component: AdminPage,
  validateSearch: (search: Record<string, unknown>) => {
    return {
      mode: (search.mode as "login" | "signup" | "forgot") || undefined,
      admin: (search.admin as string) || undefined
    };
  }
});

export type Tournament = {
  id: string;
  name: string;
  venue: string;
  startDate: string;
  endDate: string;
  sports: Sport[];
  teams: string[];
};

function ScoreControl({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  const [prev, setPrev] = useState(value);
  const [key, setKey] = useState(0);

  useEffect(() => {
    if (value !== prev) {
      setPrev(value);
      setKey((k) => k + 1);
    }
  }, [value, prev]);

  return (
    <div className="flex flex-col items-center gap-1 bg-white/[0.02] border border-white/5 rounded-2xl p-2 min-w-[75px] shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
      <span className="text-[9px] font-bold uppercase tracking-wider text-white/40">{label}</span>
      
      <button 
        type="button"
        onClick={() => onChange(value + 1)} 
        className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/5 text-white/70 hover:bg-[#8b5cf6]/20 hover:text-[#c084fc] hover:border hover:border-[#8b5cf6]/30 active:scale-95 transition-all cursor-pointer font-bold text-sm"
      >
        +
      </button>
      
      <div className="h-8 flex items-center justify-center overflow-hidden">
        <motion.span
          key={key}
          initial={{ scale: 0.72, opacity: 0.7 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 350, damping: 10 }}
          className="text-xl font-black text-white neon-text tracking-tight"
        >
          {value}
        </motion.span>
      </div>
      
      <button 
        type="button"
        onClick={() => onChange(Math.max(0, value - 1))} 
        className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/5 text-white/70 hover:bg-[#8b5cf6]/20 hover:text-[#c084fc] hover:border hover:border-[#8b5cf6]/30 active:scale-95 transition-all cursor-pointer font-bold text-sm"
      >
        -
      </button>
    </div>
  );
}

function AdminPage() {
  const search = Route.useSearch();
  const { user, broadcasts, pushBroadcast, removeBroadcast } = useApp();
  const qc = useQueryClient();
  const { data = [] } = useQuery({ queryKey: ["matches"], queryFn: mockApi.listMatches, refetchInterval: 3000 });

  // Navigation module tabs
  const [activeTab, setActiveTab] = useState<"tournaments" | "fixtures" | "announcements" | "logs">("tournaments");

  // Fallback state variables
  const [mode, setMode] = useState<"login" | "signup" | "forgot">(
    (search.mode as "login" | "signup" | "forgot") || "signup"
  );
  
  useEffect(() => {
    if (search.admin === "true" && mode !== "login" && mode !== "forgot") {
      setMode("login");
    }
  }, [search.admin, mode]);

  // Tournament Management States
  const [tournaments, setTournaments] = useState<Tournament[]>([
    {
      id: "t1",
      name: "Aditya University Sports Fest 2026",
      venue: "Main Campus Grounds",
      startDate: "2026-07-14",
      endDate: "2026-07-20",
      sports: ["cricket", "football", "basketball", "volleyball"],
      teams: ["CSE Titans", "IT Strikers", "ECE United", "CSE FC", "IT Blazers", "ECE Kings", "MECH Warriors", "CIVIL Giants"]
    }
  ]);
  const [selectedTourneyId, setSelectedTourneyId] = useState<string | null>("t1");
  const [activeWorkspaceSport, setActiveWorkspaceSport] = useState<Sport>("cricket");
  const [fixtureGenType, setFixtureGenType] = useState<"round-robin" | "knockout">("round-robin");
  const [newTeamName, setNewTeamName] = useState("");

  // Create Tournament modal step states
  const [showTourneyModal, setShowTourneyModal] = useState(false);
  const [tourneyStep, setTourneyStep] = useState(1);
  const [newTourneyData, setNewTourneyData] = useState({
    name: "",
    venue: "Main Sports Complex",
    startDate: "",
    endDate: "",
    sports: [] as Sport[]
  });

  // Fixture add manual triggers
  const [showNewManualFixture, setShowNewManualFixture] = useState(false);

  // Mutations
  const update = useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<Match> }) => mockApi.updateMatch(id, patch),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["matches"] });
      pushActivity("Fixture metrics updated");
    },
  });
  const del = useMutation({
    mutationFn: (id: string) => mockApi.deleteMatch(id),
    onSuccess: () => { 
      qc.invalidateQueries({ queryKey: ["matches"] }); 
      toast.success("Fixture deleted successfully");
      pushActivity("Fixture permanently deleted");
    },
  });
  const add = useMutation({
    mutationFn: (m: Omit<Match, "id" | "log">) => mockApi.addMatch(m),
    onSuccess: () => { 
      qc.invalidateQueries({ queryKey: ["matches"] }); 
      pushActivity("New match fixture added");
    },
  });

  const [msg, setMsg] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [broadcastSent, setBroadcastSent] = useState(false);

  // Timeline activities log
  const [adminActivities, setAdminActivities] = useState<{ id: string; t: string; text: string }[]>([
    { id: "init", t: new Date().toLocaleTimeString(), text: "Tournament Command Center opened" }
  ]);

  const pushActivity = (text: string) => {
    setAdminActivities((prev) => [
      { id: Math.random().toString(), t: new Date().toLocaleTimeString(), text },
      ...prev.slice(0, 7)
    ]);
  };

  const isSaving = update.isPending || del.isPending || add.isPending;

  // Filtered match records
  const filteredMatches = data.filter((m) =>
    m.teamA.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.teamB.toLowerCase().includes(searchQuery.toLowerCase()) ||
    SPORT_META[m.sport].label.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.venue.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const liveMatches = data.filter((m) => m.status === "live").length;
  const upcomingMatches = data.filter((m) => m.status === "upcoming").length;
  const completedMatches = data.filter((m) => m.status === "completed").length;

  const currentTourney = tournaments.find((t) => t.id === selectedTourneyId);

  // Sport-specific quick actions handler
  const handleQuickAction = (m: Match, team: "A" | "B", actionLabel: string, points: number, statKey?: string) => {
    const teamName = team === "A" ? m.teamA : m.teamB;
    const newLog = [
      { t: Date.now(), text: `${teamName}: ${actionLabel}` },
      ...m.log
    ];
    const patch: Partial<Match> = { log: newLog };
    
    if (team === "A") {
      patch.scoreA = m.scoreA + points;
    } else {
      patch.scoreB = m.scoreB + points;
    }

    if (statKey) {
      const stats = { ...m.stats };
      stats[statKey] = (stats[statKey] || 0) + 1;
      patch.stats = stats;
    }

    update.mutate({ id: m.id, patch });
    toast.success(`${actionLabel} logged for ${teamName}!`);
    pushActivity(`Logged score point event for ${m.teamA} vs ${m.teamB} (${actionLabel})`);
  };

  // Automatic Fixtures Generator
  const generateFixtures = (sport: Sport, teams: string[], type: "round-robin" | "knockout", venue: string) => {
    if (teams.length < 2) {
      toast.error("At least 2 teams are required to generate fixtures!");
      return;
    }
    const generated: Omit<Match, "id" | "log">[] = [];
    const now = Date.now();

    if (type === "round-robin") {
      // Create round-robin pair matching
      for (let i = 0; i < teams.length; i++) {
        for (let j = i + 1; j < teams.length; j++) {
          generated.push({
            sport,
            teamA: teams[i],
            teamB: teams[j],
            scoreA: 0,
            scoreB: 0,
            status: "upcoming",
            venue,
            scheduledAt: now + (generated.length * 7200 * 1000) // Offset by 2 hours each
          });
        }
      }
    } else {
      // Create knockout pairings
      for (let i = 0; i < teams.length - 1; i += 2) {
        generated.push({
          sport,
          teamA: teams[i],
          teamB: teams[i + 1],
          scoreA: 0,
          scoreB: 0,
          status: "upcoming",
          venue,
          scheduledAt: now + (generated.length * 7200 * 1000)
        });
      }
    }

    // Add generated fixtures to state
    generated.forEach((m) => add.mutate(m));
    toast.success(`Generated ${generated.length} ${type} match fixtures for ${SPORT_META[sport].label}!`);
    pushActivity(`Generated ${generated.length} ${type} matches for ${SPORT_META[sport].label}`);
    setActiveTab("fixtures");
  };

  if (!user?.isAdmin) {
    return (
      <div className="relative min-h-[calc(100vh-80px)] w-full overflow-hidden flex items-center justify-center px-6 py-12 bg-[#06070c]">
        
        {/* BLURRED MOCK ADMIN DASHBOARD PREVIEW BACKGROUND */}
        <div className="absolute inset-0 filter blur-[10px] opacity-15 pointer-events-none select-none -z-10 grid grid-cols-12 gap-4 p-8">
          <div className="col-span-2 bg-[#0d0e15]/90 border border-white/5 rounded-2xl p-4 h-full flex flex-col gap-4">
            <div className="h-8 bg-white/10 rounded-lg w-3/4" />
            <div className="space-y-2.5 mt-8">
              {[...Array(6)].map((_, idx) => (
                <div key={idx} className="h-8 bg-white/5 rounded-lg w-full" />
              ))}
            </div>
          </div>
          <div className="col-span-10 flex flex-col gap-4">
            <div className="h-14 bg-[#0d0e15]/90 border border-white/5 rounded-xl p-4 flex justify-between items-center">
              <div className="h-4 bg-white/10 rounded w-1/4" />
              <div className="h-8 bg-white/10 rounded-full w-24" />
            </div>
            <div className="grid grid-cols-3 gap-4">
              {[...Array(3)].map((_, idx) => (
                <div key={idx} className="h-28 bg-[#0d0e15]/90 border border-white/5 rounded-xl p-4 flex flex-col justify-between">
                  <div className="h-3 bg-white/10 rounded w-1/2" />
                  <div className="h-8 bg-white/20 rounded w-1/3" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* GLOW BACKDROP VECTOR */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[450px] h-[450px] rounded-full bg-[radial-gradient(circle,rgba(139,92,246,0.08)_0%,rgba(110,168,255,0.04)_50%,transparent_70%)] blur-[50px] pointer-events-none -z-10 animate-pulse" style={{ animationDuration: "8s" }} />

        {/* SECURITY CARD PANEL */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 100, damping: 15 }}
          className="relative w-full max-w-md rounded-3xl p-8 border border-white/20 bg-[#161a2f]/85 backdrop-blur-xl text-center"
          style={{ boxShadow: "0 40px 80px rgba(0, 0, 0, 0.8), 0 0 50px rgba(139, 92, 246, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.12)" }}
        >
          <div className="flex justify-center mb-5">
            <motion.div
              animate={{ 
                boxShadow: [
                  "0 0 15px rgba(139, 92, 246, 0.2)",
                  "0 0 25px rgba(139, 92, 246, 0.5)",
                  "0 0 15px rgba(139, 92, 246, 0.2)"
                ],
                borderColor: [
                  "rgba(139, 92, 246, 0.3)",
                  "rgba(139, 92, 246, 0.7)",
                  "rgba(139, 92, 246, 0.3)"
                ]
              }}
              transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
              className="flex h-16 w-16 items-center justify-center rounded-2xl border bg-[#8b5cf6]/10 text-[#c084fc]"
            >
              <ShieldCheck className="h-9 w-9 stroke-[1.5]" />
            </motion.div>
          </div>

          <div className="mb-6">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[9px] font-extrabold uppercase tracking-widest text-white/50 mb-3.5">
              🔒 Protected Area
            </span>
            <h1 className="text-2xl font-extrabold tracking-tight text-white">Admin Command Center</h1>
            <p className="mt-2 text-xs text-white/50 leading-relaxed px-2">
              Only authorized administrators can access the tournament command center. Please sign in with an administrator account.
            </p>
          </div>

          <div className="glass bg-black/25 border border-white/5 rounded-2xl p-4.5 mb-6 text-left space-y-2.5">
            <div className="text-[10px] uppercase tracking-wider font-bold text-white/35 mb-1.5">Admin capabilities</div>
            <div className="flex items-center gap-2 text-xs text-white/70">
              <span className="text-[#35e6a4] font-bold">✓</span> Tournament Management
            </div>
            <div className="flex items-center gap-2 text-xs text-white/70">
              <span className="text-[#35e6a4] font-bold">✓</span> Live Score Controls
            </div>
            <div className="flex items-center gap-2 text-xs text-white/70">
              <span className="text-[#35e6a4] font-bold">✓</span> Team Verification
            </div>
            <div className="flex items-center gap-2 text-xs text-white/70">
              <span className="text-[#35e6a4] font-bold">✓</span> Real-Time Analytics
            </div>
          </div>

          {user && (
            <div className="grid grid-cols-2 gap-3 mb-6 bg-white/[0.02] border border-white/5 rounded-xl p-3 text-left">
              <div>
                <div className="text-[8px] uppercase tracking-wider text-white/40">Current Role</div>
                <div className="text-xs font-bold text-white/80 mt-0.5 flex items-center gap-1">
                  <span>👤</span> Student
                </div>
              </div>
              <div className="border-l border-white/5 pl-3">
                <div className="text-[8px] uppercase tracking-wider text-white/40">Required Role</div>
                <div className="text-xs font-bold text-[#c084fc] mt-0.5 flex items-center gap-1">
                  <span>🛡</span> Admin
                </div>
              </div>
            </div>
          )}

          <div className="space-y-3.5">
            <Link to="/auth" search={{ mode: "login", admin: "true" }}>
              <motion.button
                whileHover={{ y: -3, scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
                className="relative w-full h-12 rounded-xl text-xs font-bold uppercase tracking-wider text-white bg-gradient-to-r from-[#6ea8ff] to-[#8b5cf6] border border-[#6ea8ff]/30 shadow-[0_4px_20px_rgba(110,168,255,0.25),_0_0_15px_rgba(139,92,246,0.15)] hover:shadow-[0_12px_30px_rgba(110,168,255,0.45),_0_0_20px_rgba(139,92,246,0.25)] hover:brightness-110 active:scale-[0.98] transition-all duration-300 cursor-pointer flex items-center justify-center gap-1 group w-full"
              >
                <span>Sign in as Admin</span>
                <ArrowRight className="h-4 w-4 transform group-hover:translate-x-0.5 transition-transform duration-300" />
              </motion.button>
            </Link>

            <div className="pt-2">
              <Link 
                to="/" 
                className="text-xs text-white/40 hover:text-white transition duration-300 underline underline-offset-4 cursor-pointer"
              >
                &larr; Return to Homepage
              </Link>
            </div>
          </div>

        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      
      {/* Top sticky command center navigation header */}
      <div className="sticky top-0 z-30 border-b border-white/5 bg-[#0d0e15]/75 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-white transition duration-300">
            <ArrowLeft className="h-4 w-4" /> Home
          </Link>
          <div className="flex items-center gap-2 text-sm">
            <ShieldCheck className="h-4 w-4 text-[color:var(--neon-purple)] animate-pulse" />
            <span className="font-semibold tracking-wide">Admin Command Center</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:block text-xs text-white/40 font-medium">Console · {user.username}</div>
            <div className="bg-white/5 border border-white/10 rounded-lg px-2.5 py-1">
              {isSaving ? (
                <div className="flex items-center gap-1.5 text-xs text-amber-400">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  <span>Saving...</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-xs text-[#35e6a4] font-semibold">
                  <CheckCircle2 className="h-3 w-3" />
                  <span>Synced ✓</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Primary Module Workspace tabs */}
      <div className="border-b border-white/5 bg-[#08090f] py-3.5">
        <div className="mx-auto max-w-7xl px-6 flex items-center gap-1.5 overflow-x-auto">
          {(["tournaments", "fixtures", "announcements", "logs"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition duration-300 cursor-pointer ${
                activeTab === tab 
                  ? "bg-gradient-to-r from-[#6ea8ff]/20 to-[#8b5cf6]/20 border border-[#6ea8ff]/30 text-white shadow-[0_0_12px_rgba(110,168,255,0.1)]" 
                  : "text-white/40 border border-transparent hover:text-white/80 hover:bg-white/5"
              }`}
            >
              {tab === "tournaments" && "🏆 Tournaments"}
              {tab === "fixtures" && "📅 Fixtures & Scores"}
              {tab === "announcements" && "📢 Announcements"}
              {tab === "logs" && "📈 Activity Logs"}
            </button>
          ))}
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-8">
        
        {/* TAB 1: TOURNAMENT HIERARCHY MANAGER */}
        {activeTab === "tournaments" && (
          <div className="space-y-6">
            
            {/* Upper Dashboard stats summary */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-extrabold tracking-tight">Tournament Controller</h1>
                <p className="text-xs text-white/50 mt-0.5">Manage sports categories, approve team registrations, and generate match sheets.</p>
              </div>
              <button 
                onClick={() => { setShowTourneyModal(true); setTourneyStep(1); }}
                className="btn-neon inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold uppercase tracking-wider cursor-pointer"
              >
                <Plus className="h-4 w-4" /> Create Tournament
              </button>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
              
              {/* Tournaments list block */}
              <div className="lg:col-span-1 space-y-4">
                <div className="flex items-center justify-between border-b border-white/5 pb-2">
                  <h3 className="font-bold text-xs uppercase tracking-wider text-white/40">Active Events</h3>
                </div>
                
                {tournaments.map((t) => (
                  <div 
                    key={t.id}
                    onClick={() => setSelectedTourneyId(t.id)}
                    className={`glass border p-5 rounded-2xl cursor-pointer transition-all duration-300 text-left ${
                      selectedTourneyId === t.id 
                        ? "border-[#8b5cf6]/40 bg-[#141220] shadow-[0_0_20px_rgba(139,92,246,0.1)]" 
                        : "border-white/5 bg-white/[0.01] hover:bg-white/[0.02]"
                    }`}
                  >
                    <h4 className="font-extrabold text-sm text-white/95">{t.name}</h4>
                    <div className="mt-3.5 space-y-2 text-xs text-white/50">
                      <div className="flex items-center gap-1.5"><Building2 className="h-3.5 w-3.5 text-[#6ea8ff]" /> {t.venue}</div>
                      <div className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5 text-[#8b5cf6]" /> {t.startDate} to {t.endDate}</div>
                      <div className="flex items-center gap-1.5"><Users className="h-3.5 w-3.5 text-emerald-400" /> {t.teams.length} Teams Registered</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Tournament detail workspaces */}
              <div className="lg:col-span-2">
                {currentTourney ? (
                  <div className="glass border border-white/10 rounded-3xl p-6 bg-white/[0.01]">
                    
                    {/* Header metrics card */}
                    <div className="border-b border-white/5 pb-4.5 mb-6">
                      <span className="text-[9px] font-extrabold uppercase tracking-widest text-[#8b5cf6] bg-[#8b5cf6]/10 px-2 py-0.5 rounded">Active Workspace</span>
                      <h2 className="text-xl font-extrabold tracking-tight text-white mt-1.5">{currentTourney.name}</h2>
                      
                      <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-white/40">
                        <span>📍 {currentTourney.venue}</span>
                        <span>•</span>
                        <span>📅 {currentTourney.startDate} ~ {currentTourney.endDate}</span>
                      </div>
                    </div>

                    <div className="grid gap-6 md:grid-cols-12">
                      
                      {/* Left: Sports Selector */}
                      <div className="md:col-span-4 space-y-2">
                        <div className="text-[10px] uppercase tracking-wider font-bold text-white/35 mb-1.5">Enabled Sports</div>
                        <div className="flex flex-col gap-1.5">
                          {currentTourney.sports.map((sport) => (
                            <button
                              key={sport}
                              onClick={() => setActiveWorkspaceSport(sport)}
                              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-left transition duration-300 cursor-pointer ${
                                activeWorkspaceSport === sport 
                                  ? "bg-[#8b5cf6]/20 border border-[#8b5cf6]/30 text-white" 
                                  : "bg-white/5 border border-transparent text-white/60 hover:text-white hover:bg-white/10"
                              }`}
                            >
                              <SportIcon sport={sport} className="h-4.5 w-4.5 shrink-0" />
                              <span>{SPORT_META[sport].label}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Right: Team Approvals & Match Generator console */}
                      <div className="md:col-span-8 space-y-6">
                        
                        {/* Registered teams lists card */}
                        <div className="bg-black/25 border border-white/5 rounded-2xl p-4.5">
                          <div className="flex items-center justify-between border-b border-white/5 pb-2 mb-3.5">
                            <h3 className="font-extrabold text-xs uppercase tracking-wider text-white/40 flex items-center gap-1">
                              <Users className="h-3.5 w-3.5 text-emerald-400" />
                              Teams Pool ({currentTourney.teams.length})
                            </h3>
                          </div>
                          
                          <div className="flex flex-wrap gap-1.5 max-h-[120px] overflow-y-auto pr-1">
                            {currentTourney.teams.map((team, idx) => (
                              <span 
                                key={idx} 
                                className="inline-flex items-center gap-1 rounded-lg border border-white/5 bg-white/5 px-2.5 py-1 text-xs text-white/80"
                              >
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                                <span>{team}</span>
                                <button 
                                  onClick={() => {
                                    const updatedTeams = currentTourney.teams.filter((t) => t !== team);
                                    setTournaments(prev => prev.map(t => t.id === currentTourney.id ? { ...t, teams: updatedTeams } : t));
                                    pushActivity(`Removed team ${team} from registrations`);
                                    toast.success(`${team} registration cancelled`);
                                  }}
                                  className="text-white/30 hover:text-red-400 ml-1.5 cursor-pointer"
                                >
                                  &times;
                                </button>
                              </span>
                            ))}
                          </div>

                          {/* Quick Team Register add input */}
                          <div className="mt-4 flex gap-2">
                            <input 
                              type="text" 
                              placeholder="New Team (e.g. IT Strikers)" 
                              value={newTeamName}
                              onChange={(e) => setNewTeamName(e.target.value)}
                              className="rounded-xl border border-white/10 bg-[#0d0e15]/40 px-3 py-1.5 text-xs outline-none focus:border-[color:var(--neon-purple)] flex-1"
                            />
                            <button
                              onClick={() => {
                                if (!newTeamName.trim()) return;
                                if (currentTourney.teams.includes(newTeamName.trim())) {
                                  toast.error("Team already registered!");
                                  return;
                                }
                                const updatedTeams = [...currentTourney.teams, newTeamName.trim()];
                                setTournaments(prev => prev.map(t => t.id === currentTourney.id ? { ...t, teams: updatedTeams } : t));
                                setNewTeamName("");
                                pushActivity(`Registered team: ${newTeamName.trim()}`);
                                toast.success(`${newTeamName.trim()} registered!`);
                              }}
                              className="px-3.5 py-1.5 rounded-xl border border-white/10 bg-white/5 text-xs font-semibold text-white/95 hover:bg-white/10 cursor-pointer"
                            >
                              Add
                            </button>
                          </div>
                        </div>

                        {/* Fixtures automation generator widget */}
                        <div className="bg-black/25 border border-white/5 rounded-2xl p-4.5">
                          <div className="flex items-center justify-between border-b border-white/5 pb-2 mb-3.5">
                            <h3 className="font-extrabold text-xs uppercase tracking-wider text-white/40 flex items-center gap-1">
                              <Trophy className="h-3.5 w-3.5 text-amber-400" />
                              Auto-Generate Fixtures
                            </h3>
                          </div>
                          
                          <p className="text-xs text-white/50 leading-relaxed mb-4">
                            Instantly create match schedules from the registered teams pool for <strong>{SPORT_META[activeWorkspaceSport].label}</strong>.
                          </p>

                          <div className="grid grid-cols-2 gap-4 mb-4">
                            <label className={`flex flex-col gap-1 p-3 border rounded-xl cursor-pointer transition duration-300 ${
                              fixtureGenType === "round-robin" ? "border-[#8b5cf6]/40 bg-[#8b5cf6]/5" : "border-white/5 bg-white/[0.01] hover:bg-white/[0.02]"
                            }`}>
                              <div className="flex items-center gap-1.5">
                                <input type="radio" checked={fixtureGenType === "round-robin"} onChange={() => setFixtureGenType("round-robin")} className="accent-[#8b5cf6]" />
                                <span className="text-xs font-bold text-white/90">Round Robin</span>
                              </div>
                              <span className="text-[10px] text-white/40">Every team plays every other team once.</span>
                            </label>

                            <label className={`flex flex-col gap-1 p-3 border rounded-xl cursor-pointer transition duration-300 ${
                              fixtureGenType === "knockout" ? "border-[#8b5cf6]/40 bg-[#8b5cf6]/5" : "border-white/5 bg-white/[0.01] hover:bg-white/[0.02]"
                            }`}>
                              <div className="flex items-center gap-1.5">
                                <input type="radio" checked={fixtureGenType === "knockout"} onChange={() => setFixtureGenType("knockout")} className="accent-[#8b5cf6]" />
                                <span className="text-xs font-bold text-white/90">Knockout</span>
                              </div>
                              <span className="text-[10px] text-white/40">Single elimination matching structure.</span>
                            </label>
                          </div>

                          <button
                            onClick={() => generateFixtures(activeWorkspaceSport, currentTourney.teams, fixtureGenType, currentTourney.venue)}
                            className="btn-neon w-full rounded-xl py-3 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer transition-colors duration-300"
                          >
                            <span>Generate {SPORT_META[activeWorkspaceSport].label} Fixtures</span>
                            <span>⚡</span>
                          </button>
                        </div>

                      </div>

                    </div>

                  </div>
                ) : (
                  <div className="text-center text-white/35 py-24 border border-dashed border-white/10 rounded-3xl bg-black/10">
                    No active tournament selected. Create one to begin.
                  </div>
                )}
              </div>

            </div>

          </div>
        )}

        {/* TAB 2: FIXTURES CONTROL BOARD */}
        {activeTab === "fixtures" && (
          <div className="space-y-4">
            
            {/* Header controls and Search */}
            <div className="flex flex-wrap gap-4 items-center justify-between bg-white/[0.01] border border-white/5 rounded-2xl p-4">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-extrabold tracking-tight">Match Fixtures</h2>
                <span className="text-xs font-bold bg-white/5 text-white/50 px-2.5 py-0.5 rounded-full">{filteredMatches.length} total</span>
              </div>
              
              <div className="flex items-center gap-3 flex-wrap">
                {/* Search Bar */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/40" />
                  <input 
                    type="text" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search fixtures, teams..." 
                    className="rounded-xl border border-white/10 bg-[#0d0e15]/60 pl-9 pr-3 py-1.5 text-xs outline-none focus:border-[color:var(--neon-purple)] transition-all duration-300 w-44 md:w-56"
                  />
                  {searchQuery && (
                    <button onClick={() => setSearchQuery("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"><X className="h-3 w-3" /></button>
                  )}
                </div>

                {/* Add fixture button */}
                <button 
                  onClick={() => setShowNewManualFixture(true)} 
                  className="btn-neon inline-flex items-center gap-1 rounded-xl px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" /> Add fixture
                </button>
              </div>
            </div>

            {/* Counts Overview Banner */}
            <div className="grid grid-cols-3 gap-3 bg-white/[0.02] border border-white/5 rounded-2xl p-3 text-center">
              <div className="flex items-center justify-center gap-2 py-1 rounded-xl bg-rose-500/5 border border-rose-500/10 text-xs font-bold text-rose-400">
                <Radio className="h-3.5 w-3.5 animate-pulse" />
                <span>{liveMatches} Live</span>
              </div>
              <div className="flex items-center justify-center gap-2 py-1 rounded-xl bg-blue-500/5 border border-blue-500/10 text-xs font-bold text-[#6ea8ff]">
                <CalendarDays className="h-3.5 w-3.5" />
                <span>{upcomingMatches} Upcoming</span>
              </div>
              <div className="flex items-center justify-center gap-2 py-1 rounded-xl bg-white/5 border border-white/5 text-xs font-bold text-white/40">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>{completedMatches} Completed</span>
              </div>
            </div>

            {/* Fixtures list cards container */}
            <div className="space-y-4">
              {filteredMatches.map((m) => (
                <motion.div 
                  key={m.id} 
                  layout 
                  className="glass border border-white/10 hover:border-white/20 bg-white/[0.01] hover:bg-white/[0.02] rounded-3xl p-5 hover:-translate-y-0.75 transition-all duration-300 relative shadow-[0_4px_30px_rgba(0,0,0,0.4)]"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/5 border border-white/10 shadow-[0_0_8px_rgba(255,255,255,0.03)] mt-0.5">
                        <SportIcon sport={m.sport} className="h-5.5 w-5.5" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 font-bold text-sm text-white/90">
                          <span className="truncate">{m.teamA}</span>
                          <span className="text-white/30 text-xs">vs</span>
                          <span className="truncate">{m.teamB}</span>
                        </div>
                        <div className="text-xs text-white/50 mt-0.5 flex items-center gap-1.5">
                          <span className="font-semibold text-white/60">{SPORT_META[m.sport].label}</span>
                          <span>·</span>
                          <span>{m.venue}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <select 
                        value={m.status} 
                        onChange={(e) => {
                          const newStatus = e.target.value as Match["status"];
                          update.mutate({ id: m.id, patch: { status: newStatus } });
                          pushActivity(`Changed status to ${newStatus} for ${m.teamA} vs ${m.teamB}`);
                        }}
                        className={`rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs outline-none font-semibold transition-colors duration-300 cursor-pointer ${
                          m.status === "live" ? "text-rose-400" : m.status === "upcoming" ? "text-[#6ea8ff]" : "text-white/40"
                        }`}
                      >
                        <option value="upcoming" className="bg-[#121320] text-[#6ea8ff]">Upcoming</option>
                        <option value="live" className="bg-[#121320] text-rose-400">Live</option>
                        <option value="completed" className="bg-[#121320] text-white/40">Completed</option>
                      </select>

                      {/* Deletion safety confirmation controls */}
                      <div className="flex items-center">
                        {confirmDeleteId === m.id ? (
                          <div className="flex items-center gap-1.5 bg-rose-500/10 border border-rose-500/20 px-2.5 py-1.5 rounded-lg text-xs font-semibold animate-pulse">
                            <span className="text-rose-400">Delete?</span>
                            <button 
                              onClick={() => { 
                                del.mutate(m.id); 
                                setConfirmDeleteId(null); 
                              }} 
                              className="text-rose-400 hover:text-rose-300 font-extrabold cursor-pointer"
                            >
                              Yes
                            </button>
                            <span className="text-white/20">|</span>
                            <button 
                              onClick={() => setConfirmDeleteId(null)} 
                              className="text-white/50 hover:text-white cursor-pointer"
                            >
                              No
                            </button>
                          </div>
                        ) : (
                          <button 
                            onClick={() => setConfirmDeleteId(m.id)} 
                            className="rounded-lg border border-white/5 bg-white/5 p-2 text-white/40 hover:bg-rose-500/10 hover:text-rose-400 transition-colors duration-300 cursor-pointer"
                            title="Delete Fixture"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>

                  </div>

                  {/* Score Editing center */}
                  <div className="mt-5 grid grid-cols-2 gap-4 border-t border-white/5 pt-4">
                    <div className="flex items-center justify-between bg-black/25 border border-white/5 rounded-2xl p-3">
                      <div className="text-left max-w-[50%] shrink-0">
                        <div className="text-[10px] uppercase font-bold text-white/40 truncate tracking-wide">Team A score</div>
                        <div className="text-xs font-semibold text-white/80 mt-0.5 truncate">{m.teamA}</div>
                      </div>
                      <ScoreControl 
                        label="Score" 
                        value={m.scoreA} 
                        onChange={(v) => {
                          update.mutate({ id: m.id, patch: { scoreA: v } });
                          pushActivity(`Updated score for ${m.teamA} to ${v}`);
                        }} 
                      />
                    </div>

                    <div className="flex items-center justify-between bg-black/25 border border-white/5 rounded-2xl p-3">
                      <div className="text-left max-w-[50%] shrink-0">
                        <div className="text-[10px] uppercase font-bold text-white/40 truncate tracking-wide">Team B score</div>
                        <div className="text-xs font-semibold text-white/80 mt-0.5 truncate">{m.teamB}</div>
                      </div>
                      <ScoreControl 
                        label="Score" 
                        value={m.scoreB} 
                        onChange={(v) => {
                          update.mutate({ id: m.id, patch: { scoreB: v } });
                          pushActivity(`Updated score for ${m.teamB} to ${v}`);
                        }} 
                      />
                    </div>
                  </div>

                  {/* Quick events score buttons */}
                  <div className="mt-4 border-t border-white/5 pt-3">
                    <div className="text-[10px] uppercase tracking-wider font-bold text-white/35 mb-2 flex items-center gap-1.5">
                      <Flame className="h-3 w-3 text-amber-500" />
                      Quick scoring controls
                    </div>

                    {m.sport === "cricket" && (
                      <div className="flex flex-wrap gap-2.5">
                        <div className="flex items-center gap-1">
                          <span className="text-[10px] font-semibold text-white/50 uppercase mr-1">{m.teamA.split(" ")[0]}:</span>
                          <button onClick={() => handleQuickAction(m, "A", "+4 Runs", 4)} className="px-2 py-1 rounded bg-[#6ea8ff]/10 border border-[#6ea8ff]/20 text-[10px] text-[#6ea8ff] hover:bg-[#6ea8ff]/20 cursor-pointer">+4</button>
                          <button onClick={() => handleQuickAction(m, "A", "+6 Runs", 6)} className="px-2 py-1 rounded bg-[#6ea8ff]/10 border border-[#6ea8ff]/20 text-[10px] text-[#6ea8ff] hover:bg-[#6ea8ff]/20 cursor-pointer">+6</button>
                          <button onClick={() => handleQuickAction(m, "A", "Wicket Lost", 0, "wicketsA")} className="px-2 py-1 rounded bg-rose-500/10 border border-rose-500/20 text-[10px] text-rose-400 hover:bg-rose-500/20 cursor-pointer">+Wkt</button>
                        </div>
                        <div className="w-[1px] bg-white/10 self-stretch my-0.5 hidden md:block" />
                        <div className="flex items-center gap-1">
                          <span className="text-[10px] font-semibold text-white/50 uppercase mr-1">{m.teamB.split(" ")[0]}:</span>
                          <button onClick={() => handleQuickAction(m, "B", "+4 Runs", 4)} className="px-2 py-1 rounded bg-[#8b5cf6]/10 border border-[#8b5cf6]/20 text-[10px] text-[#c084fc] hover:bg-[#8b5cf6]/20 cursor-pointer">+4</button>
                          <button onClick={() => handleQuickAction(m, "B", "+6 Runs", 6)} className="px-2 py-1 rounded bg-[#8b5cf6]/10 border border-[#8b5cf6]/20 text-[10px] text-[#c084fc] hover:bg-[#8b5cf6]/20 cursor-pointer">+6</button>
                          <button onClick={() => handleQuickAction(m, "B", "Wicket Lost", 0, "wicketsB")} className="px-2 py-1 rounded bg-rose-500/10 border border-rose-500/20 text-[10px] text-rose-400 hover:bg-rose-500/20 cursor-pointer">+Wkt</button>
                        </div>
                      </div>
                    )}

                    {m.sport === "football" && (
                      <div className="flex flex-wrap gap-2.5">
                        <div className="flex items-center gap-1">
                          <span className="text-[10px] font-semibold text-white/50 uppercase mr-1">{m.teamA.split(" ")[0]}:</span>
                          <button onClick={() => handleQuickAction(m, "A", "GOAL", 1)} className="px-2 py-1 rounded bg-emerald-500/10 border border-emerald-500/20 text-[10px] text-emerald-400 hover:bg-emerald-500/20 cursor-pointer">+Goal</button>
                          <button onClick={() => handleQuickAction(m, "A", "Yellow Card", 0)} className="px-2 py-1 rounded bg-amber-500/10 border border-amber-500/20 text-[10px] text-amber-400 hover:bg-amber-500/20 cursor-pointer">🟨 Card</button>
                          <button onClick={() => handleQuickAction(m, "A", "Red Card", 0)} className="px-2 py-1 rounded bg-rose-500/10 border border-rose-500/20 text-[10px] text-rose-400 hover:bg-rose-500/20 cursor-pointer">🟥 Card</button>
                        </div>
                        <div className="w-[1px] bg-white/10 self-stretch my-0.5 hidden md:block" />
                        <div className="flex items-center gap-1">
                          <span className="text-[10px] font-semibold text-white/50 uppercase mr-1">{m.teamB.split(" ")[0]}:</span>
                          <button onClick={() => handleQuickAction(m, "B", "GOAL", 1)} className="px-2 py-1 rounded bg-emerald-500/10 border border-emerald-500/20 text-[10px] text-emerald-400 hover:bg-emerald-500/20 cursor-pointer">+Goal</button>
                          <button onClick={() => handleQuickAction(m, "B", "Yellow Card", 0)} className="px-2 py-1 rounded bg-amber-500/10 border border-amber-500/20 text-[10px] text-amber-400 hover:bg-amber-500/20 cursor-pointer">🟨 Card</button>
                          <button onClick={() => handleQuickAction(m, "B", "Red Card", 0)} className="px-2 py-1 rounded bg-rose-500/10 border border-rose-500/20 text-[10px] text-rose-400 hover:bg-rose-500/20 cursor-pointer">🟥 Card</button>
                        </div>
                      </div>
                    )}

                    {m.sport === "basketball" && (
                      <div className="flex flex-wrap gap-2.5">
                        <div className="flex items-center gap-1">
                          <span className="text-[10px] font-semibold text-white/50 uppercase mr-1">{m.teamA.split(" ")[0]}:</span>
                          <button onClick={() => handleQuickAction(m, "A", "+2 Points", 2)} className="px-2 py-1 rounded bg-[#6ea8ff]/10 border border-[#6ea8ff]/20 text-[10px] text-[#6ea8ff] hover:bg-[#6ea8ff]/20 cursor-pointer">+2 Pts</button>
                          <button onClick={() => handleQuickAction(m, "A", "+3 Points", 3)} className="px-2 py-1 rounded bg-[#6ea8ff]/10 border border-[#6ea8ff]/20 text-[10px] text-[#6ea8ff] hover:bg-[#6ea8ff]/20 cursor-pointer">+3 Pts</button>
                          <button onClick={() => handleQuickAction(m, "A", "Free Throw", 1)} className="px-2 py-1 rounded bg-amber-500/10 border border-amber-500/20 text-[10px] text-amber-400 hover:bg-amber-500/20 cursor-pointer">+FT</button>
                        </div>
                        <div className="w-[1px] bg-white/10 self-stretch my-0.5 hidden md:block" />
                        <div className="flex items-center gap-1">
                          <span className="text-[10px] font-semibold text-white/50 uppercase mr-1">{m.teamB.split(" ")[0]}:</span>
                          <button onClick={() => handleQuickAction(m, "B", "+2 Points", 2)} className="px-2 py-1 rounded bg-[#8b5cf6]/10 border border-[#8b5cf6]/20 text-[10px] text-[#c084fc] hover:bg-[#8b5cf6]/20 cursor-pointer">+2 Pts</button>
                          <button onClick={() => handleQuickAction(m, "B", "+3 Points", 3)} className="px-2 py-1 rounded bg-[#8b5cf6]/10 border border-[#8b5cf6]/20 text-[10px] text-[#c084fc] hover:bg-[#8b5cf6]/20 cursor-pointer">+3 Pts</button>
                          <button onClick={() => handleQuickAction(m, "B", "Free Throw", 1)} className="px-2 py-1 rounded bg-amber-500/10 border border-amber-500/20 text-[10px] text-amber-400 hover:bg-amber-500/20 cursor-pointer">+FT</button>
                        </div>
                      </div>
                    )}

                    {m.sport !== "cricket" && m.sport !== "football" && m.sport !== "basketball" && (
                      <div className="flex flex-wrap gap-2.5">
                        <button onClick={() => handleQuickAction(m, "A", "+1 Point", 1)} className="px-2.5 py-1 rounded bg-white/5 border border-white/10 text-[10px] hover:bg-white/10 cursor-pointer">{m.teamA.split(" ")[0]} +1 Pt</button>
                        <button onClick={() => handleQuickAction(m, "B", "+1 Point", 1)} className="px-2.5 py-1 rounded bg-white/5 border border-white/10 text-[10px] hover:bg-white/10 cursor-pointer">{m.teamB.split(" ")[0]} +1 Pt</button>
                      </div>
                    )}

                  </div>

                </motion.div>
              ))}
              {filteredMatches.length === 0 && (
                <div className="w-full py-20 text-center text-white/40 border border-dashed border-white/10 rounded-3xl bg-black/10">
                  No fixtures found matching "{searchQuery}".
                </div>
              )}
            </div>

          </div>
        )}

        {/* TAB 3: ANNOUNCEMENTS MODULATOR */}
        {activeTab === "announcements" && (
          <div className="grid gap-6 md:grid-cols-12">
            
            {/* Create Broadcast */}
            <div className="md:col-span-5">
              <div className="glass border border-white/10 rounded-2xl p-5 bg-white/[0.01]">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Megaphone className="h-4.5 w-4.5 text-[color:var(--neon-purple)]" />
                    <h2 className="font-bold text-sm tracking-tight">Create Announcement</h2>
                  </div>
                </div>
                
                <textarea 
                  value={msg} 
                  onChange={(e) => setMsg(e.target.value)} 
                  placeholder="Broadcast message to all dashboard screens live…" 
                  rows={4}
                  className="w-full rounded-xl border border-white/10 bg-[#0d0e15]/60 p-3 text-xs outline-none focus:border-[color:var(--neon-purple)] transition duration-300 resize-none text-white" 
                />
                
                <button 
                  onClick={() => { 
                    if (msg.trim()) { 
                      pushBroadcast(msg.trim()); 
                      setMsg(""); 
                      toast.success("Alert broadcasted live!"); 
                      pushActivity(`Sent broadcast alert: "${msg.trim().slice(0, 15)}..."`);
                      setBroadcastSent(true);
                      setTimeout(() => setBroadcastSent(false), 2000);
                    } 
                  }}
                  disabled={!msg.trim()}
                  className="btn-neon mt-3.5 w-full rounded-xl py-3 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50 disabled:pointer-events-none transition duration-300"
                >
                  {broadcastSent ? (
                    <span className="flex items-center gap-1 text-[#35e6a4]"><CheckCircle2 className="h-4.5 w-4.5" /> Broadcast Sent ✓</span>
                  ) : (
                    <span>Publish Broadcast</span>
                  )}
                </button>
              </div>
            </div>

            {/* Broadcast History alerts list */}
            <div className="md:col-span-7">
              <div className="glass border border-white/10 rounded-2xl p-5 bg-white/[0.01] flex flex-col min-h-[300px]">
                <div className="mb-3.5 border-b border-white/5 pb-2">
                  <h3 className="font-bold text-xs uppercase tracking-wider text-white/45">Alert Broadcast History</h3>
                </div>
                
                <div className="space-y-3">
                  {broadcasts.map((b) => (
                    <div 
                      key={b.id} 
                      className="flex items-start justify-between gap-3 rounded-xl border border-white/5 bg-black/25 p-4 text-xs"
                    >
                      <span className="text-white/80 leading-relaxed font-semibold">{b.message}</span>
                      <button 
                        onClick={() => {
                          removeBroadcast(b.id);
                          pushActivity("Removed broadcast alert");
                          toast.success("Broadcast removed");
                        }} 
                        className="text-white/30 hover:text-red-400 transition-colors cursor-pointer shrink-0"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                  {!broadcasts.length && (
                    <div className="text-xs text-white/30 text-center py-20 flex flex-col items-center justify-center gap-2 bg-black/10 border border-dashed border-white/5 rounded-2xl">
                      <div className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center text-lg">📢</div>
                      <span>No announcements yet.<br />Create your first broadcast.</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

          </div>
        )}

        {/* TAB 4: SYSTEM logs activity list */}
        {activeTab === "logs" && (
          <div className="glass border border-white/10 rounded-2xl p-6 bg-white/[0.01] max-w-2xl mx-auto">
            <div className="mb-4 border-b border-white/5 pb-3 flex items-center justify-between">
              <h2 className="text-lg font-extrabold tracking-tight flex items-center gap-1.5">
                <Activity className="h-5 w-5 text-[color:var(--neon-purple)]" />
                Console Activity Feed
              </h2>
              <button 
                onClick={() => setAdminActivities([{ id: "init", t: new Date().toLocaleTimeString(), text: "Console timeline wiped" }])}
                className="text-xs text-white/40 hover:text-white transition cursor-pointer"
              >
                Clear History
              </button>
            </div>
            
            <div className="space-y-3.5 relative pl-4 border-l border-white/5 py-2">
              {adminActivities.map((act) => (
                <div key={act.id} className="relative flex gap-3 text-xs">
                  <div className="absolute -left-[20.5px] top-1.5 h-2 w-2 rounded-full bg-[#8b5cf6] shadow-[0_0_8px_rgba(139,92,246,0.6)]" />
                  <span className="text-[10px] text-white/30 font-bold shrink-0">{act.t}</span>
                  <span className="text-white/80 font-medium">{act.text}</span>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* MODAL: CREATE TOURNAMENT MULTI STEP */}
      {showTourneyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="glass border border-white/20 w-full max-w-md rounded-3xl p-6 bg-[#161a2f]/95 shadow-[0_30px_60px_rgba(0,0,0,0.6)]">
            
            {/* Modal header with step tracking */}
            <div className="mb-4 flex items-center justify-between border-b border-white/5 pb-3">
              <div>
                <span className="text-[9px] font-extrabold uppercase tracking-widest text-[#8b5cf6]">Step {tourneyStep} of 2</span>
                <h3 className="text-base font-extrabold text-white mt-0.5">
                  {tourneyStep === 1 ? "Create Tournament" : "Choose Sports Included"}
                </h3>
              </div>
              <button onClick={() => setShowTourneyModal(false)} className="rounded-full border border-white/10 bg-white/5 p-1 text-white/50 hover:text-white transition cursor-pointer"><X className="h-4.5 w-4.5" /></button>
            </div>

            {/* STEP 1: General Info details */}
            {tourneyStep === 1 && (
              <div className="space-y-3.5">
                <div>
                  <label className="text-[9px] uppercase tracking-wider font-bold text-white/40 block mb-1">Tournament Name</label>
                  <input 
                    type="text"
                    placeholder="e.g. Annual Sports Fest 2026" 
                    value={newTourneyData.name} 
                    onChange={(e) => setNewTourneyData({ ...newTourneyData, name: e.target.value })} 
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm outline-none text-white focus:border-[#8b5cf6]/60 transition" 
                  />
                </div>
                <div>
                  <label className="text-[9px] uppercase tracking-wider font-bold text-white/40 block mb-1">Hosting Venue</label>
                  <input 
                    type="text"
                    placeholder="e.g. Main Athletic Arena" 
                    value={newTourneyData.venue} 
                    onChange={(e) => setNewTourneyData({ ...newTourneyData, venue: e.target.value })} 
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm outline-none text-white focus:border-[#8b5cf6]/60 transition" 
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[9px] uppercase tracking-wider font-bold text-white/40 block mb-1">Start Date</label>
                    <input 
                      type="date" 
                      value={newTourneyData.startDate} 
                      onChange={(e) => setNewTourneyData({ ...newTourneyData, startDate: e.target.value })} 
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm outline-none text-white focus:border-[#8b5cf6]/60 transition cursor-pointer" 
                    />
                  </div>
                  <div>
                    <label className="text-[9px] uppercase tracking-wider font-bold text-white/40 block mb-1">End Date</label>
                    <input 
                      type="date" 
                      value={newTourneyData.endDate} 
                      onChange={(e) => setNewTourneyData({ ...newTourneyData, endDate: e.target.value })} 
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm outline-none text-white focus:border-[#8b5cf6]/60 transition cursor-pointer" 
                    />
                  </div>
                </div>

                <button 
                  onClick={() => {
                    if (!newTourneyData.name.trim() || !newTourneyData.venue.trim()) {
                      toast.error("Please fill in name and venue");
                      return;
                    }
                    setTourneyStep(2);
                  }}
                  className="btn-neon w-full rounded-xl py-3 font-bold uppercase tracking-wider text-xs cursor-pointer mt-2"
                >
                  Continue &rarr;
                </button>
              </div>
            )}

            {/* STEP 2: Choose Sports */}
            {tourneyStep === 2 && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  {(Object.keys(SPORT_META) as Sport[]).map((sport) => {
                    const isChecked = newTourneyData.sports.includes(sport);
                    return (
                      <button
                        key={sport}
                        type="button"
                        onClick={() => {
                          const updated = isChecked 
                            ? newTourneyData.sports.filter(s => s !== sport)
                            : [...newTourneyData.sports, sport];
                          setNewTourneyData({ ...newTourneyData, sports: updated });
                        }}
                        className={`flex items-center gap-2 p-3 border rounded-xl text-left transition duration-300 cursor-pointer ${
                          isChecked ? "border-[#8b5cf6]/40 bg-[#8b5cf6]/5 text-white" : "border-white/5 bg-white/[0.02] hover:bg-white/[0.04] text-white/60"
                        }`}
                      >
                        <SportIcon sport={sport} className="h-4.5 w-4.5 shrink-0" />
                        <span className="text-xs font-semibold">{SPORT_META[sport].label}</span>
                      </button>
                    );
                  })}
                </div>

                <div className="flex gap-3 mt-4 border-t border-white/5 pt-4">
                  <button 
                    onClick={() => setTourneyStep(1)} 
                    className="flex-1 py-3 border border-white/10 rounded-xl text-xs font-bold uppercase tracking-wider text-white/60 hover:text-white cursor-pointer"
                  >
                    &larr; Back
                  </button>
                  <button 
                    onClick={() => {
                      if (!newTourneyData.sports.length) {
                        toast.error("Please include at least 1 sport category");
                        return;
                      }
                      const created: Tournament = {
                        id: `t_${Math.random().toString()}`,
                        name: newTourneyData.name,
                        venue: newTourneyData.venue,
                        startDate: newTourneyData.startDate || new Date().toISOString().split("T")[0],
                        endDate: newTourneyData.endDate || new Date(Date.now() + 86400_000 * 6).toISOString().split("T")[0],
                        sports: newTourneyData.sports,
                        teams: ["CSE Titans", "IT Strikers", "ECE United", "CSE FC"] // seed initial default branches
                      };
                      setTournaments([...tournaments, created]);
                      setSelectedTourneyId(created.id);
                      setActiveWorkspaceSport(created.sports[0]);
                      setShowTourneyModal(false);
                      toast.success("Tournament created successfully!");
                      pushActivity(`Created Tournament: ${created.name}`);
                    }}
                    className="flex-1 btn-neon rounded-xl py-3 font-bold uppercase tracking-wider text-xs cursor-pointer"
                  >
                    Create Event
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      {/* MODAL: MANUAL FIXTURE CREATOR */}
      {showNewManualFixture && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="glass border border-white/20 w-full max-w-md rounded-3xl p-6 bg-[#161a2f]/95 shadow-[0_30px_60px_rgba(0,0,0,0.6)]">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-extrabold tracking-tight text-white">Add Match Fixture</h3>
              <button onClick={() => setShowNewManualFixture(false)} className="rounded-full border border-white/10 bg-white/5 p-1 text-white/50 hover:text-white transition cursor-pointer"><X className="h-4.5 w-4.5" /></button>
            </div>
            <div className="space-y-3.5">
              <select 
                value={activeWorkspaceSport} 
                onChange={(e) => setActiveWorkspaceSport(e.target.value as Sport)} 
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm outline-none text-white cursor-pointer"
              >
                {Object.entries(SPORT_META).map(([k, m]) => <option key={k} value={k} className="bg-[#121320]">{m.label}</option>)}
              </select>
              <input 
                placeholder="Team A" 
                value={newTeamName} 
                onChange={(e) => setNewTeamName(e.target.value)} 
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm outline-none text-white" 
              />
              <input 
                placeholder="Team B" 
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm outline-none text-white" 
                id="teamB_manual_field"
              />
              <input 
                placeholder="Venue" 
                defaultValue={currentTourney?.venue || "Main Sports Complex"} 
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm outline-none text-white"
                id="venue_manual_field"
              />
              <button 
                onClick={() => {
                  const elB = document.getElementById("teamB_manual_field") as HTMLInputElement;
                  const elVenue = document.getElementById("venue_manual_field") as HTMLInputElement;
                  if (!newTeamName.trim() || !elB?.value.trim()) { 
                    toast.error("Both team names are required!"); 
                    return; 
                  }
                  add.mutate({ 
                    sport: activeWorkspaceSport, 
                    teamA: newTeamName.trim(), 
                    teamB: elB.value.trim(), 
                    venue: elVenue?.value || "Main Complex", 
                    scheduledAt: Date.now() + 86400000, 
                    scoreA: 0, 
                    scoreB: 0, 
                    status: "upcoming" 
                  });
                  setNewTeamName("");
                  setShowNewManualFixture(false);
                  toast.success("Match fixture added successfully!");
                }} 
                className="btn-neon w-full rounded-xl py-3 font-bold uppercase tracking-wider text-xs cursor-pointer"
              >
                Add Fixture
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}