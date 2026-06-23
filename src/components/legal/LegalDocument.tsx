"use client";
import { useTranslation } from "react-i18next";
import { DocumentHeader } from "./DocumentHeader";
import { SectionBlock } from "./SectionBlock";
import { TableOfContents } from "./TableOfContents";
import { Button } from "@/components/ui/button";
import { ArrowUp } from "lucide-react";

type DocKey = "terms" | "privacy";

export function LegalDocument({ docKey }: { docKey: DocKey }) {
  const { t, i18n } = useTranslation("legal");

  // Forcer le re-render à chaque changement de langue
  const lang = i18n.language;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const doc = t(`${docKey}`, { returnObjects: true }) as any;
  const common = t("common", { returnObjects: true }) as Record<string, string>;

  const sections = doc.sections as Array<{
    id: string;
    number: string;
    heading: string;
    paragraphs: string[];
    list?: string[];
  }>;

  return (
    <div key={lang} className="flex gap-0 lg:gap-10">
      {/* ── Sidebar ToC (desktop) ─────────────────────────────── */}
      <aside className="hidden lg:block w-60 shrink-0">
        <div className="sticky top-20">
          <TableOfContents
            items={sections.map(({ id, number, heading }) => ({
              id,
              number,
              heading,
            }))}
            label={common.onThisPage}
          />

          <div className="mt-8">
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start gap-2 text-muted-foreground"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            >
              <ArrowUp className="h-4 w-4" />
              {common.backToTop}
            </Button>
          </div>
        </div>
      </aside>

      {/* ── Main document ─────────────────────────────────────── */}
      <main className="min-w-0 flex-1">
        <DocumentHeader
          title={doc.title}
          subtitle={doc.subtitle}
          lastUpdatedLabel={common.lastUpdatedLabel}
          lastUpdated={doc.lastUpdated}
          intro={doc.intro}
        />

        <div>
          {sections.map((section) => (
            <SectionBlock key={section.id} section={section} />
          ))}
        </div>

        {/* Mobile back to top */}
        <div className="mt-10 flex justify-center lg:hidden">
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="gap-2"
          >
            <ArrowUp className="h-4 w-4" />
            {common.backToTop}
          </Button>
        </div>
      </main>
    </div>
  );
}
