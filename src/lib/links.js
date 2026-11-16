// Destinations on the live site (www.finaze.com.au). This build replaces its
// home page, so on-page sections use anchors and everything else is absolute.
const SITE = "https://www.finaze.com.au";

export const CONTACT = `${SITE}/contact-us/`;
export const CALCULATORS = `${SITE}/calculators/`;
export const calculator = (slug) => `${CALCULATORS}${slug}/`;
export const CODENDESIGN = "https://www.codendesign.com.au/";
export const PRIVACY = `${SITE}/privacy-policy/`;
export const EMAIL = "info@finaze.com.au";

// Ordered as in the services grid (copy doc, section 4).
export const SERVICES = [
  { label: "Website Design & Development", href: `${SITE}/website-design-and-development/` },
  { label: "SEO & AI Search Visibility", href: `${SITE}/seo-and-ai-search-visibility/` },
  { label: "Paid Advertising", href: `${SITE}/paid-advertising/` },
  { label: "Social Media Management", href: `${SITE}/social-media-management/` },
  { label: "Email & SMS Marketing", href: `${SITE}/email-sms-marketing/` },
  { label: "Content Strategy & Copywriting", href: `${SITE}/content-strategy-and-copywriting/` },
  { label: "Brand Strategy & Identity", href: `${SITE}/brand-strategy-and-identity/` },
];
export const service = (label) => SERVICES.find((s) => s.label === label).href;

// Profession pages: the live site only has calculator category pages so far
// (none for Financial Advisers, so that profession is not linked anywhere).
export const PROFESSIONS = {
  brokers: `${SITE}/calculators-categories/brokers/`,
  accountants: `${SITE}/calculators-categories/accountants/`,
  conveyancers: `${SITE}/calculators-categories/conveyancers/`,
};

export const COMPANY = [
  { label: "About Us", href: "#about" },
  { label: "How We Work", href: "#how" },
  { label: "Compliance Approach", href: `${SITE}/compliance-approach/` },
  { label: "Contact Us", href: CONTACT },
  { label: "Privacy Policy", href: PRIVACY },
  { label: "Terms of Service", href: `${SITE}/terms-and-conditions/` },
];

export const WHO_WE_SERVE = [
  { label: "Mortgage Brokers", href: PROFESSIONS.brokers },
  { label: "Accountants & Tax Agents", href: PROFESSIONS.accountants },
  { label: "Conveyancers", href: PROFESSIONS.conveyancers },
];

export const SOCIAL = {
  Facebook: "https://www.facebook.com/profile.php?id=61592228039455",
  LinkedIn: "https://www.linkedin.com/company/133387853/",
  Instagram: "https://www.instagram.com/finaze_au/",
};
