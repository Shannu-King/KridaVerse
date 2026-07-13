import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { SPORT_META, type Sport } from "@/lib/mockApi";
import { ArrowRight } from "lucide-react";
import { AnimatedBackground } from "@/components/AnimatedBackground";

export const Route = createFileRoute("/sports")({ component: SportsPage });

function SportsPage() {
  const sports = Object.entries(SPORT_META) as [Sport, typeof SPORT_META[Sport]][];
  return (
    <div className="relative min-h-screen overflow-hidden">
      <AnimatedBackground />
      <div className="relative mx-auto max-w-7xl px-6 py-16">
        <div className="mb-12 text-center">
        <div className="text-xs uppercase tracking-widest text-[color:var(--neon-blue)]">Step 1 of 2</div>
        <h1 className="mt-2 text-4xl font-bold md:text-5xl">Pick your sport</h1>
        <p className="mx-auto mt-3 max-w-xl text-white/60">Each sport has its own roster rules. Choose one to open the registration console.</p>
      </div>
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {sports.map(([id, meta], i) => (
          <motion.div key={id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Link to="/register/$sport" params={{ sport: id }}
              className="glass glass-hover group relative block overflow-hidden rounded-3xl p-8">
              <div className="absolute -right-16 -top-16 h-52 w-52 rounded-full opacity-20 blur-3xl transition group-hover:opacity-40"
                style={{ background: meta.color }} />
              <div className="relative">
                <div className="text-6xl">{meta.emoji}</div>
                <h3 className="mt-4 text-2xl font-bold">{meta.label}</h3>
                <p className="mt-1 text-sm text-white/60">Roster: {meta.min}–{meta.max} players</p>
                <div className="mt-6 inline-flex items-center gap-2 text-sm font-semibold" style={{ color: meta.color }}>
                  Register team <ArrowRight className="h-4 w-4" />
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
    </div>
  );
}