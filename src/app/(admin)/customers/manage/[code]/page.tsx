'use client'
import CardBodyContent from '@/components/CardContent';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Field, FieldGroup } from "@/components/ui/field"

import { usePermission } from '@/context/PermissionContext';
import { fetchClientById } from '@/redux/clients';
import { fetchClientsData } from '@/redux/customerBillSlicer';
import { AppDispatch, RootState } from '@/redux/store';
import { decryptParam } from '@/utils/encryptURL';
import { Backdrop, CircularProgress } from '@mui/material';
import * as React from 'react';
import { useSelector } from 'react-redux';
import { useDispatch } from 'react-redux';
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { DollarSign, Wallet } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { formatteCurrency } from '@/app/(admin)/stock/functions';
import { useTranslation } from 'react-i18next';

export default function Page({ params }: { params: { code: string } }) {

    const dispatch: AppDispatch = useDispatch()

    const { data: client, error: clientError, status: clientStatus } = useSelector((state: RootState) => state.clients)
    const { data, error, status } = useSelector((state: RootState) => state.clientData)
    const { hasPermission, user, isAdmin } = usePermission()
    const [open, setOpen] = React.useState(false)
    const { t: tCommon } = useTranslation('common')

    React.useEffect(() => {
        if (clientStatus === 'idle') {
            const client_id = decryptParam(params.code)
            dispatch(fetchClientById(client_id))
        }
        if (clientStatus === 'succeeded' && status === 'idle') {
            const param = {
                customer_code: client[0].code
            }
            dispatch(fetchClientsData(param))
        }
        if (clientStatus === 'succeeded') {
            document.title = `Client - ${client[0]?.name}`
        }
    }, [status, dispatch]);

    const cards = React.useMemo(() => {
        if (clientStatus === 'succeeded') {
            return [
                {
                    title: tCommon('balance'),
                    color: "bg-green-100 text-green-800",
                    icon: Wallet,
                    iconColor: "bg-green-200 text-green-900",
                    subText: () => {
                        return "Solde positif"
                    },
                    subTextColor: () => {
                        if (client[0]?.balance > 0) return "text-green-500"
                        else if (client[0]?.balance < 0) return "text-red-500"
                        else return "text-gray-500"
                    },
                    status: clientStatus,
                    error: clientError,
                    data: () => formatteCurrency(client[0]?.balance || 0)
                },
                {
                    title: tCommon('debts'),
                    color: "bg-red-100 text-red-800",
                    icon: DollarSign,
                    iconColor: "bg-red-200 text-red-900",
                    subText: () => {
                        const debtBills = data.filter(bill => bill.paid && bill.paid < bill.total_amount_with_taxes_fees)
                        return tCommon(debtBills.length > 1 ? 'invoices' : 'invoice', { count: debtBills.length })
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
                    }
                }
            ]
        }
    }, [clientStatus, client])


    return (
        <div className='space-y-5'>
            <Backdrop
                sx={{ color: "#8b5cf6", zIndex: (theme) => theme.zIndex.drawer + 1 }}
                open={status == "loading" || clientStatus == "loading"}
            >
                <CircularProgress color="inherit" />
            </Backdrop>
            <CardBodyContent className=''>
                <div className="flex flex-row justify-between items-center">
                    <h2 className="font-medium text-base">Gerer les clients</h2>
                    {hasPermission('edit_customer') ?

                        <Dialog>
                            <form>
                                <DialogTrigger asChild>
                                    <Button
                                        variant={"primary"}
                                        onClick={() => setOpen(!open)}
                                        className="ml-2 text-white text-sm "
                                    >
                                        {tCommon('edit')}
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-sm">
                                    <DialogHeader>
                                        <DialogTitle>Edit profile</DialogTitle>
                                        <DialogDescription>
                                            Make changes to your profile here. Click save when you&apos;re
                                            done.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <FieldGroup>
                                        <Field>
                                            <Label htmlFor="name-1">Name</Label>
                                            <Input id="name-1" name="name" defaultValue="Pedro Duarte" />
                                        </Field>
                                        <Field>
                                            <Label htmlFor="username-1">Username</Label>
                                            <Input id="username-1" name="username" defaultValue="@peduarte" />
                                        </Field>
                                    </FieldGroup>
                                    <DialogFooter>
                                        <DialogClose asChild>
                                            <Button variant="outline">Cancel</Button>
                                        </DialogClose>
                                        <Button type="submit">Save changes</Button>
                                    </DialogFooter>
                                </DialogContent>
                            </form>
                        </Dialog>

                        :
                        null}

                </div>
            </CardBodyContent>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                {
                    cards?.map((_, i) => (
                        <Card className="border border-border hover:shadow-card transition-shadow">
                            <CardContent className="p-5">
                                <div
                                    key={i}
                                    className={
                                        "select-none rounded-lg bg-card"
                                    }
                                >
                                    <div className="flex flex-row justify-between items-center">
                                        <p className="text-sm font-semibold">{tCommon(_.title)}</p>
                                        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center ", _.iconColor)}>
                                            <_.icon className="w-5 h-5" />
                                        </div>
                                    </div>
                                    {_.status.includes("loading") ? (
                                        <Skeleton className="h-8 mt-2" />
                                    ) : _.status.includes("failed") ? (
                                        <h2 className="text-2xl mt-2 font-bold ">{_.error}</h2>
                                    ) : (
                                        <h2 className="text-2xl mt-2 font-bold">{_.data()}</h2>
                                    )}
                                    {_.status.includes("loading") ? (
                                        <Skeleton className="h-[0.73rem] mt-2" />
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
        </div>
    )
}