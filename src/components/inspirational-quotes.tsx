import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";

const QUOTES = [
  {
    img: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=1600&q=80",
    text: "There is no limit to what we, as women, can accomplish.",
    author: "Michelle Obama",
    role: "Author & Advocate",
    tag: "Leadership",
  },
  {
    img: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=1600&q=80",
    text: "One child, one teacher, one book, one pen can change the world.",
    author: "Malala Yousafzai",
    role: "Nobel Peace Laureate",
    tag: "Education",
  },
  {
    img: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=1600&q=80",
    text: "The question isn't who's going to let me; it's who's going to stop me.",
    author: "Ayn Rand",
    role: "Writer",
    tag: "Courage",
  },
  {
    img: "https://images.unsplash.com/photo-1573497491208-6b1acb260507?w=1600&q=80",
    text: "A woman with a voice is, by definition, a strong woman.",
    author: "Melinda Gates",
    role: "Philanthropist",
    tag: "Voice",
  },
  {
    img: "https://images.unsplash.com/photo-1600275669439-14e40452d20b?w=1600&q=80",
    text: "I raise up my voice — not so I can shout, but so that those without a voice can be heard.",
    author: "Malala Yousafzai",
    role: "Advocate for Girls' Education",
    tag: "Solidarity",
  },
];

const AUTO_DURATION = 6000; // ms per slide

export default function InspirationalQuotes() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isExiting, setIsExiting] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const progressRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const goTo = (next: number) => {
    if (next === index) return;
    setIsExiting(true);
    setTimeout(() => {
      setIndex(next);
      setProgress(0);
      setIsExiting(false);
    }, 380);
  };

  const handlePrev = () => {
    goTo((index - 1 + QUOTES.length) % QUOTES.length);
    setPaused(true);
  };
  const handleNext = () => {
    goTo((index + 1) % QUOTES.length);
    setPaused(true);
  };

  // Auto-advance
  useEffect(() => {
    if (paused) return;
    intervalRef.current = setInterval(() => {
      setIsExiting(true);
      setTimeout(() => {
        setIndex((i) => (i + 1) % QUOTES.length);
        setProgress(0);
        setIsExiting(false);
      }, 380);
    }, AUTO_DURATION);
    return () => clearInterval(intervalRef.current!);
  }, [index, paused]);

  // Progress bar tick
  useEffect(() => {
    setProgress(0);
    if (paused) return;
    const tick = 50;
    progressRef.current = setInterval(() => {
      setProgress((p) => Math.min(p + (tick / AUTO_DURATION) * 100, 100));
    }, tick);
    return () => clearInterval(progressRef.current!);
  }, [index, paused]);

  const q = QUOTES[index];

  return (
    <section
      className="vim-section"
      id="voices-in-motion"
      aria-label="Voices in Motion"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Full-bleed background image */}
      <div className="vim-bg-track" aria-hidden="true">
        {QUOTES.map((s, i) => (
          <div
            key={i}
            className={`vim-bg-slide${i === index ? " vim-bg-slide--active" : ""}`}
            style={{ backgroundImage: `url(${s.img})` }}
          />
        ))}
      </div>

      {/* Dark gradient overlays */}
      <div className="vim-overlay" aria-hidden="true" />
      <div className="vim-overlay-bottom" aria-hidden="true" />

      <div className="vim-inner">
        {/* ── Top bar ── */}
        <div className="vim-topbar">
          <p className="vim-eyebrow">Voices in Motion</p>
          {/* Progress bar */}
          <div className="vim-progress-track" aria-hidden="true">
            <div
              className="vim-progress-fill"
              style={{ width: `${progress}%` }}
            />
          </div>
          {/* Counter */}
          <span className="vim-counter" aria-live="polite">
            <span className="vim-counter-cur">
              {String(index + 1).padStart(2, "0")}
            </span>
            <span className="vim-counter-sep">/</span>
            <span className="vim-counter-tot">
              {String(QUOTES.length).padStart(2, "0")}
            </span>
          </span>
        </div>

        {/* ── Quote body ── */}
        <div
          className={`vim-body${isExiting ? " vim-body--exit" : ""}`}
          key={index}
        >
          <span className="vim-mark" aria-hidden="true">"</span>
          <blockquote className="vim-quote">{q.text}</blockquote>

          <footer className="vim-footer">
            <span className="vim-tag">{q.tag}</span>
            <div className="vim-author-block">
              <span className="vim-author">{q.author}</span>
              <span className="vim-role">{q.role}</span>
            </div>
          </footer>
        </div>

        {/* ── Controls ── */}
        <div className="vim-controls">
          <button
            onClick={handlePrev}
            className="vim-btn"
            aria-label="Previous quote"
          >
            <ArrowLeft className="vim-btn-icon" />
          </button>

          {/* Dot pips */}
          <div className="vim-dots" role="tablist" aria-label="Select quote">
            {QUOTES.map((_, i) => (
              <button
                key={i}
                role="tab"
                aria-selected={i === index}
                aria-label={`Quote ${i + 1}`}
                onClick={() => { goTo(i); setPaused(true); }}
                className={`vim-dot${i === index ? " vim-dot--active" : ""}`}
              />
            ))}
          </div>

          <button
            onClick={handleNext}
            className="vim-btn"
            aria-label="Next quote"
          >
            <ArrowRight className="vim-btn-icon" />
          </button>
        </div>
      </div>
    </section>
  );
}