import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";

/* ── per-card scroll reveal ── */
function useCardInView() {
  const ref = useRef<HTMLLIElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.18 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return { ref, visible };
}

const PILLARS = [
  {
    n: "01",
    title: "Leadership Incubator",
    body: "Accelerating women into editor-in-chief and executive producer roles through executive coaching and residency.",
    accent: "bp-card--default",
  },
  {
    n: "02",
    title: "Media Safety Protocols",
    body: "Legal, digital, and physical protection for journalists reporting from the field.",
    accent: "bp-card--default",
  },
  {
    n: "03",
    title: "Regional Newsroom Grants",
    body: "Micro-grants that fund women-led investigative reporting outside Addis Ababa.",
    accent: "bp-card--default",
  },
  {
    n: "04",
    title: "Voice on Air Fellowship",
    body: "A one-year fellowship pairing early-career broadcasters with senior mentors nationwide.",
    accent: "bp-card--featured",
  },
];

function PillarCard({
  pillar,
  index,
  isLast,
}: {
  pillar: (typeof PILLARS)[0];
  index: number;
  isLast: boolean;
}) {
  const { ref, visible } = useCardInView();

  return (
    <li
      ref={ref}
      className={`bp-item${visible ? " bp-item--visible" : ""}`}
      style={{ "--delay": `${index * 0.12}s` } as React.CSSProperties}
    >
      {/* Vertical connecting line */}
      {!isLast && <div className="bp-connector" aria-hidden="true" />}

      {/* Number badge */}
      <div className="bp-badge" aria-hidden="true">
        {pillar.n}
      </div>

      {/* Card */}
      <Link to="/programs" className={`bp-card ${pillar.accent}`}>
        <span className="bp-card-label">Initiative</span>
        <h3 className="bp-card-title">{pillar.title}</h3>
        <p className="bp-card-body">{pillar.body}</p>
        <span className="bp-card-cta">
          Learn more <ArrowUpRight className="bp-cta-icon" aria-hidden="true" />
        </span>
      </Link>
    </li>
  );
}

export default function OurBlueprint() {
  const headerRef = useRef<HTMLDivElement>(null);
  const [headerVisible, setHeaderVisible] = useState(false);

  useEffect(() => {
    const el = headerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHeaderVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section className="bp-section" id="our-blueprint" aria-labelledby="bp-heading">
      <div className="bp-inner">

        {/* ── Left: sticky header ── */}
        <div
          ref={headerRef}
          className={`bp-header${headerVisible ? " bp-header--visible" : ""}`}
        >
          <p className="bp-eyebrow">Our Blueprint</p>
          <h2 className="bp-headline" id="bp-heading">
            Four <span className="bp-headline-accent">pillars.</span>
          </h2>
          <p className="bp-subtext">
            Designing structural change through curated initiatives that span
            policy, safety, funding, and voice.
          </p>
          <Link to="/programs" className="bp-all-link">
            All programs <ArrowUpRight className="bp-all-icon" aria-hidden="true" />
          </Link>
        </div>

        {/* ── Right: timeline ── */}
        <ol className="bp-timeline" aria-label="Four programme pillars">
          {PILLARS.map((p, i) => (
            <PillarCard
              key={p.n}
              pillar={p}
              index={i}
              isLast={i === PILLARS.length - 1}
            />
          ))}
        </ol>

      </div>
    </section>
  );
}
