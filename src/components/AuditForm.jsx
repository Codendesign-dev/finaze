import { useRef, useState } from "react";
import { PRIVACY } from "../lib/links";

// Served from public/, next to index.html, so it works from any subfolder.
const ENDPOINT = `${import.meta.env.BASE_URL}audit-request.php`;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
// A domain with an optional scheme and path, e.g. "example.com.au" or "https://www.example.com/about".
const SITE_RE = /^(https?:\/\/)?([a-z0-9-]+\.)+[a-z]{2,}(:\d+)?(\/\S*)?$/i;

function validate({ email, website }) {
  const errors = {};
  if (!email) errors.email = "Please enter your email address.";
  else if (!EMAIL_RE.test(email)) errors.email = "Please enter a valid email address, like name@business.com.au.";
  if (!website) errors.website = "Please enter your website address.";
  else if (!SITE_RE.test(website)) errors.website = "Please enter a valid website address, like yourbusiness.com.au.";
  return errors;
}

/** Free marketing audit request: validated here and again on the server, which emails the team. */
export default function AuditForm() {
  const [values, setValues] = useState({ email: "", website: "" });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [status, setStatus] = useState("idle"); // idle | sending | sent | failed
  const startedAt = useRef(Date.now());
  const refs = { email: useRef(null), website: useRef(null) };

  const update = (name) => (e) => {
    const next = { ...values, [name]: e.target.value };
    setValues(next);
    if (touched[name]) setErrors(validate(next));
    if (status === "failed") setStatus("idle");
  };
  const blur = (name) => () => {
    setTouched((t) => ({ ...t, [name]: true }));
    setErrors(validate({ ...values, [name]: values[name].trim() }));
  };

  const submit = async (e) => {
    e.preventDefault();
    if (status === "sending") return;
    const clean = { email: values.email.trim(), website: values.website.trim() };
    const found = validate(clean);
    setTouched({ email: true, website: true });
    setErrors(found);
    const first = ["email", "website"].find((k) => found[k]);
    if (first) return refs[first].current?.focus();

    setStatus("sending");
    const body = new FormData(e.currentTarget);
    body.set("email", clean.email);
    body.set("website", clean.website);
    body.set("elapsed", String(Math.round((Date.now() - startedAt.current) / 1000)));
    try {
      const res = await fetch(ENDPOINT, { method: "POST", body, headers: { Accept: "application/json" } });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) {
        if (data.errors) setErrors(data.errors);
        throw new Error(data.message || "Request failed");
      }
      setStatus("sent");
    } catch {
      setStatus("failed");
    }
  };

  if (status === "sent") {
    return (
      <div className="cta__audit">
        <p className="cta__done" role="status">
          Thanks, your audit request is in. We&rsquo;ll email you at <b>{values.email.trim()}</b> to arrange it.
        </p>
      </div>
    );
  }

  const field = (name) => ({
    id: `cta-${name}`,
    name,
    value: values[name],
    onChange: update(name),
    onBlur: blur(name),
    ref: refs[name],
    required: true,
    "aria-invalid": errors[name] ? true : undefined,
    "aria-describedby": errors[name] ? `cta-${name}-error` : undefined,
  });

  return (
    <div className="cta__audit">
      <form className="cta__form" onSubmit={submit} noValidate>
        <label htmlFor="cta-email" className="sr-only">
          Email address
        </label>
        <input {...field("email")} type="email" placeholder="Your email address" autoComplete="email" maxLength={254} />
        <label htmlFor="cta-website" className="sr-only">
          Website address
        </label>
        <input {...field("website")} type="text" inputMode="url" placeholder="Your website address" autoComplete="url" maxLength={300} />
        {/* Honeypot: hidden from people, often filled in by bots. */}
        <input type="text" name="company" tabIndex={-1} autoComplete="off" className="cta__trap" aria-hidden="true" />
        <button type="submit" disabled={status === "sending"}>
          {status === "sending" ? "Sending…" : "Request my free audit"}
        </button>
      </form>
      <div className="cta__errors" aria-live="polite">
        {["email", "website"].map(
          (k) =>
            errors[k] && (
              <p key={k} id={`cta-${k}-error`} className="cta__error">
                {errors[k]}
              </p>
            )
        )}
        {status === "failed" && (
          <p className="cta__error">Sorry, your request didn&rsquo;t go through. Please try again, or email info@finaze.com.au.</p>
        )}
      </div>
      <p className="cta__privacy">
        We&rsquo;ll email you to arrange your audit. We only use your details to respond to this request. See our{" "}
        <a href={PRIVACY}>Privacy Policy</a>.
      </p>
    </div>
  );
}
