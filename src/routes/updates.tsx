import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
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

const useNewsImageFallback = (event: React.SyntheticEvent<HTMLImageElement>) => {
  const image = event.currentTarget;
  if (image.src === PHOTOS.newsroom) return;
  image.onerror = null;
  image.src = PHOTOS.newsroom;
};

const PHOTOS = {
  conference:
    "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1800&q=85",
  newsroom:
    "https://images.unsplash.com/photo-1495020689067-958852a7765e?auto=format&fit=crop&w=1800&q=85",
  journalist:
    "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=1600&q=85",
  workshop:
    "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=1600&q=85",
} as const;

const FALLBACK_STORIES: Story[] = [
  {
    d: "12 Nov 2026",
    t: "Updates",
    h: "EMWA submits gender-equity brief to Parliament",
    hAm: "EMWA ለፓርላማ የፆታ እኩልነት ፖሊሲ ሰነድ አቀረበ",
    e: "A policy agenda for measurable representation, safer newsrooms, and transparent leadership pathways across public broadcasting.",
    eAm: "በህዝብ ብሮድካስቲንግ ውስጥ ሊለካ የሚችል ተሳትፎን፣ ደህንነቱ የተጠበቀ የዜና ክፍልን እና ግልጽ የአመራር መንገዶችን የሚያስቀምጥ የፖሊሲ አጀንዳ።",
    img: PHOTOS.newsroom,
    read: "4 min",
    readAm: "4 ደቂቃ",
  },
  {
    d: "04 Nov 2026",
    t: "Photos",
    h: "Thirty-eight women complete the Leadership Incubator",
    hAm: "ሰላሳ ስምንት ሴቶች የአመራርነት ማዕከል ስልጠናቸውን አጠናቀቁ",
    e: "Editors and producers from nine regions mark six months of shared learning and newsroom leadership.",
    eAm: "ከዘጠኝ ክልሎች የተወጣጡ አዘጋጆች እና ፕሮዲዩሰሮች የFact-Checking እና የዜና ክፍል አመራር ስልጠናቸውን አጠናቀዋል።",
    img: PHOTOS.conference,
    read: "Gallery",
    readAm: "ፎቶዎች",
  },
  {
    d: "27 Oct 2026",
    t: "Updates",
    h: "Digital safety support reaches two more regions",
    hAm: "የዲጂታል ደህንነት ድጋፍ ለሁለት ተጨማሪ ክልሎች ተዳረሰ",
    e: "Rapid-response legal and technical assistance expands to Amhara and Sidama.",
    eAm: "አጣዳፊ የህግ እና ቴክኒካዊ ድጋፍ ወደ አማራ እና ሲዳማ ክልሎች ተስፋፍቷል።",
    img: PHOTOS.workshop,
    read: "3 min",
    readAm: "3 ደቂቃ",
  },
  {
    d: "15 Oct 2026",
    t: "Press",
    h: "Statement on Ethiopia's 2026 press freedom index",
    hAm: "በኢትዮጵያ የ2026 የፕሬስ ነፃነት መለኪያ ላይ የተሰጠ መግለጫ",
    e: "What the latest ranking means for women reporting across the country.",
    eAm: "የቅርብ ጊዜው ደረጃ በሀገሪቱ ውስጥ ዘገባ በሚያቀርቡ ሴቶች ላይ ያለው ትርጉም።",
    img: PHOTOS.journalist,
    read: "Statement",
    readAm: "መግለጫ",
  },
  {
    d: "02 Oct 2026",
    t: "Articles",
    h: "Why regional newsrooms need women editors—now",
    hAm: "የክልል ዜና ክፍሎች ሴት አዘጋጆች ለምን ያስፈልጓቸዋል?",
    e: "Representation matters. Editorial authority changes what gets reported and whose experience counts.",
    eAm: "ተሳትፎ ወሳኝ ነው። የአዘጋጅነት ስልጣን የሚዘገቡ ጉዳዮችን እና የሰዎችን ልምድ ይለውጣል።",
    img: PHOTOS.newsroom,
    read: "7 min",
    readAm: "7 ደቂቃ",
  },
  {
    d: "20 Sep 2026",
    t: "Video",
    h: "A new alliance for African women in media",
    hAm: "ለአፍሪካ ሴቶች በሚዲያ አዲስ ህብረት",
    e: "Highlights from EMWA's entry into a continental network of eleven associations.",
    eAm: "EMWA ከአስራ አንድ አህጉራዊ ማህበራት ጋር ያደረገው የትብብር ስምምነት ዋና ዋና ነጥቦች።",
    img: PHOTOS.conference,
    read: "06:42",
    readAm: "06:42",
  },
];

const STORY_DETAILS: Record<string, string[]> = {
  "EMWA submits gender-equity brief to Parliament": [
    "EMWA has submitted a new gender-equity policy brief calling for measurable representation, safer working environments, and transparent routes into newsroom leadership across Ethiopia's public media institutions.",
    "The brief draws on consultations with women journalists, editors, producers, regional media leaders, and civil-society partners. It identifies persistent gaps in decision-making roles, workplace protection, professional development, and the treatment of gender in editorial coverage.",
    "EMWA is asking public institutions to publish representation data, strengthen reporting and accountability systems, and establish funded leadership pathways for women working across national and regional newsrooms.",
  ],
  "Thirty-eight women complete the Leadership Incubator": [
    "Thirty-eight editors and producers from nine regions have completed EMWA's six-month Leadership Incubator, marking a major milestone for the program's newest cohort.",
    "Participants worked through newsroom leadership, editorial decision-making, team development, digital safety, and audience strategy with mentors from across Ethiopia's media community.",
    "The closing gathering celebrated the participants' projects and created new connections between regional newsrooms. Graduates will continue through a peer network supported by EMWA.",
  ],
  "Digital safety support reaches two more regions": [
    "EMWA's rapid-response digital safety program has expanded to Amhara and Sidama, giving more women journalists access to urgent technical guidance and coordinated legal support.",
    "The service helps journalists respond to account compromise, online harassment, doxxing, device risks, and threats connected to their professional work.",
    "Regional partners will also deliver practical safety sessions so newsrooms can improve everyday security habits before an incident occurs.",
  ],
  "Statement on Ethiopia's 2026 press freedom index": [
    "The latest press freedom index is a reminder that access to reliable information depends on the safety, independence, and diversity of the people producing it.",
    "Women journalists continue to experience distinct professional and online threats that are often missing from broad assessments of media freedom.",
    "EMWA calls on public authorities, media owners, platforms, and professional associations to make gender-responsive safety and accountability part of every press-freedom commitment.",
  ],
  "Why regional newsrooms need women editors—now": [
    "Regional newsrooms shape how communities understand public life, yet women remain underrepresented in the editorial positions that decide which stories receive attention.",
    "When women hold editorial authority, the change reaches beyond representation. Sources broaden, workplace cultures improve, and community experiences that were previously overlooked become part of the public record.",
    "Building that leadership requires intentional commissioning, mentorship, fair promotion systems, and sustained investment in women journalists outside the capital.",
  ],
  "A new alliance for African women in media": [
    "EMWA has joined a continental alliance bringing together eleven organizations working to advance women in journalism and media leadership across Africa.",
    "The network will support shared training, research, advocacy, mentorship, and rapid solidarity when women journalists face threats because of their work.",
    "The partnership gives Ethiopian media women a stronger route into regional conversations while creating opportunities to exchange practical knowledge with peers across the continent.",
  ],
};

const FALLBACK_EVENTS: PublicEvent[] = [
  {
    day: "22",
    month: "NOV",
    title: "Regional Chapter Convening",
    titleAm: "የክልል ቅርንጫፍ ስብሰባ",
    type: "Convening",
    typeAm: "ስብሰባ",
    loc: "Hawassa University",
    locAm: "ሀዋሳ ዩኒቨርሲቲ",
    time: "09:00 EAT",
    startsAt: "2026-11-22T09:00:00Z",
    img: PHOTOS.conference,
    full: false,
    capacityStatus: "AVAILABLE",
    description: "Annual regional convening bringing together chapter leadership and members.",
  },
  {
    day: "05",
    month: "DEC",
    title: "Media Ethics Symposium 2026",
    titleAm: "የሚዲያ ሥነ-ምግባር ሲምፖዚየም 2026",
    type: "Symposium",
    typeAm: "ሲምፖዚየም",
    loc: "Skylight Hotel, Addis Ababa",
    locAm: "ስካይላይት ሆቴል፣ አዲስ አበባ",
    time: "Full day",
    startsAt: "2026-12-05T08:30:00Z",
    img: PHOTOS.newsroom,
    full: false,
    capacityStatus: "AVAILABLE",
    description: "National symposium on media ethics, digital safety, and editorial integrity.",
  },
  {
    day: "11",
    month: "DEC",
    title: "Reporting on Climate",
    titleAm: "በአየር ንብረት ዙሪያ ዘገባ ማቅረብ",
    type: "Webinar",
    typeAm: "ዌቢናር",
    loc: "Online",
    locAm: "ኦንላይን",
    time: "16:00 EAT",
    startsAt: "2026-12-11T16:00:00Z",
    img: PHOTOS.journalist,
    full: false,
    capacityStatus: "AVAILABLE",
    description: "Interactive webinar on gender-sensitive climate reporting in the Horn of Africa.",
  },
  {
    day: "18",
    month: "DEC",
    title: "Year-end Members Assembly",
    titleAm: "የዓመቱ መጨረሻ የአባላት ጠቅላላ ጉባኤ",
    type: "Assembly",
    typeAm: "ጠቅላላ ጉባኤ",
    loc: "EMWA HQ, Addis Ababa",
    locAm: "የEMWA ዋና ጽሕፈት ቤት፣ አዲስ አበባ",
    time: "14:00 EAT",
    startsAt: "2026-12-18T14:00:00Z",
    img: PHOTOS.workshop,
    full: true,
    capacityStatus: "FULL",
    description: "Year-end reporting, member networking, and strategic outline for the coming year.",
  },
];

function Updates() {
  const { t, language } = useLanguage();
  const [stories, setStories] = useState<Story[]>(FALLBACK_STORIES);
  const [events, setEvents] = useState<PublicEvent[]>(FALLBACK_EVENTS);
  const [feedLoading, setFeedLoading] = useState(true);
  const [feedError, setFeedError] = useState("");
  const [tab, setTab] = useState<(typeof TABS)[number]>("All");
  const [query, setQuery] = useState("");
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<PublicEvent | null>(null);

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
        <form onSubmit={(event) => event.preventDefault()}>
          <label>
            <span>{t("Email address", "የኢሜይል አድራሻ")}</span>
            <input type="email" required placeholder="name@example.com" />
          </label>
          <button>
            {t("Join the list", "ዝርዝሩን ይቀላቀሉ")} <ArrowRight />
          </button>
          <small>{t("One email each month. Unsubscribe anytime.", "በወር አንድ ኢሜይል ብቻ። በፈለጉት ጊዜ ይውጡ።")}</small>
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
                  : (STORY_DETAILS[selectedStory.h] ?? [selectedStory.e])
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
