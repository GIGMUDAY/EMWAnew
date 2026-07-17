import { ArrowUpRight, Play, Radio } from "lucide-react";

type NewsSource = {
  name: string;
  shortName: string;
  description: string;
  domain: string;
  youtubeUrl: string;
  accentColor?: string; // top border / accent color per card
  featured?: boolean;
};

// Edit this list to add, remove, or reorder the news sources shown on the home page.
const NEWS_SOURCES: NewsSource[] = [
  {
    name: "Fana Media Corporation",
    shortName: "FANA",
    description: "Ethiopian news and current affairs in Amharic.",
    domain: "fanamc.com",
    youtubeUrl: "https://www.youtube.com/@fanamediacorporation",
    accentColor: "#E5A933",
  },
  {
    name: "CNN",
    shortName: "CNN",
    description: "Breaking news, interviews, and international reporting.",
    domain: "cnn.com",
    youtubeUrl: "https://www.youtube.com/@CNN",
    accentColor: "#cc0000",
  },
  {
    name: "Al Jazeera English",
    shortName: "AJ",
    description: "Global reporting with extensive coverage across Africa.",
    domain: "aljazeera.com",
    youtubeUrl: "https://www.youtube.com/@aljazeeraenglish",
    accentColor: "#E5A933",
    featured: true,
  },
  {
    name: "BBC News",
    shortName: "BBC",
    description: "International news, analysis, and documentaries.",
    domain: "bbc.com",
    youtubeUrl: "https://www.youtube.com/@BBCNews",
    accentColor: "#E5A933",
  },
  {
    name: "DW News",
    shortName: "DW",
    description: "News and perspectives from Germany and around the world.",
    domain: "dw.com",
    youtubeUrl: "https://www.youtube.com/@dwnews",
    accentColor: "#00b5e2",
  },
  {
    name: "Reuters",
    shortName: "R",
    description: "Independent global reporting and live news coverage.",
    domain: "reuters.com",
    youtubeUrl: "https://www.youtube.com/@Reuters",
    accentColor: "#ff6600",
  },
];

export default function YoutubeNewsFeed() {
  return (
    <section className="ynf-section">
      <div className="ynf-container">
        {/* Header row */}
        <div className="ynf-header">
          <div className="ynf-header-left">
            <h2 className="ynf-headline">
              Women in the news,{" "}
              <span className="ynf-headline-accent">right now.</span>
            </h2>
            <p className="ynf-subtext">
              Move between Ethiopian and international perspectives. Each
              newsroom opens directly on YouTube for immersive reporting and
              global clarity.
            </p>
          </div>
          <div className="ynf-header-right">
            <span className="ynf-live-badge">
              <span className="ynf-live-dot" aria-hidden="true" />
              Sources live now
            </span>
          </div>
        </div>

        {/* Card grid */}
        <div className="ynf-grid">
          {NEWS_SOURCES.map((source) => (
            <NewsSourceCard key={source.name} source={source} />
          ))}
        </div>
      </div>
    </section>
  );
}

function NewsSourceCard({ source }: { source: NewsSource }) {
  const logoUrl = `https://www.google.com/s2/favicons?domain=${source.domain}&sz=128`;
  const accent = source.accentColor ?? "#E5A933";

  return (
    <a
      href={source.youtubeUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Watch ${source.name} on YouTube (opens in a new tab)`}
      className={`ynf-card${source.featured ? " ynf-card--featured" : ""}`}
      style={{ "--card-accent": accent } as React.CSSProperties}
    >
      {/* Faded background short name */}
      <span className="ynf-card-bg-name" aria-hidden="true">
        {source.shortName}
      </span>

      {/* Top row: logo + play button */}
      <div className="ynf-card-top">
        <div className="ynf-logo-wrap">
          <img
            src={logoUrl}
            alt=""
            width={128}
            height={128}
            loading="lazy"
            className="ynf-logo-img"
          />
        </div>
        <span className="ynf-play-btn" aria-hidden="true">
          <Play className="ynf-play-icon" fill="currentColor" />
        </span>
      </div>

      {/* Bottom row: meta + title + description + cta */}
      <div className="ynf-card-body">
        <p className="ynf-card-meta">
          {source.shortName} / YouTube
        </p>
        <h3 className="ynf-card-title">{source.name}</h3>
        <p className="ynf-card-desc">{source.description}</p>
        <span className="ynf-card-cta">
          Watch channel <ArrowUpRight className="ynf-cta-icon" aria-hidden="true" />
        </span>
      </div>
    </a>
  );
}
