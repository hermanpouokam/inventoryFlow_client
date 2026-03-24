'use client'
import { useState, useMemo, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Save, Menu, X, RotateCcw, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SettingCategory, settingsConfig } from "@/lib/settings-config";
import { SettingsSidebar } from "@/components/settings/SettingsSidebar";
import { SettingsSection } from "@/components/settings/SettingsSection";
import { useThemeMode } from "@/utils/theme-provider";
import { instance } from "@/components/fetch";
import { useEnterpriseSettings } from "./useEnterpriseSettings";
import { useToast } from "@/components/ui/use-toast";

export default function Settings() {
    const { toast } = useToast();
    const [activeCategory, setActiveCategory] = useState(settingsConfig[0].id);
    const [searchQuery, setSearchQuery] = useState("");
    const [mobileOpen, setMobileOpen] = useState(false);
    const { userMode, changeMode } = useThemeMode();
    const { values: enterpriseValues, setValues: setEnterpriseValues, loading, formatValues, formatFlatValues } = useEnterpriseSettings();

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
        theme: userMode
    });
    const [savedValues, setSavedValues] = useState<Record<string, string | number | boolean>>({
        ...initialvalues,
        theme: userMode
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
        console.log(id, ':', value)
    }, []);

    const handleSave = async () => {

        const { enterprisePayload, settingsPayload } = formatValues(values)
        console.log('values', values)
        const finalPayload = {
            ...enterprisePayload,
            settings: settingsPayload,
        };

        console.log('finalPayload', finalPayload)

        try {
            const response = await instance.patch('/settings/', finalPayload, {
                withCredentials: true
            })

            if (response.status !== 200) throw new Error();
            const flatValues = formatFlatValues(response.data)
            if (values.theme) {
                changeMode(values.theme as any);
            }
            setSavedValues({ ...buildInitialValues(settingsConfig, flatValues), theme: userMode });
            toast({
                title: "Paramètres sauvegardés",
                description: "Modifications enregistrées avec succès.",
                icon: <Check className="mr-4" />,
                className: 'bg-green-600'
            });

        } catch (error) {
            toast({
                title: "Erreur",
                description: "Impossible de sauvegarder. Verifiez connexion internet.",
                variant: "destructive",
                className: 'bg-red-600'
            });
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

    if (loading || !values) return <div className="w-full h-full ">loading...</div>;

    return (
        <>
            <div className="flex h-screen w-full overflow-hidden bg-background">
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
                    {/* Top bar */}
                    <header className="flex items-center gap-4 border-b border-border bg-card/50 px-6 py-4">
                        <button
                            onClick={() => setMobileOpen(true)}
                            className="rounded-lg border border-border p-2 text-muted-foreground md:hidden"
                        >
                            <Menu className="h-4 w-4" />
                        </button>
                        <div className="flex-1">
                            <div className="flex items-center gap-3">
                                {activeCat && (
                                    <div className="hidden rounded-xl border border-primary/10 bg-accent p-2 text-accent-foreground sm:inline-flex">
                                        <activeCat.icon className="h-5 w-5" />
                                    </div>
                                )}
                                <div>
                                    <h2 className="text-lg font-bold text-foreground">{activeCat?.label}</h2>
                                    <p className="text-xs text-muted-foreground">
                                        {activeCat?.sections.reduce((acc, s) => acc + s.fields.length, 0)} paramètres
                                    </p>
                                </div>
                            </div>
                        </div>
                        {modifiedFields.size > 0 && (
                            <span className="hidden items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary sm:inline-flex">
                                <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                                {modifiedFields.size} modifié(s)
                            </span>
                        )}
                    </header>

                    {/* Scrollable content */}
                    <div className="flex-1 overflow-y-auto">
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
                                        filteredSections.map((section) => (
                                            <SettingsSection
                                                key={section.id}
                                                section={section}
                                                values={values}
                                                modifiedFields={modifiedFields}
                                                onChange={handleChange}
                                            />
                                        ))
                                    ) : (
                                        <div className="flex flex-col items-center justify-center py-20 text-center">
                                            <p className="text-sm text-muted-foreground">Aucun paramètre trouvé.</p>
                                            {searchQuery && (
                                                <button
                                                    onClick={() => setSearchQuery("")}
                                                    className="mt-2 text-xs text-primary hover:underline"
                                                >
                                                    Effacer la recherche
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
                                        <span className="font-semibold text-foreground">{modifiedFields.size}</span> modification(s) non sauvegardée(s)
                                    </p>
                                    <div className="flex gap-3">
                                        <Button variant="outline" size="sm" onClick={handleReset}>
                                            <RotateCcw className="mr-2 h-3.5 w-3.5" />
                                            Annuler
                                        </Button>
                                        <Button size="sm" onClick={handleSave} className="gradient-primary shadow-glow">
                                            <Save className="mr-2 h-3.5 w-3.5" />
                                            Sauvegarder
                                        </Button>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </main>
            </div>
            {/* Sticky save bar */}
        </>
    );
}
