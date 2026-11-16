import { useEffect, useState } from "react";
import { ScrollTrigger, afterPaint } from "./lib/gsap";
import Nav from "./components/Nav";
import Hero from "./components/Hero";
import Partners from "./components/Partners";
import About from "./components/About";
import Services from "./components/Services";
import Calculators from "./components/Calculators";
import WhyUs from "./components/WhyUs";
import HowItWorks from "./components/HowItWorks";
import Work from "./components/Work";
import LogosCta from "./components/LogosCta";
import Footer from "./components/Footer";
import "./components/Sections.css";

// Below the fold, mounted one per task after the first paint: start-up becomes
// a run of short tasks instead of one long block (Total Blocking Time), and the
// hero paints sooner. Sections only ever append below, so scroll positions
// measured for earlier sections stay valid.
const LATER = [About, Services, Calculators, WhyUs, HowItWorks, Work, LogosCta];

export default function App() {
  const [mounted, setMounted] = useState(0);
  const done = mounted > LATER.length; // the footer mounts last

  useEffect(() => {
    if (done) return;
    const id = setTimeout(() => setMounted((n) => n + 1), 0);
    return () => clearTimeout(id);
  }, [mounted, done]);

  // Once everything is in, honour a #section link from another page.
  useEffect(() => {
    if (!done || !location.hash) return;
    afterPaint(() => {
      ScrollTrigger.refresh();
      document.getElementById(decodeURIComponent(location.hash.slice(1)))?.scrollIntoView();
    });
  }, [done]);

  // Pins measure layout once; re-measure when the web font swaps in (text
  // heights change). ScrollTrigger already refreshes itself on window load.
  useEffect(() => {
    document.fonts?.ready.then(() => afterPaint(() => ScrollTrigger.refresh()));
  }, []);

  return (
    <>
      <a href="#partners" className="skip-link">
        Skip to content
      </a>
      <Nav />
      <main>
        <Hero />
        <Partners />
        {LATER.slice(0, mounted).map((Section) => (
          <Section key={Section.name} />
        ))}
      </main>
      {done && <Footer />}
    </>
  );
}
