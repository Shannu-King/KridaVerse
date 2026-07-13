import { useEffect, useRef } from "react";

/**
 * KineticField — a premium, unique background animation.
 * Combines:
 *  - a perspective "stadium floor" grid receding to a glowing horizon
 *  - neon light streaks racing along the grid lines
 *  - floating particles with subtle mouse parallax
 *  - drifting aurora blobs behind everything
 * Pure canvas 2D, GPU-friendly, ~1 file.
 */
export default function KineticField({ className = "" }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true })!;
    let w = 0, h = 0, dpr = Math.min(window.devicePixelRatio || 1, 2);
    const mouse = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5 };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      w = rect.width; h = rect.height;
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const onMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.tx = (e.clientX - rect.left) / rect.width;
      mouse.ty = (e.clientY - rect.top) / rect.height;
    };
    window.addEventListener("mousemove", onMove);

    // streaks racing along perspective lines
    const LANES = 14;
    type Streak = { lane: number; z: number; speed: number; hue: number; len: number };
    const streaks: Streak[] = Array.from({ length: 22 }, () => ({
      lane: Math.floor(Math.random() * LANES),
      z: Math.random(),
      speed: 0.08 + Math.random() * 0.18,
      hue: Math.random() < 0.5 ? 210 : Math.random() < 0.5 ? 280 : 155,
      len: 0.08 + Math.random() * 0.18,
    }));

    // floating particles
    const particles = Array.from({ length: 55 }, () => ({
      x: Math.random(), y: Math.random() * 0.6,
      r: 0.5 + Math.random() * 1.6,
      vx: (Math.random() - 0.5) * 0.0004,
      vy: -0.0002 - Math.random() * 0.0005,
      a: 0.15 + Math.random() * 0.5,
    }));

    let raf = 0; let t = 0;
    const draw = () => {
      t += 1;
      mouse.x += (mouse.tx - mouse.x) * 0.05;
      mouse.y += (mouse.ty - mouse.y) * 0.05;

      // clear with slight trail for glow persistence
      ctx.fillStyle = "rgba(13,14,21,0.35)";
      ctx.fillRect(0, 0, w, h);

      // aurora blobs
      const blobs = [
        { x: 0.2 + Math.sin(t * 0.003) * 0.1, y: 0.35, c: "rgba(110,168,255,0.22)" },
        { x: 0.8 + Math.cos(t * 0.0025) * 0.08, y: 0.55, c: "rgba(139,92,246,0.12)" },
        { x: 0.5 + Math.sin(t * 0.004) * 0.15, y: 0.75, c: "rgba(60,220,160,0.16)" },
      ];
      for (const b of blobs) {
        const g = ctx.createRadialGradient(b.x * w, b.y * h, 0, b.x * w, b.y * h, Math.max(w, h) * 0.4);
        g.addColorStop(0, b.c);
        g.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, w, h);
      }

      // perspective grid — horizon slightly tracks mouse
      const horizonY = h * (0.42 + (mouse.y - 0.5) * 0.05);
      const vpX = w * (0.5 + (mouse.x - 0.5) * 0.15);
      const floorBottom = h;

      // horizontal receding lines
      ctx.lineWidth = 1;
      for (let i = 1; i <= 12; i++) {
        const p = i / 12;
        // ease so lines bunch near horizon
        const ep = Math.pow(p, 2.4);
        const y = horizonY + (floorBottom - horizonY) * ep;
        const alpha = 0.05 + p * 0.18;
        ctx.strokeStyle = `rgba(110,168,255,${alpha})`;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      // vertical lanes converging to vanishing point
      for (let i = 0; i <= LANES; i++) {
        const p = i / LANES;
        const xBottom = -w * 0.3 + p * w * 1.6;
        ctx.strokeStyle = `rgba(110,168,255,${0.06 + Math.abs(p - 0.5) * 0.1})`;
        ctx.beginPath();
        ctx.moveTo(vpX, horizonY);
        ctx.lineTo(xBottom, floorBottom);
        ctx.stroke();
      }

      // horizon glow line
      const hg = ctx.createLinearGradient(0, horizonY - 30, 0, horizonY + 30);
      hg.addColorStop(0, "rgba(0,0,0,0)");
      hg.addColorStop(0.5, "rgba(110,168,255,0.55)");
      hg.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = hg;
      ctx.fillRect(0, horizonY - 30, w, 60);

      // streaks along lanes
      ctx.lineCap = "round";
      for (const s of streaks) {
        s.z += s.speed * 0.01;
        if (s.z > 1) { s.z = 0; s.lane = Math.floor(Math.random() * LANES); }
        const p1 = Math.min(1, s.z);
        const p2 = Math.max(0, s.z - s.len);
        const ep1 = Math.pow(p1, 2.4);
        const ep2 = Math.pow(p2, 2.4);
        const laneP = s.lane / LANES;
        const xBottom = -w * 0.3 + laneP * w * 1.6;
        const y1 = horizonY + (floorBottom - horizonY) * ep1;
        const y2 = horizonY + (floorBottom - horizonY) * ep2;
        const x1 = vpX + (xBottom - vpX) * ep1;
        const x2 = vpX + (xBottom - vpX) * ep2;
        const grad = ctx.createLinearGradient(x1, y1, x2, y2);
        grad.addColorStop(0, `hsla(${s.hue},100%,65%,${0.05 + p1 * 0.75})`);
        grad.addColorStop(1, `hsla(${s.hue},100%,65%,0)`);
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1 + p1 * 2.5;
        ctx.shadowColor = `hsla(${s.hue},100%,65%,0.8)`;
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      }
      ctx.shadowBlur = 0;

      // floating particles (upper sky area)
      for (const p of particles) {
        p.x += p.vx; p.y += p.vy;
        if (p.y < 0) { p.y = 0.7; p.x = Math.random(); }
        if (p.x < 0) p.x = 1; if (p.x > 1) p.x = 0;
        const px = p.x * w + (mouse.x - 0.5) * 20 * p.r;
        const py = p.y * h + (mouse.y - 0.5) * 20 * p.r;
        ctx.fillStyle = `rgba(200,220,255,${p.a})`;
        ctx.shadowColor = "rgba(110,168,255,0.9)";
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(px, py, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.shadowBlur = 0;

      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMove);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      aria-hidden
      className={`pointer-events-none absolute inset-0 h-full w-full ${className}`}
    />
  );
}