"use client";
import CardBodyContent from "@/components/CardContent";
import { Combobox } from "@/components/ComboBox";
import NumericTextField from "@/components/NumericInput";
import { Button } from "@/components/ui/button";
import { fetchProducts } from "@/redux/productsSlicer";
import { fetchSalesPoints } from "@/redux/salesPointsSlicer";
import { AppDispatch, RootState } from "@/redux/store";
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
import { DataTableDemo } from "@/components/TableComponent";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { transformVariants } from "@/app/(admin)/sell/newsell/functions";
import { createInventory } from "../functions";

interface InventoryProduct {
  id?: number;
  article?: string;
  variant_id?: number | null;
  product_id?: number;
  code?: string;
  number: number;
  quantity: number;
  stock?: number;
  diff: number;
  is_variant?: boolean;
  is_beer?: boolean;
}

export default function Page() {
  const dispatch: AppDispatch = useDispatch();
  const [salespoint, setSalespoint] = React.useState(null);
  const [supplier, setSupplier] = React.useState(null);
  const [data, setData] = React.useState<InventoryProduct[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [selectedProduct, setSelectedProduct] = React.useState<
    ProductVariant | null | undefined
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

  const columns: ColumnDef<InventoryProduct>[] = [
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
      accessorKey: "stock",
      header: () => <div className="text-right w-[100px]">Stock</div>,
      cell: ({ row }) => {
        return (
          <div className="text-right font-medium w-[100px]">
            {row.original.stock}
          </div>
        );
      },
    },
    {
      accessorKey: "quantity",
      header: ({ column }) => {
        return (
          <div
            className="flex justify-center w-[180px]"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            <span>Nouvelle quantité</span>
            {/* <ArrowUpDown className="ml-2 h-4 w-4" /> */}
          </div>
        );
      },
      cell: ({ row }) => (
        <div className="capitalize text-center w-[180px]">
          {row.original.quantity}
        </div>
      ),
      footer: () => (
        <div className="text- center w-[180px]">
          {data.reduce((acc, curr) => (acc = acc + Number(curr.quantity)), 0)}
        </div>
      ),
    },
    {
      accessorKey: "total",
      header: () => <div className="text-right w-[130px]">Différence</div>,
      cell: ({ row }) => {
        const total = parseFloat(row.getValue("total"));
        return (
          <div className="text-right font-medium w-[130px]">
            {row.original.diff}
          </div>
        );
      },
      footer: () => {
        return (
          <div className="text-right w-[130px]">
            {data.reduce((acc, curr) => {
              return (acc += curr.diff);
            }, 0)}
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
    dispatch(
      fetchProducts({
        sales_points: [e.target.value],
      })
    );
    setSalespoint(e.target.value);
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
          quantity: number,
          stock: selectedProduct?.quantity,
          diff: Number(number) - Number(selectedProduct?.quantity),
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

  const handleAddInventory = async () => {
    setLoading(true);
    try {
      const inventoryData = {
        sales_point: salespoint,
        supply_products: data.map((obj: any) => {
          return {
            product: obj.product_id ?? obj.id,
            ...(obj.variant_id ? { variant: obj.variant_id } : {}),
            new_quantity: parseFloat(obj.quantity),
          };
        }),
      };
      const response = await createInventory(inventoryData);
      if (response.status === 201) {
        toast({
          title: "Succès",
          description: `Inventaire créé avec succès`,
          variant: "destructive",
          className: "bg-green-600 border-green-600",
          icon: <Check className="mr-2" />,
        });
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      }
    } catch (error) {
      setLoading(false);
      toast({
        title: "Erreur",
        description: `${error.response.data.error}`,
        variant: "destructive",
        icon: <X className="mr-2" />,
      });
    } finally {
      setLoading(false);
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
        <h3 className="font-medium text-base">Inventaire</h3>
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
        </div>
      </CardBodyContent>
      <form autoComplete="off" action={handleAddProduct}>
        <CardBodyContent className="space-y-5">
          <ul className="px-1 text-sm font-medium text-orange-700">
            <li>
              Vous ne pouvez faire qu&apos;un inventaire par jour de préférence
              le matin.
            </li>
            <li>
              Vous ne pouvez faire un inventaire que si vous n&apos;avez pas
              aucune facture pour la journée.
            </li>
            <li>
              Il vous sera impossible de faire une facture si vous avez un
              inventaire en cours.
            </li>
            <li>
              Les inventaires non validés sont automatique supprimés le
              lendemain
            </li>
          </ul>
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
        <DataTableDemo
          searchText=""
          filterAttributes={["article"]}
          setTableData={setTable}
          columns={columns}
          data={data}
        >
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
                onClick={handleAddInventory}
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
                <span className="">Enregister l&apos;inventaire </span>
              </Button>
            </div>
          </div>
        </DataTableDemo>
      </div>
    </div>
  );
}
