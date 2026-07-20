import { createFileRoute, Link } from "@tanstack/react-router";
import { type FormEvent, useState } from "react";
import { PageShell } from "@/components/page-shell";
import YoutubeNewsFeed from "@/components/youtube-news-feed";
import OurMandate from "@/components/our-mandate";
import OurBlueprint from "@/components/our-blueprint";
import MembershipCta from "@/components/membership-cta";
import VoicesSlider from "@/components/voices-slider";
import StrategicAlliances from "@/components/strategic-alliances";
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

const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:4000/api/v1";

export const Route = createFileRoute("/")({
  component: Home,
});

const STATS = [
  { value: 1200, suffix: "+", label: "Active Members", color: "text-primary" },
  { value: 12, suffix: "", label: "Regional Chapters", color: "text-secondary" },
  { value: 450, suffix: "", label: "Trained Journalists", color: "text-accent" },
  { value: 25, suffix: "+", label: "Year Legacy", color: "" },
];

const EXPERTS = [
  {
    name: "Soliyana Gebre",
    field: "Broadcast Strategy",
    region: "Addis Ababa",
    image: LANDING_IMAGES.experts[0],
  },
  {
    name: "Lidya Tarekegn",
    field: "Digital Ethics",
    region: "Bahir Dar",
    image: LANDING_IMAGES.experts[1],
  },
  {
    name: "Rahel Mesfin",
    field: "Investigative Reporting",
    region: "Hawassa",
    image: LANDING_IMAGES.experts[2],
  },
];

const NEWS = [
  {
    date: "12 Nov 2026",
    category: "Policy",
    title: "EMWA submits gender-equity brief to the House of Peoples' Representatives",
    excerpt:
      "A joint policy brief on women's representation in state broadcasting was formally received this week.",
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
    excerpt:
      "Rapid-response legal support is now available to member journalists in two new regions.",
  },
];

function Home() {
  const [newsletterStatus, setNewsletterStatus] = useState<
    "idle" | "submitting" | "success" | "error"
  >("idle");
  const [newsletterMessage, setNewsletterMessage] = useState("");

  const subscribe = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setNewsletterStatus("submitting");
    setNewsletterMessage("");
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "").trim();

    try {
      const response = await fetch(`${API_BASE}/public/newsletter-subscriptions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload?.error?.message ?? "Unable to subscribe right now.");
      }
      setNewsletterStatus("success");
      setNewsletterMessage("You’re subscribed to The Narrative Shift.");
      event.currentTarget.reset();
    } catch (error) {
      setNewsletterStatus("error");
      setNewsletterMessage(error instanceof Error ? error.message : "Unable to subscribe.");
    }
  };

  return (
    <PageShell>
      {/* HERO */}
      <section className="relative flex flex-col md:flex-row min-h-[calc(100svh-65px)] border-b border-border">
        <div className="md:w-7/12 relative order-2 md:order-1 overflow-hidden min-h-[42svh] md:min-h-0 bg-muted">
          <img
            src={LANDING_IMAGES.hero.src}
            alt={LANDING_IMAGES.hero.alt}
            width={1800}
            height={1200}
            fetchPriority="high"
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1.5s] hover:scale-[1.02]"
          />
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
            Empowering Ethiopian women in media through strategic advocacy, professional
            development, and a collective roar that echoes across the Horn of Africa.
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

      {/* OUR MANDATE */}
      <OurMandate />

      {/* BLUEPRINT / TIMELINE */}
      <OurBlueprint />

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
              <Link to="/experts" key={e.name} className="group cursor-pointer block no-underline">
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
              <h2 className="font-display text-5xl md:text-7xl tracking-tighter leading-none">
                Newsroom
              </h2>
            </div>
            <Link
              to="/updates"
              hash="news"
              className="label-mono border-b border-foreground pb-1 hover:text-primary hover:border-primary transition-all"
            >
              All stories →
            </Link>
          </div>
          <div className="grid md:grid-cols-3 gap-px bg-border">
            {NEWS.map((n) => (
              <article
                key={n.title}
                className="bg-background p-8 hover:bg-muted/50 transition-colors cursor-pointer"
              >
                <div className="flex justify-between label-mono text-muted-foreground mb-6">
                  <span>{n.date}</span>
                  <span className="text-primary">{n.category}</span>
                </div>
                <h3 className="font-display text-2xl leading-tight mb-4">{n.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{n.excerpt}</p>
                <div className="mt-6 label-mono inline-flex items-center gap-1 group">
                  Read{" "}
                  <ArrowUpRight className="size-3 group-hover:translate-x-1 transition-transform" />
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* MEMBERSHIP CTA */}
      <MembershipCta />

      {/* TESTIMONIALS SLIDER */}
      <VoicesSlider />

      {/* STRATEGIC ALLIANCES */}
      <StrategicAlliances />

      {/* NEWSLETTER */}
      <section className="nl-section" id="newsletter" aria-labelledby="nl-heading">
        {/* Decorative background word */}
        <span className="nl-bg-word" aria-hidden="true">
          DISPATCH
        </span>

        <div className="nl-inner">
          {/* Left: copy */}
          <div className="nl-left">
            <p className="nl-eyebrow">The Narrative Shift</p>
            <h2 className="nl-heading" id="nl-heading">
              Monthly insights
              <br />
              from the Horn.
            </h2>
            <p className="nl-body">
              A curated dispatch on media, gender, and policy across Ethiopia and East Africa —
              straight to your inbox.
            </p>
          </div>

          {/* Right: form */}
          <div className="nl-right">
            <form className="nl-form" onSubmit={subscribe}>
              <label htmlFor="nl-email" className="nl-label">
                Your email address
              </label>
              <div className="nl-field-row">
                <input
                  id="nl-email"
                  name="email"
                  type="email"
                  required
                  placeholder="name@example.com"
                  className="nl-input"
                  aria-label="Email address"
                />
                <button
                  type="submit"
                  className="nl-btn"
                  disabled={newsletterStatus === "submitting"}
                >
                  {newsletterStatus === "submitting" ? "Subscribing…" : "Subscribe"}
                  <svg className="nl-btn-icon" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <path
                      d="M3 8h10M9 4l4 4-4 4"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </div>
              <p
                className={`nl-note${newsletterStatus === "success" ? " is-success" : newsletterStatus === "error" ? " is-error" : ""}`}
                role={newsletterMessage ? "status" : undefined}
              >
                {newsletterMessage || "One dispatch per month · Unsubscribe anytime · No spam."}
              </p>
            </form>
          </div>
        </div>

        <InspirationalQuotes />
      </section>
    </PageShell>
  );
}
