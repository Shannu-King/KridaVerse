import { motion } from "framer-motion";

export function AnimatedBackground({ className = "" }: { className?: string }) {
  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
      <motion.div
        className="absolute -left-[10%] -top-[10%] h-[50vw] w-[50vw] rounded-full opacity-20 blur-[100px]"
        style={{ background: "var(--neon-blue)" }}
        animate={{ x: [0, 60, 0], y: [0, 40, 0], scale: [1, 1.1, 1] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -right-[10%] top-[20%] h-[45vw] w-[45vw] rounded-full opacity-15 blur-[120px]"
        style={{ background: "var(--neon-purple)" }}
        animate={{ x: [0, -50, 0], y: [0, 60, 0], scale: [1, 1.15, 1] }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      />
      <motion.div
        className="absolute bottom-[5%] left-[30%] h-[35vw] w-[35vw] rounded-full opacity-15 blur-[100px]"
        style={{ background: "var(--neon-emerald)" }}
        animate={{ x: [0, 40, 0], y: [0, -30, 0], scale: [1, 1.08, 1] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 4 }}
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,transparent_0%,var(--background)_90%)] opacity-60" />
    </div>
  );
}
