import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { motion } from "framer-motion";
import { mockApi, SPORT_META, type Match, type Sport } from "@/lib/mockApi";
import { CalendarDays, MapPin, Clock } from "lucide-react";

export const Route = createFileRoute("/schedules")({ component: SchedulesPage });

function SchedulesPage() {
  const { data = [] } = useQuery({ queryKey: ["matches"], queryFn: mockApi.listMatches, refetchInterval: 5000 });
  const [sport, setSport] = useState<Sport | "all">("all");
  const [status, setStatus] = useState<Match["status"] | "all">("all");
  const filtered = data.filter((m) => (sport === "all" || m.sport === sport) && (status === "all" || m.status === status));

  return (
    <div className="mx-auto max-w-7xl px-6 py-16">
      <div className="mb-10">
        <div className="text-xs uppercase tracking-widest text-[color:var(--neon-blue)]">Fixtures</div>
        <h1 className="mt-2 text-4xl font-bold md:text-5xl">Schedule</h1>
      </div>

      <div className="mb-8 flex flex-wrap items-center gap-3">
        <FilterGroup label="Status" value={status} setValue={setStatus as any} options={[
          { v: "all", l: "All" }, { v: "live", l: "Live" }, { v: "upcoming", l: "Upcoming" }, { v: "completed", l: "Completed" },
        ]} />
        <FilterGroup label="Sport" value={sport} setValue={setSport as any} options={[
          { v: "all", l: "All" },
          ...Object.entries(SPORT_META).map(([k, m]) => ({ v: k, l: m.label })),
        ]} />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((m, i) => {
          const meta = SPORT_META[m.sport];
          return (
            <motion.div key={m.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
              className="glass glass-hover rounded-2xl p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-lg">{meta.emoji}</span>
                  <span className="font-medium">{meta.label}</span>
                </div>
                <StatusBadge status={m.status} />
              </div>
              <div className="mt-4 flex items-center justify-between text-lg font-semibold">
                <span>{m.teamA}</span>
                <span className="text-white/40">vs</span>
                <span className="text-right">{m.teamB}</span>
              </div>
              {m.status !== "upcoming" && (
                <div className="mt-3 flex items-center justify-between text-3xl font-bold neon-text">
                  <span>{m.scoreA}</span>
                  <span className="text-white/30 text-lg">–</span>
                  <span>{m.scoreB}</span>
                </div>
              )}
              <div className="mt-4 space-y-1.5 text-xs text-white/60">
                <div className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" /> {m.venue}</div>
                <div className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" /> {new Date(m.scheduledAt).toLocaleString()}</div>
                {m.referee && <div className="flex items-center gap-1.5"><CalendarDays className="h-3.5 w-3.5" /> Ref: {m.referee}</div>}
              </div>
            </motion.div>
          );
        })}
        {!filtered.length && <div className="col-span-full py-16 text-center text-white/50">No fixtures match this filter.</div>}
      </div>
    </div>
  );
}

function FilterGroup({ label, value, setValue, options }: { label: string; value: string; setValue: (v: string) => void; options: { v: string; l: string }[] }) {
  return (
    <div className="glass flex items-center gap-1 rounded-full p-1">
      <span className="px-3 text-xs uppercase tracking-widest text-white/40">{label}</span>
      {options.map((o) => (
        <button key={o.v} onClick={() => setValue(o.v)}
          className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${value === o.v ? "bg-gradient-to-r from-[#6ea8ff]/40 to-[#8b5cf6]/30 text-white shadow-[0_0_16px_rgba(110,168,255,0.3)]" : "text-white/60 hover:text-white"}`}>
          {o.l}
        </button>
      ))}
    </div>
  );
}

export function StatusBadge({ status }: { status: Match["status"] }) {
  const map = {
    live: "border-[color:var(--neon-rose)]/50 bg-[color:var(--neon-rose)]/10 text-[color:var(--neon-rose)]",
    upcoming: "border-[color:var(--neon-blue)]/50 bg-[color:var(--neon-blue)]/10 text-[color:var(--neon-blue)]",
    completed: "border-white/20 bg-white/5 text-white/60",
  } as const;
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-widest ${map[status]}`}>
      {status === "live" && <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-current" />}
      {status}
    </span>
  );
}