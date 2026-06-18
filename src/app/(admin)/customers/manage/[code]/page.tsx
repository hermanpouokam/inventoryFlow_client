'use client'
import CardBodyContent from '@/components/CardContent';
import {
    Button
} from '@/components/ui/button';
import { usePermission } from '@/context/PermissionContext';
import { fetchClientById } from '@/redux/clients';
import { fetchClientsData } from '@/redux/customerBillSlicer';
import {
    AppDispatch,
    RootState
} from '@/redux/store';
import { decryptParam } from '@/utils/encryptURL';
import * as React from 'react';
import { useSelector } from 'react-redux';
import { useDispatch } from 'react-redux';
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Check,
    DollarSign,
    Edit2,
    Plus,
    Wallet,
    X,
    CheckCircle,
    XCircle,
    FileBarChart,
    Star,
    Package2,
} from "lucide-react";
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { formatteCurrency } from '@/app/(admin)/stock/functions';
import { useTranslation } from 'react-i18next';
import { useQueryState } from 'nuqs'
import { ColumnDef, Row } from '@tanstack/react-table';
import { ActionComponent } from '@/app/(admin)/sell/history/ActionComponent';
import { DataTableDemo } from '@/components/TableComponent';
import moment from 'moment';
import { useBalanceHistoryColumns, useDebtColumns } from './colums';
import {
    Backdrop,
    CircularProgress,
    DialogActions,
    DialogContentText,
    TextField,
    Dialog as MuiDialog,
    DialogContent as MuiDialogContent,
    DialogTitle as MuiDialogTitle,
    Button as MuiButton,
} from "@mui/material";
import { formatDate } from '@/utils/utils';
import useForm, { initializeFormValues } from '@/utils/useFormHook';
import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { toast } from "@/components/ui/app-toast";
import { instance } from '@/components/fetch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { PlanGate } from '@/components/PlanGate';
import ClientReportDrawer from '@/components/ClientReportDrawer';
import ClientPackagingHistory from './clientPackagingHistory';
import { notFound } from 'next/navigation';

export default function Page({ params }: { params: React.Usable<{ code: string; }> }) {

    const dispatch: AppDispatch = useDispatch()
    const { data: client, error: clientError, status: clientStatus } = useSelector((state: RootState) => state.clients)
    const { data, error, status } = useSelector((state: RootState) => state.clientData)
    const { hasPermission, user, isAdmin } = usePermission()
    const { t: tCommon, i18n } = useTranslation('common')
    const { t: tError, } = useTranslation('error')
    const [page, setPage] = useQueryState('g', { defaultValue: 'bills' })
    const [showClientReport, setShowClientReport] = React.useState(false)
    const [clientRfm, setClientRfm] = React.useState<any | null>(null)
    const [loading, setLoading] = React.useState(false)
    const [table, setTable] = React.useState<any | null>(null);
    const [filterAttributes, setFilterAttributes] = React.useState<string[]>([]);
    const { code } = React.use(params);
    const client_id = decryptParam(code)
    const [searchText, setSearchText] = React.useState('')
    const balanceHistory = useBalanceHistoryColumns()
    const [load, setLoad] = React.useState(false);
    const closeButtonRef = React.useRef<HTMLButtonElement | null>(null)
    const closeButtonTransRef = React.useRef<HTMLButtonElement | null>(null)

    // Fetch RFM quand le client est chargé
    React.useEffect(() => {
        if (client[0]?.id) {
            instance.get(`/ai/client-rfm/${client[0].id}/`)
                .then(res => setClientRfm(res.data))
                .catch(() => setClientRfm(null))
        }
    }, [client[0]?.id])

    const getData = async () => {
        dispatch(fetchClientById(client_id))
        dispatch(fetchClientsData({ customer_code: client[0].code }))
        setPage('unpaid')
    };

    const {
        columns: debtColumns,
        isOpen,
        closeModal,
        selectedDebt,
        onSubmit,
        loading: loadingDebts,
    } = useDebtColumns(getData);

    const [tableData, setTableData] = React.useState<any[]>([])
    const [columns, setColumns] = React.useState<ColumnDef<any>[]>(balanceHistory)

    React.useEffect(() => {
        if (clientStatus === 'idle') {
            dispatch(fetchClientById(client_id)).then((res) => {
                if (res.meta.requestStatus === 'fulfilled') {
                    const param = {
                        customer_code: res.payload.code
                    }
                    dispatch(fetchClientsData(param))
                }
            })
        }
        if (clientStatus === 'succeeded') {
            document.title = `${client[0]?.name} ${client[0]?.surname}`
        }

    }, [status, dispatch]);

    const cards = React.useMemo(() => {
        return [
            {
                title: 'balance',
                color: "bg-green-100 text-green-800",
                icon: Wallet,
                iconColor: "bg-green-200 text-green-900",
                subText: () => {
                    const balanceHistory = client[0]?.balance_history.filter(history => Number(history.change_amount) > 0) || [];
                    const date = balanceHistory[balanceHistory.length - 1]?.created_at;
                    return date ? tCommon('last_update', { date: formatDate(date).fromNow() }) : tCommon("no_transactions")
                },
                subTextColor: () => {
                    const balanceHistory = client[0]?.balance_history.filter(history => Number(history.change_amount) > 0) || [];
                    const date = balanceHistory[balanceHistory.length - 1]?.created_at;
                    return date ? "text-green-400" : "text-gray-500"
                },
                status: clientStatus,
                error: clientError,
                data: () => formatteCurrency(client[0]?.balance || 0),
                onClick: () => {
                    dispatch(fetchClientById(client_id))
                    dispatch(fetchClientsData({ customer_code: client[0].code }))
                    setPage('balance')
                }
            },
            {
                title: 'buying_total',
                color: "bg-blue-100 text-blue-800",
                icon: DollarSign,
                iconColor: "bg-blue-200 text-blue-900",
                subText: () => {
                    return tCommon(data.length > 1 ? 'invoices' : 'invoices_sin', { count: data.length })
                },
                subTextColor: () => {
                    if (data.length > 0) return "text-blue-500"
                    else return "text-gray-500"
                },
                status: status,
                error: error,
                data: () => {
                    const total = data.reduce((acc, bill) => acc + bill.total_amount_with_taxes_fees, 0)
                    return formatteCurrency(total)
                },
                onClick: () => {
                    dispatch(fetchClientById(client_id))
                    dispatch(fetchClientsData({ customer_code: client[0].code }))
                    setPage('bills')
                }
            },
            {
                title: 'debts',
                color: "bg-red-100 text-red-800",
                icon: DollarSign,
                iconColor: "bg-red-200 text-red-900",
                subText: () => {
                    const debtBills = data.filter(bill => bill.paid && bill.paid < bill.total_amount_with_taxes_fees)
                    return tCommon(debtBills.length > 1 ? 'invoices' : 'invoices_sin', { count: debtBills.length })
                },
                subTextColor: () => {
                    const debtBills = data.filter(bill => bill.paid && bill.paid < bill.total_amount_with_taxes_fees)
                    if (debtBills.length > 0) return "text-red-500"
                    else return "text-gray-500"
                },
                status: status,
                error: error,
                data: () => {
                    const debtBills = data.filter(bill => bill.paid && bill.paid < bill.total_amount_with_taxes_fees)
                    const totalDebt = debtBills.reduce((acc, bill) => acc + (bill.total_amount_with_taxes_fees - (bill.paid || 0)), 0)
                    return formatteCurrency(totalDebt)
                },
                onClick: () => {
                    dispatch(fetchClientById(client_id))
                    dispatch(fetchClientsData({ customer_code: client[0].code }))
                    setPage('unpaid')
                }
            },
            {
                title: 'packaging.record',
                color: "bg-violet-100 text-violet-800",
                icon: Package2,
                iconColor: "bg-violet-200 text-violet-900",
                subText: () => {
                    const packagingBills = data.filter(bill =>
                        bill.product_bills.some(pb => pb.record_package > 0)
                    );
                    return `${tCommon(packagingBills.length > 1 ? 'invoices' : 'invoices_sin', { count: packagingBills.length })}`;
                },
                subTextColor: () => "text-muted-foreground",
                status: clientStatus,
                error: clientError,
                data: () => {
                    const packagingBills = data.filter(bill =>
                        bill.product_bills.some(pb => pb.record_package > 0)
                    );
                    return `${tCommon(packagingBills.length > 1 ? 'invoices' : 'invoices_sin', { count: packagingBills.length })}`;
                },
                onClick: () => {
                    setPage('packaging')
                }
            },
        ]

    }, [dispatch, clientStatus, data, client, tCommon, clientError, error, setPage, client_id])

    const fields = [
        {
            name: "type",
            label: tCommon('transaction type'),
            required: true,
            type: "select",
            options: [
                {
                    value: "debit",
                },
                {
                    value: 'credit',
                }
            ],
        },
        {
            name: "amount",
            label: tCommon('amount'),
            required: true,
            type: "number",
        },
    ];


    const {
        values,
        errors,
        handleChange,
        handleSubmit,
        setFieldError,
        resetForm,
        setFieldValue,
    } = useForm(initializeFormValues(fields));

    const inputsModifications = React.useMemo(() => {
        const clientData = client[0]
        return [
            {
                label: "name",
                name: "name",
                type: "text",
                value: clientData?.name,
                required: true,
            },
            {
                label: "surname",
                name: "surname",
                type: "text",
                value: clientData?.surname || "",
                required: false,
            },
            {
                label: "email",
                name: "email",
                type: "email",
                value: clientData?.email || "",
                required: false,
            },
            {
                label: "number",
                name: "contact",
                type: "text",
                value: clientData?.number || "",
                required: false,
            },
            {
                label: "address",
                name: "address",
                type: "text",
                value: clientData?.address || "",
                required: false,
            },
            {
                label: "client_category",
                name: "client_category",
                type: "hidden",
                value: clientData?.client_category,
                required: false,
            },
        ]
    }, [client]);


    React.useEffect(() => {
        resetFormM()
    }, [client]);

    const {
        values: valuesM,
        errors: errorsM,
        handleChange: handleChangeM,
        resetForm: resetFormM,
        handleSubmit: handleSubmitM,
    } = useForm(initializeFormValues(inputsModifications));


    const handleModify = async () => {
        setLoad(true);
        try {
            const res = await instance.put(
                `/clients/${client[0]?.id}/`,
                valuesM,
                {
                    withCredentials: true,
                }
            );
            if (res.status === 200) {
                resetFormM();
                closeButtonRef.current?.click();
                dispatch(fetchClientById(client_id))
                toast({
                    title: tCommon('success'),
                    description: tCommon('customer information updated successfully'),
                    variant: "success",
                    icon: <CheckCircle className="size-4" />,
                });
            }
        } catch (error) {
            toast({
                title: tCommon('error'),
                description: tCommon('an error occurred while modifying the customer'),
                variant: "destructive",
                icon: <XCircle className="size-4" />,
            });
        } finally {
            setLoad(false);
        }
    };

    const billsColumns: ColumnDef<Bill>[] = [
        {
            accessorKey: "number",
            header: () => <div className="w-[20px]">#</div>,
            cell: ({ row }) => (
                <div className="lowercase">{row.getValue("number")}</div>
            ),
        },
        {
            id: "actions",
            enableHiding: false,
            header: () => <div className="text-left w-[50px]">{tCommon("bills.columns.actions.title")}</div>,
            cell: ({ row }) => (
                <ActionComponent
                    onGetData={getData}
                    onSetLoading={(e) => setLoading(e)}
                    bill={row.original}
                    loading={loading}
                />
            ),
        },
        {
            accessorKey: "bill_number",
            header: () => (
                <div className="text-center w-[140px]">{tCommon("bill number")}</div>
            ),
            cell: ({ row }) => (
                <div className="capitalize text-center">{row.getValue("bill_number")}</div>
            ),
        },
        {
            accessorKey: "packages_count",
            header: ({ column }) => {
                return (
                    <div
                        className="flex justify-center w-[110px]"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    >
                        <span>{tCommon("bills.columns.packages_count")}</span>
                        {/* <ArrowUpDown className="ml-2 h-4 w-4" /> */}
                    </div>
                );
            },

            cell: ({ row }) => {
                const product_bills: ProductBill[] = row.original.product_bills;
                return (
                    <div className="capitalize text-center  w-[100px]">
                        {product_bills.reduce(
                            (acc, curr) => (acc = acc + curr.quantity),
                            0
                        )}
                    </div>
                );
            },
            footer: () => {
                const totalQty = data.reduce((total, bill) => {
                    return (
                        total +
                        bill.product_bills.reduce((subtotal, product_bill) => {
                            return subtotal + product_bill.quantity;
                        }, 0)
                    );
                }, 0);
                return <div className="text-center">{totalQty}</div>;
            },
        },
        {
            accessorKey: "product_bills",
            header: () => (
                <div>
                    <h6 className="text-right text-base w-[220px]">
                        {tCommon("bills.columns.amount")}
                    </h6>
                </div>
            ),
            cell: ({ row }) => {
                const bill = row.original;
                const formatted = new Intl.NumberFormat("fr-FR", {
                    style: "currency",
                    currency: "XAF",
                }).format(bill.total_amount);

                return <div className="text-right font-medium">{formatted}</div>;
            },
            footer: () => {
                const totalAmount = data.reduce((total, bill) => {
                    return total + bill.total_amount;
                }, 0);
                const formatted = formatteCurrency(totalAmount, "XAF", "fr-FR");

                return <div className="text-right">{formatted}</div>;
            },
        },
        ...(hasPermission('view_daily_report') || hasPermission('view_monthly_report') ? [{
            accessorKey: "product_bills",
            header: () => (
                <div>
                    <h6 className="text-right text-base w-[220px]">{tCommon("bills.columns.benefit")}</h6>
                </div>
            ),
            cell: ({ row }: { row: Row<Bill> }) => {
                const product_bills: ProductBill[] = row.original.product_bills;
                const total = product_bills.reduce(
                    (acc, curr) => (acc = acc + parseFloat(curr.benefit.toString())),
                    0
                );
                const formatted = formatteCurrency(total, "XAF", "fr-FR");

                return <div className="text-right font-medium">{formatted}</div>;
            },
            footer: () => {
                const totalAmount = data.reduce((total, bill) => {
                    return (
                        total +
                        bill.product_bills.reduce((subtotal, product_bill) => {
                            return subtotal + parseFloat(product_bill.benefit.toString());
                        }, 0)
                    );
                }, 0);
                const formatted = formatteCurrency(totalAmount, "XAF", "fr-FR");
                return <div className="text-right">{formatted}</div>;
            },
        }] : []),
        {
            accessorKey: "taxes",
            header: () => (
                <div>
                    <h6 className="text-right text-base w-[220px]">{tCommon("bills.columns.taxes")}</h6>
                </div>
            ),
            cell: ({ row }) => {
                const bill = row.original;
                const totalTaxes = bill.taxes.reduce((total, tax) => {
                    return total + tax.amount;
                }, 0);
                const formatted = formatteCurrency(totalTaxes, "XAF", "fr-FR");

                return <div className="text-right font-medium">{formatted}</div>;
            },
            footer: () => {
                return <div className="text-center">-</div>;
            },
        },
        {
            accessorKey: "total_amount",
            header: () => (
                <div>
                    <h6 className="text-right text-base w-[220px]">{tCommon("bills.columns.total_amount")}</h6>
                </div>
            ),
            cell: ({ row }) => {
                const bill = row.original;

                const formatted = formatteCurrency(
                    bill.total_amount_with_taxes_fees,
                    "XAF",
                    "fr-FR"
                );
                return <div className="text-right font-medium">{formatted}</div>;
            },
            footer: () => {
                return <div className="text-center">-</div>;
            },
        },
        {
            accessorKey: "status",
            header: ({ column }) => {
                return (
                    <div
                        className="flex justify-center w-[110px] "
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    >
                        <span>{tCommon("bills.columns.status")}</span>
                        {/* <ArrowUpDown className="ml-2 h-4 w-4" /> */}
                    </div>
                );
            },
            cell: ({ row }) => {
                const bill: Bill = row.original;

                return (
                    <div
                        className={cn(
                            "capitalize flex justify-center items-center text-center w-[110px]",
                            bill.state == "created" && "text-red-500",
                            bill.state == "pending" && "text-orange-500",
                            bill.state == "success" && "text-green-500",
                            bill?.total_amount_with_taxes_fees < Number(bill?.paid) && "text-orange-500"
                        )}
                    >
                        {tCommon(bill.state)}
                    </div>
                );
            },
        },
        {
            accessorKey: "created_at",
            header: () => <div className="text-center w-[240px]">{tCommon("date")}</div>,
            cell: ({ row }) => {
                return (
                    <div className="text-center font-medium">
                        {moment(row.getValue("created_at")).format("DD/MM/YYYY hh:mm:ss")}
                    </div>
                );
            },
        },
    ];

    React.useEffect(() => {
        switch (page) {
            case 'bills':
                setColumns(billsColumns)
                setTableData(data)
                setFilterAttributes(['bill_number'])
                break;
            case 'balance':
                setColumns(balanceHistory)
                setFilterAttributes(['reason'])
                setTableData(client[0]?.balance_history.filter((history) => Number(history.change_amount) > 0).reverse() || [])
                break;
            case 'unpaid':
                setColumns(debtColumns)
                setFilterAttributes(['bill_number'])
                setTableData(client[0]?.debts)
                break;
            case 'packaging':
                setTableData([])
                setColumns([])
                break;
            default:
                setTableData(data)
                setFilterAttributes(['bill_number'])
                setColumns(billsColumns)
        }
    }, [dispatch, page, status, clientStatus]);

    const handleCreateTransaction = async () => {
        if (values["amount"] <= 0) {
            return setFieldError("amount", tCommon('invalid amount'));
        }
        if (!values["type"]) {
            return setFieldError("type", tCommon('select transaction type'));
        }
        setLoad(true);
        try {
            const res = await instance.post(`/clients/${client[0].id}/update-balance/`, values, {
                withCredentials: true,
            });
            if (res.status === 200) {
                resetForm();
                closeButtonTransRef.current?.click();
                dispatch(fetchClientById(client_id))
                dispatch(fetchClientsData({ customer_code: client[0].code }))
                toast({
                    title: tCommon('success'),
                    description: tCommon(res.data.success ?? 'transaction created successfully'),
                    variant: "success",
                    icon: <CheckCircle className="size-4" />,
                });
            }
        } catch (error) {
            setFieldError(
                "form",
                tCommon(error.response.data.error, { data: formatteCurrency(error.response.data.data) })
            );
        } finally {
            setLoad(false);
        }
    };

    if (!['balance', 'unpaid', 'bills', 'packaging'].includes(page)) {
        return notFound()
    }

    return (
        <div className='space-y-5'>
            <Backdrop
                sx={{ color: "#8b5cf6", zIndex: (theme) => theme.zIndex.drawer + 1 }}
                open={status == "loading" || clientStatus == "loading" || loading}
            >
                <CircularProgress color="inherit" />
            </Backdrop>
            <CardBodyContent className='space-y-3 flex items-center justify-between'>
                <div className="flex flex-row justify-start items-center gap-3">
                    {clientStatus === 'succeeded' ?
                        <>
                            <h2 className="font-medium text-base">{client[0]?.name + " " + client[0]?.surname}</h2>
                            {/* Badge segment RFM */}
                            {clientRfm?.segment && (
                                <PlanGate minPlan="pro" fallback="null">
                                    <RfmBadge segment={clientRfm.segment} />
                                </PlanGate>
                            )}
                        </>
                        :
                        <Skeleton className="h-5 w-[200px]" />
                    }
                </div>
                <div className='space-x-3 flex items-center'>
                    {hasPermission('edit_customer') ?
                        <AlertDialog >
                            <AlertDialogTrigger>
                                <Button variant={'secondary'}> <Edit2 className='mr-2 size-3' /> {tCommon('edit')}</Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>{tCommon('edit customer information')}</AlertDialogTitle>
                                    <AlertDialogDescription>{tCommon('edit_customer_information_description')}</AlertDialogDescription>

                                </AlertDialogHeader>
                                <form onSubmit={(e) => handleSubmitM(e, handleModify)}>
                                    <div className="mb-4 space-y-4">
                                        {inputsModifications.map((input) => {

                                            if (input.type === 'hidden') {
                                                return <input name={input.name} type={input.type} value={valuesM[input.value]} />
                                            }
                                            return (
                                                <TextField
                                                    fullWidth
                                                    margin="dense"
                                                    label={tCommon(input.label)}
                                                    type={input.type}
                                                    required={input.required}
                                                    size="small"
                                                    name={input.name}
                                                    value={valuesM[input.name]}
                                                    onChange={handleChangeM}
                                                    error={
                                                        !!errorsM[input.name] &&
                                                        valuesM[input.name] !== ""
                                                    }
                                                    helperText={
                                                        valuesM[input.name] !== "" && errorsM[input.name]
                                                    }
                                                />
                                            )
                                        })}
                                    </div>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel onClick={resetFormM} ref={closeButtonRef}>
                                            {tCommon("cancel")}
                                        </AlertDialogCancel>
                                        <Button type="submit" variant={'primary'} disabled={load}>
                                            {!load ? tCommon("modify") : tCommon("loading")}
                                        </Button>
                                    </AlertDialogFooter>
                                </form>
                            </AlertDialogContent>
                        </AlertDialog>
                        :
                        null
                    }
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant={'secondary'}> <Plus className='mr-2 size-4' /> {tCommon('new transaction')}</Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="max-w-md">
                            <AlertDialogHeader>
                                <AlertDialogTitle>{tCommon('new transaction')}</AlertDialogTitle>
                                <AlertDialogDescription>{tCommon('new_transaction_description')}</AlertDialogDescription>
                                {errors['form'] && (
                                    <AlertDialogDescription className="text-red-500 border font-normal border-red-500 bg-red-50 dark:bg-red-500/10 w-full text-center mt-4 rounded-md p-3">
                                        <p className="whitespace-pre-line">
                                            {errors['form']}
                                        </p>
                                    </AlertDialogDescription>
                                )}
                            </AlertDialogHeader>
                            <form onSubmit={(e) => handleSubmit(e, handleCreateTransaction)}>
                                <div className="mb-4 space-y-4">
                                    {fields.map((input) => {
                                        if (input.type === "select" && Array.isArray(input.options)) {
                                            return (
                                                <div className="mb-5 space-y-3">
                                                    <p className={cn('text-xs font-medium', errors[input.name] && "text-red-500")}>{input.label}</p>
                                                    <RadioGroup
                                                        value={values[input.name]}
                                                        onValueChange={(value) => setFieldValue(input.name, value)}
                                                        className={cn(
                                                            "w-full space-y-2",
                                                            errors[input.name] && "border border-red-500 p-2 rounded-md"
                                                        )}
                                                    >
                                                        {input.options?.map((option) => {
                                                            const id = `${input.name}_${option.value}`;

                                                            return (
                                                                <div key={option.value} className="flex items-center gap-3">
                                                                    <RadioGroupItem value={`${option.value}`} id={id} />
                                                                    <Label htmlFor={id}>
                                                                        {tCommon(`operation_${option?.value}`)}
                                                                    </Label>
                                                                </div>
                                                            );
                                                        })}
                                                    </RadioGroup>

                                                    {errors[input.name] && (
                                                        <p className="text-red-500 text-xs font-medium ml-1 mt-1">
                                                            {errors[input.name]}
                                                        </p>
                                                    )}
                                                </div>
                                            );
                                        }
                                        if (input.type === "number") {
                                            return (
                                                <TextField
                                                    fullWidth
                                                    margin="dense"
                                                    label={input.label}
                                                    type={input.type}
                                                    required={input.required}
                                                    size="small"
                                                    name={input.name}
                                                    value={values[input.name]}
                                                    onChange={handleChange}
                                                    error={!!errors[input.name] && values[input.name] != ""}
                                                    helperText={
                                                        values[input.name] != "" && errors[input.name]
                                                    }
                                                />
                                            );
                                        }
                                    })}
                                </div>
                                <AlertDialogFooter>
                                    <AlertDialogCancel onClick={resetForm} ref={closeButtonTransRef}>
                                        {tCommon("cancel")}
                                    </AlertDialogCancel>
                                    <Button type="submit" variant={'primary'} disabled={loading}>
                                        {!load ? tCommon("add transaction") : `${tCommon("loading")}...`}
                                    </Button>
                                </AlertDialogFooter>
                            </form>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>

            </CardBodyContent>
            <div className="grid grid-cols-1 sm:grid-cols-2  lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {
                    cards?.map((_, i) => (
                        <Card role='button' className="border border-border hover:shadow-card hover:scale-[1.01] transition-all cursor-pointer" key={i} onClick={_.onClick}>
                            <CardContent className="p-5 ">
                                <div
                                    key={i}
                                    className={
                                        "select-none rounded-lg bg-card"
                                    }
                                >
                                    <div className="flex flex-row justify-between items-center">
                                        <p className="text-sm font-semibold">{tCommon(_.title)}</p>
                                        <div className='flex items-center space-x-2'>

                                            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center ", _.iconColor)}>
                                                <_.icon className="w-5 h-5" />
                                            </div>
                                        </div>
                                    </div>
                                    {_.status.includes("loading") ? (
                                        <Skeleton className="h-9 mt-2" />
                                    ) : _.status.includes("failed") ? (
                                        <h2 className="text-2xl mt-2 font-bold ">{_.error}</h2>
                                    ) : (
                                        <h2 className="text-2xl mt-2 font-bold">{_.data()}</h2>
                                    )}
                                    {_.status.includes("loading") ? (
                                        <Skeleton className="h-[0.74rem] mt-2" />
                                    ) : _.status.includes("failed") ? (
                                        <span className={`text-xs font-medium -mt-2 ${_.subTextColor}`}>
                                            { }
                                        </span>
                                    ) : (
                                        <span className={cn(`text-xs font-medium -mt-2`, _.subTextColor())}>
                                            {_.subText()}
                                        </span>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))
                }
            </div>
            <CardBodyContent className="shadow border select-none  rounded-lg  p-5">
                <h3 className="font-medium text-base mb-4">
                    {tCommon(`${page}_client`)}
                </h3>
                {page === 'packaging' && client[0] ? (
                    <ClientPackagingHistory clientId={client[0].id} />
                ) : (
                    <DataTableDemo
                        setTableData={setTable}
                        columns={columns}
                        filterAttributes={filterAttributes}
                        searchText={searchText}
                        data={tableData?.map((el, index) => {
                            return { ...el, number: index + 1 };
                        })}
                    >
                        <div className="flex items-center justify-between py-4">
                            <div className="flex space-x-5">
                                <Input
                                    placeholder={page === 'balance' ? tCommon('filter_reason') : tCommon('filter_bill_number')}
                                    onChange={(event) => setSearchText(event.target.value)}
                                    className="max-w-md"
                                />
                            </div>
                        </div>
                    </DataTableDemo>
                )}
            </CardBodyContent>
            <MuiDialog
                open={isOpen}
                PaperProps={{
                    component: "form",
                    onSubmit: onSubmit,
                }}
            >
                <MuiDialogTitle>
                    {tCommon("receipt_title", { bill_number: selectedDebt?.bill_number })}
                </MuiDialogTitle>
                <MuiDialogContent>
                    <DialogContentText>
                        {tCommon("receipt_subtitle")}
                    </DialogContentText>
                    <div className="mt-2"></div>
                    <TextField
                        autoFocus
                        required
                        margin="dense"
                        name="total_amount"
                        label={tCommon("total_amount")}
                        value={selectedDebt?.remaining_amount}
                        type="number"
                        size="small"
                        fullWidth
                    />
                    <TextField
                        autoFocus
                        required
                        margin="dense"
                        name="paid_amount"
                        label={tCommon("receipt.paid_amount")}
                        type="number"
                        size="small"
                        defaultValue={selectedDebt?.remaining_amount}
                        fullWidth
                    />
                    <input type="text" hidden={true} name="bill_id" value={selectedDebt?.id} />
                </MuiDialogContent>
                <DialogActions>
                    <MuiButton disabled={loadingDebts} onClick={closeModal} color="error">{tCommon("cancel")}</MuiButton>
                    <MuiButton disabled={loadingDebts} type="submit" color="success">
                        {loadingDebts ? `${tCommon("please wait")}` : tCommon("cash-in")}
                    </MuiButton>
                </DialogActions>
            </MuiDialog>

            {/* Drawer rapport client */}
            {client[0] && (
                <ClientReportDrawer
                    clientId={client[0].id}
                    clientName={`${client[0].name} ${client[0].surname}`}
                    rfm={clientRfm}
                    open={showClientReport}
                    onClose={() => setShowClientReport(false)}
                />
            )}
        </div>
    )
}

// ── Composant badge segment RFM ────────────────────────────────────────────────
const RFM_SEGMENT_STYLES: Record<string, { labelKey: string; className: string }> = {
    champion: { labelKey: "customers.rfm.champion", className: "bg-purple-100 text-purple-700 border-purple-300" },
    loyal: { labelKey: "customers.rfm.loyal", className: "bg-blue-100 text-blue-700 border-blue-300" },
    at_risk: { labelKey: "customers.rfm.at_risk", className: "bg-amber-100 text-amber-700 border-amber-300" },
    lost: { labelKey: "customers.rfm.lost", className: "bg-red-100 text-red-600 border-red-300" },
    new: { labelKey: "customers.rfm.new", className: "bg-green-100 text-green-700 border-green-300" },
    promising: { labelKey: "customers.rfm.promising", className: "bg-teal-100 text-teal-700 border-teal-300" },
    hibernating: { labelKey: "customers.rfm.hibernating", className: "bg-gray-100 text-gray-500 border-gray-300" },
}

function RfmBadge({ segment }: { segment: string }) {
    const { t: tCommon } = useTranslation("common")
    const style = RFM_SEGMENT_STYLES[segment] ?? { labelKey: segment, className: "bg-gray-100 text-gray-500 border-gray-300" }
    return (
        <span className={cn("inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium", style.className)}>
            <Star className="w-3 h-3" />
            {RFM_SEGMENT_STYLES[segment] ? tCommon(style.labelKey) : segment}
        </span>
    )
}