import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Calendar, Clock, MapPin } from "lucide-react";
import { PageHero, PageShell } from "@/components/page-shell";
import globalImg from "@/assets/emwa-replace.jpg";

export const Route = createFileRoute("/updates")({
  head: () => ({
    meta: [
      { title: "Updates — EMWA" },
      {
        name: "description",
        content:
          "The latest EMWA news, press releases, articles, events, workshops, conferences, and webinars.",
      },
      { property: "og:title", content: "Updates — EMWA" },
      {
        property: "og:description",
        content: "News, media, and upcoming events from EMWA.",
      },
    ],
  }),
  component: Updates,
});

const NEWS_TABS = ["All", "News", "Press", "Articles", "Photos", "Video"] as const;

const STORIES = [
  { d: "12 Nov 2026", t: "News", h: "EMWA submits gender-equity brief to Parliament", e: "A joint policy brief on women's representation in state broadcasting.", img: globalImg },
  { d: "04 Nov 2026", t: "Program", h: "Third cohort of Leadership Incubator graduates", e: "38 women editors from nine regions complete the six-month residency.", img: globalImg },
  { d: "27 Oct 2026", t: "News", h: "Digital safety network expands to Amhara and Sidama", e: "Rapid-response legal support arrives in two new regions.", img: globalImg },
  { d: "15 Oct 2026", t: "Press", h: "EMWA statement on press freedom index", e: "A formal statement on the 2026 rankings and their implications." },
  { d: "02 Oct 2026", t: "Articles", h: "Why regional newsrooms need women editors — now", e: "Long-form essay by our Executive Director." },
  { d: "20 Sep 2026", t: "News", h: "EMWA joins African Media Women Alliance", e: "A continental federation of eleven national associations." },
];

const EVENTS = [
  { d: "2026-11-22", day: "22", month: "NOV", title: "Regional Chapter Convening — Hawassa", type: "Convening", loc: "Hawassa University", time: "09:00 EAT", full: false },
  { d: "2026-12-05", day: "05", month: "DEC", title: "Media Ethics Symposium 2026", type: "Symposium", loc: "Skylight Hotel, Addis Ababa", time: "Full day", full: false },
  { d: "2026-12-11", day: "11", month: "DEC", title: "Webinar: Reporting on Climate for Ethiopian Newsrooms", type: "Webinar", loc: "Online", time: "16:00 EAT", full: false },
  { d: "2026-12-18", day: "18", month: "DEC", title: "Year-end Members Assembly", type: "Assembly", loc: "EMWA HQ, Addis Ababa", time: "14:00 EAT", full: true },
  { d: "2027-01-15", day: "15", month: "JAN", title: "Digital Safety Bootcamp — Mekelle", type: "Workshop", loc: "Mekelle University", time: "Two days", full: false },
];

const FEATURED = EVENTS[1];

function useCountdown(iso: string) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);
  const diff = Math.max(0, new Date(iso).getTime() - now);
  return {
    days: Math.floor(diff / 86_400_000),
    hours: Math.floor((diff / 3_600_000) % 24),
    mins: Math.floor((diff / 60_000) % 60),
    secs: Math.floor((diff / 1000) % 60),
  };
}

function Updates() {
  const [tab, setTab] = useState<(typeof NEWS_TABS)[number]>("All");
  const countdown = useCountdown(FEATURED.d);
  const filteredStories = tab === "All" ? STORIES : STORIES.filter((story) => story.t === tab);

  return (
    <PageShell>
      <PageHero
        eyebrow="News & Events"
        title={<>Latest <span className="text-primary">updates.</span></>}
        lede="Follow EMWA's latest stories, press releases, gatherings, workshops, and opportunities — all in one place."
      />

      <nav aria-label="Updates sections" className="border-b border-border">
        <div className="max-w-[1400px] mx-auto px-6 flex gap-8">
          <a href="#events" className="label-mono py-5 border-b-2 border-transparent hover:border-primary hover:text-primary transition-colors">Events</a>
          <a href="#news" className="label-mono py-5 border-b-2 border-transparent hover:border-primary hover:text-primary transition-colors">News & Media</a>
        </div>
      </nav>

      <section id="events" className="py-16 bg-foreground text-background scroll-mt-24">
        <div className="max-w-[1400px] mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <p className="label-mono text-accent mb-4">Featured · {FEATURED.type}</p>
            <h2 className="font-display text-5xl md:text-7xl leading-none tracking-tighter mb-6">{FEATURED.title}</h2>
            <div className="space-y-2 label-mono text-background/70">
              <p className="flex gap-2"><MapPin className="size-3" aria-hidden="true" /> {FEATURED.loc}</p>
              <p className="flex gap-2"><Clock className="size-3" aria-hidden="true" /> {FEATURED.time}</p>
              <p className="flex gap-2"><Calendar className="size-3" aria-hidden="true" /> {FEATURED.day} {FEATURED.month} 2026</p>
            </div>
            <button className="mt-8 bg-primary text-primary-foreground px-6 py-3 label-mono hover:bg-accent hover:text-foreground transition-colors">Register your seat</button>
          </div>
          <div>
            <p className="label-mono text-accent mb-4">Countdown</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3" aria-label="Time until featured event">
              {[
                { label: "Days", value: countdown.days },
                { label: "Hours", value: countdown.hours },
                { label: "Mins", value: countdown.mins },
                { label: "Secs", value: countdown.secs },
              ].map((unit) => (
                <div key={unit.label} className="text-center border border-background/20 py-6">
                  <div className="font-display text-5xl md:text-6xl tabular-nums">{String(unit.value).padStart(2, "0")}</div>
                  <div className="label-mono text-accent mt-2">{unit.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 border-b border-border">
        <div className="max-w-[1400px] mx-auto px-6">
          <p className="label-mono text-primary mb-4">Full Calendar</p>
          <h2 className="font-display text-5xl md:text-6xl mb-12">Upcoming.</h2>
          <ul>
            {EVENTS.map((event) => (
              <li key={event.title} className="grid md:grid-cols-12 gap-6 py-8 border-t border-border last:border-b items-center hover:bg-muted/40 transition-colors">
                <div className="md:col-span-2 text-center">
                  <div className="font-display text-6xl leading-none">{event.day}</div>
                  <div className="label-mono text-primary mt-2">{event.month}</div>
                </div>
                <div className="md:col-span-6">
                  <p className="label-mono text-primary mb-2">{event.type}</p>
                  <p className="font-display text-3xl leading-tight">{event.title}</p>
                </div>
                <div className="md:col-span-3 label-mono text-muted-foreground space-y-1"><p>{event.loc}</p><p>{event.time}</p></div>
                <div className="md:col-span-1 md:text-right">
                  {event.full ? <span className="label-mono text-muted-foreground">Full</span> : <button className="label-mono border border-foreground px-4 py-2 hover:bg-foreground hover:text-background transition-colors">RSVP</button>}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section id="news" className="py-16 scroll-mt-24">
        <div className="max-w-[1400px] mx-auto px-6">
          <p className="label-mono text-primary mb-4">News & Media</p>
          <h2 className="font-display text-5xl md:text-6xl mb-10">The newsroom.</h2>
          <div className="flex flex-wrap gap-3 mb-12" role="group" aria-label="Filter news by type">
            {NEWS_TABS.map((newsTab) => (
              <button
                key={newsTab}
                type="button"
                onClick={() => setTab(newsTab)}
                aria-pressed={tab === newsTab}
                className={`label-mono px-4 py-2 border transition-all ${tab === newsTab ? "bg-foreground text-background border-foreground" : "border-border hover:border-foreground"}`}
              >
                {newsTab}
              </button>
            ))}
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-px bg-border">
            {filteredStories.map((story) => (
              <article key={story.h} className="bg-background p-8 hover:bg-muted/40 transition-colors">
                {story.img && <div className="aspect-[16/10] overflow-hidden mb-6 -mx-8 -mt-8"><img src={story.img} alt="" width={1200} height={750} loading="lazy" className="w-full h-full object-cover" /></div>}
                <div className="flex justify-between gap-4 label-mono text-muted-foreground mb-4"><time>{story.d}</time><span className="text-primary">{story.t}</span></div>
                <h3 className="font-display text-2xl leading-tight mb-3">{story.h}</h3>
                <p className="text-sm text-muted-foreground">{story.e}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </PageShell>
  );
}
