// 'use client'
// import {
  // useState,
  // useMemo,
  // useCallback,
  // useEffect } from "react";
// import { motion,
  // AnimatePresence } from "framer-motion";
// import { Save,
  // RotateCcw,
  // ArrowLeft,
  // Check,
  // X,
  // XCircle,
  //,
// import { Button } from "@/components/ui/button";
// import { userSettingsConfig } from "@/lib/user-config";
// import { SettingsSection } from "@/components/settings/SettingsSection";
// import { toast } from "@/components/ui/app-toast";
// import Link from "next/link";
// import { useUserSettings } from "./useUserSettings";
// import { useThemeMode } from "@/utils/theme-provider";
// import { switchLang } from "@/components/languageSwitcher";
// import { useTranslation } from "react-i18next";

// export default function UserSettings() {
//     const [activeTab, setActiveTab] = useState(userSettingsConfig[0].id);
//     const { values: userValues, loading, updateValue, saveSettings, saving } = useUserSettings()
//     const { userMode, changeMode } = useThemeMode();
//     const { t: tCommon, i18n } = useTranslation("common")

//     const [values, setValues] = useState<Record<string, string | number | boolean>>({ ...userValues, });
//     const [savedValues, setSavedValues] = useState<Record<string, string | number | boolean>>({ ...userValues, });

//     useEffect(() => {
//         setValues(userValues)
//         setSavedValues(userValues)
//         console.log("user", userValues)
//     }, [userValues])


//     const modifiedFields = useMemo(() => {
//         const set = new Set<string>();
//         Object.keys(values).forEach((key) => {
//             if (values[key] !== savedValues[key]) set.add(key);
//         });
//         return set;
//     }, [values, savedValues]);

//     const handleChange = useCallback((id: string, value: string | number | boolean) => {
//         setValues((prev) => ({ ...prev, [id]: value }));
//     }, []);

//     const handleSave = async () => {
//         const currentCat = userSettingsConfig.find((c) => c.id === activeTab);
//         const requiredEmpty = currentCat?.sections
//             .flatMap((s) => s.fields)
//             .filter((f) => f.required && (values[f.id] === "" || values[f.id] === undefined));


//         if (requiredEmpty && requiredEmpty.length > 0) {
//             toast({
//                 title: tCommon("settings.required_fields_missing"),
//                 description: tCommon("settings.fill_required_fields", { fields: requiredEmpty.map((f) => tCommon(f.label)).join(", ") }),
//                 variant: "destructive",
//                 icon: <XCircle className="size-4" />,
//             });
//             return;
//         }

//         changeMode(values.user_theme as typeof userMode)
//         setSavedValues({ ...values });

//         await saveSettings(values)

//         if (modifiedFields.has('user_language')) {
//             switchLang(values.user_language as string)
//         }
//         toast({
//             title: tCommon("settings.profile_updated"),
//             description: tCommon(modifiedFields.size > 1 ? "settings.saved_changes_count_plural" : "settings.saved_changes_count", { count: modifiedFields.size }),
//             icon: <Check className="mr-4" />,
//         });
//     };

//     const handleReset = () => {
//         setValues({ ...savedValues });
//     };

//     const activeCat = userSettingsConfig.find((c) => c.id === activeTab);

//     if (loading || !values) return <div className="w-full h-screen ">{tCommon("loading")}</div>;

//     return (
//         <div className="min-h-screen">
//             {/* Top header */}
//             <div className="mx-auto max-w-5xl px-4 border border-border bg-card rounded-lg shadow">
//                 {/* Tabs */}
//                 <nav className="-mb-px flex justify-around gap-1 overflow-x-auto scrollbar">
//                     {userSettingsConfig.map((cat) => {
//                         const isActive = activeTab === cat.id;
//                         const modCount = cat.sections
//                             .flatMap((s) => s.fields)
//                             .filter((f) => modifiedFields.has(f.id)).length;

//                         return (
//                             <button
//                                 key={cat.id}
//                                 onClick={() => setActiveTab(cat.id)}
//                                 className={`relative flex items-center gap-2 whitespace-nowrap px-4 py-3 text-sm font-medium transition-colors ${isActive
//                                     ? "text-primary"
//                                     : "text-muted-foreground hover:text-foreground"
//                                     }`}
//                             >
//                                 <cat.icon className="h-4 w-4" />
//                                 <span>{tCommon(cat.label)}</span>
//                                 {modCount > 0 && (
//                                     <span className="inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-primary/10 px-1.5 text-[10px] font-bold text-primary">
//                                         {modCount}
//                                     </span>
//                                 )}
//                                 {isActive && (
//                                     <motion.div
//                                         layoutId="accountTab"
//                                         className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-primary"
//                                         transition={{ type: "spring", stiffness: 400, damping: 30 }}
//                                     />
//                                 )}
//                             </button>
//                         );
//                     })}
//                 </nav>
//             </div>

//             {/* Content */}
//             <div className="mx-auto max-w-5xl py-8">
//                 <AnimatePresence mode="wait">
//                     <motion.div
//                         key={activeTab}
//                         initial={{ opacity: 0, y: 8 }}
//                         animate={{ opacity: 1, y: 0 }}
//                         exit={{ opacity: 0, y: -8 }}
//                         transition={{ duration: 0.15, ease: "easeOut" }}
//                         className="space-y-6"
//                     >
//                         {activeCat?.sections.map((section) => (
//                             <SettingsSection
//                                 key={section.id}
//                                 section={section as any}
//                                 values={values}
//                                 modifiedFields={modifiedFields}
//                                 onChange={handleChange}
//                             />
//                         ))}
//                     </motion.div>
//                 </AnimatePresence>
//             </div>

//             {/* Sticky save bar */}
//             <AnimatePresence>
//                 {modifiedFields.size > 0 && (
//                     <motion.div
//                         initial={{ y: 80, opacity: 0 }}
//                         animate={{ y: 0, opacity: 1 }}
//                         exit={{ y: 80, opacity: 0 }}
//                         transition={{ type: "spring", damping: 25, stiffness: 300 }}
//                         className="fixed bottom-0 left-0 right-0 z-30 border-t border-border bg-card/80 px-6 py-4 backdrop-blur-xl"
//                     >
//                         <div className="mx-auto flex max-w-4xl items-center justify-between gap-4">
//                             <p className="text-sm text-muted-foreground">
//                                 {tCommon(modifiedFields.size > 1 ? "settings.unsaved_changes_count_plural" : "settings.unsaved_changes_count", { count: modifiedFields.size })}</p>
//                             <div className="flex gap-3">
//                                 <Button variant="outline" size="sm" onClick={handleReset}>
//                                     <RotateCcw className="mr-2 h-3.5 w-3.5" />
//                                     Annuler
//                                 </Button>
//                                 <Button size="sm" onClick={handleSave} className="gradient-primary shadow-glow">
//                                     <Save className="mr-2 h-3.5 w-3.5" />
//                                     Sauvegarder
//                                 </Button>
//                             </div>
//                         </div>
//                     </motion.div>
//                 )}
//             </AnimatePresence>
//         </div>
//     );
// }


'use client'
import {
    useState,
    useMemo,
    useCallback,
    useEffect,
    useRef
} from "react";
import {
    motion,
    AnimatePresence
} from "framer-motion";
import {
    Save,
    RotateCcw,
    ArrowLeft,
    Check,
    X,
    XCircle,
    Camera,
    Lock,
    Eye,
    EyeOff,
    CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { userSettingsConfig } from "@/lib/user-config";
import { SettingsSection } from "@/components/settings/SettingsSection";
import { toast } from "@/components/ui/app-toast";
import Link from "next/link";
import { useUserSettings } from "./useUserSettings";
import { useThemeMode } from "@/utils/theme-provider";
import { switchLang } from "@/components/languageSwitcher";
import { useTranslation } from "react-i18next";
import { instance } from "@/components/fetch";

export default function UserSettings() {
    const [activeTab, setActiveTab] = useState(userSettingsConfig[0].id);
    const { values: userValues, loading, updateValue, saveSettings, saving } = useUserSettings()
    const { userMode, changeMode } = useThemeMode();
    const { t: tCommon, i18n } = useTranslation("common")

    const [values, setValues] = useState<Record<string, string | number | boolean>>({ ...userValues, });
    const [savedValues, setSavedValues] = useState<Record<string, string | number | boolean>>({ ...userValues, });

    // ── Photo de profil ────────────────────────────────────────────────────
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [uploadingAvatar, setUploadingAvatar] = useState(false);

    const handleAvatarClick = () => fileInputRef.current?.click();

    const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Preview immédiat
        const reader = new FileReader();
        reader.onload = (ev) => setAvatarPreview(ev.target?.result as string);
        reader.readAsDataURL(file);

        // Upload
        setUploadingAvatar(true);
        const formData = new FormData();
        formData.append("image", file);
        try {
            const res = await instance.post("/upload-profile-image/", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            setValues((prev) => ({ ...prev, user_avatar: res.data.img ?? res.data.url ?? "" }));
            toast({
            variant: "success", title: tCommon("settings.avatar_updated"), icon: <CheckCircle className="size-4" /> });
        } catch {
            toast({
                title: tCommon("error"),
                description: tCommon("settings.password_code_error"),
                variant: "destructive",
                icon: <XCircle className="size-4" />,
            });
            setAvatarPreview(null);
        } finally {
            setUploadingAvatar(false);
        }
    };

    // ── Changement de mot de passe ─────────────────────────────────────────
    const [pwStep, setPwStep] = useState<"idle" | "code_sent" | "confirm">("idle");
    const [pwLoading, setPwLoading] = useState(false);
    const [pwCode, setPwCode] = useState("");
    const [pwOld, setPwOld] = useState("");
    const [pwNew, setPwNew] = useState("");
    const [pwShowNew, setPwShowNew] = useState(false);

    const handleRequestPasswordCode = async () => {
        setPwLoading(true);
        try {
            await instance.post("/request-password-change-code/");
            setPwStep("code_sent");
            toast({
            variant: "success", title: tCommon("settings.password_code_sent"), icon: <CheckCircle className="size-4" /> });
        } catch {
            toast({ title: tCommon("error"), variant: "destructive", icon: <XCircle className="size-4" /> });
        } finally {
            setPwLoading(false);
        }
    };

    const handleConfirmPassword = async () => {
        if (!pwCode || !pwOld || !pwNew) return;
        setPwLoading(true);
        try {
            await instance.post("/confirm-password-change/", {
                code: pwCode,
                old_password: pwOld,
                new_password: pwNew,
            });
            setPwStep("idle");
            setPwCode(""); setPwOld(""); setPwNew("");
            toast({
            variant: "success", title: tCommon("settings.password_changed"), icon: <CheckCircle className="size-4" /> });
        } catch (e: any) {
            const msg = e?.response?.data?.error ?? tCommon("settings.password_confirm_error");
            toast({ title: msg, variant: "destructive", icon: <XCircle className="size-4" /> });
        } finally {
            setPwLoading(false);
        }
    };

    useEffect(() => {
        setValues(userValues)
        setSavedValues(userValues)
        console.log("user", userValues)
    }, [userValues])


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

    const handleSave = async () => {
        const currentCat = userSettingsConfig.find((c) => c.id === activeTab);
        const requiredEmpty = currentCat?.sections
            .flatMap((s) => s.fields)
            .filter((f) => f.required && (values[f.id] === "" || values[f.id] === undefined));


        if (requiredEmpty && requiredEmpty.length > 0) {
            toast({
                title: tCommon("error"),
                description: tCommon("settings.fill_required_fields", { fields: requiredEmpty.map((f) => tCommon(f.label)).join(", ") }),
                variant: "destructive",
                icon: <XCircle className="size-4" />,
            });
            return;
        }

        changeMode(values.user_theme as typeof userMode)
        setSavedValues({ ...values });

        await saveSettings(values)

        if (modifiedFields.has('user_language')) {
            switchLang(values.user_language as string)
        }
        toast({
            variant: "success",
            title: tCommon("settings.profile_updated"),
            description: tCommon(modifiedFields.size > 1 ? "settings.saved_changes_count_plural" : "settings.saved_changes_count", { count: modifiedFields.size }),
            icon: <CheckCircle className="size-4" />,
        });
    };

    const handleReset = () => {
        setValues({ ...savedValues });
    };

    const activeCat = userSettingsConfig.find((c) => c.id === activeTab);

    if (loading || !values) return <div className="w-full h-screen ">loading...</div>;

    return (
        <div className="min-h-screen">
            {/* Top header */}
            <div className="mx-auto max-w-5xl px-4 border border-border bg-card rounded-lg shadow">
                {/* Tabs */}
                <nav className="-mb-px flex justify-around gap-1 overflow-x-auto scrollbar">
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
                                <span>{tCommon(cat.label)}</span>
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

            {/* Content */}
            <div className="mx-auto max-w-5xl py-8">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.15, ease: "easeOut" }}
                        className="space-y-6"
                    >
                        {/* ── Avatar (onglet profile uniquement) ── */}
                        {activeTab === "profile" && (
                            <div className="rounded-xl border border-border bg-card p-6 flex items-center gap-5">
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleAvatarChange}
                                />
                                <div className="relative cursor-pointer group" onClick={handleAvatarClick}>
                                    <div className="w-16 h-16 rounded-full overflow-hidden bg-muted border border-border">
                                        {avatarPreview || values.user_avatar ? (
                                            <img
                                                src={(avatarPreview ?? values.user_avatar) as string}
                                                alt="avatar"
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-muted-foreground">
                                                {(values.user_firstname as string)?.[0]?.toUpperCase() ?? "?"}
                                            </div>
                                        )}
                                    </div>
                                    <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        {uploadingAvatar
                                            ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            : <Camera className="w-5 h-5 text-white" />
                                        }
                                    </div>
                                </div>
                                <div>
                                    <p className="text-sm font-medium">{tCommon("settings.change_avatar")}</p>
                                    <p className="text-xs text-muted-foreground mt-0.5">{tCommon("settings.avatar_hint")}</p>
                                </div>
                            </div>
                        )}

                        {/* ── Changement de mot de passe (onglet security) ── */}
                        {activeTab === "security" && (
                            <div className="rounded-xl border border-border bg-card p-6 space-y-4">
                                <div className="flex items-center gap-2">
                                    <Lock className="w-4 h-4 text-muted-foreground" />
                                    <p className="text-sm font-medium">{tCommon("settings.change_password")}</p>
                                </div>

                                {pwStep === "idle" && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleRequestPasswordCode}
                                        disabled={pwLoading}
                                    >
                                        {pwLoading
                                            ? <span className="flex items-center gap-2"><div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />{tCommon("please wait")}</span>
                                            : tCommon("settings.send_code")
                                        }
                                    </Button>
                                )}

                                {pwStep === "code_sent" && (
                                    <div className="space-y-3 max-w-sm">
                                        <p className="text-xs text-muted-foreground">{tCommon("settings.code_sent_hint")}</p>
                                        <input
                                            type="text"
                                            placeholder={tCommon("settings.otp_code")}
                                            value={pwCode}
                                            onChange={(e) => setPwCode(e.target.value)}
                                            maxLength={6}
                                            className="w-full h-9 px-3 rounded-md border border-input bg-background text-sm outline-none focus:border-primary"
                                        />
                                        <input
                                            type="password"
                                            placeholder={tCommon("settings.old_password")}
                                            value={pwOld}
                                            onChange={(e) => setPwOld(e.target.value)}
                                            className="w-full h-9 px-3 rounded-md border border-input bg-background text-sm outline-none focus:border-primary"
                                        />
                                        <div className="relative">
                                            <input
                                                type={pwShowNew ? "text" : "password"}
                                                placeholder={tCommon("settings.new_password")}
                                                value={pwNew}
                                                onChange={(e) => setPwNew(e.target.value)}
                                                className="w-full h-9 px-3 pr-9 rounded-md border border-input bg-background text-sm outline-none focus:border-primary"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setPwShowNew(!pwShowNew)}
                                                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground"
                                            >
                                                {pwShowNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            </button>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button size="sm" onClick={handleConfirmPassword} disabled={pwLoading || !pwCode || !pwOld || !pwNew}>
                                                {pwLoading ? tCommon("please wait") : tCommon("settings.confirm_password")}
                                            </Button>
                                            <Button size="sm" variant="ghost" onClick={() => setPwStep("idle")}>
                                                {tCommon("cancel")}
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

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
                                {tCommon(modifiedFields.size > 1 ? "settings.unsaved_changes_count_plural" : "settings.unsaved_changes_count", { count: modifiedFields.size })}
                            </p>
                            <div className="flex gap-3">
                                <Button variant="outline" size="sm" onClick={handleReset}>
                                    <RotateCcw className="mr-2 h-3.5 w-3.5" />
                                    {tCommon("cancel")}
                                </Button>
                                <Button size="sm" onClick={handleSave} className="gradient-primary shadow-glow">
                                    <Save className="mr-2 h-3.5 w-3.5" />
                                    {tCommon("save")}
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
