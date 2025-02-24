"use client";
import * as React from "react";
import CardBodyContent from "@/components/CardContent";
import { Button } from "@/components/ui/button";
import { AppDispatch, RootState } from "@/redux/store";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { fetchSalesPoints } from "@/redux/salesPointsSlicer";
import {
  ArrowUpDown,
  ChevronDown,
  Edit,
  EllipsisVertical,
  EyeIcon,
  PrinterIcon,
  X,
} from "lucide-react";
import { fetchProductsCat } from "@/redux/productsCat";
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
import { calculateTotalAmount } from "../functions";
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
import { createProductCat } from "@/components/fetch";
import { BlobProvider } from "@react-pdf/renderer";
import ReactDOM from "react-dom/client";
// import StockPDF from "@/app/pdf/stockPdf";
import SelectPopover from "@/components/SelectPopover";
import StockPDF from "@/app/pdf/stockPdf";
import { encryptParam } from "@/utils/encryptURL";
import { transformVariants } from "../../sell/newsell/functions";

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
    data: productsCat,
    error: productsCatError,
    status: productsCatStatus,
  } = useSelector((state: RootState) => state.productsCat);
  const {
    data: products,
    error: productsError,
    status: productsStatus,
  } = useSelector((state: RootState) => state.products);
  const {
    data: suppliers,
    error: errorSuppliers,
    status: statusSuppliers,
  } = useSelector((state: RootState) => state.suppliers);

  const [selectedSalesPoints, setSelectedSalesPoints] = React.useState<
    number[]
  >([]);
  const [selectedCategories, setSelectedCategories] = React.useState<number[]>(
    []
  );
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
    if (productsCatStatus == "idle") {
      dispatch(fetchProductsCat({}));
    }
    if (productsStatus == "idle") {
      dispatch(fetchProducts({}));
    }
    if (statusSuppliers == "idle") {
      dispatch(fetchSuppliers({}));
    }
  }, [status, productsCatStatus, productsStatus, statusSuppliers, dispatch]);

  const handleSelect = (id: number) => {
    if (selectedSalesPoints.includes(id)) {
      setSelectedSalesPoints(selectedSalesPoints.filter((s) => s != id));
    } else {
      setSelectedSalesPoints((prev) => [...prev, id]);
    }
  };

  React.useEffect(() => {
    dispatch(fetchProductsCat({ sales_points_id: selectedSalesPoints }));
    dispatch(fetchSuppliers({ sales_points_id: selectedSalesPoints }));
    setSelectedCategories([]);
    setSelectedSuppliers([]);
    document.title = "Articles";
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSalesPoints]);

  const handleSelectCategories = (id: number) => {
    if (selectedCategories.includes(id)) {
      setSelectedCategories(selectedCategories.filter((s) => s != id));
    } else {
      setSelectedCategories((prev) => [...prev, id]);
    }
  };

  const handleSelectSupplier = (id: number) => {
    if (selectedSuppliers.includes(id)) {
      setSelectedSuppliers(selectedSuppliers.filter((s) => s != id));
    } else {
      setSelectedSuppliers((prev) => [...prev, id]);
    }
  };

  const columns: ColumnDef<Product>[] = [
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
        const product = row.original;
        const handleNavigate = (planId: number) => {
          try {
            const encryptedId = encryptParam(encodeURI(product.id.toString()));
            window.location.assign(`/stock/articles/${encryptedId}`);
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
              <DropdownMenuItem onClick={() => {}}>
                <Edit size={14} className="mr-3" />
                Modifier
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleNavigate}>
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
      accessorKey: "product_code",
      header: () => <div className="text-left w-24">Code</div>,
      cell: ({ row }) => {
        const product = row.original;
        return <div className="capitalize">{product.product_code}</div>;
      },
    },
    {
      accessorKey: "name",
      header: ({ column }) => {
        return (
          <div
            className="flex w-32"
            // onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Nom du produit
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
      accessorKey: "categorie",
      header: () => <div className="text-center w-28">Categorie</div>,
      cell: ({ row }) => {
        const product = row.original;
        return (
          <div className="text-center font-medium">
            {product.category_details.name}
          </div>
        );
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
      accessorKey: "prix d'achat",
      header: ({ column }) => {
        return (
          <div
            className="flex justify-center w-28"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            <span>Prix d&apos;achat</span>
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </div>
        );
      },
      cell: ({ row }) => {
        const product = row.original;
        return <div className="capitalize text-center">{product.price}</div>;
      },
      footer: () => <div className="text-center">Total</div>,
    },
    {
      accessorKey: "quantité",
      header: ({ column }) => {
        return (
          <div
            className="flex justify-center"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            <span>Quantité</span>
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </div>
        );
      },
      cell: ({ row }) => {
        const product = row.original;
        return (
          <div className="capitalize text-center">{product.total_quantity}</div>
        );
      },
      footer: () => {
        const total = products.reduce((acc, product) => {
          return (acc += product.total_quantity);
        }, 0);
        return <div className="text-center">{total}</div>;
      },
    },
    {
      accessorKey: "total",
      header: () => <div className="text-right w-32">Total</div>,
      cell: ({ row }) => {
        const product = row.original;
        const total = product.total_quantity * parseFloat(product.price);

        const formatted = new Intl.NumberFormat("fr-FR", {
          style: "currency",
          currency: "XAF",
        }).format(total);

        return <div className="text-right font-medium">{formatted}</div>;
      },
      footer: () => {
        const total = calculateTotalAmount(products);
        // Format the amount as a dollar amount
        const formatted = new Intl.NumberFormat("fr-FR", {
          style: "currency",
          currency: "XAF",
        }).format(total);

        return <div className="text-right">{formatted}</div>;
      },
    },
    {
      accessorKey: "variants de produit",
      header: () => <div className="text-center w-32">Variants de produit</div>,
      cell: ({ row }) => {
        const product = row.original;
        return (
          <div className="text-center font-medium">
            {product.with_variant ? "Oui" : "Non"}
          </div>
        );
      },
    },
    {
      accessorKey: "emballages payants",
      header: () => <div className="text-center w-32">Emballages payants</div>,
      cell: ({ row }) => {
        const product = row.original;
        return (
          <div className="text-center font-medium">
            {product.is_beer ? "Oui" : "Non"}
          </div>
        );
      },
    },
    {
      accessorKey: "emballages payants",
      header: () => <div className="text-center w-32">Date de création</div>,
      cell: ({ row }) => {
        const product = row.original;
        return (
          <div className="text-center font-medium">
            {moment(product.created_at).format("DD/MM/YYYY hh:mm")}
          </div>
        );
      },
    },
  ];

  const handleFilterProduct = () => {
    dispatch(
      fetchProducts({
        sales_points: selectedSalesPoints,
        categories: selectedCategories,
        suppliers: selectedSuppliers,
      })
    );
  };

  const handleOpenPDF = () => {
    if (selectedSalesPoints.length != 1) {
      return toast({
        title: "Erreur",
        variant: "destructive",
        description:
          "Sélectionnez un point de vente pour imprimer la fiche de stock",
        className: "bg-red-600 border-red-600",
        icon: <X className="h-4 w-4" />,
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
          <StockPDF
            salespoint={salespoints.find(
              (s) => s.id === selectedSalesPoints[0]
            )}
            //@ts-ignore
            title={`Fiche de stock du ${new Date().toLocaleDateString()} ${
              selectedCategories.length > 0 ||
              (selectedSuppliers.length > 0 ? "filtré par" : "")
            } ${selectedSuppliers.length > 0 ? "fournisseur" : ""} ${
              selectedCategories.length > 0 ? "catégorie" : ""
            }`}
            products={transformVariants(
              products.filter((p) => p.sales_point === selectedSalesPoints[0])
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
          productsStatus == "loading" ||
          statusSuppliers == "loading" ||
          status == "loading"
        }
      >
        <CircularProgress color="inherit" />
      </Backdrop>
      <CardBodyContent className="flex lg:flex-row md:flex-row sm:flex-row flex-col justify-between items-center">
        <h4 className="text-base font-semibold">Stock</h4>
        <div className="grid grid-cols-1 gap-x-4 mt-4 sm:mt-0 sm:grid-cols-2 md:grid-cols-2">
          <Button
            variant={"default"}
            onClick={handleClickOpen}
            className=" bg-violet-600 hover:bg-violet-700 text-white"
          >
            Ajouter une catégorie d&apos;article
          </Button>
          <Button
            variant={"default"}
            onClick={() => window.location.assign("/stock/articles/new")}
            className=" bg-sky-600 hover:bg-sky-700 text-white"
          >
            Ajouter un article
          </Button>
        </div>
      </CardBodyContent>
      <CardBodyContent className="space-y-4">
        <h4 className="text-base font-semibold">Filtrer les articles</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <SelectPopover
            items={salespoints}
            getOptionLabel={(option) => `${option.name} - ${option.address}`}
            selectedItems={selectedSalesPoints.map((s) => {
              const sp = salespoints.find((salespoint) => salespoint.id === s);
              return { ...sp } as SalesPoint;
            })}
            onSelect={(el) => handleSelect(el.id)}
            noItemText="Aucun point de vente"
            placeholder="Point de vente"
            searchPlaceholder="Rechercher un point de vente"
          />
          <SelectPopover
            items={productsCat}
            getOptionLabel={(option) => `${option.name}`}
            onSelect={(el) => handleSelectCategories(el.id)}
            selectedItems={selectedCategories.map((cat) => {
              const category = productsCat.find((el) => el.id === cat);
              return { ...category };
            })}
            noItemText="Aucune categorie de produits"
            placeholder="Categorie de produits"
            searchPlaceholder="Rechercher une categorie"
          />
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
        <h4 className="text-base font-semibold">Liste d&#39;articles</h4>

        <DataTableDemo
          setTableData={setTable}
          columns={columns}
          data={[...products].map((el, index) => {
            return { ...el, number: index + 1 };
          })}
        >
          <div className="flex items-center flex-col sm:flex-row space-y-3 justify-between py-4">
            <div className="flex gap-3 flex-col sm:flex-row">
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
              <Button
                variant="outline"
                onClick={handleOpenPDF}
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
              const res = await createProductCat(formJson);
              handleClose();
              if (res.id) {
                toast({
                  variant: "default",
                  className: "border-green-600 bg-green-600 text-white",
                  title: "Succès",
                  description: "Categorie crée avec succès",
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
              id="demo-simple-select"
              name="sales_point"
              label="Point de vente"
              size="small"
              margin="dense"
            >
              {salespoints.map((s) => (
                <MenuItem key={s.id} value={s.id}>
                  {s.name} - {s.address}
                </MenuItem>
              ))}
            </Select>
          </MuiFormControl>
          <TextField
            size="small"
            required
            margin="dense"
            name="name"
            label="Nom de la catégorie"
            type="text"
            fullWidth
            autoComplete="off"
          />
          <TextField
            size="small"
            required
            margin="dense"
            name="ab_name"
            label="Abbréviation de la catégories"
            type="text"
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
