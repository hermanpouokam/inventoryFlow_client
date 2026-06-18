"use client";
import CardBodyContent from "@/components/CardContent";
import SelectPopover from "@/components/SelectPopover";
import {
  Button
} from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  AppDispatch,
  RootState
} from "@/redux/store";
import { datesData } from "@/utils/constants";
import {
  ArrowDownToLine,
  Check,
  ChevronDown,
  DollarSign,
  DollarSignIcon,
  EllipsisVertical,
  ListFilter,
  Trash2,
  X,
  CheckCircle,
  XCircle,
} from "lucide-react";
import moment from "moment";
import React from "react";
import { useSelector } from "react-redux";
import { formatteCurrency } from "../../stock/functions";
import { fetchSalesPoints } from "@/redux/salesPointsSlicer";
import { useDispatch } from "react-redux";
import { instance } from "@/components/fetch";
import {
  Backdrop,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Slide,
  TextField,
} from "@mui/material";
import { ColumnDef, Row } from "@tanstack/react-table";
import { DataTableDemo } from "@/components/TableComponent";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { TransitionProps } from "@mui/material/transitions";
import useForm, { Field, initializeFormValues } from "@/utils/useFormHook";
import { Combobox } from "@/components/ComboBox";
import { toast } from "@/components/ui/app-toast";
import { deleteOperation, validateOperation } from "./function";
import { usePermission } from "@/context/PermissionContext";
import { useTranslation } from "react-i18next";
import { DateRangePicker } from "@/components/DateRangePicker";

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<any, any>;
  },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export default function Finances() {
  const { t: tCommon } = useTranslation("common");
  const {
    data: salespoints,
    status: statusSalespoint,
    error: errorSalespoint,
  } = useSelector((state: RootState) => state.salesPoints);
  const [selectedSalesPoints, setSelectedSalesPoints] =
    React.useState<SalesPoint[]>(salespoints);
  const [loading, setLoading] = React.useState(false);
  const [data, setData] = React.useState<CashData | null>(null);
  const [pickedDateRange, setPickedDateRange] = React.useState<{
    from: Date | null;
    to: Date | null;
  } | null>({ from: new Date(), to: new Date() });
  const [operation, setOperation] = React.useState<
    "delete" | "validate" | null
  >(null);
  const [opId, setOpId] = React.useState<Transaction | null>(null);
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { push } = useRouter();
  const type = searchParams.get("type");
  const status = searchParams.get("status");

  const handleFilterChange = (key: "type" | "status", value: string) => {
    const params = new URLSearchParams(searchParams);
    if (params.get(key) === value) {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    push(`${pathname}?${params.toString()}`);
  };

  const [text, setText] = React.useState("");
  const dispatch: AppDispatch = useDispatch();
  const [page, setPage] = React.useState<"deposit" | "withdrawal" | null>(null);
  const { user, hasPermission, isAdmin } = usePermission()
  const handleClickOpen = (pageText: "withdrawal" | "deposit") => {
    setPage(pageText);
  };

  const handleClose = () => {
    setPage(null);
    resetForm();
  };

  const onSetOperation = async (
    operation: "validate" | "delete",
    id: Transaction
  ) => {
    setOperation(operation);
    setOpId(id);
  };

  const handleCloseOp = () => {
    setOperation(null);
    setOpId(null);
  };

  const handleDateRangeChange = (range: {
    from: Date | null;
    to: Date | null;
  }) => {
    setPickedDateRange(range);
  };
  const handleSelect = (data: SalesPoint) => {
    setSelectedSalesPoints((prev) =>
      prev.includes(data)
        ? prev.filter((item) => item !== data)
        : [...prev, data]
    );
  };

  const getData = async () => {
    setLoading(true);
    try {
      const params = {
        start_date: moment(pickedDateRange?.from).format(
          "YYYY-MM-DDT00:00:00.SSS"
        ),
        end_date: moment(pickedDateRange?.to).format("YYYY-MM-DDT23:59:59.SSS"),
        sales_points: isAdmin() ? [...(selectedSalesPoints.length < 1 ? salespoints : selectedSalesPoints),].map((s) => { return s.id; }).join(",") : user?.sales_point,
      };
      const res = await instance.get(`/sales-points/cash-data/`, { params });
      if (res.status == 200) {
        setData(res.data);
      }
      setLoading(false);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    if (statusSalespoint == "idle" && isAdmin()) {
      dispatch(fetchSalesPoints());
    }
    if (statusSalespoint == "succeeded" && isAdmin()) {
      getData();
    }
    if (!isAdmin()) {
      getData()
    }
  }, [statusSalespoint]);

  const cases = React.useMemo(() => {
    return [
      {
        name: tCommon("cash.cards.balance"),
        data: () => formatteCurrency(data?.total_balance ?? 0),
        status: [isAdmin() ? statusSalespoint : []],
        error: [isAdmin() ? errorSalespoint : []],
        icon: DollarSign,
        subText: () => `${data?.cash_registers.length} ${tCommon("cash.cards.sales_points_count")}`,
        subTextColor: () => {
          return "text-muted-foreground";
        },
      },
      {
        name: tCommon("cash.cards.total_deposits"),
        data: () => formatteCurrency(data?.total_deposits ?? 0),
        status: [isAdmin() ? statusSalespoint : []],
        error: [isAdmin() ? errorSalespoint : []],
        icon: DollarSign,
        subText: () =>
          `${data?.transactions.filter(
            (x) => x.transaction_type === "deposit" && x.is_validated == true
          ).length} ${tCommon("cash.cards.transactions_count")}`,
        subTextColor: () => {
          return "text-muted-foreground";
        },
      },
      {
        name: tCommon("cash.cards.total_withdrawals"),
        data: () => formatteCurrency(data?.total_withdrawals ?? 0),
        status: [isAdmin() ? statusSalespoint : []],
        error: [isAdmin() ? errorSalespoint : []],
        icon: DollarSign,
        subText: () =>
          `${data?.transactions.filter(
            (x) => x.transaction_type === "withdrawal" && x.is_validated
          ).length} ${tCommon("cash.cards.transactions_count")}`,
        subTextColor: () => {
          return "text-muted-foreground";
        },
      },
    ];
  }, [data]);

  const [table, setTable] = React.useState<any | null>(null);

  const columns: ColumnDef<Transaction>[] = [
    {
      accessorKey: "number",
      header: () => <div className="w-[20px]">#</div>,
      cell: ({ row }) => (
        <div className="lowercase">{row.getValue("number")}</div>
      ),
    },
    ...(hasPermission('manage_cash') ? [{
      id: "actions",
      enableHiding: false,
      header: () => <div className="text-center w-[60px]">{tCommon("actions.title")}</div>,
      cell: ({ row }: { row: Row<Transaction> }) => {
        const is_validated = row.original.is_validated;
        if (!is_validated) {
          return (
            <div className="flex justify-center">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="gap-2">
                    <EllipsisVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-42" align="start">
                  <DropdownMenuGroup>
                    <DropdownMenuItem
                      onClick={() => onSetOperation("validate", row.original)}
                      className="justify-between items-center"
                    >
                      <span>{tCommon("validate")}</span>
                      <ArrowDownToLine className="w-4 h-4" />
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <DropdownMenuItem
                      onClick={() => onSetOperation("delete", row.original)}
                      className="justify-between text-red-600 items-center"
                    >
                      <span>{tCommon("delete")}</span>
                      <Trash2 className="w-4 h-4" />
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          );
        }
      },
    }] : [])
    ,
    {
      accessorKey: "transction_number",
      header: () => (
        <div className="text-center w-[200px]">{tCommon("cash.columns.transaction_number")}</div>
      ),
      cell: ({ row }) => (
        <div className="capitalize text-center">
          {row.original.transction_number}
        </div>
      ),
    },
    {
      accessorKey: "transaction_type",
      header: () => (
        <div className="text-center w-[200px]">{tCommon("cash.columns.transaction_type")}</div>
      ),
      cell: ({ row }) => (
        <div
          className={cn(
            "capitalize text-center text-base font-semibold",
            row.original.transaction_type != "deposit"
              ? "text-red-600"
              : "text-green-600"
          )}
        >
          {row.original.transaction_type == "deposit" ? tCommon("cash.types.deposit") : tCommon("cash.types.withdrawal")}
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: ({ column }) => {
        return (
          <div
            className="flex justify-center w-[110px] "
          // onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            <span>{tCommon("billing.status.title")}</span>
            {/* <ArrowUpDown className="ml-2 h-4 w-4" /> */}
          </div>
        );
      },
      cell: ({ row }) => {
        const is_validated = row.original.is_validated;

        return (
          <div
            className={cn(
              "capitalize self-center flex justify-center items-center text-center w-[100px]",

            )}
          >
            <span className={cn("p-1 px-2 font-semibold rounded-full", !is_validated ? "text-red-500" : "text-green-500")}>
              {is_validated ? tCommon("status_filter.validated") : tCommon("status_filter.not_validated")}
            </span>
          </div>
        );
      },
    },
    ...(isAdmin() ? [{
      accessorKey: "sales_point",
      header: () => <div className="text-center w-[140px]">{tCommon("sales_points.singular")}</div>,
      cell: ({ row }: { row: Row<Transaction> }) => (
        <div className="text-center capitalize truncate">
          {row.original.sales_point}
        </div>
      ),
    },] : []),
    {
      accessorKey: "operator",
      header: ({ column }) => {
        return (
          <div className="text-center w-[140px]">
            {tCommon("cash.columns.operator")}
            {/* <ArrowUpDown className="ml-2 h-4 w-4" /> */}
          </div>
        );
      },
      cell: ({ row }) => {
        return (
          <div className="capitalize text-center text-base font-medium">
            {row.original.created_by_full_name}
          </div>
        );
      },
    },
    {
      accessorKey: "amount",
      header: ({ column }) => {
        return (
          <div className="flex justify-center w-[140px]">
            <span>{tCommon("amount")}</span>
          </div>
        );
      },
      cell: ({ row }) => {
        return (
          <div className="capitalize text-center w-[140px]">
            {formatteCurrency(row.original.amount)}
          </div>
        );
      },
    },
    {
      accessorKey: "previous_balance",
      header: ({ column }) => {
        return (
          <div className="flex justify-center w-[140px]">
            <span>{tCommon("cash.columns.previous_balance")}</span>
          </div>
        );
      },
      cell: ({ row }) => {
        return (
          <div className="capitalize text-center w-[140px]">
            {row.original.is_validated
              ? formatteCurrency(row.original.previous_balance)
              : "-"}
          </div>
        );
      },
    },
    {
      accessorKey: "new_balance",
      header: ({ column }) => {
        return (
          <div className="flex justify-center w-[140px]">
            <span>{tCommon("cash.columns.new_balance")}</span>
          </div>
        );
      },
      cell: ({ row }) => {
        return (
          <div className="capitalize text-center w-[140px]">
            {row.original.is_validated
              ? formatteCurrency(row.original.new_balance)
              : "-"}
          </div>
        );
      },
    },
    {
      accessorKey: "comment",
      header: () => (
        <div>
          <h6 className="text-center text-base w-[240px]">{tCommon("comment")}</h6>
        </div>
      ),
      cell: ({ row }) => {

        function parseReason(reason: string): { key: string; params: Record<string, string> } {
          const [key, paramsStr] = reason.split("|");

          const params: Record<string, string> = {};
          if (paramsStr) {
            paramsStr.split(",").forEach((pair) => {
              const [paramKey, paramValue] = pair.split("=");
              if (paramKey && paramValue !== undefined) {
                params[paramKey] = paramValue;
              }
            });
          }

          return { key, params };
        }

        const { key, params } = parseReason(row.original.reason);

        return (
          <div className="text-center font-medium">{tCommon(`cash.${key}`, params)}</div>
        );

      },
    },
    {
      accessorKey: "created_at",
      header: () => (
        <div>
          <h6 className="text-right text-base w-[140px]">{tCommon("cash.columns.created_at")}</h6>
        </div>
      ),
      cell: ({ row }) => {
        return (
          <div className="text-center  font-medium">
            {moment(row.original.created_at ?? "").format(
              "DD/MM/YYYY HH:mm:ss"
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "validated_at",
      header: () => <div className="text-center w-[240px]">{tCommon("cash.columns.validated_at")}</div>,
      cell: ({ row }) => {
        return (
          <div className="text-center font-medium">
            {row.original.is_validated
              ? moment(row.original.validated_at ?? "").format(
                "DD/MM/YYYY HH:mm:ss"
              )
              : "-"}
          </div>
        );
      },
    },
    {
      accessorKey: "validated_at",
      header: ({ column }) => {
        return <div className="text-center w-[140px]">{tCommon("cash.columns.validated_by")}</div>;
      },
      cell: ({ row }) => {
        return (
          <div className="capitalize text-center text-base font-medium">
            {row.original.validated_by_full_name ?? "-"}
          </div>
        );
      },
    },
  ];

  const filteredTransactions =
    type || status
      ? [...(data ? data?.transactions : [])]
        .filter((t) => {
          return (
            (!type || t.transaction_type === type) &&
            (!status || String(t.is_validated) == status)
          );
        })
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      : [...(data ? data?.transactions : [])].sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
      );

  const dataType = [
    {
      nom: tCommon("cash.types.withdrawal"),
      value: "withdrawal",
    },
    {
      nom: tCommon("cash.types.deposit"),
      value: "deposit",
    },
  ];

  const dataStatus = [
    {
      nom: tCommon("status_filter.validated"),
      value: "true",
    },
    {
      nom: tCommon("status_filter.not_validated"),
      value: "false",
    },
  ];

  const fields = [
    ...(isAdmin() ? [{
      name: "sales_point",
      type: "select",
      label: tCommon("sales_points.singular"),
      required: true,
      options: salespoints,
    },] : []),
    {
      name: "amount",
      type: "number",
      required: true,
      label: tCommon("amount"),
    },

    {
      name: "reason",
      type: "text",
      required: true,
      label: tCommon("description"),
    },
  ];

  const {
    errors,
    handleChange,
    handleSubmit,
    values,
    setFieldValue,
    setValues,
    resetForm,
    setFieldError,
  } = useForm(initializeFormValues(fields));

  const handleValidate = async () => {
    if (loading) return
    try {
      setLoading(true)
      if (page && ["withdrawal", "deposit"].includes(page)) {
        if (!values.sales_point && isAdmin()) {
          return setFieldError("sales_point", tCommon("sales_points.select_required"));
        }
        if (values.amount < 1) {
          return setFieldError(
            "amount",
            tCommon("cash.errors.invalid_amount")
          );
        }
        if (values.reason.lenght > 255) {
          return setFieldError(
            "reason",
            tCommon("cash.errors.reason_too_long")
          );
        }
        const data = { ...values, transaction_type: page };
        const response = await instance.post(`/cash-transactions/`, data, {
          withCredentials: true,
        });
        if (response.status == 201) {
          await getData();
          setPage(null);
          resetForm()
          return toast({
            title: tCommon("success"),
            description: tCommon("cash.success.created"),
            variant: "success",
            icon: <CheckCircle className="size-4" />,
          });
        }
      } else {
        return;
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false)
    }
  };

  const handleTransaction = async () => {
    if (loading) return

    if (operation && opId && ["delete", "validate"].includes(operation)) {
      switch (operation) {
        case "delete":
          try {
            const res = await deleteOperation(opId?.id);
            if (res.data.success) {
              await getData();
              setOpId(null);
              setOperation(null);
              return toast({
                variant: "success",
                title: tCommon("success"),
                description:
                  res.data.success ?? tCommon("cash.success.deleted"),
                icon: <CheckCircle className="size-4" />,
              });
            }
          } catch (error) {
            setOperation(null);
            return toast({
              variant: "destructive",
              title: tCommon("error"),
              description:
                error.response.data.error ??
                tCommon("errors.retry"),
              icon: <XCircle className="size-4" />,
            });
          }
        case "validate":
          try {
            const res = await validateOperation(opId?.id);
            if (res.data.success) {
              await getData();
              setOpId(null);
              setOperation(null);
              return toast({
                variant: "success",
                title: tCommon("success"),
                description:
                  res.data.success ?? tCommon("cash.success.validated"),
                icon: <CheckCircle className="size-4" />,
              });
            }
          } catch (error) {
            setOperation(null);
            return toast({
              variant: "destructive",
              title: tCommon("error"),
              description:
                error.response.data.error ??
                tCommon("errors.retry"),
              icon: <XCircle className="size-4" />,
            });
          }
        default:
          break;
      }
    }
    return;
  };

  return (
    <div className="space-y-5">
      <Backdrop
        sx={{ color: "#8b5cf6", zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={(statusSalespoint != "succeeded" && isAdmin()) || loading}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
      <CardBodyContent>
        <div className="flex justify-between items-center">
          <h2 className="text-base font-medium">{tCommon("cash.title")}</h2>
          {hasPermission('manage_cash') ? <div className="flex">
            <Button
              onClick={() => handleClickOpen("withdrawal")}
              className="bg-red-600 hover:bg-red-700 text-white text-sm "
            >
              {tCommon("cash.actions.withdrawal")}
            </Button>
            <Button
              onClick={() => handleClickOpen("deposit")}
              className="ml-2 bg-green-600 hover:bg-green-700 text-white text-sm "
            >
              {tCommon("cash.actions.deposit")}
            </Button>
          </div> : null}
        </div>
      </CardBodyContent>
      <CardBodyContent className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        <DateRangePicker
          defaultDateRange={pickedDateRange}
          datesData={datesData}
          onDateRangeChange={(date) => {
            if (date.from && date.to) {
              handleDateRangeChange(date);
            }
          }}
        />
        {
          isAdmin() ?
            <SelectPopover
              selectedItems={selectedSalesPoints}
              items={salespoints}
              getOptionLabel={(option) => `${option.name} - ${option.address}`}
              onSelect={handleSelect}
              placeholder={tCommon("sales_points.label")}
            /> : null
        }
        <Button
          variant={"primary"}
          onClick={getData}
          className={cn(
            "w-full"
          )}
        >
          {tCommon("search.action")}
        </Button>
      </CardBodyContent>
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 sm:grid-cols-2 gap-5">
        {cases.map((_, i) => (
          <CardBodyContent
            key={i}
            className={
              "shadow-md border select-none p-5 rounded-lg"
            }
          >
            <div className="flex flex-row justify-between items-center">
              <p className="text-sm font-semibold">{_.name}</p>
              <DollarSignIcon className="text-muted-foreground" size={15} />
            </div>
            {!data ? (
              <Skeleton className="h-8 mt-2" />
            ) : _.status.includes("failed") ? (
              <h2 className="text-2xl mt-2 font-bold ">{_.error}</h2>
            ) : (
              <h2 className="text-2xl mt-2 font-bold">{_.data()}</h2>
            )}
            {!data ? (
              <Skeleton className="h-[0.73rem] mt-2" />
            ) : _.status.includes("failed") ? (
              <span className={`text-xs font-medium -mt-2 ${_.subTextColor}`}>
                { }
              </span>
            ) : (
              <span className={`text-xs font-medium -mt-2 ${_.subTextColor()}`}>
                {_?.subText()}
              </span>
            )}
          </CardBodyContent>
        ))}
      </div>
      <CardBodyContent>
        <div className="flex gap-5 items-center">
          <h2 className="text-base font-medium">{tCommon("cash.transactions_list")}</h2>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                <span>{tCommon("filter")}</span>
                <ListFilter className="w-4 h-4 text-white" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="start">
              <DropdownMenuLabel className="text-muted-foreground">{tCommon("billing.status")}</DropdownMenuLabel>
              <DropdownMenuGroup>
                {dataStatus.map((el, index) => (
                  <DropdownMenuItem
                    key={index}
                    onClick={() => handleFilterChange("status", el.value)}
                    className="justify-between items-center"
                  >
                    <span>{el.nom}</span>
                    {el.value == status ? <Check className="h-4 w-4" /> : null}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuLabel className="text-muted-foreground">{tCommon("cash.columns.transaction_type")}</DropdownMenuLabel>
              <DropdownMenuGroup>
                {dataType.map((el, index) => (
                  <DropdownMenuItem
                    key={index}
                    onClick={() => handleFilterChange("type", el.value)}
                    className="justify-between items-center"
                  >
                    <span>{el.nom}</span>
                    {el.value == type ? <Check className="h-4 w-4" /> : null}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <DataTableDemo
          setTableData={setTable}
          columns={columns}
          filterAttributes={["transction_number"]}
          searchText={text}
          data={filteredTransactions.map((el, index) => {
            return { ...el, number: index + 1 };
          })}
        >
          <div className="flex items-center justify-between py-4">
            <div className="flex space-x-5 w-full">
              <Input
                placeholder={tCommon("cash.filter_placeholder")}
                value={text}
                onChange={(event) => setText(event.target.value)}
                className="max-w-[20rem]"
              />
              {/* <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="ml-auto">
                    Colonnes <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {table
                    ?.getAllColumns()
                    .filter((column: any) => column.getCanHide())
                    .map((column: any) => {
                      return (
                        <DropdownMenuCheckboxItem
                          key={column.id}
                          className="capitalize"
                          checked={column.getIsVisible()}
                          onCheckedChange={(value) =>
                            column.toggleVisibility(!!value)
                          }
                        >
                          {column.id}
                        </DropdownMenuCheckboxItem>
                      );
                    })}
                </DropdownMenuContent>
              </DropdownMenu> */}
            </div>
          </div>
        </DataTableDemo>
      </CardBodyContent>
      <Dialog
        open={page ? true : false}
        TransitionComponent={Transition}
        keepMounted
        aria-describedby="alert-dialog-slide-description"
      >
        <DialogTitle>
          {page !== "deposit" ? tCommon("cash.dialogs.withdraw_title") : tCommon("cash.dialogs.deposit_title")}
        </DialogTitle>
        <form onSubmit={(e) => handleSubmit(e, handleValidate)}>
          <DialogContent sx={{ maxWidth: 500 }}>
            <DialogContentText id="alert-dialog-slide-description">
              {tCommon("cash.dialogs.form_description", { type: page == "withdrawal" ? tCommon("cash.types.withdrawal").toLowerCase() : tCommon("cash.types.deposit").toLowerCase() })}
            </DialogContentText>
            <div className="space-y-3 mt-3">
              {fields.map((input) => {
                if (input.type == "select" && input.name == "sales_point") {
                  return (
                    <div key={input.name}>
                      <Combobox
                        RightIcon={ChevronDown}
                        options={input.options}
                        buttonLabel={input.label + "*"}
                        onValueChange={(e) => {
                          if (input.name === "sales_point") {
                            console.log(e);
                            setFieldValue(input.name, e?.id);
                            setFieldValue("cash_register", e?.cash_register.id);
                            setValues((prevValues) => ({
                              ...prevValues,
                            }));
                          }
                        }}
                        value={salespoints.find(
                          (s) => s.id == values["sales_point"]
                        )}
                        getOptionValue={(option) =>
                          `${option.id} ${option.name} ${input.name == "sales_point" ? option?.address : ""
                          }`
                        }
                        placeholder={input.label}
                        className="z-[99999] popover-content-width-full"
                        buttonClassName={errors[input.name] && "border-red-500"}
                        getOptionLabel={(option) =>
                          `${option.name} ${input.name == "sales_point"
                            ? " - " + option?.address
                            : ""
                          }`
                        }
                      />
                      {errors[input.name] && (
                        <p className="text-red-500 text-xs font-medium ml-4 mt-1">
                          {errors[input.name]}
                        </p>
                      )}
                    </div>
                  );
                } else {
                  return (
                    // <Select
                    //   onValueChange={(e) =>
                    //     setValues((prevVal) => {
                    //       return { ...prevVal, [input.name]: e };
                    //     })
                    //   }
                    // >
                    //   <SelectTrigger className="w-full">
                    //     <SelectValue
                    //       placeholder={values[input.name] ?? input.label}
                    //     />
                    //   </SelectTrigger>
                    //   <SelectContent className="z-[9999]">
                    //     <SelectGroup>
                    //       <SelectLabel>type de transaction</SelectLabel>
                    //       {input?.options?.map((val) => (
                    //         <SelectItem key={val.value} value={val.value}>
                    //           {val.label}
                    //         </SelectItem>
                    //       ))}
                    //     </SelectGroup>
                    //   </SelectContent>
                    // </Select>
                    <div key={input.name}>
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
                        multiline={input.name == "reason"}
                        maxRows={3}
                        inputProps={{ maxLength: 255 }}
                        error={!!errors[input.name]}
                        helperText={errors[input.name]}
                      />
                      <div className="text-right -my-1 text-sm mr-2 font-medium">
                        {input.name == "reason" &&
                          `${values["reason"].length}/255`
                        }
                      </div>
                    </div>
                  );
                }
              })}
            </div>
          </DialogContent>
          <DialogActions>
            <Button variant={"destructive"} onClick={handleClose}>
              {tCommon("cancel")}
            </Button>
            <Button
              variant={"secondary"}
              disabled={loading}
              className="bg-green-500 hover:bg-green-600 text-white"
              type="submit"
            >
              {loading ? tCommon("please wait") : tCommon("validate")}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
      <Dialog
        open={operation ? true : false}
        TransitionComponent={Transition}
        aria-describedby="alert-dialog-slide-description"
      >
        <DialogTitle>
          {tCommon(operation == "delete" ? "cash.dialogs.confirm_delete" : "cash.dialogs.confirm_validate", { number: opId?.transction_number })}
        </DialogTitle>
        <DialogContent sx={{ maxWidth: 500 }}>
          <DialogContentText id="alert-dialog-slide-description">
            {tCommon(
              operation == "delete"
                ? "cash.dialogs.delete_description"
                : "cash.dialogs.validate_description"
            )}
            <p className="text-red-500">{tCommon("dialogs.irreversible_warning")}</p>
          </DialogContentText>
          <div className="space-y-4 mt-3">
            <input type="hidden" name="id" />
          </div>
        </DialogContent>
        <DialogActions>
          <Button variant={"destructive"} onClick={handleCloseOp}>
            {tCommon("cancel")}
          </Button>
          <Button
            variant={"secondary"}
            disabled={loading}
            className="bg-green-500 hover:bg-green-600 text-white"
            onClick={handleTransaction}
          >
            {loading ? tCommon("please wait") : tCommon("confirm")}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
