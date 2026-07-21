import { useState } from "react";

type Partner = {
  name: string;
  logoUrl: string;
  abbr: string; // short abbreviation for placeholder
};

const PARTNERS_LIST: Partner[] = [
  {
    name: "UNESCO",
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/e/ea/UNESCO_logo.svg",
    abbr: "UNESCO",
  },
  {
    name: "UN Women",
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/b/b8/UN_Women_Logo.svg",
    abbr: "UNW",
  },
  {
    name: "Ethiopian Press Agency",
    logoUrl: "",
    abbr: "EPA",
  },
  {
    name: "Fojo Media Institute",
    logoUrl: "https://fojo.se/wp-content/uploads/2020/09/fojo-logo.png",
    abbr: "FOJO",
  },
  {
    name: "European Union",
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/b/b7/Flag_of_Europe.svg",
    abbr: "EU",
  },
  {
    name: "DW Akademie",
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/5/5a/Deutsche_Welle_logo_2012.svg",
    abbr: "DW",
  },
  {
    name: "Article 19",
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/a/ac/Article_19_logo.svg",
    abbr: "A19",
  },
  {
    name: "Internews",
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/6/6b/Internews_Logo.svg",
    abbr: "INW",
  },
];

function PartnerLogo({ partner }: { partner: Partner }) {
  const [failed, setFailed] = useState(false);

  return (
    <div className="alliance-card">
      <div className="alliance-logo-container">
        {!failed && partner.logoUrl ? (
          <img
            src={partner.logoUrl}
            alt={`${partner.name} logo`}
            loading="lazy"
            className="alliance-logo"
            onError={() => setFailed(true)}
          />
        ) : (
          <span className="alliance-logo-placeholder">{partner.abbr}</span>
        )}
      </div>
      <span className="alliance-name">{partner.name}</span>
    </div>
  );
}

export default function StrategicAlliances() {
  const triplePartners = [...PARTNERS_LIST, ...PARTNERS_LIST, ...PARTNERS_LIST];

  return (
    <section className="alliance-section" id="partners" aria-labelledby="alliances-title">
      <div className="alliance-container">
        <header className="alliance-header">
          <p className="alliance-eyebrow" id="alliances-title">Strategic Alliances</p>
          <div className="alliance-divider" aria-hidden="true" />
        </header>

        <div className="alliance-marquee-viewport">
          <div className="alliance-marquee-track">
            {triplePartners.map((partner, index) => (
              <PartnerLogo key={`${partner.name}-${index}`} partner={partner} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
