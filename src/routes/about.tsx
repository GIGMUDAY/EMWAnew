import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { PageShell, PageHero } from "@/components/page-shell";
import globalImg from "@/assets/emwa-replace.jpg";
import solidarityImg from "@/assets/value-solidarity.png";
import integrityImg from "@/assets/value-integrity.png";
import independenceImg from "@/assets/value-independence.png";
import excellenceImg from "@/assets/value-excellence.png";

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

const VALUE_IMAGES = [solidarityImg, integrityImg, independenceImg, excellenceImg];

function TimelineItem({ item, index }: { item: (typeof TIMELINE)[number]; index: number }) {
  const ref = useRef<HTMLLIElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3, rootMargin: "0px 0px -10% 0px" },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <li
      ref={ref}
      className={`about-timeline-item${index % 2 ? " about-timeline-item--right" : ""}${visible ? " is-visible" : ""}`}
    >
      <span className="about-timeline-node" aria-hidden="true">
        <span />
      </span>
      <article className="about-timeline-card">
        <p className="about-timeline-index">Milestone / 0{index + 1}</p>
        <time className="about-timeline-year">{item.year}</time>
        <h3 className="about-timeline-name">{item.title}</h3>
        <p className="about-timeline-body">{item.body}</p>
      </article>
    </li>
  );
}

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
      <section className="about-vmr-section">
        <div className="about-vmr-container">
          <div className="about-vmr-grid">
            {[
              { h: "Vision", b: "An Ethiopian media landscape where women's voices, leadership, and safety are non-negotiable." },
              { h: "Mission", b: "To advance the professional standing, safety, and leadership of women in Ethiopian media through advocacy, training, and network." },
              { h: "Reach", b: "Twelve regional chapters, 1,200+ members, and formal partnerships with Ethiopia's leading broadcasters and universities." },
            ].map((c) => (
              <article key={c.h} className="about-vmr-card">
                <p className="about-vmr-badge">{c.h}</p>
                <p className="about-vmr-body">{c.b}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="about-values-section" aria-labelledby="about-values-heading">
        <div className="about-values-container">
          <header className="about-values-header">
            <div>
              <p className="about-values-eyebrow">Core Values</p>
              <h2 className="about-values-title" id="about-values-heading">
                Four <span>commitments.</span>
              </h2>
            </div>
            <p className="about-values-intro">
              The principles that shape how we advocate, collaborate, and
              serve women working across Ethiopia's media landscape.
            </p>
          </header>

          <div className="about-values-manifesto">
            {VALUES.slice(0, 3).map((v, i) => (
              <article key={v.h} className={`about-manifesto-item${i % 2 ? " about-manifesto-item--reverse" : ""}`}>
                <span className="about-manifesto-number" aria-hidden="true">0{i + 1}</span>
                <div className="about-manifesto-image-wrap">
                  <img src={VALUE_IMAGES[i]} alt="" loading="lazy" className="about-manifesto-image" />
                  <span className="about-manifesto-image-shade" aria-hidden="true" />
                </div>
                <div className="about-manifesto-panel">
                  <p className="about-manifesto-kicker">Commitment 0{i + 1}</p>
                  <h3 className="about-manifesto-name">{v.h}</h3>
                  <p className="about-manifesto-body">{v.b}</p>
                  <span className="about-manifesto-rule" aria-hidden="true" />
                </div>
              </article>
            ))}

            <article className="about-manifesto-finale">
              <span className="about-manifesto-number about-manifesto-number--final" aria-hidden="true">04</span>
              <h3 className="about-manifesto-finale-title">{VALUES[3].h}</h3>
              <div className="about-manifesto-finale-grid">
                <blockquote className="about-manifesto-quote">
                  “{VALUES[3].b}”
                  <span aria-hidden="true" />
                </blockquote>
                <div className="about-manifesto-image-wrap about-manifesto-image-wrap--square">
                  <img src={VALUE_IMAGES[3]} alt="" loading="lazy" className="about-manifesto-image" />
                </div>
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="about-timeline-section" aria-labelledby="about-timeline-heading">
        <div className="about-timeline-container">
          <header className="about-timeline-header">
            <div>
              <p className="about-timeline-eyebrow">Timeline</p>
              <h2 className="about-timeline-title" id="about-timeline-heading">
                A generational <span>arc.</span>
              </h2>
            </div>
            <p className="about-timeline-intro">
              From twelve determined founders to a nationwide movement—scroll
              through the moments that shaped EMWA.
            </p>
          </header>

          <ol className="about-timeline-list">
            <span className="about-timeline-track" aria-hidden="true" />
            {TIMELINE.map((item, index) => (
              <TimelineItem key={item.year} item={item} index={index} />
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
