"use client";
import CardBodyContent from "@/components/CardContent";
import DateRangePicker from "@/components/DateRangePicker";
import SelectPopover from "@/components/SelectPopover";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { AppDispatch, RootState } from "@/redux/store";
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
import { ColumnDef } from "@tanstack/react-table";
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
import { toast } from "@/components/ui/use-toast";
import { deleteOperation, validateOperation } from "./function";

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<any, any>;
  },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export default function Page() {
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
        sales_points: [
          ...(selectedSalesPoints.length < 1
            ? salespoints
            : selectedSalesPoints),
        ]
          .map((s) => {
            return s.id;
          })
          .join(","),
      };
      const res = await instance.get(`/sales-points/cash-data/`, { params });
      if (res.status == 200) {
        setData(res.data);
        console.log(res.data);
      }
      setLoading(false);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    if (statusSalespoint == "idle") {
      dispatch(fetchSalesPoints());
    }
    if (statusSalespoint == "succeeded") {
      getData();
    }
  }, [statusSalespoint]);

  const cases = React.useMemo(() => {
    return [
      {
        name: "Montant en caisse",
        data: () => formatteCurrency(data?.total_balance ?? 0),
        status: [statusSalespoint],
        error: [errorSalespoint],
        icon: DollarSign,
        subText: () => `${data?.cash_registers.length} point(s) de vente`,
        subTextColor: () => {
          return "text-neutral-800";
        },
      },
      {
        name: "Total des entrée",
        data: () => formatteCurrency(data?.total_deposits ?? 0),
        status: [statusSalespoint],
        error: [errorSalespoint],
        icon: DollarSign,
        subText: () =>
          `${
            data?.transactions.filter(
              (x) => x.transaction_type === "deposit" && x.is_validated == true
            ).length
          } transaction(s)`,
        subTextColor: () => {
          return "text-neutral-800";
        },
      },
      {
        name: "Total des sorties",
        data: () => formatteCurrency(data?.total_withdrawals ?? 0),
        status: [statusSalespoint],
        error: [errorSalespoint],
        icon: DollarSign,
        subText: () =>
          `${
            data?.transactions.filter(
              (x) => x.transaction_type === "withdrawal" && x.is_validated
            ).length
          } transaction(s)`,
        subTextColor: () => {
          return "text-neutral-800";
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
    {
      id: "actions",
      enableHiding: false,
      header: () => <div className="text-center w-[60px]">Actions</div>,
      cell: ({ row }) => {
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
                      <span>Valider</span>
                      <ArrowDownToLine className="w-4 h-4" />
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <DropdownMenuItem
                      onClick={() => onSetOperation("delete", row.original)}
                      className="justify-between text-red-600 items-center"
                    >
                      <span>Supprimer</span>
                      <Trash2 className="w-4 h-4" />
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          );
        }
      },
    },
    {
      accessorKey: "transction_number",
      header: () => (
        <div className="text-center w-[200px]">Numéro de transaction</div>
      ),
      cell: ({ row }) => (
        <div className="capitalize text-center">
          {row.original.transction_number}
        </div>
      ),
    },
    {
      accessorKey: "type de transaction",
      header: () => (
        <div className="text-center w-[200px]">Type de transaction</div>
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
          {row.original.transaction_type == "deposit" ? "Dépot" : "Retrait"}
        </div>
      ),
    },
    {
      accessorKey: "Status",
      header: ({ column }) => {
        return (
          <div
            className="flex justify-center w-[110px] "
            // onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            <span>Status</span>
            {/* <ArrowUpDown className="ml-2 h-4 w-4" /> */}
          </div>
        );
      },
      cell: ({ row }) => {
        const is_validated = row.original.is_validated;

        return (
          <div
            className={cn(
              "capitalize self-center text-center p-2 rounded-full w-[100px]",
              !is_validated ? "bg-red-500" : "bg-green-500"
            )}
          >
            {is_validated ? "Validé" : "Non validé"}
          </div>
        );
      },
    },
    {
      accessorKey: "sales_point",
      header: () => <div className="text-center w-[140px]">Point de vente</div>,
      cell: ({ row }) => (
        <div className="text-center capitalize truncate">
          {row.original.sales_point}
        </div>
      ),
    },
    {
      accessorKey: "opérateur",
      header: ({ column }) => {
        return (
          <div className="text-center w-[140px]">
            Opérateur
            {/* <ArrowUpDown className="ml-2 h-4 w-4" /> */}
          </div>
        );
      },
      cell: ({ row }) => {
        return (
          <div className="capitalize text-center text-base font-medium">
            {row.original.created_by}
          </div>
        );
      },
    },
    {
      accessorKey: "Montant",
      header: ({ column }) => {
        return (
          <div className="flex justify-center w-[140px]">
            <span>Montant</span>
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
      accessorKey: "solde précedent",
      header: ({ column }) => {
        return (
          <div className="flex justify-center w-[140px]">
            <span>Solde précedent</span>
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
      accessorKey: "nouveau solde",
      header: ({ column }) => {
        return (
          <div className="flex justify-center w-[140px]">
            <span>Nouveau solde</span>
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
      accessorKey: "commentaire",
      header: () => (
        <div>
          <h6 className="text-center text-base w-[240px]">Commentaire</h6>
        </div>
      ),
      cell: ({ row }) => {
        return (
          <div className="text-center font-medium">{row.original.reason}</div>
        );
      },
    },
    {
      accessorKey: "date de création",
      header: () => (
        <div>
          <h6 className="text-right text-base w-[140px]">Date de création</h6>
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
      accessorKey: "validé par",
      header: () => <div className="text-center w-[240px]">Validé le</div>,
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
      accessorKey: "valide par",
      header: ({ column }) => {
        return <div className="text-center w-[140px]">Validé par</div>;
      },
      cell: ({ row }) => {
        return (
          <div className="capitalize text-center text-base font-medium">
            {row.original.validated_by ?? "-"}
          </div>
        );
      },
    },
  ];

  const filteredTransactions =
    type || status
      ? [...(data ? data?.transactions : [])].filter((t) => {
          return (
            (!type || t.transaction_type === type) &&
            (!status || String(t.is_validated) == status)
          );
        })
      : [...(data ? data?.transactions : [])];

  const dataType = [
    {
      nom: "Retrait",
      value: "withdrawal",
    },
    {
      nom: "Dépot",
      value: "deposit",
    },
  ];

  const dataStatus = [
    {
      nom: "Validé",
      value: "true",
    },
    {
      nom: "Non validé",
      value: "false",
    },
  ];

  const fields: Field[] = [
    {
      name: "sales_point",
      type: "select",
      label: "point de vente",
      required: true,
      options: salespoints,
    },
    // {
    //   name: "transaction_type",
    //   type: "select",
    //   label: "Type de transaction",
    //   required: true,
    //   options: [
    //     { label: "Entrée de fonds", value: "deposit" },
    //     { label: "Sortie de fonds", value: "withdrawal" },
    //   ],
    // },
    {
      name: "amount",
      type: "number",
      required: true,
      label: "Montant",
    },

    {
      name: "reason",
      type: "text",
      required: true,
      label: "Description",
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
    try {
      if (page && ["withdrawal", "deposit"].includes(page)) {
        if (!values.sales_point) {
          return setFieldError("sales_point", "Selectionnez un point de vente");
        }
        if (values.amount < 1) {
          return setFieldError(
            "amount",
            "Le montant ne peut pas être inférieur à zero."
          );
        }
        if (values.reason.lenght > 255) {
          return setFieldError(
            "reason",
            "Le text dépasse la limite de caractère."
          );
        }
        const data = { ...values, transaction_type: page };
        const response = await instance.post(`/cash-transactions/`, data, {
          withCredentials: true,
        });
        if (response.status == 201) {
          await getData();
          setPage(null);
          return toast({
            title: "Succès",
            description: "Transaction ajoutée avec succès.",
            variant: "success",
            className: "text-white bg-green-600 border-green-600",
            icon: <Check className="mr-2" />,
          });
        }
      } else {
        return;
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleTransaction = async () => {
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
                title: "Succès",
                description:
                  res.data.success ?? "Transaction supprimée avec succès.",
                icon: <Check className="mr-2" />,
                className: "bg-green-500 border-green-500",
              });
            }
          } catch (error) {
            setOperation(null);
            return toast({
              variant: "destructive",
              title: "Erreur",
              description:
                error.response.data.error ??
                "Une erreur est survenue veuillez réessayer.",
              icon: <X className="mr-2" />,
              className: "bg-red-600 border-red-600",
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
                title: "Succès",
                description:
                  res.data.success ?? "Transaction validée avec succès.",
                icon: <Check className="mr-2" />,
                className: "bg-green-500 border-green-500",
              });
            }
          } catch (error) {
            setOperation(null);
            console.log(error)
            return toast({
              variant: "destructive",
              title: "Erreur",
              description:
                error.response.data.error ??
                "Une erreur est survenue veuillez réessayer.",
              icon: <X className="mr-2" />,
              className: "bg-red-600 border-red-600",
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
        open={statusSalespoint != "succeeded" || loading}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
      <CardBodyContent>
        <div className="flex justify-between items-center">
          <h2 className="text-base font-medium">Ma caisse</h2>
          <div className="flex">
            <Button
              onClick={() => handleClickOpen("withdrawal")}
              className="bg-red-600 hover:bg-red-700 text-white text-sm "
            >
              Sortie de fonds
            </Button>
            <Button
              onClick={() => handleClickOpen("deposit")}
              className="ml-2 bg-green-600 hover:bg-green-700 text-white text-sm "
            >
              Entrée de fonds
            </Button>
          </div>
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
        <SelectPopover
          selectedItems={selectedSalesPoints}
          items={salespoints}
          getOptionLabel={(option) => `${option.name} - ${option.address}`}
          onSelect={handleSelect}
          placeholder="Points de vente"
        />
        <Button
          variant={"outline"}
          onClick={getData}
          className={cn(
            "w-full bg-green-600 hover:bg-green-700 hover:text-white text-white"
          )}
        >
          Rechercher
        </Button>
      </CardBodyContent>
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 sm:grid-cols-2 gap-5">
        {cases.map((_, i) => (
          <div
            key={i}
            className={
              "shadow-md border select-none border-neutral-300 rounded-lg bg-white p-5"
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
      <CardBodyContent>
        <div className="flex gap-5 items-center">
          <h2 className="text-base font-medium">Liste de transactions</h2>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="default" className="gap-2">
                <span>Filtrer</span>
                <ListFilter className="w-4 h-4 text-white" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="start">
              <DropdownMenuLabel>Status</DropdownMenuLabel>
              <DropdownMenuSeparator />
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
              <DropdownMenuLabel>Type de transaction</DropdownMenuLabel>
              <DropdownMenuSeparator />
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
                placeholder="Filtrer par numero de transaction..."
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
          {page == "deposit" ? "Retirer des fonds" : "Entrer des fonds"}
        </DialogTitle>
        <form onSubmit={(e) => handleSubmit(e, handleValidate)}>
          <DialogContent sx={{ maxWidth: 500 }}>
            <DialogContentText id="alert-dialog-slide-description">
              {`Vous allez faire une ${
                page == "withdrawal" ? "entrée" : "sortie"
              } de fonds. Remplissez les informations et validez.`}
            </DialogContentText>
            <div className="space-y-4 mt-3">
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
                          `${option.id} ${option.name} ${
                            input.name == "sales_point" ? option?.address : ""
                          }`
                        }
                        placeholder={input.label}
                        className="z-[99999] popover-content-width-full"
                        buttonClassName={errors[input.name] && "border-red-500"}
                        getOptionLabel={(option) =>
                          `${option.name} ${
                            input.name == "sales_point"
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
                    <div>
                      <div className="text-right -my-2 text-sm mr-2 font-medium">
                        {input.name == "reason" &&
                          `${values["reason"].length}/255`}
                      </div>
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
                    </div>
                  );
                }
              })}
            </div>
          </DialogContent>
          <DialogActions>
            <Button variant={"destructive"} onClick={handleClose}>
              Annuler
            </Button>
            <Button
              variant={"secondary"}
              disabled={loading}
              className="bg-green-500 hover:bg-green-600 text-white"
              type="submit"
            >
              {loading ? "Veuillez patienter..." : "Valider"}
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
          {operation == "delete" ? `Supprimer` : `Valider`}
          {" la transaction"} {opId?.transction_number}
        </DialogTitle>
        <DialogContent sx={{ maxWidth: 500 }}>
          <DialogContentText id="alert-dialog-slide-description">
            {`Vous allez ${
              operation == "delete" ? "supprimmer" : "valider"
            } cette transaction.`}
            <p className="text-red-500">NB: Cette action est irreversible</p>
          </DialogContentText>
          <div className="space-y-4 mt-3">
            <input type="hidden" name="id" />
          </div>
        </DialogContent>
        <DialogActions>
          <Button variant={"destructive"} onClick={handleCloseOp}>
            Annuler
          </Button>
          <Button
            variant={"secondary"}
            disabled={loading}
            className="bg-green-500 hover:bg-green-600 text-white"
            onClick={handleTransaction}
          >
            {loading ? "Veuillez patienter..." : "Confirmer"}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
