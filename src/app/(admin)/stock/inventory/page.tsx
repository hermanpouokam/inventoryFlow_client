"use client";
import CardBodyContent from "@/components/CardContent";
import { Combobox } from "@/components/ComboBox";
import DateRangePicker from "@/components/DateRangePicker";
import SelectPopover from "@/components/SelectPopover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { fetchInventories } from "@/redux/inventory";
import { fetchSalesPoints } from "@/redux/salesPointsSlicer";
import { AppDispatch, RootState } from "@/redux/store";
import { datesData } from "@/utils/constants";
import {
  ArrowDown,
  Check,
  ChevronDown,
  EllipsisVertical,
  EyeIcon,
  Printer,
  Trash,
  X,
} from "lucide-react";
import moment from "moment";
import * as React from "react";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import { ColumnDef } from "@tanstack/react-table";
import { DataTableDemo } from "@/components/TableComponent";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuTrigger,
} from "@radix-ui/react-dropdown-menu";
import { Backdrop, CircularProgress } from "@mui/material";
import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { validateInventory, deleteInventory } from "./functions";
import { toast } from "@/components/ui/use-toast";
import { BlobProvider } from "@react-pdf/renderer";
import ReactDOM from "react-dom/client";
import InventoryPDF from "@/app/pdf/inventorPDF";
import { Inventory } from "@mui/icons-material";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AlertDialogHeader } from "@/components/ui/alert-dialog";
import { useFieldArray } from "react-hook-form";

export default function Page() {
  const [pickedDateRange, setPickedDateRange] = React.useState<DateRange>({
    from: new Date().toString(),
    to: new Date().toString(),
  });
  const [loading, setLoading] = React.useState(false);
  const handleDateRangeChange = (range: DateRange) => {
    setPickedDateRange(range);
  };
  const dispatch: AppDispatch = useDispatch();
  const [selectedSalesPoints, setSelectedSalesPoints] = React.useState<
    SalesPoint[]
  >([]);
  const [text, setText] = React.useState("");
  const [status, setStatus] = React.useState<{
    name: string;
    value: boolean | null;
  } | null>({
    name: "tous",
    value: null,
  });
  const { data: salespoints, status: salespointStatus } = useSelector(
    (state: RootState) => state.salesPoints
  );
  const [table, setTable] = React.useState<any | null>(null);

  const { inventories, status: statusInventories } = useSelector(
    (state: RootState) => state.inventories
  );
  const [dialogFor, setDialogFor] = React.useState<null | string>(null);
  const [inventory, setInventory] = React.useState<null | Inventory>(null);

  const handleSelect = (data: SalesPoint) => {
    setSelectedSalesPoints((prev) =>
      prev.includes(data)
        ? prev.filter((item) => item !== data)
        : [...prev, data]
    );
  };

  const getData = async () => {
    setLoading(true);

    const params = {
      start_date: moment(pickedDateRange?.from).format(
        "YYYY-MM-DDT00:00:00.SSS"
      ),
      end_date: moment(pickedDateRange?.to).format("YYYY-MM-DDT23:59:59.SSS"),
      sales_point: selectedSalesPoints.map((s) => s.id),
      ...(status != null ? { is_validated: status.value } : {}),
    };
    dispatch(fetchInventories(params));
    setLoading(false);
  };

  React.useEffect(() => {
    getData();
    if (salespointStatus == "idle") {
      dispatch(fetchSalesPoints());
    }
  }, []);

  const handleValidateInventory = async () => {
    setLoading(true);
    try {
      const res = await validateInventory(inventory.id);
      if (res.data.success) {
        await getData();
        return toast({
          title: "Succès",
          variant: "success",
          className: "bg-green-500 border-green-500",
          description: res.data.success,
          icon: <Check className="mr-2" />,
        });
      }
    } catch (error) {
      toast({
        title: "Erreur",
        className: "bg-red-500 border-red-500",
        description: `${
          error.response.data.error ??
          "Erreur lors de la validation de l'inventaire"
        }`,
        icon: <X className="mr-2" />,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setDialogFor(null);
      setInventory(null);
    }
  };

  const handleDeleteInventory = async () => {
    setLoading(true);
    try {
      const res = await deleteInventory(inventory.id);
      if (res.data.success) {
        await getData();
        return toast({
          title: "Succès",
          variant: "success",
          className: "bg-green-600 border-green-600",
          description: res.data.success,
          icon: <Check className="mr-2" />,
        });
      }
    } catch (error) {
      toast({
        title: "Erreur",
        className: "bg-red-500 border-red-500",
        variant: "destructive",
        description: `${
          error.response.data.error ??
          "Erreur lors de la suppression de l'inventaire"
        }`,
        icon: <X className="mr-2" />,
      });
    } finally {
      setLoading(false);
      setDialogFor(null);
      setInventory(null);
    }
  };

  const columns: ColumnDef<Inventory>[] = [
    {
      accessorKey: "number",
      header: () => <div className="w-5">#</div>,
      cell: ({ row }) => (
        <div className="text-center">{row.getValue("number")}</div>
      ),
    },
    {
      accessorKey: "name",
      header: ({ column }) => {
        return (
          <div
            className="text-center w-[180px]"
            // onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            N<sup>o</sup> d&apos;inventaire
            {/* <ArrowUpDown className="ml-2 h-4 w-4" /> */}
          </div>
        );
      },
      cell: ({ row }) => {
        return (
          <div className="capitalize">{row.original.inventory_number}</div>
        );
      },
    },
    {
      accessorKey: "Prix d'achat",
      header: () => <div className="text-center w-[140px]">Point de vente</div>,
      cell: ({ row }) => {
        return (
          <div className="text-center font-medium">
            {row.original.sales_point_details.name}
          </div>
        );
      },
    },
    {
      accessorKey: "operateur",
      header: () => <div className="text-center w-[140px]">Opérateur</div>,
      cell: ({ row }) => {
        return (
          <div className="text-center font-medium">
            {row.original.created_by_name}
          </div>
        );
      },
    },
    {
      accessorKey: "Status",
      header: () => <div className="text-center w-[140px]">Status</div>,
      cell: ({ row }) => {
        return (
          <div className="text-center font-medium">
            <p>
              <span
                className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-${
                  row.original.is_validated ? "green" : "red"
                }-500 text-${row.original.is_validated ? "white" : "black"}`}
              >
                {row.original.is_validated ? "Validé" : "Non validé"}
              </span>
            </p>
          </div>
        );
      },
    },
    {
      accessorKey: "valide",
      header: () => <div className="text-center w-[140px]">Validé par</div>,
      cell: ({ row }) => {
        return (
          <div className="text-center font-medium">
            {row.original.validated_by_name ?? "-"}
          </div>
        );
      },
    },
    {
      accessorKey: "Nombre de produits",
      header: () => (
        <div className="text-center w-[140px]">Nombre de produits</div>
      ),
      cell: ({ row }) => {
        const variant = row.original;
        return (
          <div className="text-center font-medium">
            {row.original.inventory_products.length}
          </div>
        );
      },
    },
    {
      accessorKey: "Date de création",
      header: () => (
        <div className="text-right w-[140px]">Date de création</div>
      ),
      cell: ({ row }) => {
        return (
          <div className="text-right font-medium">
            {new Date(row.original.created_at).toLocaleString()}
          </div>
        );
      },
    },
    {
      accessorKey: "Date de création",
      header: () => (
        <div className="text-right w-[140px]">Date de validation</div>
      ),
      cell: ({ row }) => {
        return (
          <div className="text-center font-medium">
            {row.original.validated_at
              ? new Date(row.original.validated_at).toLocaleString()
              : "-"}
          </div>
        );
      },
    },
    {
      accessorKey: "Action",
      enableHiding: false,
      header: () => <div className="text-right w-[30px]">Action</div>,
      cell: ({ row }) => {
        const handleOpenPDF = () => {
          const newWindow = window.open("", "_blank");
          if (!newWindow) {
            alert(
              "Failed to open a new tab. Please allow popups for this site."
            );
            return;
          }
          newWindow.document.write("<p>Loading PDF...</p>");
          const pdfBlobProvider = (
            <BlobProvider
              document={
                <InventoryPDF
                  title={`Inventaire du ${new Date(
                    row.original.created_at
                  ).toLocaleDateString()}`}
                  inventory={row.original}
                />
              }
            >
              {/* @ts-ignore */}
              {({ blob }) => {
                if (blob) {
                  const blobUrl = URL.createObjectURL(blob);
                  newWindow.location.href = blobUrl; // Redirect the popup to the blob URL
                } else {
                  newWindow.document.write("<p>Failed to load the PDF.</p>");
                }
              }}
            </BlobProvider>
          );
          const container = document.createElement("div");
          document.body.appendChild(container);
          const root = ReactDOM.createRoot(container);
          root.render(pdfBlobProvider);
        };

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <EllipsisVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {!row.original.is_validated && (
                <DropdownMenuItem
                  disabled={row.original.is_validated}
                  onClick={() => {
                    setDialogFor("validate");
                    setInventory(row.original);
                  }}
                >
                  <ArrowDown size={14} className="mr-3 w-4 h-4" />
                  Validé l&apos;inventaire
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={handleOpenPDF}>
                {" "}
                <Printer className="mr-3 w-4 h-4" size={14} />
                Imprimer l&apos;inventaire
              </DropdownMenuItem>
              {!row.original.is_validated && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-red-500 hover:text-red-500"
                    onClick={() => {
                      setDialogFor("delete");
                      setInventory(row.original);
                    }}
                  >
                    {" "}
                    <Trash className="mr-3 w-4 h-4" size={14} />
                    Supprimer l&apos;inventaire
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  return (
    <div className="space-y-5">
      <Backdrop
        sx={{ color: "#8b5cf6", zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={
          salespointStatus == "loading" ||
          statusInventories == "loading" ||
          loading
        }
      >
        <CircularProgress color="inherit" />
      </Backdrop>
      <CardBodyContent>
        <div className="flex justify-between items-center">
          <h3 className="text-base font-semibold">Inventaires</h3>
          <Button
            onClick={() => window.location.assign("/stock/inventory/new")}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            Nouvel un inventaire
          </Button>
        </div>
      </CardBodyContent>
      <div className="shadow border select-none border-neutral-300 rounded-lg bg-white p-5">
        <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-5 gap-4">
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
          <Combobox
            options={[
              { name: "Tous", value: null },
              { name: "Validé", value: true },
              { name: "Non validé", value: false },
            ]}
            getOptionLabel={(option) => `${option.name}`}
            getOptionValue={(option) => `${option.name}`}
            placeholder="Status"
            RightIcon={ChevronDown}
            buttonLabel="Status"
            onValueChange={(el) => setStatus(el)}
            value={status}
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
        </div>
      </div>
      <CardBodyContent>
        <h3>Liste d&apos;inventaire</h3>
        <DataTableDemo
          setTableData={setTable}
          columns={columns}
          searchText={text}
          filterAttributes={["inventory_number"]}
          data={[...inventories]
            ?.sort(
              (a, b) =>
                new Date(a.created_at).getTime() -
                new Date(b.created_at).getTime()
            )
            .map((el, index) => {
              return { ...el, number: index + 1 };
            })}
        >
          <div className="flex items-center flex-col sm:flex-row space-y-3 justify-between py-4">
            <div className="flex gap-3 items-center flex-col sm:flex-row w-full">
              <Input
                placeholder="Filtrer par numero d'inventaire..."
                value={text}
                onChange={(event) => setText(event.target.value)}
                className="max-w-sm"
              />
            </div>
          </div>
        </DataTableDemo>
      </CardBodyContent>
      <Dialog
        open={dialogFor ? true : false}
        onOpenChange={() => setDialogFor(null)}
      >
        {dialogFor == "delete" ? (
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-red-500">
                Supprimer {inventory?.inventory_number}?
              </DialogTitle>
              <DialogDescription>
                Vous etes sur le point de supprimer cet inventaire.
                <p className="text-red-500">
                  NB: cette action est irreversible confirmer pour continuer
                </p>
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogFor(null)}>
                Annuler
              </Button>
              <Button
                variant={"default"}
                className="bg-green-500 hover:bg-green-600 transition"
                onClick={handleDeleteInventory}
                disabled={loading}
              >
                {loading ? "Veuillez patienter..." : "Supprimer"}
              </Button>
            </DialogFooter>
          </DialogContent>
        ) : (
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Valider {inventory?.inventory_number}?</DialogTitle>
              <DialogDescription>
                Vous etes sur le point de valider cet inventaire.
                <p className="text-red-600">
                  NB: cette action est irreversible confirmer pour continuer.
                </p>
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogFor(null)}>
                Annuler
              </Button>
              <Button
                variant={"default"}
                className="bg-green-500 hover:bg-green-600 transition"
                onClick={handleValidateInventory}
                disabled={loading}
              >
                {loading ? "Veuillez patienter..." : "Valider"}
              </Button>{" "}
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}
