"use client";
import CardBodyContent from "@/components/CardContent";
import DateRangePicker from "@/components/DateRangePicker";
import SelectPopover from "@/components/SelectPopover";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { AppDispatch, RootState } from "@/redux/store";
import { datesData } from "@/utils/constants";
import { DollarSign, DollarSignIcon } from "lucide-react";
import moment from "moment";
import React from "react";
import { useSelector } from "react-redux";
import { formatteCurrency } from "../../stock/functions";
import { fetchSalesPoints } from "@/redux/salesPointsSlicer";
import { useDispatch } from "react-redux";
import { instance } from "@/components/fetch";
import { Backdrop, CircularProgress } from "@mui/material";
import { ColumnDef } from "@tanstack/react-table";
import { DataTableDemo } from "@/components/TableComponent";
import { Input } from "@/components/ui/input";

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

  const [text, setText] = React.useState("");
  const dispatch: AppDispatch = useDispatch();

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
            data?.transactions.filter((x) => x.transaction_type === "deposit")
              .length
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
              (x) => x.transaction_type === "withdrawal"
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
      header: () => <div className="text-left w-[140px]">Actions</div>,
      cell: ({ row }) => <div>{row.original.transction_number}</div>,
    },
    {
      accessorKey: "numéro de transaction",
      header: () => (
        <div className="text-center w-[200px]">Numéro de transaction</div>
      ),
      cell: ({ row }) => (
        <div className="capitalize">{row.original.transction_number}</div>
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
          <div className="text-right font-medium">
            {new Date(row.original.created_at).toDateString()}
          </div>
        );
      },
    },

    {
      accessorKey: "Status",
      header: ({ column }) => {
        return (
          <div
            className="flex justify-center w-[110px] "
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
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
              "capitalize text-center p-2 rounded-full w-[100px]",
              !is_validated ? "bg-red-500" : "bg-green-500"
            )}
          >
            {is_validated ? "Validé" : "Non validé"}
          </div>
        );
      },
    },
    {
      accessorKey: "validé par",
      header: () => <div className="text-center w-[240px]">Validé par</div>,
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
      accessorKey: "opérateur",
      header: ({ column }) => {
        return (
          <div
            className="text-center w-[220px]"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Opérateur
          </div>
        );
      },
      cell: ({ row }) => {
        return (
          <div className="capitalize text-left text-base font-medium">
            {row.original.validated_by ?? "-"}
          </div>
        );
      },
    },
  ];

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
            <Button className="bg-red-600 hover:bg-red-700 text-white text-sm ">
              Sortie de fonds
            </Button>
            <Button className="ml-2 bg-green-600 hover:bg-green-700 text-white text-sm ">
              Entrée de fonds
            </Button>
          </div>
        </div>
      </CardBodyContent>
      <CardBodyContent className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
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
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 sm:grid-cols-2 gap-5">
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
        <h2 className="text-base font-medium">Liste de transactions</h2>
        <DataTableDemo
          setTableData={setTable}
          columns={columns}
          filterAttributes={["created_by"]}
          searchText={text}
          data={[...(data ? data?.transactions : [])].map((el, index) => {
            return { ...el, number: index + 1 };
          })}
        >
          <div className="flex items-center justify-between py-4">
            <div className="flex space-x-5">
              <Input
                placeholder="Filtrer par articles..."
                value={text}
                onChange={(event) => setText(event.target.value)}
                className="max-w-sm"
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
    </div>
  );
}
