//@ts-nocheck
"use client";
import * as React from "react";
import {
  Check,
  ChevronDown,
  Edit,
  EllipsisVertical,
  InfoIcon,
  Save,
  Trash,
  X,
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
import { useToast } from "@/components/ui/use-toast";
import { AppDispatch, RootState } from "@/redux/store";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { fetchClients } from "@/redux/clients";
import { fetchProducts } from "@/redux/productsSlicer";
import { fetchSalesPoints } from "@/redux/salesPointsSlicer";
import { formatteCurrency } from "../../stock/functions";
import { instance } from "@/components/fetch";

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
  const { toast } = useToast();
  const [open, setOpen] = React.useState(false);
  const textFieldRef = React.useRef<HTMLInputElement>(null);

  const [customerPrices, setCustomerPrices] = React.useState<
    ClientProductPrice[]
  >([]);
  const [salespoint, setSalespoint] = React.useState(null);

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

  React.useEffect(() => {
    if (statusCustomers == "idle") {
      dispatch(fetchClients({}));
    }
    if (statusProducts == "idle") {
      dispatch(fetchProducts({}));
    }
    if (statusSalespoint == "idle") {
      dispatch(fetchSalesPoints({}));
    }
  }, [statusCustomers, statusProducts, statusSalespoint, dispatch]);

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
      header: () => <div className="w-[50px]">#</div>,
      cell: ({ row }) => (
        <div className="lowercase w-[50px]">{row.getValue("number")}</div>
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
        <div className="text-right w-[90px]">Prix d&apos;achat</div>
      ),
      cell: ({ row }) => {
        const price = parseFloat(row.getValue("price"));

        // Format the amount as a dollar amount

        return (
          <div className="text-right font-medium">
            {formatteCurrency(price, "XAF", "fr-FR")}
          </div>
        );
      },
    },
    {
      accessorKey: "sellPrice",
      header: () => <div className="text-right w-[110px]">Prix de vente</div>,
      cell: ({ row }) => {
        return (
          <div className="text-right font-medium">
            {formatteCurrency(row.original.sellPrice)}
          </div>
        );
      },
      footer: () => <div className="text-right">Total</div>,
    },
    {
      accessorKey: "quantity",
      header: ({ column }) => {
        return (
          <div
            className="flex justify-center w-[110px]"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            <span>Qte</span>
            {/* <ArrowUpDown className="ml-2 h-4 w-4" /> */}
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
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            <span>Emballages à consigner</span>
            {/* <ArrowUpDown className="ml-2 h-4 w-4" /> */}
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
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            <span>Prix de l&apos;emballage</span>
            {/* <ArrowUpDown className="ml-2 h-4 w-4" /> */}
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
      // footer: () => <div className="text-center">{data.reduce((acc, curr) => acc = acc + curr.package, 0)}</div>
    },
    {
      accessorKey: "total_package_amount",
      header: ({ column }) => {
        return (
          <div
            className="flex justify-between w-[200px]"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            <span>Total des emballages</span>
            {/* <ArrowUpDown className="ml-2 h-4 w-4" /> */}
          </div>
        );
      },
      cell: ({ row }) => {
        const item = row.original;
        return (
          <div className="capitalize text-center">
            {item.is_beer
              ? formatteCurrency(
                  Number(item.package) * Number(item.package_price),
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
      header: () => <div className="text-right">Total</div>,
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
                <span className="sr-only">Open menu</span>
                <EllipsisVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
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
                Modifier
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
                <Trash className="mr-3" size={14} /> Supprimer
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
        title: "Erreur",
        description: `Vous n'avez pas assez de ${product?.name} en stock`,
        variant: "destructive",
        icon: <X className="mr-2" />,
      });
      return;
    }
    if (quantity && Number(quantity) < 1) {
      return;
    }
    if (packageQty && packageQty < 1) {
      return;
    }
    if (product?.is_beer && packageQty < 1) {
      toast({
        title: "Attention",
        description: `Vous n'avez pas consigner d'emballage pour ${product?.name}`,
        variant: "destructive",
        className: "bg-yellow-400 border-yellow-400 text-white text-base",
        icon: <InfoIcon className="mr-2" />,
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
        title: "Erreur",
        description: `Cet article existe déja`,
        variant: "destructive",
        icon: <X className="mr-2" />,
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
          title: "Succès",
          description: `Prix ajouter avec succès`,
          variant: "success",
          className: "bg-green-800 border-green-800",
          icon: <Check className="mr-2" />,
        });
      } else {
        toast({
          title: "Erreur",
          description: `Une erreur est survenu veuillez réessayer`,
          variant: "destructive",
          className: "bg-green-800 border-green-800",
          icon: <Check className="mr-2" />,
        });
      }
      setLoading(false);
      handleAddData();
    } catch (error) {
      console.log(error);
    }
  };

  const handleAddData = () => {
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
    document.title = "Nouvelle facture";
  }, []);

  const handleChangeSalesPoint = (e: any) => {
    dispatch(fetchClients({ sales_points: [e.target.value] }));
    dispatch(fetchProducts({ sales_points: [e.target.value] }));
    setSalespoint(e.target.value);
  };

  const handleAddInvoice = async () => {
    setLoading(true);
    try {
      const dataBill = {
        customer: customer?.id == 0 ? null : customer?.id,
        customer_name:
          customer?.id == 0 ? (name.length > 1 ? name : "Client divers") : "",
        delivery_date: date,
        sales_point: salespoint,
        state: "created",
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

      const response = await createBill(dataBill);
      toast({
        title: "Succès",
        description: `Facture créée avec succès`,
        variant: "destructive",
        className: "bg-green-800 border-green-800",
        icon: <Check className="mr-2" />,
      });
      setTimeout(() => {
        window.location.reload();
      }, 2500);
    } catch (error) {
      setLoading(false);
      toast({
        title: "Erreur",
        description: `${
          error.response.data.error ??
          "Une erreur inattendu est survenu verifiez votre connexion et réessayez"
        }`,
        variant: "destructive",
        icon: <X className="mr-2" />,
      });
    }
  };

  return (
    <div>
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
      <div
        className={
          "shadow border select-none border-neutral-300 rounded-lg bg-white p-5"
        }
      >
        {/* <p className='text-muted-foreground text-base font-medium'>NB: si vous ne sélectionner de point de vente la facture sera attribué automatiquement au point de vente du client. En dehors des clients divers.</p> */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4">
          <FormControl size="small" fullWidth>
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
          <Autocomplete
            size="small"
            fullWidth
            disabled={customer && data.length > 0}
            required
            disablePortal
            id="combo-box-demo"
            options={
              salespoint
                ? [{ id: 0, name: "Client", surname: "divers" }, ...customers]
                : []
            }
            //@ts-ignore
            onChange={onChangeCustomer}
            getOptionLabel={(item) => `${item.name} ${item.surname ?? ""}`}
            renderInput={(params) => (
              <TextField required {...params} label="Selectionner un client" />
            )}
          />
          <TextField
            required
            name="customer-name"
            fullWidth
            size="small"
            disabled={customer?.id != 0 || (customer && data.length > 0)}
            id="outlined-basic"
            label="Nom du client"
            variant="outlined"
          />
          <TextField
            required
            name="command_number"
            fullWidth
            size="small"
            id="outlined-basic"
            label="No de commande"
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
      </div>
      <form action={handleVerifyCustomerPrice}>
        <div
          className={
            "shadow border mt-5 select-none border-neutral-300 rounded-lg bg-white p-5"
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
              id="combo-box-demo"
              options={transformVariants(products)}
              getOptionLabel={(item) => `${item.name}`}
              renderInput={(params) => (
                <TextField
                  required
                  {...params}
                  label="Selectionner l'article"
                />
              )}
            />
            <TextField
              fullWidth
              required
              autoComplete="off"
              size="small"
              value={product?.price ?? ""}
              id="outlined-basic"
              label="Prix d'achat"
              variant="outlined"
            />
            <TextField
              fullWidth
              autoComplete="off"
              required
              size="small"
              value={product?.quantity ?? ""}
              id="outlined-basic1"
              label="Stock"
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
              label="Quantité"
              error={quantity && quantity < 1 ? true : false}
              helperText={
                quantity && quantity < 1 && quantity != ""
                  ? "Entrez une quantité vailide"
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
                label="Embalage à consigner"
                error={packageQty && packageQty < 1 ? true : false}
                helperText={
                  packageQty && packageQty < 1 && packageQty != ""
                    ? "Entrez une quantité vailide"
                    : null
                }
                value={packageQty}
                variant="outlined"
              />
            )}
            <FormControl required size="small" fullWidth>
              <InputLabel id="demo-simple-select-label">
                Prix de vente
              </InputLabel>
              <Select
                labelId="demo-simple-select-label"
                id="demo-simple-select"
                value={age ? JSON.stringify(age) : ""}
                label="Prix de vente"
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
                  <MenuItem value="">Selectionner un article</MenuItem>
                )}
              </Select>
            </FormControl>
            <Button
              type="submit"
              variant="default"
              className="bg-violet-700 hover:bg-violet-600"
            >
              Ajouter
            </Button>
          </div>
        </div>
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
              {/* <Button variant='outline' className="h-12 w-12 p-0 border-red-600 text-red-600 hover:text-white hover:bg-red-600 ">
                                <span className="sr-only">Open menu</span>
                                <Trash className="h-4 w-4" />
                            </Button> */}
              <Button
                disabled={data.length < 1 || loading}
                onClick={handleAddInvoice}
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
                <span className="">Enregister la facture</span>
              </Button>
            </div>
          </div>
        </DataTableDemo>
      </div>
      <MuiDialog open={open}>
        <MuiDialogTitle>
          Aucun prix configurer pour {product?.name}
        </MuiDialogTitle>
        <MuiDialogContent>
          <DialogContentText>
            Voulez-vous ajouter &quot;{age?.price}&quot; comme prix par defaut de{" "}
            <b>{customer?.name}</b>
          </DialogContentText>
        </MuiDialogContent>
        <DialogActions>
          <MuiButton onClick={handleAddData}>Non</MuiButton>
          <MuiButton onClick={handleAddPrice}>Ajouter</MuiButton>
        </DialogActions>
      </MuiDialog>
    </div>
  );
}
