import { createFileRoute, Link } from "@tanstack/react-router";
import { type CSSProperties, useState } from "react";
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

const SERVICES = [
  { title: "Capacity Building", text: "Strengthen media practitioners through tailor-made training, mentorship, internships, experience-sharing platforms, and roundtable discussions." },
  { title: "Evidence-Based Advocacy", text: "Champion the rights of women and women media professionals by amplifying their voices and advancing gender equality across the media sector." },
  { title: "Women’s Empowerment", text: "Promote resilience and wellbeing through mental health services and awareness training tailored to women media practitioners." },
  { title: "Amplifying Women’s Voices", text: "Enhance visibility and influence through the Women Experts’ Directory and awareness initiatives addressing issues that affect women." },
  { title: "Evidence Generation", text: "Conduct assessments and collaborate on research to identify barriers facing women in media, ensuring data-driven solutions." },
  { title: "Promoting Gender Transformation", text: "Recognize and celebrate progress through Gender Transformative Media Awards that highlight institutions and individuals driving change." },
  { title: "Excellence Hub", text: "Serve as a central hub of excellence for gender and media." },
];

const PROJECTS = [
  { period: "2020–2023", partner: "Civil Rights Defender", title: "Solidarity Network and Capacity Building for Women Journalists in Ethiopia", text: "Capacity development support for the revival of EMWA.", status: "Completed" },
  { period: "Completed 2025", partner: "Civil Rights Defender", title: "Consolidating Women Media Professionals’ Solidarity in Ethiopia", text: "Strengthened EMWA’s capacity, safeguarded women journalists, and fostered mentorship, internships, and solidarity.", status: "Completed" },
  { period: "2025", partner: "Fojo Media Institute", title: "Gender Equality in the Workplace", text: "Advanced Ethiopia’s media gender policy through development, advocacy, stakeholder engagement, and awareness.", status: "Completed" },
  { period: "2025", partner: "EliDA", title: "Increasing Resilience to Online and Offline Violence in Ethiopia", text: "Empowered women in media to counter online hate speech and technology-facilitated gender-based violence through digital literacy and advocacy.", status: "Completed" },
  { period: "2024–2025", partner: "UNESCO", title: "Women Journalists’ Mental Health Safety and Trauma Reporting", text: "Strengthened the capacity of women journalists in conflict regions through trauma-informed reporting and mental wellbeing support.", status: "Completed" },
  { period: "2026", partner: "Grassroot Soccer", title: "Mental Health Prevention and Promotion through Mass Media", text: "Improving adolescent mental wellbeing through cognitive-behavioral approaches.", status: "2026" },
  { period: "2026", partner: "Partner initiative", title: "Gender Equality in the Workplace II", text: "Developing a national media gender policy module and launching a dynamic Women Experts’ Directory.", status: "Ongoing" },
  { period: "2026–2028", partner: "Civil Society Innovation Fund", title: "Amplifying Voices, Safeguarding Rights", text: "Promoting media freedom and gender equality in Ethiopia.", status: "Ongoing" },
];

function Programs() {
  const [activeView, setActiveView] = useState<"strategies" | "services" | "projects">("strategies");
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
      <nav className="programs-view-tabs" aria-label="Programs content">
        {([
          ["strategies", "Core Strategies"],
          ["services", "Services"],
          ["projects", "Projects"],
        ] as const).map(([value, label]) => (
          <button key={value} type="button" className={activeView === value ? "is-active" : ""} onClick={() => setActiveView(value)} aria-pressed={activeView === value}>
            <span>0{value === "strategies" ? 1 : value === "services" ? 2 : 3}</span>{label}
          </button>
        ))}
      </nav>
      <header className="programs-index-header">
        <div><p className="programs-eyebrow">{activeView === "strategies" ? "Core Strategies" : activeView === "services" ? "What we offer" : "Our portfolio"}</p><h2>{activeView === "strategies" ? "Find your pathway." : activeView === "services" ? "Services that move media forward." : "Change, delivered."}</h2></div>
        <p>{activeView === "strategies" ? "Explore EMWA's seven strategic areas for institutional strength, professional growth, knowledge, advocacy, sustainability, and partnership." : activeView === "services" ? "Practical, evidence-led services designed to strengthen women media practitioners and transform Ethiopia’s media sector." : "A record of partnerships that turn solidarity, safety, equality, and professional growth into measurable action."}</p>
      </header>
      {activeView === "strategies" && <div className="programs-grid programs-view-enter" aria-live="polite">
        {PROGRAMS.map((program, index) => <article key={program.title} className="program-card" style={{ "--program-index": index } as CSSProperties}>
          <div className="program-card-top"><span>0{index + 1}</span><span className="program-status is-live">Strategic program</span></div>
          <div className="program-card-main">
            <p>{program.focus}</p><h3>{program.title}</h3>
            <div className="program-card-hidden"><ul className="program-card-priorities">{program.items.map((item) => <li key={item}>{item}</li>)}</ul><Link to="/contact">Connect with the program <ArrowUpRight aria-hidden="true" /></Link></div>
          </div>
          <div className="program-card-impact"><span>Priority areas</span><strong>{program.items.length}</strong></div>
        </article>)}
      </div>}
      {activeView === "services" && <div className="programs-services programs-view-enter" aria-live="polite">
        {SERVICES.map((service, index) => <article key={service.title}>
          <span>0{index + 1}</span>
          <div><p className="programs-eyebrow">EMWA service</p><h3>{service.title}</h3><p>{service.text}</p></div>
          <ArrowUpRight aria-hidden="true" />
        </article>)}
      </div>}
      {activeView === "projects" && <div className="programs-projects programs-view-enter" aria-live="polite">
        {PROJECTS.map((project, index) => <article key={project.title}>
          <div className="programs-project-rail"><span>0{index + 1}</span><i /></div>
          <div className="programs-project-copy">
            <div className="programs-project-meta"><span>{project.period}</span><span>{project.partner}</span><b className={project.status === "Ongoing" ? "is-ongoing" : ""}>{project.status}</b></div>
            <h3>{project.title}</h3><p>{project.text}</p>
          </div>
        </article>)}
      </div>}
    </section>

    <section className="programs-cta">
      <p className="programs-eyebrow">Your next chapter</p>
      <h2>Bring your voice.<br /><em>We&apos;ll build the platform.</em></h2>
      <div><Link to="/membership">Join the association <ArrowUpRight aria-hidden="true" /></Link><Link to="/contact">Fund a program</Link></div>
    </section>
  </PageShell>;
}
