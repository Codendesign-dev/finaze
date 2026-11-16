import { useRef } from "react";
import { gsap, MQ, useDeferredGSAP } from "../lib/gsap";
import { service } from "../lib/links";

const SERVICES = [
  ["Website Design & Development", "A clear, fast website, designed and built to explain what you do and make it easy to get in touch.", "Explore website design"],
  ["SEO & AI Search Visibility", "Visibility on Google and in AI search tools, so people find you when they look for a broker, accountant, adviser or conveyancer.", "Explore SEO & AI search"],
  ["Paid Advertising", "Google Ads that reach people searching for your services, plus Facebook, Instagram and LinkedIn campaigns that introduce you to the right audiences, within a budget you set.", "Explore paid advertising"],
  ["Social Media Management", "Regular posts that keep you in front of clients and referral partners, written and scheduled for you.", "Explore social media management"],
  ["Email & SMS Marketing", "Timely emails and messages that keep you in touch with past clients and bring them back when they need you.", "Explore email & SMS"],
  ["Content Strategy & Copywriting", "A plan for what to say, and words that answer your clients’ questions clearly, from website pages to articles and guides.", "Explore content and copywriting"],
  ["Brand Strategy & Identity", "A clear position and a visual identity that look as considered as the work behind them.", "Explore brand strategy"]
];

/** Reference 17s–21s: top row slides in from the right, bottom row from the left. */
export default function Services() {
  const root = useRef(null);

  useDeferredGSAP(
    () => {
      const q = gsap.utils.selector(root);
      const mm = gsap.matchMedia();

      mm.add(MQ.desktop, () => {
        const st = { trigger: root.current, start: "top bottom", end: "top 20%", scrub: 1 };
        gsap.fromTo(q(".services__row--1"), { xPercent: 22 }, { xPercent: 0, ease: "power2.out", scrollTrigger: st });
        gsap.fromTo(q(".services__row--2"), { xPercent: -26 }, { xPercent: 0, ease: "power2.out", scrollTrigger: { ...st } });
      });

      mm.add(MQ.motion, () => {
        gsap.from(q(".services__head > *"), {
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
    <section id="services" ref={root} className="services" aria-labelledby="services-title">
      <div className="container">
        <div className="services__head">
          <p className="eyebrow">Our services</p>
          <h2 id="services-title" className="h2">
            What we do
          </h2>
          <p className="lede">
            Choose one service or bring several together under one plan. Each is shaped around <br />the way financial professionals win and keep clients.
          </p>
        </div>
        {[SERVICES.slice(0, 4), SERVICES.slice(4)].map((row, ri) => (
          <ul key={ri} className={`services__row services__row--${ri + 1}`}>
            {row.map(([title, copy, cta]) => (
              <li key={title} className="scard">
                <h3>{title}</h3>
                <p>{copy}</p>
                <a href={service(title)}>
                  {cta}
                  <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
                    <path d="M1.5 6h9M7 2.5L10.5 6 7 9.5" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </a>
              </li>
            ))}
          </ul>
        ))}
      </div>
    </section>
  );
}
