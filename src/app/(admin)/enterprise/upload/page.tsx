"use client";

import { useState, useCallback, useEffect } from "react";
import { X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { ImportWizard } from "@/components/import/ImportWizard";
import { HistoryTable } from "@/components/import/HistoryTable";
import { Dashboard } from "@/components/import/Dashboard";
import CardBodyContent from "@/components/CardContent";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

export default function Home() {
  const { t } = useTranslation("common");
  const [open, setOpen] = useState(false);
  const [historyRefreshTick, setHistoryRefreshTick] = useState(0);
  const [resumeJobId, setResumeJobId] = useState<string | null>(null);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "auto";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [open]);

  const handleJobCreated = useCallback(() => {
    setHistoryRefreshTick((tick) => tick + 1);
  }, []);

  return (
    <div className="mt-4 space-y-5">
      <CardBodyContent className="flex justify-between items-center">
        <div>
          <h4 className="text-base font-semibold">
            {t("navigation.items.upload")}
          </h4>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {t("import.page.subtitle")}
          </p>
        </div>
        <Button onClick={() => setOpen(true)} variant="secondary">
          {t("import.page.new_import")}
        </Button>
      </CardBodyContent>

      <main className="flex-1 overflow-y-auto">
        {/* <Dashboard /> */}
        <HistoryTable
          refreshTick={historyRefreshTick}
          onSelectJob={(job) => {
            setResumeJobId(job.id);
            setOpen(true);
          }}
        />
      </main>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/40 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />

            <motion.div
              className="fixed inset-0 flex items-center justify-center p-4"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <div
                className="rounded-2xl mt-5 shadow-xl max-h-[clamp(500px,85vh,1080px)] w-full max-w-lg bg-card dark:bg-[#212121] pb-1"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between px-5 py-2">
                  <h1>{t("import.page.new_import")}</h1>
                  <Button size="icon" variant="ghost" className="rounded-full" onClick={() => setOpen(false)}>
                    <X className="size-4" />
                  </Button>
                </div>
                <div className="max-h-[clamp(450px,75vh,950px)] scrollbar overflow-y-auto px-6">
                  <ImportWizard
                    onJobCreated={handleJobCreated}
                    resumeJobId={resumeJobId}
                    onResumeConsumed={() => setResumeJobId(null)}
                  />
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
