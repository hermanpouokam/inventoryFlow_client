"use client";
import * as React from "react";
import CardBodyContent from "@/components/CardContent";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { AppDispatch, RootState } from "@/redux/store";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { fetchSalesPoints } from "@/redux/salesPointsSlicer";
import {
  ArrowUpDown,
  Check,
  ChevronsUpDown,
  Edit,
  EllipsisVertical,
  EyeIcon,
  PrinterIcon,
  X,
} from "lucide-react";
import { DataTableDemo } from "@/components/TableComponent";
import { ColumnDef, Row } from "@tanstack/react-table";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatteCurrency } from "../functions";
import { useToast } from "@/components/ui/use-toast";
import {
  Backdrop,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Slide,
  TextField,
  FormControl as MuiFormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { fetchSuppliers } from "@/redux/suppliersSlicer";
import { TransitionProps } from "@mui/material/transitions";
import { createPackaging } from "@/components/fetch";
import { fetchPackagings } from "@/redux/packagingsSlicer";
import StockPackagingsPDF from "@/app/pdf/stockPackagingsPdf";
import { BlobProvider } from "@react-pdf/renderer";
import ReactDOM from "react-dom/client";
import { encryptParam } from "@/utils/encryptURL";
import { usePermission } from "@/context/PermissionContext";
import SelectPopover from "@/components/SelectPopover";

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<any, any>;
  },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export default function Page() {
  const dispatch: AppDispatch = useDispatch();

  const {
    data: salespoints,
    error,
    status,
  } = useSelector((state: RootState) => state.salesPoints);
  const {
    data: packagings,
    error: packagingsError,
    status: packagingsStatus,
  } = useSelector((state: RootState) => state.packagings);
  const {
    data: suppliers,
    error: errorSuppliers,
    status: statusSuppliers,
  } = useSelector((state: RootState) => state.suppliers);

  const [suppliersData, setSuppliersData] = React.useState<Supplier[]>([]);
  const [selectedSalesPoints, setSelectedSalesPoints] = React.useState<
    number[]
  >([]);
  const [selectedSuppliers, setSelectedSuppliers] = React.useState<number[]>(
    []
  );
  const [open, setOpen] = React.useState(false);
  const { hasPermission, user, isAdmin } = usePermission()
  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const [table, setTable] = React.useState<any | null>(null);

  const { toast } = useToast();

  React.useEffect(() => {
    if (status == "idle") {
      dispatch(fetchSalesPoints());
    }
    if (packagingsStatus == "idle") {
      dispatch(fetchPackagings({}));
    }
    if (statusSuppliers == "idle") {
      dispatch(fetchSuppliers({}));
    }
  }, [status, packagingsStatus, statusSuppliers, dispatch]);

  const handleSelect = (id: number) => {
    if (selectedSalesPoints.includes(id)) {
      setSelectedSalesPoints(selectedSalesPoints.filter((s) => s != id));
    } else {
      setSelectedSalesPoints((prev) => [...prev, id]);
    }
  };

  React.useEffect(() => {
    dispatch(fetchSuppliers({ sales_points_id: selectedSalesPoints }));
    setSelectedSuppliers([]);
    document.title = "Emballages";
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSalesPoints]);

  const handleSelectSupplier = (id: number) => {
    if (selectedSuppliers.includes(id)) {
      setSelectedSuppliers(selectedSuppliers.filter((s) => s != id));
    } else {
      setSelectedSuppliers((prev) => [...prev, id]);
    }
  };

  const columns: ColumnDef<Packaging>[] = [
    // {
    //     id: "select",
    //     header: ({ table }) => (
    //         <div className='w-8 flex justify-center items-center'>
    //             <Checkbox
    //                 className="border-slate-400"
    //                 checked={
    //                     table.getIsAllPageRowsSelected() ||
    //                     (table.getIsSomePageRowsSelected() && "indeterminate")
    //                 }
    //                 onCheckedChange={(value: any) => table.toggleAllPageRowsSelected(!!value)}
    //                 aria-label="Select all"
    //             />
    //         </div>
    //     ),
    //     cell: ({ row }) => (
    //         <div className='w-8 flex justify-center items-center'>
    //             <Checkbox
    //                 className="border-slate-400"
    //                 checked={row.getIsSelected()}
    //                 onCheckedChange={(value: any) => row.toggleSelected(!!value)}
    //                 aria-label="Select row"
    //             />
    //         </div>
    //     ),
    //     enableSorting: false,
    //     enableHiding: false,
    // },
    ...(hasPermission('modifiy_packaging') ? [{
      id: "actions",
      header: () => <div className="w-10 text-center">Actions</div>,
      enableHiding: false,
      cell: ({ row }: { row: Row<Packaging> }) => {
        const pk = row.original;
        const handleNavigate = () => {
          try {
            const encryptedId = encryptParam(encodeURI(pk.id.toString()));
            window.location.assign(`/stock/packagings/${encryptedId}`);
          } catch (error) {
            console.log(error);
          }
        };
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <EllipsisVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {/* <DropdownMenuItem onClick={() => { }}>
                <Edit size={14} className="mr-3" />
                Modifier
              </DropdownMenuItem> */}
              <DropdownMenuItem onClick={handleNavigate}>
                {" "}
                <EyeIcon className="mr-3" size={14} /> Details
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    }] : []),
    {
      accessorKey: "number",
      header: () => <div className="w-5 text-center">#</div>,
      cell: ({ row }) => (
        <div className="text-center w-5">{row.getValue("number")}</div>
      ),
    },
    {
      accessorKey: "name",
      header: ({ column }) => {
        return (
          <div
            className="flex justify-center w-[220px]"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Nom
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </div>
        );
      },
      cell: ({ row }) => {
        const product = row.original;
        return (
          <div className="capitalize text-center w-[220px]">{product.name}</div>
        );
      },
    },
    ...(isAdmin() ? [{
      accessorKey: "point de vente",
      header: () => <div className="text-center w-[160px]">Point de vente</div>,
      cell: ({ row }) => {
        const product = row.original;
        return (
          <div className="text-center font-medium w-[160px]">
            {product.sales_point_details.name}
          </div>
        );
      },
    }] : []),
    {
      accessorKey: "fournisseur",
      header: () => <div className="text-center w-[160px]">Founisseur</div>,
      cell: ({ row }) => {
        const product = row.original;
        return (
          <div className="text-center font-medium w-[160px]">
            {product.supplier_details.name}
          </div>
        );
      },
    },
    {
      accessorKey: "prix d'achat",
      header: ({ column }) => {
        return (
          <div
            className="flex justify-between w-28"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            <span>Prix unitaire</span>
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </div>
        );
      },
      cell: ({ row }) => {
        const product = row.original;
        const formatted = new Intl.NumberFormat("fr-FR", {
          currency: "XAF",
          style: "currency",
        }).format(product.price);

        return <div className="capitalize text-center">{formatted}</div>;
      },
      footer: () => <div className="text-center">Total</div>,
    },
    {
      accessorKey: "full",
      header: ({ column }) => {
        return (
          <div
            className="flex justify-center w-36"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            <span>Emballages pleins</span>
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </div>
        );
      },
      cell: ({ row }) => {
        const product = row.original;
        return (
          <div className="capitalize text-center">{product.full_quantity}</div>
        );
      },
      footer: () => {
        const total = packagings.reduce((acc, product) => {
          return (acc += product.full_quantity);
        }, 0);
        return <div className="text-center">{total}</div>;
      },
    },
    {
      accessorKey: "empty",
      header: ({ column }) => {
        return (
          <div
            className="flex justify-between w-36"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            <span>Emballages vides</span>
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </div>
        );
      },
      cell: ({ row }) => {
        const product = row.original;
        return (
          <div className="capitalize text-center">{product.empty_quantity}</div>
        );
      },
      footer: () => {
        const total = packagings.reduce((acc, product) => {
          return (acc += product.empty_quantity);
        }, 0);
        return <div className="text-center">{total}</div>;
      },
    },
    {
      accessorKey: "total_quantity",
      header: ({ column }) => {
        return (
          <div
            className="flex justify-between w-28"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            <span>Total</span>
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </div>
        );
      },
      cell: ({ row }) => {
        const product = row.original;
        return (
          <div className="capitalize text-center">
            {product.empty_quantity + product.full_quantity}
          </div>
        );
      },
      footer: () => {
        const total = packagings.reduce((acc, product) => {
          return (acc += product.empty_quantity + product.full_quantity);
        }, 0);
        return <div className="text-center">{total}</div>;
      },
    },
    {
      accessorKey: "total_amount",
      header: ({ column }) => {
        return (
          <div
            className="flex justify-between w-40"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            <span>Montant total</span>
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </div>
        );
      },
      cell: ({ row }) => {
        const product = row.original;

        return (
          <div className="capitalize text-center">
            {formatteCurrency(
              Number(product.price) *
              (product.empty_quantity + product.full_quantity),
              "XAF",
              "fr-FR"
            )}
          </div>
        );
      },
      footer: () => {
        const total = packagings.reduce((acc, product) => {
          return (acc +=
            (product.empty_quantity + product.full_quantity) *
            Number(product.price));
        }, 0);
        const formatted = new Intl.NumberFormat("fr-FR", {
          style: "currency",
          currency: "XAF",
        }).format(total);

        return <div className="text-center">{formatted}</div>;
      },
    },
  ];

  const handleFilterProduct = () => {
    dispatch(
      fetchPackagings({
        sales_points: selectedSalesPoints,
        suppliers: selectedSuppliers,
      })
    );
  };

  const filterSuppliers = async () => {
    const asyncFetch = await dispatch(
      fetchSuppliers({ sales_points_id: [user?.sales_point] })
    );
    if (fetchSuppliers.fulfilled.match(asyncFetch)) {
      setSuppliersData(asyncFetch.payload);
    }
  };

  React.useEffect(() => {
    if (!isAdmin()) {
      filterSuppliers()
    }
  }, [])


  const handleOpenPDF = () => {
    if (selectedSalesPoints.length != 1 && isAdmin()) {
      return toast({
        title: "Erreur",
        variant: "destructive",
        description:
          "Sélectionnez un point de vente pour imprimer la fiche de stock",
        className: "bg-red-500 border-red-500",
        icon: <X className="mr-2" />,
      });
    }
    const newWindow = window.open("", "_blank");
    if (!newWindow) {
      alert("Failed to open a new tab. Please allow popups for this site.");
      return;
    }
    newWindow.document.write("<p>Loading PDF...</p>");
    const pdfBlobProvider = (
      <BlobProvider
        document={
          <StockPackagingsPDF
            salespoint={isAdmin() ? salespoints.find(
              (s) => s.id === selectedSalesPoints[0]
            ) : user?.sales_point_details}
            //@ts-ignore
            title={`Fiche de stock d'emballage du ${new Date().toLocaleDateString()} ${selectedSuppliers.length > 0 ? "filtré par" : ""
              } ${selectedSuppliers.length > 0 ? "fournisseur" : ""} `}
            packagings={packagings.filter(
              (p) => p.sales_point === (isAdmin() ? selectedSalesPoints[0] : user?.sales_point)
            )}
          />
        }
      >
        {/* @ts-ignore */}
        {({ blob }) => {
          console.log("blob", blob);
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
    <section className="space-y-4">
      <Backdrop
        sx={{ color: "#8b5cf6", zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={
          packagingsStatus == "loading" ||
          statusSuppliers == "loading" ||
          status == "loading"
        }
      >
        <CircularProgress color="inherit" />
      </Backdrop>
      <CardBodyContent className="flex lg:flex-row md:flex-row sm:flex-row flex-col justify-between items-center">
        <h4 className="text-base font-semibold">Emballages</h4>
        {hasPermission('add_packaging') ?
          <Button
            variant={"default"}
            onClick={handleClickOpen}
            className=" bg-green-600 hover:bg-green-700 text-white"
          >
            Ajouter un emballage
          </Button>
          : null
        }
      </CardBodyContent>
      <CardBodyContent className="space-y-4">
        <h4 className="text-base font-semibold">Filtrer les emballages</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {isAdmin() ?
            <SelectPopover
              items={salespoints}
              getOptionLabel={(option) => `${option.name} - ${option.address}`}
              onSelect={(e) => handleSelect(e.id)}
              selectedItems={selectedSalesPoints.map((id) => {
                {
                  const sp = salespoints.find((s) => s.id === id);
                  return { ...sp } as SalesPoint;
                }
              })}
              searchPlaceholder="Points de vente"
              noItemText="Aucun point de vente"
              placeholder="Point de vente"
            />
            :
            null
          }
          <SelectPopover
            items={suppliers}
            getOptionLabel={(option) => `${option.name}`}
            onSelect={(el) => handleSelectSupplier(el.id)}
            selectedItems={selectedSuppliers.map((sup) => {
              const supplier = suppliers.find((el) => el.id === sup);
              return { ...supplier };
            })}
            noItemText="Aucune fournisseur"
            placeholder="Fournisseurs"
            searchPlaceholder="Rechercher un fournisseur"
          />

          <Button
            variant={"default"}
            onClick={handleFilterProduct}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            Rechercher
          </Button>
        </div>
      </CardBodyContent>
      <CardBodyContent>
        <h4 className="text-base font-semibold">Liste d&#39;emballages</h4>

        <DataTableDemo
          setTableData={setTable}
          columns={columns}
          searchText=""
          filterAttributes={["name"]}
          data={[...packagings]
            .sort(
              (a, b) =>
                new Date(a.created_at).getTime() -
                new Date(b.created_at).getTime()
            )
            .map((el, index) => {
              return { ...el, number: index + 1 };
            })}
        >
          <div className="flex items-center flex-col sm:flex-row space-y-3 justify-between py-4">
            <div className="flex gap-3 flex-col sm:flex-row">
              <Input
                placeholder="Filtrer par nom d'emballage..."
                value={table?.getColumn("name")?.getFilterValue() as string}
                onChange={(event) =>
                  table?.getColumn("name")?.setFilterValue(event.target.value)
                }
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
            <div className="flex justify-center items-center">
              {/* <Button variant='outline' className="h-12 w-12 p-0 border-red-600 text-red-600 hover:text-white hover:bg-red-600 ">
                                <span className="sr-only">Open menu</span>
                                <Trash className="h-4 w-4" />
                            </Button> */}
              <Button
                onClick={handleOpenPDF}
                variant="outline"
                className="px-5 space-x-3 border-green-600 text-green-600 transition hover:text-white hover:bg-green-600"
              >
                {
                  <>
                    <PrinterIcon className="h-4 w-4" />
                  </>
                }
                <span className="">Imprimer la fiche</span>
              </Button>
            </div>
          </div>
        </DataTableDemo>
      </CardBodyContent>
      <Dialog
        open={open}
        TransitionComponent={Transition}
        keepMounted
        aria-describedby="alert-dialog-slide-description"
        PaperProps={{
          component: "form",
          onSubmit: async (event: React.FormEvent<HTMLFormElement>) => {
            event.preventDefault();
            try {
              const formData = new FormData(event.currentTarget);
              const formJson = Object.fromEntries((formData as any).entries());
              //@ts-ignore
              const res = await createPackaging(formJson);
              handleClose();
              if (res.status === 201) {
                toast({
                  variant: "default",
                  className: "border-green-600 bg-green-600 text-white",
                  title: "Succès",
                  description: res.data.success ?? "Embalage crée avec succès",
                });
                setTimeout(() => {
                  window.location.reload();
                }, 3000);
              } else {
                toast({
                  variant: "default",
                  className: "border-red-500 bg-red-500 text-white",
                  title: "Erreur",
                  description: res.response.data.error ?? "Une erreur est survenue.",
                });
              }
            } catch (error) {
              console.log(error);
            }
          },
        }}
      >
        <DialogTitle>{"Ajouter un emballage"}</DialogTitle>
        <DialogContent sx={{ maxWidth: 450 }} className="py-3 space-y-3">
          {
            isAdmin() ?
              <MuiFormControl margin="dense" size="small" fullWidth>
                <InputLabel id="demo-simple-select-label">
                  Point de vente
                </InputLabel>
                <Select
                  labelId="demo-simple-select-label"
                  name="sales_point"
                  label="Point de vente"
                  size="small"
                  required
                  onChange={(e) => {
                    //@ts-ignore
                    filterSuppliers(e.target.value);
                  }}
                  margin="dense"
                >
                  {salespoints.map((s) => (
                    <MenuItem key={s.id} value={s.id}>
                      {s.name} - {s.address}
                    </MenuItem>
                  ))}
                </Select>
              </MuiFormControl>
              : null}
          <MuiFormControl margin="dense" size="small" fullWidth>
            <InputLabel id="simple-select-label">Fournisseur</InputLabel>
            <Select
              labelId="simple-select-label"
              name="supplier"
              required
              label="Fournisseur"
              size="small"
              margin="dense"
            >
              {suppliersData.map((s) => (
                <MenuItem key={s.id} value={s.id}>
                  {s.name}
                </MenuItem>
              ))}
            </Select>
          </MuiFormControl>
          <TextField
            size="small"
            required
            margin="dense"
            name="name"
            label="Nom"
            type="text"
            fullWidth
            autoComplete="off"
          />
          <TextField
            size="small"
            required
            margin="dense"
            name="price"
            label="Prix d'achat"
            type="text"
            autoComplete="off"
            fullWidth
          />
          <TextField
            size="small"
            required
            margin="dense"
            helperText={"Cette quantité correspond au nombre d'emballe vide avec le quel vous commencerez. Le montant total sera deduit de votre caisse."}
            name="empty_quantity"
            label="Quantité"
            type="number"
            autoComplete="off"
            fullWidth
          />
        </DialogContent>
        <DialogActions>
          <Button variant={"destructive"} onClick={handleClose}>
            Annuler
          </Button>
          <Button
            type="submit"
            className="bg-green-500 hover:bg-green-600 text-white"
          >
            Ajouter
          </Button>
        </DialogActions>
      </Dialog>
    </section>
  );
}
