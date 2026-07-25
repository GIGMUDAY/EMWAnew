import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, Check, Users, X } from "lucide-react";
import { PageShell, PageHero } from "@/components/page-shell";
import globalImg from "@/assets/emwa-replace.jpg";
import integrityImg from "@/assets/value-integrity.png";
import solidarityImg from "@/assets/value-solidarity.png";
import independenceImg from "@/assets/value-independence.png";
import excellenceImg from "@/assets/value-excellence.png";
import boardChairImg from "@/assets/expert-1.jpg";
import boardViceChairImg from "@/assets/expert-2.jpg";

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
const BOARD_MEMBERS = [
  {
    name: "Konjit Zewede",
    role: "Media and Advocacy Expert",
    image: boardChairImg,
    bio: "Konjit Zewede is a media and advocacy expert, communication and public relations specialist with over ten years of experience across Ethiopia's public and private media. She has worked with leading organizations including Fana Broadcasting Corporation as a reporter and news anchor, and currently serves as Chief Editor at National Broadcasting Services (NBC) Ethiopia, one of the country's leading broadcasters. Her career highlights include successful documentary production, government and community project follow-up, impactful news coverage, and advancing women's empowerment initiatives across diverse sectors. Konjit combines technical excellence in media production with a strong commitment to gender equality and amplifying women's voices.",
  },
  {
    name: "Sara Moges",
    role: "Media Executive",
    image: boardViceChairImg,
    bio: "Sara Moges is an Ethiopian media executive, journalist, producer, strategic communications professional, trainer, and author with more than a decade of experience in broadcasting, public relations, media research, broadcast program production, and leadership. She is Chief Executive Officer of Tirita FM 97.6, providing strategic, editorial, operational, and business-development leadership while heading the Fact-Checking Desk to strengthen information integrity and public trust. She designs and delivers training on communication, content development, fact-checking, media literacy, and awareness creation. Her career spans Tirita FM, NBC Ethiopia, Seba Dereja Media Network, Ethiopian Tourism Organization, and cultural-event production. Sara holds an MA in Documentary Linguistics and Culture and a BA in Foreign Languages and Literature from Addis Ababa University. She is the author of the Amharic poetry collection ሰካራሙ ስንኞች.",
  },
  {
    name: "Fitih Alemu",
    role: "Journalism Educator",
    image: "/bord_memeberes/fitih-alemu.jpeg",
    bio: "Fitih Alemu is a journalism educator, researcher, media development professional, and trainer with more than 13 years of experience in journalism teaching, corporate communication, and public relations. She has worked extensively in strategic communication and project implementation, with a strong focus on advancing gender equality in Ethiopian journalism practice and education. As co-founder of the Ethiopian Journalism Educators' Network, she has taught and mentored aspiring journalists at the university level and serves as a research and training consultant specializing in gender, media, communication, and institutional capacity building. Her work includes initiatives that strengthen the role of women journalists, promote gender equality in media, and advance ethical, inclusive journalism.",
  },
  {
    name: "Mihret Aschalew",
    role: "Media and Communications Specialist",
    image: "/bord_memeberes/mihret-aschalew.jpeg",
    bio: "Mihret Aschalew is a senior media and communications specialist with extensive leadership experience in international journalism, global development, and public health. She currently serves as Communications Advisor at JSI, a U.S.-based international organization advancing global health and education. Her career includes senior roles such as Senior Editor at The Reporter Newspaper, Multimedia Journalist for BBC World Horn of Africa Service, Project Manager at BBC Media Action, and Communications Officer for UN Women. Her expertise lies at the intersection of media, communications, and gender advocacy. Mihret holds a Master's in Journalism and Communication, a BA in Political Science, and specialized training in Project Planning and Management from Makerere University. She is a member of FEMNET.",
  },
  {
    name: "Tsega Tariku",
    role: "Journalist and Media Leader",
    image: "/bord_memeberes/tsega-tariku.jpeg",
    bio: "Tsega Tariku is a distinguished Ethiopian journalist and media leader with over sixteen years of dynamic experience at Fana Media Corporation. Rising from reporter to Editor-in-Chief, she has excelled as a radio host, television presenter, and digital content creator. Her work is defined by specialization in gender, environment, health, and business reporting, consistently championing gender advocacy across platforms. Holding a Master's in Public Diplomacy from Jilin University, China, Tsega is also a trainer, public speaker, and regional media representative. Currently serving as Director of Branding, Creative and Quality Control at Fana Media Corporation, she continues to shape impactful narratives and drive innovation in Ethiopian media.",
  },
];

type BoardMember = (typeof BOARD_MEMBERS)[number];

function BoardSection() {
  const [selectedMember, setSelectedMember] = useState<BoardMember | null>(null);

  useEffect(() => {
    if (!selectedMember) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSelectedMember(null);
    };
    document.addEventListener("keydown", closeOnEscape);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", closeOnEscape);
      document.body.style.overflow = "";
    };
  }, [selectedMember]);

  return <>
    <section className="about-board" aria-labelledby="board-heading">
      <header className="about-board-header">
        <div>
          <p className="about2-eyebrow">Our leadership</p>
          <h2 id="board-heading">Meet the Board.</h2>
        </div>
        <p>EMWA's Board provides strategic direction, governance, and oversight while championing the Association's commitment to women in media. Select a portrait to learn more.</p>
      </header>
      <div className="about-board-carousel">
        <div className="about-board-track">
          {[0, 1].map((group) => <div className="about-board-group" aria-hidden={group === 1} key={group}>
            {BOARD_MEMBERS.map((member) => <article className="about-board-card" key={`${group}-${member.name}`}>
              <button className="about-board-portrait" type="button" onClick={() => setSelectedMember(member)} aria-label={`Read more about ${member.name}`} tabIndex={group === 1 ? -1 : 0}>
                <img src={member.image} alt="" loading="lazy" />
                <span>View profile</span>
              </button>
              <div className="about-board-card-body">
                <p className="about-board-role">{member.role}</p>
                <h3>{member.name}</h3>
              </div>
            </article>)}
          </div>)}
        </div>
      </div>
    </section>

    {selectedMember && <div className="about-board-modal-backdrop" role="presentation" onMouseDown={(event) => {
      if (event.target === event.currentTarget) setSelectedMember(null);
    }}>
      <div className="about-board-modal" role="dialog" aria-modal="true" aria-labelledby="board-modal-name" aria-describedby="board-modal-bio">
        <button className="about-board-modal-close" type="button" onClick={() => setSelectedMember(null)} aria-label="Close profile"><X /></button>
        <img src={selectedMember.image} alt="" />
        <div className="about-board-modal-copy">
          <p className="about-board-role">{selectedMember.role}</p>
          <h2 id="board-modal-name">{selectedMember.name}</h2>
          <p id="board-modal-bio">{selectedMember.bio}</p>
        </div>
      </div>
    </div>}
  </>;
}

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

    <BoardSection />

    <section className="about2-community"><div><p className="about2-eyebrow">Who we serve</p><h2>Our beneficiaries.</h2><div className="about2-people-grid">{BENEFICIARIES.map((item) => <span key={item}><Users />{item}</span>)}</div></div><aside><p className="about2-eyebrow">Key stakeholders</p><h2>Accountability starts with relationship.</h2><ul>{STAKEHOLDERS.map((item) => <li key={item}>{item}</li>)}</ul></aside></section>

  </PageShell>;
}
