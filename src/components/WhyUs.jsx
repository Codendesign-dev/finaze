import { useRef } from "react";
import { gsap, MQ, useDeferredGSAP } from "../lib/gsap";

const POINTS = [
  ["We understand how trust converts", "Financial decisions are rarely made on impulse. People look for proof, clarity and reassurance at every step, so we plan for that from the start."],
  ["Credibility comes before clicks", "Attention is easy to buy. Credibility is not. Every message, image and page we create should reflect the expertise behind it."],
  ["Ambition, applied with judgement", "Regulation does not have to make marketing forgettable. We bring clear, confident ideas and the care that financial services communication requires."],
];

/**
 * Reference 21s–27s: points 01–03 build up one by one beside the "wrong
 * agency" card, then the tagline travels sideways with scroll.
 */
export default function WhyUs() {
  const root = useRef(null);

  useDeferredGSAP(
    () => {
      const q = gsap.utils.selector(root);
      const mm = gsap.matchMedia();

      mm.add(MQ.motion, () => {
        gsap.from(q(".why__point"), {
          y: 60,
          opacity: 0,
          stagger: 0.18,
          duration: 0.9,
          ease: "power3.out",
          scrollTrigger: { trigger: q(".why__list")[0], start: "top 80%", toggleActions: "play none none reverse" },
        });
        gsap.from(q(".why__side > *"), {
          y: 40,
          opacity: 0,
          stagger: 0.12,
          duration: 0.9,
          ease: "power3.out",
          scrollTrigger: { trigger: q(".why__side")[0], start: "top 80%", toggleActions: "play none none reverse" },
        });
        // Divider: the line draws down from the star as the section scrolls in.
        gsap.fromTo(
          q(".why__line"),
          { scaleY: 0 },
          { scaleY: 1, ease: "none", scrollTrigger: { trigger: q(".why__grid")[0], start: "top 75%", end: "bottom 60%", scrub: 0.6 } }
        );
        gsap.from(q(".why__star"), {
          scale: 0,
          rotation: -90,
          duration: 1,
          ease: "back.out(2)",
          scrollTrigger: { trigger: q(".why__grid")[0], start: "top 80%", toggleActions: "play none none reverse" },
        });
        gsap.fromTo(
          q(".marquee-text__track"),
          { xPercent: 12 },
          { xPercent: -48, ease: "none", scrollTrigger: { trigger: q(".marquee-text")[0], start: "top bottom", end: "bottom top", scrub: 0.6 } }
        );
      });

      return () => mm.revert();
    },
    { scope: root }
  );

  return (
    <section ref={root} className="why" aria-labelledby="why-title">
      <div className="container why__grid">
        <ol className="why__list">
          {POINTS.map(([title, copy], i) => (
            <li key={title} className="why__point">
              <span className="why__num" aria-hidden="true">
                0{i + 1}
              </span>
              <div>
                <h3>{title}</h3>
                <p>{copy}</p>
              </div>
            </li>
          ))}
        </ol>
        <span className="why__divider" aria-hidden="true">
          <svg className="why__star" viewBox="0 0 24 24" width="24" height="24">
            <path d="M12 0C12.7 6.6 17.4 11.3 24 12 17.4 12.7 12.7 17.4 12 24 11.3 17.4 6.6 12.7 0 12 6.6 11.3 11.3 6.6 12 0Z" fill="currentColor" />
          </svg>
          <span className="why__line" />
        </span>
        <div className="why__side">
          <p className="eyebrow">Why Finaze</p>
          <h2 id="why-title" className="h2">
            Your reputation comes first
          </h2>
          <div className="why__card">
            <h3>
              Trust is built before the <br />first conversation
            </h3>
            <p>
              Before a prospect contacts you, they have usually checked your website, reviews, search results and credentials. We make sure each one tells the same story: you are the right choice.
            </p>
          </div>
        </div>
      </div>

      <div className="marquee-text" aria-hidden="true">
        <p className="marquee-text__track">
          Marketing that speaks finance.&nbsp;&nbsp;&nbsp;Marketing that speaks finance.&nbsp;&nbsp;&nbsp;Marketing that speaks finance.
        </p>
      </div>
    </section>
  );
}
