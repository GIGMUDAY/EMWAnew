import { createFileRoute } from "@tanstack/react-router";
import { PageShell, PageHero } from "@/components/page-shell";
import { useState } from "react";
import { Search, Download, FileText } from "lucide-react";

export const Route = createFileRoute("/resources")({
  head: () => ({
    meta: [
      { title: "Resource Center — EMWA" },
      { name: "description", content: "Research papers, reports, toolkits, and downloadable resources from the Ethiopian Media Women Association." },
      { property: "og:title", content: "Resource Center — EMWA" },
      { property: "og:description", content: "Research, reports, toolkits, and downloadable resources from EMWA." },
    ],
  }),
  component: Resources,
});

const CATS = ["All", "Research", "Reports", "Toolkits", "Policies"] as const;

const DOCS = [
  { t: "State of Women in Ethiopian Media 2026", c: "Reports", type: "PDF", size: "4.2 MB", dl: 2840, y: "2026" },
  { t: "Digital Safety Toolkit for Journalists", c: "Toolkits", type: "PDF", size: "1.8 MB", dl: 5210, y: "2026" },
  { t: "Newsroom Gender Audit Methodology", c: "Research", type: "PDF", size: "2.4 MB", dl: 1240, y: "2025" },
  { t: "Policy Brief: Public Broadcasting Reform", c: "Policies", type: "PDF", size: "890 KB", dl: 680, y: "2025" },
  { t: "Investigative Reporting Field Guide", c: "Toolkits", type: "PDF", size: "3.1 MB", dl: 3120, y: "2024" },
  { t: "Ten Years of EMWA — Impact Report", c: "Reports", type: "PDF", size: "6.4 MB", dl: 940, y: "2024" },
  { t: "Ethical Guidelines for Election Coverage", c: "Policies", type: "PDF", size: "1.1 MB", dl: 1780, y: "2024" },
  { t: "Trauma-informed Journalism Handbook", c: "Toolkits", type: "PDF", size: "2.7 MB", dl: 2410, y: "2023" },
];

function Resources() {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<(typeof CATS)[number]>("All");
  const filtered = DOCS.filter(d =>
    (cat === "All" || d.c === cat) &&
    (q === "" || d.t.toLowerCase().includes(q.toLowerCase()))
  );

  return (
    <PageShell>
      <PageHero
        eyebrow="Resource Center"
        title={<>Research. Reports. <span className="text-primary">Tools.</span></>}
        lede="A public library of research, reports, toolkits, and policy briefs — freely downloadable and citable."
      />

      <section className="py-8 border-b border-border sticky top-[73px] bg-background/95 backdrop-blur z-40">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search documents..."
              className="w-full pl-12 pr-4 py-4 border border-border bg-background outline-none focus:border-foreground"
            />
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {CATS.map(c => (
              <button
                key={c}
                onClick={() => setCat(c)}
                className={`label-mono px-4 py-2 border transition-all ${cat === c ? "bg-foreground text-background border-foreground" : "border-border hover:border-foreground"}`}
              >{c}</button>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-[1400px] mx-auto px-6">
          <p className="label-mono text-muted-foreground mb-8">{filtered.length} documents</p>
          <div className="border-t border-foreground">
            {filtered.map(d => (
              <div key={d.t} className="grid md:grid-cols-12 gap-4 py-6 border-b border-border items-center hover:bg-muted/40 transition-colors group">
                <div className="md:col-span-1">
                  <FileText className="size-8 text-primary" />
                </div>
                <div className="md:col-span-6">
                  <p className="font-display text-2xl leading-tight group-hover:text-primary transition-colors">{d.t}</p>
                  <p className="label-mono text-muted-foreground mt-1">{d.c} · {d.y}</p>
                </div>
                <div className="md:col-span-2 label-mono text-muted-foreground">{d.type} · {d.size}</div>
                <div className="md:col-span-2 label-mono text-muted-foreground">{d.dl.toLocaleString()} downloads</div>
                <div className="md:col-span-1 text-right">
                  <a href="#" className="inline-flex items-center gap-2 label-mono border border-foreground px-4 py-2 hover:bg-foreground hover:text-background transition-colors">
                    <Download className="size-3" /> Get
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </PageShell>
  );
}
