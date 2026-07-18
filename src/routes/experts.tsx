import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ArrowUpRight, BadgeCheck, ChevronDown, Mail, MapPin, Search, Sparkles, X } from "lucide-react";
import { PageShell } from "@/components/page-shell";
import expert1 from "@/assets/expert-1.jpg";
import expert2 from "@/assets/expert-2.jpg";
import expert3 from "@/assets/expert-3.jpg";
import expert4 from "@/assets/value-integrity.png";
import expert5 from "@/assets/value-independence.png";
import expert6 from "@/assets/value-excellence.png";

export const Route = createFileRoute("/experts")({
  head: () => ({
    meta: [
      { title: "Experts Directory — EMWA" },
      { name: "description", content: "Searchable directory of Ethiopian women media experts by region, expertise, and category." },
      { property: "og:title", content: "Experts Directory — EMWA" },
      { property: "og:description", content: "Find verified Ethiopian women experts in journalism, broadcasting, digital media, and more." },
    ],
  }),
  component: Experts,
});

const IMAGES = [expert1, expert2, expert3, expert4, expert5, expert6];
const CATEGORIES = ["All", "Journalism", "Broadcasting", "Digital", "Advocacy", "Academic", "Film"];
const EXPERTS = [
  { n: "Soliyana Gebre", f: "Broadcast Strategy", r: "Addis Ababa", c: "Broadcasting", bio: "Senior broadcast strategist with 15 years of leadership experience shaping national programming and newsroom transformation." },
  { n: "Lidya Tarekegn", f: "Digital Ethics", r: "Bahir Dar", c: "Digital", bio: "Specialist in digital ethics, platform accountability, and online safety for journalists working in high-risk environments." },
  { n: "Rahel Mesfin", f: "Investigative Reporting", r: "Hawassa", c: "Journalism", bio: "Award-winning investigative reporter focusing on environmental accountability, public institutions, and governance." },
  { n: "Hiwot Bekele", f: "Political Analysis", r: "Addis Ababa", c: "Journalism", bio: "Political analyst and columnist translating complex policy and governance issues for public audiences." },
  { n: "Zewditu Alemu", f: "Environmental Reporting", r: "Mekelle", c: "Journalism", bio: "Environmental journalist covering climate resilience, agriculture, water access, and community-led adaptation." },
  { n: "Mahder Gezahegn", f: "Digital Media Strategy", r: "Addis Ababa", c: "Digital", bio: "Digital strategist building audience-first editorial products across nonprofit and independent media organizations." },
  { n: "Selamawit Tadesse", f: "Human Rights", r: "Jimma", c: "Advocacy", bio: "Advocacy specialist supporting accurate, trauma-informed gender and human-rights reporting." },
  { n: "Dr. Ayantu Bekele", f: "Media Ethics", r: "Adama", c: "Academic", bio: "Researcher and educator advancing media ethics, journalism curricula, and responsible public communication." },
  { n: "Meskerem Haile", f: "Radio Production", r: "Dire Dawa", c: "Broadcasting", bio: "Radio producer and trainer specializing in community broadcasting, audio storytelling, and regional audiences." },
  { n: "Yordanos Mengesha", f: "Freelance Reporting", r: "Mekelle", c: "Journalism", bio: "Independent reporter covering conflict, recovery, displacement, and deeply reported human stories." },
  { n: "Tigist Wolde", f: "Editorial Leadership", r: "Addis Ababa", c: "Journalism", bio: "Editorial leader experienced in newsroom transformation, team development, standards, and commissioning." },
  { n: "Bethlehem Girma", f: "Documentary Film", r: "Hawassa", c: "Film", bio: "Documentary filmmaker creating character-led films centered on social justice and overlooked communities." },
];

type Expert = (typeof EXPERTS)[number];

function Experts() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState<"name" | "field">("name");
  const [registerOpen, setRegisterOpen] = useState(false);
  const [selected, setSelected] = useState<Expert | null>(null);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const locked = registerOpen || selected;
    document.body.style.overflow = locked ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [registerOpen, selected]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return EXPERTS.filter((expert) =>
      (category === "All" || expert.c === category) &&
      (!needle || [expert.n, expert.f, expert.r, expert.c].some((value) => value.toLowerCase().includes(needle)))
    ).sort((a, b) => sort === "name" ? a.n.localeCompare(b.n) : a.f.localeCompare(b.f));
  }, [query, category, sort]);

  return (
    <PageShell>
      <section className="experts-hero">
        <div className="experts-hero-copy">
          <p className="experts-eyebrow">The Expertise Archive / EMWA</p>
          <h1>Knowledge has<br />a <em>voice.</em></h1>
          <p>A curated, verified network of Ethiopian women ready to inform reporting, shape policy, mentor peers, and lead public conversation.</p>
          <div className="experts-hero-actions">
            <a href="#expert-directory">Browse the directory <ArrowUpRight aria-hidden="true" /></a>
            <button onClick={() => setRegisterOpen(true)}>Submit your profile</button>
          </div>
          <div className="experts-hero-proof"><span><strong>400+</strong> verified voices</span><span><strong>12</strong> regions represented</span><span><BadgeCheck aria-hidden="true" /> reviewed by EMWA</span></div>
        </div>
        <div className="experts-hero-portrait">
          <img src={expert4} alt="Ethiopian woman media expert reviewing documents" />
          <div className="experts-hero-portrait-shade" aria-hidden="true" />
          <div className="experts-hero-dossier"><span>Featured field</span><strong>Media ethics<br />& accountability</strong><p>Addis Ababa / Ethiopia</p></div>
          <span className="experts-hero-index" aria-hidden="true">E/01</span>
        </div>
      </section>

      <section className="experts-directory" id="expert-directory" aria-labelledby="experts-directory-heading">
        <header className="experts-directory-header">
          <div><p className="experts-eyebrow">Verified professionals</p><h2 id="experts-directory-heading">Find the right voice.</h2></div>
          <p>Search by discipline, name, or region to find a source, speaker, mentor, trainer, or collaborator.</p>
        </header>

        <div className="experts-toolbar">
          <label className="experts-search"><Search aria-hidden="true" /><span className="sr-only">Search experts</span><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search name, skill, region..." /></label>
          <label className="experts-sort"><span>Sort by</span><select value={sort} onChange={(event) => setSort(event.target.value as "name" | "field")}><option value="name">Name</option><option value="field">Expertise</option></select><ChevronDown aria-hidden="true" /></label>
        </div>

        <div className="experts-categories" role="group" aria-label="Filter by expertise category">
          {CATEGORIES.map((item) => <button key={item} onClick={() => setCategory(item)} className={category === item ? "is-active" : ""} aria-pressed={category === item}>{item}<span>{item === "All" ? EXPERTS.length : EXPERTS.filter((expert) => expert.c === item).length}</span></button>)}
        </div>

        <div className="experts-results-bar"><p>Showing <strong>{filtered.length}</strong> verified experts</p><button onClick={() => setRegisterOpen(true)}><Sparkles aria-hidden="true" /> Add your expertise</button></div>

        {filtered.length ? (
          <div className="experts-grid">
            {filtered.map((expert) => {
              const sourceIndex = EXPERTS.indexOf(expert);
              return (
                <article className="expert-card" key={expert.n}>
                  <button className="expert-card-image" onClick={() => setSelected(expert)} aria-label={`View ${expert.n}'s profile`}>
                    <img src={IMAGES[sourceIndex % IMAGES.length]} alt={expert.n} loading="lazy" />
                    <span className="expert-card-category">{expert.c}</span><span className="expert-card-open"><ArrowUpRight aria-hidden="true" /></span>
                  </button>
                  <div className="expert-card-copy">
                    <p className="expert-card-verified"><BadgeCheck aria-hidden="true" /> EMWA verified</p>
                    <h3>{expert.n}</h3><p className="expert-card-field">{expert.f}</p><p className="expert-card-region"><MapPin aria-hidden="true" /> {expert.r}</p>
                    <button onClick={() => setSelected(expert)}>View expertise <ArrowUpRight aria-hidden="true" /></button>
                  </div>
                </article>
              );
            })}
          </div>
        ) : <div className="experts-empty"><Search aria-hidden="true" /><h3>No matching experts.</h3><p>Try another name, field, region, or category.</p><button onClick={() => { setQuery(""); setCategory("All"); }}>Reset directory</button></div>}
      </section>

      <section className="experts-register-cta"><div><p className="experts-eyebrow">Be discoverable</p><h2>Your knowledge belongs<br />in the conversation.</h2></div><button onClick={() => setRegisterOpen(true)}>Join the directory <ArrowUpRight aria-hidden="true" /></button></section>

      {selected && <div className="expert-panel-backdrop" onMouseDown={() => setSelected(null)}><aside className="expert-profile-panel" onMouseDown={(event) => event.stopPropagation()} aria-modal="true" role="dialog" aria-label={`${selected.n}'s expert profile`}><button className="expert-panel-close" onClick={() => setSelected(null)} aria-label="Close profile"><X /></button><div className="expert-panel-photo"><img src={IMAGES[EXPERTS.indexOf(selected) % IMAGES.length]} alt={selected.n} /></div><div className="expert-panel-content"><p className="expert-card-verified"><BadgeCheck /> EMWA verified expert</p><h2>{selected.n}</h2><p className="expert-panel-field">{selected.f}</p><p className="expert-card-region"><MapPin /> {selected.r}</p><div className="expert-panel-rule" /><p className="expert-panel-bio">{selected.bio}</p><div className="expert-panel-tags"><span>{selected.c}</span><span>Available for interviews</span><span>Mentorship</span></div><a href="mailto:experts@emwa.org.et?subject=Expert enquiry"><Mail /> Request an introduction</a></div></aside></div>}

      {registerOpen && <div className="expert-panel-backdrop" onMouseDown={() => setRegisterOpen(false)}><aside className="expert-register-sheet" onMouseDown={(event) => event.stopPropagation()} aria-modal="true" role="dialog" aria-labelledby="register-expert-heading"><button className="expert-panel-close" onClick={() => setRegisterOpen(false)} aria-label="Close registration"><X /></button>{submitted ? <div className="expert-submit-success"><BadgeCheck /><p className="experts-eyebrow">Application received</p><h2>Thank you for adding your voice.</h2><p>EMWA will review your profile and contact you before it appears in the directory.</p><button onClick={() => { setSubmitted(false); setRegisterOpen(false); }}>Close</button></div> : <><header><p className="experts-eyebrow">Expert registration</p><h2 id="register-expert-heading">Join Ethiopia&apos;s trusted media directory.</h2><p>Share enough detail for our team to verify your experience and build a useful public profile.</p></header><form onSubmit={(event) => { event.preventDefault(); setSubmitted(true); }}><div className="expert-form-grid"><label><span>Full name *</span><input name="fullName" required placeholder="Your professional name" /></label><label><span>Professional title *</span><input name="position" required placeholder="e.g. Investigative reporter" /></label><label><span>Primary expertise *</span><select name="category" required defaultValue=""><option value="" disabled>Select a field</option>{CATEGORIES.slice(1).map((item) => <option key={item}>{item}</option>)}</select></label><label><span>Location *</span><input name="location" required placeholder="City / Region" /></label><label className="expert-form-wide"><span>Professional biography *</span><textarea name="bio" required rows={5} placeholder="Describe your expertise, experience, and the topics you can speak about." /></label><label><span>Email address *</span><input name="email" type="email" required placeholder="name@example.com" /></label><label><span>Phone number</span><input name="phone" type="tel" placeholder="+251 ..." /></label><label className="expert-form-wide"><span>Profile photo</span><input name="photo" type="file" accept="image/*" /></label><label className="expert-form-consent expert-form-wide"><input type="checkbox" required /><span>I confirm this information is accurate and consent to EMWA reviewing it for publication.</span></label></div><footer><p>Review normally takes 5–7 working days.</p><button type="submit">Submit for review <ArrowUpRight /></button></footer></form></>}</aside></div>}
    </PageShell>
  );
}
