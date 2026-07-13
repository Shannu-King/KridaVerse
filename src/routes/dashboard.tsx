import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import useEmblaCarousel from "embla-carousel-react";
import { mockApi, SPORT_META, type Match } from "@/lib/mockApi";
import { ChevronLeft, ChevronRight, MapPin, Radio, ArrowLeft, X } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, PieChart, Pie, Cell, Legend } from "recharts";
import { StatusBadge } from "./schedules";

export const Route = createFileRoute("/dashboard")({ component: Dashboard });

function Dashboard() {
  const { data = [] } = useQuery({ queryKey: ["live"], queryFn: mockApi.liveScores, refetchInterval: 5000 });
  const [emblaRef, embla] = useEmblaCarousel({ loop: false });
  const [openMatch, setOpenMatch] = useState<Match | null>(null);

  return (
    <div className="min-h-screen">
      {/* Top bar for dashboard (no global header) */}
      <div className="sticky top-0 z-30 border-b border-white/5 bg-[#0d0e15]/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-white">
            <ArrowLeft className="h-4 w-4" /> Home
          </Link>
          <div className="flex items-center gap-2 text-sm">
            <Radio className="h-4 w-4 text-[color:var(--neon-emerald)] animate-pulse" />
            <span className="font-medium">Live Command Center</span>
          </div>
          <div className="text-xs text-white/40">Auto-refresh · 5s</div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h1 className="text-4xl font-bold">Live Matches</h1>
            <p className="mt-1 text-sm text-white/60">{data.length} match{data.length !== 1 ? "es" : ""} in progress</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => embla?.scrollPrev()} className="glass rounded-xl p-2 hover:bg-white/10"><ChevronLeft className="h-5 w-5" /></button>
            <button onClick={() => embla?.scrollNext()} className="glass rounded-xl p-2 hover:bg-white/10"><ChevronRight className="h-5 w-5" /></button>
          </div>
        </div>

        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex gap-6">
            {data.map((m) => (
              <div key={m.id} className="min-w-0 flex-[0_0_100%] md:flex-[0_0_60%] lg:flex-[0_0_48%]">
                <MatchCard match={m} onOpen={() => setOpenMatch(m)} />
              </div>
            ))}
            {!data.length && <div className="w-full py-20 text-center text-white/50">No live matches right now.</div>}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {openMatch && <SummaryDrawer match={openMatch} onClose={() => setOpenMatch(null)} />}
      </AnimatePresence>
    </div>
  );
}

function MatchCard({ match, onOpen }: { match: Match; onOpen: () => void }) {
  const meta = SPORT_META[match.sport];
  const barData = [
    { name: match.teamA, score: match.scoreA },
    { name: match.teamB, score: match.scoreB },
  ];
  const stats = match.stats || {};
  const donutData = buildDonut(match);

  return (
    <motion.div layout className="glass neon-border rounded-3xl p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{meta.emoji}</span>
          <div>
            <div className="text-sm font-semibold">{meta.label}</div>
            <div className="flex items-center gap-1.5 text-xs text-white/50"><MapPin className="h-3 w-3" /> {match.venue}</div>
          </div>
        </div>
        <StatusBadge status={match.status} />
      </div>

      <div className="mt-6 grid grid-cols-2 items-center gap-4 text-center">
        <div>
          <div className="text-xs uppercase tracking-widest text-white/50">{match.teamA}</div>
          <div className="mt-1 text-5xl font-bold neon-text">{match.scoreA}</div>
        </div>
        <div>
          <div className="text-xs uppercase tracking-widest text-white/50">{match.teamB}</div>
          <div className="mt-1 text-5xl font-bold neon-text">{match.scoreB}</div>
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl bg-white/5 p-4">
          <div className="mb-2 text-xs uppercase tracking-widest text-white/50">Score Comparison</div>
          <div style={{ width: "100%", height: 160 }}>
            <ResponsiveContainer>
              <BarChart data={barData}>
                <XAxis dataKey="name" stroke="#ffffff60" fontSize={11} />
                <YAxis stroke="#ffffff40" fontSize={11} />
                <Tooltip contentStyle={{ background: "#121320", border: "1px solid #ffffff20", borderRadius: 8 }} />
                <Bar dataKey="score" radius={[8, 8, 0, 0]}>
                  <Cell fill="#6ea8ff" />
                  <Cell fill="#8b5cf6" />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="rounded-2xl bg-white/5 p-4">
          <div className="mb-2 text-xs uppercase tracking-widest text-white/50">{donutData.title}</div>
          <div style={{ width: "100%", height: 160 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie data={donutData.data} innerRadius={38} outerRadius={60} dataKey="value" paddingAngle={4}>
                  {donutData.data.map((_, i) => <Cell key={i} fill={donutData.colors[i]} />)}
                </Pie>
                <Legend iconSize={8} wrapperStyle={{ fontSize: 11, color: "#ffffff90" }} />
                <Tooltip contentStyle={{ background: "#121320", border: "1px solid #ffffff20", borderRadius: 8 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {Object.keys(stats).length > 0 && (
        <div className="mt-4 grid grid-cols-4 gap-2">
          {Object.entries(stats).slice(0, 4).map(([k, v]) => (
            <div key={k} className="rounded-xl bg-white/5 px-3 py-2 text-center">
              <div className="text-[10px] uppercase tracking-widest text-white/50">{k}</div>
              <div className="text-lg font-bold">{v}</div>
            </div>
          ))}
        </div>
      )}

      <button onClick={onOpen} className="btn-neon mt-5 w-full rounded-xl py-2.5 text-sm font-semibold">
        Open Match Summary
      </button>
    </motion.div>
  );
}

function buildDonut(m: Match): { title: string; data: { name: string; value: number }[]; colors: string[] } {
  const s = m.stats || {};
  if (m.sport === "cricket") return {
    title: "Wicket Split",
    data: [{ name: `${m.teamA} wkts`, value: s.wicketsA ?? 3 }, { name: `${m.teamB} wkts`, value: s.wicketsB ?? 5 }],
    colors: ["#6ea8ff", "#8b5cf6"],
  };
  if (m.sport === "football") return {
    title: "Possession %",
    data: [{ name: m.teamA, value: s.possessionA ?? 50 }, { name: m.teamB, value: s.possessionB ?? 50 }],
    colors: ["#35e6a4", "#ff8a4c"],
  };
  if (m.sport === "basketball") return {
    title: "Fouls",
    data: [{ name: m.teamA, value: s.foulsA ?? 5 }, { name: m.teamB, value: s.foulsB ?? 7 }],
    colors: ["#f5c451", "#c084fc"],
  };
  return {
    title: "Score Share",
    data: [{ name: m.teamA, value: Math.max(m.scoreA, 1) }, { name: m.teamB, value: Math.max(m.scoreB, 1) }],
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
        <div className="sticky top-0 flex items-center justify-between border-b border-white/10 bg-[#0d0e15]/90 p-5 backdrop-blur-xl">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{meta.emoji}</span>
            <div>
              <div className="font-semibold">Match Summary</div>
              <div className="text-xs text-white/50">{meta.label}</div>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-2 text-white/60 hover:bg-white/5"><X className="h-5 w-5" /></button>
        </div>
        <div className="space-y-5 p-6">
          <div className="glass rounded-2xl p-4">
            <div className="flex items-center justify-between">
              <span className="font-semibold">{match.teamA}</span>
              <span className="text-2xl font-bold neon-text">{match.scoreA} - {match.scoreB}</span>
              <span className="font-semibold">{match.teamB}</span>
            </div>
          </div>
          <div className="glass rounded-2xl p-4">
            <div className="mb-2 text-xs uppercase tracking-widest text-white/50">Venue</div>
            <div>{match.venue}</div>
            <div className="mt-3 text-xs uppercase tracking-widest text-white/50">Referee</div>
            <div>{match.referee || "TBD"}</div>
          </div>
          <div className="glass rounded-2xl p-4">
            <div className="mb-3 text-xs uppercase tracking-widest text-white/50">Referee log</div>
            <ul className="space-y-2 text-sm">
              {match.log.length ? match.log.map((l, i) => (
                <li key={i} className="flex items-start gap-2 border-l-2 border-[color:var(--neon-blue)] pl-3">
                  <span className="text-xs text-white/40">{new Date(l.t).toLocaleTimeString()}</span>
                  <span>{l.text}</span>
                </li>
              )) : <li className="text-white/40">No events yet.</li>}
            </ul>
          </div>
        </div>
      </motion.div>
    </>
  );
}