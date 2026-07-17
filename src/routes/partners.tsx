import { createFileRoute } from "@tanstack/react-router";
import { PageShell, PageHero } from "@/components/page-shell";

export const Route = createFileRoute("/partners")({
  head: () => ({
    meta: [
      { title: "Partners — EMWA" },
      { name: "description", content: "EMWA's strategic partners, government collaborators, NGOs, and international organizations advancing gender equity in media." },
      { property: "og:title", content: "Partners — EMWA" },
      { property: "og:description", content: "Strategic partners and collaborators of the Ethiopian Media Women Association." },
    ],
  }),
  component: Partners,
});

const GROUPS = [
  {
    h: "Strategic Partners",
    items: ["Ethiopian Broadcasting Corporation", "Fana Broadcasting", "Walta Media", "Addis Standard", "Reporter Newspaper"],
    color: "bg-primary text-primary-foreground",
  },
  {
    h: "Government",
    items: ["Ministry of Women and Social Affairs", "Ethiopian Media Authority", "House of Peoples' Representatives", "Addis Ababa City Administration"],
    color: "bg-secondary text-secondary-foreground",
  },
  {
    h: "International",
    items: ["UNESCO", "UN Women", "European Union Delegation", "DW Akademie", "Fojo Media Institute", "Internews", "Article 19"],
    color: "bg-accent text-foreground",
  },
  {
    h: "Civil Society",
    items: ["African Media Women Alliance", "Ethiopian Human Rights Commission", "Addis Ababa University School of Journalism", "Media Council of Ethiopia"],
    color: "bg-foreground text-background",
  },
];

function Partners() {
  return (
    <PageShell>
      <PageHero
        eyebrow="Partners & Alliances"
        title={<>We move <span className="text-primary">together.</span></>}
        lede="EMWA works in formal partnership with government, private media, international organizations, and civil society across Ethiopia and beyond."
      />

      {/* Logo strip */}
      <section className="py-16 border-b border-border overflow-hidden">
        <div className="flex gap-16 whitespace-nowrap animate-marquee">
          {[...GROUPS.flatMap(g => g.items), ...GROUPS.flatMap(g => g.items)].map((p, i) => (
            <div key={i} className="font-display text-2xl text-muted-foreground/60 shrink-0">{p}</div>
          ))}
        </div>
      </section>

      {/* Groups */}
      <section className="py-24">
        <div className="max-w-[1400px] mx-auto px-6 grid md:grid-cols-2 gap-6">
          {GROUPS.map(g => (
            <div key={g.h} className={`${g.color} p-12`}>
              <p className="label-mono opacity-80 mb-4">{g.items.length} partners</p>
              <h2 className="font-display text-5xl mb-8">{g.h}</h2>
              <ul className="space-y-3">
                {g.items.map(i => (
                  <li key={i} className="border-t border-current/20 pt-3 flex justify-between items-baseline">
                    <span className="font-display text-2xl">{i}</span>
                    <span className="label-mono opacity-70">→</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Story */}
      <section className="py-24 border-t border-border">
        <div className="max-w-4xl mx-auto px-6">
          <p className="label-mono text-primary mb-6">Partnership Story</p>
          <blockquote className="font-display text-3xl md:text-5xl leading-tight tracking-tight">
            "Our partnership with EMWA reshaped how we recruit and retain
            women editors. Six years in, our newsroom looks like the
            country we cover."
          </blockquote>
          <p className="label-mono text-primary mt-8">Head of News · Ethiopian Broadcasting Corporation</p>
        </div>
      </section>

      {/* Become a partner */}
      <section className="py-24 bg-muted/40 border-y border-border">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="font-display text-5xl md:text-6xl mb-6">Partner with us.</h2>
          <p className="text-muted-foreground mb-8">
            Organizations advancing gender equity in Ethiopian media are
            invited to explore partnership with EMWA.
          </p>
          <a href="mailto:partnerships@emwa.org.et" className="inline-block bg-foreground text-background px-6 py-3 label-mono hover:bg-primary transition-colors">
            partnerships@emwa.org.et
          </a>
        </div>
      </section>
    </PageShell>
  );
}
