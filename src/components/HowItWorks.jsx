import { useRef } from "react";
import { gsap, MQ, asset, useDeferredGSAP } from "../lib/gsap";

const STEPS = [
  ["n01", "Find leverage", "We learn your business and look past the brief to find what is holding growth back: unclear positioning, uneven enquiries or a website that no longer reflects you."],
  ["n02", "Shape direction", "We turn what we find into a focused plan, setting out the message, channels and priorities most likely to make a difference."],
  ["n03", "Create momentum", "Our team delivers across brand, content, digital and advertising, then refines the work based on results, not assumptions."],
];

/** Reference 27s–30s: the textured 01/02/03 rise out from behind each card. */
export default function HowItWorks() {
  const root = useRef(null);

  useDeferredGSAP(
    () => {
      const q = gsap.utils.selector(root);
      const mm = gsap.matchMedia();
      mm.add(MQ.motion, () => {
        gsap
          .timeline({ scrollTrigger: { trigger: q(".how__grid")[0], start: "top 85%", end: "top 40%", scrub: 1 } })
          .from(q(".how__card"), { y: 80, opacity: 0, stagger: 0.15, ease: "power2.out" }, 0)
          .from(q(".how__num"), { yPercent: 100, stagger: 0.15, ease: "power2.out" }, 0.2);
        gsap.from(q(".how__head > *"), {
          y: 40,
          opacity: 0,
          stagger: 0.1,
          duration: 0.9,
          ease: "power3.out",
          scrollTrigger: { trigger: root.current, start: "top 80%", toggleActions: "play none none reverse" },
        });
      });
      return () => mm.revert();
    },
    { scope: root }
  );

  return (
    <section id="how" ref={root} className="how" aria-labelledby="how-title">
      <div className="container">
        <div className="how__head">
          <p className="eyebrow">How we work</p>
          <h2 id="how-title" className="h2">
            Strategy first. Then everything earns its place.
          </h2>
          <p className="lede">Three steps, from the first conversation to work in market.</p>
        </div>
        <ol className="how__grid">
          {STEPS.map(([img, title, copy], i) => (
            <li key={title} className="how__item">
              <span className="how__num-clip" aria-hidden="true">
                <img className="how__num" src={asset(`how/${img}.webp`)} alt="" loading="lazy" />
              </span>
              <div className="how__card">
                <h3>
                  <span className="sr-only">Step {i + 1}: </span>
                  {title}
                </h3>
                <p>{copy}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
