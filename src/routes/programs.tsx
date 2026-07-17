import { createFileRoute } from "@tanstack/react-router";
import { PageShell, PageHero } from "@/components/page-shell";
import { useState } from "react";

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
  { title: "Leadership Incubator", cat: "Fellowships", status: "Ongoing", year: "2016 –", stats: "128 alumnae", body: "Six-month executive residency for women moving into editor-in-chief and executive producer roles.", color: "bg-primary text-primary-foreground" },
  { title: "Digital Safety Network", cat: "Ongoing", status: "Ongoing", year: "2011 –", stats: "24/7 hotline", body: "Cybersecurity toolkits and rapid-response legal support for journalists facing online harassment.", color: "bg-secondary text-secondary-foreground" },
  { title: "Regional Newsroom Grants", cat: "Ongoing", status: "Ongoing", year: "2019 –", stats: "82 grants awarded", body: "Micro-grants funding women-led investigative reporting outside Addis Ababa.", color: "bg-accent text-foreground" },
  { title: "Voice on Air Fellowship", cat: "Fellowships", status: "Ongoing", year: "2022 –", stats: "45 fellows", body: "One-year mentorship pairing early-career broadcasters with senior editors.", color: "bg-foreground text-background" },
  { title: "#HerStoryEthiopia", cat: "Campaigns", status: "Completed", year: "2023", stats: "12M reach", body: "National storytelling campaign profiling women leaders in overlooked sectors.", color: "bg-primary text-primary-foreground" },
  { title: "Newsroom Gender Audit", cat: "Completed", status: "Completed", year: "2021", stats: "40 newsrooms", body: "Sector-wide audit of women's representation in editorial and leadership roles.", color: "bg-secondary text-secondary-foreground" },
];

function Programs() {
  const [active, setActive] = useState<(typeof CATEGORIES)[number]>("All");
  const filtered = active === "All" ? PROJECTS : PROJECTS.filter(p => p.cat === active || p.status === active);

  return (
    <PageShell>
      <PageHero
        eyebrow="Programs & Projects"
        title={<>What we <span className="text-primary">build.</span></>}
        lede="Four flagship pillars, dozens of campaigns, and a growing archive of completed work. Every program is designed to shift structural conditions — not to patch symptoms."
      />

      {/* Filters */}
      <section className="py-8 border-b border-border sticky top-[73px] bg-background/95 backdrop-blur z-40">
        <div className="max-w-[1400px] mx-auto px-6 flex gap-2 md:gap-3 flex-wrap">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setActive(c)}
              className={`px-5 py-2 label-mono border transition-all ${active === c ? "bg-foreground text-background border-foreground" : "border-border hover:border-foreground"}`}
            >
              {c}
            </button>
          ))}
        </div>
      </section>

      {/* Projects */}
      <section className="py-16">
        <div className="max-w-[1400px] mx-auto px-6 grid md:grid-cols-2 gap-6">
          {filtered.map((p) => (
            <article key={p.title} className={`p-10 md:p-14 group transition-all hover:-translate-y-1 ${p.color}`}>
              <div className="flex justify-between label-mono mb-8 opacity-80">
                <span>{p.cat}</span>
                <span>{p.year}</span>
              </div>
              <h3 className="font-display text-4xl md:text-5xl mb-4 tracking-tighter">{p.title}</h3>
              <p className="opacity-90 mb-8 leading-relaxed">{p.body}</p>
              <div className="flex justify-between items-end pt-8 border-t border-current/20">
                <div>
                  <p className="label-mono opacity-70">Status</p>
                  <p className="font-display text-2xl mt-1">{p.status}</p>
                </div>
                <div className="text-right">
                  <p className="label-mono opacity-70">Impact</p>
                  <p className="font-display text-2xl mt-1">{p.stats}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Success story */}
      <section className="py-24 border-t border-border">
        <div className="max-w-4xl mx-auto px-6">
          <p className="label-mono text-primary mb-6">Success Story</p>
          <blockquote className="font-display text-4xl md:text-6xl leading-[1.05] tracking-tight">
            "The Regional Grant funded my six-month investigation into
            healthcare gaps in South Omo. It ran on the front page. It
            changed regulation. None of that happens without EMWA."
          </blockquote>
          <p className="label-mono text-primary mt-8">Ayantu B. · Investigative Reporter · Arba Minch</p>
        </div>
      </section>
    </PageShell>
  );
}
