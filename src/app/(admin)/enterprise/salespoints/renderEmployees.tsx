'use client'
import * as React from "react";
import {
  Avatar,
  Chip,
  CircularProgress,
  Divider,
  ListItem,
  ListItdemAvatar,
  ListItemButton,
  ListItemText } from "@mui/material";
import { useDispatch } from "react-redux";
import { AppDispatch,
  RootState } from "@/redux/store";
import { useSelector } from "react-redux";
import { fetchEmployees } from "@/redux/employeesSlicer";
import { SearchX,
  ChevronDown,
  DollarSign,
  Check,
  XCircle,
  CheckCircle,
} from "lucide-react";
import WorkIcon from '@mui/icons-material/Work';
import { formatteCurrency } from "../../stock/functions";
import { useTranslation } from "react-i18next";
import { instance } from "@/components/fetch";
import { cn } from "@/lib/utils";
import { toast } from "@/components/ui/app-toast";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

// ── Dettes d'un employé ────────────────────────────────────────────────────────
function EmployeeDebts({ employeeId }: { employeeId: number }) {
    const { t } = useTranslation("common");
    const [debts, setDebts] = React.useState<any[] | null>(null);
    const [loading, setLoading] = React.useState(false);
    const [paying, setPaying] = React.useState<number | null>(null);

    const fetchDebts = React.useCallback(async () => {
        setLoading(true);
        try {
            const res = await instance.get(`/employeedebts/?employee=${employeeId}`);
            setDebts(res.data?.results ?? res.data ?? []);
        } catch {
            setDebts([]);
        } finally {
            setLoading(false);
        }
    }, [employeeId]);

    const handlePay = async (debtId: number) => {
        setPaying(debtId);
        try {
            await instance.post(`/employeedebts/${debtId}/pay/`);
            toast({
                title: t("success"),
                description: t("employee.debt_paid"),
                variant: "success",
                icon: <CheckCircle className="size-4" />,
            });
            fetchDebts();
        } catch (e: any) {
            toast({
                title: t("error"),
                description: e?.response?.data?.error ?? t("errors.check_connection"),
                variant: "destructive",
                icon: <XCircle className="size-4" />,
            });
        } finally {
            setPaying(null);
        }
    };

    return (
        <Collapsible onOpenChange={(open) => { if (open && debts === null) fetchDebts(); }}>
            <CollapsibleTrigger asChild>
                <button className="flex w-full items-center gap-2 px-4 py-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
                    <DollarSign className="w-3.5 h-3.5" />
                    {t("employee.view_debts")}
                    <ChevronDown className="w-3.5 h-3.5 ml-auto" />
                </button>
            </CollapsibleTrigger>
            <CollapsibleContent className="px-4 pb-3 space-y-2">
                {loading && <Skeleton className="h-10 w-full rounded" />}

                {!loading && debts?.length === 0 && (
                    <p className="text-xs text-muted-foreground">{t("employee.no_debts")}</p>
                )}

                {!loading && debts && debts.map((debt: any) => (
                    <div
                        key={debt.id}
                        className={cn(
                            "flex items-center justify-between rounded-md border px-3 py-2 text-xs",
                            debt.status === "paid"
                                ? "border-green-200 bg-green-50 dark:bg-green-950/20"
                                : "border-red-200 bg-red-50 dark:bg-red-950/20"
                        )}
                    >
                        <div>
                            <p className="font-medium text-foreground">{formatteCurrency(debt.amount)}</p>
                            <p className="text-muted-foreground">{debt.reason ?? t("employee.debt_advance")}</p>
                        </div>
                        {debt.status !== "paid" && (
                            <Button
                                size="sm"
                                variant="outline"
                                className="h-7 text-xs border-green-500 text-green-700 hover:bg-green-600 hover:text-white"
                                disabled={paying === debt.id}
                                onClick={() => handlePay(debt.id)}
                            >
                                {paying === debt.id ? <CircularProgress size={12} color="inherit" /> : t("employee.mark_paid")}
                            </Button>
                        )}
                        {debt.status === "paid" && (
                            <span className="text-green-600 font-medium">{t("employee.debt_status_paid")}</span>
                        )}
                    </div>
                ))}
            </CollapsibleContent>
        </Collapsible>
    );
}

// ── Ligne employé ──────────────────────────────────────────────────────────────
function RenderRow({ employee }: { employee: Employee }) {
    return (
        <>
            <ListItem
                secondaryAction={
                    <>
                        <Chip
                            label={formatteCurrency(parseFloat(employee.monthly_salary), 'XAF', 'fr-FR')}
                            color={parseFloat(employee.monthly_salary) < parseFloat(employee.salary) * 1 / 3 ?
                                'error'
                                :
                                parseFloat(employee.monthly_salary) < parseFloat(employee.salary) * 2 / 3 ?
                                    'info'
                                    :
                                    'success'
                            }
                        />
                    </>
                }
                component="div" disablePadding>
                <ListItemButton>
                    <ListItemAvatar>
                        <Avatar>
                            <WorkIcon />
                        </Avatar>
                    </ListItemAvatar>
                    <ListItemText primary={employee.name} secondary={employee.role} />
                </ListItemButton>
            </ListItem>
            {/* Dettes de l'employé */}
            <EmployeeDebts employeeId={employee.id} />
            <Divider variant="inset" />
        </>
    );
}

function RenderEmpoyees({ salespoint }: { salespoint: number }) {

    const dispatch: AppDispatch = useDispatch()
    const { t } = useTranslation("common")
    const { data, error, status } = useSelector((state: RootState) => state.employees)

    React.useEffect(() => {
        if (status === 'idle') {
            dispatch(fetchEmployees({ ...(salespoint != 0 ? { sales_point: salespoint } : {}) }))
        }
    }, [status, dispatch, salespoint]);

    return (
        <div className="scrollbar h-full overflow-y-auto">
            {
                error ?
                    <div className="w-[95%] h-[95%] flex flex-col justify-center items-center">
                        <SearchX className="text-muted-foreground w-7 h-7" />
                        <h2 className="text-base font-semibold text-muted-foreground">{t("unexpected_error")}</h2>
                    </div>
                    :
                    status == 'loading' ?
                        <div className="w-[95%] h-[95%] flex justify-center items-center">
                            <CircularProgress size={20} />
                        </div>
                        :
                        data.length > 0 ?
                            data.map(item => <RenderRow key={item.id} employee={item} />)
                            :
                            <h2 className="text-base font-semibold text-muted-foreground">{t("dashboard.employees.empty")}</h2>
            }
        </div>
    )
}

export default RenderEmpoyees