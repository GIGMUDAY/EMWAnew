import { createFileRoute } from "@tanstack/react-router";
import { PageShell, PageHero } from "@/components/page-shell";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import globalImg from "@/assets/emwa-replace.jpg";

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

const IMGS = [globalImg, globalImg, globalImg];

const EXPERTS = [
  { n: "Soliyana Gebre", f: "Broadcast Strategy", r: "Addis Ababa", c: "Broadcasting", bio: "Senior broadcast strategist with 15 years of leadership experience." },
  { n: "Lidya Tarekegn", f: "Digital Ethics", r: "Bahir Dar", c: "Digital", bio: "Specialist in digital ethics and online safety for journalists." },
  { n: "Rahel Mesfin", f: "Investigative Reporting", r: "Hawassa", c: "Journalism", bio: "Investigative reporter focusing on environmental and governance issues." },
  { n: "Hiwot Bekele", f: "Political Analysis", r: "Addis Ababa", c: "Journalism", bio: "Political analyst and columnist with a focus on media policy." },
  { n: "Zewditu Alemu", f: "Environmental Reporting", r: "Mekelle", c: "Journalism", bio: "Environmental journalist covering climate and water issues." },
  { n: "Mahder Gezahegn", f: "Digital Media Strategy", r: "Addis Ababa", c: "Digital", bio: "Digital strategist working across NGOs and independent media." },
  { n: "Selamawit Tadesse", f: "Human Rights", r: "Jimma", c: "Advocacy", bio: "Advocacy specialist supporting gender and human rights reporting." },
  { n: "Dr. Ayantu Bekele", f: "Media Ethics", r: "Adama", c: "Academic", bio: "Academic researcher in media ethics and journalism education." },
  { n: "Meskerem Haile", f: "Radio Production", r: "Dire Dawa", c: "Broadcasting", bio: "Radio producer and trainer with expertise in community radio." },
  { n: "Yordanos Mengesha", f: "Freelance Reporting", r: "Mekelle", c: "Journalism", bio: "Freelance reporter covering conflict and human stories." },
  { n: "Tigist Wolde", f: "Editorial Leadership", r: "Addis Ababa", c: "Journalism", bio: "Editorial leader with experience in newsroom transformation." },
  { n: "Bethlehem Girma", f: "Documentary Film", r: "Hawassa", c: "Film", bio: "Documentary filmmaker focused on social justice stories." },
];


function Experts() {
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<"name" | "position" | "field">("name");

  const filtered = useMemo(() => {
    const res = EXPERTS.filter(e =>
      (q === "" || e.n.toLowerCase().includes(q.toLowerCase()) || e.f.toLowerCase().includes(q.toLowerCase()))
    );
    res.sort((a, b) => {
      if (sort === "name") return a.n.localeCompare(b.n);
      if (sort === "position") return a.f.localeCompare(b.f);
      return a.c.localeCompare(b.c);
    });
    return res;
  }, [q, sort]);

  const [showAdd, setShowAdd] = useState(false);

  return (
    <PageShell>
      <PageHero
        eyebrow="Experts Directory"
        title={<>Find an <span className="text-primary">expert.</span></>}
        lede="A verified directory of 400+ Ethiopian women working across journalism, broadcasting, digital media, film, and academia."
      />

      {/* Search */}
      <section className="py-8 border-b border-border sticky top-[73px] bg-background/95 backdrop-blur z-40">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input
              type="search"
              placeholder="Search by name or expertise..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="w-full pl-12 pr-4 py-4 border border-border bg-background outline-none focus:border-foreground"
            />
          </div>
          <div className="mt-4 flex items-center justify-between">
            <div />
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSort(s => {
                  const order = ["name", "position", "field"] as const;
                  const idx = order.indexOf(s);
                  return order[(idx + 1) % order.length];
                })}
                className="label-mono px-3 py-1 border border-border transition-all bg-background hover:border-foreground"
              >
                Sort: {sort === "name" ? "Name" : sort === "position" ? "Position" : "Field"}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Grid */}
      <section className="py-16">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="flex items-center justify-between mb-6">
            <p className="label-mono text-muted-foreground">Showing {filtered.length} of {EXPERTS.length} experts</p>
            <div className="flex items-center gap-3">
              <button onClick={() => setShowAdd(true)} className="bg-primary text-primary-foreground px-4 py-2 label-mono rounded">Add Expert</button>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {filtered.map((e, i) => (
              <div key={e.n} className="group cursor-pointer">
                <div
                  onClick={() => {
                    const el = document.getElementById(`expert-bio-${i}`);
                    if (!el) return;
                    el.classList.toggle("max-h-0");
                    el.classList.toggle("max-h-96");
                    el.classList.toggle("opacity-0");
                    el.classList.toggle("opacity-100");
                    el.classList.toggle("translate-y-2");
                    el.classList.toggle("translate-y-0");
                  }}
                  className="aspect-[4/5] overflow-hidden bg-muted mb-4 cursor-pointer"
                >
                  <img
                    src={IMGS[i % 3]}
                    alt={e.n}
                    width={800}
                    height={1000}
                    loading="lazy"
                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-500"
                  />
                </div>
                <p className="font-display text-2xl group-hover:text-primary transition-colors">{e.n}</p>
                <p className="label-mono text-primary mt-1">{e.f}</p>
                <p className="label-mono text-muted-foreground mt-1">{e.r}</p>

                <div id={`expert-bio-${i}`} className="overflow-hidden max-h-0 opacity-0 translate-y-2 transition-all duration-500">
                  <div className="mt-4 p-4 bg-background border border-border rounded">
                    <p className="text-sm text-muted-foreground">{e.bio}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {filtered.length === 0 && (
            <div className="text-center py-16 text-muted-foreground">
              <p className="font-display text-3xl">No experts match your filters.</p>
              <button
                onClick={() => { setQ(""); setSort("name"); }}
                className="mt-4 label-mono underline"
              >
                Clear filters
              </button>
            </div>
          )}

                  {/* Add Expert Modal */}
                  {showAdd && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                      <div className="bg-background rounded p-6 w-full max-w-2xl mx-4">
                        <h3 className="font-display text-2xl mb-4">Add Expert</h3>
                        <form onSubmit={(e) => { e.preventDefault(); const fd = new FormData(e.currentTarget as HTMLFormElement); console.log(Object.fromEntries(fd)); setShowAdd(false); }}>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input name="fullName" placeholder="Full Name" className="border p-2" required />
                            <input name="position" placeholder="Position/Title" className="border p-2" required />
                            <textarea name="bio" placeholder="Biography" className="border p-2 md:col-span-2" rows={4} required />
                            <input name="photo" type="file" accept="image/*" className="border p-2" />
                            <input name="email" type="email" placeholder="Email Address" className="border p-2" />
                            <input name="phone" placeholder="Phone Number" className="border p-2" />
                            <input name="social" placeholder="Social Media Links (comma-separated)" className="border p-2 md:col-span-2" />
                          </div>
                          <div className="mt-4 flex justify-end gap-2">
                            <button type="button" onClick={() => setShowAdd(false)} className="px-4 py-2 border">Cancel</button>
                            <button type="submit" className="px-4 py-2 bg-primary text-primary-foreground">Submit</button>
                          </div>
                        </form>
                      </div>
                    </div>
                  )}
        </div>
      </section>
    </PageShell>
  );
}
