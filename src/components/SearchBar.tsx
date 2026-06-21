import { useState, useRef, useEffect } from "react";
import { Search, X } from "lucide-react";

interface SearchBarProps {
  value: string;
  onChange: (v: string) => void;
  onClear: () => void;
}

export function SearchBar({ value, onChange, onClear }: SearchBarProps) {
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "/" && !["INPUT", "TEXTAREA"].includes((e.target as HTMLElement).tagName)) {
        e.preventDefault();
        inputRef.current?.focus();
      }
      if (e.key === "Escape") {
        onClear();
        inputRef.current?.blur();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClear]);

  return (
    <div className={`relative flex items-center transition-all duration-300 ${focused || value ? "w-72" : "w-48"}`}>
      <Search className="absolute left-3 w-4 h-4 text-white/40 pointer-events-none" />
      <input
        ref={inputRef}
        data-testid="search-input"
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder="Search movies, shows…"
        className="w-full pl-9 pr-8 py-2 rounded-xl text-sm bg-white/6 border border-white/10 text-white placeholder-white/30 outline-none focus:border-primary/40 focus:bg-white/8 transition-all"
      />
      {value && (
        <button
          data-testid="search-clear"
          onClick={onClear}
          className="absolute right-3 text-white/40 hover:text-white"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}
