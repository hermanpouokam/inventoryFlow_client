import { Badge } from "@/components/ui/badge";

type Section = {
  id: string;
  number: string;
  heading: string;
  paragraphs: string[];
  list?: string[];
};

export function SectionBlock({ section }: { section: Section }) {
  return (
    <section
      id={section.id}
      className="scroll-mt-24 animate-fade-in py-8 border-b border-hairline last:border-b-0"
    >
      {/* Article header */}
      <div className="flex items-start gap-4 mb-5">
        <Badge variant="secondary" className="mt-0.5 shrink-0">
          Art. {section.number}
        </Badge>
        <h2 className="font-display text-xl font-semibold text-ink leading-snug">
          {section.heading}
        </h2>
      </div>

      {/* Paragraphs */}
      <div className="space-y-4">
        {section.paragraphs.map((p, i) => (
          <p key={i} className="font-body text-[0.9375rem] leading-relaxed text-ink/85">
            {p}
          </p>
        ))}

        {/* Optional bullet list */}
        {section.list && section.list.length > 0 && (
          <ul className="mt-3 space-y-2 pl-5">
            {section.list.map((item, i) => (
              <li key={i} className="relative font-body text-[0.9375rem] leading-relaxed text-ink/85 pl-3">
                {/* Dash marker */}
                <span className="absolute -left-1 top-[0.6em] block h-px w-3 bg-seal/60" />
                {item}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
