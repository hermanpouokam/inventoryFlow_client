"use client";
import { AppDispatch, RootState } from "@/redux/store";
import * as React from "react";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import { formatteCurrency } from "../stock/functions";
import { fetchBills } from "@/redux/billSlicer";
import { CalendarIcon, Check, ChevronsUpDown, DollarSign } from "lucide-react";
import CardBodyContent from "@/components/CardContent";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import moment from "moment";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Skeleton } from "@/components/ui/skeleton";
import { Backdrop, CircularProgress } from "@mui/material";
import { fetchSalesPoints } from "@/redux/salesPointsSlicer";

export default function Page() {
    const [date, setDate] = React.useState<Date>(new Date());
    const dispatch: AppDispatch = useDispatch();
    const {
        data: bills,
        status: billsStatus,
        error: billsError,
    } = useSelector((state: RootState) => state.bills);
    const {
        data: salespoint,
        status: salespointStatus,
        error: salespointError,
    } = useSelector((state: RootState) => state.salesPoints);

    const [selectedSalesPoints, setSelectedSalesPoints] = React.useState<number[]>([])

    React.useEffect(() => {
        if (billsStatus == "idle") {
            dispatch(fetchBills({ sales_points: selectedSalesPoints }));
        }
        if (salespointStatus == 'idle') {
            dispatch(fetchSalesPoints({}));
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [billsStatus, dispatch, selectedSalesPoints])

    const sides = React.useMemo(() => {
        const calculateTotal = (array: any[], field: string) =>
            array.reduce((acc, curr) => acc + parseFloat(curr[field]), 0);
        return [
            {
                name: "Solde caisse",
                data: () =>
                    formatteCurrency(
                        calculateTotal(salespoint, "balance"),
                        "XAF",
                        "fr-FR"
                    ),
                status: [salespointStatus],
                error: [salespointError],
                icon: DollarSign,
                subText: () => "",
                subTextColor: () => {
                    return "text-neutral-800";
                },
            },
            {
                name: "Ventes du jour",
                data: () => {
                    const currentMonthSales = bills.filter(
                        (bill) =>
                            bill.state !== "created" &&
                            moment(bill.created_at).isSame(moment(date), "day")
                    );
                    const monthlySales = currentMonthSales.reduce(
                        (acc, curr) => acc + curr.total_bill_amount,
                        0
                    );
                    return formatteCurrency(monthlySales, "XAF", "fr-FR");
                },
                status: [salespointStatus],
                error: [salespointError],
                icon: DollarSign,
                subText: () => {
                    const currentMonthSales = bills
                        .filter(
                            (bill) =>
                                bill.state !== "created" &&
                                moment(bill.created_at).isSame(moment(date), "day")
                        )
                        .reduce((acc, curr) => acc + curr.total_bill_amount, 0);

                    const previousMonthSales = bills
                        .filter(
                            (bill) =>
                                bill.state !== "created" &&
                                moment(bill.created_at).isSame(moment(date).subtract(1, "day"), "day")
                        )
                        .reduce((acc, curr) => acc + curr.total_bill_amount, 0);

                    const percentageChange =
                        previousMonthSales === 0
                            ? 100
                            : ((currentMonthSales - previousMonthSales) /
                                previousMonthSales) *
                            100;

                    return previousMonthSales === 0
                        ? "N/A"
                        : `${percentageChange.toFixed(2)}% par rapport au mois précédent`;
                },
                subTextColor: () => {
                    const currentMonthSales = bills
                        .filter(
                            (bill) =>
                                bill.state !== "created" &&
                                moment(bill.created_at).isSame(moment(date), "day")
                        )
                        .reduce((acc, curr) => acc + curr.total_bill_amount, 0);

                    const previousMonthSales = bills
                        .filter(
                            (bill) =>
                                bill.state !== "created" &&
                                moment(bill.created_at).isSame(
                                    moment(date).subtract(1, "day"),
                                    "day"
                                )
                        )
                        .reduce((acc, curr) => acc + curr.total_bill_amount, 0);

                    const percentageChange =
                        previousMonthSales === 0
                            ? 100
                            : ((currentMonthSales - previousMonthSales) /
                                previousMonthSales) *
                            100;

                    if (percentageChange > 0) {
                        return "text-green-500";
                    } else if (percentageChange < 0) {
                        return "text-red-500";
                    } else {
                        return "text-neutral-800";
                    }
                },
            },
            {
                name: "Benefice du jour",
                data: () => {
                    const currentMonthSales = bills.filter(
                        (bill) =>
                            bill.state !== "created" &&
                            moment(bill.created_at).isSame(moment(date), "day")
                    );
                    const monthlySales = currentMonthSales.reduce(
                        (acc, curr) =>
                            acc +
                            curr.product_bills.reduce(
                                (accumulator, product_bill) =>
                                    accumulator + product_bill.benefit,
                                0
                            ),
                        0
                    );
                    return formatteCurrency(monthlySales, "XAF", "fr-FR");
                },
                status: [salespointStatus],
                error: [salespointError],
                icon: DollarSign,
                subText: () => {
                    const currentMonthSales = bills
                        .filter(
                            (bill) =>
                                bill.state !== "created" &&
                                moment(bill.created_at).isSame(moment(date), "day")
                        )
                        .reduce(
                            (acc, curr) =>
                                acc +
                                curr.product_bills.reduce(
                                    (accumulator, product_bill) =>
                                        accumulator + product_bill.benefit,
                                    0
                                ),
                            0
                        );

                    const previousMonthSales = bills
                        .filter(
                            (bill) =>
                                bill.state !== "created" &&
                                moment(bill.created_at).isSame(moment(date).subtract(1, "day"), "day")
                        )
                        .reduce(
                            (acc, curr) =>
                                acc +
                                curr.product_bills.reduce(
                                    (accumulator, product_bill) =>
                                        accumulator + product_bill.benefit,
                                    0
                                ),
                            0
                        );

                    const percentageChange =
                        previousMonthSales === 0
                            ? 100
                            : ((currentMonthSales - previousMonthSales) /
                                previousMonthSales) *
                            100;

                    return previousMonthSales === 0
                        ? "N/A"
                        : `${percentageChange.toFixed(2)}% ${percentageChange >= 0 ? "de plus" : "de moins"
                        } rapport au mois précédent`;
                },
                subTextColor: () => {
                    const currentMonthSales = bills
                        .filter(
                            (bill) =>
                                bill.state === "created" &&
                                moment(bill.created_at).isSame(moment(date), "day")
                        )
                        .reduce(
                            (acc, curr) =>
                                acc +
                                curr.product_bills.reduce(
                                    (accumulator, product_bill) =>
                                        accumulator + product_bill.benefit,
                                    0
                                ),
                            0
                        );

                    const previousMonthSales = bills
                        .filter(
                            (bill) =>
                                bill.state === "created" &&
                                moment(bill.created_at).isSame(moment(date).subtract(1, "day"), "day")
                        )
                        .reduce(
                            (acc, curr) =>
                                acc +
                                curr.product_bills.reduce(
                                    (accumulator, product_bill) =>
                                        accumulator + product_bill.benefit,
                                    0
                                ),
                            0
                        );

                    const percentageChange =
                        previousMonthSales === 0
                            ? 100
                            : ((currentMonthSales - previousMonthSales) /
                                previousMonthSales) *
                            100;

                    if (percentageChange > 0) {
                        return "text-green-500";
                    } else if (percentageChange < 0) {
                        return "text-red-500";
                    } else {
                        return "text-neutral-800";
                    }
                },
            },
        ];
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [bills, salespoint, salespointError, salespointStatus])

    const handleSelectCategories = (id: number) => {
        if (selectedSalesPoints.includes(id)) {
            setSelectedSalesPoints(selectedSalesPoints.filter(s => s != id))
        } else {
            setSelectedSalesPoints(prev => [...prev, id])
        }
    }

    const handleSearch = () => {
        dispatch(fetchBills({ sales_point: selectedSalesPoints }))
        dispatch(fetchSalesPoints({ sales_points: selectedSalesPoints }))
    }

    return (
        <main className="space-y-4">
            <Backdrop
                sx={{ color: '#8b5cf6', zIndex: (theme) => theme.zIndex.drawer + 1 }}
                open={billsStatus == 'loading' || salespointStatus == 'loading'}
            >
                <CircularProgress color='primary' />
            </Backdrop>
            <CardBodyContent className="space-y-3">
                <h4 className="font-semibold text-base ">Bouclage journalier</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4">
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant={"outline"}
                                className={cn(
                                    "w-auto justify-start text-left font-normal",
                                    !date && "text-muted-foreground"
                                )}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {date ? moment(date).format('DD-MM-YYYY') : <span>Séletionnez une date</span>}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                            <Calendar
                                mode="single"
                                selected={date}
                                //@ts-ignore
                                onSelect={setDate}
                                initialFocus
                            />
                        </PopoverContent>
                    </Popover>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                role="combobox"
                                className={cn(
                                    "justify-between",
                                    selectedSalesPoints.length < 1 && "text-muted-foreground"
                                )}
                            >
                                <div className='overflow-hidden text-ellipsis capitalize max-w-[90%]'>
                                    {selectedSalesPoints.length > 0
                                        ?
                                        selectedSalesPoints.length > 1 ?
                                            selectedSalesPoints.length + ' selectionnés'
                                            :
                                            selectedSalesPoints.map(obj => {
                                                const el = salespoint.find((cat) => cat.id === obj)
                                                return `${el?.name} - ${el?.address}`
                                            }).join(", ")
                                        : "Points de ventes"}
                                </div>
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="p-0">
                            <Command>
                                <CommandInput placeholder="Rechercher par noms..." />
                                <CommandList>
                                    <CommandEmpty>Aucun élément trouvé.</CommandEmpty>
                                    <CommandGroup>
                                        {salespoint.map((sp) => (
                                            <CommandItem
                                                value={`${sp.name}`}
                                                key={sp.id}
                                                onSelect={() => handleSelectCategories(sp.id)}
                                            >
                                                <Check
                                                    className={cn(
                                                        "mr-2 h-4 w-4",
                                                        selectedSalesPoints?.some(el => el == sp.id)
                                                            ? "opacity-100"
                                                            : "opacity-0"
                                                    )}
                                                />
                                                {sp.name} - {sp.address}
                                            </CommandItem>
                                        ))}
                                    </CommandGroup>
                                </CommandList>
                            </Command>
                        </PopoverContent>
                    </Popover>
                    <Button variant={'default'} onClick={handleSearch} className="bg-green-500 hover:bg-green-600">
                        Rechercher
                    </Button>
                </div>
            </CardBodyContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {sides.map((side, i) => (
                    <div
                        key={i}
                        className={
                            "shadow-md border select-none border-neutral-300 rounded-lg bg-white p-5"
                        }
                    >
                        <div className="flex flex-row justify-between items-center">
                            <p className="text-sm font-semibold">{side.name}</p>
                            <side.icon className="text-muted-foreground" size={15} />
                        </div>
                        {side.status.includes("loading") ? (
                            <Skeleton className="h-8 mt-2" />
                        ) : side.status.includes("failed") ? (
                            <h2 className="text-2xl mt-2 font-bold ">{side.error}</h2>
                        ) : (
                            <h2 className="text-2xl mt-2 font-bold">{side.data()}</h2>
                        )}
                        {side.status.includes("loading") ? (
                            <Skeleton className="h-[0.73rem] mt-2" />
                        ) : side.status.includes("failed") ? (
                            <span className={`text-xs font-medium -mt-2 ${side.subTextColor}`}>
                                {side.error[0]}
                            </span>
                        ) : (
                            <span className={`text-xs font-medium -mt-2 ${side.subTextColor()}`}>
                                {side?.subText()}
                            </span>
                        )}
                    </div>
                ))}
            </div>
        </main>
    );
}
