import { useRef } from "react";
import { gsap, MQ, asset, useDeferredGSAP } from "../lib/gsap";
import { CONTACT } from "../lib/links";
import AuditForm from "./AuditForm";

/** Reference 40s–54s: two logo rows drifting in opposite directions, then the blue CTA. */
export default function LogosCta() {
  const root = useRef(null);

  useDeferredGSAP(
    () => {
      const q = gsap.utils.selector(root);
      const mm = gsap.matchMedia();
      mm.add(MQ.motion, () => {
        gsap.from(q(".cta__inner > *"), {
          y: 60,
          opacity: 0,
          stagger: 0.12,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: { trigger: q(".cta")[0], start: "top 75%", toggleActions: "play none none reverse" },
        });
      });
      return () => mm.revert();
    },
    { scope: root }
  );

  return (
    <div ref={root}>
      <section className="logos" aria-labelledby="logos-title">
        <h2 id="logos-title" className="eyebrow logos__title">
          Some of the financial professionals we work with
        </h2>
        {[1, 2].map((r) => (
          <div key={r} className={`logos__row logos__row--${r}`}>
            <div className="logos__track">
              {[0, 1].map((k) => (
                <img
                  key={k}
                  src={asset(`brand/logos-row${r}.webp`)}
                  alt={
                    k === 0
                      ? r === 1
                        ? "Signature Tax Advisory, Gold Leaf Conveyancers, Master Key, TaxPurpose, Knote, Eagle Peak Conveyancing"
                        : "Credit Hub, AAD Taxation, FirstSource Finance, SMH, Finleaf Finance, Candid Books"
                      : ""
                  }
                  width="1338"
                  height="140"
                  loading="lazy"
                />
              ))}
            </div>
          </div>
        ))}
      </section>

      <section id="contact" className="cta" aria-labelledby="cta-title">
        <div className="container cta__inner">
          <p className="cta__eyebrow">Start with a conversation</p>
          <h2 id="cta-title" className="cta__title">
            Your industry, already understood.
          </h2>
          <p className="cta__text">
            Book a no-obligation discovery call. Tell us about your business and goals, and we&rsquo;ll show you how
            Finaze would approach your marketing.
          </p>
          <a href={CONTACT} className="btn cta__btn">
            Book a discovery call →
          </a>
        </div>
        <div className="cta__bar">
          <div className="container cta__bar-inner">
            <p className="cta__note">
              <span aria-hidden="true">+</span>
              Not ready to talk yet? Request a free marketing audit. We&rsquo;ll review your website, search presence
              and social media, then send you specific recommendations you can act on.
            </p>
            <AuditForm />
          </div>
        </div>
      </section>
    </div>
  );
}
