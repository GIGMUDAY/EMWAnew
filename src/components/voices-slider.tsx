import { ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { Link } from "@tanstack/react-router";

type Testimonial = {
  quote: string;
  author: string;
  role: string;
};

const TESTIMONIALS: Testimonial[] = [
  {
    quote: "EMWA didn't just train me. It gave me a peer network of women editors who I still call when I need to check my instincts on a hard story.",
    author: "Meskerem H.",
    role: "Senior Editor, Fana Broadcasting",
  },
  {
    quote: "The digital safety toolkit and rapid-response legal help arrived within hours of a coordinated harassment campaign against me. That is what real solidarity looks like.",
    author: "Yordanos M.",
    role: "Independent Journalist, Mekelle",
  },
];

function useVoicesInView() {
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
      { threshold: 0.25 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return { ref, inView };
}

export default function VoicesSlider() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isSliding, setIsSliding] = useState(false);
  const { ref, inView } = useVoicesInView();

  const handleNext = () => {
    if (isSliding) return;
    setIsSliding(true);
    setTimeout(() => {
      setActiveIndex((prev) => (prev + 1) % TESTIMONIALS.length);
      setIsSliding(false);
    }, 400); // match fade duration
  };

  const handlePrev = () => {
    if (isSliding) return;
    setIsSliding(true);
    setTimeout(() => {
      setActiveIndex((prev) => (prev - 1 + TESTIMONIALS.length) % TESTIMONIALS.length);
      setIsSliding(false);
    }, 400); // match fade duration
  };

  // Auto-play feature
  useEffect(() => {
    const interval = setInterval(() => {
      handleNext();
    }, 7000); // Slide every 7 seconds
    return () => clearInterval(interval);
  }, [activeIndex, isSliding]);

  const activeTestimonial = TESTIMONIALS[activeIndex];

  // Helper to color/highlight key words inside testimonials
  const renderQuoteText = (text: string) => {
    const highlights = [
      "peer network",
      "women editors",
      "hard story",
      "digital safety toolkit",
      "rapid-response",
      "real solidarity"
    ];
    let styledText = text;
    
    highlights.forEach(phrase => {
      const regex = new RegExp(`(${phrase})`, "gi");
      styledText = styledText.replace(regex, `<span class="voices-highlight">$1</span>`);
    });

    return <p dangerouslySetInnerHTML={{ __html: styledText }} />;
  };

  return (
    <section 
      ref={ref} 
      className={`voices-section${inView ? " voices-section--visible" : ""}`} 
      id="voices-slider" 
      aria-label="Voices of EMWA members"
    >
      {/* Left gold border accent */}
      <div className="voices-accent-bar" aria-hidden="true" />
      
      {/* Background scanline grid pattern */}
      <div className="voices-scanlines" aria-hidden="true" />

      {/* Decorative large background text */}
      <span className="voices-bg-word" aria-hidden="true">VOICES</span>

      <div className="voices-container">
        {/* Voices section eyebrow */}
        <div className="voices-header">
          <p className="voices-eyebrow">Voices of EMWA</p>
          <div className="voices-header-rule" aria-hidden="true" />
          <div className="voices-counter" aria-hidden="true">
            <span className="voices-counter-current">0{activeIndex + 1}</span>
            <span className="voices-counter-separator">/</span>
            <span className="voices-counter-total">0{TESTIMONIALS.length}</span>
          </div>
        </div>

        <div className="voices-content">
          <blockquote className="voices-blockquote">
            
            {/* Opening mark */}
            <div className="voices-top-row">
              <span className="voices-quote-mark" aria-hidden="true">"</span>
            </div>

            {/* Quote content block */}
            <div className={`voices-quote-wrapper${isSliding ? " voices-quote-wrapper--sliding" : ""}`}>
              <div className="voices-quote-text">
                {renderQuoteText(activeTestimonial.quote)}
              </div>

              {/* Divider line */}
              <div className="voices-divider" aria-hidden="true" />

              {/* Author footer */}
              <footer className="voices-footer">
                <cite className="voices-cite">
                  <span className="voices-author">{activeTestimonial.author}</span>
                  <span className="voices-dot" aria-hidden="true"> · </span>
                  <span className="voices-role">{activeTestimonial.role}</span>
                </cite>
              </footer>
            </div>

          </blockquote>

          {/* Navigation Controls */}
          <div className="voices-controls">
            <button 
              onClick={handlePrev} 
              className="voices-btn" 
              aria-label="Previous quote"
            >
              <ArrowLeft className="voices-btn-icon" />
            </button>
            <button 
              onClick={handleNext} 
              className="voices-btn" 
              aria-label="Next quote"
            >
              <ArrowRight className="voices-btn-icon" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
