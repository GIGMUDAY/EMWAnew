import { ArrowUpRight, Play, Radio } from "lucide-react";

type NewsSource = {
  name: string;
  shortName: string;
  description: string;
  domain: string;
  url: string;
  platform: string;
  cta: string;
  accentColor?: string; // top border / accent color per card
  featured?: boolean;
};

// Edit this list to add, remove, or reorder the news sources shown on the home page.
const NEWS_SOURCES: NewsSource[] = [
  {
    name: "Women in Media — Featured Video",
    shortName: "VIDEO 01",
    description: "Watch this featured video highlighting women, media, and the issues shaping today's conversation.",
    domain: "youtube.com",
    url: "https://youtu.be/XYZQHfEM0B0?si=2TWKtBA9k2GyCm98",
    platform: "YouTube",
    cta: "Watch video",
    accentColor: "#ff0033",
    featured: true,
  },
  {
    name: "Women in Media — Featured Video",
    shortName: "VIDEO 02",
    description: "A featured video connecting audiences with current stories and perspectives from women in media.",
    domain: "youtube.com",
    url: "https://youtu.be/3ONtCRmfovk?si=V7wQf24HpsNfSK1C",
    platform: "YouTube",
    cta: "Watch video",
    accentColor: "#ff0033",
  },
  {
    name: "Gender Equality Policies for Women Journalists",
    shortName: "ELHAM",
    description: "A conversation about gender equality, women journalists, and stronger gender-equality policies in media workplaces.",
    domain: "linkedin.com",
    url: "https://www.linkedin.com/posts/elham-ali-70080051_genderequality-womenjournalists-genderequalitypolicies-activity-7483596857089298432-dRqd?utm_source=share&utm_medium=member_android&rcm=ACoAAB7x23MBzhbztek48HAxH4_eZ8P8WAv-AGE",
    platform: "LinkedIn",
    cta: "Read post",
    accentColor: "#0a66c2",
  },
  {
    name: "Safety of Journalists in Ethiopia",
    shortName: "SAFETY",
    description: "Highlights from the 2025 assessment of the risks, violations, and systemic threats facing journalists across Ethiopia.",
    domain: "linkedin.com",
    url: "https://www.linkedin.com/posts/tewodrosnegashbayu_ethiopia-journalistsafety-safetyofjournalists-activity-7432155946061205505-aM_8?utm_source=share&utm_medium=member_android&rcm=ACoAAB7x23MBzhbztek48HAxH4_eZ8P8WAv-AGE",
    platform: "LinkedIn",
    cta: "Read post",
    accentColor: "#0a66c2",
  },
  {
    name: "Fojo and EMWA Link Journalists to Women Experts",
    shortName: "CHARM",
    description: "How the Women Experts Directory is helping journalists find authoritative women sources across 18 fields.",
    domain: "charmafrica.org",
    url: "https://charmafrica.org/fojo-and-emwa-links-journalists-to-women-experts/",
    platform: "CHARM",
    cta: "Read story",
    accentColor: "#e05a3f",
  },
  {
    name: "Directory Amplifies Ethiopian Women's Voices",
    shortName: "FOJO",
    description: "EMWA's directory connects journalists with women experts, challenges stereotypes, and broadens representation in news coverage.",
    domain: "fojo.se",
    url: "https://fojo.se/directory-of-experts-to-amplify-ethiopian-womens-voices-in-the-media/",
    platform: "Fojo",
    cta: "Read story",
    accentColor: "#E5A933",
  },
  {
    name: "Women Experts Directory",
    shortName: "DW",
    description: "DW Amharic highlights EMWA's Women Experts Directory and its work to bring more Ethiopian women into media coverage.",
    domain: "facebook.com",
    url: "https://web.facebook.com/dw.amharic/posts/women-experts-directory-%E1%8B%A8%E1%89%B0%E1%88%B0%E1%8A%98%E1%8B%8D-%E1%88%98%E1%8C%BD%E1%88%83%E1%8D%89-%E1%89%A0%E1%8A%A2%E1%89%B5%E1%8B%AE%E1%8C%B5%E1%8B%AB-%E1%88%98%E1%8C%88%E1%8A%93%E1%8A%9B-%E1%89%A5%E1%8B%99%E1%88%83%E1%8A%95-%E1%88%B4%E1%89%B6%E1%89%BD-%E1%88%9B%E1%88%85%E1%89%A0%E1%88%AD-%E1%8A%90%E1%8B%8D-%E1%89%B3%E1%89%B5%E1%88%9E-%E1%88%88%E1%88%98%E1%8C%88%E1%8A%93%E1%8A%9B-%E1%89%A5%E1%8B%99%E1%88%83%E1%8A%95-%E1%89%A3/6717947304904975/?_rdc=1&_rdr#",
    platform: "Facebook",
    cta: "View post",
    accentColor: "#1877f2",
  },
  {
    name: "A Milestone for Gender Equality in Ethiopian Media",
    shortName: "MILESTONE",
    description: "EMWA and three independent media houses commit to gender policies and safer, more inclusive workplaces for women journalists.",
    domain: "fojo.se",
    url: "https://fojo.se/en/a-milestone-for-gender-equality-in-ethiopian-media/",
    platform: "Fojo",
    cta: "Read story",
    accentColor: "#E5A933",
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
              Explore current videos, reporting, and conversations advancing
              women's voices, gender equality, and safer media in Ethiopia.
            </p>
          </div>
          <div className="ynf-header-right">
            <span className="ynf-live-badge">
              <span className="ynf-live-dot" aria-hidden="true" />
              Latest coverage
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
      href={source.url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${source.cta}: ${source.name} on ${source.platform} (opens in a new tab)`}
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
          {source.shortName} / {source.platform}
        </p>
        <h3 className="ynf-card-title">{source.name}</h3>
        <p className="ynf-card-desc">{source.description}</p>
        <span className="ynf-card-cta">
          {source.cta} <ArrowUpRight className="ynf-cta-icon" aria-hidden="true" />
        </span>
      </div>
    </a>
  );
}
