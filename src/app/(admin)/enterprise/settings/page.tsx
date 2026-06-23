'use client'
import {
    useState,
    useMemo,
    useCallback,
    useEffect
} from "react";
import {
    motion,
    AnimatePresence
} from "framer-motion";
import {
    Save,
    Menu,
    X,
    RotateCcw,
    Check,
    XCircle,
    CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SettingCategory, settingsConfig } from "@/lib/settings-config";
import { SettingsSidebar } from "@/components/settings/SettingsSidebar";
import { SettingsSection } from "@/components/settings/SettingsSection";
import { useThemeMode } from "@/utils/theme-provider";
import { instance } from "@/components/fetch";
import { useEnterpriseSettings } from "./useEnterpriseSettings";
import { toast } from "@/components/ui/app-toast";
import { useTranslation } from "react-i18next";
import { PlanGate } from "@/components/PlanGate";
import { useQueryState } from "nuqs";
import { Backdrop, CircularProgress } from "@mui/material";

// Catégories dont l'affichage est réservé au plan Pro
const PRO_CATEGORIES = new Set(["invoicing"]);

export default function Settings() {
    const { t } = useTranslation("common");
    const [activeCategory, setActiveCategory] = useQueryState("tab", { defaultValue: settingsConfig[0].id });
    const [searchQuery, setSearchQuery] = useState("");
    const [mobileOpen, setMobileOpen] = useState(false);
    const { userMode, changeMode } = useThemeMode();
    const { values: enterpriseValues, setValues: setEnterpriseValues, loading, formatValues, formatFlatValues } = useEnterpriseSettings();
    const [saving, setSaving] = useState(false)

    function buildInitialValues(settingsConfig: SettingCategory[], backendData?: Record<string, any>) {
        const map: Record<string, string | number | boolean> = {};
        settingsConfig.forEach((cat) => {
            cat.sections.forEach((sec) => {
                sec.fields.forEach((f) => {
                    if (backendData && backendData[f.id] !== undefined) {
                        map[f.id] = backendData[f.id];
                    } else {
                        map[f.id] = f.value;
                    }
                });
            });
        });

        return map;
    }

    const initialvalues = buildInitialValues(settingsConfig, enterpriseValues)


    const [values, setValues] = useState<Record<string, string | number | boolean>>({
        ...initialvalues,
    });
    const [savedValues, setSavedValues] = useState<Record<string, string | number | boolean>>({
        ...initialvalues,
    });

    const modifiedFields = useMemo(() => {
        const set = new Set<string>();
        Object.keys(values).forEach((key) => {
            if (values[key] !== savedValues[key]) set.add(key);
        });
        return set;
    }, [values, savedValues]);

    const modifiedByCategory = useMemo(() => {
        const map: Record<string, number> = {};
        settingsConfig.forEach((cat) => {
            let count = 0;
            cat.sections.forEach((sec) =>
                sec.fields.forEach((f) => {
                    if (modifiedFields.has(f.id)) count++;
                })
            );
            if (count > 0) map[cat.id] = count;
        });
        return map;
    }, [modifiedFields]);

    const handleChange = useCallback((id: string, value: string | number | boolean) => {
        setValues((prev) => ({ ...prev, [id]: value }));
    }, []);

    const handleSave = async () => {
        const { enterprisePayload, settingsPayload } = formatValues(values)
        const finalPayload = {
            ...enterprisePayload,
            settings: settingsPayload,
        };

        try {
            setSaving(true)
            const response = await instance.patch('/settings/', finalPayload, {
                withCredentials: true
            })

            if (response.status !== 200) throw new Error();
            const flatValues = formatFlatValues(response.data)
            if (values.theme) {
                changeMode(values.theme as any);
            }

            const newSaved = { ...buildInitialValues(settingsConfig, flatValues), theme: userMode };
            setSavedValues(newSaved);
            setValues(newSaved); // ← ajoute cette ligne

            toast({
                variant: "success",
                title: t("settings.save_success_title"),
                description: t("settings.save_success_description"),
                icon: <CheckCircle className="size-4" />,
            });

        } catch (error) {
            toast({
                title: t("error"),
                description: t("settings.save_error_description"),
                variant: "destructive",
                icon: <XCircle className="size-4" />,
            });
        } finally {
            setSaving(false)
        }
    };


    const handleReset = () => {
        setValues({ ...savedValues });
    };

    useEffect(() => {
        if (enterpriseValues) {
            const initialValues = buildInitialValues(settingsConfig, enterpriseValues);
            setValues({ ...initialValues, theme: userMode });
            setSavedValues({ ...initialValues, theme: userMode });
        }
    }, [enterpriseValues, userMode]);

    // Get active category data, filtered by search
    const activeCat = settingsConfig.find((c) => c.id === activeCategory);

    const filteredSections = useMemo(() => {
        if (!activeCat) return [];
        if (!searchQuery.trim()) return activeCat.sections;
        const q = searchQuery.toLowerCase();
        return activeCat.sections
            .map((sec) => ({
                ...sec,
                fields: sec.fields.filter(
                    (f) =>
                        f.label.toLowerCase().includes(q) ||
                        f.description?.toLowerCase().includes(q) ||
                        f.id.toLowerCase().includes(q)
                ),
            }))
            .filter((sec) => sec.fields.length > 0);
    }, [activeCat, searchQuery]);

    if (loading || !values) return <div className="w-full h-full ">{t("loading")}...</div>;

    return (
        <div className="overflow-hidden">
            <Backdrop
                sx={{ color: "#8b5cf6", zIndex: (theme) => theme.zIndex.drawer + 1 }}
                open={saving}
            >
                <CircularProgress color="inherit" />
            </Backdrop>
            <div className="flex h-[calc(100vh-90px)] w-full overflow-hidden bg-background p-0">
                {/* Desktop sidebar */}
                <div className="hidden w-72 shrink-0 md:block">
                    <SettingsSidebar
                        activeCategory={activeCategory}
                        onCategoryChange={setActiveCategory}
                        searchQuery={searchQuery}
                        onSearchChange={setSearchQuery}
                        modifiedByCategory={modifiedByCategory}
                        settingsConfig={settingsConfig}
                    />
                </div>

                {/* Mobile sidebar overlay */}
                <AnimatePresence>
                    {mobileOpen && (
                        <>
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="fixed inset-0 z-40 bg-foreground/20 backdrop-blur-sm md:hidden"
                                onClick={() => setMobileOpen(false)}
                            />
                            <motion.div
                                initial={{ x: -300 }}
                                animate={{ x: 0 }}
                                exit={{ x: -300 }}
                                transition={{ type: "spring", damping: 5, stiffness: 300 }}
                                className="fixed left-0 top-0 z-50 h-full w-72 md:hidden"
                            >
                                <SettingsSidebar
                                    activeCategory={activeCategory}
                                    onCategoryChange={(id) => {
                                        setActiveCategory(id);
                                        setMobileOpen(false);
                                    }}
                                    searchQuery={searchQuery}
                                    onSearchChange={setSearchQuery}
                                    modifiedByCategory={modifiedByCategory}
                                    settingsConfig={settingsConfig}
                                />
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>

                {/* Main content */}
                <main className="flex flex-1 flex-col overflow-hidden">
                    {/* Scrollable content */}
                    <div className="flex-1 overflow-y-auto scrollbar">
                        <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={activeCategory}
                                    initial={{ opacity: 0, y: 12 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -12 }}
                                    transition={{ duration: 0.2, ease: "easeInOut" }}
                                    className="space-y-6"
                                >
                                    {filteredSections.length > 0 ? (
                                        <PlanGate
                                            feature={PRO_CATEGORIES.has(activeCategory) ? "advanced_billing" : undefined}
                                            bannerSize="full"
                                        >
                                            {filteredSections.map((section) => (
                                                <SettingsSection
                                                    key={section.id}
                                                    section={section}
                                                    values={values}
                                                    modifiedFields={modifiedFields}
                                                    onChange={handleChange}
                                                />
                                            ))}
                                        </PlanGate>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center py-20 text-center">
                                            <p className="text-sm text-muted-foreground">{t("settings.no_settings_found")}</p>
                                            {searchQuery && (
                                                <button
                                                    onClick={() => setSearchQuery("")}
                                                    className="mt-2 text-xs text-primary hover:underline"
                                                >
                                                    {t("settings.clear_search")}
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </motion.div>
                            </AnimatePresence>
                        </div>
                    </div>
                    <AnimatePresence>
                        {modifiedFields.size > 0 && (
                            <motion.div
                                initial={{ y: 80, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                exit={{ y: 80, opacity: 0 }}
                                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                                className="fixed bottom-0 left-0 right-0 z-30 border-t border-border bg-card/80 px-6 py-4 backdrop-blur-xl"
                            >
                                <div className="mx-auto flex max-w-3xl items-center justify-between gap-4">
                                    <p className="text-sm text-muted-foreground">
                                        {t("settings.unsaved_changes_count", { count: modifiedFields.size })}
                                    </p>
                                    <div className="flex gap-3">
                                        <Button variant="outline" size="sm" onClick={handleReset}>
                                            <RotateCcw className="mr-2 h-3.5 w-3.5" />
                                            {t("cancel")}
                                        </Button>
                                        <Button size="sm" onClick={handleSave} className="gradient-primary shadow-glow">
                                            <Save className="mr-2 h-3.5 w-3.5" />
                                            {t("save")}
                                        </Button>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </main>
            </div>
            {/* Sticky save bar */}
        </div>
    );
}
