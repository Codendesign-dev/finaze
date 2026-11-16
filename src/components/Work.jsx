import { useRef, useState } from "react";
import { gsap, MQ, asset, useDeferredGSAP } from "../lib/gsap";

// Knote copy is from the copy doc. Candid Books and Credit Hub summaries are
// drafted from their own websites; confirm the services with each client.
const PROJECTS = [
  {
    name: "Knote",
    tag: "Private Lending",
    summary:
      "Knote is a specialist lender in second mortgages, caveat loans and bridging finance. We run its SEO and Google Ads, built dedicated landing pages for each loan type, and produce email and LinkedIn campaigns for the brokers and accountants who refer clients to Knote.",
    big: "work/knote-laptop.webp",
    small: "work/knote-phone.webp",
  },
  {
    name: "Candid Books",
    tag: "Accounting",
    summary:
      "Candid Books is an accounting and tax practice serving businesses and individuals from Williams Landing, Melton and Bacchus Marsh. We help keep the practice visible in local search and on social media, so people looking for an accountant in Melbourne’s west find it and book a consultation.",
    big: "work/candid-laptop.webp",
    small: "work/candid-phone.webp",
  },
  {
    name: "Credit Hub",
    tag: "Mortgage Broking",
    summary:
      "Credit Hub is a Melbourne mortgage and finance broker with more than 20 years’ experience across home, business, commercial and asset finance. We support its search visibility, content and lead capture, so its calculators, guides and loan health checks bring in steady enquiries.",
    big: "work/credithub-desktop.webp",
    small: "work/credithub-phone.webp",
  },
];

/**
 * Reference 30s–40s: arrow-driven carousel. All slides share one grid cell so
 * nothing reflows. Changing slide builds the next project's photos out of
 * small square tiles that pop in as a staggered sweep from the arrow's side;
 * the caption cross-fades with a short slide.
 */
/**
 * Cover a frame with a grid of square tiles, each showing its slice of the
 * frame's (hidden) image via background-position.
 */
function buildTiles(frame) {
  const img = frame.querySelector("img");
  const w = frame.clientWidth;
  const h = frame.clientHeight;
  const size = Math.max(28, Math.round(Math.min(w, h) / 9));
  const cols = Math.ceil(w / size);
  const rows = Math.ceil(h / size);
  const layer = document.createElement("div");
  layer.className = "work__tiles";
  layer.style.gridTemplateColumns = `repeat(${cols}, ${size}px)`;
  layer.style.gridAutoRows = `${size}px`;
  const src = img.currentSrc || img.src;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const t = document.createElement("span");
      t.style.backgroundImage = `url("${src}")`;
      t.style.backgroundSize = `${w}px ${h}px`;
      t.style.backgroundPosition = `${-c * size}px ${-r * size}px`;
      layer.appendChild(t);
    }
  }
  frame.appendChild(layer);
  return { layer, tiles: [...layer.children], cols, rows };
}

export default function Work() {
  const root = useRef(null);
  const [index, setIndex] = useState(0);
  const busy = useRef(false);

  const { contextSafe } = useDeferredGSAP(
    () => {
      const q = gsap.utils.selector(root);
      const mm = gsap.matchMedia();
      mm.add(MQ.motion, () => {
        gsap.from(q(".work__head > *, .work__stage"), {
          y: 60,
          opacity: 0,
          stagger: 0.1,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: { trigger: root.current, start: "top 75%", toggleActions: "play none none reverse" },
        });
      });
      // Only the first slide starts visible.
      gsap.set(q(".work__slide"), { autoAlpha: (i) => (i === 0 ? 1 : 0) });
      return () => mm.revert();
    },
    { scope: root }
  );

  const go = contextSafe((dir) => {
    if (busy.current) return;
    const q = gsap.utils.selector(root);
    const slides = q(".work__slide");
    const next = (index + dir + PROJECTS.length) % PROJECTS.length;
    const from = slides[index];
    const to = slides[next];
    setIndex(next);

    if (window.matchMedia(MQ.reduced).matches) {
      gsap.set(from, { autoAlpha: 0 });
      gsap.set(to, { autoAlpha: 1 });
      return;
    }

    busy.current = true;
    const sel = (el, s) => el.querySelectorAll(s);
    const toFrames = [...sel(to, ".work__frame")];
    const toImgs = sel(to, ".work__frame img");
    const mosaics = toFrames.map(buildTiles);

    const tl = gsap
      .timeline({
        onComplete: () => {
          gsap.set(toImgs, { visibility: "visible" });
          mosaics.forEach((m) => m.layer.remove());
          gsap.set(from, { autoAlpha: 0, zIndex: 0 });
          gsap.set(sel(from, ".work__frame img, .work__meta > *"), { clearProps: "all" });
          busy.current = false;
        },
      })
      // The new slide sits on top with its photos hidden; only its tiles show,
      // so the old photos stay visible underneath until covered.
      .set(to, { autoAlpha: 1, zIndex: 2 })
      .set(from, { zIndex: 1 })
      .set(toImgs, { visibility: "hidden" })
      // Old photos settle back slightly while being covered.
      .to(sel(from, ".work__frame img"), { scale: 0.97, filter: "brightness(0.85)", duration: 0.9, ease: "power2.inOut" }, 0)
      // Caption: old lines lift out, new lines rise in.
      .to(sel(from, ".work__meta > *"), { y: -16, opacity: 0, duration: 0.35, stagger: 0.04, ease: "power2.in" }, 0)
      .fromTo(sel(to, ".work__meta > *"), { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, stagger: 0.07, ease: "power3.out" }, 0.5);

    // Square tiles pop in as a diagonal sweep from the side the arrow points to.
    mosaics.forEach((m, i) =>
      tl.fromTo(
        m.tiles,
        { scale: 0, opacity: 0, rotation: dir * 12 },
        {
          scale: 1,
          opacity: 1,
          rotation: 0,
          duration: 0.42,
          ease: "power2.out",
          stagger: { grid: [m.rows, m.cols], from: dir > 0 ? "start" : "end", amount: 0.75 },
        },
        i * 0.12
      )
    );
  });

  return (
    <section id="work" ref={root} className="work" aria-labelledby="work-title" aria-roledescription="carousel">
      <div className="container">
        <div className="work__head">
          <div>
            <p className="eyebrow">Selected work</p>
            <h2 id="work-title" className="h2">
              Recent work for financial professionals
            </h2>
          </div>
          <p className="lede">
            Search, advertising and campaign work for financial businesses across Australia.
          </p>
        </div>

        <div className="work__stage">
          <div className="work__slides">
            {PROJECTS.map((p, i) => (
              <article
                key={p.name}
                className="work__slide"
                aria-roledescription="slide"
                aria-label={`${i + 1} of ${PROJECTS.length}: ${p.name}`}
                aria-hidden={i !== index}
              >
                <div className="work__media">
                  <div className="work__frame work__frame--big">
                    <img
                      src={asset(p.big)}
                      srcSet={`${asset(p.big.replace(".webp", "-640.webp"))} 640w, ${asset(p.big)} 1004w`}
                      sizes="(max-width: 640px) calc(100vw - 40px), 62vw"
                      alt={`${p.name} website on a laptop`}
                      width="1004"
                      height="641"
                      loading="lazy"
                    />
                  </div>
                  <div className="work__frame work__frame--small">
                    <img src={asset(p.small)} alt={`${p.name} website on a phone`} width="499" height="641" loading="lazy" />
                  </div>
                </div>
                <div className="work__meta">
                  <div>
                    <p className="work__tag">{p.tag}</p>
                    <h3>{p.name}</h3>
                  </div>
                  <p className="work__summary">{p.summary}</p>
                </div>
              </article>
            ))}
          </div>

          <div className="work__actions">
            {/* "See more work →" returns once a work page exists (copy doc, open item 4). */}
            <button type="button" className="work__arrow" aria-label="Previous project" onClick={() => go(-1)}>
              <svg viewBox="0 0 20 20" width="16" height="16" aria-hidden="true">
                <path d="M16 10H4m5-5l-5 5 5 5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <button type="button" className="work__arrow" aria-label="Next project" onClick={() => go(1)}>
              <svg viewBox="0 0 20 20" width="16" height="16" aria-hidden="true">
                <path d="M4 10h12m-5-5l5 5-5 5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
