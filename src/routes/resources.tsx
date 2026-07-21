import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, ArrowUpRight, BookOpen, Download, FileCheck2, Search } from "lucide-react";
import { PageShell } from "@/components/page-shell";
import { API_BASE } from "@/lib/admin-api";

export const Route = createFileRoute("/resources")({
  head: () => ({ meta: [
    { title: "Resource Center — EMWA" },
    { name: "description", content: "Research, reports, practical toolkits, and policy resources from the Ethiopian Media Women Association." },
  ] }),
  component: Resources,
});

type ResourceDocument = {
  id: string; title: string; category: string; format: string; size: string;
  year: string; description: string; accent: "burgundy" | "ochre" | "sage" | "blue";
  fileUrl: string; createdAt: string;
};

const formatFileSize = (value: unknown) => {
  const bytes = Number(value);
  if (!Number.isFinite(bytes) || bytes <= 0) return "File";
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const resolveFileUrl = (value: unknown) => {
  if (!value) return "";
  try {
    const origin = new URL(API_BASE).origin;
    const url = new URL(String(value), origin);
    return url.pathname.startsWith("/uploads/") ? `${origin}${url.pathname}` : url.toString();
  } catch { return ""; }
};

function Resources() {
  const [documents, setDocuments] = useState<ResourceDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState<"newest" | "popular" | "title">("newest");

  useEffect(() => {
    const controller = new AbortController();
    void (async () => {
      try {
        const response = await fetch(`${API_BASE}/public/resources`, { signal: controller.signal });
        if (!response.ok) throw new Error("Unable to load resources");
        const payload = await response.json();
        const accents: ResourceDocument["accent"][] = ["burgundy", "ochre", "sage", "blue"];
        setDocuments((Array.isArray(payload.data) ? payload.data : []).map((row: Record<string, unknown>, index: number) => {
          const createdAt = String(row.created_at ?? new Date().toISOString());
          const mime = String(row.mime_type ?? "");
          return {
            id: String(row.id), title: String(row.title), description: String(row.description),
            category: String(row.category || "Resources"),
            format: mime.includes("pdf") ? "PDF" : mime.split("/")[1]?.toUpperCase() || "FILE",
            size: formatFileSize(row.file_size), year: String(new Date(createdAt).getFullYear()),
            accent: accents[index % accents.length], fileUrl: resolveFileUrl(row.file_url), createdAt,
          };
        }));
        setLoadError("");
      } catch (error) {
        if (error instanceof Error && error.name !== "AbortError") setLoadError("The resource library could not be loaded. Please try again.");
      } finally { if (!controller.signal.aborted) setLoading(false); }
    })();
    return () => controller.abort();
  }, []);

  const categories = useMemo(() => ["All", ...new Set(documents.map((item) => item.category))], [documents]);
  const featured = documents[0];
  const filtered = useMemo(() => documents.filter((item) =>
    (category === "All" || item.category === category) &&
    (!query.trim() || `${item.title} ${item.description}`.toLowerCase().includes(query.toLowerCase())))
    .sort((a, b) => sort === "title" ? a.title.localeCompare(b.title) : b.createdAt.localeCompare(a.createdAt)),
  [documents, query, category, sort]);

  return <PageShell>
    <section className="resources-hero">
      <div className="resources-hero-copy">
        <p className="resources-eyebrow">Open knowledge / EMWA</p>
        <h1>Evidence for action.<br /><em>Tools for the work.</em></h1>
        <p>A public collection of research, practical guidance, and policy thinking for journalists, newsrooms, educators, and advocates.</p>
        <a href="#resource-library">Explore the library <ArrowRight /></a>
        <div className="resources-hero-note"><FileCheck2 /><span>Free to download<br /><strong>Designed to be cited and shared</strong></span></div>
      </div>
      {featured && <article className="resources-featured">
        <div className="resources-featured-cover"><span>EMWA<br />Resource</span><strong>{featured.year}</strong><i aria-hidden="true">01</i></div>
        <div className="resources-featured-copy"><p>Featured publication</p><h2>{featured.title}</h2><p>{featured.description}</p><div><span>{featured.format}</span><span>Open access</span><span>{featured.size}</span></div><a href={featured.fileUrl} target="_blank" rel="noreferrer" download>Download resource <Download /></a></div>
      </article>}
    </section>

    <section className="resources-library" id="resource-library" aria-labelledby="resource-library-heading">
      <header className="resources-section-head"><div><p className="resources-eyebrow">Resource library</p><h2 id="resource-library-heading">Find what you need.</h2></div><p>Search the complete archive by topic or browse collections built for research, practice, and policy.</p></header>
      <div className="resources-controls">
        <label className="resources-search"><Search /><span className="sr-only">Search resources</span><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search title or topic" /></label>
        <label className="resources-sort"><span>Sort</span><select value={sort} onChange={(event) => setSort(event.target.value as typeof sort)}><option value="newest">Newest first</option><option value="popular">Most downloaded</option><option value="title">Title A–Z</option></select></label>
      </div>
      <div className="resources-categories" role="group" aria-label="Filter resources">{categories.map((item) => <button key={item} className={category === item ? "is-active" : ""} aria-pressed={category === item} onClick={() => setCategory(item)}>{item}<span>{item === "All" ? documents.length : documents.filter((document) => document.category === item).length}</span></button>)}</div>
      <div className="resources-result-count"><p><strong>{filtered.length}</strong> resources available</p><span>Live resource library</span></div>
      {loading ? <Empty title="Loading resources..." /> : loadError ? <Empty title="Resources unavailable." message={loadError} /> : filtered.length ?
        <div className="resources-grid" aria-live="polite">{filtered.map((document, index) => <article className={`resource-card resource-card--${document.accent}`} key={document.id}>
          <div className="resource-card-cover"><span>{document.category}</span><strong>{document.year}</strong><i aria-hidden="true">{String(index + 1).padStart(2, "0")}</i><small>EMWA Resource Center</small></div>
          <div className="resource-card-content"><div className="resource-card-meta"><span>{document.format} / {document.size}</span><span>Open access</span></div><h3>{document.title}</h3><p>{document.description}</p><div className="resource-card-actions"><a href={document.fileUrl} target="_blank" rel="noreferrer" download><Download /> Download</a><a href={document.fileUrl} target="_blank" rel="noreferrer" aria-label={`View ${document.title}`}><ArrowUpRight /></a></div></div>
        </article>)}</div> :
        <div className="resources-empty"><BookOpen /><h3>No resources found.</h3><p>Try another search term or collection.</p><button onClick={() => { setQuery(""); setCategory("All"); }}>Reset library</button></div>}
    </section>

    <section className="resources-guidance"><div><p className="resources-eyebrow">Using our resources</p><h2>Use them. Cite them.<br />Put them to work.</h2></div><div className="resources-guidance-list"><article><span>01</span><div><h3>Open access</h3><p>Resources are free for professional, educational, and advocacy use.</p></div></article><article><span>02</span><div><h3>Credit the source</h3><p>Use the publication title, EMWA, and publication year when citing.</p></div></article><article><span>03</span><div><h3>Need another format?</h3><p>Contact our team for accessible or print-ready versions.</p></div></article></div></section>
    <section className="resources-request"><div><p className="resources-eyebrow">Can&apos;t find it?</p><h2>Tell us what would<br />help your newsroom.</h2></div><button>Request a resource <ArrowUpRight /></button></section>
  </PageShell>;
}

function Empty({ title, message }: { title: string; message?: string }) {
  return <div className="resources-empty" role="status"><BookOpen /><h3>{title}</h3>{message && <p>{message}</p>}</div>;
}
