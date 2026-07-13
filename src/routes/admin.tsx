import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { motion } from "framer-motion";
import { mockApi, SPORT_META, type Match, type Sport } from "@/lib/mockApi";
import { useApp } from "@/lib/store";
import { toast } from "sonner";
import { ArrowLeft, ShieldCheck, Plus, Trash2, Minus, Megaphone, X } from "lucide-react";
import { StatusBadge } from "./schedules";

export const Route = createFileRoute("/admin")({ component: AdminPage });

function AdminPage() {
  const { user, broadcasts, pushBroadcast, removeBroadcast } = useApp();
  const qc = useQueryClient();
  const { data = [] } = useQuery({ queryKey: ["matches"], queryFn: mockApi.listMatches, refetchInterval: 3000 });

  const update = useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<Match> }) => mockApi.updateMatch(id, patch),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["matches"] }),
  });
  const del = useMutation({
    mutationFn: (id: string) => mockApi.deleteMatch(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["matches"] }); toast.success("Fixture deleted"); },
  });
  const add = useMutation({
    mutationFn: (m: Omit<Match, "id" | "log">) => mockApi.addMatch(m),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["matches"] }); toast.success("Fixture added"); },
  });

  const [msg, setMsg] = useState("");
  const [showNew, setShowNew] = useState(false);

  if (!user?.isAdmin) {
    return (
      <div className="mx-auto max-w-md px-6 py-24 text-center">
        <ShieldCheck className="mx-auto h-12 w-12 text-[color:var(--neon-purple)]" />
        <h1 className="mt-4 text-2xl font-bold">Admin Access Required</h1>
        <p className="mt-2 text-white/60">Sign in with an admin account (email containing "admin") to open the command center.</p>
        <Link to="/auth" className="btn-neon mt-6 inline-block rounded-xl px-6 py-3 font-semibold">Sign in</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="sticky top-0 z-30 border-b border-white/5 bg-[#0d0e15]/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-white"><ArrowLeft className="h-4 w-4" /> Home</Link>
          <div className="flex items-center gap-2 text-sm"><ShieldCheck className="h-4 w-4 text-[color:var(--neon-purple)]" /><span className="font-medium">Admin Command Center</span></div>
          <div className="text-xs text-white/40">{user.username}</div>
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl gap-6 px-6 py-10 lg:grid-cols-3">
        {/* Broadcast */}
        <div className="glass rounded-2xl p-5 lg:col-span-1">
          <div className="mb-4 flex items-center gap-2"><Megaphone className="h-5 w-5 text-[color:var(--neon-purple)]" /><h2 className="font-semibold">Broadcast</h2></div>
          <textarea value={msg} onChange={(e) => setMsg(e.target.value)} placeholder="Announcement to all viewers…" rows={3}
            className="w-full rounded-xl border border-white/10 bg-white/5 p-3 text-sm outline-none focus:border-[color:var(--neon-blue)]" />
          <button onClick={() => { if (msg.trim()) { pushBroadcast(msg.trim()); setMsg(""); toast.success("Broadcast sent"); } }}
            className="btn-neon mt-3 w-full rounded-xl py-2.5 text-sm font-semibold">Send Broadcast</button>
          <div className="mt-5 space-y-2">
            {broadcasts.map((b) => (
              <div key={b.id} className="flex items-start justify-between gap-2 rounded-lg border border-white/10 bg-white/5 p-3 text-sm">
                <span>{b.message}</span>
                <button onClick={() => removeBroadcast(b.id)} className="text-white/40 hover:text-red-400"><X className="h-4 w-4" /></button>
              </div>
            ))}
            {!broadcasts.length && <div className="text-xs text-white/40">No active broadcasts.</div>}
          </div>
        </div>

        {/* Fixtures */}
        <div className="lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold">Fixtures & Scores</h2>
            <button onClick={() => setShowNew(true)} className="btn-neon inline-flex items-center gap-1 rounded-xl px-3 py-2 text-sm"><Plus className="h-4 w-4" /> Add fixture</button>
          </div>
          <div className="space-y-3">
            {data.map((m) => (
              <motion.div key={m.id} layout className="glass flex flex-wrap items-center gap-4 rounded-2xl p-4">
                <div className="text-2xl">{SPORT_META[m.sport].emoji}</div>
                <div className="min-w-0 flex-1">
                  <div className="truncate font-semibold">{m.teamA} vs {m.teamB}</div>
                  <div className="text-xs text-white/50">{SPORT_META[m.sport].label} · {m.venue}</div>
                </div>
                <StatusBadge status={m.status} />
                <ScoreControl label="A" value={m.scoreA} onChange={(v) => update.mutate({ id: m.id, patch: { scoreA: v } })} />
                <ScoreControl label="B" value={m.scoreB} onChange={(v) => update.mutate({ id: m.id, patch: { scoreB: v } })} />
                <select value={m.status} onChange={(e) => update.mutate({ id: m.id, patch: { status: e.target.value as Match["status"] } })}
                  className="rounded-lg border border-white/10 bg-white/5 px-2 py-1.5 text-xs outline-none">
                  <option value="upcoming" className="bg-[#121320]">upcoming</option>
                  <option value="live" className="bg-[#121320]">live</option>
                  <option value="completed" className="bg-[#121320]">completed</option>
                </select>
                <button onClick={() => del.mutate(m.id)} className="rounded-lg p-2 text-white/60 hover:bg-red-500/10 hover:text-red-400"><Trash2 className="h-4 w-4" /></button>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {showNew && <NewFixtureModal onClose={() => setShowNew(false)} onCreate={(m) => { add.mutate(m); setShowNew(false); }} />}
    </div>
  );
}

function ScoreControl({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex items-center gap-1 rounded-xl border border-white/10 bg-white/5 p-1">
      <span className="px-2 text-xs text-white/50">{label}</span>
      <button onClick={() => onChange(Math.max(0, value - 1))} className="rounded-md p-1 hover:bg-white/10"><Minus className="h-3 w-3" /></button>
      <span className="min-w-[2ch] text-center text-sm font-bold">{value}</span>
      <button onClick={() => onChange(value + 1)} className="rounded-md p-1 hover:bg-white/10"><Plus className="h-3 w-3" /></button>
    </div>
  );
}

function NewFixtureModal({ onClose, onCreate }: { onClose: () => void; onCreate: (m: Omit<Match, "id" | "log">) => void }) {
  const [f, setF] = useState({ sport: "cricket" as Sport, teamA: "", teamB: "", venue: "Multi-Sports Arena", scheduledAt: "" });
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="glass neon-border w-full max-w-md rounded-3xl p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold">New Fixture</h3>
          <button onClick={onClose} className="text-white/50 hover:text-white"><X className="h-5 w-5" /></button>
        </div>
        <div className="space-y-3">
          <select value={f.sport} onChange={(e) => setF({ ...f, sport: e.target.value as Sport })} className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 outline-none">
            {Object.entries(SPORT_META).map(([k, m]) => <option key={k} value={k} className="bg-[#121320]">{m.label}</option>)}
          </select>
          <input placeholder="Team A" value={f.teamA} onChange={(e) => setF({ ...f, teamA: e.target.value })} className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 outline-none" />
          <input placeholder="Team B" value={f.teamB} onChange={(e) => setF({ ...f, teamB: e.target.value })} className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 outline-none" />
          <input placeholder="Venue" value={f.venue} onChange={(e) => setF({ ...f, venue: e.target.value })} className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 outline-none" />
          <input type="datetime-local" value={f.scheduledAt} onChange={(e) => setF({ ...f, scheduledAt: e.target.value })} className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 outline-none" />
          <button onClick={() => {
            if (!f.teamA || !f.teamB) { toast.error("Both teams required"); return; }
            onCreate({ sport: f.sport, teamA: f.teamA, teamB: f.teamB, venue: f.venue, scheduledAt: f.scheduledAt ? new Date(f.scheduledAt).getTime() : Date.now() + 86400000, scoreA: 0, scoreB: 0, status: "upcoming" });
          }} className="btn-neon w-full rounded-xl py-2.5 font-semibold">Create Fixture</button>
        </div>
      </div>
    </div>
  );
}