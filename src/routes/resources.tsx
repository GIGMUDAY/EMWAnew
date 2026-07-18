import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowRight, ArrowUpRight, BookOpen, Download, FileCheck2, Search } from "lucide-react";
import { PageShell } from "@/components/page-shell";

export const Route = createFileRoute("/resources")({
  head: () => ({ meta: [
    { title: "Resource Center — EMWA" },
    { name: "description", content: "Research, reports, practical toolkits, and policy resources from the Ethiopian Media Women Association." },
    { property: "og:title", content: "Resource Center — EMWA" },
  ] }),
  component: Resources,
});

const CATEGORIES = ["All", "Research", "Reports", "Toolkits", "Policies"] as const;
const DOCUMENTS = [
  { title: "State of Women in Ethiopian Media 2026", category: "Reports", format: "PDF", size: "4.2 MB", downloads: 2840, year: "2026", pages: "84 pages", description: "A national evidence base on representation, pay, newsroom safety, leadership, and the changing conditions of women working in Ethiopian media.", accent: "burgundy" },
  { title: "Digital Safety Toolkit for Journalists", category: "Toolkits", format: "PDF", size: "1.8 MB", downloads: 5210, year: "2026", pages: "46 pages", description: "Practical checklists, incident-response steps, and safer digital habits for journalists and editorial teams.", accent: "ochre" },
  { title: "Newsroom Gender Audit Methodology", category: "Research", format: "PDF", size: "2.4 MB", downloads: 1240, year: "2025", pages: "58 pages", description: "A repeatable framework for measuring representation, assignment patterns, leadership access, and workplace culture.", accent: "sage" },
  { title: "Policy Brief: Public Broadcasting Reform", category: "Policies", format: "PDF", size: "890 KB", downloads: 680, year: "2025", pages: "18 pages", description: "Recommendations for accountable hiring, gender-responsive programming, and transparent leadership in public media.", accent: "blue" },
  { title: "Investigative Reporting Field Guide", category: "Toolkits", format: "PDF", size: "3.1 MB", downloads: 3120, year: "2024", pages: "72 pages", description: "Field-ready guidance for source protection, verification, interviewing, documentation, and collaborative investigations.", accent: "ochre" },
  { title: "Ten Years of EMWA — Impact Report", category: "Reports", format: "PDF", size: "6.4 MB", downloads: 940, year: "2024", pages: "96 pages", description: "A decade of programs, partnerships, results, member stories, and lessons for building durable media institutions.", accent: "burgundy" },
  { title: "Ethical Guidelines for Election Coverage", category: "Policies", format: "PDF", size: "1.1 MB", downloads: 1780, year: "2024", pages: "28 pages", description: "Editorial principles for accurate, inclusive, conflict-sensitive, and accountable election reporting.", accent: "blue" },
  { title: "Trauma-informed Journalism Handbook", category: "Toolkits", format: "PDF", size: "2.7 MB", downloads: 2410, year: "2023", pages: "64 pages", description: "A practical handbook for interviewing survivors, reducing harm, supporting staff, and reporting with care.", accent: "sage" },
] as const;

function Resources() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]>("All");
  const [sort, setSort] = useState<"newest" | "popular" | "title">("newest");
  const featured = DOCUMENTS[0];
  const filtered = useMemo(() => DOCUMENTS.filter((document) =>
    (category === "All" || document.category === category) &&
    (!query.trim() || `${document.title} ${document.description}`.toLowerCase().includes(query.toLowerCase()))
  ).sort((a, b) => sort === "popular" ? b.downloads - a.downloads : sort === "title" ? a.title.localeCompare(b.title) : Number(b.year) - Number(a.year)), [query, category, sort]);

  return (
    <PageShell>
      <section className="resources-hero">
        <div className="resources-hero-copy">
          <p className="resources-eyebrow">Open knowledge / EMWA</p>
          <h1>Evidence for action.<br /><em>Tools for the work.</em></h1>
          <p>A public collection of research, practical guidance, and policy thinking for journalists, newsrooms, educators, and advocates.</p>
          <a href="#resource-library">Explore the library <ArrowRight /></a>
          <div className="resources-hero-note"><FileCheck2 /><span>Free to download<br /><strong>Designed to be cited and shared</strong></span></div>
        </div>
        <article className="resources-featured">
          <div className="resources-featured-cover"><span>EMWA<br />Research</span><strong>2026</strong><i aria-hidden="true">01</i></div>
          <div className="resources-featured-copy"><p>Featured publication</p><h2>{featured.title}</h2><p>{featured.description}</p><div><span>{featured.format}</span><span>{featured.pages}</span><span>{featured.size}</span></div><button>Download report <Download /></button></div>
        </article>
      </section>

      <section className="resources-library" id="resource-library" aria-labelledby="resource-library-heading">
        <header className="resources-section-head"><div><p className="resources-eyebrow">Resource library</p><h2 id="resource-library-heading">Find what you need.</h2></div><p>Search the complete archive by topic or browse collections built for research, practice, and policy.</p></header>

        <div className="resources-controls">
          <label className="resources-search"><Search /><span className="sr-only">Search resources</span><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search title or topic" /></label>
          <label className="resources-sort"><span>Sort</span><select value={sort} onChange={(event) => setSort(event.target.value as "newest" | "popular" | "title")}><option value="newest">Newest first</option><option value="popular">Most downloaded</option><option value="title">Title A–Z</option></select></label>
        </div>

        <div className="resources-categories" role="group" aria-label="Filter resources">{CATEGORIES.map((item) => <button key={item} className={category === item ? "is-active" : ""} aria-pressed={category === item} onClick={() => setCategory(item)}>{item}<span>{item === "All" ? DOCUMENTS.length : DOCUMENTS.filter((document) => document.category === item).length}</span></button>)}</div>
        <div className="resources-result-count"><p><strong>{filtered.length}</strong> resources available</p><span>Updated November 2026</span></div>

        {filtered.length ? <div className="resources-grid" aria-live="polite">{filtered.map((document) => <article className={`resource-card resource-card--${document.accent}`} key={document.title}><div className="resource-card-cover"><span>{document.category}</span><strong>{document.year}</strong><i aria-hidden="true">{String(DOCUMENTS.indexOf(document) + 1).padStart(2,"0")}</i><small>EMWA Resource Center</small></div><div className="resource-card-content"><div className="resource-card-meta"><span>{document.format} / {document.size}</span><span>{document.pages}</span></div><h3>{document.title}</h3><p>{document.description}</p><div className="resource-card-actions"><button><Download /> Download</button><button aria-label={`View details for ${document.title}`}><ArrowUpRight /></button></div><small>{document.downloads.toLocaleString()} downloads</small></div></article>)}</div> : <div className="resources-empty"><BookOpen /><h3>No resources found.</h3><p>Try another search term or collection.</p><button onClick={() => { setQuery(""); setCategory("All"); }}>Reset library</button></div>}
      </section>

      <section className="resources-guidance">
        <div><p className="resources-eyebrow">Using our resources</p><h2>Use them. Cite them.<br />Put them to work.</h2></div>
        <div className="resources-guidance-list"><article><span>01</span><div><h3>Open access</h3><p>Resources are free for professional, educational, and advocacy use.</p></div></article><article><span>02</span><div><h3>Credit the source</h3><p>Use the publication title, EMWA, and publication year when citing.</p></div></article><article><span>03</span><div><h3>Need another format?</h3><p>Contact our team for accessible or print-ready versions.</p></div></article></div>
      </section>

      <section className="resources-request"><div><p className="resources-eyebrow">Can&apos;t find it?</p><h2>Tell us what would<br />help your newsroom.</h2></div><button>Request a resource <ArrowUpRight /></button></section>
    </PageShell>
  );
}
