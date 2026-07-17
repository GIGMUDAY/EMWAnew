import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, type CSSProperties } from "react";
import { ArrowDown, ArrowUpRight, Check, Sparkles } from "lucide-react";
import { PageShell } from "@/components/page-shell";
import heroImg from "@/assets/conference.jpg";
import storyImg from "@/assets/value-independence.png";

export const Route = createFileRoute("/programs")({
  head: () => ({
    meta: [
      { title: "Programs & Projects — EMWA" },
      { name: "description", content: "Explore EMWA's flagship programs, initiatives, campaigns, and success stories advancing women in Ethiopian media." },
      { property: "og:title", content: "Programs & Projects — EMWA" },
      { property: "og:description", content: "Flagship programs, initiatives, campaigns, and success stories from EMWA." },
    ],
  }),
  component: Programs,
});

const CATEGORIES = ["All", "Ongoing", "Completed", "Campaigns", "Fellowships"] as const;

const PROJECTS = [
  { title: "Leadership Incubator", cat: "Fellowships", status: "Ongoing", year: "2016 —", stats: "128 alumnae", body: "Six-month executive residency for women moving into editor-in-chief and executive producer roles." },
  { title: "Digital Safety Network", cat: "Ongoing", status: "Ongoing", year: "2011 —", stats: "24/7 hotline", body: "Cybersecurity toolkits and rapid-response legal support for journalists facing online harassment." },
  { title: "Regional Newsroom Grants", cat: "Ongoing", status: "Ongoing", year: "2019 —", stats: "82 grants awarded", body: "Micro-grants funding women-led investigative reporting outside Addis Ababa." },
  { title: "Voice on Air Fellowship", cat: "Fellowships", status: "Ongoing", year: "2022 —", stats: "45 fellows", body: "One-year mentorship pairing early-career broadcasters with senior editors." },
  { title: "#HerStoryEthiopia", cat: "Campaigns", status: "Completed", year: "2023", stats: "12M reach", body: "National storytelling campaign profiling women leaders in overlooked sectors." },
  { title: "Newsroom Gender Audit", cat: "Completed", status: "Completed", year: "2021", stats: "40 newsrooms", body: "Sector-wide audit of women's representation in editorial and leadership roles." },
];

function Programs() {
  const [active, setActive] = useState<(typeof CATEGORIES)[number]>("All");
  const filtered = active === "All" ? PROJECTS : PROJECTS.filter((project) => project.cat === active || project.status === active);

  return (
    <PageShell>
      <section className="programs-hero" aria-labelledby="programs-heading">
        <div className="programs-hero-copy">
          <p className="programs-eyebrow">Programs &amp; Projects / 2026</p>
          <h1 className="programs-hero-title" id="programs-heading">
            We don&apos;t run projects.<br />We build <em>power.</em>
          </h1>
          <p className="programs-hero-lede">
            Long-term programs that equip women journalists, protect their voices,
            and move them into the rooms where Ethiopian media is shaped.
          </p>
          <div className="programs-hero-actions">
            <a href="#program-index" className="programs-primary-action">Explore the work <ArrowDown aria-hidden="true" /></a>
            <Link to="/contact" className="programs-text-action">Partner with us <ArrowUpRight aria-hidden="true" /></Link>
          </div>
        </div>
        <div className="programs-hero-visual">
          <img src={heroImg} alt="Women media professionals collaborating at an EMWA program" fetchPriority="high" />
          <div className="programs-hero-overlay" aria-hidden="true" />
          <div className="programs-hero-caption"><span>From training to transformation</span><strong>12 regions / One movement</strong></div>
          <span className="programs-hero-ghost" aria-hidden="true">BUILD</span>
        </div>
      </section>

      <section className="programs-featured">
        <div className="programs-featured-heading">
          <p className="programs-eyebrow">Flagship / Leadership</p>
          <h2>From newsroom talent<br />to decision-maker.</h2>
        </div>
        <article className="programs-featured-card">
          <div className="programs-featured-number" aria-hidden="true">01</div>
          <div className="programs-featured-copy">
            <span className="programs-live"><i /> Applications open</span>
            <h3>Leadership<br />Incubator</h3>
            <p>A six-month executive residency helping women editors and producers step confidently into the highest levels of media leadership.</p>
            <ul>
              <li><Check aria-hidden="true" /> Executive mentorship</li>
              <li><Check aria-hidden="true" /> Editorial strategy labs</li>
              <li><Check aria-hidden="true" /> Regional peer network</li>
            </ul>
            <Link to="/contact" className="programs-featured-link">Express interest <ArrowUpRight aria-hidden="true" /></Link>
          </div>
          <div className="programs-featured-proof"><span>Impact since 2016</span><strong>128</strong><p>women prepared for senior editorial leadership.</p></div>
        </article>
      </section>

      <section className="programs-index" id="program-index">
        <header className="programs-index-header">
          <div><p className="programs-eyebrow">Program Index</p><h2>Find your pathway.</h2></div>
          <p>Explore active initiatives, fellowships, campaigns, and the work that continues to shape the sector.</p>
        </header>
        <div className="programs-filters" role="group" aria-label="Filter programs">
          {CATEGORIES.map((category) => {
            const count = category === "All" ? PROJECTS.length : PROJECTS.filter((project) => project.cat === category || project.status === category).length;
            return <button key={category} onClick={() => setActive(category)} aria-pressed={active === category} className={active === category ? "is-active" : ""}>{category}<span>{count}</span></button>;
          })}
        </div>
        <div className="programs-grid" aria-live="polite">
          {filtered.map((program, index) => (
            <article key={program.title} className="program-card" style={{ "--program-index": index } as CSSProperties}>
              <div className="program-card-top"><span>0{PROJECTS.indexOf(program) + 1}</span><span className={`program-status ${program.status === "Ongoing" ? "is-live" : ""}`}>{program.status}</span></div>
              <div className="program-card-main">
                <p>{program.cat} / {program.year}</p><h3>{program.title}</h3>
                <div className="program-card-hidden"><p>{program.body}</p><Link to="/contact">Discover program <ArrowUpRight aria-hidden="true" /></Link></div>
              </div>
              <div className="program-card-impact"><span>Measured impact</span><strong>{program.stats}</strong></div>
            </article>
          ))}
        </div>
      </section>

      <section className="programs-story">
        <div className="programs-story-image"><img src={storyImg} alt="Ethiopian field journalist representing Ayantu's independent reporting journey" loading="lazy" /><span aria-hidden="true">VOICE</span></div>
        <div className="programs-story-copy">
          <Sparkles aria-hidden="true" />
          <p className="programs-eyebrow">Success Story / Regional Newsroom Grant</p>
          <blockquote>“The grant made six months of reporting possible. The story reached the front page—and helped change healthcare regulation in South Omo.”</blockquote>
          <div className="programs-story-divider" aria-hidden="true" />
          <p className="programs-story-person"><strong>Ayantu B.</strong><span>Investigative Reporter</span><span>Arba Minch, Ethiopia</span></p>
        </div>
      </section>

      <section className="programs-cta">
        <p className="programs-eyebrow">Your next chapter</p>
        <h2>Bring your voice.<br /><em>We&apos;ll build the platform.</em></h2>
        <div><Link to="/membership">Join the association <ArrowUpRight aria-hidden="true" /></Link><Link to="/contact">Fund a program</Link></div>
      </section>
    </PageShell>
  );
}
