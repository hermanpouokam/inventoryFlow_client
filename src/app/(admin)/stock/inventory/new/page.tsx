"use client";
import CardBodyContent from "@/components/CardContent";
import {
  Combobox } from "@/components/ComboBox";
import NumericTextField from "@/components/NumericInput";
import { Button } from "@/components/ui/button";
import { fetchProducts } from "@/redux/productsSlicer";
import { fetchSalesPoints } from "@/redux/salesPointsSlicer";
import { AppDispatch,
  RootState } from "@/redux/store";
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
  XCircle,
  CheckCircle,
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
import { toast } from "@/components/ui/app-toast";
import { transformVariants } from "@/app/(admin)/sell/newsell/functions";
import { createInventory } from "../functions";
import { usePermission } from "@/context/PermissionContext";
import { useTranslation } from "react-i18next";

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
  const { t: tCommon } = useTranslation("common");
  const dispatch: AppDispatch = useDispatch();
  const [salespoint, setSalespoint] = React.useState(null);
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
    document.title = tCommon("inventory.new.title");
  }, []);
  const textFieldRef = React.useRef<HTMLInputElement>(null);
  const { hasPermission, isAdmin, user } = usePermission()
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
      header: () => <div className="text-center w-[90px]">{tCommon("bills.columns.code")}</div>,
      cell: ({ row }) => (
        <div className="capitalize text-center w-[90px]">{row.getValue("code")}</div>
      ),
    },
    {
      accessorKey: "article",
      header: ({ column }) => {
        return (
          <div
            className="w-[250px]"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            {tCommon("article")}
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
      header: () => <div className="text-right w-[100px]">{tCommon("stock")}</div>,
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
            <span>{tCommon("inventory.columns.new_quantity")}</span>
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
        <div className="text-center w-[180px]">
          {data.reduce((acc, curr) => (acc = acc + Number(curr.quantity)), 0)}
        </div>
      ),
    },
    {
      accessorKey: "total",
      header: () => <div className="text-right w-[130px]">{tCommon("inventory.columns.difference")}</div>,
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
                  <span className="sr-only">{tCommon("open_menu")}</span>
                  <EllipsisVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>{tCommon("actions")}</DropdownMenuLabel>
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
                  {tCommon("edit")}
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
                  <Trash className="mr-3" size={14} /> {tCommon("delete")}
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
      dispatch(fetchSalesPoints());
    }
    if (!isAdmin()) {
      dispatch(
        fetchProducts({
          sales_points: [user?.sales_point],
        })
      );
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
        title: tCommon("error"),
        description: tCommon("inventory.errors.item_exists"),
        variant: "destructive",
        icon: <XCircle className="size-4" />,
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
        sales_point: isAdmin() ? salespoint : user?.sales_point,
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
          title: tCommon("success"),
          description: tCommon("inventory.success.created"),
          variant: "success",
          icon: <CheckCircle className="size-4" />,
        });
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      }
    } catch (error) {
      setLoading(false);
      toast({
        title: tCommon("error"),
        description: `${error.response.data.error}`,
        variant: "destructive",
        icon: <XCircle className="size-4" />,
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
        <h3 className="font-medium text-base">{tCommon("inventory.title")}</h3>
        {isAdmin() ?
          <div className="grid sm:grid-cols-4 lg:grid-cols-4 md:grid-cols-3 grid-cols-1 gap-5">
            <FormControl required size="small" fullWidth>
              <InputLabel id="demo-simple-select-label">{tCommon("sales_points.singular")}</InputLabel>
              <Select
                labelId="demo-simple-select-label"
                id="demo-simple-select"
                name="sales_point"
                label={tCommon("sales_points.singular")}
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
          : null}
      </CardBodyContent>
      <form autoComplete="off" action={handleAddProduct}>
        <CardBodyContent className="space-y-5">
          <ul className="px-1 text-sm font-medium text-orange-700">
            <li>
              {tCommon("inventory.new.rules.once_per_day")}
            </li>
            <li>
              {tCommon("inventory.new.rules.no_invoice_today")}
            </li>
            <li>
              {tCommon("inventory.new.rules.no_invoice_during_inventory")}
            </li>
            <li>
              {tCommon("inventory.new.rules.unvalidated_deleted")}
            </li>
          </ul>
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 md:grid-cols-3 grid-cols-1 gap-5">
            <Combobox
              options={transformVariants(products)}
              placeholder={tCommon("article_search")}
              buttonLabel={`${tCommon("article")}*`}
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
              label={tCommon("stock")}
            />
            <NumericTextField
              label={tCommon("quantity")}
              value={number}
              required
              ref={textFieldRef}
              //@ts-ignore
              onChange={handleNumberChange}
              size="small"
              errorMessage={tCommon("errors.invalid_character")}
            />
            <Button
              variant={"default"}
              type="submit"
              className="bg-violet-700 hover:bg-violet-600"
            >
              {tCommon("add")}
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
                placeholder={tCommon("article_filter_placeholder")}
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
                    {tCommon("columns")} <ChevronDown className="ml-2 h-4 w-4" />
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
                <span className="">{tCommon("inventory.actions.save")}</span>
              </Button>
            </div>
          </div>
        </DataTableDemo>
      </div>
    </div>
  );
}
