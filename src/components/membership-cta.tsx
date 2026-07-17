import { Link } from "@tanstack/react-router";
import { ArrowUpRight, CheckCircle2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";

function useMembershipInView() {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return { ref, inView };
}

export default function MembershipCta() {
  const { ref, inView } = useMembershipInView();

  const BENEFITS = [
    "Full access to the Experts Directory",
    "Legal and digital safety support",
    "Priority for grants, fellowships, and residencies",
    "Regional chapter membership",
  ];

  return (
    <section
      ref={ref}
      className={`member-section ${inView ? "member-section--visible" : ""}`}
      id="membership-cta"
      aria-labelledby="member-heading"
    >
      {/* Decorative large background text */}
      <div className="member-bg-text" aria-hidden="true">
        JOIN EMWA
      </div>

      <div className="member-container">
        <div className="member-grid">
          {/* Left Column: Heading & Subtitle */}
          <div className="member-left">
            <p className="member-eyebrow">Membership</p>
            <h2 className="member-heading" id="member-heading">
              Add your <span className="member-heading-accent">voice.</span>
            </h2>
            <p className="member-description">
              EMWA membership is open to Ethiopian women working in journalism,
              broadcasting, communications, academia, and independent media —
              from Addis Ababa to Assosa.
            </p>
          </div>

          {/* Right Column: Benefits & Button */}
          <div className="member-right">
            <h3 className="member-right-title">Member Benefits</h3>
            <ul className="member-benefits-list">
              {BENEFITS.map((benefit, i) => (
                <li
                  key={i}
                  className="member-benefit-item"
                  style={{ "--item-index": i } as React.CSSProperties}
                >
                  <CheckCircle2 className="member-benefit-icon" aria-hidden="true" />
                  <span className="member-benefit-text">{benefit}</span>
                </li>
              ))}
            </ul>

            <div className="member-action-wrap">
              <Link
                to="/membership"
                className="member-btn"
                aria-label="Apply for membership online"
              >
                Apply for membership
                <ArrowUpRight className="member-btn-icon" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
