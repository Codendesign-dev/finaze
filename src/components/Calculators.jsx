import { useRef, useState } from "react";
import { gsap, ScrollTrigger, useGSAP, MQ, asset, useDeferredGSAP } from "../lib/gsap";
import { CALCULATORS as CALCULATORS_PAGE, PROFESSIONS, calculator } from "../lib/links";

// The first four calculators in each category on www.finaze.com.au/calculators/.
const CALCULATORS = [
  { id: "income-tax-calculator", aud: "accountants", title: "Income Tax Calculator", copy: "Estimate income tax and take-home pay using your income and selected tax details." },
  { id: "trust-distribution-calculator", aud: "accountants", title: "Trust Distribution Calculator", copy: "Explore how different trust distribution amounts may affect the beneficiaries’ estimated tax outcomes." },
  { id: "super-caps-calculator", aud: "accountants", title: "Super Caps Calculator", copy: "Compare planned super contributions with relevant caps to explore your available contribution room." },
  { id: "sole-trader-vs-company-calculator", aud: "accountants", title: "Sole Trader vs Company Calculator", copy: "Compare indicative tax outcomes for sole trader and company scenarios using business figures." },
  { id: "retirement-calculator", aud: "brokers", title: "Retirement Calculator", copy: "Explore an illustrative retirement savings projection using your balance, contributions and selected assumptions." },
  { id: "introductory-rate-loan", aud: "brokers", title: "Introductory Rate Loan", copy: "Explore estimated repayments during an introductory rate period and after that period ends." },
  { id: "vehicle-loan", aud: "brokers", title: "Vehicle Loan", copy: "Estimate vehicle loan repayments using the amount, rate, term and any balloon payment." },
  { id: "stamp-duty-broker", aud: "brokers", title: "Stamp Duty Broker", copy: "Estimate transfer duty on a property purchase to support your upfront cost planning." },
  { id: "foreign-buyer-surcharge-calculator", aud: "conveyancers", title: "Foreign Buyer Surcharge Calculator", copy: "Estimate additional property duty that may apply to foreign purchasers in selected jurisdictions." },
  { id: "off-the-plan-concession-calculator", aud: "conveyancers", title: "Off-the-Plan Concession Calculator", copy: "Explore how an eligible off-the-plan concession may affect dutiable value and estimated duty." },
  { id: "first-home-buyer-fhb-savings-calculator", aud: "conveyancers", title: "First Home Buyer Savings Calculator", copy: "Explore potential savings through first home buyer grants and concessions, subject to eligibility." },
  { id: "settlement-adjustment-calculator", aud: "conveyancers", title: "Settlement Adjustment Calculator", copy: "Estimate how eligible rates and outgoings may be apportioned between buyer and seller." },
];

// Each tab has its own "see more" button, pointing at that category on the live site.
const FILTERS = [
  { id: "all", label: "All Calculators", more: "See all calculators", href: CALCULATORS_PAGE },
  { id: "accountants", label: "Accountants", more: "See calculators for accountants", href: PROFESSIONS.accountants },
  { id: "brokers", label: "Mortgage Brokers", more: "See calculators for mortgage brokers", href: PROFESSIONS.brokers },
  { id: "conveyancers", label: "Conveyancers", more: "See calculators for conveyancers", href: PROFESSIONS.conveyancers },
];

const shows = (filter, c) => filter === "all" || c.aud === filter;

/**
 * finaze-7 PDF: heading, filter pills and calculator cards.
 * Filtering is a two-step transition that never takes cards out of the layout:
 *   1. the visible cards fade and drop slightly;
 *   2. the filter switches, the grid eases from its old height to the new one
 *      (clipped while it moves, so nothing overlaps the button below) and the
 *      new cards rise in with a stagger.
 */
export default function Calculators() {
  const root = useRef(null);
  const [tab, setTab] = useState("all"); // pill state — updates instantly
  const [filter, setFilter] = useState("all"); // card state — updates after the fade-out
  const pending = useRef(null);
  const anim = useRef(null);

  const { contextSafe } = useDeferredGSAP(
    () => {
      const q = gsap.utils.selector(root);
      const mm = gsap.matchMedia();
      mm.add(MQ.motion, () => {
        gsap.from(q(".calc__head > *, .calc__filters"), {
          y: 40,
          opacity: 0,
          stagger: 0.1,
          duration: 0.9,
          ease: "power3.out",
          scrollTrigger: { trigger: root.current, start: "top 80%", toggleActions: "play none none reverse" },
        });
        gsap.from(q(".calc__grid"), {
          y: 60,
          opacity: 0,
          duration: 0.9,
          ease: "power3.out",
          scrollTrigger: { trigger: q(".calc__grid")[0], start: "top 85%", toggleActions: "play none none reverse" },
        });
      });
      return () => mm.revert();
    },
    { scope: root }
  );

  // Step 2: runs after React has rendered the new set of cards.
  useGSAP(
    () => {
      if (!pending.current) return;
      const { height, prev } = pending.current;
      pending.current = null;
      gsap.set(prev, { clearProps: "transform,opacity" });
      const grid = root.current.querySelector(".calc__grid");
      const cards = root.current.querySelectorAll(".ccard:not([hidden])");
      const target = grid.offsetHeight;
      anim.current = gsap
        .timeline({
          onComplete: () => {
            gsap.set(grid, { clearProps: "height,overflow" });
            ScrollTrigger.refresh();
          },
        })
        .set(grid, { overflow: "hidden" })
        .fromTo(grid, { height }, { height: target, duration: 0.5, ease: "power3.inOut" }, 0)
        .fromTo(
          cards,
          { opacity: 0, y: 28, scale: 0.97 },
          { opacity: 1, y: 0, scale: 1, duration: 0.55, stagger: 0.07, ease: "power3.out", clearProps: "transform,opacity" },
          0.08
        );
    },
    { dependencies: [filter], scope: root }
  );

  // Step 1: fade out what is showing, then switch the filter.
  const choose = contextSafe((id) => {
    if (id === tab) return;
    setTab(id);
    anim.current?.progress(1);
    const grid = root.current.querySelector(".calc__grid");
    if (window.matchMedia(MQ.reduced).matches) return setFilter(id);
    const height = grid.offsetHeight;
    const current = root.current.querySelectorAll(".ccard:not([hidden])");
    anim.current = gsap.to(current, {
      opacity: 0,
      y: 14,
      scale: 0.97,
      duration: 0.22,
      stagger: 0.03,
      ease: "power2.in",
      // Leave them faded: clearing here would show the old cards for a frame
      // before React swaps them. Step 2 clears them in the same tick it fades
      // the new set in, so nothing flashes.
      onComplete: () => {
        pending.current = { height, prev: current };
        setFilter(id);
      },
    });
  });

  const more = FILTERS.find((f) => f.id === tab);

  return (
    <section id="calculators" ref={root} className="calc" aria-labelledby="calc-title">
      <div className="container">
        <div className="calc__head">
          <p className="eyebrow">Calculators That Work Harder</p>
          <h2 id="calc-title" className="h2">
            Calculators that turn visitors into enquiries
          </h2>
          <p className="calc__lede">
            Give website visitors something useful before they get in touch. Our calculators for mortgage brokers, accountants and conveyancers send every enquiry straight to your inbox.
          </p>
        </div>

        <div className="calc__filters" role="group" aria-label="Filter calculators">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              className={`calc__filter ${tab === f.id ? "is-active" : ""}`}
              aria-pressed={tab === f.id}
              onClick={() => choose(f.id)}
            >
              {f.label}
            </button>
          ))}
        </div>

        <ul className="calc__grid" aria-live="polite">
          {CALCULATORS.map((c) => (
            <li key={c.id} className="ccard" hidden={!shows(filter, c)}>
              <span className="ccard__icon" aria-hidden="true">
                <img src={asset("brand/mark-blue.svg")} alt="" width="41" height="44" />
              </span>
              <h3>{c.title}</h3>
              <p>{c.copy}</p>
              <a href={calculator(c.id)} className="ccard__btn">
                Calculator
                <span className="sr-only">: {c.title}</span>
              </a>
            </li>
          ))}
        </ul>

        <p className="calc__more">
          <a href={more.href} className="btn btn--ghost-blue calc__more-btn">
            {more.more} →
          </a>
        </p>
      </div>
    </section>
  );
}
