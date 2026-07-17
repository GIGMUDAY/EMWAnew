import { createFileRoute } from "@tanstack/react-router";
import { PageShell, PageHero } from "@/components/page-shell";
import globalImg from "@/assets/emwa-replace.jpg";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About EMWA — Ethiopian Media Women Association" },
      { name: "description", content: "History, vision, mission, leadership, and structure of Ethiopia's leading professional association for women in media." },
      { property: "og:title", content: "About EMWA" },
      { property: "og:description", content: "History, vision, mission, and leadership of the Ethiopian Media Women Association." },
    ],
  }),
  component: About,
});

const TIMELINE = [
  { year: "1998", title: "Founded in Addis Ababa", body: "Twelve women journalists convene to establish a formal association for women in Ethiopian media." },
  { year: "2004", title: "First regional chapter", body: "The Amhara chapter opens in Bahir Dar, followed by Oromia and Tigray within eighteen months." },
  { year: "2011", title: "Digital Safety Program launches", body: "In response to growing online harassment, EMWA formalizes rapid-response support." },
  { year: "2016", title: "Leadership Incubator", body: "A structured pathway for women moving into editorial leadership begins its first cohort." },
  { year: "2020", title: "Pandemic mutual-aid fund", body: "EMWA distributes emergency grants to 200+ freelance women journalists nationwide." },
  { year: "2024", title: "Twelfth chapter opens", body: "The Sidama chapter formalizes EMWA's presence in every regional state." },
  { year: "2026", title: "Policy brief submitted", body: "First formal gender-equity brief submitted to Parliament on public broadcasting." },
];

const VALUES = [
  { h: "Solidarity", b: "We move as one across region, language, and outlet." },
  { h: "Integrity", b: "We hold our members and ourselves to the highest ethical standard." },
  { h: "Independence", b: "Our advocacy is not for sale. We refuse funding that compromises voice." },
  { h: "Excellence", b: "We invest in craft — training, mentorship, and rigor." },
];

const LEADERS = [
  { name: "Bethlehem Tadesse", role: "President", img: globalImg },
  { name: "Selamawit Alemu", role: "Vice President", img: globalImg },
  { name: "Hiwot Kebede", role: "Executive Director", img: globalImg },
];

function About() {
  return (
    <PageShell>
      <PageHero
        eyebrow="About the Association"
        title={<>Twenty-five years <br /><span className="text-primary">of collective voice.</span></>}
        lede="EMWA is a legally registered, member-led professional association for women working across Ethiopia's media landscape — from national broadcasters and legacy newspapers to independent digital outlets and regional radio."
      />

      <section className="py-24">
        <div className="max-w-[1400px] mx-auto px-6 grid md:grid-cols-2 gap-16">
          <div>
            <img src={globalImg} alt="EMWA members in a working session" width={1600} height={1000} loading="lazy" className="w-full aspect-[4/3] object-cover" />
          </div>
          <div>
            <p className="label-mono text-primary mb-4">Origin</p>
            <h2 className="font-display text-5xl leading-none mb-6">A room. Twelve women. One conviction.</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              EMWA was founded in 1998 in a rented conference room in Addis
              Ababa by twelve women journalists who were tired of being the
              only woman in every editorial meeting. Their conviction was
              simple: professional solidarity would produce better journalism
              and a safer profession.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              A quarter-century later, EMWA counts 1,200+ active members
              across twelve regional chapters, runs four flagship programs,
              and formally advises regulators and public broadcasters on
              gender equity.
            </p>
          </div>
        </div>
      </section>

      {/* Vision / Mission */}
      <section className="py-24 bg-foreground text-background">
        <div className="max-w-[1400px] mx-auto px-6 grid md:grid-cols-3 gap-12">
          {[
            { h: "Vision", b: "An Ethiopian media landscape where women's voices, leadership, and safety are non-negotiable." },
            { h: "Mission", b: "To advance the professional standing, safety, and leadership of women in Ethiopian media through advocacy, training, and network." },
            { h: "Reach", b: "Twelve regional chapters, 1,200+ members, and formal partnerships with Ethiopia's leading broadcasters and universities." },
          ].map((c) => (
            <div key={c.h} className="border-t border-accent pt-8">
              <p className="label-mono text-accent mb-6">{c.h}</p>
              <p className="font-display text-3xl leading-tight">{c.b}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Values */}
      <section className="py-24">
        <div className="max-w-[1400px] mx-auto px-6">
          <p className="label-mono text-primary mb-4">Core Values</p>
          <h2 className="font-display text-5xl md:text-6xl mb-16">Four commitments.</h2>
          <div className="grid md:grid-cols-4 gap-8">
            {VALUES.map((v, i) => (
              <div key={v.h} className="border-t border-foreground pt-6">
                <p className="label-mono text-muted-foreground mb-2">0{i + 1}</p>
                <p className="font-display text-3xl mb-3">{v.h}</p>
                <p className="text-sm text-muted-foreground">{v.b}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-24 border-t border-border">
        <div className="max-w-[1400px] mx-auto px-6">
          <p className="label-mono text-primary mb-4">Timeline</p>
          <h2 className="font-display text-5xl md:text-6xl mb-16">A generational arc.</h2>
          <ol className="relative border-l-2 border-border ml-4 md:ml-8">
            {TIMELINE.map((t) => (
              <li key={t.year} className="mb-12 pl-8 md:pl-12 relative">
                <span className="absolute -left-[9px] top-2 w-4 h-4 bg-primary rounded-full" />
                <div className="font-display text-5xl text-primary">{t.year}</div>
                <p className="font-display text-2xl mt-2">{t.title}</p>
                <p className="text-muted-foreground mt-2 max-w-2xl">{t.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Leadership */}
      <section className="py-24 bg-muted/40 border-y border-border">
        <div className="max-w-[1400px] mx-auto px-6">
          <p className="label-mono text-primary mb-4">Executive Board</p>
          <h2 className="font-display text-5xl md:text-6xl mb-16">Leadership.</h2>
          <div className="grid md:grid-cols-3 gap-12">
            {LEADERS.map((l) => (
              <div key={l.name}>
                <div className="aspect-[4/5] overflow-hidden mb-4">
                  <img src={l.img} alt={l.name} width={800} height={1000} loading="lazy" className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-500" />
                </div>
                <p className="font-display text-3xl">{l.name}</p>
                <p className="label-mono text-primary mt-2">{l.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </PageShell>
  );
}
