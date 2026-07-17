import { useEffect, useState } from "react";

const SLIDES = [
  {
    img: "https://images.unsplash.com/photo-1585637071663-799845ad5212?w=1600&q=80",
    text: "Women journalists on the frontlines are reshaping how the world sees conflict.",
    author: "Reuters Institute",
    role: "Global Press Freedom Report 2026",
  },
  {
    img: "https://images.unsplash.com/photo-1495020689067-958852a7765e?w=1600&q=80",
    text: "A record number of women now lead major international newsrooms.",
    author: "UNESCO",
    role: "Women in News, Global Report",
  },
  {
    img: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=1600&q=80",
    text: "From Addis to Nairobi, women reporters are driving accountability journalism.",
    author: "International Women's Media Foundation",
    role: "2026 Courage in Journalism Awards",
  },
];

export default function HeroSlider() {
  const [index, setIndex] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);

  useEffect(() => {
    if (!autoPlay) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % SLIDES.length), 2000);
    return () => clearInterval(id);
  }, [autoPlay]);

  const handleDotClick = (i: number) => {
    setIndex(i);
    setAutoPlay(false);
  };

  return (
    <section 
      className="py-16 md:py-24 border-y border-border bg-background"
      onMouseEnter={() => setAutoPlay(false)}
      onMouseLeave={() => setAutoPlay(true)}
    >
      <div className="max-w-[1400px] mx-auto px-6">
        <p className="label-mono text-primary mb-8 text-center">Voices in Motion</p>

        <div className="relative aspect-[16/9] md:aspect-[20/9] overflow-hidden bg-foreground">
          {/* Images */}
          {SLIDES.map((s, i) => (
            <img
              key={i}
              src={s.img}
              alt={s.author}
              className={`absolute inset-0 w-full h-full object-cover transition-all duration-1000 ease-in-out ${
                i === index
                  ? "opacity-100 scale-100"
                  : "opacity-0 scale-105"
              }`}
            />
          ))}
          
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-foreground/80 via-foreground/40 to-transparent" />
          
          {/* Navigation Dots - Bottom */}
          <div className="absolute bottom-8 left-8 right-8 flex gap-3">
            {SLIDES.map((_, i) => (
              <button
                key={i}
                onClick={() => handleDotClick(i)}
                aria-label={`Slide ${i + 1}`}
                className={`h-1 transition-all duration-500 ${
                  i === index 
                    ? "w-12 bg-primary" 
                    : "w-3 bg-background/40 hover:bg-background/70"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Quotation Text - Centered Below */}
        <div className="mt-12 max-w-4xl mx-auto text-center">
          <div className="relative overflow-hidden h-40">
            {SLIDES.map((s, i) => (
              <div
                key={i}
                className={`absolute inset-x-0 transition-all duration-1000 ease-in-out ${
                  i === index
                    ? "opacity-100 translate-y-0"
                    : i < index
                    ? "opacity-0 -translate-y-8"
                    : "opacity-0 translate-y-8"
                }`}
              >
                <blockquote className="font-display text-3xl md:text-5xl leading-tight tracking-tight mb-6">
                  &ldquo;{s.text}&rdquo;
                </blockquote>
                <p className="label-mono text-primary">
                  {s.author} <span className="text-muted-foreground">· {s.role}</span>
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Slide Counter */}
        <div className="flex justify-center mt-8 label-mono text-muted-foreground">
          <span>{index + 1} / {SLIDES.length}</span>
        </div>
      </div>
    </section>
  );
}
