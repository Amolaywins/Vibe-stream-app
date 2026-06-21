import { Link, useLocation } from "wouter";
import { Home, Film, Tv, Bookmark, Sparkles } from "lucide-react";
import logoUrl from "/vibestream-logo.png";

const navItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/movies", label: "Movies", icon: Film },
  { href: "/tv", label: "TV Shows", icon: Tv },
  { href: "/anime", label: "Anime", icon: Sparkles },
  { href: "/watchlist", label: "Watchlist", icon: Bookmark },
];

export function Sidebar() {
  const [location] = useLocation();

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col fixed left-0 top-0 h-full w-56 z-40 border-r border-white/5"
        style={{ background: "rgba(10,10,12,0.92)", backdropFilter: "blur(20px)" }}>
        <div className="px-5 py-4 mb-2">
          <div className="flex items-center gap-2.5">
            <img src={logoUrl} alt="VibeStream" className="w-10 h-10 rounded-xl object-cover" />
            <div className="flex flex-col leading-tight">
              <span className="text-sm font-black tracking-wide text-white">VIBESTREAM</span>
              <span className="text-[9px] text-white/30 tracking-widest uppercase">Cinematic Streaming</span>
            </div>
          </div>
        </div>
        <nav className="flex-1 px-3">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = href === "/" ? location === "/" : location.startsWith(href);
            return (
              <Link key={href} href={href}
                data-testid={`nav-${label.toLowerCase().replace(" ", "-")}`}
                className={`flex items-center gap-3 px-4 py-3 mb-1 rounded-xl text-sm font-medium transition-all duration-200 ${
                  active
                    ? "bg-primary/15 text-primary border border-primary/20"
                    : "text-white/50 hover:text-white hover:bg-white/5"
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            );
          })}
        </nav>
        <div className="px-6 py-4 text-xs text-white/20 border-t border-white/5">
          © 2025 VibeStream
        </div>
      </aside>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-white/5 flex items-center justify-around px-2 py-2"
        style={{ background: "rgba(10,10,12,0.95)", backdropFilter: "blur(20px)" }}>
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = href === "/" ? location === "/" : location.startsWith(href);
          return (
            <Link key={href} href={href}
              data-testid={`mobile-nav-${label.toLowerCase().replace(" ", "-")}`}
              className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all ${
                active ? "text-primary" : "text-white/40"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
