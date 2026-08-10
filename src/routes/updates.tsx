import { createFileRoute } from "@tanstack/react-router";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { ArrowRight, ArrowUpRight, Calendar, Clock, MapPin, Play, Search, X } from "lucide-react";
import { PageShell } from "@/components/page-shell";
import { useLanguage } from "@/lib/language-context";

export const Route = createFileRoute("/updates")({
  head: () => ({
    meta: [
      { title: "Updates & Events — EMWA" },
      {
        name: "description",
        content: "EMWA updates, analysis, press releases, events, and opportunities.",
      },
      { property: "og:title", content: "Updates & Events — EMWA" },
    ],
  }),
  component: Updates,
});

const TABS = ["All", "Updates", "Press", "Articles", "Photos", "Video"] as const;

const TAB_MAP_AM: Record<string, string> = {
  All: "ሁሉም",
  Updates: "ወቅታዊ",
  Press: "ጋዜጣዊ",
  Articles: "ጽሁፎች",
  Photos: "ፎቶዎች",
  Video: "ቪዲዮ",
};

type Story = {
  d: string;
  t: (typeof TABS)[number];
  h: string;
  hAm?: string;
  e: string;
  eAm?: string;
  img: string;
  read: string;
  readAm?: string;
  slug?: string;
  content?: string;
  featured?: boolean;
};

type PublicEvent = {
  id?: string;
  day: string;
  month: string;
  year?: string;
  title: string;
  titleAm?: string;
  description: string;
  descriptionAm?: string;
  type: string;
  typeAm?: string;
  loc: string;
  locAm?: string;
  time: string;
  startsAt: string;
  endsAt?: string;
  img: string;
  full: boolean;
  capacityStatus: string;
  registrationUrl?: string;
};

const API_BASE = import.meta.env.VITE_API_URL ?? "https://emwa.mudaymarketing.com/api/v1";
const API_ORIGIN = /^https?:\/\//i.test(API_BASE) ? new URL(API_BASE).origin : "";

const resolveMediaUrl = (value: unknown, fallback: string) => {
  if (!value) return fallback;
  try {
    const base = API_ORIGIN || "http://emwa-relative.local";
    const url = new URL(String(value), base);
    const uploadPath = url.pathname.match(/(?:\/api\/v1)?(\/uploads\/.+)$/)?.[1];
    if (uploadPath) return `${API_ORIGIN}${uploadPath}`;
    return API_ORIGIN ? url.toString() : `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return fallback;
  }
};

const NEWS_IMG_FALLBACK = "/Fitsum%20Alemayehu.png";

const useNewsImageFallback = (event: React.SyntheticEvent<HTMLImageElement>) => {
  const image = event.currentTarget;
  if (image.src.includes("Fitsum")) return;
  image.onerror = null;
  image.src = NEWS_IMG_FALLBACK;
};


function Updates() {
  const { t, language } = useLanguage();
  const [stories, setStories] = useState<Story[]>([]);
  const [events, setEvents] = useState<PublicEvent[]>([]);
  const [feedLoading, setFeedLoading] = useState(true);
  const [feedError, setFeedError] = useState("");
  const [tab, setTab] = useState<(typeof TABS)[number]>("All");
  const [query, setQuery] = useState("");
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<PublicEvent | null>(null);
  const [newsletterStatus, setNewsletterStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [newsletterMessage, setNewsletterMessage] = useState("");

  const lead = stories.find((story) => story.featured) ?? stories[0];

  const filtered = useMemo(
    () =>
      stories
        .filter((story) => stories.length === 1 || story !== lead)
        .filter(
          (story) =>
            (tab === "All" || story.t === tab) &&
            (!query.trim() || `${story.h} ${story.e}`.toLowerCase().includes(query.toLowerCase())),
        ),
    [tab, query, stories, lead],
  );

  useEffect(() => {
    const controller = new AbortController();
    const load = async () => {
      try {
        const [updatesResult, eventsResult] = await Promise.allSettled([
          fetch(`${API_BASE}/public/updates?page=1&limit=100`, { signal: controller.signal }),
          fetch(`${API_BASE}/public/events?page=1&limit=100&order=asc`, { signal: controller.signal }),
        ]);

        if (updatesResult.status === "fulfilled" && updatesResult.value.ok) {
          const updatesPayload = await updatesResult.value.json();
          const labels: Record<string, Story["t"]> = {
            NEWS: "Updates",
            PRESS: "Press",
            ARTICLE: "Articles",
            PHOTO: "Photos",
            VIDEO: "Video",
          };
          const loaded = (Array.isArray(updatesPayload.data) ? updatesPayload.data : []).map((row: Record<string, unknown>) => ({
            d: new Intl.DateTimeFormat("en-GB", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            }).format(new Date(String(row.published_at ?? row.created_at))),
            t: labels[String(row.content_type)] ?? "Updates",
            h: String(row.title),
            e: String(row.excerpt),
            img: resolveMediaUrl(row.featured_image_url, PHOTOS.newsroom),
            read: row.content_type === "VIDEO" ? "Video" : "Read",
            slug: String(row.slug),
            featured: Boolean(row.is_featured),
          }));
          if (loaded.length) setStories(loaded);
        } else {
          setFeedError(t("The live newsroom feed is temporarily unavailable.", "የቀጥታ ዜና ክፍል መረጃ በጊዜያዊነት አይገኝም።"));
        }

        if (eventsResult.status === "fulfilled" && eventsResult.value.ok) {
          const eventsPayload = await eventsResult.value.json();
          const loadedEvents = (Array.isArray(eventsPayload.data) ? eventsPayload.data : []).map((row: Record<string, unknown>) => {
            const starts = new Date(String(row.starts_at));
            return {
              id: String(row.id),
              day: String(starts.getDate()).padStart(2, "0"),
              month: starts.toLocaleString("en", { month: "short" }).toUpperCase(),
              year: String(starts.getFullYear()),
              title: String(row.title),
              description: String(row.description),
              type: String(row.event_type),
              loc: String(row.location),
              time: starts.toLocaleTimeString("en", { hour: "2-digit", minute: "2-digit" }),
              startsAt: starts.toISOString(),
              endsAt: row.ends_at ? new Date(String(row.ends_at)).toISOString() : undefined,
              img: resolveMediaUrl(row.featured_image_url, PHOTOS.conference),
              full: row.capacity_status !== "AVAILABLE",
              capacityStatus: String(row.capacity_status),
              registrationUrl: row.registration_url ? String(row.registration_url) : undefined,
            };
          });
          if (loadedEvents.length) setEvents(loadedEvents);
        }
        if (updatesResult.status === "fulfilled" && updatesResult.value.ok) setFeedError("");
      } catch (error) {
        if (error instanceof Error && error.name !== "AbortError")
          setFeedError(t("The live newsroom feed is temporarily unavailable.", "የቀጥታ ዜና ክፍል መረጃ በጊዜያዊነት አይገኝም።"));
      } finally {
        if (!controller.signal.aborted) setFeedLoading(false);
      }
    };
    void load();
    return () => controller.abort();
  }, []);

  const openStory = async (story: Story) => {
    setSelectedStory(story);
    if (!story.slug || story.content) return;
    try {
      const response = await fetch(`${API_BASE}/public/updates/${encodeURIComponent(story.slug)}`);
      if (!response.ok) return;
      const payload = await response.json();
      setSelectedStory((current) => {
        if (!current || current.slug !== story.slug) return current;
        return { ...current, content: String(payload.data?.content ?? "") };
      });
    } catch {
      // Keep the summary reader available if the article detail request fails.
    }
  };

  useEffect(() => {
    document.body.style.overflow = selectedStory || selectedEvent ? "hidden" : "";
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSelectedStory(null);
        setSelectedEvent(null);
      }
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [selectedStory, selectedEvent]);

  const handleSubscribe = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const email = String(new FormData(form).get("email") ?? "").trim();

    if (!email) {
      setNewsletterStatus("error");
      setNewsletterMessage(t("Please enter a valid email address.", "እባክዎ የትክክለኛ ኢሜይል አድራሻ ያስገቡ።"));
      return;
    }

    setNewsletterStatus("submitting");
    setNewsletterMessage("");

    try {
      const response = await fetch(`${API_BASE}/public/newsletter-subscriptions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(payload?.error?.message ?? t("Unable to subscribe right now.", "አሁን ለማስመዝገብ አንችልም።"));
      }
      setNewsletterStatus("success");
      setNewsletterMessage(t("You’re subscribed to The Narrative Shift.", "ወደ The Narrative Shift ተመዝግበዋል።"));
      form.reset();
    } catch (error) {
      setNewsletterStatus("error");
      setNewsletterMessage(error instanceof Error ? error.message : t("Unable to subscribe.", "ማስመዝገብ አልተቻለም።"));
    }
  };

  return (
    <PageShell>
      <section className="updates2-hero">
        <div className="updates2-hero-intro">
          <p className="updates2-eyebrow">{t("Updates, ideas & opportunities", "ወቅታዊ መረጃዎች፣ ሃሳቦች እና ዕድሎች")}</p>
          <h1>
            {language === "am" ? (
              <>
                EMWAን ወደፊት<br />
                <em>ሚያራምዱ ነገሮች።</em>
              </>
            ) : (
              <>
                What&apos;s moving
                <br />
                <em>EMWA forward.</em>
              </>
            )}
          </h1>
          <p>
            {t(
              "Reporting from our programs, public positions, member community, and the wider movement for gender equality in Ethiopian media.",
              "ከፕሮግራሞቻችን፣ ከህዝባዊ አቋሞቻችን፣ ከአባላቶቻችን እና በኢትዮጵያ ሚዲያ የፆታ እኩልነት እንቅስቃሴ የሚቀርቡ ዘገባዎች።",
            )}
          </p>
          <div className="updates2-hero-meta">
            <span>
              <strong>{String(stories.length).padStart(2, "0")}</strong> {t("latest stories", "አዳዲስ ታሪኮች")}
            </span>
            <span>
              <strong>{String(events.length).padStart(2, "0")}</strong> {t("upcoming events", "ቀጣይ ዝግጅቶች")}
            </span>
            <span>{t("Updated 12 Nov 2026", "የተሻሻለው 12 ኖቬምበር 2026")}</span>
          </div>
        </div>
        {lead ? (
          <article className="updates2-lead">
            <img
              src={lead.img}
              alt="Journalists collaborating in a professional newsroom"
              fetchPriority="high"
              onError={useNewsImageFallback}
            />
            <div className="updates2-lead-shade" />
            <div className="updates2-lead-copy">
              <div>
                <span>{t("Lead story", "ዋና ታሪክ")}</span>
                <time>{lead.d}</time>
              </div>
              <h2>{language === "am" && lead.hAm ? lead.hAm : lead.h}</h2>
              <p>{language === "am" && lead.eAm ? lead.eAm : lead.e}</p>
              <button onClick={() => void openStory(lead)}>
                {t("Read story", "ታሪኩን ያንብቡ")} <ArrowUpRight />
              </button>
            </div>
            <small>Documentary photograph / Unsplash</small>
          </article>
        ) : (
          <div className="updates2-lead updates2-lead-empty" role="status">
            <div>
              <span>{feedLoading ? t("Connecting to newsroom", "ከዜና ክፍሉ ጋር በመገናኘት ላይ") : t("From the newsroom", "ከዜና ክፍሉ")}</span>
              <h2>{feedLoading ? t("Loading the latest updates…", "አዳዲስ መረጃዎችን በመጫን ላይ…") : t("No published updates yet.", "ገና የታተሙ መረጃዎች የሉም።")}</h2>
              <p>{feedLoading ? t("Please wait while we retrieve EMWA's latest stories.", "እባክዎን የEMWA አዳዲስ ታሪኮች እስከሚጫኑ ይታገሱ።") : t("Published stories from the EMWA administration desk will appear here.", "ከEMWA አስተዳደር የሚወጡ ታሪኮች እዚህ ይታያሉ።")}</p>
            </div>
          </div>
        )}
      </section>

      <section className="updates2-stories" id="stories">
        <header className="updates2-section-head">
          <div>
            <p className="updates2-eyebrow">{t("From the newsroom", "ከዜና ክፍሉ")}</p>
            <h2>{t("Latest stories.", "አዳዲስ ታሪኮች።")}</h2>
          </div>
          <label>
            <Search />
            <span className="sr-only">{t("Search stories", "ታሪኮችን ይፈልጉ")}</span>
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={t("Search updates", "ወቅታዊ መረጃዎችን ይፈልጉ")}
            />
          </label>
        </header>
        {feedError && (
          <p className="updates2-feed-note" role="status">
            {feedError}
          </p>
        )}
        <div className="updates2-tabs" role="group" aria-label="Filter stories">
          {TABS.map((item) => (
            <button
              key={item}
              className={tab === item ? "is-active" : ""}
              aria-pressed={tab === item}
              onClick={() => setTab(item)}
            >
              {language === "am" ? TAB_MAP_AM[item] ?? item : item}
            </button>
          ))}
        </div>
        {feedLoading ? (
          <div className="updates2-empty" role="status">
            <Search />
            <h3>{t("Loading newsroom updates…", "የዜና ክፍል መረጃዎችን በመጫን ላይ…")}</h3>
          </div>
        ) : filtered.length ? (
          <div className="updates2-grid">
            {filtered.map((story, index) => (
              <article
                className={`updates2-card${index === 0 ? " is-featured" : ""}`}
                key={story.h}
              >
                <div className="updates2-card-image">
                  <img src={story.img} alt="" loading="lazy" onError={useNewsImageFallback} />
                  {story.t === "Video" && (
                    <span>
                      <Play fill="currentColor" />
                    </span>
                  )}
                  <small>{language === "am" ? TAB_MAP_AM[story.t] ?? story.t : story.t}</small>
                </div>
                <div className="updates2-card-copy">
                  <div>
                    <time>{story.d}</time>
                    <span>{language === "am" && story.readAm ? story.readAm : story.read}</span>
                  </div>
                  <h3>{language === "am" && story.hAm ? story.hAm : story.h}</h3>
                  <p>{language === "am" && story.eAm ? story.eAm : story.e}</p>
                  <button onClick={() => void openStory(story)}>
                    {t("Continue reading", "ንባቡን ይቀጥሉ")} <ArrowRight />
                  </button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="updates2-empty">
            <Search />
            <h3>{t("No matching updates.", "ተዛማጅ መረጃዎች አልተገኙም።")}</h3>
            <button
              onClick={() => {
                setQuery("");
                setTab("All");
              }}
            >
              {t("Clear search", "ፍለጋውን አጽዳ")}
            </button>
          </div>
        )}
      </section>

      <section className="updates2-events" id="events">
        <header>
          <div>
            <p className="updates2-eyebrow">{t("Gather with us", "ከእኛ ጋር ይሰብሰቡ")}</p>
            <h2>{t("Upcoming events.", "ቀጣይ ዝግጅቶች።")}</h2>
          </div>
          <p>
            {t(
              "Workshops, conversations, and member gatherings created to move knowledge into action.",
              "እውቀትን ወደ ተግባር ለመለወጥ የተዘጋጁ ወርክሾፖች፣ ውይይቶች እና የአባላት ስብሰባዎች።",
            )}
          </p>
        </header>
        <div className="updates2-event-grid">
          {events.map((event, index) => (
            <article className={index === 0 ? "is-next" : ""} key={event.title}>
              <div className="updates2-event-date">
                <strong>{event.day}</strong>
                <span>
                  {event.month}
                  <br />
                  {event.year ?? "2026"}
                </span>
              </div>
              <p>{index === 0 ? t("Next event", "ቀጣይ ዝግጅት") : language === "am" && event.typeAm ? event.typeAm : event.type}</p>
              <h3>{language === "am" && event.titleAm ? event.titleAm : event.title}</h3>
              <div className="updates2-event-info">
                <span>
                  <MapPin />
                  {language === "am" && event.locAm ? event.locAm : event.loc}
                </span>
                <span>
                  <Clock />
                  {event.time}
                </span>
              </div>
              {event.full && <b>{t("At capacity", "ቦታ አልቋል")}</b>}
              <button onClick={() => setSelectedEvent(event)}>
                {t("View details", "ዝርዝሩን ይመልከቱ")} <ArrowUpRight />
              </button>
            </article>
          ))}
        </div>
        <button className="updates2-calendar">
          <Calendar /> {t("Open full calendar", "ሙሉ ካላንደር ይመልከቱ")} <ArrowRight />
        </button>
      </section>

      <section className="updates2-subscribe">
        <div>
          <p className="updates2-eyebrow">{t("The monthly briefing", "ወርሃዊ መረጃ")}</p>
          <h2>
            {language === "am" ? (
              <>
                አስፈላጊ ስራ።<br />
                ያለ አላስፈላጊ መልዕክት።
              </>
            ) : (
              <>
                Important work.
                <br />
                No inbox noise.
              </>
            )}
          </h2>
          <p>{t("A concise update on EMWA programs, policy, events, and opportunities.", "በEMWA ፕሮግራሞች፣ ፖሊሲ፣ ዝግጅቶች እና ዕድሎች ዙሪያ አጭር መረጃ።")}</p>
        </div>
        <form className="updates2-subscribe-form" onSubmit={handleSubscribe}>
          <label>
            <span>{t("Email address", "የኢሜይል አድራሻ")}</span>
            <input
              name="email"
              type="email"
              required
              placeholder="name@example.com"
              disabled={newsletterStatus === "submitting"}
            />
          </label>
          <button type="submit" disabled={newsletterStatus === "submitting"}>
            {newsletterStatus === "submitting" ? t("Joining…", "በማስቀላቀል ላይ…") : t("Join the list", "ዝርዝሩን ይቀላቀሉ")} <ArrowRight />
          </button>
          <small>{t("One email each month. Unsubscribe anytime.", "በወር አንድ ኢሜይል ብቻ። በፈለጉት ጊዜ ይውጡ።")}</small>
          <p className={`updates2-subscribe-note${newsletterStatus === "success" ? " is-success" : newsletterStatus === "error" ? " is-error" : ""}`} role={newsletterMessage ? "status" : undefined}>
            {newsletterMessage || ""}
          </p>
        </form>
      </section>

      {selectedStory && (
        <div className="updates-story-backdrop" onMouseDown={() => setSelectedStory(null)}>
          <article
            className="updates-story-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="updates-story-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <button
              className="updates-story-close"
              onClick={() => setSelectedStory(null)}
              aria-label="Close story"
            >
              <X />
            </button>
            <img src={selectedStory.img} alt="" className="updates-story-image" onError={useNewsImageFallback} />
            <div className="updates-story-content">
              <div className="updates-story-meta">
                <span>{language === "am" ? TAB_MAP_AM[selectedStory.t] ?? selectedStory.t : selectedStory.t}</span>
                <time>{selectedStory.d}</time>
                <small>{language === "am" && selectedStory.readAm ? selectedStory.readAm : selectedStory.read}</small>
              </div>
              <h2 id="updates-story-title">{language === "am" && selectedStory.hAm ? selectedStory.hAm : selectedStory.h}</h2>
              <p className="updates-story-intro">{language === "am" && selectedStory.eAm ? selectedStory.eAm : selectedStory.e}</p>
              <div className="updates-story-body">
                {(selectedStory.content
                  ? selectedStory.content.split(/\n{2,}/).filter(Boolean)
                  : [selectedStory.e]
                ).map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </div>
          </article>
        </div>
      )}
      {selectedEvent && (
        <div className="updates-story-backdrop" onMouseDown={() => setSelectedEvent(null)}>
          <article
            className="updates-story-modal updates-event-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="updates-event-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <button
              className="updates-story-close"
              onClick={() => setSelectedEvent(null)}
              aria-label="Close event details"
            >
              <X />
            </button>
            <img
              src={selectedEvent.img}
              alt=""
              className="updates-story-image"
              onError={useNewsImageFallback}
            />
            <div className="updates-story-content">
              <div className="updates-story-meta">
                <span>{language === "am" && selectedEvent.typeAm ? selectedEvent.typeAm : selectedEvent.type}</span>
                <time>
                  {new Intl.DateTimeFormat("en-GB", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  }).format(new Date(selectedEvent.startsAt))}
                </time>
                <small>{selectedEvent.full ? t("At capacity", "ቦታ አልቋል") : t("Registration available", "ምዝገባ ክፍት ነው")}</small>
              </div>
              <h2 id="updates-event-title">{language === "am" && selectedEvent.titleAm ? selectedEvent.titleAm : selectedEvent.title}</h2>
              <p className="updates-story-intro">{language === "am" && selectedEvent.descriptionAm ? selectedEvent.descriptionAm : selectedEvent.description}</p>
              <div className="updates-event-facts">
                <div><MapPin /><span>{t("Location", "ቦታ")}<strong>{language === "am" && selectedEvent.locAm ? selectedEvent.locAm : selectedEvent.loc}</strong></span></div>
                <div><Clock /><span>{t("Starts", "ይጀምራል")}<strong>{new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short" }).format(new Date(selectedEvent.startsAt))}</strong></span></div>
                {selectedEvent.endsAt && (
                  <div><Calendar /><span>{t("Ends", "ይጠናቀቃል")}<strong>{new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short" }).format(new Date(selectedEvent.endsAt))}</strong></span></div>
                )}
              </div>
              {!selectedEvent.full && selectedEvent.registrationUrl && (
                <a
                  className="updates-event-register"
                  href={selectedEvent.registrationUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  {t("Register for this event", "ለዚህ ዝግጅት ይመዝገቡ")} <ArrowUpRight />
                </a>
              )}
            </div>
          </article>
        </div>
      )}
    </PageShell>
  );
}
