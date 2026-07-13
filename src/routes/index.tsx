import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight, Radio, Trophy, Users, Zap } from "lucide-react";
import { useEffect, useRef } from "react";
import g1 from "@/assets/Ground1.jpg";
import g2 from "@/assets/Ground2.jpg";
import g3 from "@/assets/Ground3.jpg";

export const Route = createFileRoute("/")({ component: Index });

const facilities = [
  { title: "Outdoor Practice Facilities", desc: "Spacious netted training setups for cricket, precision & pace work.", img: g1 },
  { title: "Outdoor Athletic Arena", desc: "Multi-lane tracking, sprinting grounds and field events.", img: g2 },
  { title: "Multi-Sports Arena", desc: "Flexible basketball, volleyball and skating layouts under one roof.", img: g3 },
];

function Index() {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = true;
      videoRef.current.play().catch((err) => {
        console.warn("Video autoplay failed or was prevented:", err);
      });
    }
  }, []);

  return (
    <div>
      {/* HERO */}
      <section className="relative flex min-h-[92vh] items-center justify-center overflow-hidden">
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 h-full w-full object-cover opacity-75 hero-video"
          poster={g2}
        >
          <source src="/sports_video.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-black/50 to-[#0d0e15]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(110,168,255,0.25),transparent_50%),radial-gradient(circle_at_80%_70%,rgba(255,59,92,0.2),transparent_50%)]" />

        <div className="relative mx-auto max-w-6xl px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}
            className="-mt-6 mb-6 inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 text-xs font-medium text-white/80">
            <Radio className="h-3.5 w-3.5 text-[color:var(--neon-emerald)] animate-pulse" />
            Live matches streaming right now
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.1 }}
            className="text-5xl font-bold tracking-tight md:text-7xl lg:text-8xl">
            <span className="neon-text">KridaVerse</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.25 }}
            className="mx-auto mt-6 max-w-[650px] text-lg text-white/70 md:text-xl">
            The command center for collegiate tournaments — register teams, follow live scores, and run the entire event from one luminous console.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.4 }}
            className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Link to="/dashboard" className="btn-filled-gradient inline-flex items-center gap-2 rounded-xl px-6 py-3 text-base font-semibold">
              <Zap className="h-4 w-4" /> View Live Scores
            </Link>
            <Link to="/sports" className="inline-flex items-center gap-2 rounded-xl border border-white/20 hover:border-[#6ea8ff]/50 px-6 py-3 text-base font-semibold text-white/90 backdrop-blur-md transition-all hover:bg-white/5 hover:text-white hover:shadow-[0_0_15px_rgba(110,168,255,0.1)]">
              Register a team <ArrowRight className="h-4 w-4" />
            </Link>
          </motion.div>

          <div className="mt-16 grid grid-cols-3 gap-4 md:gap-8">
            {[
              { k: "24+", v: "Live Matches" },
              { k: "6", v: "Sports" },
              { k: "1.2k", v: "Athletes" },
            ].map((s) => (
              <div key={s.v} className="glass stats-card rounded-2xl px-4 py-5">
                <div className="text-3xl font-bold neon-text md:text-4xl">{s.k}</div>
                <div className="mt-1 text-xs uppercase tracking-widest text-white/50 md:text-sm">{s.v}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FACILITIES */}
      <section className="mx-auto max-w-7xl px-6 py-24">
        <div className="mb-12 flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
          <div>
            <div className="text-xs uppercase tracking-widest text-[color:var(--neon-blue)]">Where the action lives</div>
            <h2 className="mt-2 text-4xl font-bold tracking-tight md:text-5xl">World-class facilities</h2>
          </div>
          <p className="max-w-md text-white/60">Purpose-built venues instrumented for real-time scoring and analytics.</p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {facilities.map((f, i) => (
            <motion.div key={f.title}
              initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="glass glass-hover group overflow-hidden rounded-3xl">
              <div className="relative aspect-[4/3] overflow-hidden">
                <img src={f.img} alt={f.title} className="h-full w-full object-cover transition duration-700 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                <div className="absolute bottom-4 left-4 rounded-full bg-black/50 px-3 py-1 text-xs backdrop-blur-md">Facility 0{i + 1}</div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm text-white/60">{f.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-6 pb-24">
        <div className="glass neon-border overflow-hidden rounded-3xl p-10 md:p-16">
          <div className="grid gap-8 md:grid-cols-2 md:items-center">
            <div>
              <div className="text-xs uppercase tracking-widest text-[color:var(--neon-crimson)]">Ready to compete?</div>
              <h3 className="mt-2 text-4xl font-bold tracking-tight md:text-5xl">Register your team in under two minutes.</h3>
              <p className="mt-4 text-white/60">Pick a sport, fill the roster, and lock your slot in the fixtures grid.</p>
              <div className="mt-6 flex gap-3">
                <Link to="/sports" className="btn-neon inline-flex items-center gap-2 rounded-xl px-6 py-3 font-semibold">
                  <Trophy className="h-4 w-4" /> Choose Sport
                </Link>
                <Link to="/schedules" className="inline-flex items-center gap-2 rounded-xl border border-white/15 px-6 py-3 font-semibold text-white/90 hover:bg-white/5">
                  See Fixtures
                </Link>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[{ icon: Trophy, l: "Live rankings" }, { icon: Users, l: "Team rosters" }, { icon: Radio, l: "Real-time feed" }, { icon: Zap, l: "Broadcasts" }].map((x) => (
                <div key={x.l} className="glass rounded-2xl p-4">
                  <x.icon className="h-6 w-6 text-[color:var(--neon-blue)]" />
                  <div className="mt-3 text-sm font-medium">{x.l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
