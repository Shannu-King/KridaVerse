import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { mockApi, SPORT_META, type Match, type Sport } from "@/lib/mockApi";
import { SportIcon } from "@/components/SportIcon";
import { CalendarDays, MapPin, Clock, Search } from "lucide-react";

export const Route = createFileRoute("/schedules")({ component: SchedulesPage });

const glowColors = {
  cricket: "rgba(110, 168, 255, 0.4)",
  football: "rgba(53, 230, 164, 0.4)",
  basketball: "rgba(255, 138, 76, 0.4)",
  volleyball: "rgba(245, 196, 81, 0.4)",
  hockey: "rgba(192, 132, 252, 0.4)",
  kabaddi: "rgba(244, 63, 94, 0.4)",
};

function getMatchProgress(m: Match) {
  if (m.status !== "live") return "";
  const elapsedMinutes = Math.floor((Date.now() - m.scheduledAt) / 60000);
  
  switch (m.sport) {
    case "cricket":
      const over = 15 + Math.floor(elapsedMinutes / 3);
      const ball = Math.floor((elapsedMinutes % 3) * 2) % 6;
      return `${over}.${ball} Overs`;
    case "football":
      const min = Math.min(90, Math.max(1, elapsedMinutes));
      return `${min}'`;
    case "basketball":
      const q = Math.min(4, Math.max(1, Math.floor(elapsedMinutes / 10) + 1));
      const remainingSecs = 600 - ((elapsedMinutes % 10) * 60);
      const remMin = Math.floor(remainingSecs / 60);
      const remSec = remainingSecs % 60;
      const secStr = remSec < 10 ? `0${remSec}` : remSec;
      return `Q${q} ${remMin}:${secStr}`;
    case "kabaddi":
      const half = elapsedMinutes < 20 ? "1st Half" : "2nd Half";
      const remainingTime = elapsedMinutes < 20 ? 20 - elapsedMinutes : 40 - elapsedMinutes;
      const kMin = Math.max(0, remainingTime);
      return `${half} • ${kMin}:00`;
    case "hockey":
      const quarter = Math.min(4, Math.max(1, Math.floor(elapsedMinutes / 15) + 1));
      const hMin = Math.max(0, 15 - (elapsedMinutes % 15));
      return `Q${quarter} • ${hMin}:00`;
    case "volleyball":
      return "Set 3";
    default:
      return "";
  }
}

function SchedulesPage() {
  const { data = [] } = useQuery({ 
    queryKey: ["matches"], 
    queryFn: mockApi.listMatches, 
    refetchInterval: 5000 
  });
  
  const [sport, setSport] = useState<Sport | "all">("all");
  const [status, setStatus] = useState<Match["status"] | "all">("all");
  const [search, setSearch] = useState("");

  const filtered = data.filter((m) => {
    const matchesSearch = 
      m.teamA.toLowerCase().includes(search.toLowerCase()) ||
      m.teamB.toLowerCase().includes(search.toLowerCase()) ||
      m.venue.toLowerCase().includes(search.toLowerCase());
    
    const matchesSport = sport === "all" || m.sport === sport;
    const matchesStatus = status === "all" || m.status === status;
    
    return matchesSearch && matchesSport && matchesStatus;
  });

  return (
    <div className="mx-auto max-w-7xl px-6 py-16">
      
      {/* Header section with small stats chips */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.6 }} 
        className="mb-10"
      >
        <div className="text-xs uppercase tracking-widest text-[color:var(--neon-blue)] font-bold">Fixtures</div>
        <h1 className="mt-2 text-4xl font-bold md:text-5xl tracking-tight">Schedule</h1>
        
        {/* Header Stats Chips */}
        <div className="mt-4 flex flex-wrap gap-2.5">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70">
            <span className="h-1.5 w-1.5 rounded-full bg-white/40" />
            {data.length} Matches Today
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-500/20 bg-rose-500/5 px-3 py-1 text-xs text-rose-400 font-medium">
            <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse" />
            {data.filter(m => m.status === "live").length} Live Now
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-500/20 bg-blue-500/5 px-3 py-1 text-xs text-blue-400 font-medium">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
            {data.filter(m => m.status === "upcoming").length} Upcoming
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/5 bg-white/5 px-3 py-1 text-xs text-white/40">
            <span className="h-1.5 w-1.5 rounded-full bg-white/20" />
            {data.filter(m => m.status === "completed").length} Completed
          </span>
        </div>
      </motion.div>

      {/* Filters and Search dashboard panel */}
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        transition={{ duration: 0.6, delay: 0.15 }} 
        className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
      >
        <div className="flex flex-wrap items-center gap-3">
          <FilterGroup label="Status" value={status} setValue={setStatus as any} options={[
            { v: "all", l: "All" }, { v: "live", l: "Live" }, { v: "upcoming", l: "Upcoming" }, { v: "completed", l: "Completed" },
          ]} />
          <FilterGroup label="Sport" value={sport} setValue={setSport as any} options={[
            { v: "all", l: "All" },
            ...Object.entries(SPORT_META).map(([k, m]) => ({ v: k, l: m.label })),
          ]} />
        </div>

        {/* Dynamic Search Box */}
        <div className="relative w-full md:w-72 group">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40 group-focus-within:text-[#6ea8ff] transition-colors duration-300" />
          <input
            type="text"
            placeholder="Search team, venue..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 rounded-full border border-white/10 bg-[#0d0e15]/40 py-2 pl-10 pr-4 text-xs text-white placeholder-white/40 outline-none transition-all duration-300 focus:border-[#6ea8ff] focus:bg-[#0d0e15]/80 focus:shadow-[0_0_12px_rgba(110,168,255,0.15)] focus:placeholder-transparent hover:border-white/20"
          />
        </div>
      </motion.div>

      {/* Matches Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((m, i) => {
          const meta = SPORT_META[m.sport];
          const progress = getMatchProgress(m);

          // Render cards based on status for natural visual weights
          const statusClasses = {
            live: "border border-rose-500/10 bg-[#16121e]/50 hover:bg-[#1d1627]/60 shadow-[0_10px_25px_rgba(0,0,0,0.4)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.55)] hover:border-rose-500/25",
            upcoming: "border border-blue-500/15 bg-[#121626]/50 hover:bg-[#181d30]/65 shadow-[0_10px_25px_rgba(0,0,0,0.4)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.55)] hover:border-blue-500/30",
            completed: "border border-white/5 bg-[#0a0b12]/60 opacity-60 hover:opacity-85 shadow-none hover:border-white/15 hover:bg-[#0f101a]/70 transition-opacity"
          }[m.status];

          return (
            <motion.div 
              key={m.id} 
              initial={{ opacity: 0, scale: 0.96, y: 15 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              transition={{ type: "spring", stiffness: 100, damping: 15, delay: i * 0.05 + 0.2 }}
              className={`group rounded-2xl p-6 transition-all duration-300 hover:-translate-y-2 cursor-default ${statusClasses}`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  {/* Glowing, scaling Sport Icon container */}
                  <div 
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/5 border border-white/10 transition-all duration-300 group-hover:scale-110"
                    style={{
                      boxShadow: `0 0 15px ${glowColors[m.sport] || "rgba(255,255,255,0.1)"}`,
                      borderColor: `${meta.color}40`
                    }}
                  >
                    <SportIcon sport={m.sport} className="h-5.5 w-5.5" />
                  </div>
                  <span className="font-semibold text-sm text-white/90">{meta.label}</span>
                </div>
                <StatusBadge status={m.status} progress={progress} />
              </div>

              {/* Score Typography & Teams display */}
              <div className="flex items-center justify-between text-base font-bold text-white/90">
                <span className="max-w-[42%] truncate">{m.teamA}</span>
                <span className="text-white/30 text-xs font-normal uppercase tracking-widest px-2">vs</span>
                <span className="max-w-[42%] truncate text-right">{m.teamB}</span>
              </div>

              {m.status !== "upcoming" ? (
                <div className="mt-4 flex items-center justify-between text-4xl md:text-5xl font-extrabold tracking-tight neon-text px-1">
                  <span>{m.scoreA}</span>
                  <span className="text-white/20 text-xl font-normal">–</span>
                  <span>{m.scoreB}</span>
                </div>
              ) : (
                <div className="mt-4 py-2 text-center text-xs text-white/30 tracking-wide font-medium border border-dashed border-white/5 rounded-xl bg-white/[0.01]">
                  Upcoming Fixture
                </div>
              )}

              {/* Info details with custom spacing */}
              <div className="mt-6 space-y-3 text-xs text-white/60 pt-4 border-t border-white/5">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-[#6ea8ff]/70" /> 
                  <span className="truncate">{m.venue}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-[#6ea8ff]/70" /> 
                  <span>{new Date(m.scheduledAt).toLocaleString()}</span>
                </div>
                {m.referee && (
                  <div className="flex items-center gap-2">
                    <CalendarDays className="h-4 w-4 text-[#6ea8ff]/70" /> 
                    <span>Referee: {m.referee}</span>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
        {!filtered.length && (
          <div className="col-span-full py-20 text-center text-white/40 border border-dashed border-white/10 rounded-3xl bg-black/10">
            No fixtures match this filter.
          </div>
        )}
      </div>

      {/* Empty space extensions (Statistics, Alerts, and Live Sport Activity) */}
      {filtered.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mt-20 border-t border-white/5 pt-16"
        >
          <h3 className="text-lg font-bold text-white/80 uppercase tracking-widest mb-8">Today's Activity & Insights</h3>
          <div className="grid gap-6 md:grid-cols-3">
            
            {/* Widget 1: Today's Statistics */}
            <div className="glass p-6 rounded-2xl bg-[#161b30]/35 border-l-4 border-l-[#6ea8ff] border-t border-r border-b border-white/5 flex flex-col justify-between hover:scale-[1.01] transition-transform duration-300">
              <div>
                <h4 className="text-sm font-bold text-white/90 flex items-center gap-2 mb-4">
                  <span>📊</span> Today's Statistics
                </h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-xs text-white/70 border-b border-white/5 pb-2">
                    <span className="flex items-center gap-1.5">🏟 Active Venues</span>
                    <span className="font-bold text-white">3</span>
                  </div>
                  <div className="flex justify-between items-center text-xs text-white/70 border-b border-white/5 pb-2">
                    <span className="flex items-center gap-1.5">🏏 Scheduled Matches</span>
                    <span className="font-bold text-white">{data.length}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs text-white/70 border-b border-white/5 pb-2">
                    <span className="flex items-center gap-1.5">👥 Registered Athletes</span>
                    <span className="font-bold text-white">1,248</span>
                  </div>
                  <div className="flex justify-between items-center text-xs text-white/70 pb-1">
                    <span className="flex items-center gap-1.5">🟢 Active Live Matches</span>
                    <span className="font-bold text-rose-400">{data.filter(m => m.status === "live").length}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Widget 2: Tournament Alerts */}
            <div className="glass p-6 rounded-2xl bg-[#161b30]/35 border-l-4 border-l-[#8b5cf6] border-t border-r border-b border-white/5 flex flex-col justify-between hover:scale-[1.01] transition-transform duration-300">
              <div>
                <h4 className="text-sm font-bold text-white/90 flex items-center gap-2 mb-4">
                  <span>🔔</span> Tournament Alerts
                </h4>
                <div className="space-y-4">
                  <div className="flex items-start gap-2.5 text-xs">
                    <div className="h-1.5 w-1.5 rounded-full bg-[#8b5cf6] mt-1.5 shrink-0 animate-pulse" />
                    <div>
                      <div className="font-semibold text-white/90">Roster Deadline</div>
                      <div className="text-white/50 text-[10px] mt-0.5">Today • 5:00 PM</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5 text-xs">
                    <div className="h-1.5 w-1.5 rounded-full bg-[#8b5cf6] mt-1.5 shrink-0" />
                    <div>
                      <div className="font-semibold text-white/90">Officials Assigned</div>
                      <div className="text-white/50 text-[10px] mt-0.5">6/6 Referees Approved</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5 text-xs">
                    <div className="h-1.5 w-1.5 rounded-full bg-[#8b5cf6] mt-1.5 shrink-0" />
                    <div>
                      <div className="font-semibold text-white/90">Next Match Scheduled</div>
                      <div className="text-white/50 text-[10px] mt-0.5">Basketball • 1:30 PM</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Widget 3: Live Sports Activity breakdown */}
            <div className="glass p-6 rounded-2xl bg-[#161b30]/35 border-l-4 border-l-[#35e6a4] border-t border-r border-b border-white/5 flex flex-col justify-between hover:scale-[1.01] transition-transform duration-300">
              <div>
                <h4 className="text-sm font-bold text-white/90 flex items-center gap-2 mb-4">
                  <span>🔥</span> Live Activity Summary
                </h4>
                <div className="space-y-3.5">
                  <div className="flex items-center justify-between text-xs text-white/70 border-b border-white/5 pb-2">
                    <span className="flex items-center gap-1.5">🏏 Cricket</span>
                    <span className="text-[10px] bg-blue-500/10 border border-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full font-bold">3 Matches</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-white/70 border-b border-white/5 pb-2">
                    <span className="flex items-center gap-1.5">⚽ Football</span>
                    <span className="text-[10px] bg-rose-500/10 border border-rose-500/20 text-rose-400 px-2 py-0.5 rounded-full font-bold animate-pulse">1 Active</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-white/70 pb-1">
                    <span className="flex items-center gap-1.5">🏀 Basketball</span>
                    <span className="text-[10px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full font-bold">Final Quarter</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </motion.div>
      )}

    </div>
  );
}

function FilterGroup({ label, value, setValue, options }: { label: string; value: string; setValue: (v: string) => void; options: { v: string; l: string }[] }) {
  return (
    <div className="glass flex items-center gap-1 rounded-full p-1 relative border border-white/5 bg-[#121320]/45">
      <span className="px-3 text-[10px] uppercase tracking-widest text-white/40 font-bold">{label}</span>
      <div className="flex items-center gap-0.5">
        {options.map((o) => (
          <button 
            key={o.v} 
            type="button"
            onClick={() => setValue(o.v)}
            className="relative px-3.5 py-1.5 text-xs font-semibold transition-colors duration-300 rounded-full outline-none cursor-pointer"
          >
            {value === o.v && (
              <motion.div
                layoutId={`active-${label}`}
                className="absolute inset-0 rounded-full bg-gradient-to-r from-[#6ea8ff]/25 to-[#8b5cf6]/25 border border-[#6ea8ff]/35 shadow-[0_0_15px_rgba(110,168,255,0.15)]"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
            <span className={`relative z-10 transition-colors duration-300 ${value === o.v ? "text-white" : "text-white/50 hover:text-white"}`}>
              {o.l}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

export function StatusBadge({ status, progress }: { status: Match["status"]; progress?: string }) {
  const map = {
    live: "border-rose-500/40 bg-rose-500/10 text-rose-400 shadow-[0_0_12px_rgba(244,63,94,0.15)]",
    upcoming: "border-blue-500/40 bg-blue-500/10 text-blue-400",
    completed: "border-white/10 bg-white/5 text-white/40",
  } as const;
  
  const dots = {
    live: "bg-rose-500 shadow-[0_0_8px_#f43f5e] animate-ping",
    upcoming: "bg-blue-400",
    completed: "bg-white/40",
  } as const;

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-wider transition-all duration-300 ${map[status]}`}>
      <span className="relative flex h-1.5 w-1.5">
        {status === "live" && (
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
        )}
        <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${dots[status]}`} />
      </span>
      {status === "live" ? (progress ? `LIVE • ${progress}` : "LIVE") : status}
    </span>
  );
}