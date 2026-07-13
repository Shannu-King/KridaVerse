import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { motion, useMotionValue, useTransform, animate, useInView } from "framer-motion";
import { ArrowRight, Radio, Trophy, Users, Zap, Flame, Layers } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import g1 from "@/assets/Ground1.jpg";
import g2 from "@/assets/Ground2.jpg";
import g3 from "@/assets/Ground3.jpg";
import KineticField from "@/components/KineticField";

export const Route = createFileRoute("/")({ component: Index });

const facilities = [
  { title: "Outdoor Cricket Nets", desc: "Spacious netted training setups for cricket, precision & pace work.", img: g1, label: "Cricket Nets", icon: Trophy },
  { title: "Athletics Stadium", desc: "Multi-lane tracking, sprinting grounds and field events.", img: g2, label: "Athletic Arena", icon: Flame },
  { title: "Indoor Arena", desc: "Flexible basketball, volleyball and skating layouts under one roof.", img: g3, label: "Multi-Sports", icon: Layers },
];

function AnimatedNumber({ value }: { value: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "0px" });
  const [displayVal, setDisplayVal] = useState("0");

  useEffect(() => {
    if (!isInView) return;
    const isK = value.includes("k");
    const isPlus = value.includes("+");
    const numericStr = value.replace(/[^0-9.]/g, "");
    const target = parseFloat(numericStr);
    if (isNaN(target)) {
      setDisplayVal(value);
      return;
    }

    const count = animate(0, target, {
      duration: 2.2,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (latest) => {
        let formatted = "";
        if (isK) {
          formatted = latest.toFixed(1) + "k";
        } else {
          formatted = Math.round(latest).toString();
          if (isPlus) formatted += "+";
        }
        setDisplayVal(formatted);
      }
    });
    return () => count.stop();
  }, [value, isInView]);

  return <span ref={ref}>{displayVal}</span>;
}

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
        <div className="absolute inset-0 block md:hidden">
          <KineticField />
        </div>
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 h-full w-full object-cover opacity-75 hero-video hidden md:block"
          poster={g2}
        >
          <source src="/sports_video.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 backdrop-blur-[2px] bg-gradient-to-b from-black/35 via-black/40 to-[#0d0e15]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(15,16,35,0.35),rgba(8,8,20,0.65))]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(110,168,255,0.2),transparent_50%),radial-gradient(circle_at_80%_70%,rgba(139,92,246,0.12),transparent_50%)]" />

        <div className="relative mx-auto max-w-6xl px-6 text-center -translate-y-12">
          {/* Radial glow behind title */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] rounded-full bg-gradient-to-tr from-[#6ea8ff]/10 to-[#8b5cf6]/10 blur-[80px] pointer-events-none -z-10" />

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}
            className="-mt-6 mb-6 inline-flex items-center gap-2.5 rounded-full glass px-4.5 py-2 text-xs font-medium text-white/90">
            <span className="relative flex h-2 w-2">
              <motion.span 
                animate={{ opacity: [1, 0.4, 1] }} 
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                className="absolute inline-flex h-full w-full rounded-full bg-[color:var(--neon-emerald)] shadow-[0_0_8px_var(--neon-emerald)]"
              />
            </span>
            Live matches streaming right now
          </motion.div>
          
          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.1 }}
            className="text-5xl font-bold tracking-tight md:text-7xl lg:text-8xl select-none">
            <span className="text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.15)]">Krida</span>
            <span className="hero-title-gradient font-extrabold relative inline-block">
              Verse
              <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[140%] h-[140%] rounded-full bg-[radial-gradient(circle,rgba(139,92,246,0.25)_0%,rgba(110,168,255,0.15)_50%,transparent_70%)] blur-[12px] pointer-events-none -z-10" />
            </span>
          </motion.h1>
          
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.25 }}
            className="mx-auto mt-6 max-w-[580px] text-lg text-white/75 md:text-xl leading-[1.8] tracking-wide">
            The command center for collegiate tournaments — register teams, follow live scores, and run the entire event from one luminous console.
          </motion.p>
          
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.4 }}
            className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Link to="/dashboard" className="btn-filled-gradient inline-flex items-center gap-2 rounded-xl px-6 py-3.5 text-base font-semibold">
              <Zap className="h-4 w-4" /> View Live Scores
            </Link>
            <Link to="/sports" className="group inline-flex items-center gap-2 rounded-xl border border-white/25 bg-white/5 px-6 py-3.5 text-base font-semibold text-white transition-all hover:border-[#6ea8ff]/50 hover:bg-white/10 hover:shadow-[0_0_20px_rgba(110,168,255,0.15)] hover:-translate-y-[3px] duration-300">
              Register a team <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </motion.div>

          <div className="mt-16 grid grid-cols-3 gap-4 md:gap-8">
            {[
              { k: "24+", v: "Live Matches" },
              { k: "6", v: "Sports" },
              { k: "1.2k", v: "Athletes" },
            ].map((s) => (
              <div key={s.v} className="stats-card px-6 py-8 flex flex-col items-center justify-center relative overflow-hidden group">
                {/* Horizontal glowing lines for premium structure */}
                <div className="absolute top-0 left-4 right-4 h-[1px] bg-gradient-to-r from-transparent via-[#6ea8ff]/30 to-transparent" />
                <div className="text-3xl font-extrabold neon-text md:text-4xl tracking-tight my-1">
                  <AnimatedNumber value={s.k} />
                </div>
                <div className="text-xs uppercase tracking-widest text-white/50 md:text-sm font-semibold">{s.v}</div>
                <div className="absolute bottom-0 left-4 right-4 h-[1px] bg-gradient-to-r from-transparent via-[#6ea8ff]/30 to-transparent" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FACILITIES */}
      <section className="mx-auto max-w-7xl px-6 py-32">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7 }}
          className="mb-16 flex flex-col items-start justify-between gap-4 md:flex-row md:items-end"
        >
          <div>
            <div className="text-xs uppercase tracking-widest text-[color:var(--neon-blue)] font-bold">Where the action lives</div>
            <h2 className="mt-2 text-4xl font-extrabold tracking-tight md:text-5xl">World-class facilities</h2>
          </div>
          <p className="max-w-md text-white/60 text-base">Purpose-built venues instrumented for real-time scoring and analytics.</p>
        </motion.div>
        
        <div className="grid gap-8 md:grid-cols-3">
          {facilities.map((f, i) => (
            <motion.div key={f.title}
              initial={{ opacity: 0, y: 40 }} 
              whileInView={{ opacity: 1, y: 0 }} 
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.7, delay: i * 0.1 }}
              className="facility-card border border-white/5 aspect-[4/5] relative group cursor-default shadow-lg">
              
              {/* Card Image */}
              <img 
                src={f.img} 
                alt={f.title} 
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105" 
              />
              
              {/* Dark Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-90 group-hover:via-black/20 transition-all duration-300" />
              
              {/* Category Badge */}
              <div className="absolute top-4 left-4 flex items-center gap-1.5 rounded-full bg-black/60 px-3.5 py-1.5 text-xs font-semibold backdrop-blur-md border border-white/10 text-white/95">
                <f.icon className="h-3.5 w-3.5 text-[color:var(--neon-blue)]" />
                {f.label}
              </div>
              
              {/* Hover text block */}
              <div className="absolute bottom-0 left-0 right-0 p-6 flex flex-col justify-end h-1/2">
                <h3 className="text-2xl font-bold tracking-tight text-white group-hover:text-[color:var(--neon-blue)] transition duration-300">
                  {f.title}
                </h3>
                <p className="mt-2.5 text-sm text-white/70 line-clamp-2 opacity-0 group-hover:opacity-100 transform translate-y-3 group-hover:translate-y-0 transition-all duration-500 ease-out">
                  {f.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <motion.section 
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.75 }}
        className="mx-auto max-w-7xl px-6 pb-32"
      >
        <div className="glass neon-border overflow-hidden rounded-3xl p-10 md:p-16 bg-[#121320]/25">
          <div className="grid gap-8 md:grid-cols-2 md:items-center">
            <div>
              <div className="text-xs uppercase tracking-widest text-[color:var(--neon-purple)] font-bold">Ready to compete?</div>
              <h3 className="mt-2 text-4xl font-extrabold tracking-tight md:text-5xl leading-[1.2]">
                Register your team <br />
                <span className="animate-gradient-text">in under two minutes.</span>
              </h3>
              <p className="mt-4 text-white/60 text-base leading-[1.65]">Pick a sport, fill the roster, and lock your slot in the fixtures grid.</p>
              <div className="mt-8 flex gap-3">
                <Link to="/sports" className="btn-neon inline-flex items-center gap-2 rounded-xl px-6 py-3 font-semibold">
                  <Trophy className="h-4 w-4" /> Choose Sport
                </Link>
                <Link to="/schedules" className="inline-flex items-center gap-2 rounded-xl border border-white/15 px-6 py-3 font-semibold text-white/90 hover:bg-white/5 transition duration-200">
                  See Fixtures
                </Link>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: Trophy, l: "Live rankings" }, 
                { icon: Users, l: "Team rosters" }, 
                { icon: Radio, l: "Real-time feed" }, 
                { icon: Zap, l: "Broadcasts" }
              ].map((x) => (
                <div 
                  key={x.l} 
                  className="glass rounded-[20px] p-5 border border-white/5 bg-[#1e2032]/20 hover:bg-[#1e2032]/45 hover:border-[color:var(--neon-blue)]/50 hover:shadow-[0_0_30px_rgba(110,168,255,0.15)] transition-all duration-300 group cursor-default"
                >
                  <x.icon className="h-7 w-7 text-[color:var(--neon-blue)] transition-transform duration-500 ease-out group-hover:rotate-12 group-hover:scale-110" />
                  <div className="mt-4 text-sm font-semibold text-white/90 group-hover:text-white transition duration-300">{x.l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.section>
    </div>
  );
}
