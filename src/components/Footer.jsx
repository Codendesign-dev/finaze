import Logo from "./Logo";
import ParticleWordmark from "./ParticleWordmark";
import { CODENDESIGN, COMPANY, EMAIL, SERVICES, SOCIAL as SOCIAL_LINKS, WHO_WE_SERVE } from "../lib/links";

const COLS = [
  // Footer lists services alphabetically, as in the copy doc.
  { title: "Services", links: [...SERVICES].sort((x, y) => x.label.localeCompare(y.label)) },
  { title: "Company", links: COMPANY },
  { title: "Who We Serve", links: WHO_WE_SERVE },
];

const SOCIAL = [
  ["Facebook", "M14 8h2V5h-2.5C11 5 10 6.6 10 8.7V10H8v3h2v6h3v-6h2.3l.5-3H13V9c0-.6.3-1 1-1z"],
  ["LinkedIn", "M6.5 9.5h2.8V18H6.5zM7.9 5.5a1.6 1.6 0 110 3.2 1.6 1.6 0 010-3.2zM11 9.5h2.7v1.2c.4-.7 1.3-1.4 2.7-1.4 2.8 0 3.3 1.8 3.3 4.2V18h-2.8v-4c0-1 0-2.2-1.4-2.2s-1.6 1-1.6 2.1V18H11z"],
  ["Instagram", "M8 5h8a3 3 0 013 3v8a3 3 0 01-3 3H8a3 3 0 01-3-3V8a3 3 0 013-3zm4 4a3 3 0 100 6 3 3 0 000-6zm4.3-1.6a.8.8 0 100 1.6.8.8 0 000-1.6z"],
];

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer__grid">
        <div className="footer__brand">
          <a href="#top" className="footer__logo" aria-label="Finaze home">
            <Logo tone="white" />
          </a>
          <p>Marketing that speaks finance.</p>
        </div>
        {COLS.map((c) => (
          <nav key={c.title} className="footer__col" aria-label={c.title}>
            <h3>{c.title}</h3>
            <ul>
              {c.links.map((l) => (
                <li key={l.label}>
                  <a href={l.href}>{l.label}</a>
                </li>
              ))}
            </ul>
            {c.title === "Company" && (
              <ul className="footer__social">
                {SOCIAL.map(([label, d]) => (
                  <li key={label}>
                    <a href={SOCIAL_LINKS[label]} aria-label={label} target="_blank" rel="noopener noreferrer">
                      <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
                        <path d={d} fill="currentColor" />
                      </svg>
                    </a>
                  </li>
                ))}
              </ul>
            )}
            {c.title === "Who We Serve" && (
              <address className="footer__contact">
                <h3>Contact Us</h3>
                <a href={`mailto:${EMAIL}`}>{EMAIL}</a>
                <span>
                  Level 6.03, 87 Overton Road,
                  <br /> Williams Landing VIC 3027
                </span>
              </address>
            )}
          </nav>
        ))}
      </div>

      <div className="container">
        <ParticleWordmark />
      </div>

      <div className="container footer__legal">
        <p>&copy; 2026 <a href={CODENDESIGN} target="_blank" rel="noopener">
            Code and Design Pty Ltd
          </a> trading as Finaze &middot; ABN 93 623 205 630</p>
        <p>
          The information and calculators on this website are general in nature. They are not financial, credit, tax or
          legal advice, and do not take into account your objectives, financial situation or needs. We develop marketing
          campaigns with financial services communication requirements in mind, including ASIC Regulatory Guide 234.
        </p>
      </div>
    </footer>
  );
}
