import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Upload } from "lucide-react";
import type { SettingField } from "@/lib/settings-config";
import { useTranslation } from "react-i18next";

interface SettingsFieldProps {
    field: SettingField;
    value: string | number | boolean;
    onChange: (id: string, value: string | number | boolean) => void;
    isModified: boolean;
}

export function SettingsField({ field, value, onChange, isModified }: SettingsFieldProps) {
    const [imagePreview, setImagePreview] = useState<string | null>(
        field.type === "image" && typeof value === "string" && value ? value : null
    );

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (ev) => {
                const result = ev.target?.result as string;
                setImagePreview(result);
                onChange(field.id, result);
            };
            reader.readAsDataURL(file);
        }
    };
    const { t } = useTranslation('common')

    return (
        <div className={`group relative flex flex-col gap-2 rounded-xl border p-4 transition-all duration-200 ${isModified
            ? "border-primary/30 bg-primary/[0.02] shadow-sm"
            : "border-border bg-card hover:border-border/80"
            }`}>
            {/* top row: label + badges */}
            <div className="flex items-center gap-2 flex-wrap">
                <label htmlFor={field.id} className="text-sm font-medium text-foreground">
                    {t(field.label)}
                </label>
                {field.required && (
                    <span className="text-xs text-destructive">*</span>
                )}
                {field.important && (
                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                        {t("important")}
                    </Badge>
                )}
                {isModified && (
                    <span className="ml-auto inline-flex h-2 w-2 rounded-full bg-primary animate-pulse" />
                )}
            </div>

            {field.description && (
                <p className="text-xs text-muted-foreground -mt-1">{t(field.description)}</p>
            )}

            {/* field rendering */}
            {field.type === "string" && (
                <Input
                    id={field.id}
                    value={value as string}
                    placeholder={field.placeholder ? t(field.placeholder) : undefined}
                    onChange={(e) => onChange(field.id, e.target.value)}
                    maxLength={120}
                    className="bg-background max-w-xs"
                />
            )}

            {field.type === "number" && (
                <Input
                    id={field.id}
                    type="number"
                    value={value as number}
                    placeholder={field.placeholder ? t(field.placeholder) : undefined}
                    onChange={(e) => onChange(field.id, Number(e.target.value))}
                    className="bg-background max-w-[200px]"
                />
            )}

            {field.type === "boolean" && (
                <div className="flex items-center gap-3 pt-1">
                    <Switch
                        id={field.id}
                        checked={value as boolean}
                        onCheckedChange={(checked) => onChange(field.id, checked)}
                    />
                    <span className="text-xs text-muted-foreground">
                        {value ? t("status.active") : t("status.inactive")}
                    </span>
                </div>
            )}

            {field.type === "select" && (
                <Select
                    value={value as string}
                    onValueChange={(v) => onChange(field.id, v)}
                >
                    <SelectTrigger className="bg-background max-w-xs">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {field.options?.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                                {t(opt.label)}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            )}

            {field.type === "text" && (
                <Textarea
                    id={field.id}
                    value={value as string}
                    placeholder={field.placeholder ? t(field.placeholder) : undefined}
                    onChange={(e) => onChange(field.id, e.target.value)}
                    className="bg-background min-h-[80px] resize-none"
                />
            )}

            {field.type === "image" && (
                <div className="flex items-center gap-4">
                    {imagePreview ? (
                        <img
                            src={imagePreview}
                            alt={t("preview")}
                            className="h-16 w-16 rounded-lg border border-border object-cover"
                        />
                    ) : (
                        <div className="flex h-16 w-16 items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted/30">
                            <Upload className="h-5 w-5 text-muted-foreground" />
                        </div>
                    )}
                    <label
                        htmlFor={field.id}
                        className="cursor-pointer rounded-lg border border-border bg-background px-4 py-2 text-xs font-medium text-foreground transition-colors hover:bg-accent"
                    >
                        {t("settings.choose_file")}
                        <input
                            id={field.id}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleImageChange}
                        />
                    </label>
                </div>
            )}
        </div>
    );
}
