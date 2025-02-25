"use client";
import {
  BadgeX,
  ChartBar,
  DollarSign,
  Receipt,
  Store,
  StoreIcon,
} from "lucide-react";
import React, { useEffect, useMemo } from "react";
import { CircularProgress } from "@mui/material";
import { CartesianGrid, XAxis, LineChart, Line, LabelList } from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import { useDispatch } from "react-redux";
import { fetchBills } from "@/redux/billSlicer";
import { fetchProducts } from "@/redux/productsSlicer";
import { fetchSalesPoints } from "@/redux/salesPointsSlicer";
import { Skeleton } from "@/components/ui/skeleton";
import { formatteCurrency } from "../stock/functions";
import { fetchClients } from "@/redux/clients";
import moment from "moment";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  groupBillsBy,
  monthsInFrench,
  translateRole,
  weeksInFrench,
} from "./functions";
import CardBodyContent from "@/components/CardContent";
import { fetchEmployees } from "@/redux/employeesSlicer";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { People } from "@mui/icons-material";
import { fetchPackagings } from "@/redux/packagingsSlicer";
import BillTable from "./table";

const chartConfig = {
  ventes: {
    label: "Ventes",
    color: "hsl(var(--chart-1))",
  },
  benefices: {
    label: "Benefices",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig;

const periods = [
  {
    name: "current-week",
    startDate: moment().startOf("isoWeek").format("YYYY-MM-DDT00:00:00[Z]"),
    endDate: moment().endOf("isoWeek").format("YYYY-MM-DDT23:59:59[Z]"),
    groupBy: "day",
  },
  {
    name: "prev-week",
    startDate: moment()
      .subtract(1, "week")
      .startOf("isoWeek")
      .format("YYYY-MM-DDT00:00:00[Z]"),
    endDate: moment()
      .subtract(1, "week")
      .endOf("isoWeek")
      .format("YYYY-MM-DDT23:59:59[Z]"),
    groupBy: "day",
  },
  {
    name: "current-month",
    startDate: moment().startOf("month").format("YYYY-MM-DDT00:00:00[Z]"),
    endDate: moment().endOf("month").format("YYYY-MM-DDT23:59:59[Z]"),
    groupBy: "day-number",
  },
  {
    name: "prev-month",
    startDate: moment()
      .subtract(1, "month")
      .startOf("month")
      .format("YYYY-MM-DDT00:00:00[Z]"),
    endDate: moment()
      .subtract(1, "month")
      .endOf("month")
      .format("YYYY-MM-DDT23:59:59[Z]"),
    groupBy: "day-number",
  },
  {
    name: "current-year",
    startDate: moment().startOf("year").format("YYYY-MM-DDT00:00:00[Z]"),
    endDate: moment().endOf("year").format("YYYY-MM-DDT23:59:59[Z]"),
    groupBy: "month",
  },
  {
    name: "prev-year",
    startDate: moment()
      .subtract(1, "year")
      .startOf("year")
      .format("YYYY-MM-DDT00:00:00[Z]"),
    endDate: moment()
      .subtract(1, "year")
      .endOf("year")
      .format("YYYY-MM-DDT23:59:59[Z]"),
    groupBy: "month",
  },
];

const translate = {
  "current-week": "cette semaine",
  "prev-week": "semaine derniere",
  "current-month": "Ce mois",
  "prev-month": "Mois dernier",
  "current-year": "Cette année",
  "prev-year": "Année derniere",
};

export default function Page() {
  const {
    data: bills,
    status: billsStatus,
    error: billsError,
  } = useSelector((state: RootState) => state.bills);
  const {
    data: products,
    status: productsStatus,
    error: productsError,
  } = useSelector((state: RootState) => state.products);
  const {
    data: salespoint,
    status: salespointStatus,
    error: salespointError,
  } = useSelector((state: RootState) => state.salesPoints);
  const {
    data: clients,
    status: clientsStatus,
    error: clientsError,
  } = useSelector((state: RootState) => state.clients);
  const {
    data: packagings,
    status: packagingsStatus,
    error: packagingsError,
  } = useSelector((state: RootState) => state.packagings);
  const {
    data: employees,
    error: employeesError,
    status: employeesStatus,
  } = useSelector((state: RootState) => state.employees);

  const dispatch: AppDispatch = useDispatch();

  React.useEffect(() => {
    if (billsStatus === "idle") {
      dispatch(fetchBills({}));
    }
    if (productsStatus === "idle") {
      dispatch(fetchProducts({}));
    }
    if (salespointStatus === "idle") {
      dispatch(fetchSalesPoints({}));
    }
    if (clientsStatus === "idle") {
      dispatch(fetchClients({}));
    }
    if (employeesStatus === "idle") {
      dispatch(fetchEmployees({}));
    }
    if (packagingsStatus === "idle") {
      dispatch(
        fetchPackagings({ sales_points: salespoint.map((el) => el.id) })
      );
    }
  }, [
    billsStatus,
    productsStatus,
    salespointStatus,
    clientsStatus,
    employeesStatus,
    dispatch,
  ]);

  const calculateTotal = (array: any[], field: string) =>
    array.reduce((acc, curr) => acc + parseFloat(curr[field]), 0);

  const calculateBillAmount = (bills: Bill[], stateFilters: string[] = []) =>
    bills
      .filter((bill) => stateFilters.includes(bill.state))
      .reduce(
        (acc: any, curr: { total_amount_with_taxes_fees: any }) =>
          acc + curr.total_amount_with_taxes_fees,
        0
      );

  const cases = useMemo(() => {
    const totalProducts = products.reduce(
      (acc, pro) => acc + pro.total_quantity,
      0
    );
    const totalPackaging = packagings.reduce(
      (acc, curr) => acc + (curr.empty_quantity + curr.full_quantity),
      0
    );

    const unpaidBills = bills.filter(
      (bill) =>
        bill.state === "delivered" &&
        bill.paid &&
        bill.total_amount_with_taxes_fees > parseFloat(bill?.paid)
    );
    const unpaidBillAmount = unpaidBills.reduce(
      (acc, curr) =>
        acc + (curr.total_amount_with_taxes_fees - (curr.paid ?? 0)),
      0
    );

    return [
      {
        name: "Montant en caisse",
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
        name: "Valeur du stock",
        data: () => {
          const productValue = products.reduce(
            (acc, product) =>
              acc + product.total_quantity * parseFloat(product.price),
            0
          );
          const packagingValue = packagings.reduce(
            (acc, packaging) =>
              acc +
              (packaging.empty_quantity + packaging.full_quantity) *
                parseFloat(packaging.price),
            0
          );

          return formatteCurrency(
            productValue + packagingValue,
            "XAF",
            "fr-FR"
          );
        },
        status: [productsStatus],
        error: [productsError],
        icon: StoreIcon,
        subText: () =>
          `${totalProducts} produit(s) et ${totalPackaging} emballage(s)`,
        subTextColor: () => {
          return "text-neutral-800";
        },
      },
      {
        name: "Commandes non encaissées",
        data: () =>
          formatteCurrency(
            calculateBillAmount(bills, ["created", "pending"]),
            "XAF",
            "fr-FR"
          ),
        status: [billsStatus],
        error: [billsError],
        icon: Receipt,
        subText: () =>
          `${
            bills.filter((bill) => ["created", "pending"].includes(bill.state))
              .length
          } facture(s)`,
        subTextColor: () => {
          return "text-neutral-800";
        },
      },
      {
        name: "Dettes client",
        data: () => formatteCurrency(unpaidBillAmount, "XAF", "fr-FR"),
        status: [billsStatus],
        error: [billsError],
        icon: DollarSign,
        subText: () => `${unpaidBills.length} facture(s)`,
        subTextColor: () => {
          return "text-neutral-800";
        },
      },
      {
        name: "Valeur totale du capital",
        data: () => {
          const salespointsBalance = calculateTotal(salespoint, "balance");
          const productValue = products.reduce(
            (acc, product) =>
              acc + product.total_quantity * parseFloat(product.price),
            0
          );
          const packagingValue = packagings.reduce(
            (acc, packaging) =>
              acc +
              (packaging.empty_quantity + packaging.full_quantity) *
                parseFloat(packaging.price),
            0
          );
          const pendingBillAmount = calculateBillAmount(bills, [
            "created",
            "pending",
          ]);
          return formatteCurrency(
            productValue +
              packagingValue +
              pendingBillAmount +
              unpaidBillAmount +
              salespointsBalance,
            "XAF",
            "fr-FR"
          );
        },
        status: [productsStatus, packagingsStatus, billsStatus],
        error: [salespointError],
        icon: DollarSign,
        subText: () => `${salespoint.length} point(s) de vente`,
        subTextColor: () => {
          return "text-neutral-800";
        },
      },
      {
        name: "Clients actifs",
        data: () => clients.length,
        status: [salespointStatus],
        error: [salespointError],
        icon: People,
        subText: () => "",
        subTextColor: () => {
          return "text-neutral-800";
        },
      },
      {
        name: "Ventes du mois",
        data: () => {
          const currentMonthSales = bills.filter(
            (bill) =>
              bill.state !== "created" &&
              moment(bill.created_at).isSame(moment(), "month")
          );
          const monthlySales = currentMonthSales.reduce(
            (acc, curr) => acc + curr.total_amount_with_taxes_fees,
            0
          );
          return formatteCurrency(monthlySales, "XAF", "fr-FR");
        },
        status: [salespointStatus],
        error: [salespointError],
        icon: ChartBar,
        subText: () => {
          const currentMonthSales = bills
            .filter(
              (bill) =>
                bill.state !== "created" &&
                moment(bill.created_at).isSame(moment(), "month")
            )
            .reduce((acc, curr) => acc + curr.total_amount_with_taxes_fees, 0);

          const previousMonthSales = bills
            .filter(
              (bill) =>
                bill.state !== "created" &&
                moment(bill.created_at).isSame(
                  moment().subtract(1, "month"),
                  "month"
                )
            )
            .reduce((acc, curr) => acc + curr.total_amount_with_taxes_fees, 0);

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
                moment(bill.created_at).isSame(moment(), "month")
            )
            .reduce((acc, curr) => acc + curr.total_amount_with_taxes_fees, 0);

          const previousMonthSales = bills
            .filter(
              (bill) =>
                bill.state !== "created" &&
                moment(bill.created_at).isSame(
                  moment().subtract(1, "month"),
                  "month"
                )
            )
            .reduce((acc, curr) => acc + curr.total_amount_with_taxes_fees, 0);

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
        name: "Benefice du mois",
        data: () => {
          const currentMonthSales = bills.filter(
            (bill) =>
              bill.state !== "created" &&
              moment(bill.created_at).isSame(moment(), "month")
          );
          const monthlySales = currentMonthSales.reduce(
            (acc, curr) =>
              acc +
              curr.product_bills.reduce(
                (accumulator, product_bill) =>
                  accumulator + parseFloat(product_bill.benefit.toString()),
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
                moment(bill.created_at).isSame(moment(), "month")
            )
            .reduce(
              (acc, curr) =>
                acc +
                curr.product_bills.reduce(
                  (accumulator, product_bill) =>
                    accumulator + parseFloat(product_bill.benefit.toString()),
                  0
                ),
              0
            );

          const previousMonthSales = bills
            .filter(
              (bill) =>
                bill.state !== "created" &&
                moment(bill.created_at).isSame(
                  moment().subtract(1, "month"),
                  "month"
                )
            )
            .reduce(
              (acc, curr) =>
                acc +
                curr.product_bills.reduce(
                  (accumulator, product_bill) =>
                    accumulator + parseFloat(product_bill.benefit.toString()),
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
            : `${percentageChange.toFixed(2)}% ${
                percentageChange >= 0 ? "de plus" : "de moins"
              } rapport au mois précédent`;
        },
        subTextColor: () => {
          const currentMonthSales = bills
            .filter(
              (bill) =>
                bill.state === "created" &&
                moment(bill.created_at).isSame(moment(), "month")
            )
            .reduce(
              (acc, curr) =>
                acc +
                curr.product_bills.reduce(
                  (accumulator, product_bill) =>
                    accumulator + parseFloat(product_bill.benefit.toString()),
                  0
                ),
              0
            );

          const previousMonthSales = bills
            .filter(
              (bill) =>
                bill.state === "created" &&
                moment(bill.created_at).isSame(
                  moment().subtract(1, "month"),
                  "month"
                )
            )
            .reduce(
              (acc, curr) =>
                acc +
                curr.product_bills.reduce(
                  (accumulator, product_bill) =>
                    accumulator + parseFloat(product_bill.benefit.toString()),
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
  }, [
    products,
    packagings,
    bills,
    salespointStatus,
    salespointError,
    productsStatus,
    productsError,
    billsStatus,
    billsError,
    packagingsStatus,
    salespoint,
    clients.length,
  ]);

  const [chartData, setChartData] = React.useState([]);
  const [selectedPeriod, setselectedPeriod] = React.useState(periods[2]);
  const [loadingData, setLoadingData] = React.useState(false);

  useEffect(() => {
    document.title = "Tableau de bord";
    setLoadingData(true);
    const groupedBills = groupBillsBy(
      bills.filter((bill) => bill.state !== "created"),
      selectedPeriod.groupBy.split("-")[0],
      selectedPeriod.startDate,
      selectedPeriod.endDate
    );
    const dataChart = Object.keys(groupedBills).map((key) => {
      switch (selectedPeriod.groupBy) {
        case "day":
          return {
            xAxis: weeksInFrench[moment(key).get("day") - 1]?.slice(0, 3),
            ventes: groupedBills[key].reduce(
              (acc, curr) => (acc += curr.total_amount_with_taxes_fees),
              0
            ),
            benefices: groupedBills[key].reduce(
              (acc, curr) =>
                acc +
                curr.product_bills.reduce(
                  (accumulator, product_bill) =>
                    accumulator + parseFloat(product_bill.benefit.toString()),
                  0
                ),
              0
            ),
          };
        case "day-number":
          return {
            xAxis: `${moment(key).format("D")} ${monthsInFrench[
              moment(key).get("month")
            ].slice(0, 3)}`,
            ventes: groupedBills[key].reduce(
              (acc, curr) => (acc += curr.total_amount_with_taxes_fees),
              0
            ),
            benefices: groupedBills[key].reduce(
              (acc, curr) =>
                acc +
                curr.product_bills.reduce(
                  (accumulator, product_bill) =>
                    accumulator + parseFloat(product_bill.benefit.toString()),
                  0
                ),
              0
            ),
          };
        case "month":
          return {
            xAxis: `${monthsInFrench[moment(key).get("month")].slice(0, 3)} `,
            ventes: groupedBills[key].reduce(
              (acc, curr) => (acc += curr.total_amount_with_taxes_fees),
              0
            ),
            benefices: groupedBills[key].reduce(
              (acc, curr) =>
                acc +
                curr.product_bills.reduce(
                  (accumulator, product_bill) =>
                    accumulator + parseFloat(product_bill.benefit.toString()),
                  0
                ),
              0
            ),
          };
        default:
          break;
      }
    });
    setChartData(dataChart);
    setLoadingData(false);
  }, [selectedPeriod, bills]);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {cases.map((_, i) => (
          <div
            key={i}
            className={
              "shadow-md border select-none border-neutral-300 rounded-lg bg-white p-5"
            }
          >
            <div className="flex flex-row justify-between items-center">
              <p className="text-sm font-semibold">{_.name}</p>
              <_.icon className="text-muted-foreground" size={15} />
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
                {}
              </span>
            ) : (
              <span className={`text-xs font-medium -mt-2 ${_.subTextColor()}`}>
                {_?.subText()}
              </span>
            )}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card className="col-span-1 sm:col-span-4 relative">
          {loadingData && (
            <div className="absolute w-full h-full bg-white/50 z-[999] flex justify-center items-center">
              <CircularProgress color="inherit" />
            </div>
          )}
          <CardHeader className="flex flex-row justify-between items-center flex-wrap">
            <div>
              <CardTitle>Ventes - Bénéfices</CardTitle>
              <CardDescription className="capitalize ">
                {`${moment(selectedPeriod.startDate).format("D")} ${
                  monthsInFrench[moment(selectedPeriod.startDate).get("month")]
                } -  ${moment(selectedPeriod.endDate)
                  .subtract(1, "day")
                  .format("D")} ${
                  monthsInFrench[
                    moment(selectedPeriod.endDate)
                      .subtract(1, "day")
                      .get("month")
                  ]
                }`}
              </CardDescription>
            </div>
            <div>
              <Select onValueChange={(e) => setselectedPeriod(e)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder={translate[selectedPeriod.name]} />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Périodes</SelectLabel>
                    {periods.map((period) => (
                      <SelectItem key={period.name} value={period}>
                        {translate[period.name]}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig}>
              {bills.length > 0 ? (
                <LineChart
                  accessibilityLayer
                  data={chartData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="xAxis"
                    tickLine={false}
                    className="capitalize"
                    axisLine={false}
                    tickMargin={8}
                    interval={0}
                  />
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent hideLabel />}
                  />
                  <Line
                    dataKey="benefices"
                    type="natural"
                    stroke="var(--color-benefices)"
                    strokeWidth={2}
                    dot={{
                      fill: "var(--color-benefices)",
                    }}
                    activeDot={{
                      r: 6,
                    }}
                  >
                    <LabelList
                      position="top"
                      offset={12}
                      className="fill-foreground"
                      fontSize={12}
                    />
                  </Line>
                  <Line
                    dataKey="ventes"
                    type="natural"
                    stroke="var(--color-ventes)"
                    strokeWidth={2}
                    dot={{
                      fill: "var(--color-ventes)",
                    }}
                    activeDot={{
                      r: 6,
                    }}
                  >
                    <LabelList
                      position="top"
                      offset={12}
                      className="fill-foreground"
                      fontSize={12}
                    />
                  </Line>
                </LineChart>
              ) : (
                <div className="w-full h-full flex justify-center items-center">
                  <h3 className="text-2xl font-semibold text-muted-foreground">
                    {billsStatus != "succeeded" && !billsError
                      ? "Veuillez patienter..."
                      : "Vous n'avez aucune facture receptionnée dans cette periode."}
                  </h3>
                </div>
              )}
            </ChartContainer>
          </CardContent>
        </Card>
        <CardBodyContent className="col-span-1 sm:col-span-2">
          <h4 className="text-lg font-bold text-neutral-950">
            Liste des employés
          </h4>
          <h6 className="text-sm font-normal text-muted-foreground">
            {employees.length} employé(s) dans {salespoint.length} point(s) de
            ventes
          </h6>
          <div className="overflow-y-auto scrollbar h-[550px]">
            {employeesStatus !== "succeeded" && !employeesError ? (
              <div className="w-full h-full flex flex-col justify-center items-center pb-5">
                <CircularProgress color="primary" size="small" />
                <h2 className="text-base font-semibold">
                  Veuillez patienter...
                </h2>
              </div>
            ) : employees.length < 1 ? (
              <div className="w-full h-full flex justify-center items-center pb-5">
                <div className="flex flex-col justify-center items-center">
                  <BadgeX className="w-12 h-12 text-muted-foreground" />
                  <h2 className="text-base font-semibold">
                    Vous n&aquos;avez aucun employé
                  </h2>
                </div>
              </div>
            ) : (
              <div className="mt-3 divide-y divide-slate-100 cursor-pointer">
                {employees.map((employee) => (
                  <div
                    className="py-2 flex hover:bg-slate-100 px-2 justify-between items-center"
                    key={employee.id}
                  >
                    <div>
                      <h2 className="font-semibold text-base capitalize">
                        {" "}
                        {employee.name} {employee.surname}
                      </h2>
                      <h2 className="font-normal text-sm text-muted-foreground capitalize">
                        {translateRole[employee.role]}
                      </h2>
                    </div>
                    <Badge
                      variant={"destructive"}
                      className={cn(
                        parseFloat(employee.monthly_salary) >
                          parseFloat(employee.salary) / 2 &&
                          "bg-green-600 hover:bg-green-700"
                      )}
                    >
                      {formatteCurrency(
                        employee.monthly_salary,
                        "XAF",
                        "fr-FR"
                      )}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardBodyContent>
        <CardBodyContent className="col-span-1 sm:col-span-6">
          <h4 className="text-base font-medium mb-5">
            Dernières MAJ de factures
          </h4>
          <BillTable data={bills} />
        </CardBodyContent>
      </div>
    </div>
  );
}
