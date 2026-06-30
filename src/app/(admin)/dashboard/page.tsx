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
  getPeriods,
  groupBillsBy,
  dashboardMonthKeys,
  dashboardWeekdayKeys,
} from "./functions";
import CardBodyContent from "@/components/CardContent";
import { fetchEmployees } from "@/redux/employeesSlicer";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { People } from "@mui/icons-material";
import { fetchPackagings } from "@/redux/packagingsSlicer";
import BillTable from "./table";
import { usePermission } from "@/context/PermissionContext";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import i18n from "i18next";
import { formatDate } from "@/utils/formatDate";
import { instance } from "@/components/fetch";
import { PlanGate } from "@/components/PlanGate";
import { AlertTriangle, TrendingUp, TrendingDown } from "lucide-react";

const chartConfig = {
  ventes: {
    label: i18n.t("dashboard.chart.sales"),
    color: "hsl(var(--chart-1))",
  },
  benefices: {
    label: i18n.t("dashboard.chart.profits"),
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig;


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
  const { user, hasPermission, isAdmin } = usePermission()
  const { t: tCommon, i18n } = useTranslation("common")
  const locale = i18n.language

  React.useEffect(() => {
    if (billsStatus === "idle") {
      dispatch(fetchBills({ ...(!isAdmin() ? { sales_point: [user?.sales_point] } : {}) }));
    }
    if (productsStatus === "idle") {
      dispatch(fetchProducts({ ...(!isAdmin() ? { sales_points: [user?.sales_point] } : {}) }));
    }
    if (salespointStatus === "idle") {
      dispatch(fetchSalesPoints());
    }
    if (clientsStatus === "idle") {
      dispatch(fetchClients({ ...(!isAdmin() ? { sales_points: [user?.sales_point] } : {}) }));
    }
    if (employeesStatus === "idle" && hasPermission('view_employee')) {
      dispatch(fetchEmployees({ ...(!isAdmin() ? { sales_point: [user?.sales_point] } : {}) }));
    }
    if (packagingsStatus === "idle") {
      dispatch(
        fetchPackagings({ ...(!isAdmin() ? { sales_points: [user?.sales_point] } : {}) })
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
    array.reduce((acc, curr) => {
      const value = field.split(".").reduce((o, key) => o?.[key], curr);
      return acc + (parseFloat(value) || 0);
    }, 0);

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
        bill.state === "success" &&
        bill.paid &&
        bill.total_amount_with_taxes_fees > Number(bill.paid)
    );

    const unpaidBillAmount = unpaidBills.reduce(
      (acc, curr) =>
        acc + (curr.total_amount_with_taxes_fees - (curr.paid ?? 0)),
      0
    );

    const pendingBills = bills.filter((bill) =>
      ["created", "pending"].includes(bill.state)
    );

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

    const salespointsBalance = calculateTotal(
      isAdmin() ? salespoint : [user?.sales_point_details],
      "cash_register.balance"
    );

    const getMonthlyStats = () => {
      const current = bills.filter(
        (bill) =>
          bill.state !== "created" &&
          moment(bill.created_at).isSame(moment(), "month")
      );

      const previous = bills.filter(
        (bill) =>
          bill.state !== "created" &&
          moment(bill.created_at).isSame(
            moment().subtract(1, "month"),
            "month"
          )
      );

      const currentTotal = current.reduce(
        (acc, curr) => acc + curr.total_amount_with_taxes_fees,
        0
      );

      const previousTotal = previous.reduce(
        (acc, curr) => acc + curr.total_amount_with_taxes_fees,
        0
      );

      const percentage =
        previousTotal === 0
          ? null
          : ((currentTotal - previousTotal) / previousTotal) * 100;

      return { currentTotal, previousTotal, percentage };
    };

    const salesStats = getMonthlyStats();

    const getMonthlyProfit = () => {
      const current = bills.filter(
        (bill) =>
          bill.state !== "created" &&
          moment(bill.created_at).isSame(moment(), "month")
      );

      const previous = bills.filter(
        (bill) =>
          bill.state !== "created" &&
          moment(bill.created_at).isSame(
            moment().subtract(1, "month"),
            "month"
          )
      );

      const sum = (arr) =>
        arr.reduce(
          (acc, curr) =>
            acc +
            curr.product_bills.reduce(
              (a, pb) => a + parseFloat(pb.benefit.toString()),
              0
            ),
          0
        );

      const currentTotal = sum(current);
      const previousTotal = sum(previous);

      const percentage =
        previousTotal === 0
          ? null
          : ((currentTotal - previousTotal) / previousTotal) * 100;

      return { currentTotal, percentage };
    };

    const profitStats = getMonthlyProfit();

    return [
      ...(hasPermission('manage_cash') ||
        hasPermission('add_transaction') ||
        hasPermission('view_daily_report') ||
        hasPermission('view_monthly_report')
        ? [
          {
            name: tCommon('dashboard.cash_balance.title'),
            data: () =>
              formatteCurrency(salespointsBalance, "XAF", "fr-FR"),
            status: isAdmin() ? [salespointStatus] : [],
            error: isAdmin() ? [salespointError] : [],
            icon: DollarSign,
            iconColor: "text-green-600 bg-green-500/10",
            subText: () => tCommon('dashboard.cash_balance.sub'),
            subTextColor: () => "text-muted-foreground",
          },
        ]
        : []),

      ...(hasPermission('view_products') ||
        hasPermission('view_daily_report') ||
        hasPermission('view_monthly_report')
        ? [
          {
            name: tCommon('dashboard.stock_value.title'),
            data: () =>
              formatteCurrency(
                productValue + packagingValue,
                "XAF",
                "fr-FR"
              ),
            status: [productsStatus],
            error: [productsError],
            icon: StoreIcon,
            iconColor: "text-blue-800 bg-blue-500/10",
            subText: () =>
              tCommon('dashboard.stock_value.sub', {
                products: totalProducts,
                packaging: totalPackaging,
              }),
            subTextColor: () => "text-muted-foreground",
          },
        ]
        : []),

      ...(hasPermission('cash_in_invoices') ||
        hasPermission('view_invoices') ||
        hasPermission('view_daily_report') ||
        hasPermission('view_monthly_report')
        ? [
          {
            name: tCommon('dashboard.pending_orders.title'),
            data: () =>
              formatteCurrency(
                calculateBillAmount(bills, ["created", "pending"]),
                "XAF",
                "fr-FR"
              ),
            status: [billsStatus],
            error: [billsError],
            icon: Receipt,
            iconColor: "text-purple-800 bg-purple-500/10",
            subText: () =>
              tCommon('dashboard.pending_orders.sub', {
                count: pendingBills.length,
              }),
            subTextColor: () => "text-muted-foreground",
          },
        ]
        : []),

      ...(hasPermission('cash_in_invoices') ||
        hasPermission('view_invoices')
        ? [
          {
            name: tCommon('dashboard.customer_debt.title'),
            data: () =>
              formatteCurrency(unpaidBillAmount, "XAF", "fr-FR"),
            status: [billsStatus],
            error: [billsError],
            icon: DollarSign,
            iconColor: "text-red-600 bg-red-500/10",
            subText: () =>
              tCommon('dashboard.customer_debt.sub', {
                count: unpaidBills.length,
              }),
            subTextColor: () => "text-muted-foreground",
          },
        ]
        : []),

      ...(hasPermission('view_daily_report') ||
        hasPermission('view_monthly_report')
        ? [
          {
            name: tCommon('dashboard.total_capital.title'),
            data: () =>
              formatteCurrency(
                productValue +
                packagingValue +
                calculateBillAmount(bills, ["created", "pending"]) +
                unpaidBillAmount +
                salespointsBalance,
                "XAF",
                "fr-FR"
              ),
            status: [productsStatus, packagingsStatus, billsStatus],
            error: [salespointError],
            icon: DollarSign,
            iconColor: "text-yellow-800 bg-yellow-500/10",
            subText: () =>
              tCommon('dashboard.total_capital.sub', {
                count: salespoint.length,
              }),
            subTextColor: () => "text-muted-foreground",
          },
        ]
        : []),

      ...(hasPermission('view_customer')
        ? [
          {
            name: tCommon('dashboard.active_clients.title'),
            data: () => clients.length,
            status: [clientsStatus],
            error: [clientsError],
            icon: People,
            iconColor: "text-sky-800 bg-sky-500/10",
            subText: () =>
              tCommon('dashboard.active_clients.sub', {
                count: clients.length,
              }),
            subTextColor: () => "text-muted-foreground",
          },
        ]
        : []),

      ...(hasPermission('view_monthly_report')
        ? [
          {
            name: tCommon('dashboard.monthly_sales.title'),
            data: () =>
              formatteCurrency(
                salesStats.currentTotal,
                "XAF",
                "fr-FR"
              ),
            status: [billsStatus],
            error: [billsError],
            icon: ChartBar,
            iconColor: "text-indigo-800 bg-indigo-500/10",
            subText: () =>
              salesStats.percentage === null
                ? "N/A"
                : tCommon('dashboard.monthly_sales.sub', {
                  percentage: `${salesStats.percentage.toFixed(2)}%`,
                }),
            subTextColor: () => {
              if (!salesStats.percentage) return "text-foreground";
              if (salesStats.percentage > 0) return "text-green-500";
              if (salesStats.percentage < 0) return "text-red-500";
              return "text-foreground";
            },
          },
        ]
        : []),

      ...(hasPermission('view_monthly_report')
        ? [
          {
            name: tCommon('dashboard.monthly_profit.title'),
            data: () =>
              formatteCurrency(
                profitStats.currentTotal,
                "XAF",
                "fr-FR"
              ),
            status: [billsStatus],
            error: [billsError],
            icon: DollarSign,
            iconColor: "text-orange-800 bg-orange-500/10",
            subText: () =>
              profitStats.percentage === null
                ? "N/A"
                : `${profitStats.percentage.toFixed(2)}%`,
            subTextColor: () => {
              if (!profitStats.percentage) return "";
              if (profitStats.percentage > 0) return "text-green-500";
              if (profitStats.percentage < 0) return "text-red-500";
              return "";
            },
          },
        ]
        : []),
    ];
  }, [
    products,
    packagings,
    bills,
    salespoint,
    clients.length,
    salespointStatus,
    salespointError,
    productsStatus,
    productsError,
    billsStatus,
    billsError,
    tCommon,
  ]);

  const periods = getPeriods();
  const [chartData, setChartData] = React.useState([]);
  const [selectedPeriod, setselectedPeriod] = React.useState(periods[1]);
  const [loadingData, setLoadingData] = React.useState(false);

  useEffect(() => {
    document.title = tCommon("dashboard.title");
    setLoadingData(true);
    const groupedBills = groupBillsBy(
      bills.filter((bill) => bill.state !== "created"),
      selectedPeriod?.groupBy?.split("-")[0],
      selectedPeriod.startDate,
      selectedPeriod.endDate
    );
    const formatXAxis = (key: string, groupBy: string) => {
      const date = moment(key);
      switch (groupBy) {
        case "day":
          return tCommon(dashboardWeekdayKeys[date.isoWeekday() - 1]).slice(0, 3);
        case "day-number":
          return `${date.format("D")} ${tCommon(dashboardMonthKeys[date.month()]).slice(0, 3)}`;
        case "month":
          return `${tCommon(dashboardMonthKeys[date.month()]).slice(0, 3)}`;
        default:
          return "";
      }
    };

    const calculateVentes = (bills: any[]) =>
      bills.reduce((acc, curr) => acc + curr.total_amount_with_taxes_fees, 0);

    const calculateBenefices = (bills: any[]) =>
      bills.reduce(
        (acc, curr) =>
          acc +
          curr.product_bills.reduce(
            (sum, product_bill) => sum + parseFloat(product_bill.benefit.toString()),
            0
          ),
        0
      );

    const dataChart = Object.entries(groupedBills).map(([key, bills]) => ({
      xAxis: formatXAxis(key, selectedPeriod.groupBy),
      ventes: calculateVentes(bills),
      ...(hasPermission('view_daily_report') ? { benefices: calculateBenefices(bills), } : {})
    }));

    setChartData(dataChart);
    setLoadingData(false);
  }, [selectedPeriod, bills]);

  const fadeUp = { hidden: { opacity: 0, y: 0 }, visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08 } }) };

  const start = formatDate(selectedPeriod.startDate, locale);
  const end = formatDate(
    moment(selectedPeriod.endDate).subtract(1, "day").toDate(),
    locale
  );
  return (
    <div className="space-y-5 mt-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-4">
        {cases.map((_, i) => (
          <motion.div key={_.name} custom={i} variants={fadeUp} initial="hidden" animate="visible">
            <CardBodyContent className="shadow-[0px_0px_40px_-25px_rgba(0,0,0,0.49)] px-5 py-3 rounded-lg">
              <div
                key={i}
                className={
                  "rounded-lg bg-card"
                }
              >
                <div className="flex flex-row justify-between items-center">
                  <p className="text-xs font-semibold capitalize">{_.name}</p>
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
            </CardBodyContent>
          </motion.div>
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <motion.div className="col-span-1 md:col-span-2 lg:col-span-3" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <CardBodyContent className="relative ">
            {loadingData && (
              <div className="absolute w-full h-full bg-white/50 z-[999] flex justify-center items-center">
                <CircularProgress color="inherit" />
              </div>
            )}
            <CardHeader className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
              <div>
                <CardTitle>
                  {hasPermission('view_daily_report')
                    ? tCommon('dashboard.sales_with_profit')
                    : tCommon('dashboard.sales_title')}
                </CardTitle>
                <CardDescription className="capitalize ">
                  {tCommon('dashboard.date.from_to', { start, end })}
                </CardDescription>
              </div>
              <div>
                <Select
                  onValueChange={(e) => {
                    setselectedPeriod(periods?.find(per => per.name === e) ?? periods[1])
                    dispatch(fetchBills({ ...(!isAdmin() ? { sales_point: [user?.sales_point] } : {}) }))
                  }}
                >
                  <SelectTrigger className="w-full sm:w-[180px] text-neutral-900 dark:text-white">
                    <SelectValue placeholder={tCommon(`dashboard.period.${selectedPeriod.name}`)} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>{tCommon('dashboard.period_label')}</SelectLabel>
                      {periods.map((period) => (
                        <SelectItem key={period.name} value={period.name}>
                          {tCommon(`dashboard.period.${period.name}`)}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="min-h-[260px] sm:min-h-[300px]">
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
                  <div className="size-full flex justify-center items-center">
                    <h3 className="text-2xl font-semibold text-muted-foreground">
                      {billsStatus !== "succeeded" && !billsError
                        ? tCommon('dashboard.loading')
                        : tCommon('dashboard.no_bills')}
                    </h3>
                  </div>
                )}
              </ChartContainer>
            </CardContent>
          </CardBodyContent>
        </motion.div>

        <motion.div className="col-span-1 md:col-span-1 lg:col-span-2" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <CardBodyContent className="h-full px-0">
            <div className="px-4 border-b border-border pb-2">
              <h4 className="text-lg font-bold">
                {tCommon('dashboard.employees.title')}
              </h4>
              <h6 className="text-sm font-normal text-muted-foreground">
                {tCommon('dashboard.employees.count', {
                  count: employees.length,
                  salespoints: salespoint.length
                })}
              </h6>
            </div>
            <div className="overflow-y-auto scrollbar h-[320px] md:h-[450px] lg:h-[550px]">
              {employeesStatus !== "succeeded" && !employeesError ? (
                <div className="w-full h-full flex flex-col justify-center items-center pb-5">
                  <CircularProgress color="primary" size="small" />
                  <h2 className="text-base font-semibold">
                    {tCommon('dashboard.loading')}
                  </h2>
                </div>
              ) : employees.length < 1 ? (
                <div className="w-full h-full flex justify-center items-center pb-5">
                  <div className="flex flex-col justify-center items-center">
                    <BadgeX className="w-12 h-12 text-muted-foreground" />
                    <h2 className="text-base font-semibold">
                      {tCommon('dashboard.employees.empty')}
                    </h2>
                  </div>
                </div>
              ) : (
                <div className=" divide-y divide-slate-100/50 cursor-pointer">
                  {employees.map((employee) => (
                    <div
                      className="py-2 flex hover:bg-slate-500/50 px-2 justify-between items-center px-5"
                      key={employee.id}
                    >
                      <div>
                        <h2 className="font-semibold text-base capitalize">
                          {" "}
                          {employee.name} {employee.surname}
                        </h2>
                        <h2 className="font-normal text-sm text-muted-foreground capitalize">
                          {tCommon(`dashboard.employee_role.${employee.role}`)}
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
                        {formatteCurrency(employee.monthly_salary)}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardBodyContent>
        </motion.div>
        <CardBodyContent className="col-span-1 md:col-span-3 lg:col-span-5">
          <h4 className="text-base font-medium mb-5">
            {tCommon('dashboard.last_bills')}
          </h4>
          <BillTable data={bills} />
        </CardBodyContent>
      </div>

    </div>
  );
}