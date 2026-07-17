import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Menu, X, Moon, Sun, Search, Bell } from "lucide-react";
import logo from "@/assets/emwa-logo-new.png";

const NAV = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/programs", label: "Programs" },
  { to: "/experts", label: "Experts" },
  { to: "/updates", label: "Updates" },
  { to: "/resources", label: "Resources" },
  { to: "/partners", label: "Partners" },
  { to: "/contact", label: "Contact" },
] as const;

function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("emwa-theme");
    const prefers = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const isDark = stored ? stored === "dark" : prefers;
    setDark(isDark);
    document.documentElement.classList.toggle("dark", isDark);
  }, []);

  const toggle = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("emwa-theme", next ? "dark" : "light");
  };

  return (
    <button
      onClick={toggle}
      aria-label="Toggle theme"
      className="size-10 grid place-items-center border border-border hover:border-primary hover:text-primary transition-colors"
    >
      {dark ? <Sun className="size-4" /> : <Moon className="size-4" />}
    </button>
  );
}

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-50 bg-background/95 supports-[backdrop-filter]:bg-background/85 backdrop-blur-xl border-b border-border shadow-[0_1px_0_rgba(0,0,0,0.02)]">
      <div className="site-container min-h-16 py-2 flex justify-between items-center gap-4">
        <Link to="/" className="flex items-center gap-3 group">
          <img
            src={logo}
            alt="EMWA logo"
            className="h-11 w-11 object-contain transition-transform duration-500 group-hover:rotate-[8deg] group-hover:scale-110"
          />
          <span className="font-display text-2xl tracking-tighter hidden sm:inline transition-colors group-hover:text-primary" aria-hidden="true">
            <span className="text-primary">E</span>MWA
          </span>
        </Link>

        <nav aria-label="Primary navigation" className="hidden lg:flex items-center gap-5 xl:gap-7 label-mono">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="relative py-1 transition-colors hover:text-primary after:absolute after:left-0 after:-bottom-0.5 after:h-[2px] after:w-full after:origin-left after:scale-x-0 after:bg-primary after:transition-transform after:duration-300 hover:after:scale-x-100"
              activeProps={{ className: "text-primary after:scale-x-100" }}
              activeOptions={{ exact: item.to === "/" }}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {/* Search Icon */}
          <button
            onClick={() => setSearchOpen(!searchOpen)}
            aria-label={searchOpen ? "Close search" : "Open search"}
            aria-expanded={searchOpen}
            className="size-10 grid place-items-center border border-border hover:border-primary hover:text-primary transition-colors"
          >
            <Search className="size-4" />
          </button>

          {/* Notifications Icon */}
          <button
            aria-label="Notifications"
            className="hidden sm:grid size-10 place-items-center border border-border hover:border-primary hover:text-primary transition-colors relative"
          >
            <Bell className="size-4" />
            <span className="absolute top-1 right-1 size-2 bg-primary rounded-full"></span>
          </button>

          <ThemeToggle />
          <Link
            to="/membership"
            className="hidden md:inline-block bg-foreground text-background px-5 py-2 label-mono transition-all duration-300 hover:bg-primary hover:-translate-y-0.5 hover:shadow-lg"
          >
            Join Association
          </Link>
          <button
            onClick={() => setOpen(!open)}
            className="lg:hidden size-10 grid place-items-center border border-border transition-colors hover:border-primary hover:text-primary"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="mobile-navigation"
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {/* Search Bar */}
      {searchOpen && (
        <form
          role="search"
          onSubmit={(event) => {
            event.preventDefault();
            const form = new FormData(event.currentTarget);
            const q = String(form.get("q") ?? "").trim();
            navigate({ to: "/search", search: { q } });
            setSearchOpen(false);
          }}
          className="site-container py-3 animate-reveal"
        >
          <label htmlFor="site-search" className="sr-only">Search the EMWA website</label>
          <input
            id="site-search"
            name="q"
            type="text"
            placeholder="Search articles, experts, programs..."
            className="w-full bg-transparent border border-border px-4 py-3 label-mono placeholder:text-muted-foreground focus:border-primary transition-colors"
            autoFocus
          />
        </form>
      )}

      {open && (
        <div id="mobile-navigation" className="lg:hidden border-t border-border bg-background animate-reveal">
          <nav aria-label="Mobile navigation" className="site-container flex flex-col py-4 gap-1 max-h-[calc(100dvh-4rem)] overflow-y-auto">
            {NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className="label-mono py-3 border-b border-border/60 hover:pl-3 hover:text-primary transition-all duration-300"
                activeProps={{ className: "text-primary pl-3" }}
              >
                {item.label}
              </Link>
            ))}
            <Link
              to="/membership"
              onClick={() => setOpen(false)}
              className="bg-foreground text-background px-5 py-3 label-mono text-center mt-2"
            >
              Join Association
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
