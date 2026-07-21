import { createFileRoute, Link } from "@tanstack/react-router";
import { type CSSProperties } from "react";
import { ArrowDown, ArrowUpRight } from "lucide-react";
import { PageShell } from "@/components/page-shell";
import heroImg from "@/assets/conference.jpg";

export const Route = createFileRoute("/programs")({
  head: () => ({ meta: [
    { title: "Programs & Projects — EMWA" },
    { name: "description", content: "Explore EMWA's seven strategic programs advancing women in Ethiopian media." },
    { property: "og:title", content: "Programs & Projects — EMWA" },
  ] }),
  component: Programs,
});

const PROGRAMS = [
  { title: "Organizational Development", focus: "Institution", items: ["Institutional capacity building", "Governance strengthening", "Accountability systems", "Policy and bylaw development"] },
  { title: "Membership Development", focus: "Membership", items: ["Membership recruitment", "Member engagement", "Member rights and benefits", "Professional development"] },
  { title: "Capacity Building", focus: "Professional growth", items: ["Training programs", "Mentorship", "Coaching", "Exchange programs", "Knowledge sharing"] },
  { title: "Research & Knowledge", focus: "Evidence", items: ["Gender and media research", "Policy papers", "Publications", "Knowledge hub development"] },
  { title: "Advocacy & Visibility", focus: "Influence", items: ["Gender-sensitive media advocacy", "Public awareness campaigns", "Policy dialogue", "Communication and media engagement"] },
  { title: "Resource Mobilization", focus: "Sustainability", items: ["Fundraising initiatives", "Income-generating activities", "Volunteer engagement", "Donor relationship management"] },
  { title: "Partnerships & Networking", focus: "Collaboration", items: ["Strategic partnerships", "National and international collaboration", "Stakeholder engagement", "Media coalition building"] },
];

function Programs() {
  return <PageShell>
    <section className="programs-hero" aria-labelledby="programs-heading">
      <div className="programs-hero-copy">
        <p className="programs-eyebrow">Programs &amp; Projects / EMWA</p>
        <h1 className="programs-hero-title" id="programs-heading">We don&apos;t run projects.<br />We build <em>power.</em></h1>
        <p className="programs-hero-lede">Seven connected strategic programs that strengthen women media professionals, the Association, and the wider Ethiopian media sector.</p>
        <div className="programs-hero-actions"><a href="#program-index" className="programs-primary-action">Explore the work <ArrowDown aria-hidden="true" /></a><Link to="/contact" className="programs-text-action">Partner with us <ArrowUpRight aria-hidden="true" /></Link></div>
      </div>
      <div className="programs-hero-visual">
        <img src={heroImg} alt="Women media professionals collaborating at an EMWA program" fetchPriority="high" />
        <div className="programs-hero-overlay" aria-hidden="true" />
        <div className="programs-hero-caption"><span>From capacity to transformation</span><strong>Seven programs / One direction</strong></div>
        <span className="programs-hero-ghost" aria-hidden="true">BUILD</span>
      </div>
    </section>

    <section className="programs-index" id="program-index">
      <header className="programs-index-header">
        <div><p className="programs-eyebrow">Program Index</p><h2>Find your pathway.</h2></div>
        <p>Explore EMWA&apos;s seven strategic program areas for institutional strength, professional growth, knowledge, advocacy, sustainability, and partnership.</p>
      </header>
      <div className="programs-grid" aria-live="polite">
        {PROGRAMS.map((program, index) => <article key={program.title} className="program-card" style={{ "--program-index": index } as CSSProperties}>
          <div className="program-card-top"><span>0{index + 1}</span><span className="program-status is-live">Strategic program</span></div>
          <div className="program-card-main">
            <p>{program.focus}</p><h3>{program.title}</h3>
            <div className="program-card-hidden"><ul className="program-card-priorities">{program.items.map((item) => <li key={item}>{item}</li>)}</ul><Link to="/contact">Connect with the program <ArrowUpRight aria-hidden="true" /></Link></div>
          </div>
          <div className="program-card-impact"><span>Priority areas</span><strong>{program.items.length}</strong></div>
        </article>)}
      </div>
    </section>

    <section className="programs-cta">
      <p className="programs-eyebrow">Your next chapter</p>
      <h2>Bring your voice.<br /><em>We&apos;ll build the platform.</em></h2>
      <div><Link to="/membership">Join the association <ArrowUpRight aria-hidden="true" /></Link><Link to="/contact">Fund a program</Link></div>
    </section>
  </PageShell>;
}
