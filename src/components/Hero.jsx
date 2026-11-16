import { useRef } from "react";
import { gsap, useGSAP, MQ, asset, afterPaint } from "../lib/gsap";
import { PartnersIntro } from "./Partners";
import { CONTACT } from "../lib/links";
import "./Hero.css";

const LINE_1 = [{ text: "Marketing made ", tone: "navy" }, { text: "for", tone: "blue" }];
const LINE_2 = [{ text: "financial professionals.", tone: "blue" }];

// Screen area inside laptop.webp (1402 × 894), measured from the image.
const SCREEN = { x: 115 / 1402, y: 16 / 894, w: 1170 / 1402, h: 748 / 894 };
// Laptop top edge, in --u units above the hero bottom (stage is 56.25u tall, laptop at 51.67%).
const LAPTOP_TOP = 56.25 * (1 - 0.5167);
// Width the laptop-screen preview is drawn at, then scaled to fit: desktop
// layout on tablets; on phones the same single-column layout as the real
// section, just wide enough that the first card shows under the heading.
const WIDE = 1200;
const NARROW = 560;
// Responsive sources for the scene (prerendered into index.html, so the
// browser finds them before any script runs). Phones take smaller files: the soft sky and clouds hide it, and the camera
// only zooms about 2x there (5x on desktop, which keeps the full-size files).
const SCENE = {
  sky: {
    srcSet: "mountains-1024.webp 1024w, mountains-1280.webp 1280w, mountains-1600.webp 1600w, mountains.webp 2560w",
    sizes: "(max-width: 767px) and (orientation: portrait) 70vh, (orientation: portrait) 85vh, 100vw",
  },
  cloud: { srcSet: "cloud-1-800.webp 800w, cloud-1-1200.webp 1200w, cloud-1.webp 2000w", sizes: "(max-width: 767px) 100vw, (max-width: 1023px) 120vw, 100vw" },
  desk: { srcSet: "desk-900.webp 900w, desk-1200.webp 1200w, desk.webp 1800w", sizes: "100vw" },
  laptop: { srcSet: "laptop-900.webp 900w, laptop.webp 1402w", sizes: "(max-width: 1023px) 60vw, 100vw" },
};
const sources = ({ srcSet, sizes }) => ({
  srcSet: srcSet.replace(/\S+\.webp/g, (f) => asset(`hero/${f}`)),
  sizes,
});

// One span per character so the headline can type out (reference 0s–3s).
// Characters are grouped per word so lines still wrap at spaces on phones.
function Typed({ parts }) {
  return parts.map((p, pi) =>
    p.text.split(/(\s+)/).map((word, wi) =>
      !word ? null : /^\s+$/.test(word) ? (
        " "
      ) : (
        <span key={`${pi}-${wi}`} className="hero__word">
          {word.split("").map((ch, i) => (
            <span key={i} className={`hero__ch hero__ch--${p.tone}`}>
              {ch}
            </span>
          ))}
        </span>
      )
    )
  );
}

/**
 * Hero — camera move modelled on mercury.com.
 *  intro  – nav (sticky, rendered by App) drops in, headline types out, subtitle and buttons rise;
 *  scroll – copy lifts away and the camera dollies into the laptop at a
 *           constant zoom rate. Clouds drift behind the desk and part as we
 *           pass. The laptop screen shows a live copy of the next section;
 *           the zoom ends with that screen exactly filling the viewport, at
 *           which point the real Partners section (sitting directly beneath)
 *           takes over without any visible change.
 */
export default function Hero() {
  const root = useRef(null);
  const stageRef = useRef(null);
  const laptopRef = useRef(null);
  const screenRef = useRef(null);

  useGSAP(
    (context) => {
      const q = gsap.utils.selector(root);
      const hero = root.current;
      let cancelled = false;
      const stage = stageRef.current;
      const laptop = laptopRef.current;
      const screen = screenRef.current;
      const [wideLayer, realLayer] = screen.children;
      const wideIntro = wideLayer.querySelector(".partners__intro");
      const partners = document.getElementById("partners");

      // ---- geometry: where the screen is, and the zoom that makes it fill the width
      const g = {};
      const state = { p: 0, reveal: 0 };
      const measure = () => {
        g.W = hero.clientWidth;
        g.H = hero.clientHeight;
        fitStage();
        // The screen preview is laid out wider than the viewport and scaled down,
        // so small screens still show cards, not just the heading. Phones (one
        // column, max-width 640px in Sections.css) also skip the top padding.
        const phone = g.W <= 640;
        g.wide = Math.max(g.W, phone ? NARROW : WIDE);
        screen.style.setProperty("--wide-w", `${g.wide}px`);
        screen.style.setProperty("--wide-s", g.W / g.wide);
        const skip = phone ? parseFloat(getComputedStyle(wideIntro).paddingTop) - 16 : 0;
        screen.style.setProperty("--wide-y", `${-skip}px`);
        g.L = stage.offsetLeft;
        g.T = stage.offsetTop;
        g.sx = laptop.offsetLeft + laptop.offsetWidth * SCREEN.x;
        g.sy = laptop.offsetTop + laptop.offsetHeight * SCREEN.y;
        g.sw = laptop.offsetWidth * SCREEN.w;
        g.sh = laptop.offsetHeight * SCREEN.h;
        g.S = g.W / g.sw;
        g.radius = (16 / 1170) * g.W;
        apply();
        screen.style.visibility = "visible"; // hidden until placed (Hero.css)
      };
      const apply = () => {
        const s = Math.pow(g.S, state.p); // exponential = constant perceived zoom speed
        const f = (s - 1) / (g.S - 1);
        const px = (g.L + g.sx) * (1 - f); // screen top-left glides to the viewport corner
        const py = (g.T + g.sy) * (1 - f);
        gsap.set(stage, { x: px - g.L - g.sx * s, y: py - g.T - g.sy * s, scale: s });
        const k = (s * g.sw) / g.W;
        const cut = Math.max(0, g.H - (g.sh * g.W) / g.sw) * (1 - state.reveal);
        gsap.set(screen, { x: px, y: py, scale: k, clipPath: `inset(0px 0px ${cut}px 0px round ${g.radius * (1 - state.reveal)}px)` });
        // As the screen opens onto the page, swap the scaled desktop preview for
        // the real-width copy, so the hand-over to the section matches exactly.
        const swap = g.wide > g.W ? state.reveal : 0;
        wideLayer.style.opacity = 1 - swap;
        realLayer.style.opacity = swap;
      };

      // Portrait screens: size the scene so the laptop sits just under the
      // buttons instead of leaving a band of empty sky (CSS --u is the fallback).
      const fitStage = () => {
        hero.style.removeProperty("--u");
        if (g.W >= 1024 || g.H <= g.W) return;
        const ctas = hero.querySelector(".hero__ctas");
        const free = g.H - (ctas.offsetTop + ctas.offsetHeight) - Math.max(24, g.H * 0.04);
        const u = Math.min(Math.max(free / LAPTOP_TOP, g.W * 0.015), g.W * 0.032);
        hero.style.setProperty("--u", `${u}px`);
      };

      const ro = new ResizeObserver(measure);
      ro.observe(hero);
      measure();

      const mm = gsap.matchMedia();

      mm.add(MQ.motion, () => {
        gsap
          .timeline({ delay: 0.2, defaults: { ease: "power3.out" } })
          // fromTo: the prerendered page already starts in these states (Hero.css,
          // under html.js), so "from" would read them back as the end values.
          .fromTo(q(".hero__ch"), { opacity: 0 }, { opacity: 1, duration: 0.01, stagger: 0.055, ease: "none" }, 0)
          // The nav lives outside the hero (App), so pass the element: a string
          // selector here would be scoped to the hero and match nothing.
          .fromTo(document.querySelector("[data-hero-nav]"), { yPercent: -120, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.9 }, 0.45)
          // 0.01, not 0: looks the same, but the browser counts the text as
          // painted, so Largest Contentful Paint does not wait for the fade.
          .fromTo(q(".hero__eyebrow"), { opacity: 0.01, y: 10 }, { opacity: 1, y: 0, duration: 0.8 }, 0.5)
          .fromTo(q(".hero__sub"), { opacity: 0.01, y: 24 }, { opacity: 1, y: 0, duration: 0.9 }, 1.3)
          .fromTo(q(".hero__ctas .btn"), { opacity: 0, y: 60 }, { opacity: 1, y: 0, duration: 1, stagger: 0.12 }, 1.5);

      });

      // The scroll pin is not needed for the first paint; build it just after.
      afterPaint(() => !cancelled && context.add(() => mm.add({ desktop: MQ.desktop, mobile: MQ.mobile }, (ctx) => {
        const { desktop } = ctx.conditions;
        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: hero,
            start: "top top",
            end: desktop ? "+=200%" : "+=150%",
            scrub: 0.6,
            pin: true,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            onRefresh: (self) => {
              measure();
              if (partners) gsap.set(partners, { visibility: self.progress >= 1 ? "visible" : "hidden" });
            },
            // Hand over to the real section once the screen fills the viewport.
            onLeave: () => partners && gsap.set(partners, { visibility: "visible" }),
            onEnterBack: () => partners && gsap.set(partners, { visibility: "hidden" }),
          },
        });

        tl.to(q(".hero__copy, .hero__ctas"), { autoAlpha: 0, y: -70, duration: 0.6, ease: "power2.in" }, 0)
          .to(state, { p: 1, duration: 3.2, ease: "power1.in", onUpdate: apply }, 0.15)
          // Background recedes and dims, as on Mercury.
          .to(q(".hero__sky"), { scale: 1.45, duration: 3.2, ease: "power1.in" }, 0.15)
          .to(q(".hero__dim"), { opacity: 0.45, duration: 3.2, ease: "power1.in" }, 0.15)
          .to(q(".hero__fade"), { opacity: 0, duration: 1, ease: "power1.in" }, 0.1)
          // The cloud bank behind the desk swells and drifts down out of frame.
          .to(q(".hero__cloud"), { scale: 1.6, yPercent: 30, autoAlpha: 0, duration: 2.6, ease: "power1.in" }, 0.2)
          // Screen now spans the full width: open its bottom edge onto the page.
          .to(state, { reveal: 1, duration: 0.45, ease: "power2.inOut", onUpdate: apply }, 3.35)
          .to({}, { duration: 0.15 });
      })));

      return () => {
        cancelled = true;
        ro.disconnect();
        mm.revert();
      };
    },
    { scope: root }
  );

  return (
    <section id="top" ref={root} className="hero" aria-labelledby="hero-title">
      <img
        className="hero__sky"
        src={asset("hero/mountains-1600.webp")}
        {...sources(SCENE.sky)}
        alt=""
        width="2560"
        height="2280"
        fetchPriority="high"
        aria-hidden="true"
      />
      <div className="hero__dim" aria-hidden="true" />

      {/* Cloud bank from the PDF hero (zip "Group 2147293491"), behind the desk. */}
      <div className="hero__cloud" aria-hidden="true">
        <img src={asset("hero/cloud-1.webp")} {...sources(SCENE.cloud)} alt="" width="2000" height="869" fetchPriority="high" />
      </div>
      {/* White fade over the top of the sky, behind the nav and headline. */}
      <div className="hero__fade" aria-hidden="true" />

      <div ref={stageRef} className="hero__stage" aria-hidden="true">
        <img className="hero__desk" src={asset("hero/desk.webp")} {...sources(SCENE.desk)} alt="" width="1800" height="1180" fetchPriority="high" />
        <img
          ref={laptopRef}
          className="hero__laptop"
          src={asset("hero/laptop.webp")}
          {...sources(SCENE.laptop)}
          alt=""
          width="1402"
          height="894"
          fetchPriority="high"
        />
      </div>

      {/* Live copy of the next section, mapped onto the laptop screen. */}
      <div ref={screenRef} className="hero__screen" aria-hidden="true" inert>
        <div className="hero__screen-wide">
          <PartnersIntro decorative />
        </div>
        <div className="hero__screen-real">
          <PartnersIntro decorative />
        </div>
      </div>

      <div className="hero__copy">
        <p className="hero__eyebrow">Financial services marketing · Melbourne, Australia</p>
        <h1 id="hero-title" className="hero__title" aria-label="Marketing made for financial professionals.">
          <span aria-hidden="true" className="hero__line">
            <Typed parts={LINE_1} />
          </span>
          <span aria-hidden="true" className="hero__line">
            <Typed parts={LINE_2} />
          </span>
        </h1>
        <p className="hero__sub">
          We plan, design and run the websites, content and campaigns that help mortgage brokers,
          <br /> accountants, financial advisers and conveyancers win the right clients.
        </p>
      </div>

      <div className="hero__ctas">
        <a href={CONTACT} className="btn btn--blue">
          Book a discovery call →
        </a>
        <a href="#partners" className="btn btn--navy">
          Find your profession ↓︎
        </a>
      </div>
    </section>
  );
}

