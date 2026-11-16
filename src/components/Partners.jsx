import { useRef } from "react";
import { gsap, MQ, asset, useDeferredGSAP } from "../lib/gsap";
import { CONTACT, PROFESSIONS } from "../lib/links";

const CARDS = [
  { img: "partners/mortgage.webp", title: "Mortgage Brokers", link: "Marketing for mortgage brokers", href: PROFESSIONS.brokers, copy: "Clients compare rates, then choose a broker they trust. We build that trust with a website and SEO that get you found, social media and email that keep you front of mind, and calculators that let buyers work through the numbers before they call." },
  { img: "partners/accountants.webp", title: "Accountants & Tax Agents", link: "Marketing for accountants", href: PROFESSIONS.accountants, copy: "Tax time is busy. The rest of the year does not have to be quiet. We keep your practice visible all year with SEO, social media and email, plus calculators on your website that stay useful well beyond tax time." },
  { img: "partners/advisers.webp", title: "Financial Advisers", copy: "Good advice is hard to explain in a few lines. We help you explain it clearly through your website, content, LinkedIn and email, so the right clients understand your value before the first meeting." },
  { img: "partners/conveyancers.webp", title: "Conveyancers", link: "Marketing for conveyancers", href: PROFESSIONS.conveyancers, copy: "Much of your work comes through referrals. We keep your name in front of agents, brokers and past clients with social media and email, while SEO and calculators on your website reach buyers checking their costs." },
];

// Decorative copies sit on the hero laptop screen, so phones need smaller files.
function CardRow({ cards, className = "", eager = false, decorative = false }) {
  return (
    <ul className={`partners__row ${className}`}>
      {cards.map((c) => (
        <li key={c.title} className="pcard">
          <img
            src={asset(c.img)}
            srcSet={`${asset(c.img.replace(".webp", "-640.webp"))} 640w, ${asset(c.img)} 1100w`}
            sizes={decorative ? "(max-width: 1023px) 340px, (max-width: 1440px) 45vw, 665px" : "(max-width: 640px) calc(100vw - 40px), (max-width: 1440px) 45vw, 665px"}
            alt=""
            width="1100"
            height="825"
            loading={eager ? "eager" : "lazy"}
            // The real section sits hidden under the hero until the zoom hands
            // over, so its images must not compete with the hero scene.
            fetchPriority={decorative ? "auto" : "low"}
          />
          <h3>{c.title}</h3>
          <p>{c.copy}</p>
          {c.href && (
            <a href={c.href} className="pcard__link">
              {c.link} <span aria-hidden="true">→</span>
            </a>
          )}
        </li>
      ))}
    </ul>
  );
}

/**
 * Heading + first row of cards. Rendered twice: inside the hero's laptop
 * screen (decorative, scaled down) and as the top of the real section, so the
 * zoom can hand over to the real page without a visible change.
 */
export function PartnersIntro({ decorative = false }) {
  const Heading = decorative ? "p" : "h2";
  return (
    <div className="container partners__intro">
      <div className="partners__head">
        <p className="eyebrow">Who we work with</p>
        <Heading id={decorative ? undefined : "partners-title"} className="h2">
          Find your profession
        </Heading>
        <p className="partners__tagline">
          Each profession has its own clients, rules and busy seasons, so each one gets <br /> its own approach. Choose yours to see how we can help.
        </p>
      </div>
      <CardRow cards={CARDS.slice(0, 2)} className="partners__row--1" eager decorative={decorative} />
    </div>
  );
}

/**
 * Reference 7s–13s: the section is revealed by the hero's laptop zoom (see
 * Hero.jsx); the second pair of cards then grows from ~40% as it scrolls up.
 */
export default function Partners() {
  const root = useRef(null);

  useDeferredGSAP(
    () => {
      const q = gsap.utils.selector(root);
      const mm = gsap.matchMedia();

      mm.add(MQ.desktop, () => {
        gsap.fromTo(
          q(".partners__row--2 .pcard"),
          { scale: 0.42, y: 80 },
          { scale: 1, y: 0, ease: "power1.out", scrollTrigger: { trigger: q(".partners__row--2")[0], start: "top bottom", end: "top 35%", scrub: 1 } }
        );
      });

      mm.add(MQ.mobile, () => {
        q(".partners__row--2 .pcard").forEach((el) =>
          gsap.fromTo(el, { scale: 0.8, opacity: 0 }, { scale: 1, opacity: 1, ease: "none", scrollTrigger: { trigger: el, start: "top 95%", end: "top 55%", scrub: 1 } })
        );
      });

      return () => mm.revert();
    },
    { scope: root }
  );

  return (
    <section id="partners" ref={root} className="partners" aria-labelledby="partners-title">
      <PartnersIntro />
      <div className="container">
        <CardRow cards={CARDS.slice(2)} className="partners__row--2" />
        <div className="partners__cta">
          <a href={CONTACT} className="btn btn--ghost-blue">
            Book a discovery call →
          </a>
          <p>Work across more than one area? Tell us about your practice and we&rsquo;ll suggest where to start.</p>
        </div>
      </div>
    </section>
  );
}
