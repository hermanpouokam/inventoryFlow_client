import {
  getAllProducts,
  getUserCustomers,
  updateBill,
  } from "@/components/fetch";
import { toast } from "@/components/ui/app-toast";
import {
  Autocomplete,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  TextField,
  } from "@mui/material";
import React from "react";
import { transformVariants } from "../newsell/functions";
import { ColumnDef } from "@tanstack/react-table";
import {
  ArrowUpDown,
  ChevronDown,
  Edit,
  EllipsisVertical,
  Save,
  Trash,
  X,
  Check,
  XCircle,
  CheckCircle,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { DataTableDemo } from "@/components/TableComponent";
import { Input } from "@/components/ui/input";
import { transformProductBills } from "./functions";
import CardBodyContent from "@/components/CardContent";
import { useTranslation } from "react-i18next";

interface PropsParams {
  bill: Bill;
  setClose: () => void;
}

export default function BillDetails({ bill, setClose }: PropsParams) {
  const { t } = useTranslation("common");
  const [date, setDate] = React.useState<Date>(new Date());
  const [age, setAge] = React.useState<SellPrice | null>(null);
  const handleChange = (event: SelectChangeEvent, product: Product) => {
    setAge(product.sell_prices.find(sp => sp.id === event.target.value) ?? null);
  };
  const [table, setTable] = React.useState<any | null>(null);
  const [data, setData] = React.useState<InvoiceProduct[]>(
    transformProductBills(bill.product_bills)
  );
  const [products, setProducts] = React.useState<Product[]>([]);
  const [product, setProduct] = React.useState<Product | null>(null);
  const [oldQty, setOldQty] = React.useState<number>(0);
  const [quantity, setQuantity] = React.useState<number | null | string>("");
  const [record, setRecord] = React.useState<number | null>(0);
  const [loading, setLoading] = React.useState(false);
  const qtyRef = React.useRef(null);

  React.useEffect(() => {
    const getData = async () => {
      try {
        const allProduct = await getAllProducts();
        setProducts(transformVariants(allProduct));
        const data = await getUserCustomers();
      } catch (error) {
        console.log(error);
      }
    };
    getData();
  }, []);

  const onChange = (event: any, newValue: Product) => {
    setProduct(newValue);
  };
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
      header: () => <div className="">#</div>,
      cell: ({ row }) => (
        <div className="lowercase">{row.getValue("number")}</div>
      ),
    },
    {
      accessorKey: "code",
      header: () => <div className="text-left">{t("table.columns.code")}</div>,
      cell: ({ row }) => (
        <div className="capitalize">{row.getValue("code")}</div>
      ),
    },
    {
      accessorKey: "article",
      header: ({ column }) => {
        return (
          <div
            className="flex"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            {t("table.columns.article")}
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </div>
        );
      },
      cell: ({ row }) => (
        <div className="capitalize text-left">{row.getValue("article")}</div>
      ),
    },
    {
      accessorKey: "price",
      header: () => <div className="text-right">{t("table.columns.purchase_price")}</div>,
      cell: ({ row }) => {
        const price = parseFloat(row.getValue("price"));

        // Format the amount as a dollar amount
        const formatted = new Intl.NumberFormat("fr-FR", {
          style: "currency",
          currency: "XAF",
        }).format(price);

        return <div className="text-right font-medium">{formatted}</div>;
      },
    },
    {
      accessorKey: "sellPrice",
      header: () => <div className="text-right">{t("table.columns.sell_price")}</div>,
      cell: ({ row }) => {
        const sellPrice = parseFloat(row.getValue("sellPrice"));

        // Format the amount as a dollar amount
        const formatted = new Intl.NumberFormat("fr-FR", {
          style: "currency",
          currency: "XAF",
        }).format(sellPrice);

        return <div className="text-right font-medium">{formatted}</div>;
      },
      footer: () => <div className="text-right">{t("table.columns.total")}</div>,
    },
    {
      accessorKey: "quantity",
      header: ({ column }) => {
        return (
          <div
            className="flex justify-center"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            <span>{t("table.columns.quantity")}</span>
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </div>
        );
      },
      cell: ({ row }) => (
        <div className="capitalize text-center">{row.getValue("quantity")}</div>
      ),
      footer: () => (
        <div className="text-center">
          {data.reduce(
            (acc, curr) => (acc = parseFloat(acc) + curr.quantity),
            0
          )}
        </div>
      ),
    },
    {
      accessorKey: "total",
      header: () => <div className="text-right">{t("table.columns.total")}</div>,
      cell: ({ row }) => {
        const total = parseFloat(row.getValue("total"));

        // Format the amount as a dollar amount
        const formatted = new Intl.NumberFormat("fr-FR", {
          style: "currency",
          currency: "XAF",
        }).format(total);

        return <div className="text-right font-medium">{formatted}</div>;
      },
      footer: () => {
        const total = data.reduce((acc, curr) => (acc = acc + curr.total), 0);

        // Format the amount as a dollar amount
        const formatted = new Intl.NumberFormat("fr-FR", {
          style: "currency",
          currency: "XAF",
        }).format(total);

        return <div className="text-right">{formatted}</div>;
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
                <span className="sr-only">{t("table.actions.open_menu")}</span>
                <EllipsisVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="z-[999999]" align="end">
              <DropdownMenuLabel>{t("table.actions.label")}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  console.log(payment)
                  const prod = products.find(
                    (pr) =>
                      `${pr?.product_code}${pr?.name}` ==
                      `${payment.code}${payment.article}`
                  )
                  setProduct(prod);
                  setQuantity(payment.quantity);
                  setOldQty(payment.quantity);
                  setData((prev) => {
                    return prev.filter((it) => it.article != payment.article);
                  })
                  setAge(prod?.sell_prices.find(sp => sp.id === payment.sell_price))
                  if (prod?.is_beer) {
                    setRecord(payment.recorded_packaging)
                  }
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

  const handleAddData = () => {
    const qte = oldQty - quantity;
    if (quantity && product && qte < 0 && -qte > product?.quantity) {
      toast({
        title: t("error"),
        description: t("newsell.errors.insufficient_stock", { product: product?.name }),
        variant: "destructive",
        icon: <XCircle className="size-4" />,
      });
      return;
    }
    if (!age) {
      return toast({
        title: t("error"),
        description: t("newsell.errors.select_sell_price"),
        variant: "destructive",
        icon: <XCircle className="size-4" />,
      });
    }
    if (quantity && Number(quantity) < 1) {
      return;
    }
    if (
      data.find(
        (pr) =>
          `${pr?.code}${pr?.article}` ==
          `${product?.product_code}${product?.name}`
      )
    ) {
      return
    }
    setData((prev) => {
      if (prev.find((pr) => `${pr?.code}${pr?.article}` ==
        `${product?.product_code}${product?.name}`)) return

      if (product) {
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
            package: record,
            sellPrice: product?.sell_prices.find((s) => s.id == age.id)?.price,
            sell_price: age.id,
            total:
              Number(quantity) *
              Number(product?.sell_prices.find((s) => s.id == age)?.price ?? 0),
            is_variant: product.is_variant,
          },
        ];
      }
    });
    setQuantity("");
    setProduct(null);
    setAge(null);
  };

  const handleUpdateInvoice = async () => {
    setLoading(true);
    try {
      const dataBill = {
        customer: bill.customer,
        customer_name: bill.customer_name ?? "",
        sales_point: bill.sales_point,
        product_bills: data.map((obj) => {
          if (obj.is_variant) {
            return {
              product: obj.id,
              variant_id: obj.variant_id,
              sell_price: obj.sell_price,
              quantity: Number(obj.quantity),
              is_variant: true,
              record_package: Number(obj.package ?? 0),
            };
          } else {
            return {
              product: obj.id,
              sell_price: obj.sell_price,
              quantity: Number(obj.quantity),
              variant_id: null,
              record_package: Number(obj.package ?? 0),
              is_variant: false,
            };
          }
        }),
      };
      const response = await updateBill(dataBill, bill.id);
      if (response) {
        setClose();
        toast({
          title: t("success"),
          description: t("invoice.success.updated"),
          variant: "success",
          icon: <CheckCircle className="size-4" />,
        });
        setTimeout(() => {
          window.location.reload();
        }, 2500);
      }
      setLoading(false);
    } catch (error) {
      console.log(error);
      setLoading(false);
      toast({
        title: t("error"),
        description: t("errors.check_connection"),
        variant: "destructive",
        icon: <XCircle className="size-4" />,
      });
    }
  };

  return (
    <div className="w-full h-full flex justify-center items-center">
      {loading && (
        <div className="absolute h-full top-0 right-0 z-[999] bg-transparent w-full" />
      )}
      <CardBodyContent className="bg-background pt-5">
        <CardBodyContent
          className={
            "select-none p-5 rounded-lg bg-card space-y-5"
          }
        >
          <div>
            <h2 className="">{bill.bill_number}</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4">
            <TextField
              name="customer-name"
              fullWidth
              size="small"
              disabled
              id="outlined-basic"
              value={
                bill.customer_name != ""
                  ? bill.customer_name
                  : `${bill.customer_details.name} ${bill.customer_details.surname}`
              }
              label={t("newsell.customer_name")}
              variant="outlined"
            />
            <TextField
              name="command_number"
              fullWidth
              value={bill.bill_number}
              size="small"
              id="outlined-basic"
              label={t("newsell.order_number")}
              variant="outlined"
            />
            {/* <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant={"outline"}
                                className={cn(
                                    "w-full justify-start text-left font-normal",
                                    !date && "text-muted-foreground"
                                )}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {date ? <span>{moment(date).format('DD/MM/YYYY')}</span> : <span>Pick a date</span>}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-full p-0">
                            <Calendar
                                mode="single"
                                
                                selected={date}
                                //@ts-ignore
                                onSelect={setDate}
                                initialFocus
                            />
                        </PopoverContent>
                    </Popover> */}
          </div>
        </CardBodyContent>
        <form action={handleAddData}>
          <CardBodyContent
            className={
              "shadow border mt-5 select-none rounded-lg  p-5"
            }
          >
            <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-6 lg:grid-cols-6 gap-4">
              <Autocomplete
                size="small"
                required
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
                id="combo-box-demo"
                options={products}
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
                size="small"
                value={product?.price ?? ""}
                id="outlined-basic"
                label={t("newsell.purchase_price")}
                variant="outlined"
              />
              <TextField
                fullWidth
                required
                size="small"
                value={product?.quantity ?? ""}
                id="outlined-basic"
                label={t("newsell.stock")}
                variant="outlined"
              />
              <TextField
                required
                fullWidth
                size="small"
                type="number"
                onChange={(e) => setQuantity(parseInt(e.target.value))}
                id="outlined-basic"
                label={t("newsell.quantity")}
                error={quantity && quantity < 1 ? true : false}
                helperText={
                  quantity && quantity < 1 && quantity != ""
                    ? t("newsell.valid_quantity_error")
                    : null
                }
                value={quantity}
                inputRef={qtyRef}
                name="quantity"
                variant="outlined"
              />
              {product?.is_beer && (
                <TextField
                  required={product?.is_beer}
                  fullWidth
                  size="small"
                  type="number"
                  onChange={(e) => setRecord(Number(e.target.value))}
                  label={t("newsell.deposit_packaging")}
                  error={record && record < 0 ? true : false}
                  helperText={
                    record && record < 0 ? t("newsell.valid_quantity_error") : null
                  }
                  value={record}
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
                  value={String(age?.id)}
                  label={t("newsell.sell_price")}
                  onChange={(e) => handleChange(e, product)}
                >
                  {product ? (
                    [...product.sell_prices]
                      .sort((a, b) => a.price - b.price)
                      .map((sell) => (
                        <MenuItem key={sell.id} value={sell.id}>
                          {sell.price}
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
                disabled={!age}
              >
                {t("newsell.add")}
              </Button>
            </div>
          </CardBodyContent>
        </form>
        <CardBodyContent
          className={
            "shadow border mt-5 select-none p-5"
          }
        >
          <DataTableDemo
            filterAttributes={["article"]}
            searchText={""}
            setTableData={setTable}
            columns={columns}
            data={data}
          >
            <div className="flex flex-wrap gap-2 items-center justify-between py-4">
              <div className="flex flex-wrap space-x-5">
                <Input
                  placeholder={t("article_filter_placeholder")}
                  value={
                    (table?.getColumn("article")?.getFilterValue() as string) ??
                    ""
                  }
                  onChange={(event) =>
                    table
                      ?.getColumn("article")
                      ?.setFilterValue(event.target.value)
                  }
                  className="max-w-sm"
                />
              </div>
              <div className="flex justify-center items-center">
                {/* <Button variant='outline'

                                onClick={handleGeneratePDF}
                                className="h-12 w-12 p-0 border-red-600 text-red-600 hover:text-white hover:bg-red-600 ">
                                <span className="sr-only">{t("table.actions.open_menu")}</span>
                                <PrinterIcon className="h-4 w-4" />
                            </Button> */}
                <Button
                  disabled={data?.length < 1 || loading}
                  onClick={handleUpdateInvoice}
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
                  <span className="">{t("invoice.actions.save")}</span>
                </Button>
              </div>
            </div>
          </DataTableDemo>
        </CardBodyContent>
        <div className="flex sm:justify-end mt-2">
          <Button
            onClick={() => setClose()}
            type="button"
            variant="destructive"
          >{t("close")}</Button>
        </div>
      </CardBodyContent>
    </div>
  );
}
