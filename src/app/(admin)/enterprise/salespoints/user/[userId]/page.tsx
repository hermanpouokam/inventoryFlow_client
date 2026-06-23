"use client";
import * as React from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import {
    CircularProgress,
    TextField,
} from "@mui/material";
import { ArrowLeft, ChevronDown, Save } from "lucide-react";

import CardBodyContent from "@/components/CardContent";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Combobox } from "@/components/ComboBox";
import { toast } from "@/components/ui/app-toast";
import {
    getEnterpriseUser,
    updateEnterpriseUser,
    assignUserPermissions,
    assignUserActionPermissions,
    instance,
} from "@/components/fetch";
import { usePermission } from "@/context/PermissionContext";
import { fetchSalesPoints } from "@/redux/salesPointsSlicer";
import { AppDispatch, RootState } from "@/redux/store";
// ⚠️ Le slice "usersSlicer" gère déjà l'UTILISATEUR CONNECTÉ (singulier,
// clé "user" du store) ailleurs dans ce projet. La liste des comptes de
// l'entreprise vit dans "enterpriseUsersSlicer" (clé "enterpriseUsers").
import { userUpdatedLocally } from "@/redux/usersSlicer";
import { decryptParam } from "@/utils/encryptURL";

import { notFound as notFoundPage } from "next/navigation";

export default function UserDetailPage({ params }: { params: React.Usable<{ userId: string }> }) {
    const { userId } = React.use(params);
    const id = decryptParam(userId);
    const { t: tPermissions } = useTranslation('permissions');

    const router = useRouter();
    const dispatch: AppDispatch = useDispatch();
    const { t } = useTranslation("common");
    const { isAdmin, user: currentUser } = usePermission();

    const { data: salesPoints, status: salesPointsStatus } = useSelector(
        (state: RootState) => state.salesPoints
    );

    const [target, setTarget] = React.useState<any>(null);
    const [loading, setLoading] = React.useState(true);
    const [saving, setSaving] = React.useState(false);
    const [notFound, setNotFound] = React.useState(false);

    const [allPermissions, setAllPermissions] = React.useState<any[]>([]);
    const [allActionPermissions, setAllActionPermissions] = React.useState<any[]>([]);
    const [selectedPermissionIds, setSelectedPermissionIds] = React.useState<number[]>([]);
    const [selectedActionPermissionIds, setSelectedActionPermissionIds] = React.useState<number[]>([]);

    // L'admin gère tout le profil. Le manager ne peut QUE activer/désactiver
    // un compte de son propre point de vente (le backend l'impose aussi,
    // cf. UserViewSet.perform_update). Personne ne peut éditer le rôle.
    const isManager = currentUser?.user_type === "manager";
    const canEditProfile = isAdmin();
    const canToggleStatus = isAdmin() || isManager;

    const loadUser = React.useCallback(async () => {
        setLoading(true);
        try {
            const res = await getEnterpriseUser(Number(id));
            setTarget(res.data);
            setSelectedPermissionIds((res.data.permissions ?? []).map((p: any) => p.id));
            setSelectedActionPermissionIds(
                (res.data.action_permissions ?? []).map((p: any) => p.id)
            );
        } catch (error: any) {
            if (error?.response?.status === 404) {
                setNotFound(true);
            } else {
                toast({
                    variant: "destructive",
                    title: t("error"),
                    description: t("errors.retry"),
                });
            }
        } finally {
            setLoading(false);
        }
    }, [id, t]);

    React.useEffect(() => {
        loadUser();
        if (salesPointsStatus === "idle" && isAdmin()) {
            dispatch(fetchSalesPoints());
        }
        if (canEditProfile) {
            // Catalogue complet des permissions/actions, pour la sélection.
            // Réservé à l'admin : /permissions/ est IsAdminOrManager côté
            // backend, et seul l'admin peut de toute façon les modifier ici.
            instance.get("/permissions/").then((res) => setAllPermissions(res.data)).catch(() => { });
            instance
                .get("/action-permission/")
                .then((res) => setAllActionPermissions(res.data))
                .catch(() => { });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [loadUser]);

    const handleFieldChange = (field: string, value: any) => {
        setTarget((prev: any) => ({ ...prev, [field]: value }));
    };

    const handleSave = async () => {
        if (!target) return;
        setSaving(true);
        try {
            // Le rôle n'est JAMAIS envoyé : personne ne peut le modifier
            // (le backend le rejette de toute façon, champ read-only).
            // Un manager ne peut envoyer que is_active (le backend rejette
            // toute autre modification venant d'un manager).
            const payload: any = canEditProfile
                ? {
                    name: target.name,
                    surname: target.surname,
                    country: target.country,
                    number: target.number,
                    sales_point: target.sales_point,
                    is_active: target.is_active,
                }
                : { is_active: target.is_active };

            const res = await updateEnterpriseUser(Number(id), payload);
            dispatch(userUpdatedLocally(res.data));
            toast({
                variant: "success",
                title: t("success"),
                description: t("users.update_success"),
            });
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: t("error"),
                description:
                    error?.response?.data?.detail ||
                    Object.values(error?.response?.data ?? {})[0] ||
                    t("errors.retry"),
            });
        } finally {
            setSaving(false);
        }
    };

    const handleSavePermissions = async () => {
        setSaving(true);
        try {
            await assignUserPermissions(Number(id), selectedPermissionIds);
            await assignUserActionPermissions(Number(id), selectedActionPermissionIds);
            toast({
                variant: "success",
                title: t("success"),
                description: t("users.permissions_updated"),
            });
            loadUser();
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: t("error"),
                description: error?.response?.data?.detail || t("errors.retry"),
            });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="w-full h-[60vh] flex justify-center items-center">
                <CircularProgress color="inherit" size={35} />
            </div>
        );
    }

    if (notFound || !target) return notFoundPage()

    const isSelf = target.id === currentUser?.id;

    return (
        <div className="space-y-5 mt-4">

            <CardBodyContent className="p-5 space-y-4">
                <h2 className="text-base font-medium">
                    {currentUser?.name} {currentUser?.surname}
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <TextField
                        label={t("name")}
                        value={target.name ?? ""}
                        fullWidth
                        size="small"
                    />
                    <TextField
                        label={t("username")}
                        value={target.username ?? ""}
                        fullWidth
                        size="small"
                    />
                    <TextField
                        label={t("email")}
                        value={target.email ?? ""}
                        fullWidth
                        size="small"
                    />
                    <TextField
                        label={t("country")}
                        value={target.country ?? ""}
                        fullWidth
                        size="small"
                    />
                    <TextField
                        label={t("number")}
                        value={target.number ?? ""}
                        fullWidth
                        size="small"
                    />
                    <TextField
                        label={t("users.role")}
                        value={t(`users.types.${target.user_type}`)}
                        fullWidth
                        size="small"
                    />
                    <TextField
                        value={target.sales_point_details?.name ?? "—"}
                        label={t("sales_points.singular")}
                        fullWidth
                        size="small"
                    />
                </div>

                <div className="flex items-center gap-2 mt-2">
                    <Checkbox
                        id="is_active"
                        checked={!!target.is_active}
                        disabled={!canToggleStatus || isSelf}
                        onCheckedChange={(checked) => handleFieldChange("is_active", !!checked)}
                    />
                    <label htmlFor="is_active" className="text-sm font-medium">
                        {t("status.active")}
                    </label>
                </div>
                {isSelf && (
                    <p className="text-xs text-muted-foreground">
                        {t("users.cannot_deactivate_self")}
                    </p>
                )}

                {(canEditProfile || (canToggleStatus && !isSelf)) && (
                    <div className="flex justify-end">
                        <Button onClick={handleSave} disabled={saving} className="" variant={'primary'}>
                            {/* <Save className="w-4 h-4 mr-1" /> */}
                            {saving ? t("please wait") : t("save")}
                        </Button>
                    </div>
                )}
            </CardBodyContent>

            {canEditProfile && (
                <CardBodyContent className="p-5 space-y-4">
                    <h3 className="font-medium">
                        {t("users.permissions")}
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5  gap-2">
                        {allPermissions.map((perm) => (
                            <label key={perm.id} className="flex items-center gap-2 text-sm">
                                <Checkbox
                                    checked={selectedPermissionIds.includes(perm.id)}
                                    onCheckedChange={(checked) => {
                                        setSelectedPermissionIds((prev) =>
                                            checked ? [...prev, perm.id] : prev.filter((p) => p !== perm.id)
                                        );
                                    }}
                                />
                                {tPermissions(perm.name)}
                            </label>
                        ))}
                    </div>

                    {allActionPermissions.length > 0 && (
                        <>
                            <h4 className="font-medium text-sm mt-3">
                                {t("users.action_permissions")}
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5  gap-2">
                                {allActionPermissions.map((perm) => (
                                    <label key={perm.id} className="flex items-center gap-2 text-sm">
                                        <Checkbox
                                            checked={selectedActionPermissionIds.includes(perm.id)}
                                            onCheckedChange={(checked) => {
                                                setSelectedActionPermissionIds((prev) =>
                                                    checked ? [...prev, perm.id] : prev.filter((p) => p !== perm.id)
                                                );
                                            }}
                                        />
                                        {tPermissions(perm.name)}
                                    </label>
                                ))}
                            </div>
                        </>
                    )}

                    <div className="flex justify-end">
                        <Button onClick={handleSavePermissions} disabled={saving} variant="primary">
                            {saving ? t("please wait") : t("save")}
                        </Button>
                    </div>
                </CardBodyContent>
            )}
        </div>
    );
}