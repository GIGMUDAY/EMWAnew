import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, ArrowUpRight, Calendar, Clock, MapPin, Play, Search, X } from "lucide-react";
import { PageShell } from "@/components/page-shell";

export const Route = createFileRoute("/updates")({
  head: () => ({
    meta: [
      { title: "News & Events — EMWA" },
      {
        name: "description",
        content: "EMWA news, analysis, press releases, events, and opportunities.",
      },
      { property: "og:title", content: "News & Events — EMWA" },
    ],
  }),
  component: Updates,
});

const TABS = ["All", "News", "Press", "Articles", "Photos", "Video"] as const;
type Story = {
  d: string;
  t: (typeof TABS)[number];
  h: string;
  e: string;
  img: string;
  read: string;
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
  type: string;
  loc: string;
  time: string;
  full: boolean;
  registrationUrl?: string;
};
const API_BASE = import.meta.env.VITE_API_URL ?? "https://emwa.mudaymarketing.com/api/v1";
const API_ORIGIN = new URL(API_BASE).origin;

const resolveMediaUrl = (value: unknown, fallback: string) => {
  if (!value) return fallback;
  try {
    const url = new URL(String(value), API_ORIGIN);
    // Uploaded files may have been saved with the development host. Always serve
    // them from the same backend currently configured for the frontend.
    if (url.pathname.startsWith("/uploads/")) return `${API_ORIGIN}${url.pathname}`;
    return url.toString();
  } catch {
    return fallback;
  }
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
    t: "News",
    h: "EMWA submits gender-equity brief to Parliament",
    e: "A policy agenda for measurable representation, safer newsrooms, and transparent leadership pathways across public broadcasting.",
    img: PHOTOS.newsroom,
    read: "4 min",
  },
  {
    d: "04 Nov 2026",
    t: "Photos",
    h: "Thirty-eight women complete the Leadership Incubator",
    e: "Editors and producers from nine regions mark six months of shared learning and newsroom leadership.",
    img: PHOTOS.conference,
    read: "Gallery",
  },
  {
    d: "27 Oct 2026",
    t: "News",
    h: "Digital safety support reaches two more regions",
    e: "Rapid-response legal and technical assistance expands to Amhara and Sidama.",
    img: PHOTOS.workshop,
    read: "3 min",
  },
  {
    d: "15 Oct 2026",
    t: "Press",
    h: "Statement on Ethiopia's 2026 press freedom index",
    e: "What the latest ranking means for women reporting across the country.",
    img: PHOTOS.journalist,
    read: "Statement",
  },
  {
    d: "02 Oct 2026",
    t: "Articles",
    h: "Why regional newsrooms need women editors—now",
    e: "Representation matters. Editorial authority changes what gets reported and whose experience counts.",
    img: PHOTOS.newsroom,
    read: "7 min",
  },
  {
    d: "20 Sep 2026",
    t: "Video",
    h: "A new alliance for African women in media",
    e: "Highlights from EMWA's entry into a continental network of eleven associations.",
    img: PHOTOS.conference,
    read: "06:42",
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
    type: "Convening",
    loc: "Hawassa University",
    time: "09:00 EAT",
    full: false,
  },
  {
    day: "05",
    month: "DEC",
    title: "Media Ethics Symposium 2026",
    type: "Symposium",
    loc: "Skylight Hotel, Addis Ababa",
    time: "Full day",
    full: false,
  },
  {
    day: "11",
    month: "DEC",
    title: "Reporting on Climate",
    type: "Webinar",
    loc: "Online",
    time: "16:00 EAT",
    full: false,
  },
  {
    day: "18",
    month: "DEC",
    title: "Year-end Members Assembly",
    type: "Assembly",
    loc: "EMWA HQ, Addis Ababa",
    time: "14:00 EAT",
    full: true,
  },
];

function Updates() {
  const [stories, setStories] = useState<Story[]>([]);
  const [events, setEvents] = useState<PublicEvent[]>([]);
  const [feedLoading, setFeedLoading] = useState(true);
  const [feedError, setFeedError] = useState("");
  const [tab, setTab] = useState<(typeof TABS)[number]>("All");
  const [query, setQuery] = useState("");
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
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
            NEWS: "News",
            PRESS: "Press",
            ARTICLE: "Articles",
            PHOTO: "Photos",
            VIDEO: "Video",
          };
          setStories(
            (Array.isArray(updatesPayload.data) ? updatesPayload.data : []).map((row: Record<string, unknown>) => ({
              d: new Intl.DateTimeFormat("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              }).format(new Date(String(row.published_at ?? row.created_at))),
              t: labels[String(row.content_type)] ?? "News",
              h: String(row.title),
              e: String(row.excerpt),
              img: resolveMediaUrl(row.featured_image_url, PHOTOS.newsroom),
              read: row.content_type === "VIDEO" ? "Video" : "Read",
              slug: String(row.slug),
              featured: Boolean(row.is_featured),
            })),
          );
        } else {
          setFeedError("The live newsroom feed is temporarily unavailable.");
        }

        if (eventsResult.status === "fulfilled" && eventsResult.value.ok) {
          const eventsPayload = await eventsResult.value.json();
          setEvents(
            (Array.isArray(eventsPayload.data) ? eventsPayload.data : []).map((row: Record<string, unknown>) => {
              const starts = new Date(String(row.starts_at));
              return {
                id: String(row.id),
                day: String(starts.getDate()).padStart(2, "0"),
                month: starts.toLocaleString("en", { month: "short" }).toUpperCase(),
                year: String(starts.getFullYear()),
                title: String(row.title),
                type: String(row.event_type),
                loc: String(row.location),
                time: starts.toLocaleTimeString("en", { hour: "2-digit", minute: "2-digit" }),
                full: row.capacity_status !== "AVAILABLE",
                registrationUrl: row.registration_url ? String(row.registration_url) : undefined,
              };
            }),
          );
        }
        if (updatesResult.status === "fulfilled" && updatesResult.value.ok) setFeedError("");
      } catch (error) {
        if (error instanceof Error && error.name !== "AbortError")
          setFeedError("The live newsroom feed is temporarily unavailable.");
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
    document.body.style.overflow = selectedStory ? "hidden" : "";
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSelectedStory(null);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [selectedStory]);

  return (
    <PageShell>
      <section className="updates2-hero">
        <div className="updates2-hero-intro">
          <p className="updates2-eyebrow">News, ideas &amp; opportunities</p>
          <h1>
            What&apos;s moving
            <br />
            <em>EMWA forward.</em>
          </h1>
          <p>
            Reporting from our programs, public positions, member community, and the wider movement
            for gender equality in Ethiopian media.
          </p>
          <div className="updates2-hero-meta">
            <span>
              <strong>{String(stories.length).padStart(2, "0")}</strong> latest stories
            </span>
            <span>
              <strong>{String(events.length).padStart(2, "0")}</strong> upcoming events
            </span>
            <span>Updated 12 Nov 2026</span>
          </div>
        </div>
        {lead ? <article className="updates2-lead">
          <img
            src={lead.img}
            alt="Journalists collaborating in a professional newsroom"
            fetchPriority="high"
          />
          <div className="updates2-lead-shade" />
          <div className="updates2-lead-copy">
            <div>
              <span>Lead story</span>
              <time>{lead.d}</time>
            </div>
            <h2>{lead.h}</h2>
            <p>{lead.e}</p>
            <button onClick={() => void openStory(lead)}>
              Read story <ArrowUpRight />
            </button>
          </div>
          <small>Documentary photograph / Unsplash</small>
        </article> : <div className="updates2-lead updates2-lead-empty" role="status">
          <div><span>{feedLoading ? "Connecting to newsroom" : "From the newsroom"}</span><h2>{feedLoading ? "Loading the latest updates…" : "No published updates yet."}</h2><p>{feedLoading ? "Please wait while we retrieve EMWA's latest stories." : "Published stories from the EMWA administration desk will appear here."}</p></div>
        </div>}
      </section>

      <section className="updates2-stories" id="stories">
        <header className="updates2-section-head">
          <div>
            <p className="updates2-eyebrow">From the newsroom</p>
            <h2>Latest stories.</h2>
          </div>
          <label>
            <Search />
            <span className="sr-only">Search stories</span>
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search updates"
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
              {item}
            </button>
          ))}
        </div>
        {feedLoading ? (
          <div className="updates2-empty" role="status"><Search /><h3>Loading newsroom updates…</h3></div>
        ) : filtered.length ? (
          <div className="updates2-grid">
            {filtered.map((story, index) => (
              <article
                className={`updates2-card${index === 0 ? " is-featured" : ""}`}
                key={story.h}
              >
                <div className="updates2-card-image">
                  <img src={story.img} alt="" loading="lazy" />
                  {story.t === "Video" && (
                    <span>
                      <Play fill="currentColor" />
                    </span>
                  )}
                  <small>{story.t}</small>
                </div>
                <div className="updates2-card-copy">
                  <div>
                    <time>{story.d}</time>
                    <span>{story.read}</span>
                  </div>
                  <h3>{story.h}</h3>
                  <p>{story.e}</p>
                  <button onClick={() => void openStory(story)}>
                    Continue reading <ArrowRight />
                  </button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="updates2-empty">
            <Search />
            <h3>No matching updates.</h3>
            <button
              onClick={() => {
                setQuery("");
                setTab("All");
              }}
            >
              Clear search
            </button>
          </div>
        )}
      </section>

      <section className="updates2-events" id="events">
        <header>
          <div>
            <p className="updates2-eyebrow">Gather with us</p>
            <h2>Upcoming events.</h2>
          </div>
          <p>
            Workshops, conversations, and member gatherings created to move knowledge into action.
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
              <p>{index === 0 ? "Next event" : event.type}</p>
              <h3>{event.title}</h3>
              <div className="updates2-event-info">
                <span>
                  <MapPin />
                  {event.loc}
                </span>
                <span>
                  <Clock />
                  {event.time}
                </span>
              </div>
              {event.full ? (
                <b>At capacity</b>
              ) : (
                <button
                  onClick={() =>
                    event.registrationUrl &&
                    window.open(event.registrationUrl, "_blank", "noopener,noreferrer")
                  }
                >
                  View details <ArrowUpRight />
                </button>
              )}
            </article>
          ))}
        </div>
        <button className="updates2-calendar">
          <Calendar /> Open full calendar <ArrowRight />
        </button>
      </section>

      <section className="updates2-subscribe">
        <div>
          <p className="updates2-eyebrow">The monthly briefing</p>
          <h2>
            Important work.
            <br />
            No inbox noise.
          </h2>
          <p>A concise update on EMWA programs, policy, events, and opportunities.</p>
        </div>
        <form onSubmit={(event) => event.preventDefault()}>
          <label>
            <span>Email address</span>
            <input type="email" required placeholder="name@example.com" />
          </label>
          <button>
            Join the list <ArrowRight />
          </button>
          <small>One email each month. Unsubscribe anytime.</small>
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
            <img src={selectedStory.img} alt="" className="updates-story-image" />
            <div className="updates-story-content">
              <div className="updates-story-meta">
                <span>{selectedStory.t}</span>
                <time>{selectedStory.d}</time>
                <small>{selectedStory.read}</small>
              </div>
              <h2 id="updates-story-title">{selectedStory.h}</h2>
              <p className="updates-story-intro">{selectedStory.e}</p>
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
    </PageShell>
  );
}
