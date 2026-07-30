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
  Search,
  X,
} from "lucide-react";
import { PageShell } from "@/components/page-shell";
import { API_BASE } from "@/lib/admin-api";

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
      linkedinUrl: "LinkedIn profile",
      instagramUrl: "Instagram profile",
      facebookUrl: "Facebook profile",
    };
    return `${labels[field] ?? field}: ${messages?.[0]}`;
  }

  return apiError.error?.message ?? "Unable to submit your application.";
};

function Experts() {
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
    setSubmitting(true);
    setSubmitError("");

    try {
      const response = await fetch(`${API_BASE}/public/expert-applications`, {
        method: "POST",
        body: new FormData(form),
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
          ? "Cannot reach the EMWA server. Please check your connection and try again."
          : cause instanceof Error
            ? cause.message
            : "Unable to submit your application.",
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
      ["Name", "Expertise", "Region", "Category", "Biography", "Email", "LinkedIn", "Instagram", "Facebook"],
      ...experts.map((expert) => [
        expert.n, expert.f, expert.r, expert.c, expert.bio, expert.email ?? "",
        expert.linkedinUrl ?? "", expert.instagramUrl ?? "", expert.facebookUrl ?? "",
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
          <p className="experts-eyebrow">The Expertise Archive / EMWA</p>
          <h1>
            Knowledge has
            <br />a <em>voice.</em>
          </h1>
          <p>
            A curated, verified network of Ethiopian women ready to inform reporting, shape policy,
            mentor peers, and lead public conversation.
          </p>
          <div className="experts-hero-actions">
            <a href="#expert-directory">
              Browse the directory <ArrowUpRight aria-hidden="true" />
            </a>
            <button onClick={() => setRegisterOpen(true)}>Submit your profile</button>
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
            <span>{featuredExpert?.n || "Featured expert"}</span>
            <strong>
              {featuredExpert?.c || "Media expertise"}
            </strong>
            <p>{featuredExpert?.r || "Ethiopia"}</p>
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
            <p className="experts-eyebrow">Verified professionals</p>
            <h2 id="experts-directory-heading">Find the right voice.</h2>
          </div>
          <p>
            Search by discipline, name, or region to find a source, speaker, mentor, trainer, or
            collaborator.
          </p>
        </header>

        <div className="experts-toolbar">
          <label className="experts-search">
            <Search aria-hidden="true" />
            <span className="sr-only">Search experts</span>
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search name, skill, region..."
            />
          </label>
          <label className="experts-sort">
            <span>Category</span>
            <select value={category} onChange={(event) => setCategory(event.target.value)}>
              {CATEGORIES.map((item) => (
                <option key={item} value={item}>
                  {item} (
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
            <span>Sort by</span>
            <select
              value={sort}
              onChange={(event) => setSort(event.target.value as "name" | "field")}
            >
              <option value="name">Name</option>
              <option value="field">Expertise</option>
            </select>
            <ChevronDown aria-hidden="true" />
          </label>
        </div>

        <div className="experts-results-bar">
          <p>
            Showing <strong>{filtered.length}</strong> verified experts
          </p>
          <div className="experts-results-actions">
            <button onClick={downloadExperts} disabled={!experts.length}>
              <Download aria-hidden="true" /> Download all experts
            </button>
            <button onClick={() => setRegisterOpen(true)}>Add your expertise</button>
          </div>
        </div>

        {expertsError && (
          <p className="experts-feed-note" role="status">
            The approved experts directory is temporarily unavailable.
          </p>
        )}
        {expertsLoading ? (
          <div className="experts-empty">
            <p>Loading approved expertsâ€¦</p>
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
                    <span className="expert-card-category">{expert.c}</span>
                    <span className="expert-card-open">
                      <ArrowUpRight aria-hidden="true" />
                    </span>
                  </button>
                  <div className="expert-card-copy">
                    <p className="expert-card-verified">
                      <BadgeCheck aria-hidden="true" /> EMWA verified
                    </p>
                    <h3>{expert.n}</h3>
                    <p className="expert-card-field">{expert.f}</p>
                    <p className="expert-card-region">
                      <MapPin aria-hidden="true" /> {expert.r}
                    </p>
                    <button onClick={() => setSelected(expert)}>
                      View expertise <ArrowUpRight aria-hidden="true" />
                    </button>
                  </div>
                </article>
            ))}
          </div>
        ) : (
          <div className="experts-empty">
            <Search aria-hidden="true" />
            <h3>{experts.length ? "No matching experts." : "No approved experts yet."}</h3>
            <p>
              {experts.length
                ? "Try another name, field, region, or category."
                : "Approved expert profiles will appear here after administrative review."}
            </p>
            <button
              onClick={() => {
                setQuery("");
                setCategory("All");
              }}
            >
              Reset directory
            </button>
          </div>
        )}
      </section>

      <section className="experts-register-cta">
        <div>
          <p className="experts-eyebrow">Be discoverable</p>
          <h2>
            Your knowledge belongs
            <br />
            in the conversation.
          </h2>
        </div>
        <button onClick={() => setRegisterOpen(true)}>
          Join the directory <ArrowUpRight aria-hidden="true" />
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
                <BadgeCheck /> EMWA verified expert
              </p>
              <h2>{selected.n}</h2>
              <p className="expert-panel-field">{selected.f}</p>
              <p className="expert-card-region">
                <MapPin /> {selected.r}
              </p>
              <div className="expert-panel-rule" />
              <p className="expert-panel-bio">{selected.bio}</p>
              <div className="expert-panel-tags">
                <span>{selected.c}</span>
                <span>Available for interviews</span>
                <span>Mentorship</span>
              </div>
              <div className="expert-panel-socials" aria-label={`${selected.n}'s social links`}>
                <button
                  type="button"
                  onClick={() => void downloadExpert(selected)}
                  aria-label={`Download ${selected.n}'s expert profile`}
                  title="Download profile"
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
                <p className="experts-eyebrow">Application received</p>
                <h2>Thank you for adding your voice.</h2>
                <p>
                  EMWA will review your profile and contact you before it appears in the directory.
                </p>
                <button
                  onClick={() => {
                    setSubmitted(false);
                    setRegisterOpen(false);
                  }}
                >
                  Close
                </button>
              </div>
            ) : (
              <>
                <header>
                  <p className="experts-eyebrow">Expert registration</p>
                  <h2 id="register-expert-heading">
                    Join Ethiopia&apos;s trusted media directory.
                  </h2>
                  <p>
                    Share enough detail for our team to verify your experience and build a useful
                    public profile.
                  </p>
                </header>
                <form onSubmit={submitExpertApplication}>
                  <div className="expert-form-grid">
                    <label>
                      <span>Full name *</span>
                      <input
                        name="fullName"
                        required
                        minLength={2}
                        maxLength={150}
                        placeholder="Your professional name"
                      />
                    </label>
                    <label>
                      <span>Professional title *</span>
                      <input
                        name="professionalTitle"
                        required
                        minLength={2}
                        maxLength={150}
                        placeholder="e.g. Investigative reporter"
                      />
                    </label>
                    <label>
                      <span>Expert category *</span>
                      <select name="primaryExpertise" required defaultValue="">
                        <option value="" disabled>
                          Select a category
                        </option>
                        {[...EXPERT_CATEGORIES, "Other"].map((item) => (
                          <option key={item}>{item}</option>
                        ))}
                      </select>
                    </label>
                    <label>
                      <span>Location *</span>
                      <input
                        name="location"
                        required
                        minLength={2}
                        maxLength={150}
                        placeholder="City / Region"
                      />
                    </label>
                    <label className="expert-form-wide">
                      <span>Professional biography *</span>
                      <textarea
                        name="professionalBiography"
                        required
                        minLength={20}
                        maxLength={10000}
                        rows={5}
                        placeholder="Describe your expertise, experience, and the topics you can speak about."
                      />
                    </label>
                    <label>
                      <span>Email address *</span>
                      <input
                        name="email"
                        type="email"
                        required
                        maxLength={254}
                        placeholder="name@example.com"
                      />
                    </label>
                    <label>
                      <span>Phone number *</span>
                      <input
                        name="phone"
                        type="tel"
                        required
                        minLength={5}
                        maxLength={40}
                        placeholder="+251 ..."
                      />
                    </label>
                    <label>
                      <span>LinkedIn profile</span>
                      <input
                        name="linkedinUrl"
                        type="url"
                        maxLength={2000}
                        placeholder="https://linkedin.com/in/..."
                      />
                    </label>
                    <label>
                      <span>Instagram profile</span>
                      <input
                        name="instagramUrl"
                        type="url"
                        maxLength={2000}
                        placeholder="https://instagram.com/..."
                      />
                    </label>
                    <label className="expert-form-wide">
                      <span>Facebook profile</span>
                      <input
                        name="facebookUrl"
                        type="url"
                        maxLength={2000}
                        placeholder="https://facebook.com/..."
                      />
                    </label>
                    <label className="expert-form-wide">
                      <span>Profile photo</span>
                      <input name="profilePhoto" type="file" accept="image/jpeg,image/png" />
                    </label>
                    <label className="expert-form-consent expert-form-wide">
                      <input type="checkbox" required />
                      <span>
                        I confirm this information is accurate and consent to EMWA reviewing it for
                        publication.
                      </span>
                    </label>
                  </div>
                  {submitError && (
                    <p className="expert-form-error" role="alert">
                      {submitError}
                    </p>
                  )}
                  <footer>
                    <p>Review normally takes 5–7 working days.</p>
                    <button type="submit" disabled={submitting}>
                      {submitting ? "Submittingâ€¦" : "Submit for review"} <ArrowUpRight />
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
