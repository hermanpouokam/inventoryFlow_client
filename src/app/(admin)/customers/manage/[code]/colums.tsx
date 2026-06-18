import {
  formatteCurrency } from "@/app/(admin)/stock/functions";
import { Button } from "@/components/ui/button";
import { DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { usePermission } from "@/context/PermissionContext";
import { cn } from "@/lib/utils";
import { ColumnDef,
  Row } from "@tanstack/react-table";
import { Check,
  EllipsisVertical,
  X,
  XCircle,
  CheckCircle,
} from "lucide-react";
import moment from "moment";
import { useTranslation } from "react-i18next";
import { payDebt } from "./functions";
import { useState } from "react";
import { toast } from "@/components/ui/app-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const useBalanceHistoryColumns = () => {
    usePermission();
    const { t: tCommon } = useTranslation('common')

    return [
        {
            accessorKey: "number",
            header: () => <div className="w-[20px] text-center">#</div>,
            cell: ({ row }) => (
                <div className="lowercase text-center">{row.getValue("number")}</div>
            ),
        },
        {
            accessorKey: tCommon("operation type"),
            header: () => (
                <div>
                    <h6 className="text-center w-[200px]">{tCommon("operation type")}</h6>
                </div>
            ),
            cell: ({ row }) => {
                const history = row.original;
                return <div className="text-center">{tCommon(`operation_${history.operation_type}`)}</div>;
            },
        },
        {
            accessorKey: tCommon("operator"),
            header: () => (
                <div>
                    <h6 className="text-center w-[200px]">{tCommon("operator")}</h6>
                </div>
            ),
            cell: ({ row }) => {
                const history = row.original;
                return <div className="text-center">{history.created_by}</div>;
            },
        },
        {
            accessorKey: tCommon("amount"),
            header: () => (
                <div>
                    <h6 className="text-center w-[240px]">{tCommon("amount")}</h6>
                </div>
            ),
            cell: ({ row }) => {
                const history = row.original;
                const formatted = formatteCurrency(history.change_amount, "XAF", "fr-FR");
                return <div className="text-center">{formatted}</div>;
            },
        },
        {
            accessorKey: tCommon("previous balance"),
            header: () => {
                return (
                    <div className="text-center w-[240px]">
                        <span>{tCommon("previous balance")}</span>
                    </div>
                );
            },
            cell: ({ row }) => {
                return (
                    <div className="capitalize text-center  w-[240px]">
                        {formatteCurrency(row.original.previous_balance)}
                    </div>
                );
            },
        },
        {
            accessorKey: tCommon("new balance"),
            header: () => {
                return (
                    <div className="text-center w-[240px]">
                        <span>{tCommon("new balance")}</span>
                    </div>
                );
            },
            cell: ({ row }) => {
                return (
                    <div className="capitalize text-center  w-[240px]">
                        {formatteCurrency(row.original.new_balance)}
                    </div>
                );
            },
        },
        {
            accessorKey: tCommon("comment"),
            header: () => <div className="text-center w-[285px]">{tCommon("comment")}</div>,
            cell: ({ row }) => {
                return (
                    <div className="text-center font-medium">
                        {row.original.reason || "-"}
                    </div>
                );
            },
        },
        {
            accessorKey: "created_at",
            header: () => <div className="text-center w-[200px]">{tCommon("date")}</div>,
            cell: ({ row }) => {
                return (
                    <div className="text-center font-medium">
                        {moment(row.original.created_at).format("DD/MM/YYYY hh:mm:ss")}
                    </div>
                );
            },
        },
    ] as ColumnDef<BalanceHistory>[];
}

export const useDebtColumns = (getData: () => void) => {
    const { t: tCommon } = useTranslation("common");
    const { hasPermission } = usePermission();

    const [loading, setLoading] = useState(false);

    // 🔥 modal globale
    const [isOpen, setIsOpen] = useState(false);
    const [selectedDebt, setSelectedDebt] = useState<any>(null);

    const openModal = (debt: any) => {
        setSelectedDebt(debt);
        setIsOpen(true);
    };

    const closeModal = () => {
        setIsOpen(false);
        setSelectedDebt(null);
    };

    const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setLoading(true);

        try {
            const formData = new FormData(event.currentTarget);
            const formJson = Object.fromEntries(formData.entries());

            const { paid_amount } = formJson;

            const response = await payDebt(
                Number(paid_amount),
                selectedDebt.id
            );

            toast({
                variant: "success",
                title: tCommon("success"),
                description: tCommon("payment done"),
                icon: <CheckCircle className="size-4" />,
            });
            getData()
            closeModal();
        } catch (error: any) {
            toast({
                title: tCommon("error"),
                description:
                    error?.response?.data?.detail ||
                    tCommon("errors.retry"),
                variant: "destructive",
                icon: <XCircle className="size-4" />,
            });
        } finally {
            setLoading(false);
        }
    };

    const columns: ColumnDef<any>[] = [
        {
            accessorKey: tCommon("number"),
            header: () => <div className="w-[20px] text-center">#</div>,
            cell: ({ row }) => (<div className="lowercase">{row.original.number}</div>),
        },

        ...(hasPermission('view_customer') ? [
            {
                id: "actions",
                enableHiding: false,
                header: () => <div className="text-center">{tCommon('actions.title')}</div>,
                cell: ({ row }: { row: Row<Debts> }) => {
                    const el = row.original;
                    return (
                        <>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                        <span className="sr-only">{tCommon("open_menu")}</span>
                                        <EllipsisVertical className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="start">
                                    {/* <DropdownMenuLabel>{tCommon("actions")}</DropdownMenuLabel> */}
                                    {Number(el.remaining_amount) > 0 ?
                                        <> <Button
                                            variant="ghost"
                                            className="w-full"
                                            onClick={() => openModal(el)}
                                        >{tCommon("pay")}</Button>
                                            <DropdownMenuSeparator />
                                        </>
                                        :
                                        null
                                    }
                                    <Dialog>
                                        <DialogTrigger asChild>
                                            <Button variant="ghost" className="w-full">{tCommon("see details")}</Button>
                                        </DialogTrigger>
                                        <DialogContent>
                                            <DialogHeader>
                                                <DialogTitle>{tCommon('debt payments list', { bill_number: el.bill_number })}</DialogTitle>
                                            </DialogHeader>
                                            <div className="no-scrollbar scrollbar max-h-[60vh] overflow-y-auto">
                                                <Table>
                                                    <TableHeader>
                                                        <TableRow>
                                                            <TableHead className="w-[100px]">#</TableHead>
                                                            <TableHead>{tCommon("amount")}</TableHead>
                                                            <TableHead>{tCommon("user")}</TableHead>
                                                            <TableHead className="text-center w-[240px]">{tCommon("date")}</TableHead>
                                                        </TableRow>
                                                    </TableHeader>
                                                    <TableBody>
                                                        {el.payments.map((debt, index) => (
                                                            <TableRow key={debt.id}>
                                                                <TableCell className="font-medium">{index + 1}</TableCell>
                                                                <TableCell >{formatteCurrency(debt.amount)}</TableCell>
                                                                <TableCell>{debt.created_by}</TableCell>
                                                                <TableCell className="text-center w-[240px]">{moment(debt.created_at).format("DD/MM/YYYY hh:mm")}</TableCell>
                                                            </TableRow>
                                                        ))}
                                                    </TableBody>
                                                </Table>
                                            </div>
                                        </DialogContent>
                                    </Dialog>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </>
                    );
                },
            }] : []),
        {
            accessorKey: "bill_number",
            header: () => {
                return (<div className={cn("text-center ", "w-[240px]")}>
                    <span>{tCommon("bill number")}</span> </div>);
            },
            cell: ({ row }) => {
                return (<div className={cn("capitalize text-center ", "w-[240px]")}>
                    {row.original?.bill_number} </div>);
            },
        },
        {
            accessorKey: tCommon("amount to pay"),
            header: () => (<div> <h6 className="text-center text-base w-[220px]">{tCommon("amount to pay")}</h6> </div>), cell: ({ row }) => { const debt = row.original; return <div className="text-center font-medium">{formatteCurrency(debt.total_amount)}</div>; },
        },
        {
            accessorKey: tCommon("paid"),
            header: () => { return (<div className="text-center w-[240px]"> <span>{tCommon("paid")}</span> </div>); },
            cell: ({ row }) => {
                const debt = row.original
                return (<div className="capitalize text-center w-[240px]">
                    {formatteCurrency(debt.amount_paid ?? 0)} </div>);
            },
        },
        {
            accessorKey: tCommon("amount left"),
            enableHiding: false,
            header: () => <div className="text-center w-[240px]">{tCommon("amount left")}</div>,
            cell: ({ row }) => {
                return (
                    <div className="text-center font-medium">
                        {formatteCurrency(row.original.remaining_amount)}
                    </div>
                );
            },
        },
        {
            accessorKey: tCommon("created_at"),
            header: () => <div className="text-center w-[240px]">{tCommon('created_at')}</div>,
            cell: ({ row }) => {
                return (<div className="text-center font-medium">
                    {moment(row.original.created_at).format("DD/MM/YYYY hh:mm:ss")}
                </div>);
            },
        },
    ];

    return {
        columns,
        isOpen,
        openModal,
        closeModal,
        selectedDebt,
        onSubmit,
        loading,
    };
};