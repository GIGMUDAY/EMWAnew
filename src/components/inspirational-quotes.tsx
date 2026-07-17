import { useEffect, useState } from "react";

const QUOTES = [
  {
    img: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=1600&q=80",
    text: "There is no limit to what we, as women, can accomplish.",
    author: "Michelle Obama",
    role: "Author & Advocate",
  },
  {
    img: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=1600&q=80",
    text: "One child, one teacher, one book, one pen can change the world.",
    author: "Malala Yousafzai",
    role: "Nobel Peace Laureate",
  },
  {
    img: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=1600&q=80",
    text: "The question isn't who's going to let me; it's who's going to stop me.",
    author: "Ayn Rand",
    role: "Writer",
  },
  {
    img: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=1600&q=80",
    text: "We cannot all succeed when half of us are held back.",
    author: "Malala Yousafzai",
    role: "Education Activist",
  },
  {
    img: "https://images.unsplash.com/photo-1573497491208-6b1acb260507?w=1600&q=80",
    text: "A woman with a voice is, by definition, a strong woman.",
    author: "Melinda Gates",
    role: "Philanthropist",
  },
  {
    img: "https://images.unsplash.com/photo-1600275669439-14e40452d20b?w=1600&q=80",
    text: "I raise up my voice — not so I can shout, but so that those without a voice can be heard.",
    author: "Malala Yousafzai",
    role: "Advocate for Girls' Education",
  },
];

export default function InspirationalQuotes() {
  const [index, setIndex] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);

  useEffect(() => {
    if (!autoPlay) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % QUOTES.length), 5000);
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

        <div className="relative aspect-[16/9] md:aspect-[20/9] overflow-hidden bg-foreground rounded-md">
          {QUOTES.map((s, i) => (
            <img
              key={i}
              src={s.img}
              alt={s.author}
              className={`absolute inset-0 w-full h-full object-cover transition-all duration-1000 ease-in-out ${
                i === index ? "opacity-100 scale-100" : "opacity-0 scale-105"
              }`}
            />
          ))}

          <div className="absolute inset-0 bg-gradient-to-r from-foreground/80 via-foreground/40 to-transparent" />

          <div className="absolute bottom-8 left-8 right-8 flex gap-3">
            {QUOTES.map((_, i) => (
              <button
                key={i}
                onClick={() => handleDotClick(i)}
                aria-label={`Quote ${i + 1}`}
                className={`h-1 transition-all duration-500 ${
                  i === index
                    ? "w-12 bg-primary"
                    : "w-3 bg-background/40 hover:bg-background/70"
                }`}
              />
            ))}
          </div>
        </div>

        <div className="mt-12 max-w-4xl mx-auto text-center">
          <div className="relative overflow-hidden h-48 md:h-40">
            {QUOTES.map((s, i) => (
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
                  {s.author}{" "}
                  <span className="text-muted-foreground">· {s.role}</span>
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-center mt-8 label-mono text-muted-foreground">
          <span>
            {index + 1} / {QUOTES.length}
          </span>
        </div>
      </div>
    </section>
  );
}