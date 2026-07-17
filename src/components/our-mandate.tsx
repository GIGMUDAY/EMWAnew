import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";

/* ── tiny scroll-reveal hook ── */
function useInView(threshold = 0.25) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect(); // fire once only
        }
      },
      { threshold }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, inView };
}

const PILLARS = [
  {
    n: "01",
    word: "Advocate",
    tagline: "Policy that centres women",
    body: "We lobby newsrooms, broadcast regulators, and government bodies to enshrine gender-equitable hiring, pay, and editorial leadership in every newsroom across Ethiopia.",
    accentClass: "mandate-accent-burgundy",
  },
  {
    n: "02",
    word: "Equip",
    tagline: "Skills, safety & solidarity",
    body: "Through targeted training, rapid-response legal aid, and digital safety toolkits, we ensure no journalist faces a threat — physical or online — without a lifeline.",
    accentClass: "mandate-accent-ochre",
  },
  {
    n: "03",
    word: "Connect",
    tagline: "From Addis to the diaspora",
    body: "Twelve regional chapters and a growing international network weave Ethiopia's women in media into a single, irreversible force — from Hawassa to Helsinki.",
    accentClass: "mandate-accent-sage",
  },
];

export default function OurMandate() {
  const { ref: quoteRef, inView } = useInView(0.2);

  return (
    <section className="mandate-section" id="our-mandate" aria-labelledby="mandate-heading">

      {/* ── HEADER BAND ── */}
      <div className="mandate-header">
        <p className="mandate-eyebrow">Our Mandate</p>
        <div className="mandate-header-rule" aria-hidden="true" />
      </div>

      {/* ── HERO STATEMENT ── */}
      <div className="mandate-hero">
        <h2 className="mandate-statement" id="mandate-heading">
          We exist so that every Ethiopian woman
          with&nbsp;a&nbsp;story&nbsp;to&nbsp;tell has the{" "}
          <em className="mandate-em">tools,&nbsp;protection,</em> and{" "}
          <em className="mandate-em">platform</em> to tell it.
        </h2>

        {/* Decorative cross-hatched square — Ethiopian editorial motif */}
        <div className="mandate-motif" aria-hidden="true">
          <div className="mandate-motif-inner">
            {Array.from({ length: 9 }).map((_, i) => (
              <span key={i} className="mandate-motif-cell" />
            ))}
          </div>
        </div>
      </div>

      {/* ── THREE PILLARS ── */}
      <div className="mandate-pillars">
        {PILLARS.map((p) => (
          <article key={p.n} className={`mandate-pillar ${p.accentClass}`}>
            <header className="mandate-pillar-header">
              <span className="mandate-pillar-num">{p.n}</span>
              <span className="mandate-pillar-slash" aria-hidden="true">/</span>
              <span className="mandate-pillar-tag">{p.tagline}</span>
            </header>

            <h3 className="mandate-pillar-word">{p.word}</h3>

            <p className="mandate-pillar-body">{p.body}</p>

            <div className="mandate-pillar-bar" aria-hidden="true" />
          </article>
        ))}
      </div>

      {/* ── CINEMATIC DARK QUOTE BAND ── scroll-revealed */}
      <div
        ref={quoteRef}
        className={`mandate-quote-band${inView ? " mandate-quote-band--visible" : ""}`}
        aria-label="Founding quote"
      >
        {/* Scan-line overlay */}
        <div className="mandate-quote-scanlines" aria-hidden="true" />

        {/* Left gold accent bar */}
        <div className="mandate-quote-accent-bar" aria-hidden="true" />

        <div className="mandate-quote-inner">
          <blockquote className="mandate-quote">

            {/* Opening mark + source — animate in first */}
            <div className="mandate-quote-top">
              <span className="mandate-quote-mark" aria-hidden="true">"</span>
              <cite className="mandate-quote-source">
                <span className="mandate-quote-name">EMWA Founding Charter</span>
                <span className="mandate-quote-dot" aria-hidden="true"> · </span>
                <span className="mandate-quote-role">Addis Ababa, 1998</span>
              </cite>
            </div>

            {/* Main quote text — animate in second */}
            <p className="mandate-quote-text">
              Media freedom is not merely a press right —{" "}
              <span className="mandate-quote-highlight">it is a human right.</span>{" "}
              And in Ethiopia, it begins with making sure{" "}
              <span className="mandate-quote-highlight">women can speak.</span>
            </p>

            {/* Divider line — animate in third */}
            <div className="mandate-quote-divider" aria-hidden="true" />

          </blockquote>

          {/* CTA — animate in last */}
          <Link
            to="/about"
            className="mandate-cta"
            aria-label="Read our full mandate and history"
          >
            Read our full mandate
            <ArrowUpRight className="mandate-cta-icon" aria-hidden="true" />
          </Link>
        </div>

        {/* Decorative large background text */}
        <span className="mandate-bg-word" aria-hidden="true">EMWA</span>
      </div>
    </section>
  );
}
