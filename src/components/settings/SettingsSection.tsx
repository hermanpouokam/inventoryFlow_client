import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import type { UserSettingSection } from "@/lib/user-config";
import { SettingsField } from "./settingsField";
import { useTranslation } from "react-i18next";

interface SettingsSectionProps {
    section: UserSettingSection;
    values: Record<string, string | number | boolean>;
    modifiedFields: Set<string>;
    onChange: (id: string, value: string | number | boolean) => void;
}

export function SettingsSection({ section, values, modifiedFields, onChange }: SettingsSectionProps) {
    const [open, setOpen] = useState(true);
    const modifiedCount = section.fields.filter((f) => modifiedFields.has(f.id)).length;
    const { t } = useTranslation('common')

    return (
        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow">
            <button
                onClick={() => setOpen(!open)}
                className="flex w-full items-center justify-between px-6 py-4 text-left transition-colors hover:bg-muted/30"
            >
                <div className="flex items-center gap-3">
                    <h3 className="text-base font-semibold text-foreground">{t(section.title)}</h3>
                    {modifiedCount > 0 && (
                        <span className="inline-flex h-5 min-w-[20px] items-center justify-center rounded-full gradient-primary px-1.5 text-[10px] font-bold text-primary-foreground">
                            {modifiedCount}
                        </span>
                    )}
                </div>
                <ChevronDown
                    className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${open ? "rotate-180" : ""}`}
                />
            </button>

            <AnimatePresence initial={false}>
                {open && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2, ease: "easeInOut" }}
                    >
                        {section.description && (
                            <p className="px-6 pb-2 text-sm text-muted-foreground">{t(section.description)}</p>
                        )}
                        <div className="space-y-3 px-6 pb-6">
                            {section.fields.map((field) => (
                                <SettingsField
                                    key={field.id}
                                    field={field}
                                    value={values[field.id] ?? field.value}
                                    onChange={onChange}
                                    isModified={modifiedFields.has(field.id)}
                                />
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
