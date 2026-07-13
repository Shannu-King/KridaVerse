import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import useEmblaCarousel from "embla-carousel-react";
import { mockApi, SPORT_META, type Match } from "@/lib/mockApi";
import { SportIcon } from "@/components/SportIcon";
import { ChevronLeft, ChevronRight, MapPin, Radio, ArrowLeft, X, RefreshCw, Clock } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, PieChart, Pie, Cell, Legend } from "recharts";

export const Route = createFileRoute("/dashboard")({ component: Dashboard });

function AnimatedScore({ value }: { value: number }) {
  const [prev, setPrev] = useState(value);
  const [key, setKey] = useState(0);

  useEffect(() => {
    if (value !== prev) {
      setPrev(value);
      setKey((k) => k + 1);
    }
  }, [value, prev]);

  return (
    <motion.span
      key={key}
      initial={{ scale: 0.8, opacity: 0.8 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 350, damping: 10 }}
      className="inline-block text-5xl font-extrabold tracking-tight neon-text"
    >
      {value}
    </motion.span>
  );
}

function formatStatKey(key: string, teamA: string, teamB: string) {
  const isA = key.endsWith("A");
  const isB = key.endsWith("B");
  const base = key.replace(/[AB]$/, "");
  
  const labels: Record<string, string> = {
    wickets: "Wickets",
    possession: "Possession",
    shots: "Shots",
    fouls: "Fouls",
    assists: "Assists",
    overs: "Overs"
  };
  const label = labels[base] || base;
  
  if (isA) return `${teamA.split(" ")[0]} ${label}`;
  if (isB) return `${teamB.split(" ")[0]} ${label}`;
  return label;
}

function Dashboard() {
  const { data = [] } = useQuery({ 
    queryKey: ["live"], 
    queryFn: mockApi.liveScores, 
    refetchInterval: 5000 
  });
  
  const [emblaRef, embla] = useEmblaCarousel({ loop: false });
  const [openMatch, setOpenMatch] = useState<Match | null>(null);

  // Active Carousel Slide tracking
  const [activeSlide, setActiveSlide] = useState(0);
  useEffect(() => {
    if (!embla) return;
    const onSelect = () => {
      setActiveSlide(embla.selectedScrollSnap());
    };
    embla.on("select", onSelect);
    onSelect();
  }, [embla, data]);

  // Countdown & Last Updated Trackers
  const [countdown, setCountdown] = useState(5);
  const [updatedText, setUpdatedText] = useState("");
  const [lastUpdated, setLastUpdated] = useState("");

  useEffect(() => {
    setLastUpdated(new Date().toLocaleTimeString());
  }, [data]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          setUpdatedText("Updated Just Now ✓");
          setTimeout(() => setUpdatedText(""), 1500);
          return 5;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Recharts 30s re-draw transition trigger keys
  const [chartKey, setChartKey] = useState(0);
  useEffect(() => {
    const chartTimer = setInterval(() => {
      setChartKey((k) => k + 1);
    }, 30000);
    return () => clearInterval(chartTimer);
  }, []);

  // Aggregate live logs across all active matches
  const allLogs = data.flatMap((m) => 
    m.log.map((l) => ({
      ...l,
      sport: m.sport,
      teamA: m.teamA,
      teamB: m.teamB,
      matchId: m.id
    }))
  ).sort((a, b) => b.t - a.t);

  // Live Activity carousel flash ticker index
  const [activeLogIdx, setActiveLogIdx] = useState(0);
  useEffect(() => {
    if (allLogs.length === 0) return;
    const alertTimer = setInterval(() => {
      setActiveLogIdx((idx) => (idx + 1) % allLogs.length);
    }, 5000);
    return () => clearInterval(alertTimer);
  }, [allLogs.length]);

  return (
    <div className="min-h-screen">
      
      {/* Top dashboard control panel bar */}
      <div className="sticky top-0 z-30 border-b border-white/5 bg-[#0d0e15]/75 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-white transition duration-300">
            <ArrowLeft className="h-4 w-4" /> Home
          </Link>
          <div className="flex items-center gap-2 text-sm">
            <Radio className="h-4 w-4 text-[color:var(--neon-emerald)] animate-pulse" />
            <span className="font-semibold tracking-wide">Live Command Center</span>
          </div>
          
          {/* Active Auto countdown and timestamp */}
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5 text-white/65">
              <RefreshCw className="h-3 w-3 animate-spin" style={{ animationDuration: "3s" }} />
              {updatedText ? (
                <span className="text-[#35e6a4] font-semibold">{updatedText}</span>
              ) : (
                <span>Refreshing in {countdown}s</span>
              )}
            </div>
            <div className="hidden md:flex items-center gap-1.5 text-white/40">
              <Clock className="h-3 w-3" />
              <span>Updated {lastUpdated}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-10">

        {/* Live Alert flashing ticker banner */}
        <AnimatePresence mode="wait">
          {allLogs.length > 0 && (
            <motion.div
              key={activeLogIdx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="flex items-center justify-center gap-2 text-xs font-bold text-rose-400 bg-rose-500/5 border border-rose-500/10 rounded-full py-2 px-4 max-w-lg mx-auto mb-8 shadow-[0_0_15px_rgba(244,63,94,0.05)]"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500" />
              </span>
              <span className="uppercase tracking-widest text-[9px] text-white/30 font-extrabold">LIVE ACTIVITY:</span>
              <span className="text-white/90">{allLogs[activeLogIdx]?.text}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mb-8 flex items-end justify-between">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight">Live Matches</h1>
            <p className="mt-1 text-sm text-white/60">{data.length} match{data.length !== 1 ? "es" : ""} in progress</p>
          </div>
          
          {/* Navigation Controls with Active Match indicators */}
          {data.length > 0 && (
            <div className="flex items-center gap-3">
              <button 
                onClick={() => embla?.scrollPrev()} 
                className="glass rounded-xl p-2 hover:bg-white/10 cursor-pointer transition-colors duration-300"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <span className="text-xs font-bold text-white/40 tracking-widest uppercase">
                Match {activeSlide + 1} of {data.length}
              </span>
              <button 
                onClick={() => embla?.scrollNext()} 
                className="glass rounded-xl p-2 hover:bg-white/10 cursor-pointer transition-colors duration-300"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          )}
        </div>

        {/* Matches Carousel Grid */}
        <div className="overflow-hidden p-2" ref={emblaRef}>
          <div className="flex gap-6 items-center">
            {data.map((m, idx) => {
              const isActive = activeSlide === idx;
              return (
                <div 
                  key={m.id} 
                  className="min-w-0 flex-[0_0_100%] md:flex-[0_0_60%] lg:flex-[0_0_48%] transition-all duration-500 ease-out"
                  style={{
                    opacity: isActive ? 1 : 0.65,
                    transform: isActive ? "scale(1.02)" : "scale(0.97)"
                  }}
                >
                  <MatchCard 
                    match={m} 
                    onOpen={() => setOpenMatch(m)} 
                    isActive={isActive} 
                    chartKey={chartKey}
                  />
                </div>
              );
            })}
            {!data.length && (
              <div className="w-full py-24 text-center text-white/40 border border-dashed border-white/10 rounded-3xl bg-black/10">
                No live matches right now. Check schedules for upcoming fixtures.
              </div>
            )}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {openMatch && <SummaryDrawer match={openMatch} onClose={() => setOpenMatch(null)} />}
      </AnimatePresence>
    </div>
  );
}

function MatchCard({ match, onOpen, isActive, chartKey }: { match: Match; onOpen: () => void; isActive: boolean; chartKey: number }) {
  const meta = SPORT_META[match.sport];
  const barData = [
    { name: match.teamA.split(" ")[0], score: match.scoreA },
    { name: match.teamB.split(" ")[0], score: match.scoreB },
  ];
  const stats = match.stats || {};
  const donutData = buildDonut(match);

  // Active status color border configurations
  const borderClass = isActive 
    ? "border-rose-500/25 shadow-[0_30px_60px_rgba(0,0,0,0.65),_0_0_30px_rgba(244,63,94,0.1)] bg-[#1a1426]/75" 
    : "border-white/10 bg-[#121422]/50";

  return (
    <motion.div 
      layout 
      className={`glass rounded-3xl p-6 transition-all duration-500 border ${borderClass}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/5 border border-white/10 shadow-[0_0_12px_rgba(255,255,255,0.05)]">
            <SportIcon sport={match.sport} className="h-6 w-6" />
          </div>
          <div>
            <div className="text-sm font-bold text-white/90">{meta.label}</div>
            <div className="flex items-center gap-1 text-xs text-white/50"><MapPin className="h-3.5 w-3.5 text-[#6ea8ff]/70" /> {match.venue}</div>
          </div>
        </div>
        
        {/* Custom LIVE Badge */}
        <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-500/40 bg-rose-500/10 px-3 py-1 text-[10px] font-extrabold uppercase tracking-widest text-rose-400 shadow-[0_0_12px_rgba(244,63,94,0.15)]">
          <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse" />
          LIVE
        </span>
      </div>

      {/* Spring Animated Score Dashboard Row */}
      <div className="mt-8 grid grid-cols-2 items-center gap-4 text-center border-b border-white/5 pb-6">
        <div>
          {/* Glass team badge logo color square */}
          <div className="flex items-center justify-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-white/50 mb-1">
            <span className="inline-block w-2.5 h-2.5 rounded-sm bg-[#6ea8ff] shadow-[0_0_6px_#6ea8ff] shrink-0" />
            <span className="truncate max-w-[120px]">{match.teamA}</span>
          </div>
          <AnimatedScore value={match.scoreA} />
        </div>
        <div>
          <div className="flex items-center justify-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-white/50 mb-1">
            <span className="inline-block w-2.5 h-2.5 rounded-sm bg-[#8b5cf6] shadow-[0_0_6px_#8b5cf6] shrink-0" />
            <span className="truncate max-w-[120px]">{match.teamB}</span>
          </div>
          <AnimatedScore value={match.scoreB} />
        </div>
      </div>

      {/* Comparisons charts */}
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        
        {/* Bar Chart comparisons */}
        <div className="rounded-2xl bg-white/[0.02] border border-white/5 p-4">
          <div className="mb-3 text-[10px] uppercase tracking-wider font-bold text-white/40">Score Comparison</div>
          <div style={{ width: "100%", height: 150 }}>
            <ResponsiveContainer>
              <BarChart key={`bar-${chartKey}`} data={barData}>
                <XAxis dataKey="name" stroke="#ffffff40" fontSize={10} tickLine={false} />
                <YAxis stroke="#ffffff30" fontSize={10} tickLine={false} />
                <Tooltip contentStyle={{ background: "#121320", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, fontSize: 11 }} />
                <Bar dataKey="score" radius={[6, 6, 0, 0]} isAnimationActive={true} animationDuration={1000}>
                  <Cell fill="#6ea8ff" />
                  <Cell fill="#8b5cf6" />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart donut share */}
        <div className="rounded-2xl bg-white/[0.02] border border-white/5 p-4">
          <div className="mb-3 text-[10px] uppercase tracking-wider font-bold text-white/40">{donutData.title}</div>
          <div style={{ width: "100%", height: 150 }}>
            <ResponsiveContainer>
              <PieChart key={`pie-${chartKey}`}>
                <Pie data={donutData.data} innerRadius={35} outerRadius={50} dataKey="value" paddingAngle={4} isAnimationActive={true} animationDuration={1000}>
                  {donutData.data.map((_, i) => <Cell key={i} fill={donutData.colors[i]} />)}
                </Pie>
                <Legend iconSize={6} wrapperStyle={{ fontSize: 10, color: "rgba(255,255,255,0.6)" }} />
                <Tooltip contentStyle={{ background: "#121320", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Format stat keys labels cards */}
      {Object.keys(stats).length > 0 && (
        <div className="mt-4 grid grid-cols-4 gap-2">
          {Object.entries(stats).slice(0, 4).map(([k, v]) => (
            <div key={k} className="rounded-xl bg-white/5 border border-white/5 px-2.5 py-2 text-center">
              <div className="text-[9px] uppercase tracking-widest text-white/40 truncate font-semibold">
                {formatStatKey(k, match.teamA, match.teamB)}
              </div>
              <div className="text-base font-extrabold text-white/90 mt-0.5">{v}</div>
            </div>
          ))}
        </div>
      )}

      {/* Open Dashboard button */}
      <button 
        onClick={onOpen} 
        className="btn-neon mt-5 w-full rounded-xl py-3 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1 cursor-pointer transition-all duration-300"
      >
        <span>Open Live Dashboard</span>
        <span>→</span>
      </button>
    </motion.div>
  );
}

function buildDonut(m: Match): { title: string; data: { name: string; value: number }[]; colors: string[] } {
  const s = m.stats || {};
  if (m.sport === "cricket") return {
    title: "Wickets Breakdown",
    data: [{ name: `${m.teamA.split(" ")[0]} wkts`, value: s.wicketsA ?? 3 }, { name: `${m.teamB.split(" ")[0]} wkts`, value: s.wicketsB ?? 5 }],
    colors: ["#6ea8ff", "#8b5cf6"],
  };
  if (m.sport === "football") return {
    title: "Possession Share",
    data: [{ name: m.teamA.split(" ")[0], value: s.possessionA ?? 50 }, { name: m.teamB.split(" ")[0], value: s.possessionB ?? 50 }],
    colors: ["#35e6a4", "#ff8a4c"],
  };
  if (m.sport === "basketball") return {
    title: "Team Fouls",
    data: [{ name: m.teamA.split(" ")[0], value: s.foulsA ?? 5 }, { name: m.teamB.split(" ")[0], value: s.foulsB ?? 7 }],
    colors: ["#f5c451", "#c084fc"],
  };
  return {
    title: "Score Share",
    data: [{ name: m.teamA.split(" ")[0], value: Math.max(m.scoreA, 1) }, { name: m.teamB.split(" ")[0], value: Math.max(m.scoreB, 1) }],
    colors: ["#6ea8ff", "#8b5cf6"],
  };
}

function SummaryDrawer({ match, onClose }: { match: Match; onClose: () => void }) {
  const meta = SPORT_META[match.sport];
  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose} className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm" />
      <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 25 }}
        className="fixed right-0 top-0 z-50 h-full w-full max-w-md overflow-y-auto border-l border-white/10 bg-[#0d0e15]/95 backdrop-blur-2xl">
        
        {/* Drawer header */}
        <div className="sticky top-0 flex items-center justify-between border-b border-white/10 bg-[#0d0e15]/90 p-5 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 border border-white/10 shadow-[0_0_12px_rgba(255,255,255,0.05)]">
              <SportIcon sport={match.sport} className="h-6 w-6" />
            </div>
            <div>
              <div className="font-extrabold text-white tracking-tight">Match Summary</div>
              <div className="text-[10px] text-white/50 uppercase tracking-wider font-semibold">{meta.label} Live Feed</div>
            </div>
          </div>
          <button onClick={onClose} className="rounded-full border border-white/10 bg-white/5 p-2 text-white/60 hover:text-white hover:border-white/20 transition-all cursor-pointer"><X className="h-4.5 w-4.5" /></button>
        </div>

        {/* Drawer content details */}
        <div className="space-y-5 p-6">
          <div className="glass border border-white/10 rounded-2xl p-5 bg-white/[0.01]">
            <div className="flex items-center justify-between font-bold text-sm text-white/90">
              <span className="truncate max-w-[40%]">{match.teamA}</span>
              <span className="text-xl font-extrabold tracking-tight text-white px-2 neon-text">{match.scoreA} - {match.scoreB}</span>
              <span className="truncate max-w-[40%] text-right">{match.teamB}</span>
            </div>
          </div>
          
          <div className="glass border border-white/10 rounded-2xl p-5 bg-white/[0.01] space-y-3.5 text-xs text-white/60">
            <div>
              <div className="mb-1 text-[10px] uppercase tracking-wider font-semibold text-white/40">Venue</div>
              <div className="font-medium text-white/95 flex items-center gap-1.5"><MapPin className="h-4 w-4 text-[#6ea8ff]/70" /> {match.venue}</div>
            </div>
            <div>
              <div className="mb-1 text-[10px] uppercase tracking-wider font-semibold text-white/40">Referee assigned</div>
              <div className="font-medium text-white/95">{match.referee || "TBD"}</div>
            </div>
          </div>

          <div className="glass border border-white/10 rounded-2xl p-5 bg-white/[0.01]">
            <div className="mb-4 text-[10px] uppercase tracking-wider font-bold text-white/40 border-b border-white/5 pb-2">Referee Event Log</div>
            <ul className="space-y-3 text-xs leading-relaxed">
              {match.log.length ? match.log.map((l, i) => (
                <li key={i} className="flex items-start gap-3 pl-3 relative border-l border-[#8b5cf6]/50">
                  <div className="absolute top-1 -left-[4.5px] h-2 w-2 rounded-full bg-[#8b5cf6] shadow-[0_0_8px_#8b5cf6]" />
                  <span className="text-[10px] font-bold text-white/30 shrink-0">{new Date(l.t).toLocaleTimeString()}</span>
                  <span className="text-white/80">{l.text}</span>
                </li>
              )) : <li className="text-white/30 text-center py-4">No events logged yet.</li>}
            </ul>
          </div>
        </div>

      </motion.div>
    </>
  );
}