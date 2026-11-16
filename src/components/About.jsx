import { useRef } from "react";
import { gsap, MQ, asset, useDeferredGSAP } from "../lib/gsap";
import GlassMark from "./GlassMark";
import { CONTACT } from "../lib/links";

/**
 * Reference 13s–17s: the section arrives zoomed-in and settles to scale 1;
 * the Finaze mark (3D, see GlassMark) turns inside the card,
 * which gets one mirror flash on arrival; counters tick up.
 */
export default function About() {
  const root = useRef(null);

  useDeferredGSAP(
    () => {
      const q = gsap.utils.selector(root);
      const mm = gsap.matchMedia();

      mm.add(MQ.motion, () => {
        gsap.fromTo(
          q(".about__inner"),
          { scale: 1.32, transformOrigin: "50% 30%" },
          { scale: 1, ease: "power2.out", scrollTrigger: { trigger: root.current, start: "top bottom", end: "top 15%", scrub: 1 } }
        );
        // One mirror flash across the card the first time it comes into view.
        gsap.fromTo(
          q(".about__shine"),
          { xPercent: -100, autoAlpha: 1 },
          {
            xPercent: 100,
            duration: 1.3,
            ease: "power2.inOut",
            delay: 0.2,
            immediateRender: false,
            onComplete: () => gsap.set(q(".about__shine"), { autoAlpha: 0 }),
            scrollTrigger: { trigger: q(".about__card")[0], start: "top 70%", once: true },
          }
        );
        q("[data-count]").forEach((el) => {
          const to = Number(el.dataset.count);
          gsap.fromTo(
            el,
            { textContent: 0 },
            { textContent: to, duration: 1.6, ease: "power2.out", snap: { textContent: 1 }, scrollTrigger: { trigger: el, start: "top 85%", toggleActions: "play none none reverse" } }
          );
        });
      });

      return () => mm.revert();
    },
    { scope: root }
  );

  return (
    <section id="about" ref={root} className="about" aria-labelledby="about-title">
      <div className="container about__inner">
        <div className="about__copy">
          <p className="eyebrow">About Finaze</p>
          <h2 id="about-title" className="h2">
            We know finance.
            <br />
            We know marketing.
          </h2>
          <p className="about__text">
            Finaze is a Melbourne-based marketing agency for financial professionals across Australia. We help mortgage brokers, accountants, financial advisers and conveyancers build their brand, earn client trust and grow their business.
          </p>
          <p className="about__text">
            We understand how your clients make decisions, and the rules that shape what you can say. That knowledge sits behind every website, campaign and post we create.
          </p>
          <dl className="about__stats">
            <div>
              <dt>
                <span data-count="10">10</span>+
              </dt>
              <dd>years in financial services marketing</dd>
            </div>
            <div>
              <dt>
                <span data-count="50">50</span>+
              </dt>
              <dd>financial services clients across Australia</dd>
            </div>
          </dl>
          <div className="about__foot">
            <a href={CONTACT} className="btn btn--ghost-blue">
              Book a discovery call →
            </a>
            <p>
              <b>From strategy to delivery</b>
              Brand, website, content and campaigns, handled by one team.
            </p>
          </div>
        </div>

        <figure className="about__card">
          <img className="about__frame" src={asset("brand/about-card.webp")} alt="" width="900" height="884" loading="lazy" />
          <div className="about__stage" aria-hidden="true">
            <GlassMark />
          </div>
          <span className="about__shine" aria-hidden="true" />
        </figure>
      </div>
    </section>
  );
}
