"use client";
import CardBodyContent from "@/components/CardContent";
import { Combobox } from "@/components/ComboBox";
import NumericTextField from "@/components/NumericInput";
import { Button } from "@/components/ui/button";
import { fetchProductsCat } from "@/redux/productsCat";
import { fetchProducts } from "@/redux/productsSlicer";
import { fetchSalesPoints } from "@/redux/salesPointsSlicer";
import { AppDispatch, RootState } from "@/redux/store";
import { fetchSuppliers } from "@/redux/suppliersSlicer";
import {
  Backdrop,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from "@mui/material";
import {
  Check,
  ChevronDown,
  Edit,
  EllipsisVertical,
  Save,
  Trash,
  X,
} from "lucide-react";
import React from "react";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import { transformVariants } from "../../sell/newsell/functions";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ColumnDef } from "@tanstack/react-table";
import { formatteCurrency } from "../../stock/functions";
import { DataTableDemo } from "@/components/TableComponent";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { createSupply } from "@/components/fetch";

export default function Page() {
  const dispatch: AppDispatch = useDispatch();
  const [salespoint, setSalespoint] = React.useState(null);
  const [supplier, setSupplier] = React.useState(null);
  const [data, setData] = React.useState<InvoiceProduct[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [selectedProduct, setSelectedProduct] = React.useState<
    Product | null | undefined
  >(null);
  const [table, setTable] = React.useState<any | null>(null);
  const [number, setNumber] = React.useState<string | number>("");
  const handleNumberChange = (newValue: string) => {
    setNumber(newValue);
  };
  React.useEffect(() => {
    document.title = "Bon de commande";
  }, []);
  const textFieldRef = React.useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const {
    data: salespoints,
    error: errorSalespoints,
    status: statusSalespoint,
  } = useSelector((state: RootState) => state.salesPoints);
  const {
    data: products,
    error: errorProducts,
    status: statusProducts,
  } = useSelector((state: RootState) => state.products);
  const {
    data: suppliers,
    error: errorSupplier,
    status: statusSuppliers,
  } = useSelector((state: RootState) => state.suppliers);
  // const {
  //   data: productsCat,
  //   error: productsCatError,
  //   status: productsCatStatus,
  // } = useSelector((state: RootState) => state.productsCat);

  const columns: ColumnDef<Payment>[] = [
    // {
    //     id: "select",
    //     header: ({ table }) => (
    //         <Checkbox
    //             className="ring-white"
    //             checked={
    //                 table.getIsAllPageRowsSelected() ||
    //                 (table.getIsSomePageRowsSelected() && "indeterminate")
    //             }
    //             onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
    //             aria-label="Select all"
    //         />
    //     ),
    //     cell: ({ row }) => (
    //         <Checkbox
    //             checked={row.getIsSelected()}
    //             onCheckedChange={(value) => row.toggleSelected(!!value)}
    //             aria-label="Select row"
    //         />
    //     ),
    //     enableSorting: false,
    //     enableHiding: false,
    // },
    {
      accessorKey: "number",
      header: () => <div className="w-[30px]">#</div>,
      cell: ({ row }) => (
        <div className="lowercase w-[30px]">{row.getValue("number")}</div>
      ),
    },
    {
      accessorKey: "code",
      header: () => <div className="text-left w-[50px]">Code</div>,
      cell: ({ row }) => (
        <div className="capitalize w-[50px]">{row.getValue("code")}</div>
      ),
    },
    {
      accessorKey: "article",
      header: ({ column }) => {
        return (
          <div
            className="flex w-[130px]"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Article
            {/* <ArrowUpDown className="ml-2 h-4 w-4" /> */}
          </div>
        );
      },
      cell: ({ row }) => (
        <div className="capitalize text-left w-[130px]">
          {row.getValue("article")}
        </div>
      ),
    },
    {
      accessorKey: "price",
      header: () => (
        <div className="text-right w-[100px]">Prix d&apos;achat</div>
      ),
      cell: ({ row }) => {
        const price = parseFloat(row.getValue("price"));

        // Format the amount as a dollar amount
        const formatted = new Intl.NumberFormat("fr-FR", {
          style: "currency",
          currency: "XAF",
        }).format(price);

        return (
          <div className="text-right font-medium w-[100px]">{formatted}</div>
        );
      },
    },
    {
      accessorKey: "quantity",
      header: ({ column }) => {
        return (
          <div
            className="flex justify-center w-[100px]"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            <span>Qte</span>
            {/* <ArrowUpDown className="ml-2 h-4 w-4" /> */}
          </div>
        );
      },
      cell: ({ row }) => (
        <div className="capitalize text-center w-[100px]">
          {row.getValue("quantity")}
        </div>
      ),
      footer: () => (
        <div className="text-center w-[130px]">
          {data.reduce((acc, curr) => (acc = acc + Number(curr.quantity)), 0)}
        </div>
      ),
    },
    {
      accessorKey: "total",
      header: () => <div className="text-right w-[130px]">Total</div>,
      cell: ({ row }) => {
        const total = parseFloat(row.getValue("total"));
        return (
          <div className="text-right font-medium w-[130px]">
            {formatteCurrency(total, "XAF", "fr-FR")}
          </div>
        );
      },
      footer: () => {
        const total = data.reduce((acc, curr) => (acc = acc + curr.total), 0);
        return (
          <div className="text-right w-[130px]">
            {formatteCurrency(total, "XAF", "fr-FR")}
          </div>
        );
      },
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const product = row.original;

        return (
          <div className="w-[40px]">
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
                <DropdownMenuItem
                  onClick={() => {
                    setSelectedProduct(
                      transformVariants(products).find(
                        (pr) =>
                          `${pr?.product_code}${pr?.name}` ==
                          `${product.code}${product.article}`
                      )
                    );
                    setNumber(product.quantity);
                    setData((prev) => {
                      return prev.filter((it) => it.article != product.article);
                    });
                  }}
                >
                  <Edit size={14} className="mr-3" />
                  Modifier
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    setData((prev) => {
                      return prev.filter((it) => it.article != product.article);
                    });
                  }}
                  className="text-red-500 hover:text-white hover:bg-red-600 "
                >
                  {" "}
                  <Trash className="mr-3" size={14} /> Supprimer
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ];

  React.useEffect(() => {
    if (statusSalespoint == "idle") {
      dispatch(fetchSalesPoints({}));
    }
  }, [statusSalespoint, dispatch]);

  const handleChangeSalesPoint = (e: any) => {
    dispatch(fetchSuppliers({ sales_points_id: [e.target.value] }));
    dispatch(fetchProductsCat({ sales_points_id: [e.target.value] }));
    setSalespoint(e.target.value);
  };
  const handleChangeSupplier = (e: any) => {
    dispatch(
      fetchProducts({ suppliers: [e.target.value], sales_points: [salespoint] })
    );
    setSupplier(e.target.value);
  };

  const handleAddProduct = (e: any) => {
    if (
      data.find(
        (pr) =>
          `${pr?.code}${pr?.article}` ==
          `${selectedProduct?.product_code}${selectedProduct?.name}`
      )
    ) {
      return toast({
        title: "Erreur",
        description: `Cet article existe déjà`,
        variant: "destructive",
        icon: <X className="mr-2" />,
      });
    }
    setData((prev) => {
      return [
        ...prev,
        {
          id: selectedProduct?.id,
          article: selectedProduct?.name,
          variant_id: selectedProduct?.variant_id,
          product_id: selectedProduct?.product_id,
          code: selectedProduct?.product_code,
          number: prev.length + 1,
          price: selectedProduct?.price,
          quantity: number,
          total: number ? number * selectedProduct?.price : 0,
          is_variant: selectedProduct?.is_variant,
          is_beer: selectedProduct?.is_beer,
        },
      ];
    });
    setNumber("");
    setSelectedProduct(null);
  };

  const handleValueChange = (value: Product | null) => {
    setSelectedProduct(value);
    if (textFieldRef.current) {
      textFieldRef.current.focus();
    }
  };

  const handleAddSupply = async () => {
    setLoading(true);
    try {
      const supplyData = {
        supplier,
        sales_point: salespoint,
        supply_products: data.map((obj: any) => {
          return {
            product: obj.product_id ?? obj.id,
            variant: obj.variant_id ?? null,
            quantity: parseFloat(obj.quantity),
          };
        }),
      };
      const response = await createSupply(supplyData);
      if (response.status === 201) {
        toast({
          title: "Succès",
          description: `Facture créée avec succès`,
          variant: "destructive",
          className: "bg-green-800 border-green-800",
          icon: <Check className="mr-2" />,
        });
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      }
    } catch (error) {
      console.log(error);
      setLoading(false);
      toast({
        title: "Erreur",
        description: `Une erreur inattendu est survenu verifiez votre connexion et réessayez`,
        variant: "destructive",
        icon: <X className="mr-2" />,
      });
    }
  };

  return (
    <div className="space-y-5">
      <Backdrop
        sx={{ color: "#8b5cf6", zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={
          statusProducts == "loading" ||
          statusSalespoint == "loading" ||
          statusSuppliers == "loading" ||
          loading
        }
      >
        <CircularProgress color="inherit" />
      </Backdrop>
      <CardBodyContent className="space-y-5">
        <h3 className="font-medium text-base">Bon de commande</h3>
        <div className="grid sm:grid-cols-4 lg:grid-cols-4 md:grid-cols-3 grid-cols-1 gap-5">
          <FormControl required size="small" fullWidth>
            <InputLabel id="demo-simple-select-label">
              Point de vente
            </InputLabel>
            <Select
              labelId="demo-simple-select-label"
              id="demo-simple-select"
              name="sales_point"
              label="Point de vente"
              disabled={data.length > 0}
              size="small"
              value={salespoint}
              onChange={handleChangeSalesPoint}
            >
              {salespoints.map((s) => (
                <MenuItem key={s.id} value={s.id}>
                  {s.name} - {s.address}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl required size="small" fullWidth>
            <InputLabel id="demo-simple-select-label">Founisseurs</InputLabel>
            <Select
              labelId="demo-simple-select-label"
              id="demo-simple-select"
              name="sales_point"
              label="Fournisseur"
              disabled={data.length > 0}
              size="small"
              value={supplier}
              onChange={handleChangeSupplier}
            >
              {suppliers.map((s) => (
                <MenuItem key={s.id} value={s.id}>
                  {s.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </div>
      </CardBodyContent>
      <form autoComplete="off" action={handleAddProduct}>
        <CardBodyContent className="space-y-5">
          <h2 className="text-red-500 text-base font-medium">
            NB: Pour tout article possedant un emballage assurez vous d&aquos;avoir le
            nombre d&aquos;emballages vides correspondant.
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 md:grid-cols-3 grid-cols-1 gap-5">
            <Combobox
              options={transformVariants(products)}
              placeholder="Rechercher un article..."
              buttonLabel="Article* "
              getOptionLabel={(option) =>
                `${option.product_code} => ${option.name}`
              }
              value={selectedProduct}
              getOptionValue={(option) =>
                `${option.product_code} => ${option.name}`
              }
              onValueChange={handleValueChange}
              RightIcon={ChevronDown}
            />
            <TextField
              size="small"
              value={selectedProduct?.quantity ?? ""}
              label="Stock"
            />
            <TextField
              size="small"
              value={selectedProduct ? Number(selectedProduct.price) : ""}
              label="Prix d'achat"
            />
            <NumericTextField
              label="Quantité"
              value={number}
              required
              ref={textFieldRef}
              //@ts-ignore
              onChange={handleNumberChange}
              size="small"
              errorMessage="Caractère non accepté!"
            />
            <Button
              variant={"default"}
              type="submit"
              className="bg-violet-700 hover:bg-violet-600"
            >
              {" "}
              Ajouter
            </Button>
          </div>
        </CardBodyContent>
      </form>
      <div
        className={
          "shadow border mt-5 select-none border-neutral-300 rounded-lg bg-white p-5"
        }
      >
        <DataTableDemo setTableData={setTable} columns={columns} data={data}>
          <div className="flex items-center justify-between py-4">
            <div className="flex space-x-5">
              <Input
                placeholder="Filtrer par articles..."
                value={table?.getColumn("article")?.getFilterValue() as string}
                onChange={(event) =>
                  table
                    ?.getColumn("article")
                    ?.setFilterValue(event.target.value)
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
                disabled={data.length < 1 || loading}
                onClick={handleAddSupply}
                variant="outline"
                className="px-5 space-x-3 border-green-600 text-green-600 hover:text-white hover:bg-green-600"
              >
                {loading ? (
                  <>
                    <CircularProgress size={14} color="inherit" />
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                  </>
                )}
                <span className="">Enregister le bon </span>
              </Button>
            </div>
          </div>
        </DataTableDemo>
      </div>
    </div>
  );
}
