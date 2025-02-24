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
  ChevronDown,
  ChevronsUpDown,
  Edit,
  EllipsisVertical,
  EyeIcon,
  PrinterIcon,
} from "lucide-react";
import { DataTableDemo } from "@/components/TableComponent";
import { ColumnDef } from "@tanstack/react-table";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { fetchProducts } from "@/redux/productsSlicer";
import { calculateTotalAmount, formatteCurrency } from "../functions";
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
import moment from "moment";
import { createPackaging, createProductCat } from "@/components/fetch";
import { fetchPackagings } from "@/redux/packagingsSlicer";

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

  const [salesPoinstdata, setSalesPoint] =
    React.useState<SalesPoint[]>(salespoints);
  const [suppliersData, setSuppliersData] = React.useState<Supplier[]>([]);
  const [selectedSalesPoints, setSelectedSalesPoints] = React.useState<
    number[]
  >([]);
  const [selectedSuppliers, setSelectedSuppliers] = React.useState<number[]>(
    []
  );
  const [open, setOpen] = React.useState(false);

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
    {
      id: "actions",
      header: () => <div className="w-10 text-center">Actions</div>,
      enableHiding: false,
      cell: ({ row }) => {
        const payment = row.original;
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
              <DropdownMenuItem onClick={() => {}}>
                <Edit size={14} className="mr-3" />
                Modifier
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => {}}>
                {" "}
                <EyeIcon className="mr-3" size={14} /> Details
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
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
            className="flex justify-between w-32"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Nom
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </div>
        );
      },
      cell: ({ row }) => {
        const product = row.original;
        return <div className="capitalize">{product.name}</div>;
      },
    },
    {
      accessorKey: "point de vente",
      header: () => <div className="text-center w-32">Point de vente</div>,
      cell: ({ row }) => {
        const product = row.original;
        return (
          <div className="text-center font-medium">
            {product.sales_point_details.name}
          </div>
        );
      },
    },
    {
      accessorKey: "fournisseur",
      header: () => <div className="text-center w-32">Founisseur</div>,
      cell: ({ row }) => {
        const product = row.original;
        return (
          <div className="text-center font-medium">
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
          //@ts-ignore
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

  const filterSuppliers = async (id: number) => {
    const asyncFetch = await dispatch(
      fetchSuppliers({ sales_points_id: [id] })
    );
    if (fetchSuppliers.fulfilled.match(asyncFetch)) {
      setSuppliersData(asyncFetch.payload);
    }
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
        <Button
          variant={"default"}
          onClick={handleClickOpen}
          className=" bg-violet-600 hover:bg-violet-700 text-white"
        >
          Ajouter un emballage
        </Button>
      </CardBodyContent>
      <CardBodyContent className="space-y-4">
        <h4 className="text-base font-semibold">Filtrer les emballages</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
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
                <div className="overflow-hidden max-w-[90%]">
                  {selectedSalesPoints.length > 0
                    ? selectedSalesPoints.length > 1
                      ? selectedSalesPoints.length + " selectionnés"
                      : selectedSalesPoints
                          .map((obj) => {
                            const el = salespoints.find((sp) => sp.id === obj);
                            return `${el?.name} - ${el?.address}`;
                          })
                          .join(", ")
                    : "Point de vente"}
                </div>
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="p-0">
              <Command>
                <CommandInput placeholder="Rechercher par nom ou adresse..." />
                <CommandList>
                  <CommandEmpty>Aucun élément trouvé.</CommandEmpty>
                  <CommandGroup>
                    {salespoints.map((salespoint) => (
                      <CommandItem
                        value={`${salespoint.name} ${salespoint.address}`}
                        key={salespoint.id}
                        onSelect={() => handleSelect(salespoint.id)}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            selectedSalesPoints?.some(
                              (el) => el == salespoint.id
                            )
                              ? "opacity-100"
                              : "opacity-0"
                          )}
                        />
                        {salespoint.name} - {salespoint.address}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                className={cn(
                  "justify-between",
                  selectedSuppliers.length < 1 && "text-muted-foreground"
                )}
              >
                <div className="overflow-hidden">
                  {selectedSuppliers.length > 0
                    ? selectedSuppliers.length > 1
                      ? selectedSuppliers.length + " selectionnés"
                      : selectedSuppliers
                          .map((obj) => {
                            const el = suppliers.find((cat) => cat.id === obj);
                            return `${el?.name}`;
                          })
                          .join(", ")
                    : "Fournisseur"}
                </div>
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="p-0">
              <Command>
                <CommandInput placeholder="Rechercher par nom..." />
                <CommandList>
                  <CommandEmpty>Aucun élément trouvé.</CommandEmpty>
                  <CommandGroup>
                    {suppliers.map((sup) => (
                      <CommandItem
                        value={`${sup.name} ${sup.id}`}
                        key={sup.id}
                        onSelect={() => handleSelectSupplier(sup.id)}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            selectedSuppliers?.some((el) => el == sup.id)
                              ? "opacity-100"
                              : "opacity-0"
                          )}
                        />
                        {sup.name} - {sup.sales_point_details.name}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
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
            <div className="flex space-x-5 space-y-3 flex-col sm:flex-row">
              <Input
                placeholder="Filtrer par articles..."
                value={table?.getColumn("name")?.getFilterValue() as string}
                onChange={(event) =>
                  table?.getColumn("name")?.setFilterValue(event.target.value)
                }
                className="max-w-sm"
              />
              <DropdownMenu>
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
              </DropdownMenu>
            </div>
            <div className="flex justify-center items-center">
              {/* <Button variant='outline' className="h-12 w-12 p-0 border-red-600 text-red-600 hover:text-white hover:bg-red-600 ">
                                <span className="sr-only">Open menu</span>
                                <Trash className="h-4 w-4" />
                            </Button> */}
              <Button
                variant="outline"
                className="px-5 space-x-3 border-green-600 text-green-600 hover:text-white hover:bg-green-600"
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
              if (res.id) {
                toast({
                  variant: "default",
                  className: "border-green-600 bg-green-600 text-white",
                  title: "Succès",
                  description: "Embalage crée avec succès",
                });
              }
              setTimeout(() => {
                window.location.reload();
              }, 3000);
            } catch (error) {
              console.log(error);
            }
          },
        }}
      >
        <DialogTitle>{"Ajouter une catégorie de produit"}</DialogTitle>
        <DialogContent sx={{ maxWidth: 450 }} className="py-3 space-y-3">
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
            helperText="Cette quantité correspond au nombre d'emballe vide avec le quel vous commencerez"
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
