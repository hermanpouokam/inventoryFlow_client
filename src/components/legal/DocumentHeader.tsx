import { Separator } from "@/components/ui/separator";
import { CalendarDays } from "lucide-react";

interface DocumentHeaderProps {
  title: string;
  subtitle: string;
  lastUpdatedLabel: string;
  lastUpdated: string;
  intro: string[];
}

export function DocumentHeader({
  title,
  subtitle,
  lastUpdatedLabel,
  lastUpdated,
  intro,
}: DocumentHeaderProps) {
  return (
    <header className="pb-8 mt-14">
      {/* Eyebrow: document type */}
      <p className="mb-3 text-[0.6875rem] font-semibold uppercase tracking-widest text-primary">
        {subtitle}
      </p>

      {/* Main title */}
      <h1 className="font-display text-3xl font-bold text-ink leading-tight tracking-tight sm:text-4xl">
        {title}
      </h1>

      {/* Date badge */}
      <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-hairline bg-surface px-3 py-1.5 text-xs text-muted-foreground">
        <CalendarDays className="h-3.5 w-3.5 text-seal" />
        <span>
          {lastUpdatedLabel} :{" "}
          <span className="font-medium text-ink">{lastUpdated}</span>
        </span>
      </div>

      <Separator className="mt-8" />

      {/* Intro paragraphs */}
      <div className="mt-8 space-y-4">
        {intro.map((p, i) => (
          <p
            key={i}
            className="font-body text-[0.9375rem] leading-relaxed text-ink/85"
          >
            {p}
          </p>
        ))}
      </div>
    </header>
  );
}
