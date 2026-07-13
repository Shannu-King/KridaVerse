import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ParticleCanvas } from "@/components/ParticleCanvas";
import { SPORT_META, type Sport } from "@/lib/mockApi";
import { SportIcon } from "@/components/SportIcon";
import { X, Plus, ArrowLeft, Check } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/register/$sport")({ component: RegisterSport });

function RegisterSport() {
  const { sport } = Route.useParams();
  const nav = useNavigate();
  const meta = SPORT_META[sport as Sport];
  const [teamName, setTeamName] = useState("");
  const [branch, setBranch] = useState("CSE");
  const [year, setYear] = useState("1");
  const [member, setMember] = useState("");
  const [members, setMembers] = useState<string[]>([]);

  if (!meta) {
    return <div className="p-16 text-center">Unknown sport. <Link to="/sports" className="underline">Go back</Link></div>;
  }

  const add = () => {
    const t = member.trim();
    if (!t) return;
    if (members.length >= meta.max) { toast.error(`Maximum ${meta.max} players`); return; }
    if (members.includes(t)) { toast.error("Player already added"); return; }
    setMembers([...members, t]); setMember("");
  };
  const remove = (n: string) => setMembers(members.filter((x) => x !== n));

  const valid = teamName.trim() && members.length >= meta.min && members.length <= meta.max;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid) { toast.error(`Roster must have ${meta.min}–${meta.max} players`); return; }
    void branch; void year;
    toast.success(`${teamName} registered for ${meta.label}!`);
    setTimeout(() => nav({ to: "/schedules" }), 800);
  };

  return (
    <div className="relative overflow-hidden">
      <ParticleCanvas className="absolute inset-0 h-full w-full" />
      <div className="relative mx-auto max-w-3xl px-6 py-16">
        <Link to="/sports" className="mb-6 inline-flex items-center gap-2 text-sm text-white/60 hover:text-white">
          <ArrowLeft className="h-4 w-4" /> All sports
        </Link>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass neon-border rounded-3xl p-8 md:p-10">
          <div className="mb-8 flex items-center gap-4">
            <SportIcon sport={sport as Sport} className="h-14 w-14" />
            <div>
              <h1 className="text-3xl font-bold">{meta.label} Registration</h1>
              <p className="text-sm text-white/60">Roster required: {meta.min}–{meta.max} players</p>
            </div>
          </div>

          <form onSubmit={submit} className="space-y-5">
            <div>
              <label className="mb-1.5 block text-xs uppercase tracking-widest text-white/50">Team name</label>
              <input value={teamName} onChange={(e) => setTeamName(e.target.value)}
                placeholder="e.g. CSE Titans"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-[color:var(--neon-blue)] focus:shadow-[0_0_0_3px_rgba(110,168,255,0.15)]" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1.5 block text-xs uppercase tracking-widest text-white/50">Branch</label>
                <select value={branch} onChange={(e) => setBranch(e.target.value)}
                  className="w-full appearance-none rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-[color:var(--neon-blue)]">
                  {["CSE", "IT", "ECE"].map((b) => <option key={b} className="bg-[#121320]">{b}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-xs uppercase tracking-widest text-white/50">Year</label>
                <select value={year} onChange={(e) => setYear(e.target.value)}
                  className="w-full appearance-none rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-[color:var(--neon-blue)]">
                  {["1", "2", "3", "4"].map((y) => <option key={y} className="bg-[#121320]">Year {y}</option>)}
                </select>
              </div>
            </div>

            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label className="text-xs uppercase tracking-widest text-white/50">Roster</label>
                <span className={`text-xs font-medium ${members.length < meta.min ? "text-white/50" : members.length > meta.max ? "text-red-400" : "text-[color:var(--neon-emerald)]"}`}>
                  {members.length} / {meta.min}–{meta.max}
                </span>
              </div>
              <div className="flex gap-2">
                <input value={member} onChange={(e) => setMember(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); add(); } }}
                  placeholder="Add player name"
                  className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-[color:var(--neon-blue)]" />
                <button type="button" onClick={add} className="btn-neon flex items-center gap-1 rounded-xl px-4">
                  <Plus className="h-4 w-4" /> Add
                </button>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <AnimatePresence>
                  {members.map((m) => (
                    <motion.span key={m}
                      initial={{ opacity: 0, scale: 0.7, y: -6 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.7 }}
                      className="group inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-sm">
                      {m}
                      <button type="button" onClick={() => remove(m)} className="text-white/40 hover:text-red-400"><X className="h-3.5 w-3.5" /></button>
                    </motion.span>
                  ))}
                </AnimatePresence>
                {!members.length && <div className="text-sm text-white/40">No players yet — add at least {meta.min}.</div>}
              </div>
            </div>

            <button type="submit" disabled={!valid}
              className={`w-full rounded-xl py-3 text-sm font-semibold transition ${valid ? "btn-neon" : "cursor-not-allowed border border-white/10 bg-white/5 text-white/40"}`}>
              <Check className="mr-1.5 inline h-4 w-4" /> Submit Registration
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}