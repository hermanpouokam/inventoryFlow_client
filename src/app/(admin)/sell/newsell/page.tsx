//@ts-nocheck
"use client";
import * as React from "react";
import {
  Check,
  CheckCircle,
  ChevronDown,
  CircleAlert,
  Edit,
  EllipsisVertical,
  InfoIcon,
  Save,
  Trash,
  X,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTableDemo } from "@/components/TableComponent";
import {
  DropdownMenu,
  DropdownMenuTrigger,
} from "@radix-ui/react-dropdown-menu";
import {
  Backdrop,
  CircularProgress,
  DialogActions,
  DialogContentText,
  TextField,
  Dialog as MuiDialog,
  DialogContent as MuiDialogContent,
  DialogTitle as MuiDialogTitle,
  Button as MuiButton,
  Autocomplete,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Checkbox,
  ListItemText,
  OutlinedInput,
} from "@mui/material";
import {
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { ColumnDef } from "@tanstack/react-table";
import { Input } from "@/components/ui/input";
import { createBill } from "@/components/fetch";
import { transformVariants } from "./functions";
import { toast } from "@/components/ui/app-toast";
import { AppDispatch, RootState } from "@/redux/store";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { fetchClients } from "@/redux/clients";
import { fetchProducts } from "@/redux/productsSlicer";
import { fetchSalesPoints } from "@/redux/salesPointsSlicer";
import { fetchAdditionalFees } from "@/redux/additionalFeesSlicer";
import { formatteCurrency } from "../../stock/functions";
import { instance } from "@/components/fetch";
import { usePermission } from "@/context/PermissionContext";
import CardBodyContent from "@/components/CardContent";
import { useTranslation } from "react-i18next";

export default function Page() {
  const dispatch: AppDispatch = useDispatch();

  const [date, setDate] = React.useState<Date>(new Date());
  const [age, setAge] = React.useState<SellPrice | null>(null);
  const [table, setTable] = React.useState<any | null>(null);
  const [data, setData] = React.useState<InvoiceProduct[]>([]);
  const [product, setProduct] = React.useState<Product | null | undefined>(
    null
  );
  const [customer, setCustomer] = React.useState<Customer | null>(null);
  const [quantity, setQuantity] = React.useState<number | null | string>("");
  const [loading, setLoading] = React.useState(false);
  const [packageQty, setPackage] = React.useState(0);
  const [name, setName] = React.useState("");
  const [open, setOpen] = React.useState(false);
  const textFieldRef = React.useRef<HTMLInputElement>(null);
  const { user, isAdmin } = usePermission()
  const [customerPrices, setCustomerPrices] = React.useState<
    ClientProductPrice[]
  >([]);
  const [salespoint, setSalespoint] = React.useState(null);
  const [selectedFeeIds, setSelectedFeeIds] = React.useState<number[]>([]);
  const { t } = useTranslation("common")

  const {
    data: products,
    error: errorProducts,
    status: statusProducts,
  } = useSelector((state: RootState) => state.products);
  const {
    data: customers,
    error: errorCustomers,
    status: statusCustomers,
  } = useSelector((state: RootState) => state.clients);
  const {
    data: salespoints,
    error: errorSalespoints,
    status: statusSalespoint,
  } = useSelector((state: RootState) => state.salesPoints);
  const {
    additionalFees,
    status: statusAdditionalFees,
  } = useSelector((state: RootState) => state.additionalFees);

  React.useEffect(() => {
    if (statusCustomers == "idle" && !isAdmin()) {
      dispatch(fetchClients({ sales_points: [user?.sales_point] }));
    }
    if (statusProducts == "idle" && !isAdmin()) {
      dispatch(fetchProducts({ sales_points: [user?.sales_point] }));
    }
    if (statusSalespoint == "idle") {
      dispatch(fetchSalesPoints());
    }
    if (statusAdditionalFees == "idle" && !isAdmin()) {
      dispatch(fetchAdditionalFees({ sales_point: [user?.sales_point] }));
    }
  }, [statusCustomers, statusProducts, statusSalespoint, statusAdditionalFees, dispatch]);

  // Frais applicables aux factures (opt-in), pour le point de vente sélectionné
  const billFeeOptions = React.useMemo(
    () =>
      additionalFees.filter(
        (fee) =>
          fee.fee_application === "bill" &&
          fee.is_active &&
          (salespoint ? fee.sales_point == salespoint : true)
      ),
    [additionalFees, salespoint]
  );

  const handleChange = (event: SelectChangeEvent<SellPrice>) => {
    setAge(JSON.parse(event.target.value as string));
  };

  const onChange = async (event: any, newValue: Product) => {
    setProduct(newValue);
    if (newValue) {
      setAge(
        customerPrices.find((el) => el.article === newValue.product_id)
          ?.price_details ?? null
      );
      if (textFieldRef.current) {
        textFieldRef.current.focus();
      }
    }
  };

  const onChangeCustomer = async (event: any, newValue: Customer) => {
    setCustomer(newValue);
    setProduct(null);
    if (newValue?.id != 0 && newValue) {
      setLoading(true);
      try {
        const response = await instance.get(
          `/client-article-prices/?client_id=${newValue?.id}`
        );
        setCustomerPrices(response.data);
      } catch (error) {
        console.log(error);
      }
      setLoading(false);
    }
  };

  const columns: ColumnDef<Payment>[] = [
    {
      accessorKey: "number",
      header: () => <div className="w-[15px]">#</div>,
      cell: ({ row }) => (
        <div className="lowercase w-[50px]">{row.getValue("number")}</div>
      ),
    },
    {
      accessorKey: "code",
      header: () => <div className="text-left w-[50px]">
        {t("table.columns.code")}
      </div>,
      cell: ({ row }) => (
        <div className="capitalize w-[50px]">{row.getValue("code")}</div>
      ),
    },
    {
      accessorKey: "article",
      header: ({ column }) => {
        return (
          (
            <div className="text-center w-[180px]">
              {t("table.columns.article")}
            </div>
          )
        );
      },
      cell: ({ row }) => (
        <div className="capitalize text-center w-[180px]">
          {row.getValue("article")}
        </div>
      ),
    },
    {
      accessorKey: "price",
      header: () => (
        <div className="text-right w-[90px]">
          {t("table.columns.purchase_price")}
        </div>
      ),
      cell: ({ row }) => {
        const price = parseFloat(row.getValue("price"));

        return (
          <div className="text-right font-medium">
            {formatteCurrency(price, "XAF", "fr-FR")}
          </div>
        );
      },
    },
    {
      accessorKey: "sellPrice",
      header: () => (
        <div className="text-right w-[110px]">
          {t("table.columns.sell_price")}
        </div>
      ),
      cell: ({ row }) => {
        return (
          <div className="text-right font-medium">
            {formatteCurrency(row.original.sellPrice)}
          </div>
        );
      },
      footer: () => (
        <div className="text-right">
          {t("table.columns.total")}
        </div>
      ),
    },
    {
      accessorKey: "quantity",
      header: ({ column }) => {
        return (
          <div
            className="flex justify-center w-[110px]"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            <span>{t("table.columns.quantity")}</span>
          </div>
        );
      },
      cell: ({ row }) => (
        <div className="capitalize text-center">{row.getValue("quantity")}</div>
      ),
      footer: () => (
        <div className="text-center">
          {data.reduce((acc, curr) => (acc = acc + curr.quantity), 0)}
        </div>
      ),
    },
    {
      accessorKey: "package",
      header: ({ column }) => {
        return (
          <div
            className="flex justify-between w-[200px]"
          >
            <span>{t("table.columns.package")}</span>
          </div>
        );
      },
      cell: ({ row }) => {
        const item = row.original;
        return (
          <div className="capitalize text-center">
            {item.is_beer ? row.getValue("package") : "-"}
          </div>
        );
      },
      footer: () => (
        <div className="text-center">
          {data.reduce((acc, curr) => (acc = acc + curr.package), 0)}
        </div>
      ),
    },
    {
      accessorKey: "package_price",
      header: ({ column }) => {
        return (
          <div
            className="flex justify-between w-[200px]"
          >
            <span>{t("table.columns.package_price")}</span>
          </div>
        );
      },
      cell: ({ row }) => {
        const item = row.original;
        return (
          <div className="capitalize text-center">
            {item.is_beer
              ? formatteCurrency(
                Number(item.package_price) ?? 0,
                "XAF",
                "fr-FR"
              )
              : "-"}
          </div>
        );
      },
    },
    {
      accessorKey: "total_package_amount",
      header: ({ column }) => {
        return (
          <div
            className="flex justify-between w-[200px]"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            <span>{t("table.columns.total_package")}</span>
          </div>
        );
      },
      cell: ({ row }) => {
        const item = row.original;
        return (
          <div className="capitalize text-center">
            {item.is_beer
              ? formatteCurrency(
                Number(item.package) * Number(item.package_price) ?? 0,
                "XAF",
                "fr-FR"
              )
              : "-"}
          </div>
        );
      },
      footer: () => {
        const total = data.reduce(
          (acc, curr) => (acc = acc + curr.package_price * curr.package),
          0
        );
        return (
          <div className="text-center">
            {formatteCurrency(total, "XAF", "fr-FR")}
          </div>
        );
      },
    },
    {
      accessorKey: "total",
      header: () => (
        <div className="text-right w-[110px]">
          {t("table.columns.total")}
        </div>
      ),
      cell: ({ row }) => {
        const total = parseFloat(row.getValue("total"));
        return (
          <div className="text-right font-medium">
            {formatteCurrency(total, "XAF", "fr-FR")}
          </div>
        );
      },
      footer: () => {
        const total = data.reduce((acc, curr) => (acc = acc + curr.total), 0);
        return (
          <div className="text-right">
            {formatteCurrency(total, "XAF", "fr-FR")}
          </div>
        );
      },
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const payment = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">
                  {t("table.actions.open_menu")}
                </span>
                <EllipsisVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>
                {t("table.actions.label")}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  setProduct(
                    products.find(
                      (pr) =>
                        `${pr?.product_code}${pr?.name}` ==
                        `${payment.code}${payment.article}`
                    )
                  );
                  setQuantity(payment.quantity);
                  setAge(payment.sell_price);
                  setData((prev) => {
                    return prev.filter((it) => it.article != payment.article);
                  });
                  setPackage(Number(payment.package));
                }}
              >
                <Edit size={14} className="mr-3" />
                {t("table.actions.edit")}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  setData((prev) => {
                    return prev.filter((it) => it.article != payment.article);
                  });
                }}
                className="text-red-500 hover:text-white hover:bg-red-600 "
              >
                {" "}
                <Trash className="mr-3" size={14} /> {t("table.actions.delete")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const handleVerifyCustomerPrice = () => {
    if (quantity && product && Number(quantity) > Number(product?.quantity)) {
      toast({
        title: t("error"),
        description: t("newsell.errors.insufficient_stock", { product: product?.name }),
        variant: "destructive",
        icon: <XCircle className="size-4" />,
      });
      return;
    }
    if (quantity && Number(quantity) < 1) {
      return;
    }
    if (quantity && Number(quantity) < 1) {
      return;
    }
    if (product?.is_beer && packageQty < 1) {
      toast({
        title: t("warning"),
        description: t("newsell.errors.missing_packaging", { product: product?.name }),
        variant: "warning",
        icon: <CircleAlert className="size-4" />,
      });
    }
    if (product?.is_beer && packageQty > Number(quantity)) {
      return toast({
        title: t("error"),
        description: t("newsell.errors.invalid_packaging_quantity"),
        variant: "destructive",
        icon: <XCircle className="size-4" />,
      });
    }
    if (
      data.find(
        (pr) =>
          `${pr?.code}${pr?.article}` ==
          `${product?.product_code}${product?.name}`
      )
    ) {
      return toast({
        title: t("error"),
        description: t("inventory.errors.item_exists"),
        variant: "destructive",
        icon: <XCircle className="size-4" />,
      });
    }
    if (
      customer?.id != 0 &&
      !customerPrices.find(
        (el) => el.client == customer?.id && el.article == product?.product_id
      )
    ) {
      setOpen(true);
    } else {
      return handleAddData();
    }
  };

  const handleAddPrice = async () => {
    try {
      setLoading(true);
      setOpen(false);
      const response = await instance.post("/add-client-article-price/", {
        client_id: customer?.id,
        article_id: product?.id,
        price_id: age?.id,
      });
      const res = await instance.get(
        `/client-article-prices/?client_id=${customer?.id}`
      );
      setCustomerPrices(res.data);
      if (response.status == 201) {
        toast({
          title: t("success"),
          description: t("newsell.success.price_added"),
          variant: "success",
          icon: <CheckCircle className="size-4" />,
        });
      } else {
        toast({
          title: t("error"),
          description: t("errors.retry"),
          variant: "destructive",
          icon: <XCircle className="size-4" />,
        });
      }
      setLoading(false);
      handleAddData();
    } catch (error) {
      console.log(error);
    }
  };

  const handleAddData = () => {
    if (!product) return
    setData((prev) => {
      return [
        ...prev,
        {
          id: product?.id,
          article: product?.name,
          variant_id: product?.variant_id,
          product_id: product?.product_id,
          code: product?.product_code,
          number: prev.length + 1,
          price: product?.price,
          quantity: quantity,
          sellPrice: age?.price,
          sell_price: age,
          total: Number(quantity) * Number(age?.price),
          is_variant: product?.is_variant,
          package: packageQty,
          package_price: product?.package_details?.price,
          is_beer: product?.is_beer,
        },
      ];
    });
    setOpen(false);
    setQuantity("");
    setProduct(null);
    setPackage(0);
    setAge(null);
  };

  React.useEffect(() => {
    document.title = t("newsell.new_invoice");
  }, []);

  const handleChangeSalesPoint = (e: any) => {
    dispatch(fetchClients({ sales_points: [e.target.value] }));
    dispatch(fetchProducts({ sales_points: [e.target.value] }));
    dispatch(fetchAdditionalFees({ sales_point: [e.target.value] }));
    setSalespoint(e.target.value);
    setSelectedFeeIds([]);
  };

  const handleChangeFees = (event: SelectChangeEvent<number[]>) => {
    const { value } = event.target;
    setSelectedFeeIds(
      typeof value === "string"
        ? value.split(",").map(Number)
        : (value as number[])
    );
  };

  const handleAddInvoice = async () => {
    setLoading(true);

    try {
      const dataBill = {
        customer: customer?.id == 0 ? null : customer?.id,
        customer_name:
          customer?.id == 0
            ? name.length > 1
              ? name
              : t("invoice_response.default_customer")
            : "",
        delivery_date: date,
        sales_point: salespoint,
        state: "created",
        applied_fee_ids: selectedFeeIds,

        product_bills: data.map((obj: any) => {
          if (obj.is_variant) {
            return {
              product: obj.product_id,
              variant_id: obj.variant_id,
              sell_price: obj.sell_price.id,
              quantity: parseFloat(obj.quantity),
              is_variant: true,
              record_package: obj.package,
            };
          } else {
            return {
              product: obj.id,
              sell_price: obj.sell_price.id,
              quantity: parseFloat(obj.quantity),
              variant_id: null,
              is_variant: false,
              record_package: obj.package,
            };
          }
        }),
      };

      await createBill(dataBill);

      toast({
        title: t("success"),
        description: t("invoice_response.create_success_message"),
        variant: "success",
        icon: <CheckCircle className="size-4" />,
      });

      setTimeout(() => {
        window.location.reload();
      }, 2500);
    } catch (error: any) {
      setLoading(false);

      toast({
        title: t("error"),
        description:
          error?.response?.data?.error ??
          t("invoice_response.unexpected_error"),
        variant: "destructive",
        icon: <XCircle className="size-4" />,
      });
    }
  };

  return (
    <div className="mt-4">
      {loading && (
        <div className="absolute h-full top-0 right-0 z-[999] bg-transparent w-full" />
      )}
      <Backdrop
        sx={{ color: "#8b5cf6", zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={
          statusProducts == "loading" ||
          statusCustomers == "loading" ||
          statusSalespoint == "loading" ||
          loading
        }
      >
        <CircularProgress color="inherit" />
      </Backdrop>
      <CardBodyContent
        className={
          "shadow border select-none rounded-lg p-5"
        }
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {
            isAdmin() ? <FormControl size="small" fullWidth>
              <InputLabel>
                {t("newsell.sales_point")}
              </InputLabel>
              <Select
                labelId="demo-simple-select-label"
                id="demo-simple-select"
                name="sales_point"
                label={t("newsell.sales_point")}
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
            </FormControl> : null
          }
          <Autocomplete
            size="small"
            fullWidth
            disabled={customer && data.length > 0}
            required
            disablePortal
            id="combo-box-demo"
            options={[{ id: 0, name: t("newsell.misc_customer") }, ...customers]}
            //@ts-ignore
            onChange={onChangeCustomer}
            getOptionLabel={(item) => `${item.name} ${item.surname ?? ""}`}
            renderInput={(params) => (
              <TextField required {...params} label={t("newsell.customer_select")} />
            )}
          />
          <TextField
            required
            name="customer-name"
            fullWidth
            size="small"
            disabled={customer?.id != 0 || (customer && data.length > 0)}
            id="outlined-basic"
            label={t("newsell.customer_name")}
            variant="outlined"
          />
          {billFeeOptions.length > 0 && (
            <FormControl size="small" fullWidth>
              <InputLabel id="additional-fees-label">
                {t("fees.applicable_to_bill")}
              </InputLabel>
              <Select
                labelId="additional-fees-label"
                id="additional-fees-select"
                multiple
                value={selectedFeeIds}
                onChange={handleChangeFees}
                input={<OutlinedInput label={t("fees.applicable_to_bill")} />}
                renderValue={(selected) =>
                  billFeeOptions
                    .filter((fee) => (selected as number[]).includes(fee.id))
                    .map((fee) => fee.name)
                    .join(", ")
                }
              >
                {billFeeOptions.map((fee) => (
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
      <form action={handleVerifyCustomerPrice}>
        <CardBodyContent
          className={
            "shadow border mt-5 select-none rounded-lg  p-5"
          }
        >
          <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            <Autocomplete
              size="small"
              required={true}
              disabled={!customer}
              //@ts-ignore
              onChange={onChange}
              getOptionDisabled={(option) => option.quantity < 1}
              renderOption={(props, option) => {
                const { key, ...optionProps } = props;
                return (
                  <li key={key} {...optionProps}>
                    {`${option.product_code} => ${option.name}`}
                  </li>
                );
              }}
              value={product}
              fullWidth
              disablePortal
              noOptionsText={t("newsell.noproduct")}
              id="combo-box-demo"
              options={transformVariants(products)}
              getOptionLabel={(item) => `${item.name}`}
              renderInput={(params) => (
                <TextField
                  required
                  {...params}
                  label={t("newsell.product_select")}
                />
              )}
            />
            <TextField
              fullWidth
              required
              autoComplete="off"
              size="small"
              value={product ? formatteCurrency(Number(product?.price)) : ""}
              id="outlined-basic"
              label={t("newsell.purchase_price")}
              variant="outlined"
            />
            <TextField
              fullWidth
              autoComplete="off"
              required
              size="small"
              value={product?.quantity ?? ""}
              id="outlined-basic1"
              label={t("newsell.stock")}
              variant="outlined"
            />
            <TextField
              required
              fullWidth
              inputRef={textFieldRef}
              size="small"
              type="number"
              onChange={(e) => setQuantity(parseInt(e.target.value))}
              id="outlined-basic"
              autoComplete="off"
              label={t("newsell.quantity")}
              error={quantity && quantity < 1 ? true : false}
              helperText={
                quantity && quantity < 1 && quantity != ""
                  ? t("newsell.valid_quantity_error")
                  : null
              }
              value={quantity}
              name="quantity"
              variant="outlined"
            />
            {product?.is_beer && (
              <TextField
                required={product?.is_beer}
                fullWidth
                size="small"
                type="number"
                onChange={(e) => setPackage(parseInt(e.target.value))}
                label={t("newsell.deposit_packaging")}
                error={packageQty && packageQty < 1 ? true : false}
                helperText={
                  packageQty && packageQty < 1 && packageQty != ""
                    ? t("newsell.valid_quantity_error")
                    : null
                }
                value={packageQty}
                variant="outlined"
              />
            )}
            <FormControl required size="small" fullWidth>
              <InputLabel id="demo-simple-select-label">
                {t("newsell.sell_price")}
              </InputLabel>
              <Select
                labelId="demo-simple-select-label"
                id="demo-simple-select"
                value={age ? JSON.stringify(age) : ""}
                label={t("newsell.sell_price")}
                onChange={handleChange}
              >
                {product ? (
                  [...product.sell_prices]
                    .sort((a, b) => a.price - b.price)
                    .map((sell) => (
                      <MenuItem key={sell.id} value={JSON.stringify(sell)}>
                        {parseFloat(sell.price)}
                      </MenuItem>
                    ))
                ) : (
                  <MenuItem value="">{t("newsell.product_select")}</MenuItem>
                )}
              </Select>
            </FormControl>
            <Button
              type="submit"
              variant="default"
              className="bg-violet-700 hover:bg-violet-600"
            >
              {t("newsell.add")}
            </Button>
          </div>
        </CardBodyContent>
      </form>
      <CardBodyContent
        className={
          "border mt-5 select-none rounded-lg p-5"
        }
      >
        <DataTableDemo
          setTableData={setTable}
          columns={columns}
          data={data}
        >
          <div className="flex items-center justify-between py-4">
            <div />
            <div className="flex justify-center items-center">
              {/* <Button variant='outline' className="h-12 w-12 p-0 border-red-600 text-red-600 hover:text-white hover:bg-red-600 ">
                                <span className="sr-only">Open menu</span>
                                <Trash className="h-4 w-4" />
                            </Button> */}
              <Button
                disabled={data.length < 1 || loading}
                onClick={handleAddInvoice}
                variant="outline"
                className="px-5 space-x-3 border-green-600 text-green-600 hover:text-white dark:hover:text-background hover:bg-green-600"
              >
                <span className="">{t("newsell.save_invoice")}</span>
              </Button>
            </div>
          </div>
        </DataTableDemo>
      </CardBodyContent>
      <MuiDialog open={open}>
        <MuiDialogTitle>
          {t("newsell.no_price_config", {
            product: product?.name,
          })}        </MuiDialogTitle>
        <MuiDialogContent>
          <DialogContentText>
            {t("newsell.default_price_question", {
              price: age?.price,
              customer: customer?.name,
            })}
          </DialogContentText>
        </MuiDialogContent>
        <DialogActions>
          <MuiButton onClick={handleAddData}>{t("common.no")}</MuiButton>
          <MuiButton onClick={handleAddPrice}>{t("add")}</MuiButton>
        </DialogActions>
      </MuiDialog>
    </div>
  );
}