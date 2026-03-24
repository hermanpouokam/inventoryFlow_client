'use client'
import { useState, useMemo, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Save, RotateCcw, ArrowLeft, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { userSettingsConfig } from "@/lib/user-config";
import { SettingsSection } from "@/components/settings/SettingsSection";
import { useToast } from "@/components/ui/use-toast";
import Link from "next/link";
import { useUserSettings } from "./useUserSettings";

function buildInitialValues() {
    const map: Record<string, string | number | boolean> = {};
    userSettingsConfig.forEach((cat) =>
        cat.sections.forEach((sec) =>
            sec.fields.forEach((f) => {
                map[f.id] = f.value;
            })
        )
    );
    return map;
}

export default function UserSettings() {
    const { toast } = useToast();
    const [activeTab, setActiveTab] = useState(userSettingsConfig[0].id);
    const { values: userValues, loading, } = useUserSettings()

    const [values, setValues] = useState<Record<string, string | number | boolean>>(userValues);
    const [savedValues, setSavedValues] = useState<Record<string, string | number | boolean>>(userValues);

    useEffect(() => {
        setValues(userValues)
        setSavedValues(userValues)
    }, [userValues])

    console.log(userValues)

    const modifiedFields = useMemo(() => {
        const set = new Set<string>();
        Object.keys(values).forEach((key) => {
            if (values[key] !== savedValues[key]) set.add(key);
        });
        return set;
    }, [values, savedValues]);

    const handleChange = useCallback((id: string, value: string | number | boolean) => {
        setValues((prev) => ({ ...prev, [id]: value }));
    }, []);

    const handleSave = () => {
        const currentCat = userSettingsConfig.find((c) => c.id === activeTab);
        const requiredEmpty = currentCat?.sections
            .flatMap((s) => s.fields)
            .filter((f) => f.required && (values[f.id] === "" || values[f.id] === undefined));

        if (requiredEmpty && requiredEmpty.length > 0) {
            toast({
                title: "Champs requis manquants",
                description: `Veuillez remplir : ${requiredEmpty.map((f) => f.label).join(", ")}`,
                variant: "destructive",
                icon: <X className="mr-4" />,
                className: "bg-red-500"
            });
            return;
        }

        setSavedValues({ ...values });
        toast({
            title: "Profil mis à jour",
            description: `${modifiedFields.size} modification(s) sauvegardée(s).`,
            icon: <Check className="mr-4" />,
            className: "bg-green-500"
        });
    };

    const handleReset = () => {
        setValues({ ...savedValues });
    };

    const activeCat = userSettingsConfig.find((c) => c.id === activeTab);

    if (loading || !values) return <div className="w-full h-full ">loading...</div>;

    return (
        <div className="min-h-screen bg-background">
            {/* Top header */}
            <div className="border-b border-border bg-card/50">
                <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">


                    {/* Tabs */}
                    <nav className="-mb-px flex gap-1 overflow-x-auto">
                        {userSettingsConfig.map((cat) => {
                            const isActive = activeTab === cat.id;
                            const modCount = cat.sections
                                .flatMap((s) => s.fields)
                                .filter((f) => modifiedFields.has(f.id)).length;

                            return (
                                <button
                                    key={cat.id}
                                    onClick={() => setActiveTab(cat.id)}
                                    className={`relative flex items-center gap-2 whitespace-nowrap px-4 py-3 text-sm font-medium transition-colors ${isActive
                                        ? "text-primary"
                                        : "text-muted-foreground hover:text-foreground"
                                        }`}
                                >
                                    <cat.icon className="h-4 w-4" />
                                    <span>{cat.label}</span>
                                    {modCount > 0 && (
                                        <span className="inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-primary/10 px-1.5 text-[10px] font-bold text-primary">
                                            {modCount}
                                        </span>
                                    )}
                                    {isActive && (
                                        <motion.div
                                            layoutId="accountTab"
                                            className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-primary"
                                            transition={{ type: "spring", stiffness: 400, damping: 30 }}
                                        />
                                    )}
                                </button>
                            );
                        })}
                    </nav>
                </div>
            </div>

            {/* Content */}
            <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.15, ease: "easeOut" }}
                        className="space-y-6"
                    >
                        {activeCat?.sections.map((section) => (
                            <SettingsSection
                                key={section.id}
                                section={section as any}
                                values={values}
                                modifiedFields={modifiedFields}
                                onChange={handleChange}
                            />
                        ))}
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Sticky save bar */}
            <AnimatePresence>
                {modifiedFields.size > 0 && (
                    <motion.div
                        initial={{ y: 80, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 80, opacity: 0 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="fixed bottom-0 left-0 right-0 z-30 border-t border-border bg-card/80 px-6 py-4 backdrop-blur-xl"
                    >
                        <div className="mx-auto flex max-w-4xl items-center justify-between gap-4">
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
        </div>
    );
}
