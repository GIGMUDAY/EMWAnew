import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, Check, Users } from "lucide-react";
import { PageShell, PageHero } from "@/components/page-shell";
import globalImg from "@/assets/emwa-replace.jpg";
import integrityImg from "@/assets/value-integrity.png";
import solidarityImg from "@/assets/value-solidarity.png";
import independenceImg from "@/assets/value-independence.png";
import excellenceImg from "@/assets/value-excellence.png";

export const Route = createFileRoute("/about")({
  head: () => ({ meta: [
    { title: "About EMWA — Ethiopian Media Women Association" },
    { name: "description", content: "Learn about EMWA's mission, vision, values, strategic programs, services, and commitment to women in Ethiopian media." },
    { property: "og:title", content: "About EMWA" },
    { property: "og:description", content: "Empowering women in and through the media since 1999." },
  ] }),
  component: About,
});

const VALUES = [
  ["Integrity", "Upholding honesty, transparency, and ethical conduct."],
  ["Solidarity", "Promoting unity, collaboration, and mutual support."],
  ["Inclusiveness", "Ensuring diversity, equal opportunity, and meaningful participation."],
  ["Professionalism", "Maintaining excellence, competence, and ethical standards."],
  ["Accountability & Transparency", "Taking responsibility and promoting openness in decision-making."],
];

const WORK = [
  "Empower women journalists and media professionals",
  "Promote gender equality and women's leadership in media",
  "Advocate for safe, ethical, and gender-sensitive journalism",
  "Build professional capacity through training, mentoring, and coaching",
  "Conduct research on gender and media",
  "Support policy advocacy and media-sector reform",
  "Strengthen networking and collaboration among media professionals",
  "Increase women's participation in leadership and decision-making",
  "Promote media freedom, professionalism, and ethical standards",
];

const SERVICES = ["Professional training", "Capacity-building workshops", "Research and publications", "Policy advocacy", "Networking opportunities", "Media development initiatives", "Mentorship programs", "Resource center", "Knowledge sharing", "Consultation on gender and media"];
const BENEFICIARIES = ["Women journalists", "Media professionals", "Young journalists", "Journalism students", "Media organizations", "Civil society organizations", "Government institutions", "Researchers", "Development partners"];
const STAKEHOLDERS = ["EMWA Members", "Media Houses", "Government Agencies", "Donors", "Peer Associations", "Board of Directors", "EMWA Management", "EMWA Staff"];
const VALUE_IMAGES = [integrityImg, solidarityImg, independenceImg, excellenceImg, globalImg];

function ValueStory({ value, index }: { value: string[]; index: number }) {
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setVisible(true);
        observer.disconnect();
      }
    }, { threshold: 0.18, rootMargin: "0px 0px -8% 0px" });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return <article ref={ref} className={`about-manifesto-item about-scroll-reveal${index % 2 ? " about-manifesto-item--reverse" : ""}${visible ? " is-visible" : ""}`}>
    <span className="about-manifesto-number" aria-hidden="true">0{index + 1}</span>
    <div className="about-manifesto-image-wrap"><img src={VALUE_IMAGES[index]} alt="" loading="lazy" className="about-manifesto-image" /><span className="about-manifesto-image-shade" aria-hidden="true" /></div>
    <div className="about-manifesto-panel"><p className="about-manifesto-kicker">Commitment 0{index + 1}</p><h3 className="about-manifesto-name">{value[0]}</h3><p className="about-manifesto-body">{value[1]}</p><span className="about-manifesto-rule" aria-hidden="true" /></div>
  </article>;
}

function About() {
  return <PageShell>
    <PageHero
      eyebrow="About the Association / Since 1999"
      title={<>Women shaping media.<br /><span className="text-primary">Media shaping equality.</span></>}
      lede="The Ethiopia Media Women Association is a non-partisan, non-profit civil society organization advancing gender equality, professional excellence, media freedom, and safety."
    />

    <section className="about2-intro">
      <div className="about2-image"><img src={globalImg} alt="Women media professionals working together" loading="eager" /><span>Established / 1999</span></div>
      <div className="about2-story">
        <p className="about2-eyebrow">Who we are</p>
        <h2>Built by women journalists.<br />Driven by lasting change.</h2>
        <p>Founded in 1999 by women journalists and media professionals, EMWA empowers women in and through the media by promoting gender equality, strengthening professional capacity, advocating for media freedom and safety, and supporting ethical journalism.</p>
        <p>Over the years, EMWA has expanded women's participation and leadership, strengthened gender-sensitive reporting, and created opportunities for professional development. Following its re-registration under Ethiopia's revised CSO legislation in 2019, the Association renewed its commitment to strategic partnerships, research, advocacy, and capacity building.</p>
        <blockquote><span>Our motto</span>“Empowering Women in and Through the Media!”</blockquote>
      </div>
    </section>

    <section className="about-vmr-section">
      <div className="about-vmr-container"><div className="about-vmr-grid">
        <article className="about-vmr-card"><p className="about-vmr-badge">Vision</p><h2 className="about-vmr-heading">A secure, inclusive and vibrant media sector.</h2><p className="about-vmr-body">To see a vibrant media profession and media sector that is secure, inclusive, and conducive for women media professionals.</p></article>
        <article className="about-vmr-card"><p className="about-vmr-badge">Mission</p><h2 className="about-vmr-heading">Capacity. Equality. Positive change.</h2><p className="about-vmr-body">To empower women media professionals through continuous capacity building, advocacy for gender equality and equity, and positive change that advances ethical, safe, and professional media development.</p></article>
        <article className="about-vmr-card about-vmr-card--statement"><p className="about-vmr-badge">Our mandate</p><h2 className="about-vmr-heading">In media and through media.</h2><p className="about-vmr-body">We connect professional empowerment with the wider transformation of how women are represented, heard, protected, and supported across the media sector.</p></article>
      </div></div>
    </section>

    <section className="about-values-section" aria-labelledby="values-heading"><div className="about-values-container">
      <header className="about-values-header"><div><p className="about-values-eyebrow">Core values</p><h2 className="about-values-title" id="values-heading">Principles that guide <span>the work.</span></h2></div><p className="about-values-intro">Five commitments shape how EMWA governs, collaborates, advocates, and serves its community.</p></header>
      <div className="about-values-manifesto">{VALUES.map((value, index) => <ValueStory value={value} index={index} key={value[0]} />)}</div>
    </div></section>

    <section className="about2-work"><header><p className="about2-eyebrow">What we do</p><h2>Turning commitment<br />into sector-wide action.</h2><p>EMWA works across professional development, evidence, advocacy, safety, leadership, and collective action.</p></header><div className="about2-work-list">{WORK.map((item, index) => <article key={item}><span>{String(index + 1).padStart(2, "0")}</span><p>{item}</p><Check aria-hidden="true" /></article>)}</div></section>

    <section className="about2-services"><div className="about2-services-intro"><p className="about2-eyebrow">Our services</p><h2>Practical support for a stronger profession.</h2><p>Programs and services designed to build knowledge, capability, connection, and influence.</p><Link to="/programs">Explore our programs <ArrowUpRight /></Link></div><div className="about2-tag-cloud">{SERVICES.map((item) => <span key={item}>{item}</span>)}</div></section>

    <section className="about2-community"><div><p className="about2-eyebrow">Who we serve</p><h2>Our beneficiaries.</h2><div className="about2-people-grid">{BENEFICIARIES.map((item) => <span key={item}><Users />{item}</span>)}</div></div><aside><p className="about2-eyebrow">Key stakeholders</p><h2>Accountability starts with relationship.</h2><ul>{STAKEHOLDERS.map((item) => <li key={item}>{item}</li>)}</ul></aside></section>

  </PageShell>;
}
