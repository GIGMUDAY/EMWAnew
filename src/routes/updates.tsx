import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowRight, ArrowUpRight, Calendar, Clock, MapPin, Play, Search } from "lucide-react";
import { PageShell } from "@/components/page-shell";

export const Route = createFileRoute("/updates")({
  head: () => ({ meta: [
    { title: "News & Events — EMWA" },
    { name: "description", content: "EMWA news, analysis, press releases, events, and opportunities." },
    { property: "og:title", content: "News & Events — EMWA" },
  ] }),
  component: Updates,
});

const TABS = ["All", "News", "Press", "Articles", "Photos", "Video"] as const;
const PHOTOS = {
  conference: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1800&q=85",
  newsroom: "https://images.unsplash.com/photo-1495020689067-958852a7765e?auto=format&fit=crop&w=1800&q=85",
  journalist: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=1600&q=85",
  workshop: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=1600&q=85",
} as const;

const STORIES = [
  { d: "12 Nov 2026", t: "News", h: "EMWA submits gender-equity brief to Parliament", e: "A policy agenda for measurable representation, safer newsrooms, and transparent leadership pathways across public broadcasting.", img: PHOTOS.newsroom, read: "4 min" },
  { d: "04 Nov 2026", t: "Photos", h: "Thirty-eight women complete the Leadership Incubator", e: "Editors and producers from nine regions mark six months of shared learning and newsroom leadership.", img: PHOTOS.conference, read: "Gallery" },
  { d: "27 Oct 2026", t: "News", h: "Digital safety support reaches two more regions", e: "Rapid-response legal and technical assistance expands to Amhara and Sidama.", img: PHOTOS.workshop, read: "3 min" },
  { d: "15 Oct 2026", t: "Press", h: "Statement on Ethiopia's 2026 press freedom index", e: "What the latest ranking means for women reporting across the country.", img: PHOTOS.journalist, read: "Statement" },
  { d: "02 Oct 2026", t: "Articles", h: "Why regional newsrooms need women editors—now", e: "Representation matters. Editorial authority changes what gets reported and whose experience counts.", img: PHOTOS.newsroom, read: "7 min" },
  { d: "20 Sep 2026", t: "Video", h: "A new alliance for African women in media", e: "Highlights from EMWA's entry into a continental network of eleven associations.", img: PHOTOS.conference, read: "06:42" },
] as const;

const EVENTS = [
  { day: "22", month: "NOV", title: "Regional Chapter Convening", type: "Convening", loc: "Hawassa University", time: "09:00 EAT", full: false },
  { day: "05", month: "DEC", title: "Media Ethics Symposium 2026", type: "Symposium", loc: "Skylight Hotel, Addis Ababa", time: "Full day", full: false },
  { day: "11", month: "DEC", title: "Reporting on Climate", type: "Webinar", loc: "Online", time: "16:00 EAT", full: false },
  { day: "18", month: "DEC", title: "Year-end Members Assembly", type: "Assembly", loc: "EMWA HQ, Addis Ababa", time: "14:00 EAT", full: true },
] as const;

function Updates() {
  const [tab, setTab] = useState<(typeof TABS)[number]>("All");
  const [query, setQuery] = useState("");
  const lead = STORIES[0];
  const filtered = useMemo(() => STORIES.slice(1).filter((story) =>
    (tab === "All" || story.t === tab) && (!query.trim() || `${story.h} ${story.e}`.toLowerCase().includes(query.toLowerCase()))
  ), [tab, query]);

  return (
    <PageShell>
      <section className="updates2-hero">
        <div className="updates2-hero-intro">
          <p className="updates2-eyebrow">News, ideas &amp; opportunities</p>
          <h1>What&apos;s moving<br /><em>EMWA forward.</em></h1>
          <p>Reporting from our programs, public positions, member community, and the wider movement for gender equality in Ethiopian media.</p>
          <div className="updates2-hero-meta"><span><strong>06</strong> latest stories</span><span><strong>04</strong> upcoming events</span><span>Updated 12 Nov 2026</span></div>
        </div>
        <article className="updates2-lead">
          <img src={lead.img} alt="Journalists collaborating in a professional newsroom" fetchPriority="high" />
          <div className="updates2-lead-shade" />
          <div className="updates2-lead-copy"><div><span>Lead story</span><time>{lead.d}</time></div><h2>{lead.h}</h2><p>{lead.e}</p><button>Read story <ArrowUpRight /></button></div>
          <small>Documentary photograph / Unsplash</small>
        </article>
      </section>

      <section className="updates2-stories" id="stories">
        <header className="updates2-section-head"><div><p className="updates2-eyebrow">From the newsroom</p><h2>Latest stories.</h2></div><label><Search /><span className="sr-only">Search stories</span><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search updates" /></label></header>
        <div className="updates2-tabs" role="group" aria-label="Filter stories">{TABS.map((item) => <button key={item} className={tab === item ? "is-active" : ""} aria-pressed={tab === item} onClick={() => setTab(item)}>{item}</button>)}</div>
        {filtered.length ? <div className="updates2-grid">{filtered.map((story, index) => <article className={`updates2-card${index === 0 ? " is-featured" : ""}`} key={story.h}><div className="updates2-card-image"><img src={story.img} alt="" loading="lazy" />{story.t === "Video" && <span><Play fill="currentColor" /></span>}<small>{story.t}</small></div><div className="updates2-card-copy"><div><time>{story.d}</time><span>{story.read}</span></div><h3>{story.h}</h3><p>{story.e}</p><button>Continue reading <ArrowRight /></button></div></article>)}</div> : <div className="updates2-empty"><Search /><h3>No matching updates.</h3><button onClick={() => { setQuery(""); setTab("All"); }}>Clear search</button></div>}
      </section>

      <section className="updates2-events" id="events">
        <header><div><p className="updates2-eyebrow">Gather with us</p><h2>Upcoming events.</h2></div><p>Workshops, conversations, and member gatherings created to move knowledge into action.</p></header>
        <div className="updates2-event-grid">{EVENTS.map((event, index) => <article className={index === 0 ? "is-next" : ""} key={event.title}><div className="updates2-event-date"><strong>{event.day}</strong><span>{event.month}<br />2026</span></div><p>{index === 0 ? "Next event" : event.type}</p><h3>{event.title}</h3><div className="updates2-event-info"><span><MapPin />{event.loc}</span><span><Clock />{event.time}</span></div>{event.full ? <b>At capacity</b> : <button>View details <ArrowUpRight /></button>}</article>)}</div>
        <button className="updates2-calendar"><Calendar /> Open full calendar <ArrowRight /></button>
      </section>

      <section className="updates2-subscribe"><div><p className="updates2-eyebrow">The monthly briefing</p><h2>Important work.<br />No inbox noise.</h2><p>A concise update on EMWA programs, policy, events, and opportunities.</p></div><form onSubmit={(event) => event.preventDefault()}><label><span>Email address</span><input type="email" required placeholder="name@example.com" /></label><button>Join the list <ArrowRight /></button><small>One email each month. Unsubscribe anytime.</small></form></section>
    </PageShell>
  );
}
