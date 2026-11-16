import { useEffect, useRef } from "react";
import { asset } from "../lib/gsap";

/**
 * Footer wordmark in the style of the United Carriers footer: the logo is
 * drawn as a dense grid of dots; the cursor (a ring) pushes dots aside with a
 * slight swirl so they trail like smoke, then they spring back home.
 *
 * Plain 2D canvas + typed arrays (~8–12k particles). The loop only runs while
 * the footer is on screen and stops once every dot has settled.
 */
const SRC = "brand/wordmark-mask.png";
// Influence radius around the cursor scales with the wordmark: 95px on the
// full-width desktop footer, down to 34px on phones.
const radiusFor = (w) => Math.max(34, Math.min(95, w * 0.062));
const PUSH = 3.2;
const SWIRL = 1.6;
const SPRING = 0.016;
const DAMPING = 0.9;

export default function ParticleWordmark({ color = "rgba(70, 120, 235, 0.62)" }) {
  const wrapRef = useRef(null);
  const canvasRef = useRef(null);
  const ringRef = useRef(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    const ring = ringRef.current;
    const ctx = canvas.getContext("2d");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let img;
    let n = 0;
    let hx, hy, px, py, vx, vy; // home / position / velocity
    let dot = 2;
    let dpr = 1;
    let radius = 95;
    let raf = 0;
    let visible = false;
    const mouse = { x: -1e4, y: -1e4, vx: 0, vy: 0, active: false };

    const build = () => {
      if (!img) return;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = wrap.clientWidth;
      if (!w) return; // not laid out yet (e.g. hidden or zero-width)
      const h = Math.round((w * img.naturalHeight) / img.naturalWidth);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.height = `${h}px`;
      radius = radiusFor(w);
      const ringSize = `${Math.max(28, Math.round(radius * 0.57))}px`; // 54px at the desktop radius
      ring.style.width = ringSize;
      ring.style.height = ringSize;

      // Sample the mask's alpha on a grid; gap scales with width.
      const gap = Math.max(3, Math.round(w / 330));
      dot = Math.max(1.2, gap * 0.48);
      const off = document.createElement("canvas");
      off.width = w;
      off.height = h;
      const octx = off.getContext("2d", { willReadFrequently: true });
      octx.drawImage(img, 0, 0, w, h);
      const data = octx.getImageData(0, 0, w, h).data;
      // The supplied mask is a faint overlay (alpha ≈ 50/255), so threshold
      // against its own maximum rather than a fixed value.
      let maxA = 0;
      for (let i = 3; i < data.length; i += 4) if (data[i] > maxA) maxA = data[i];
      const cut = maxA * 0.12;
      const pts = [];
      for (let y = gap / 2; y < h; y += gap) {
        for (let x = gap / 2; x < w; x += gap) {
          if (data[((y | 0) * w + (x | 0)) * 4 + 3] > cut) pts.push(x, y);
        }
      }
      n = pts.length / 2;
      hx = new Float32Array(n);
      hy = new Float32Array(n);
      px = new Float32Array(n);
      py = new Float32Array(n);
      vx = new Float32Array(n);
      vy = new Float32Array(n);
      for (let i = 0; i < n; i++) {
        hx[i] = px[i] = pts[i * 2];
        hy[i] = py[i] = pts[i * 2 + 1];
      }
      draw();
    };

    const draw = () => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = color;
      ctx.beginPath();
      for (let i = 0; i < n; i++) ctx.rect(px[i] - dot / 2, py[i] - dot / 2, dot, dot);
      ctx.fill();
    };

    const step = () => {
      raf = 0;
      let moving = false;
      const r2 = radius * radius;
      for (let i = 0; i < n; i++) {
        if (mouse.active) {
          const dx = px[i] - mouse.x;
          const dy = py[i] - mouse.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < r2 && d2 > 0.01) {
            const d = Math.sqrt(d2);
            const f = (1 - d / radius) ** 2;
            // Radial push + tangential swirl + a share of the cursor's motion.
            vx[i] += (dx / d) * f * PUSH - (dy / d) * f * SWIRL + mouse.vx * f * 0.35;
            vy[i] += (dy / d) * f * PUSH + (dx / d) * f * SWIRL + mouse.vy * f * 0.35;
          }
        }
        vx[i] = (vx[i] + (hx[i] - px[i]) * SPRING) * DAMPING;
        vy[i] = (vy[i] + (hy[i] - py[i]) * SPRING) * DAMPING;
        px[i] += vx[i];
        py[i] += vy[i];
        if (!moving && (Math.abs(vx[i]) > 0.02 || Math.abs(vy[i]) > 0.02 || Math.abs(hx[i] - px[i]) > 0.3)) moving = true;
      }
      mouse.vx *= 0.8;
      mouse.vy *= 0.8;
      draw();
      if (visible && (moving || mouse.active)) raf = requestAnimationFrame(step);
    };
    const kick = () => {
      if (!raf && visible && !reduced) raf = requestAnimationFrame(step);
    };

    const onMove = (e) => {
      const r = canvas.getBoundingClientRect();
      const x = e.clientX - r.left;
      const y = e.clientY - r.top;
      if (mouse.active) {
        mouse.vx = x - mouse.x;
        mouse.vy = y - mouse.y;
      }
      mouse.x = x;
      mouse.y = y;
      mouse.active = true;
      ring.style.transform = `translate3d(${e.clientX - r.left}px, ${e.clientY - r.top}px, 0) translate(-50%, -50%)`;
      kick();
    };
    const onLeave = () => {
      mouse.active = false;
      ring.style.opacity = "0";
      kick();
    };
    const onEnter = () => {
      ring.style.opacity = "1";
    };

    const io = new IntersectionObserver(([en]) => {
      visible = en.isIntersecting;
      if (visible) kick();
    });
    const ro = new ResizeObserver(() => build());

    // Sampling the mask is costly; wait until the footer is close to view.
    const near = new IntersectionObserver(
      ([en]) => {
        if (!en.isIntersecting) return;
        near.disconnect();
        img = new Image();
        img.decoding = "async";
        img.src = asset(SRC);
        img.onload = () => {
          build();
          ro.observe(wrap);
          io.observe(wrap);
        };
      },
      { rootMargin: "800px 0px" }
    );
    near.observe(wrap);

    if (!reduced) {
      wrap.addEventListener("pointermove", onMove);
      wrap.addEventListener("pointerenter", onEnter);
      wrap.addEventListener("pointerleave", onLeave);
    }

    return () => {
      cancelAnimationFrame(raf);
      near.disconnect();
      io.disconnect();
      ro.disconnect();
      wrap.removeEventListener("pointermove", onMove);
      wrap.removeEventListener("pointerenter", onEnter);
      wrap.removeEventListener("pointerleave", onLeave);
    };
  }, [color]);

  return (
    <div ref={wrapRef} className="pwm" role="img" aria-label="Finaze">
      <canvas ref={canvasRef} className="pwm__canvas" />
      <span ref={ringRef} className="pwm__ring" aria-hidden="true">
        <span />
      </span>
    </div>
  );
}
