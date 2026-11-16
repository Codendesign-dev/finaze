import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

// Registered once. useGSAP wraps gsap.context(), so everything created inside
// it is reverted on unmount and React Strict Mode never leaves duplicates.
gsap.registerPlugin(ScrollTrigger, useGSAP);
ScrollTrigger.config({ ignoreMobileResize: true });

if (import.meta.env.DEV) Object.assign(window, { gsap, ScrollTrigger });

export const MQ = {
  desktop: "(min-width: 1024px) and (prefers-reduced-motion: no-preference)",
  mobile: "(max-width: 1023px) and (prefers-reduced-motion: no-preference)",
  motion: "(prefers-reduced-motion: no-preference)",
  reduced: "(prefers-reduced-motion: reduce)",
};

/**
 * Public-folder URL that respects Vite's base. With a relative base ("./") the
 * SSR build (used to prerender index.html) reports BASE_URL as "/", so use "./"
 * there too: prerendered and hydrated URLs must match.
 */
const BASE = import.meta.env.SSR && import.meta.env.BASE_URL === "/" ? "./" : import.meta.env.BASE_URL;
export const asset = (path) => `${BASE}assets/${path}`;

// Setup queue: scroll animations below the fold are created after the first
// paint, one per task, so start-up never runs as one long main-thread block
// (that is what Total Blocking Time measures).
const queue = [];
let draining = false;
const drain = () => {
  const job = queue.shift();
  if (!job) {
    draining = false;
    return;
  }
  job();
  setTimeout(drain, 0);
};
export function afterPaint(job) {
  queue.push(job);
  if (draining) return;
  draining = true;
  requestAnimationFrame(() => setTimeout(drain, 0));
}

/**
 * useGSAP, but the setup runs from the afterPaint queue. The setup may return
 * a cleanup function, as with useGSAP. Returns useGSAP's { contextSafe }.
 */
export function useDeferredGSAP(setup, config) {
  return useGSAP((context) => {
    let cancelled = false;
    let cleanup;
    afterPaint(() => {
      if (!cancelled) context.add(() => (cleanup = setup()));
    });
    return () => {
      cancelled = true;
      if (typeof cleanup === "function") cleanup();
    };
  }, config);
}

export { gsap, ScrollTrigger, useGSAP };
