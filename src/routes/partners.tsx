import { createFileRoute } from "@tanstack/react-router";
import { ArrowRight, ArrowUpRight, Check, Globe2, Handshake, Landmark, Mail } from "lucide-react";
import { PageShell } from "@/components/page-shell";

export const Route = createFileRoute("/partners")({
  head: () => ({ meta: [
    { title: "Partners & Alliances — EMWA" },
    { name: "description", content: "The media, government, international, and civil-society partners working with EMWA." },
    { property: "og:title", content: "Partners & Alliances — EMWA" },
  ] }),
  component: Partners,
});

const LOGO_PARTNERS = [
  { name: "Partner One", abbr: "P1", focus: "Media development", tone: "gold" },
  { name: "Partner Two", abbr: "P2", focus: "Gender equality", tone: "berry" },
  { name: "Partner Three", abbr: "P3", focus: "Institutional support", tone: "navy" },
  { name: "Partner Four", abbr: "P4", focus: "Training & safety", tone: "green" },
  { name: "Partner Five", abbr: "P5", focus: "Journalism education", tone: "clay" },
  { name: "Partner Six", abbr: "P6", focus: "Independent media", tone: "violet" },
  { name: "Partner Seven", abbr: "P7", focus: "Freedom of expression", tone: "blue" },
  { name: "Partner Eight", abbr: "P8", focus: "Public-interest journalism", tone: "red" },
] as const;

const GROUPS = [
  { title: "Media partners", icon: Globe2, items: ["Ethiopian Broadcasting Corporation", "Fana Broadcasting", "Walta Media", "Addis Standard", "Reporter Newspaper"] },
  { title: "Public institutions", icon: Landmark, items: ["Ministry of Women and Social Affairs", "Ethiopian Media Authority", "House of Peoples' Representatives", "Addis Ababa City Administration"] },
  { title: "International allies", icon: Handshake, items: ["UNESCO", "UN Women", "European Union Delegation", "DW Akademie", "Fojo Media Institute", "Internews", "ARTICLE 19"] },
  { title: "Civil society & academia", icon: Check, items: ["African Media Women Alliance", "Ethiopian Human Rights Commission", "Addis Ababa University School of Journalism", "Media Council of Ethiopia"] },
] as const;

function PartnerLogo({ partner, compact = false }: { partner: (typeof LOGO_PARTNERS)[number]; compact?: boolean }) {
  return <div className={`partners-logo-card${compact ? " is-compact" : ""}`}><div className={`partners-placeholder-logo is-${partner.tone}`} aria-hidden="true"><i /><strong>{partner.abbr}</strong></div><div className="partners-placeholder-copy"><strong>{partner.name}</strong><span>{partner.focus}</span></div></div>;
}

function Partners() {
  return (
    <PageShell>
      <section className="partners2-hero">
        <p className="partners-eyebrow">Partners &amp; alliances / EMWA</p>
        <h1>Progress is<br /><em>a collective act.</em></h1>
        <p>We work across institutions, borders, and disciplines to create lasting opportunity for women in Ethiopian media.</p>
        <a href="#partner-network">Meet the network <ArrowRight /></a>
        <span className="partners2-hero-word" aria-hidden="true">TOGETHER</span>
      </section>

      <section className="partners2-marquee" aria-label="Selected EMWA partners">
        <div className="partners2-marquee-label"><span>Selected partners</span><small>Scroll / Right to left</small></div>
        <div className="partners2-marquee-window">
          <div className="partners2-marquee-track">
            {[...LOGO_PARTNERS, ...LOGO_PARTNERS].map((partner, index) => <PartnerLogo key={`${partner.name}-${index}`} partner={partner} compact />)}
          </div>
        </div>
      </section>

      <section className="partners2-purpose">
        <header><p className="partners-eyebrow">Why we partner</p><h2>Shared effort.<br />Measurable change.</h2></header>
        <div><article><span>01</span><h3>Knowledge</h3><p>Research, training, and practical expertise shaped around real newsroom conditions.</p></article><article><span>02</span><h3>Access</h3><p>Pathways into leadership, regional networks, funding, platforms, and public influence.</p></article><article><span>03</span><h3>Accountability</h3><p>Clear outcomes, transparent roles, and institutional changes that last beyond a grant.</p></article></div>
      </section>

      <section className="partners2-network" id="partner-network">
        <header><div><p className="partners-eyebrow">The partner network</p><h2>Many sectors.<br />One direction.</h2></div><p>Each relationship contributes a different kind of leverage—from public reach and policy access to technical expertise and long-term funding.</p></header>
        <div className="partners2-group-list">{GROUPS.map(({ title, icon: Icon, items }, index) => <article key={title}><div className="partners2-group-title"><span>0{index + 1}</span><Icon /><h3>{title}</h3><strong>{items.length}</strong></div><div className="partners2-group-names">{items.map((item) => <span key={item}>{item}</span>)}</div></article>)}</div>
      </section>

      <section className="partners2-story">
        <div><span>Partnership in practice</span><strong>06</strong><small>Years working together</small></div>
        <blockquote>“The strongest outcome was not one campaign. It was a newsroom culture where more women can lead, commission, and make decisions.”<cite><strong>Head of News</strong> / Ethiopian Broadcasting Corporation</cite></blockquote>
      </section>

      <section className="partners2-cta"><p className="partners-eyebrow">Build something durable</p><h2>Let&apos;s move the work<br /><em>forward—together.</em></h2><a href="mailto:partnerships@emwa.org.et"><Mail /> Start a partnership conversation <ArrowUpRight /></a></section>
    </PageShell>
  );
}
