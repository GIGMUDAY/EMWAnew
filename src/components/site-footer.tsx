import { Link } from "@tanstack/react-router";
import { Linkedin, Twitter, Facebook, Youtube, Send } from "lucide-react";
import logo from "@/assets/emwa-logo-new.png";

const SOCIALS = [
  { label: "LinkedIn", href: "#", Icon: Linkedin },
  { label: "Twitter", href: "#", Icon: Twitter },
  { label: "Facebook", href: "#", Icon: Facebook },
  { label: "Telegram", href: "#", Icon: Send },
  { label: "YouTube", href: "#", Icon: Youtube },
];

const NAV_ORG = [
  { to: "/about", label: "About" },
  { to: "/programs", label: "Programs" },
  { to: "/membership", label: "Membership" },
  { to: "/partners", label: "Partners" },
];

const NAV_DISCOVER = [
  { to: "/experts", label: "Experts Directory" },
  { to: "/updates", label: "Updates" },
  { to: "/resources", label: "Resource Center" },
];

export function SiteFooter() {
  return (
    <footer className="sf-footer" role="contentinfo">
      {/* Decorative ghost word */}
      <span className="sf-bg-word" aria-hidden="true">
        EMWA
      </span>

      <div className="sf-container">
        {/* ── Top grid ── */}
        <div className="sf-grid">
          {/* Brand column */}
          <div className="sf-brand">
            <div className="sf-logo-row">
              <img src={logo} alt="EMWA logo" className="sf-logo-img" />
              <div className="sf-wordmark">
                <span className="sf-wordmark-e">E</span>MWA
              </div>
            </div>
            <p className="sf-tagline">
              The Ethiopian Media Women Association is a legally registered professional
              organization dedicated to ensuring gender equality in and through media across
              Ethiopia since 1998.
            </p>
            <div className="sf-socials">
              {SOCIALS.map(({ label, href, Icon }) => (
                <a key={label} href={href} className="sf-social-btn" aria-label={label}>
                  <Icon className="sf-social-icon" />
                </a>
              ))}
            </div>
          </div>

          {/* Org links */}
          <div className="sf-col">
            <p className="sf-col-heading">Organization</p>
            <ul className="sf-col-list">
              {NAV_ORG.map((l) => (
                <li key={l.to}>
                  <Link to={l.to} className="sf-link">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Discover links */}
          <div className="sf-col">
            <p className="sf-col-heading">Discover</p>
            <ul className="sf-col-list">
              {NAV_DISCOVER.map((l) => (
                <li key={l.to}>
                  <Link to={l.to} className="sf-link">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="sf-col">
            <p className="sf-col-heading">Contact</p>
            <address className="sf-address">
              <p>Kirkos Sub-city, Woreda 08</p>
              <p>Addis Ababa, Ethiopia</p>
              <p className="sf-address-gap">
                <a href="mailto:info@emwa.org.et" className="sf-link">
                  info@emwa.org.et
                </a>
              </p>
              <p>
                <a href="tel:+251115500000" className="sf-link">
                  +251 11 550 0000
                </a>
              </p>
            </address>
          </div>
        </div>

        {/* ── Bottom bar ── */}
        <div className="sf-bottom">
          <p className="sf-copy">© {new Date().getFullYear()} EMWA. All rights reserved.</p>
          <div className="sf-legal-links">
            <Link to="/privacy" className="sf-legal-link">
              Privacy
            </Link>
            <Link to="/terms" className="sf-legal-link">
              Terms
            </Link>
            <Link to="/search" search={{ q: "" }} className="sf-legal-link">
              Search
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
