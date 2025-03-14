import {
  getAllProducts,
  getUserCustomers,
  updateBill,
} from "@/components/fetch";
import { useToast } from "@/components/ui/use-toast";
import {
  Autocomplete,
  CircularProgress,
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
  PrinterIcon,
  Save,
  Trash,
  X,
  CheckCircle,
  Check,
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

interface PropsParams {
  bill: Bill;
  setClose: () => void;
}

export default function BillDetails({ bill, setClose }: PropsParams) {
  const [date, setDate] = React.useState<Date>(new Date());
  const [age, setAge] = React.useState<SellPrice | null>(null);
  const handleChange = (event: SelectChangeEvent) => {
    setAge(event.target.value);
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
  const { toast } = useToast();

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
      header: () => <div className="text-left">Code</div>,
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
            Article
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
      header: () => <div className="text-right">Prix d&apos;achat</div>,
      cell: ({ row }) => {
        const price = parseFloat(row.getValue("price"));

        // Format the amount as a dollar amount
        const formatted = new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "XAF",
        }).format(price);

        return <div className="text-right font-medium">{formatted}</div>;
      },
    },
    {
      accessorKey: "sellPrice",
      header: () => <div className="text-right">Prix de vente</div>,
      cell: ({ row }) => {
        const sellPrice = parseFloat(row.getValue("sellPrice"));

        // Format the amount as a dollar amount
        const formatted = new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "XAF",
        }).format(sellPrice);

        return <div className="text-right font-medium">{formatted}</div>;
      },
      footer: () => <div className="text-right">Total</div>,
    },
    {
      accessorKey: "quantity",
      header: ({ column }) => {
        return (
          <div
            className="flex justify-center"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            <span>Qte</span>
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
      header: () => <div className="text-right">Total</div>,
      cell: ({ row }) => {
        const total = parseFloat(row.getValue("total"));

        // Format the amount as a dollar amount
        const formatted = new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "XAF",
        }).format(total);

        return <div className="text-right font-medium">{formatted}</div>;
      },
      footer: () => {
        const total = data.reduce((acc, curr) => (acc = acc + curr.total), 0);

        // Format the amount as a dollar amount
        const formatted = new Intl.NumberFormat("en-US", {
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
                <span className="sr-only">Open menu</span>
                <EllipsisVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="z-[999999]" align="end">
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
                  setOldQty(payment.quantity);
                  setData((prev) => {
                    return prev.filter((it) => it.article != payment.article);
                  });
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

  const handleAddData = () => {
    const qte = oldQty - quantity;
    if (quantity && product && qte < 0 && -qte > product?.quantity) {
      toast({
        title: "Erreur",
        description: `Vous n'avez pas assez de ${product?.name} en stock`,
        className:
          "bg-red-700 border-red-700 text-white text-base font-semibold",
        variant: "default",
        icon: <X className="mr-2" />,
      });
      return;
    }
    if (!age) {
      return toast({
        title: "Erreur",
        description: `Selectionnez un prix de vente`,
        variant: "destructive",
        icon: <X className="mr-2" />,
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
            sellPrice: product?.sell_prices.find((s) => s.id == age)?.price,
            sell_price: age,
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
          title: "Succès",
          description: `Facture modifiée avec succès`,
          className:
            "bg-green-600 border-green-600 text-white text-base font-semibold",
          variant: "default",
          icon: <Check className="mr-2" />,
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
        title: "Erreur",
        description: `Une erreur inattendu est survenu verifiez votre connexion et réessayez`,
        className:
          "bg-red-500 border-red-500 text-white text-base font-semibold",
        variant: "default",
        icon: <X className="mr-2" />,
      });
    }
  };

  return (
    <div className="w-full h-full">
      {loading && (
        <div className="absolute h-full top-0 right-0 z-[999] bg-transparent w-full" />
      )}
      <div
        className={
          "shadow border select-none border-neutral-300 rounded-lg bg-white p-5"
        }
      >
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
            label="Nom du client"
            variant="outlined"
          />
          <TextField
            name="command_number"
            fullWidth
            value={bill.bill_number}
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
      <form action={handleAddData}>
        <div
          className={
            "shadow border mt-5 select-none border-neutral-300 rounded-lg bg-white p-5"
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
                  label="Selectionner l'article"
                />
              )}
            />
            <TextField
              fullWidth
              required
              size="small"
              value={product?.price ?? ""}
              id="outlined-basic"
              label="Prix d'achat"
              variant="outlined"
            />
            <TextField
              fullWidth
              required
              size="small"
              value={product?.quantity ?? ""}
              id="outlined-basic"
              label="Stock"
              variant="outlined"
            />
            <TextField
              required
              fullWidth
              size="small"
              type="number"
              onChange={(e) => setQuantity(parseInt(e.target.value))}
              id="outlined-basic"
              label="Quantité"
              error={quantity && quantity < 1 ? true : false}
              helperText={
                quantity && quantity < 1 && quantity != ""
                  ? "Entrez une quantité vailide"
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
                label="Embalage à consigner"
                error={record && record < 0 ? true : false}
                helperText={
                  record && record < 0 ? "Entrez une quantité vailide" : null
                }
                value={record}
                variant="outlined"
              />
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="ml-auto w-full flex justify-between"
                >
                  {product?.sell_prices.find((s) => s.id == age)?.price ??
                    "Prix de vente"}{" "}
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="z-[999999] popover-content-width-full"
                align="center"
              >
                {product ? (
                  <>
                    <DropdownMenuItem disabled className="text-sm font-medium">
                      Prix de vente
                    </DropdownMenuItem>
                    {product?.sell_prices
                      .sort((a, b) => a.price - b.price)
                      .map((sell: SellPrice) => (
                        // <MenuItem key={sell.id} value={sell}></MenuItem>
                        <DropdownMenuCheckboxItem
                          key={sell.price}
                          className="capitalize"
                          checked={sell == age}
                          onClick={() => setAge(sell.id)}
                        >
                          {parseFloat(sell.price)}
                        </DropdownMenuCheckboxItem>
                      ))}
                  </>
                ) : (
                  <DropdownMenuItem>Selectionner un article</DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
            <Button
              type="submit"
              variant="default"
              className="bg-violet-700 hover:bg-violet-600"
              disabled={!age}
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
        <DataTableDemo
          filterAttributes={["article"]}
          searchText={""}
          setTableData={setTable}
          columns={columns}
          data={data}
        >
          <div className="flex items-center justify-between py-4">
            <div className="flex space-x-5">
              <Input
                placeholder="Filtrer par articles..."
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
              {/* <Button variant='outline'

                                onClick={handleGeneratePDF}
                                className="h-12 w-12 p-0 border-red-600 text-red-600 hover:text-white hover:bg-red-600 ">
                                <span className="sr-only">Open menu</span>
                                <PrinterIcon className="h-4 w-4" />
                            </Button> */}
              <Button
                disabled={data.length < 1 || loading}
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
                <span className="">Enregister la facture</span>
              </Button>
            </div>
          </div>
        </DataTableDemo>
      </div>
    </div>
  );
}
