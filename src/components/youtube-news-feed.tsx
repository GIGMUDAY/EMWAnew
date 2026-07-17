import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { Play, ExternalLink } from "lucide-react";
import { getWomenNewsVideos, type YoutubeVideo } from "@/lib/youtube.functions";

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

export default function YoutubeNewsFeed() {
  const fetchFn = useServerFn(getWomenNewsVideos);
  const { data, isLoading } = useQuery({
    queryKey: ["women-news-videos"],
    queryFn: () => fetchFn(),
    staleTime: 15 * 60 * 1000,
    refetchInterval: 15 * 60 * 1000,
  });

  const videos: YoutubeVideo[] = data ?? [];

  return (
    <section className="py-20 md:py-28 border-y border-border bg-background">
      <div className="max-w-[1400px] mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
          <div>
            <p className="label-mono text-primary mb-4">Voices in Motion</p>
            <h2 className="font-display text-5xl md:text-7xl tracking-tighter leading-none">
              Women in the news, <br /> right now.
            </h2>
          </div>
          <p className="max-w-sm text-sm text-muted-foreground">
            A live feed of the latest videos about women journalists, leaders
            and change-makers — updated automatically from YouTube.
          </p>
        </div>

        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="aspect-video bg-muted animate-pulse rounded-md"
              />
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {videos.map((v, i) => (
              <VideoCard key={v.id} v={v} index={i} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function VideoCard({ v, index }: { v: YoutubeVideo; index: number }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), index * 80);
    return () => clearTimeout(t);
  }, [index]);

  return (
    <a
      href={v.url}
      target="_blank"
      rel="noopener noreferrer"
      className={`group block bg-background border border-border overflow-hidden rounded-md transition-all duration-500 hover:-translate-y-1 hover:shadow-xl hover:border-primary ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      }`}
    >
      <div className="relative aspect-video overflow-hidden bg-muted">
        <img
          src={v.thumbnail}
          alt={v.title}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="size-14 rounded-full bg-primary/90 text-primary-foreground flex items-center justify-center transform scale-90 group-hover:scale-100 transition-transform">
            <Play className="size-6 ml-0.5" fill="currentColor" />
          </div>
        </div>
      </div>
      <div className="p-5">
        <div className="flex items-center justify-between label-mono text-muted-foreground mb-3">
          <span className="text-primary truncate max-w-[60%]">{v.channel}</span>
          <span>{formatDate(v.publishedAt)}</span>
        </div>
        <h3 className="font-display text-xl leading-tight mb-2 group-hover:text-primary transition-colors line-clamp-2">
          {v.title}
        </h3>
        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
          {v.description}
        </p>
        <span className="label-mono inline-flex items-center gap-1 text-foreground group-hover:text-primary transition-colors">
          Watch on YouTube <ExternalLink className="size-3" />
        </span>
      </div>
    </a>
  );
}