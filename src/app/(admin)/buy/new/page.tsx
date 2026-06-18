"use client";
import CardBodyContent from "@/components/CardContent";
import {
  Combobox
} from "@/components/ComboBox";
import NumericTextField from "@/components/NumericInput";
import { Button } from "@/components/ui/button";
import { fetchProductsCat } from "@/redux/productsCat";
import { fetchProducts } from "@/redux/productsSlicer";
import { fetchSalesPoints } from "@/redux/salesPointsSlicer";
import {
  AppDispatch,
  RootState
} from "@/redux/store";
import { fetchSuppliers } from "@/redux/suppliersSlicer";
import { fetchAdditionalFees } from "@/redux/additionalFeesSlicer";
import {
  Backdrop,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Checkbox,
  ListItemText,
  OutlinedInput,
  SelectChangeEvent,
} from "@mui/material";
import {
  Check,
  ChevronDown,
  Edit,
  EllipsisVertical,
  Save,
  Trash,
  X,
  CheckCircle,
  XCircle,
} from "lucide-react";
import React, { useState } from "react";
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
import { toast } from "@/components/ui/app-toast";
import { createSupply } from "@/components/fetch";
import { usePermission } from "@/context/PermissionContext";
import { useTranslation } from "react-i18next";

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
  const [selectedFeeIds, setSelectedFeeIds] = React.useState<number[]>([]);
  const handleNumberChange = (newValue: string) => {
    setNumber(newValue);
  };
  const [text, setText] = useState("")
  const { t, i18n } = useTranslation("common");

  React.useEffect(() => {
    document.title = t("supply.title");
  }, [t]);

  const textFieldRef = React.useRef<HTMLInputElement>(null);

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
  const {
    additionalFees,
    status: statusAdditionalFees,
  } = useSelector((state: RootState) => state.additionalFees);

  const { user, isAdmin, hasPermission } = usePermission()

  // Frais applicables aux achats (opt-in), pour le point de vente sélectionné
  const supplyFeeOptions = React.useMemo(
    () =>
      additionalFees.filter(
        (fee) =>
          fee.fee_application === "supply" &&
          fee.is_active &&
          (isAdmin()
            ? salespoint
              ? fee.sales_point == salespoint
              : true
            : fee.sales_point == user?.sales_point)
      ),
    [additionalFees, salespoint, user]
  );

  const handleChangeFees = (event: SelectChangeEvent<number[]>) => {
    const { value } = event.target;
    setSelectedFeeIds(
      typeof value === "string"
        ? value.split(",").map(Number)
        : (value as number[])
    );
  };

  const columns: ColumnDef<Payment>[] = [
    {
      accessorKey: "number",
      header: () => <div className="w-[30px]">{t("bills.columns.number")}</div>,
      cell: ({ row }) => (
        <div className="w-[30px] lowercase">
          {row.getValue("number")}
        </div>
      ),
    },

    {
      accessorKey: "code",
      header: () => (
        <div className="text-center w-[50px]">
          {t("bills.columns.code")}
        </div>
      ),
      cell: ({ row }) => (
        <div className="w-[100px] text-center capitalize">
          {row.getValue("code")}
        </div>
      ),
    },

    {
      accessorKey: "article",
      header: ({ column }) => (
        <div
          className="text-center w-[240px]"
          onClick={() =>
            column.toggleSorting(column.getIsSorted() === "asc")
          }
        >
          {t("bills.columns.article")}
        </div>
      ),
      cell: ({ row }) => (
        <div className="text-center w-[240px] capitalize">
          {row.getValue("article")}
        </div>
      ),
    },

    {
      accessorKey: "price",
      header: () => (
        <div className="text-center w-[180px]">
          {t("bills.columns.purchase_price")}
        </div>
      ),
      cell: ({ row }) => {
        const price = Number(row.getValue("price"));

        return (
          <div className="text-center font-medium w-[100px]">
            {formatteCurrency(price)}
          </div>
        );
      },
    },

    {
      accessorKey: "quantity",
      header: ({ column }) => (
        <div
          className="flex justify-center w-[100px]"
          onClick={() =>
            column.toggleSorting(column.getIsSorted() === "asc")
          }
        >
          {t("bills.columns.quantity")}
        </div>
      ),
      cell: ({ row }) => (
        <div className="text-center w-[100px]">
          {row.getValue("quantity")}
        </div>
      ),
      footer: () => {
        const totalQty = data.reduce(
          (acc, curr) => acc + Number(curr.quantity),
          0
        );

        return <div className="text-center">{totalQty}</div>;
      },
    },

    {
      accessorKey: "total",
      header: () => (
        <div className="text-center w-[130px]">
          {t("bills.columns.total")}
        </div>
      ),
      cell: ({ row }) => (
        <div className="text-center font-medium w-[130px]">
          {formatteCurrency(Number(row.getValue("total")))}
        </div>
      ),
      footer: () => {
        const total = data.reduce(
          (acc, curr) => acc + Number(curr.total),
          0
        );

        return <div className="text-center">{formatteCurrency(total)}</div>;
      },
    },

    {
      id: "actions",
      enableHiding: false,
      header: () => (
        <div className="w-[100px] text-center">{t("bills.columns.actions")}</div>
      ),
      cell: ({ row }) => {
        const product = row.original;

        return (
          <div className="w-[40px]">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">{t("table.open_menu")}</span>
                  <EllipsisVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end">
                <DropdownMenuLabel>
                  {t("actions.title")}
                </DropdownMenuLabel>

                <DropdownMenuSeparator />

                <DropdownMenuItem
                  onClick={() => {
                    setSelectedProduct(
                      transformVariants(products).find(
                        (pr) =>
                          `${pr?.product_code}${pr?.name}` ===
                          `${product.code}${product.article}`
                      )
                    );

                    setNumber(product.quantity);

                    setData((prev) =>
                      prev.filter(
                        (it) => it.article !== product.article
                      )
                    );
                  }}
                >
                  <Edit size={14} className="mr-3" />
                  {t("actions.edit")}
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={() => {
                    setData((prev) =>
                      prev.filter(
                        (it) => it.article !== product.article
                      )
                    );
                  }}
                  className="text-red-500 hover:text-white hover:bg-red-600"
                >
                  <Trash size={14} className="mr-3" />
                  {t("actions.delete")}
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
    if (!isAdmin() && statusSuppliers == 'idle') {
      dispatch(fetchSuppliers({ sales_points_id: [user?.sales_point] }));
    }
    if (statusAdditionalFees == "idle") {
      dispatch(fetchAdditionalFees({ sales_point: isAdmin() ? (salespoint ? [salespoint] : []) : [user?.sales_point] }));
    }
  }, [statusSalespoint, dispatch]);

  const handleChangeSalesPoint = (e: any) => {
    dispatch(fetchSuppliers({ sales_points_id: [e.target.value] }));
    dispatch(fetchProductsCat({ sales_points_id: [e.target.value] }));
    dispatch(fetchAdditionalFees({ sales_point: [e.target.value] }));
    setSalespoint(e.target.value);
    setSelectedFeeIds([]);
  };
  const handleChangeSupplier = (e: any) => {
    dispatch(
      fetchProducts({ suppliers: [e.target.value], sales_points: isAdmin() ? [salespoint] : [user?.sales_point] })
    );
    setSupplier(e.target.value);
  };

  const handleAddProduct = () => {
    const productKey = `${selectedProduct?.product_code}${selectedProduct?.name}`;

    const exists = data.some(
      (pr) =>
        `${pr?.code}${pr?.article}` === productKey
    );

    if (exists) {
      return toast({
        title: t("common.error"),
        description: t("supply.errors.duplicate_product"),
        variant: "destructive",
        icon: <XCircle className="size-4" />,
      });
    }

    setData((prev) => [
      ...prev,
      {
        id: selectedProduct?.id,
        article: selectedProduct?.name,
        variant_id: selectedProduct?.variant_id,
        product_id: selectedProduct?.product_id,
        code: selectedProduct?.product_code,
        number: prev.length + 1,
        price: selectedProduct?.price,
        quantity: Number(number),
        total: number ? Number(number) * Number(selectedProduct?.price) : 0,
        is_variant: selectedProduct?.is_variant,
        is_beer: selectedProduct?.is_beer,
      },
    ]);

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
        sales_point: isAdmin() ? salespoint : user?.sales_point,
        applied_fee_ids: selectedFeeIds,
        supply_products: data.map((obj) => ({
          product: obj.product_id ?? obj.id,
          variant: obj.variant_id ?? null,
          quantity: Number(obj.quantity),
        })),
      };

      const response = await createSupply(supplyData);

      if (response.status === 201) {
        toast({
          title: t("common.success"),
          description: t("supply.success.created"),
          variant: "success",
          icon: <CheckCircle className="size-4" />,
        });

        setData([]);
        setSupplier(null);
        setSelectedProduct(null);
        setNumber("");
        setSelectedFeeIds([]);
      }
    } catch (error) {
      console.error(error);

      toast({
        title: t("error"),
        description: t("supply.errors.network"),
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
        <h3 className="font-medium text-base">
          {t("supply.title")}
        </h3>

        <div className="grid sm:grid-cols-4 lg:grid-cols-4 md:grid-cols-3 grid-cols-1 gap-5">
          {isAdmin() && (
            <FormControl required size="small" fullWidth>
              <InputLabel>
                {t("supply.sales_point")}
              </InputLabel>

              <Select
                disabled={data.length > 0}
                size="small"
                value={salespoint}
                onChange={handleChangeSalesPoint}
                label={t("supply.sales_point")}
              >
                {salespoints.map((s) => (
                  <MenuItem key={s.id} value={s.id}>
                    {s.name} - {s.address}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}

          <FormControl required size="small" fullWidth>
            <InputLabel>
              {t("supply.supplier")}
            </InputLabel>

            <Select
              disabled={data.length > 0}
              size="small"
              value={supplier}
              onChange={handleChangeSupplier}
              label={t("supply.supplier")}
            >
              {suppliers.map((s) => (
                <MenuItem key={s.id} value={s.id}>
                  {s.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {supplyFeeOptions.length > 0 && (
            <FormControl size="small" fullWidth>
              <InputLabel id="additional-fees-label">
                {t("fees.applicable_to_supply")}
              </InputLabel>

              <Select
                labelId="additional-fees-label"
                id="additional-fees-select"
                multiple
                value={selectedFeeIds}
                onChange={handleChangeFees}
                input={<OutlinedInput label={t("fees.applicable_to_supply")} />}
                renderValue={(selected) =>
                  supplyFeeOptions
                    .filter((fee) => (selected as number[]).includes(fee.id))
                    .map((fee) => fee.name)
                    .join(", ")
                }
              >
                {supplyFeeOptions.map((fee) => (
                  <MenuItem key={fee.id} value={fee.id}>
                    <Checkbox checked={selectedFeeIds.includes(fee.id)} />
                    <ListItemText
                      primary={`${fee.name} (${fee.fee_type === "percentage"
                        ? `${Number(fee.amount)}%`
                        : formatteCurrency(Number(fee.amount), "XAF", "fr-FR")
                        })`}
                    />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
        </div>
      </CardBodyContent>

      <form
        autoComplete="off"
        onSubmit={(e) => {
          e.preventDefault();
          handleAddProduct();
        }}
      >
        <CardBodyContent className="space-y-5">
          <h2 className="text-red-500 text-base font-medium">
            {t("supply.warning")}
          </h2>

          <div className="grid sm:grid-cols-2 lg:grid-cols-5 md:grid-cols-3 grid-cols-1 gap-5">
            <Combobox
              options={transformVariants(products)}
              placeholder={t("supply.search_article")}
              buttonLabel={t("supply.article")}
              getOptionLabel={(option) =>
                `${option.product_code} => ${option.name}`
              }
              getOptionValue={(e) => `${e.id}${e.name}${e.product_code}${e.variant_id}`}
              value={selectedProduct}
              onValueChange={handleValueChange}
              RightIcon={ChevronDown}
            />

            <TextField
              size="small"
              value={selectedProduct?.quantity ?? ""}
              label={t("supply.stock")}
            />

            <TextField
              size="small"
              value={selectedProduct ? Number(selectedProduct.price) : ""}
              label={t("supply.purchase_price")}
            />

            <NumericTextField
              label={t("supply.quantity")}
              value={number}
              required
              ref={textFieldRef}
              onChange={handleNumberChange}
              size="small"
              errorMessage={t("common.invalid_input")}
            />

            <Button
              type="submit"
              className="bg-violet-700 hover:bg-violet-600"
            >
              {t("supply.add")}
            </Button>
          </div>
        </CardBodyContent>
      </form>

      <CardBodyContent className="shadow border mt-5 select-none p-5">
        <DataTableDemo
          filterAttributes={["article"]}
          searchText={text}
          setTableData={setTable}
          columns={columns}
          data={data}
        >
          <div className="flex items-center justify-between py-4">
            <div className="flex space-x-5">
              <Input
                placeholder={t("supply.search_articles")}
                value={text}
                onChange={(event) => setText(event.target.value)
                }
                className="max-w-sm"
              />
            </div>

            <Button
              disabled={data.length < 1 || loading}
              onClick={handleAddSupply}
              className="border-green-600 text-green-600 bg-background hover:bg-green-600 hover:text-white dark:hover:text-background space-x-2"
            >
              {loading ? (
                <CircularProgress size={14} color="inherit" />
              ) : (
                <Save className="h-4 w-4" />
              )}

              <span>{t("supply.save")}</span>
            </Button>
          </div>
        </DataTableDemo>
      </CardBodyContent>
    </div>
  )
}