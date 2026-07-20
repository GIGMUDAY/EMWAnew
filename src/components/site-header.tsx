import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Heart, Menu, X, Moon, Sun } from "lucide-react";
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

  return (
    <header className="sticky top-0 z-50 bg-background/95 supports-[backdrop-filter]:bg-background/85 backdrop-blur-xl border-b border-border shadow-[0_1px_0_rgba(0,0,0,0.02)]">
      <div className="site-container min-h-16 py-2 flex justify-between items-center gap-4">
        <Link to="/" className="flex items-center gap-3 group">
          <img
            src={logo}
            alt="EMWA logo"
            className="h-11 w-11 object-contain transition-transform duration-500 group-hover:rotate-[8deg] group-hover:scale-110"
          />
          <span
            className="font-display text-2xl tracking-tighter hidden sm:inline transition-colors group-hover:text-primary"
            aria-hidden="true"
          >
            <span className="text-primary">E</span>MWA
          </span>
        </Link>

        <nav
          aria-label="Primary navigation"
          className="hidden lg:flex items-center gap-5 xl:gap-7 label-mono"
        >
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
          <ThemeToggle />
          <Link
            to="/contact"
            hash="donate"
            className="group hidden min-h-10 items-center gap-2 border border-[#dca332] bg-[#e5a933] px-4 label-mono !text-[8px] text-[#171513] shadow-[0_6px_18px_rgba(229,169,51,.18)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#f0b83f] hover:shadow-[0_10px_24px_rgba(229,169,51,.28)] sm:inline-flex"
          >
            <Heart className="size-3.5 transition-transform duration-300 group-hover:scale-110 group-hover:fill-current" />
            Donate
          </Link>
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

      {open && (
        <div
          id="mobile-navigation"
          className="lg:hidden border-t border-border bg-background animate-reveal"
        >
          <nav
            aria-label="Mobile navigation"
            className="site-container flex flex-col py-4 gap-1 max-h-[calc(100dvh-4rem)] overflow-y-auto"
          >
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
              to="/contact"
              hash="donate"
              onClick={() => setOpen(false)}
              className="mt-2 flex items-center justify-center gap-2 bg-[#e5a933] px-5 py-3 label-mono text-[#171513]"
            >
              <Heart className="size-3.5" /> Donate
            </Link>
            <Link
              to="/membership"
              onClick={() => setOpen(false)}
              className="bg-foreground text-background px-5 py-3 label-mono text-center"
            >
              Join Association
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
