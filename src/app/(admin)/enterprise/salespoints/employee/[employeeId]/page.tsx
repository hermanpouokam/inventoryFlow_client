"use client";
import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { CircularProgress, TextField } from "@mui/material";
import { ArrowLeft, ChevronDown, Save, Trash2 } from "lucide-react";

import CardBodyContent from "@/components/CardContent";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Combobox } from "@/components/ComboBox";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { toast } from "@/components/ui/app-toast";
import { instance } from "@/components/fetch";
import { usePermission } from "@/context/PermissionContext";
import { fetchSalesPoints } from "@/redux/salesPointsSlicer";
import { fetchEmployees } from "@/redux/employeesSlicer";
import { AppDispatch, RootState } from "@/redux/store";
import { formatteCurrency } from "@/app/(admin)/stock/functions";
import { decryptParam } from "@/utils/encryptURL";

export default function EmployeeDetailPage({ params }: { params: React.Usable<{ employeeId: string }> }) {
    const { employeeId } = React.use(params);
    const id = decryptParam(employeeId)
    const router = useRouter();
    const dispatch: AppDispatch = useDispatch();
    const { t } = useTranslation("common");
    const { isAdmin, user: currentUser } = usePermission();

    const { data: salesPoints, status: salesPointsStatus } = useSelector(
        (state: RootState) => state.salesPoints
    );

    const [target, setTarget] = React.useState<any>(null);
    const [employee, setEmployee] = React.useState<any>(null);
    const [debts, setDebts] = React.useState<any[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [saving, setSaving] = React.useState(false);
    const [notFound, setNotFound] = React.useState(false);
    const [payAmount, setPayAmount] = React.useState<Record<number, string>>({});

    const editable = isAdmin() || currentUser?.user_type === "manager";

    const loadEmployee = React.useCallback(async () => {
        setLoading(true);
        try {
            const res = await instance.get(`/employees/${id}/`);
            setTarget(res.data);
            setEmployee(res.data);
        } catch (error: any) {
            if (error?.response?.status === 404) {
                setNotFound(true);
            } else {
                toast({ variant: "destructive", title: t("error"), description: t("errors.retry") });
            }
        } finally {
            setLoading(false);
        }
    }, [id, t]);

    const loadDebts = React.useCallback(async () => {
        try {
            const res = await instance.get(`/employeedebts/`);
            setDebts(Array.isArray(res.data) ? res.data.filter((d: any) => d.employee === Number(id)) : []);
        } catch (error) {
            // Pas bloquant pour l'affichage de la fiche employé.
        }
    }, [id]);

    React.useEffect(() => {
        loadEmployee();
        loadDebts();
        if (salesPointsStatus === "idle") {
            dispatch(fetchSalesPoints());
        }
    }, [loadEmployee, loadDebts]);

    const handleFieldChange = (field: string, value: any) => {
        setTarget((prev: any) => ({ ...prev, [field]: value }));
    };

    const handleSave = async () => {
        if (!target) return;
        setSaving(true);
        try {
            const res = await instance.patch(`/employees/${id}/`, {
                name: target.name,
                surname: target.surname,
                role: target.role,
                monthly_salary: target.monthly_salary,
                sales_point: target.sales_point,
                is_deliverer: target.is_deliverer,
                is_active: target.is_active,
            });
            setTarget(res.data);
            toast({
                variant: "success",
                title: t("success"),
                description: t("dashboard.employees.update_success", { defaultValue: "Employé mis à jour." }),
            });
            dispatch(fetchEmployees({ sales_point: [] }));
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

    const handlePayDebt = async (debtId: number) => {
        const amount = Number(payAmount[debtId]);
        if (!amount || amount <= 0) return;
        setSaving(true);
        try {
            await instance.post(`/employeedebts/${debtId}/pay/`, { amount });
            toast({ variant: "success", title: t("success"), description: t("success") });
            setPayAmount((prev) => ({ ...prev, [debtId]: "" }));
            loadDebts();
            loadEmployee();
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

    const handleDelete = async () => {
        if (
            !confirm(
                t("dashboard.employees.confirm_delete", {
                    defaultValue: "Supprimer définitivement cette fiche employé ?",
                })
            )
        ) {
            return;
        }
        setSaving(true);
        try {
            await instance.delete(`/employees/${id}/`);
            toast({
                variant: "success",
                title: t("success"),
                description: t("dashboard.employees.delete_success", {
                    defaultValue: "Employé supprimé.",
                }),
            });
            dispatch(fetchEmployees({ sales_point: [] }));
            router.push("/enterprise/salespoints");
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: t("error"),
                description: error?.response?.data?.detail || t("errors.retry"),
            });
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

    if (notFound || !target) {
        return (
            <div className="w-full h-[60vh] flex flex-col gap-2 justify-center items-center">
                <h3 className="font-bold text-xl">
                    {t("dashboard.employees.not_found", { defaultValue: "Employé introuvable." })}
                </h3>
                <Button variant="outline" onClick={() => router.push("/enterprise/salespoints")}>
                    <ArrowLeft className="w-4 h-4 mr-1" />
                    {t("back", { defaultValue: "Retour" })}
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-5">
            <div className="flex items-center justify-between">
                <Button variant="ghost" onClick={() => router.push("/enterprise/salespoints")}>
                    <ArrowLeft className="w-4 h-4 mr-1" />
                    {t("back", { defaultValue: "Retour" })}
                </Button>
                {editable && (
                    <Button variant="destructive" disabled={saving} onClick={handleDelete}>
                        <Trash2 className="w-4 h-4 mr-1" />
                        {t("delete")}
                    </Button>
                )}
            </div>

            <CardBodyContent className="p-5 space-y-4">
                <h2 className="text-base font-medium">
                    {employee.name} {employee.surname}
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <TextField
                        label={t("name")}
                        value={target.name ?? ""}
                        onChange={(e) => handleFieldChange("name", e.target.value)}
                        disabled={!editable}
                        fullWidth
                        size="small"
                    />
                    <TextField
                        label={t("surname")}
                        value={target.surname ?? ""}
                        onChange={(e) => handleFieldChange("surname", e.target.value)}
                        disabled={!editable}
                        fullWidth
                        size="small"
                    />
                    <TextField
                        label={t("users.role")}
                        value={target.role ?? ""}
                        onChange={(e) => handleFieldChange("role", e.target.value)}
                        disabled={!editable}
                        fullWidth
                        size="small"
                    />
                    <TextField
                        label={t("users.salary")}
                        type="number"
                        value={target.monthly_salary ?? ""}
                        onChange={(e) => handleFieldChange("monthly_salary", e.target.value)}
                        disabled={!editable}
                        fullWidth
                        size="small"
                    />

                    <div>
                        <p className="text-sm font-medium mb-1">{t("sales_points.singular")}</p>
                        <Combobox
                            RightIcon={ChevronDown}
                            options={salesPoints}
                            buttonLabel={t("sales_points.singular")}
                            onValueChange={(option: any) => handleFieldChange("sales_point", option?.id ?? null)}
                            value={salesPoints.find((s: any) => s.id == target.sales_point) || null}
                            getOptionValue={(option: any) => option.id}
                            getOptionLabel={(option: any) => `${option.name} - ${option?.address}`}
                            placeholder={t("sales_points.singular")}
                            className="z-[9999] popover-content-width-full"
                        />
                    </div>
                </div>

                <div className="flex items-center gap-6 mt-2">
                    <div className="flex items-center gap-2">
                        <Checkbox
                            id="is_active_emp"
                            checked={!!target.is_active}
                            disabled={!editable}
                            onCheckedChange={(checked) => handleFieldChange("is_active", !!checked)}
                        />
                        <label htmlFor="is_active_emp" className="text-sm font-medium">
                            {t("status.active")}
                        </label>
                    </div>
                    <div className="flex items-center gap-2">
                        <Checkbox
                            id="is_deliverer"
                            checked={!!target.is_deliverer}
                            disabled={!editable}
                            onCheckedChange={(checked) => handleFieldChange("is_deliverer", !!checked)}
                        />
                        <label htmlFor="is_deliverer" className="text-sm font-medium">
                            {t("deliverer.label")}
                        </label>
                    </div>
                </div>

                {editable && (
                    <div className="flex justify-end">
                        <Button onClick={handleSave} disabled={saving} className="bg-green-600 hover:bg-green-700">
                            <Save className="w-4 h-4 mr-1" />
                            {saving ? t("please wait") : t("save", { defaultValue: "Enregistrer" })}
                        </Button>
                    </div>
                )}
            </CardBodyContent>

            <CardBodyContent className="p-5 space-y-4">
                <h3 className="font-medium">
                    {t("dashboard.employees.debts_title", { defaultValue: "Dettes" })}
                </h3>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>{t("dashboard.employees.debt_date", { defaultValue: "Date" })}</TableHead>
                            <TableHead>{t("dashboard.employees.amount", { defaultValue: "Montant restant" })}</TableHead>
                            <TableHead>{t("bills.columns.status")}</TableHead>
                            {editable && <TableHead>{t("table.action")}</TableHead>}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {debts.length > 0 ? (
                            debts.map((debt) => (
                                <TableRow key={debt.id}>
                                    <TableCell>
                                        {debt.created_at ? new Date(debt.created_at).toLocaleDateString("fr-FR") : `#${debt.id}`}
                                    </TableCell>
                                    <TableCell>{formatteCurrency(debt.amount)}</TableCell>
                                    <TableCell className="capitalize">{debt.status}</TableCell>
                                    {editable && debt.status !== "paid" && (
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <TextField
                                                    size="small"
                                                    type="number"
                                                    placeholder={t("dashboard.employees.amount", { defaultValue: "Montant" })}
                                                    value={payAmount[debt.id] ?? ""}
                                                    onChange={(e) =>
                                                        setPayAmount((prev) => ({ ...prev, [debt.id]: e.target.value }))
                                                    }
                                                    className="w-28"
                                                />
                                                <Button size="sm" disabled={saving} onClick={() => handlePayDebt(debt.id)}>
                                                    {t("dashboard.employees.pay", { defaultValue: "Payer" })}
                                                </Button>
                                            </div>
                                        </TableCell>
                                    )}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center font-medium">
                                    {t("dashboard.employees.no_debts", { defaultValue: "Aucune dette." })}
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardBodyContent>
        </div>
    );
}