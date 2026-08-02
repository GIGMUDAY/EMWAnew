import { createFileRoute } from "@tanstack/react-router";
import { type FormEvent, useEffect, useMemo, useState } from "react";
import {
  ArrowUpRight,
  BadgeCheck,
  ChevronDown,
  Download,
  Facebook,
  Instagram,
  Linkedin,
  Mail,
  MapPin,
  Phone,
  Search,
  X,
} from "lucide-react";
import { PageShell } from "@/components/page-shell";
import { API_BASE } from "@/lib/admin-api";
import { useLanguage } from "@/lib/language-context";

export const Route = createFileRoute("/experts")({
  head: () => ({
    meta: [
      { title: "Experts Directory — EMWA" },
      {
        name: "description",
        content:
          "Searchable directory of Ethiopian women media experts by region, expertise, and category.",
      },
      { property: "og:title", content: "Experts Directory — EMWA" },
      {
        property: "og:description",
        content:
          "Find verified Ethiopian women experts in journalism, broadcasting, digital media, and more.",
      },
    ],
  }),
  component: Experts,
});

const EXPERT_CATEGORIES = [
  "Journalism & Media",
  "Communications & Public Relations",
  "Gender Equality & Women's Rights",
  "Human Rights & Advocacy",
  "Governance & Public Policy",
  "Law & Justice",
  "Health & Public Health",
  "Education & Research",
  "Business & Economics",
  "Science & Technology",
  "Environment & Climate",
  "Agriculture & Food Systems",
  "Arts, Culture & Entertainment",
  "Social Development & Disability",
] as const;

const CATEGORY_MAP_AM: Record<string, string> = {
  All: "ሁሉም",
  "Journalism & Media": "ጋዜጠኝነት እና ሚዲያ",
  "Communications & Public Relations": "ኮሙኒኬሽን እና ህዝብ ግንኙነት",
  "Gender Equality & Women's Rights": "የፆታ እኩልነት እና የሴቶች መብት",
  "Human Rights & Advocacy": "ሰብአዊ መብቶች እና ተሟጋችነት",
  "Governance & Public Policy": "መልካም አስተዳደር እና ህዝባዊ ፖሊሲ",
  "Law & Justice": "ህግ እና ፍትህ",
  "Health & Public Health": "ጤና እና ህዝብ ጤና",
  "Education & Research": "ትምህርት እና ምርምር",
  "Business & Economics": "ንግድ እና ኢኮኖሚክስ",
  "Science & Technology": "ሳይንስ እና ቴክኖሎጂ",
  "Environment & Climate": "አካባቢ እና አየር ንብረት",
  "Agriculture & Food Systems": "ግብርና እና ምግብ ስርዓቶች",
  "Arts, Culture & Entertainment": "ኪነ-ጥበብ፣ ባህል እና መዝናኛ",
  "Social Development & Disability": "ማህበራዊ ልማት እና አካል ጉዳተኝነት",
  Other: "ሌሎች",
};

const CATEGORIES = ["All", ...EXPERT_CATEGORIES, "Other"];
type Expert = {
  id?: string;
  n: string;
  f: string;
  r: string;
  c: string;
  bio: string;
  img?: string;
  email?: string;
  phone?: string;
  linkedinUrl?: string;
  instagramUrl?: string;
  facebookUrl?: string;
};

type ExpertApiError = {
  error?: {
    message?: string;
    details?: { fieldErrors?: Record<string, string[] | undefined> };
  };
};

const expertSubmissionError = (payload: unknown) => {
  const apiError = payload as ExpertApiError;
  const fields = apiError.error?.details?.fieldErrors;
  const firstFieldError = fields
    ? Object.entries(fields).find(([, messages]) => messages?.length)
    : undefined;

  if (firstFieldError) {
    const [field, messages] = firstFieldError;
    const labels: Record<string, string> = {
      fullName: "Full name",
      professionalTitle: "Professional title",
      primaryExpertise: "Expert category",
      location: "Location",
      professionalBiography: "Professional biography",
      email: "Email address",
      phone: "Phone number",
      profilePhoto: "Profile photo",
    };
    return `${labels[field] ?? field}: ${messages?.[0]}`;
  }

  return apiError.error?.message ?? "Unable to submit your application.";
};

function Experts() {
  const { t, language } = useLanguage();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState<"name" | "field">("name");
  const [registerOpen, setRegisterOpen] = useState(false);
  const [selected, setSelected] = useState<Expert | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [experts, setExperts] = useState<Expert[]>([]);
  const [expertsLoading, setExpertsLoading] = useState(true);
  const [expertsError, setExpertsError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    const loadExperts = async () => {
      try {
        const response = await fetch(`${API_BASE}/public/experts`, {
          signal: controller.signal,
        });
        const payload = await response.json().catch(() => null);
        if (!response.ok) {
          throw new Error(payload?.error?.message ?? "Unable to load the experts directory.");
        }
        const apiOrigin = new URL(API_BASE).origin;
        const rows = (payload?.data ?? []) as Array<{
          id: string;
          full_name: string;
          professional_title: string;
          primary_expertise: string;
          location: string;
          professional_biography: string;
          profile_photo_url?: string;
          email?: string;
          phone_number?: string;
          linkedin_url?: string;
          instagram_url?: string;
          facebook_url?: string;
        }>;
        setExperts(
          rows.map((row) => ({
            id: row.id,
            n: row.full_name,
            f: row.professional_title,
            r: row.location,
            c: row.primary_expertise,
            bio: row.professional_biography,
            img: row.profile_photo_url
              ? `${apiOrigin}${new URL(row.profile_photo_url, apiOrigin).pathname}`
              : undefined,
            email: row.email,
            phone: row.phone_number,
            linkedinUrl: row.linkedin_url,
            instagramUrl: row.instagram_url,
            facebookUrl: row.facebook_url,
          })),
        );
      } catch (cause) {
        if (cause instanceof DOMException && cause.name === "AbortError") return;
        setExpertsError(
          cause instanceof Error ? cause.message : "Unable to load the experts directory.",
        );
        setExperts([]);
      } finally {
        setExpertsLoading(false);
      }
    };
    void loadExperts();
    return () => controller.abort();
  }, []);

  const submitExpertApplication = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const email = String(formData.get("email") ?? "").trim();
    const phone = String(formData.get("phone") ?? "").trim();

    if (!email && !phone) {
      setSubmitError(t("Please provide at least an email address or a phone number.", "እባክዎን ቢያንስ የኢሜይል አድራሻ ወይም የስልክ ቁጥር ያስገቡ።"));
      return;
    }

    setSubmitting(true);
    setSubmitError("");

    try {
      const response = await fetch(`${API_BASE}/public/expert-applications`, {
        method: "POST",
        body: formData,
      });
      const payload = await response
        .json()
        .catch(() => ({ error: { message: "The server returned an invalid response." } }));

      if (!response.ok) {
        console.error("[EMWA Experts] Application rejected", payload);
        throw new Error(expertSubmissionError(payload));
      }

      form.reset();
      setSubmitted(true);
    } catch (cause) {
      setSubmitError(
        cause instanceof TypeError
          ? t("Cannot reach the EMWA server. Please check your connection and try again.", "ወደ EMWA አገልጋይ መድረስ አልተቻለም። እባክዎን ግንኙነትዎን አረጋግጠው እንደገና ይሞክሩ።")
          : cause instanceof Error
            ? cause.message
            : t("Unable to submit your application.", "ማመልከቻዎን ማስገባት አልተቻለም።"),
      );
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    const locked = registerOpen || selected;
    document.body.style.overflow = locked ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [registerOpen, selected]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return experts
      .filter(
        (expert) =>
          (category === "All" || expert.c === category) &&
          (!needle ||
            [expert.n, expert.f, expert.r, expert.c].some((value) =>
              value.toLowerCase().includes(needle),
            )),
      )
      .sort((a, b) => (sort === "name" ? a.n.localeCompare(b.n) : a.f.localeCompare(b.f)));
  }, [experts, query, category, sort]);

  const featuredExpert = useMemo(
    () => experts.find((expert) => Boolean(expert.img)) ?? experts[0],
    [experts],
  );

  const downloadExperts = () => {
    const escapeCell = (value: string) => `"${value.replaceAll('"', '""')}"`;
    const rows = [
      ["Name", "Expertise", "Region", "Category", "Biography", "Email", "Phone", "LinkedIn", "Instagram", "Facebook"],
      ...experts.map((expert) => [
        expert.n, expert.f, expert.r, expert.c, expert.bio, expert.email ?? "",
        expert.phone ?? "", expert.linkedinUrl ?? "", expert.instagramUrl ?? "", expert.facebookUrl ?? "",
      ]),
    ];
    const csv = rows.map((row) => row.map(escapeCell).join(",")).join("\r\n");
    const url = URL.createObjectURL(new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "emwa-experts-directory.csv";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const downloadExpert = async (expert: Expert) => {
    const { jsPDF } = await import("jspdf");
    const pdf = new jsPDF({ unit: "mm", format: "a4" });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const margin = 18;
    const contentWidth = pageWidth - margin * 2;

    pdf.setFillColor(140, 45, 60);
    pdf.rect(0, 0, pageWidth, 34, "F");
    pdf.setTextColor(255, 255, 255);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(10);
    pdf.text("ETHIOPIAN MEDIA WOMEN ASSOCIATION", margin, 13);
    pdf.setFontSize(18);
    pdf.text("Women's Expert Profile", margin, 24);

    let y = 48;
    pdf.setTextColor(28, 26, 24);
    pdf.setFontSize(24);
    pdf.text(expert.n, margin, y);
    y += 10;
    pdf.setTextColor(140, 45, 60);
    pdf.setFontSize(13);
    pdf.text(expert.f, margin, y);
    y += 12;

    const details = [
      ["Expert category", expert.c],
      ["Location", expert.r],
      ["Email", expert.email],
      ["Phone", expert.phone],
      ["LinkedIn", expert.linkedinUrl],
      ["Instagram", expert.instagramUrl],
      ["Facebook", expert.facebookUrl],
    ].filter((detail): detail is [string, string] => Boolean(detail[1]));

    pdf.setFontSize(10);
    for (const [label, value] of details) {
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(80, 76, 72);
      pdf.text(`${label}:`, margin, y);
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(28, 26, 24);
      const valueLines = pdf.splitTextToSize(value, contentWidth - 38);
      pdf.text(valueLines, margin + 38, y);
      y += Math.max(7, valueLines.length * 5);
    }

    y += 5;
    pdf.setDrawColor(220, 214, 205);
    pdf.line(margin, y, pageWidth - margin, y);
    y += 10;
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(140, 45, 60);
    pdf.setFontSize(12);
    pdf.text("PROFESSIONAL BIOGRAPHY", margin, y);
    y += 8;
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(45, 42, 39);
    pdf.setFontSize(11);
    const biographyLines = pdf.splitTextToSize(expert.bio, contentWidth);
    for (const line of biographyLines) {
      if (y > 278) {
        pdf.addPage();
        y = 20;
      }
      pdf.text(line, margin, y);
      y += 6;
    }

    const filename = expert.n
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    pdf.save(`${filename}-expert-profile.pdf`);
  };

  return (
    <PageShell>
      <section className="experts-hero">
        <div className="experts-hero-copy">
          <p className="experts-eyebrow">{t("The Expertise Archive / EMWA", "የባለሙያዎች መዝገብ / EMWA")}</p>
          <h1>
            {language === "am" ? (
              <>
                እውቀት<br />ድምፅ <em>አለው።</em>
              </>
            ) : (
              <>
                Knowledge has
                <br />a <em>voice.</em>
              </>
            )}
          </h1>
          <p>
            {t(
              "A curated, verified network of Ethiopian women ready to inform reporting, shape policy, mentor peers, and lead public conversation.",
              "ዘገባዎችን ለማበልጸግ፣ ፖሊሲን ለመቅረፅ፣ እህቶችን ለማማከር እና የህዝብ ውይይትን ለመምራት የተዘጋጁ የተረጋገጡ የኢትዮጵያውያን ሴቶች መረብ።",
            )}
          </p>
          <div className="experts-hero-actions">
            <a href="#expert-directory">
              {t("Browse the directory", "ማውጫውን ያስሱ")} <ArrowUpRight aria-hidden="true" />
            </a>
            <button onClick={() => setRegisterOpen(true)}>{t("Submit your profile", "መገለጫዎን ያስገቡ")}</button>
          </div>
        </div>
        <div className="experts-hero-portrait">
          <span className="grid size-full place-items-center bg-muted font-display text-9xl text-primary/35">
            {featuredExpert
              ? featuredExpert.n.split(" ").slice(0, 2).map((part) => part[0]).join("")
              : "EMWA"}
          </span>
          {featuredExpert?.img && (
            <img
              src={featuredExpert.img}
              alt={`${featuredExpert.n}, ${featuredExpert.f}`}
              onError={(event) => event.currentTarget.remove()}
            />
          )}
          <div className="experts-hero-portrait-shade" aria-hidden="true" />
          <div className="experts-hero-dossier">
            <span>{featuredExpert?.n || t("Featured expert", "ልዩ ባለሙያ")}</span>
            <strong>
              {language === "am" && CATEGORY_MAP_AM[featuredExpert?.c] ? CATEGORY_MAP_AM[featuredExpert?.c] : featuredExpert?.c || t("Media expertise", "የሚዲያ ሙያ")}
            </strong>
            <p>{featuredExpert?.r || "ኢትዮጵያ"}</p>
          </div>
          <span className="experts-hero-index" aria-hidden="true">
            E/01
          </span>
        </div>
      </section>

      <section
        className="experts-directory"
        id="expert-directory"
        aria-labelledby="experts-directory-heading"
      >
        <header className="experts-directory-header">
          <div>
            <p className="experts-eyebrow">{t("Verified professionals", "የተረጋገጡ ባለሙያዎች")}</p>
            <h2 id="experts-directory-heading">{t("Find the right voice.", "ትክክለኛውን ድምፅ ያግኙ።")}</h2>
          </div>
          <p>
            {t(
              "Search by discipline, name, or region to find a source, speaker, mentor, trainer, or collaborator.",
              "ምንጭ፣ ተናጋሪ፣ አማካሪ፣ አሰልጣኝ ወይም አጋር ለማግኘት በዘርፍ፣ በስም ወይም በክልል ይፈልጉ።",
            )}
          </p>
        </header>

        <div className="experts-toolbar">
          <label className="experts-search">
            <Search aria-hidden="true" />
            <span className="sr-only">{t("Search experts", "ባለሙያዎችን ይፈልጉ")}</span>
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={t("Search name, skill, region...", "በስም፣ በሙያ፣ በክልል ይፈልጉ...")}
            />
          </label>
          <label className="experts-sort">
            <span>{t("Category", "ዘርፍ")}</span>
            <select value={category} onChange={(event) => setCategory(event.target.value)}>
              {CATEGORIES.map((item) => (
                <option key={item} value={item}>
                  {language === "am" ? CATEGORY_MAP_AM[item] ?? item : item} (
                  {item === "All"
                    ? experts.length
                    : experts.filter((expert) => expert.c === item).length}
                  )
                </option>
              ))}
            </select>
            <ChevronDown aria-hidden="true" />
          </label>
          <label className="experts-sort">
            <span>{t("Sort by", "ክፍልፍል")}</span>
            <select
              value={sort}
              onChange={(event) => setSort(event.target.value as "name" | "field")}
            >
              <option value="name">{t("Name", "ስም")}</option>
              <option value="field">{t("Expertise", "ሙያ")}</option>
            </select>
            <ChevronDown aria-hidden="true" />
          </label>
        </div>

        <div className="experts-results-bar">
          <p>
            {language === "am" ? (
              <>
                <strong>{filtered.length}</strong> የተረጋገጡ ባለሙያዎች በመታየት ላይ ናቸው
              </>
            ) : (
              <>
                Showing <strong>{filtered.length}</strong> verified experts
              </>
            )}
          </p>
          <div className="experts-results-actions">
            <button onClick={downloadExperts} disabled={!experts.length}>
              <Download aria-hidden="true" /> {t("Download all experts", "ሁሉንም ባለሙያዎች ያውርዱ")}
            </button>
            <button onClick={() => setRegisterOpen(true)}>{t("Add your expertise", "ሙያዎን ያክሉ")}</button>
          </div>
        </div>

        {expertsError && (
          <p className="experts-feed-note" role="status">
            {t("The approved experts directory is temporarily unavailable.", "የተረጋገጡ ባለሙያዎች ማውጫ በጊዜያዊነት አይገኝም።")}
          </p>
        )}
        {expertsLoading ? (
          <div className="experts-empty">
            <p>{t("Loading approved experts…", "የተረጋገጡ ባለሙያዎችን በመጫን ላይ…")}</p>
          </div>
        ) : filtered.length ? (
          <div className="experts-grid">
            {filtered.map((expert) => (
                <article className="expert-card" key={expert.id ?? expert.n}>
                  <button
                    className="expert-card-image"
                    onClick={() => setSelected(expert)}
                    aria-label={`View ${expert.n}'s profile`}
                  >
                    <span className="grid size-full place-items-center bg-muted font-display text-7xl text-primary/35">
                      {expert.n.split(" ").slice(0, 2).map((part) => part[0]).join("")}
                    </span>
                    {expert.img && (
                      <img
                        src={expert.img}
                        alt={expert.n}
                        loading="lazy"
                        className="absolute inset-0 size-full object-contain"
                        onError={(event) => event.currentTarget.remove()}
                      />
                    )}
                    <span className="expert-card-category">{language === "am" ? CATEGORY_MAP_AM[expert.c] ?? expert.c : expert.c}</span>
                    <span className="expert-card-open">
                      <ArrowUpRight aria-hidden="true" />
                    </span>
                  </button>
                  <div className="expert-card-copy">
                    <p className="expert-card-verified">
                      <BadgeCheck aria-hidden="true" /> {t("EMWA verified", "የEMWA የተረጋገጠ")}
                    </p>
                    <h3>{expert.n}</h3>
                    <p className="expert-card-field">{expert.f}</p>
                    <p className="expert-card-region">
                      <MapPin aria-hidden="true" /> {expert.r}
                    </p>
                    <button onClick={() => setSelected(expert)}>
                      {t("View expertise", "ሙያን ይመልከቱ")} <ArrowUpRight aria-hidden="true" />
                    </button>
                  </div>
                </article>
            ))}
          </div>
        ) : (
          <div className="experts-empty">
            <Search aria-hidden="true" />
            <h3>{experts.length ? t("No matching experts.", "ተዛማጅ ባለሙያዎች አልተገኙም።") : t("No approved experts yet.", "ገና የተረጋገጡ ባለሙያዎች የሉም።")}</h3>
            <p>
              {experts.length
                ? t("Try another name, field, region, or category.", "በሌላ ስም፣ ሙያ፣ ክልል ወይም ዘርፍ ይፈልጉ።")
                : t("Approved expert profiles will appear here after administrative review.", "የተረጋገጡ የባለሙያዎች መገለጫዎች ከአስተዳደራዊ ግምገማ በኋላ እዚህ ይታያሉ።")}
            </p>
            <button
              onClick={() => {
                setQuery("");
                setCategory("All");
              }}
            >
              {t("Reset directory", "ማውጫውን እንደገና አስጀምር")}
            </button>
          </div>
        )}
      </section>

      <section className="experts-register-cta">
        <div>
          <p className="experts-eyebrow">{t("Be discoverable", "ተደራሽ ይሁኑ")}</p>
          <h2>
            {language === "am" ? (
              <>
                እውቀትዎ በውይይቱ<br />ውስጥ ሊኖር ይገባል።
              </>
            ) : (
              <>
                Your knowledge belongs
                <br />
                in the conversation.
              </>
            )}
          </h2>
        </div>
        <button onClick={() => setRegisterOpen(true)}>
          {t("Join the directory", "ማውጫውን ይቀላቀሉ")} <ArrowUpRight aria-hidden="true" />
        </button>
      </section>

      {selected && (
        <div className="expert-panel-backdrop" onMouseDown={() => setSelected(null)}>
          <aside
            className="expert-profile-panel"
            onMouseDown={(event) => event.stopPropagation()}
            aria-modal="true"
            role="dialog"
            aria-label={`${selected.n}'s expert profile`}
          >
            <button
              className="expert-panel-close"
              onClick={() => setSelected(null)}
              aria-label="Close profile"
            >
              <X />
            </button>
            <div className="expert-panel-photo">
              <span className="grid size-full place-items-center bg-muted font-display text-8xl text-primary/35">
                {selected.n.split(" ").slice(0, 2).map((part) => part[0]).join("")}
              </span>
              {selected.img && (
                <img
                  src={selected.img}
                  alt={selected.n}
                  className="absolute inset-0 size-full object-contain"
                  onError={(event) => event.currentTarget.remove()}
                />
              )}
            </div>
            <div className="expert-panel-content">
              <p className="expert-card-verified">
                <BadgeCheck /> {t("EMWA verified expert", "የEMWA የተረጋገጠ ባለሙያ")}
              </p>
              <h2>{selected.n}</h2>
              <p className="expert-panel-field">{selected.f}</p>
              <p className="expert-card-region">
                <MapPin /> {selected.r}
              </p>
              <div className="expert-panel-rule" />
              <p className="expert-panel-bio">{selected.bio}</p>
              <div className="expert-panel-tags">
                <span>{language === "am" ? CATEGORY_MAP_AM[selected.c] ?? selected.c : selected.c}</span>
                <span>{t("Available for interviews", "ለቃለ-መጠይቅ የሚገኙ")}</span>
                <span>{t("Mentorship", "የአማካሪነት ድጋፍ")}</span>
              </div>
              <div className="expert-panel-socials" aria-label={`${selected.n}'s social links`}>
                <button
                  type="button"
                  onClick={() => void downloadExpert(selected)}
                  aria-label={`Download ${selected.n}'s expert profile`}
                  title={t("Download profile", "መገለጫ ያውርዱ")}
                >
                  <Download />
                </button>
                {selected.instagramUrl && (
                  <a href={selected.instagramUrl} target="_blank" rel="noreferrer" aria-label="Instagram">
                    <Instagram />
                  </a>
                )}
                {selected.email && (
                  <a href={`mailto:${selected.email}`} aria-label="Email">
                    <Mail />
                  </a>
                )}
                {selected.phone && (
                  <a href={`tel:${selected.phone}`} aria-label="Phone">
                    <Phone />
                  </a>
                )}
                {selected.linkedinUrl && (
                  <a href={selected.linkedinUrl} target="_blank" rel="noreferrer" aria-label="LinkedIn">
                    <Linkedin />
                  </a>
                )}
                {selected.facebookUrl && (
                  <a href={selected.facebookUrl} target="_blank" rel="noreferrer" aria-label="Facebook">
                    <Facebook />
                  </a>
                )}
              </div>
            </div>
          </aside>
        </div>
      )}

      {registerOpen && (
        <div className="expert-panel-backdrop" onMouseDown={() => setRegisterOpen(false)}>
          <aside
            className="expert-register-sheet"
            onMouseDown={(event) => event.stopPropagation()}
            aria-modal="true"
            role="dialog"
            aria-labelledby="register-expert-heading"
          >
            <button
              className="expert-panel-close"
              onClick={() => setRegisterOpen(false)}
              aria-label="Close registration"
            >
              <X />
            </button>
            {submitted ? (
              <div className="expert-submit-success">
                <BadgeCheck />
                <p className="experts-eyebrow">{t("Application received", "ማመልከቻዎ ደርሶናል")}</p>
                <h2>{t("Thank you for adding your voice.", "ድምጽዎን ስላከሉ እናመሰግናለን።")}</h2>
                <p>
                  {t("EMWA will review your profile and contact you before it appears in the directory.", "EMWA መገለጫዎን ገምግሞ በማውጫው ውስጥ ከመታየቱ በፊት ያነጋግርዎታል።")}
                </p>
                <button
                  onClick={() => {
                    setSubmitted(false);
                    setRegisterOpen(false);
                  }}
                >
                  {t("Close", "ዝጋ")}
                </button>
              </div>
            ) : (
              <>
                <header>
                  <p className="experts-eyebrow">{t("Expert registration", "የባለሙያ ምዝገባ")}</p>
                  <h2 id="register-expert-heading">
                    {t("Join Ethiopia's trusted media directory.", "የኢትዮጵያን ታማኝ የሚዲያ ማውጫ ይቀላቀሉ።")}
                  </h2>
                  <p>
                    {t(
                      "Share enough detail for our team to verify your experience and build a useful public profile.",
                      "ቡድናችን ልምድዎን አረጋግጦ ጠቃሚ ህዝባዊ መገለጫ እንዲገነባ በቂ መረጃ ያጋሩ።",
                    )}
                  </p>
                </header>
                <form onSubmit={submitExpertApplication}>
                  <div className="expert-form-grid">
                    <label>
                      <span>{t("Full name *", "ሙሉ ስም *")}</span>
                      <input
                        name="fullName"
                        required
                        minLength={2}
                        maxLength={150}
                        placeholder={t("Your professional name", "የሙያ ስምዎ")}
                      />
                    </label>
                    <label>
                      <span>{t("Professional title *", "የሙያ ማዕረግ *")}</span>
                      <input
                        name="professionalTitle"
                        required
                        minLength={2}
                        maxLength={150}
                        placeholder={t("e.g. Investigative reporter", "ምሳሌ፡ አጣሪ ሪፖርተር")}
                      />
                    </label>
                    <label>
                      <span>{t("Expert category *", "የባለሙያ ዘርፍ *")}</span>
                      <select name="primaryExpertise" required defaultValue="">
                        <option value="" disabled>
                          {t("Select a category", "ዘርፍ ይምረጡ")}
                        </option>
                        {[...EXPERT_CATEGORIES, "Other"].map((item) => (
                          <option key={item} value={item}>
                            {language === "am" ? CATEGORY_MAP_AM[item] ?? item : item}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label>
                      <span>{t("Location *", "አካባቢ / ክልል *")}</span>
                      <input
                        name="location"
                        required
                        minLength={2}
                        maxLength={150}
                        placeholder={t("City / Region", "ከተማ / ክልል")}
                      />
                    </label>
                    <label className="expert-form-wide">
                      <span>{t("Professional biography *", "የሙያ ታሪክ *")}</span>
                      <textarea
                        name="professionalBiography"
                        required
                        minLength={20}
                        maxLength={10000}
                        rows={5}
                        placeholder={t("Describe your expertise, experience, and the topics you can speak about.", "ስለ ሙያዎ፣ ልምድዎ እና መናገር ስለሚችሉባቸው ጉዳዮች ይግለጹ።")}
                      />
                    </label>
                    <label>
                      <span>{t("Email address", "የኢሜይል አድራሻ")}</span>
                      <input
                        name="email"
                        type="email"
                        maxLength={254}
                        placeholder="name@example.com"
                      />
                    </label>
                    <label>
                      <span>{t("Phone number", "የስልክ ቁጥር")}</span>
                      <input
                        name="phone"
                        type="tel"
                        minLength={5}
                        maxLength={40}
                        placeholder="+251 ..."
                      />
                    </label>
                    <p className="expert-form-contact-note expert-form-wide">
                      {t("Please provide at least one contact method: email address or phone number.", "እባክዎን ቢያንስ አንድ የመገናኛ መንገድ ያስገቡ፡ የኢሜይል አድራሻ ወይም የስልክ ቁጥር።")}
                    </p>
                    <label className="expert-form-wide">
                      <span>{t("Profile photo", "የመገለጫ ፎቶ")}</span>
                      <input name="profilePhoto" type="file" accept="image/jpeg,image/png" />
                    </label>
                    <label className="expert-form-consent expert-form-wide">
                      <input type="checkbox" required />
                      <span>
                        {t("I confirm this information is accurate and consent to EMWA reviewing it for publication.", "ይህ መረጃ ትክክለኛ መሆኑን አረጋግጣለሁ፤ EMWA ለህትመት እንዲገመግመው እስማማለሁ።")}
                      </span>
                    </label>
                  </div>
                  {submitError && (
                    <p className="expert-form-error" role="alert">
                      {submitError}
                    </p>
                  )}
                  <footer>
                    <p>{t("Review normally takes 5–7 working days.", "ግምገማ በተለምዶ ከ5–7 የሥራ ቀናት ይወስዳል።")}</p>
                    <button type="submit" disabled={submitting}>
                      {submitting ? t("Submitting…", "በማስገባት ላይ…") : t("Submit for review", "ለግምገማ ያስገቡ")} <ArrowUpRight />
                    </button>
                  </footer>
                </form>
              </>
            )}
          </aside>
        </div>
      )}
    </PageShell>
  );
}
