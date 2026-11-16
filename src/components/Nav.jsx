import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Logo from "./Logo";
import { CALCULATORS, CONTACT, SERVICES, WHO_WE_SERVE } from "../lib/links";

const LINKS = [
  { label: "Services", menu: SERVICES },
  { label: "Who We Serve", menu: WHO_WE_SERVE },
  { href: CALCULATORS, label: "Calculators" },
  { href: "#how", label: "How We Work" },
  { href: "#about", label: "About Us" },
  { href: CONTACT, label: "Contact Us" },
];

const menuId = (label, where) => `${where}-${label.toLowerCase().replace(/W+/g, "-")}-menu`;

/** The link list, shared by the desktop bar and the mobile drawer. */
function MenuList({ where, sub, setSub, close }) {
  return (
    <ul>
      {LINKS.map((l) => (
        <li key={l.label} className={l.menu ? "has-menu" : undefined}>
          {l.menu ? (
            <>
              <button
                type="button"
                className="nav__link"
                aria-expanded={sub === l.label}
                aria-controls={menuId(l.label, where)}
                onClick={() => setSub((v) => (v === l.label ? null : l.label))}
              >
                {l.label}
                <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true">
                  <path d="M2 3.5l3 3 3-3" fill="none" stroke="currentColor" strokeWidth="1.5" />
                </svg>
              </button>
              <ul id={menuId(l.label, where)} className={`nav__menu ${sub === l.label ? "is-open" : ""}`}>
                {l.menu.map((m) => (
                  <li key={m.label}>
                    <a href={m.href} onClick={close}>
                      {m.label}
                    </a>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <a href={l.href} className="nav__link" onClick={close}>
              {l.label}
            </a>
          )}
        </li>
      ))}
    </ul>
  );
}

/**
 * Sticky header (fixed; frosted once the page scrolls). Desktop: centred link bar. Below 1200px: a full-screen drawer, portalled to
 * <body> because the hero (and the nav inside it) carries GSAP transforms,
 * which would otherwise trap a position: fixed overlay inside the header.
 */
export default function Nav() {
  const [open, setOpen] = useState(false);
  const [sub, setSub] = useState(null); // label of the open dropdown
  const [stuck, setStuck] = useState(false); // scrolled: give the bar a background
  const [client, setClient] = useState(false); // the drawer portal needs document.body

  useEffect(() => setClient(true), []);
  const toggleRef = useRef(null);
  const drawerRef = useRef(null);
  const close = () => {
    setSub(null);
    setOpen(false);
  };

  useEffect(() => {
    const onScroll = () => setStuck(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    drawerRef.current?.focus(); // the dialog itself, so no focus ring lands on the close button
    const onKey = (e) => {
      if (e.key === "Escape") {
        setSub(null);
        setOpen(false);
        toggleRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.documentElement.style.overflow = "";
    };
  }, [open]);

  return (
    <header className={`nav ${stuck ? "is-stuck" : ""}`} data-hero-nav>
      <a href="#top" className="nav__logo" aria-label="Finaze">
        <Logo />
      </a>

      <nav aria-label="Primary" className="nav__links">
        <MenuList where="bar" sub={open ? null : sub} setSub={setSub} close={close} />
      </nav>

      <a href={CONTACT} className="btn btn--outline nav__cta">
        Book a discovery call
      </a>

      <button
        ref={toggleRef}
        type="button"
        className="nav__toggle"
        aria-expanded={open}
        aria-controls="nav-drawer"
        aria-label="Open menu"
        onClick={() => setOpen(true)}
      >
        <span />
        <span />
      </button>

      {client &&
        createPortal(
        <div
          id="nav-drawer"
          ref={drawerRef}
          tabIndex={-1}
          className={`nav__drawer ${open ? "is-open" : ""} ${stuck ? "is-stuck" : ""}`}
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
          inert={!open}
        >
          <div className="nav__drawer-top">
            <a href="#top" className="nav__logo" aria-label="Finaze home" onClick={close}>
              <Logo />
            </a>
            <button
              type="button"
              className="nav__toggle is-open"
              aria-label="Close menu"
              onClick={() => {
                close();
                toggleRef.current?.focus();
              }}
            >
              <span />
              <span />
            </button>
          </div>
          <nav aria-label="Primary">
            <MenuList where="drawer" sub={sub} setSub={setSub} close={close} />
          </nav>
          <a href={CONTACT} className="btn btn--outline nav__cta-mobile" onClick={close}>
            Book a discovery call
          </a>
        </div>,
        document.body
      )}
    </header>
  );
}
