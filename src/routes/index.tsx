import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell } from "@/components/page-shell";
import YoutubeNewsFeed from "@/components/youtube-news-feed";
import InspirationalQuotes from "@/components/inspirational-quotes";
import { CountUp } from "@/components/count-up";
import {
  ArrowUpRight,
  ArrowDown,
  Radio,
  Globe2,
  Newspaper,
  BookOpen,
  Landmark,
  Tv,
  ShieldCheck,
  Signal,
} from "lucide-react";

// Landing-page placeholder images. Replace any `src` value here to update the
// corresponding image without changing the page layout.
const LANDING_IMAGES = {
  hero: {
    src: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=1800&q=85",
    alt: "Confident African woman representing women working in media",
  },
  conference: {
    src: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1600&q=85",
    alt: "Professionals exchanging ideas during a collaborative conference session",
  },
  experts: [
    {
      src: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=900&q=85",
      alt: "Portrait of a woman media professional",
    },
    {
      src: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=900&q=85",
      alt: "Portrait of a woman digital media specialist",
    },
    {
      src: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=85",
      alt: "Portrait of a woman investigative journalist",
    },
  ],
} as const;

export const Route = createFileRoute("/")({
  component: Home,
});

const STATS = [
  { value: 1200, suffix: "+", label: "Active Members", color: "text-primary" },
  { value: 12, suffix: "", label: "Regional Chapters", color: "text-secondary" },
  { value: 450, suffix: "", label: "Trained Journalists", color: "text-accent" },
  { value: 25, suffix: "+", label: "Year Legacy", color: "" },
];

const PROGRAMS = [
  {
    n: "01",
    title: "Leadership Incubator",
    body: "Accelerating women into editor-in-chief and executive producer roles through executive coaching and residency.",
    hover: "hover:bg-primary",
  },
  {
    n: "02",
    title: "Media Safety Protocols",
    body: "Legal, digital, and physical protection for journalists reporting from the field.",
    hover: "hover:bg-secondary",
  },
  {
    n: "03",
    title: "Regional Newsroom Grants",
    body: "Micro-grants that fund women-led investigative reporting outside Addis Ababa.",
    hover: "hover:bg-accent hover:text-foreground",
  },
  {
    n: "04",
    title: "Voice on Air Fellowship",
    body: "A one-year fellowship pairing early-career broadcasters with senior mentors nationwide.",
    hover: "hover:bg-primary",
  },
];

const EXPERTS = [
  { name: "Soliyana Gebre", field: "Broadcast Strategy", region: "Addis Ababa", image: LANDING_IMAGES.experts[0] },
  { name: "Lidya Tarekegn", field: "Digital Ethics", region: "Bahir Dar", image: LANDING_IMAGES.experts[1] },
  { name: "Rahel Mesfin", field: "Investigative Reporting", region: "Hawassa", image: LANDING_IMAGES.experts[2] },
];

const NEWS = [
  {
    date: "12 Nov 2026",
    category: "Policy",
    title: "EMWA submits gender-equity brief to the House of Peoples' Representatives",
    excerpt: "A joint policy brief on women's representation in state broadcasting was formally received this week.",
  },
  {
    date: "04 Nov 2026",
    category: "Program",
    title: "Third cohort of the Leadership Incubator graduates in Addis Ababa",
    excerpt: "38 women editors and producers from nine regions completed the six-month residency.",
  },
  {
    date: "27 Oct 2026",
    category: "Advocacy",
    title: "Digital safety network expands to Amhara and Sidama regions",
    excerpt: "Rapid-response legal support is now available to member journalists in two new regions.",
  },
];

const EVENTS = [
  { day: "22", month: "NOV", title: "Regional Chapter Convening — Hawassa", time: "09:00 EAT" },
  { day: "05", month: "DEC", title: "Media Ethics Symposium 2026", time: "Full day" },
  { day: "18", month: "DEC", title: "Year-end Members Assembly", time: "14:00 EAT" },
];

const PARTNERS = [
  { name: "UNESCO", icon: Globe2 },
  { name: "UN Women", icon: ShieldCheck },
  { name: "Ethiopian Press Agency", icon: Newspaper },
  { name: "Fojo Media Institute", icon: BookOpen },
  { name: "European Union", icon: Landmark },
  { name: "DW Akademie", icon: Radio },
  { name: "Article 19", icon: Signal },
  { name: "Internews", icon: Tv },
];

function Home() {
  return (
    <PageShell>
      {/* HERO */}
      <section className="relative flex flex-col md:flex-row min-h-[calc(100svh-65px)] border-b border-border">
        <div className="md:w-7/12 relative order-2 md:order-1 overflow-hidden min-h-[42svh] md:min-h-0 bg-muted">
          <img src={LANDING_IMAGES.hero.src} alt={LANDING_IMAGES.hero.alt} width={1800} height={1200} fetchPriority="high" className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1.5s] hover:scale-[1.02]" />
        </div>
        <div className="md:w-5/12 flex flex-col justify-center px-5 py-14 sm:px-8 md:p-12 lg:p-16 xl:p-20 order-1 md:order-2">
          <p className="label-mono text-primary mb-6 animate-reveal">Est. 1998 · Addis Ababa</p>
          <h1 className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl leading-[0.88] tracking-tighter mb-7 md:mb-8 text-balance animate-reveal">
            The Voice
            <br />
            of Ethiopia's
            <br />
            <span className="text-secondary">Vanguard</span>
          </h1>
          <p className="text-lg leading-snug max-w-md text-muted-foreground animate-reveal">
            Empowering Ethiopian women in media through strategic advocacy,
            professional development, and a collective roar that echoes across
            the Horn of Africa.
          </p>
          <div className="mt-10 flex flex-wrap gap-3 animate-reveal">
            <Link
              to="/membership"
              className="bg-foreground text-background px-6 py-3 label-mono hover:bg-primary transition-colors inline-flex items-center gap-2"
            >
              Become a member <ArrowUpRight className="size-3" />
            </Link>
            <Link
              to="/programs"
              className="border border-foreground px-6 py-3 label-mono hover:bg-foreground hover:text-background transition-colors"
            >
              Explore programs
            </Link>
          </div>
          <div className="mt-10 lg:mt-16 hidden md:flex items-center gap-3 label-mono text-muted-foreground animate-reveal">
            <ArrowDown className="size-3 animate-bounce" /> Scroll
          </div>
        </div>
      </section>

      {/* WOMEN NEWS FEED (YouTube) */}
      <YoutubeNewsFeed />

      {/* STATS */}
      <section className="py-20 border-y border-border">
        <div className="max-w-[1400px] mx-auto px-6 grid grid-cols-2 lg:grid-cols-4 gap-10">
          {STATS.map((s) => (
            <div key={s.label}>
              <div className={`font-display text-6xl md:text-7xl ${s.color}`}>
                <CountUp end={s.value} suffix={s.suffix} />
              </div>
              <div className="label-mono mt-3">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* MISSION */}
      <section className="py-24 md:py-32">
        <div className="max-w-[1400px] mx-auto px-6 grid md:grid-cols-12 gap-12">
          <div className="md:col-span-4">
            <p className="label-mono text-primary">Our Mandate</p>
          </div>
          <div className="md:col-span-8">
            <h2 className="font-display text-5xl md:text-7xl leading-[0.95] tracking-tighter">
              We exist so that every Ethiopian woman with a story to tell has
              the tools, protection, and platform to tell it.
            </h2>
            <div className="mt-12 grid sm:grid-cols-3 gap-8">
              {[
                { h: "Advocate", b: "For gender-equitable policy in newsrooms, regulators, and broadcasters." },
                { h: "Equip", b: "Through training, mentorship, and legal support that meet women where they are." },
                { h: "Connect", b: "Members across twelve regional chapters and the Ethiopian diaspora." },
              ].map((c) => (
                <div key={c.h} className="border-t border-foreground pt-6">
                  <p className="font-display text-2xl mb-3">{c.h}</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">{c.b}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* PROGRAMS */}
      <section className="py-24 md:py-32 bg-foreground text-background">
        <div className="max-w-[1400px] mx-auto px-6 grid md:grid-cols-12 gap-8 md:gap-16">
          <div className="md:col-span-4">
            <p className="label-mono text-accent mb-6">Our Blueprint</p>
            <h2 className="font-display text-6xl md:text-7xl leading-none">
              Four <br />
              <span className="text-accent">pillars.</span>
            </h2>
            <p className="text-background/60 mt-8 text-sm leading-relaxed max-w-xs">
              Designing structural change through curated initiatives that span
              policy, safety, funding, and voice.
            </p>
            <Link
              to="/programs"
              className="mt-8 inline-flex items-center gap-2 label-mono border-b border-accent pb-1 text-accent hover:gap-4 transition-all"
            >
              All programs <ArrowUpRight className="size-3" />
            </Link>
          </div>
          <div className="md:col-span-8 grid sm:grid-cols-2 gap-4">
            {PROGRAMS.map((p) => (
              <Link
                to="/programs"
                key={p.n}
                className={`bg-background/5 border border-background/10 p-6 md:p-8 transition-all duration-300 group hover:-translate-y-1 hover:shadow-xl ${p.hover}`}
              >
                <div className="label-mono text-accent mb-4 group-hover:text-background transition-colors">
                  {p.n} / Initiative
                </div>
                <h4 className="font-display text-3xl mb-4">{p.title}</h4>
                <p className="text-sm text-background/60 group-hover:text-background transition-colors">
                  {p.body}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* EXPERTS SPOTLIGHT */}
      <section className="py-24 md:py-32">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-6">
            <div>
              <p className="label-mono text-primary mb-4">Experts Directory</p>
              <h2 className="font-display text-5xl md:text-7xl tracking-tighter leading-none">
                Women who move
                <br />
                Ethiopian media forward.
              </h2>
            </div>
            <Link
              to="/experts"
              className="label-mono border-b border-foreground pb-1 hover:text-primary hover:border-primary transition-all"
            >
              View all 400+ experts →
            </Link>
          </div>
          <div className="grid md:grid-cols-3 gap-8 md:gap-12">
            {EXPERTS.map((e) => (
              <Link
                to="/experts"
                key={e.name}
                className="group cursor-pointer block"
              >
                <div className="aspect-[4/5] overflow-hidden mb-6 bg-muted">
                  <img
                    src={e.image.src}
                    alt={`${e.name} — ${e.image.alt}`}
                    loading="lazy"
                    width={800}
                    height={1000}
                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105"
                  />
                </div>
                <h3 className="font-display text-3xl group-hover:text-primary transition-colors">
                  {e.name}
                </h3>
                <p className="label-mono text-primary mt-2">
                  {e.field} / {e.region}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* NEWS */}
      <section className="py-24 md:py-32 bg-muted/40 border-y border-border">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-6">
            <div>
              <p className="label-mono text-primary mb-4">Latest Dispatches</p>
              <h2 className="font-display text-5xl md:text-7xl tracking-tighter leading-none">Newsroom</h2>
            </div>
            <Link to="/updates" hash="news" className="label-mono border-b border-foreground pb-1 hover:text-primary hover:border-primary transition-all">
              All stories →
            </Link>
          </div>
          <div className="grid md:grid-cols-3 gap-px bg-border">
            {NEWS.map((n) => (
              <article key={n.title} className="bg-background p-8 hover:bg-muted/50 transition-colors cursor-pointer">
                <div className="flex justify-between label-mono text-muted-foreground mb-6">
                  <span>{n.date}</span>
                  <span className="text-primary">{n.category}</span>
                </div>
                <h3 className="font-display text-2xl leading-tight mb-4">{n.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{n.excerpt}</p>
                <div className="mt-6 label-mono inline-flex items-center gap-1 group">
                  Read <ArrowUpRight className="size-3 group-hover:translate-x-1 transition-transform" />
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* EVENTS + FEATURED */}
      <section className="py-24 md:py-32">
        <div className="max-w-[1400px] mx-auto px-6 grid md:grid-cols-12 gap-12">
          <div className="md:col-span-7">
            <div className="relative aspect-[4/3] overflow-hidden">
              <img
                src={LANDING_IMAGES.conference.src}
                alt={LANDING_IMAGES.conference.alt}
                loading="lazy"
                width={1200}
                height={900}
                className="w-full h-full object-cover"
              />
            </div>
            <p className="label-mono text-primary mt-8">Featured Event</p>
            <h3 className="font-display text-4xl md:text-5xl mt-4 max-w-lg">
              Media Ethics Symposium 2026
            </h3>
            <p className="mt-4 text-muted-foreground max-w-lg">
              A three-day gathering of editors, academics, and regulators to
              examine ethics in a post-truth media landscape.
            </p>
            <Link
              to="/updates"
              hash="events"
              className="mt-6 inline-block bg-foreground text-background px-6 py-3 label-mono hover:bg-primary transition-colors"
            >
              Register your seat
            </Link>
          </div>
          <div className="md:col-span-5">
            <p className="label-mono text-primary mb-8">Upcoming</p>
            <ul>
              {EVENTS.map((e) => (
                <li key={e.title} className="flex gap-6 py-6 border-t border-border last:border-b hover:bg-muted/40 transition-colors cursor-pointer">
                  <div className="text-center min-w-16">
                    <div className="font-display text-5xl leading-none">{e.day}</div>
                    <div className="label-mono text-primary mt-1">{e.month}</div>
                  </div>
                  <div className="flex-1">
                    <p className="font-display text-2xl leading-tight">{e.title}</p>
                    <p className="label-mono text-muted-foreground mt-2">{e.time}</p>
                  </div>
                  <ArrowUpRight className="size-4 self-center" />
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* MEMBERSHIP CTA */}
      <section className="py-24 md:py-32 bg-primary text-primary-foreground">
        <div className="max-w-[1400px] mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <p className="label-mono text-accent mb-6">Membership</p>
            <h2 className="font-display text-6xl md:text-8xl leading-none tracking-tighter">
              Add your voice.
            </h2>
          </div>
          <div>
            <p className="text-lg leading-relaxed mb-8">
              EMWA membership is open to Ethiopian women working in journalism,
              broadcasting, communications, academia, and independent media —
              from Addis Ababa to Assosa.
            </p>
            <ul className="space-y-3 mb-10">
              {[
                "Full access to the Experts Directory",
                "Legal and digital safety support",
                "Priority for grants, fellowships, and residencies",
                "Regional chapter membership",
              ].map((b) => (
                <li key={b} className="flex gap-3 items-start">
                  <span className="text-accent">→</span>
                  <span>{b}</span>
                </li>
              ))}
            </ul>
            <Link
              to="/membership"
              className="inline-flex items-center gap-2 bg-background text-foreground px-6 py-3 label-mono hover:bg-accent transition-colors"
            >
              Apply for membership <ArrowUpRight className="size-3" />
            </Link>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-24 md:py-32">
        <div className="max-w-[1400px] mx-auto px-6">
          <p className="label-mono text-primary mb-6">Voices</p>
          <div className="grid md:grid-cols-2 gap-16">
            {[
              {
                q: "EMWA didn't just train me. It gave me a peer network of women editors who I still call when I need to check my instincts on a hard story.",
                a: "Meskerem H.",
                r: "Senior Editor, Fana Broadcasting",
              },
              {
                q: "The digital safety toolkit and rapid-response legal help arrived within hours of a coordinated harassment campaign against me. That is what real solidarity looks like.",
                a: "Yordanos M.",
                r: "Independent Journalist, Mekelle",
              },
            ].map((t) => (
              <figure key={t.a} className="border-t border-foreground pt-8">
                <blockquote className="font-display text-3xl md:text-4xl leading-tight tracking-tight">
                  "{t.q}"
                </blockquote>
                <figcaption className="mt-6 label-mono">
                  <span className="text-primary">{t.a}</span> · {t.r}
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* PARTNERS */}
      <section className="py-20 border-y border-border overflow-hidden">
        <p className="label-mono text-center text-muted-foreground mb-10">
          Strategic Alliances
        </p>
        <div className="flex gap-8 animate-marquee whitespace-nowrap">
          {[...PARTNERS, ...PARTNERS].map((p, i) => {
            const Icon = p.icon;
            return (
              <div
                key={i}
                className="group shrink-0 flex items-center gap-3 border border-border bg-background px-6 py-4 min-w-[220px] transition-all duration-500 hover:border-primary hover:-translate-y-1 hover:shadow-lg hover:bg-primary hover:text-primary-foreground"
              >
                <Icon className="size-8 text-primary transition-transform duration-500 group-hover:rotate-12 group-hover:scale-110 group-hover:text-accent" />
                <span className="font-display text-2xl tracking-tight">
                  {p.name}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      {/* NEWSLETTER */}
      <section className="py-24 md:py-32">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <p className="label-mono text-primary mb-6">The Narrative Shift</p>
          <h3 className="font-display text-5xl md:text-6xl tracking-tighter mb-4">
            Monthly insights from the Horn.
          </h3>
          <p className="mb-10 text-muted-foreground">
            A curated dispatch on media, gender, and policy across Ethiopia
            and East Africa.
          </p>
          <form className="flex flex-col sm:flex-row gap-0 border border-foreground p-1 max-w-md mx-auto">
            <input
              type="email"
              required
              placeholder="Email address"
              className="flex-1 px-4 py-3 bg-transparent outline-none label-mono"
            />
            <button
              type="submit"
              className="bg-foreground text-background px-8 py-3 label-mono hover:bg-primary transition-colors"
            >
              Subscribe
            </button>
          </form>
          <p className="label-mono text-muted-foreground mt-4">
            One dispatch per month. Unsubscribe anytime.
          </p>
        </div>
        <InspirationalQuotes />
      </section>
    </PageShell>
  );
}
