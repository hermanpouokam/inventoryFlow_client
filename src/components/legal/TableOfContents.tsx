"use client";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

type TocItem = { id: string; number: string; heading: string };

interface TableOfContentsProps {
  items: TocItem[];
  label: string;
}

export function TableOfContents({ items, label }: TableOfContentsProps) {
  const [active, setActive] = useState<string>("");

  useEffect(() => {
    const observers: IntersectionObserver[] = [];

    items.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setActive(id);
        },
        { rootMargin: "-20% 0px -70% 0px" }
      );
      obs.observe(el);
      observers.push(obs);
    });

    return () => observers.forEach((o) => o.disconnect());
  }, [items]);

  return (
    <nav aria-label={label}>
      <p className="mb-4 text-[0.6875rem] font-semibold uppercase tracking-widest text-muted-foreground">
        {label}
      </p>
      <ol className="space-y-1">
        {items.map(({ id, number, heading }) => (
          <li key={id}>
            <a
              href={`#${id}`}
              className={cn(
                "flex items-start gap-2.5 rounded px-2 py-1.5 text-sm transition-colors",
                active === id
                  ? "bg-accent/8 text-primary font-medium"
                  : "text-muted-foreground hover:bg-rail hover:text-ink"
              )}
            >
              <span
                className={cn(
                  "shrink-0 font-mono text-[0.7rem] mt-0.5",
                  active === id ? "text-primary" : "text-muted-foreground/60"
                )}
              >
                {number}.
              </span>
              <span className="leading-snug">{heading}</span>
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
