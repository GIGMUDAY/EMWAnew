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

export function SiteFooter() {
  return (
    <footer className="bg-foreground text-background pt-16 md:pt-24 pb-8 md:pb-10 mt-16 md:mt-24">
      <div className="site-container">
        <div className="grid sm:grid-cols-2 md:grid-cols-12 gap-10 md:gap-12 mb-14 md:mb-20">
          <div className="md:col-span-5">
            <div className="flex items-center gap-3 mb-6">
              <img src={logo} alt="EMWA logo" className="h-14 w-14 object-contain bg-background/5 p-1" />
              <div className="font-display text-5xl tracking-tighter">
                <span className="bg-primary text-primary-foreground px-1.5 py-0.5">E</span>MWA
              </div>
            </div>
            <p className="max-w-sm text-sm text-background/70 leading-relaxed">
              The Ethiopian Media Women Association is a legally registered
              professional organization dedicated to ensuring gender equality in
              and through media across Ethiopia since 1998.
            </p>
            <div className="mt-8 flex gap-3">
              {SOCIALS.map(({ label, href, Icon }) => (
                <a
                  key={label}
                  href={href}
                  className="w-11 h-11 border border-background/20 grid place-items-center hover:bg-primary hover:border-primary transition-all"
                  aria-label={label}
                >
                  <Icon className="size-4" />
                </a>
              ))}
            </div>
          </div>


          <div className="md:col-span-2">
            <p className="label-mono text-accent mb-6">Organization</p>
            <ul className="space-y-3 text-sm">
              {[
                { to: "/about", label: "About" },
                { to: "/programs", label: "Programs" },
                { to: "/membership", label: "Membership" },
                { to: "/partners", label: "Partners" },
              ].map((l) => (
                <li key={l.to}>
                  <Link to={l.to} className="text-background/70 hover:text-primary transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-2">
            <p className="label-mono text-accent mb-6">Discover</p>
            <ul className="space-y-3 text-sm">
              {[
                { to: "/experts", label: "Experts Directory" },
                { to: "/updates", label: "Updates" },
                { to: "/resources", label: "Resource Center" },
              ].map((l) => (
                <li key={l.to}>
                  <Link to={l.to} className="text-background/70 hover:text-primary transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-3">
            <p className="label-mono text-accent mb-6">Contact</p>
            <address className="not-italic text-sm text-background/70 space-y-2 leading-relaxed">
              <p>Kirkos Sub-city, Woreda 08</p>
              <p>Addis Ababa, Ethiopia</p>
              <p className="pt-2">
                <a href="mailto:info@emwa.org.et" className="hover:text-primary">
                  info@emwa.org.et
                </a>
              </p>
              <p>
                <a href="tel:+251115500000" className="hover:text-primary">
                  +251 11 550 0000
                </a>
              </p>
            </address>
          </div>
        </div>

        <div className="pt-7 border-t border-background/15 flex flex-col md:flex-row justify-between gap-4 label-mono text-background/60">
          <p>© {new Date().getFullYear()} EMWA. All rights reserved.</p>
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            <Link to="/privacy" className="hover:text-accent">Privacy</Link>
            <Link to="/terms" className="hover:text-accent">Terms</Link>
            <Link to="/search" className="hover:text-accent">Search</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
