import { asset } from "../lib/gsap";

// Logo files are the exact vector paths extracted from finaze-6.pdf.
export default function Logo({ tone = "navy", className = "" }) {
  return (
    <img
      className={`logo ${className}`}
      src={asset(`brand/logo${tone === "white" ? "-white" : ""}.svg`)}
      alt=""
      width="137"
      height="42"
    />
  );
}
