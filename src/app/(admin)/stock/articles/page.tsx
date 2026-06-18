"use client";
import * as React from "react";
import CardBodyContent from "@/components/CardContent";
import {
  Button
} from "@/components/ui/button";
import {
  AppDispatch,
  RootState
} from "@/redux/store";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { fetchSalesPoints } from "@/redux/salesPointsSlicer";
import {
  CheckCircle,
  CircleAlert,
  EllipsisVertical,
  EyeIcon,
  PrinterIcon,
  XCircle,
} from "lucide-react";
import { fetchProductsCat } from "@/redux/productsCat";
import { DataTableDemo } from "@/components/TableComponent";
import { ColumnDef, Row } from "@tanstack/react-table";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { fetchProducts } from "@/redux/productsSlicer";
import { calculateTotalAmount, formatteCurrency } from "../functions";
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
import SelectPopover from "@/components/SelectPopover";
import StockPDF from "@/app/pdf/stockPdf";
import { encryptParam } from "@/utils/encryptURL";
import { transformVariants } from "../../sell/newsell/functions";
import { usePermission } from "@/context/PermissionContext";
import { useTranslation } from "react-i18next";
import { toast } from "@/components/ui/app-toast";

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
  const { hasPermission, user, isAdmin } = usePermission();
  const { t: tCommon } = useTranslation("common");

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
  const [text, setText] = React.useState("");
  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const [table, setTable] = React.useState<any | null>(null);
  const [loading, setLoading] = React.useState(false)

  React.useEffect(() => {
    if (status == "idle") {
      dispatch(fetchSalesPoints());
    }
    dispatch(fetchProducts({}));
    document.title = tCommon("productsList.title");
  }, [status]);

  const handleSelect = (id: number) => {
    if (selectedSalesPoints.includes(id)) {
      setSelectedSalesPoints(selectedSalesPoints.filter((s) => s != id));
    } else {
      setSelectedSalesPoints((prev) => [...prev, id]);
    }
    dispatch(fetchProductsCat({ sales_points_id: selectedSalesPoints }));
    dispatch(fetchSuppliers({ sales_points_id: selectedSalesPoints }));
  };

  React.useEffect(() => {

    setSelectedCategories([]);
    setSelectedSuppliers([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSalesPoints]);

  const handleSelectCategories = (id?: number) => {
    if (!id) return
    if (selectedCategories.includes(id)) {
      setSelectedCategories(selectedCategories.filter((s) => s != id));
    } else {
      setSelectedCategories((prev) => [...prev, id]);
    }
  };

  const handleSelectSupplier = (id?: number) => {
    if (!id) return
    if (selectedSuppliers.includes(id)) {
      setSelectedSuppliers(selectedSuppliers.filter((s) => s != id));
    } else {
      setSelectedSuppliers((prev) => [...prev, id]);
    }
  };

  const columns: ColumnDef<Product>[] = [
    ...(hasPermission("edit_product")
      ? [
        {
          id: "actions",
          header: () => (
            <div className="w-10 text-center">
              {tCommon("actions.title")}
            </div>
          ),
          enableHiding: false,
          cell: ({ row }: { row: any }) => {
            const product = row.original;

            const handleNavigate = () => {
              try {
                const encryptedId = encryptParam(
                  encodeURI(product.id.toString())
                );
                window.location.assign(
                  `/stock/articles/${encryptedId}`
                );
              } catch (error) {
                console.log(error);
              }
            };

            return (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0">
                    <span className="sr-only">
                      {tCommon("open_menu")}
                    </span>
                    <EllipsisVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="start">
                  <DropdownMenuLabel>
                    {tCommon("actions")}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />

                  <DropdownMenuItem onClick={handleNavigate}>
                    <EyeIcon className="mr-3" size={14} />
                    {tCommon("details")}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            );
          },
        },
      ]
      : []),

    {
      accessorKey: "number",
      header: () => <div className="w-5 text-center">#</div>,
      cell: ({ row }) => (
        <div className="text-center">
          {row.getValue("number")}
        </div>
      ),
    },

    {
      accessorKey: "product_code",
      header: () => (
        <div className="text-center w-24">
          {tCommon("bills.columns.code")}
        </div>
      ),
      cell: ({ row }) => {
        const product = row.original;
        return (
          <div className="text-center">
            {product.product_code}
          </div>
        );
      },
    },

    {
      accessorKey: "name",
      header: () => (
        <div className="text-center w-[240px]">
          {tCommon("bills.columns.product_name")}
        </div>
      ),
      cell: ({ row }) => {
        const product = row.original;
        return (
          <div className="text-center capitalize">
            {product.name}
          </div>
        );
      },
    },

    {
      accessorKey: "categorie",
      header: () => (
        <div className="text-center w-[140px]">
          {tCommon("bills.columns.category")}
        </div>
      ),
      cell: ({ row }) => {
        const product = row.original;
        return (
          <div className="text-center font-medium">
            {product.category_details.name}
          </div>
        );
      },
    },

    ...(user?.user_type === "admin"
      ? [
        {
          accessorKey: "point de vente",
          header: () => (
            <div className="text-center w-32">
              {tCommon("bills.columns.sales_point")}
            </div>
          ),
          cell: ({ row }: { row: Row<Product> }) => {
            const product = row.original;
            return (
              <div className="text-center font-medium">
                {product.sales_point_details.name}
              </div>
            );
          },
        },
      ]
      : []),

    {
      accessorKey: "prix d'achat",
      header: ({ column }) => (
        <div className="flex justify-center w-28">
          {tCommon("bills.columns.purchase_price")}
        </div>
      ),
      cell: ({ row }) => {
        const product = row.original;
        return (
          <div className="text-center">
            {formatteCurrency(product.price)}
          </div>
        );
      },
      footer: () => (
        <div className="text-center">{tCommon("bills.columns.total")}</div>
      ),
    },

    {
      accessorKey: "quantité",
      header: () => (
        <div className="text-center">
          {tCommon("bills.columns.quantity")}
        </div>
      ),
      cell: ({ row }) => {
        const product = row.original;
        return (
          <div className="text-center">
            {product.total_quantity}
          </div>
        );
      },
      footer: () => {
        const total = products.reduce(
          (acc, p) => acc + p.total_quantity,
          0
        );
        return <div className="text-center">{total}</div>;
      },
    },

    {
      accessorKey: "total",
      header: () => (
        <div className="text-center w-32">
          {tCommon("bills.columns.total")}
        </div>
      ),
      cell: ({ row }) => {
        const product = row.original;
        const total =
          product.total_quantity * parseFloat(product.price);

        return (
          <div className="text-center font-medium">
            {formatteCurrency(total)}
          </div>
        );
      },
      footer: () => {
        const total = calculateTotalAmount(products);
        return (
          <div className="text-center">
            {formatteCurrency(total)}
          </div>
        );
      },
    },

    {
      accessorKey: "variants",
      header: () => (
        <div className="text-center w-40">
          {tCommon("bills.columns.product_variants")}
        </div>
      ),
      cell: ({ row }) => {
        const product = row.original;
        return (
          <div className="text-center">
            {product.with_variant
              ? tCommon("bills.columns.yes")
              : tCommon("bills.columns.no")}
          </div>
        );
      },
    },

    {
      accessorKey: "packaging",
      header: () => (
        <div className="text-center w-32">
          {tCommon("bills.columns.paid_packaging")}
        </div>
      ),
      cell: ({ row }) => {
        const product = row.original;
        return (
          <div className="text-center">
            {product.is_beer
              ? tCommon("bills.columns.yes")
              : tCommon("bills.columns.no")}
          </div>
        );
      },
    },

    {
      accessorKey: "created_at",
      header: () => (
        <div className="text-center w-32">
          {tCommon("bills.columns.created_at")}
        </div>
      ),
      cell: ({ row }) => {
        const product = row.original;
        return (
          <div className="text-center">
            {moment(product.created_at).format("DD/MM/YYYY HH:mm")}
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
    if (selectedSalesPoints.length !== 1 && user?.user_type == 'admin') {
      return toast({
        title: tCommon("warning"),
        variant: "warning",
        description: tCommon("productsList.select_salespoint_pdf"),
        icon: <CircleAlert className="size-4" />,
      });
    }

    const newWindow = window.open("", "_blank");

    if (!newWindow) {
      alert(tCommon("productsList.popup_blocked"));
      return;
    }

    newWindow.document.write(`<p>${tCommon("productsList.loading_pdf")}</p>`);

    // Récupérer les données
    const selectedSalesPoint =
      user?.user_type === "admin"
        ? salespoints.find((s) => s.id === selectedSalesPoints[0])
        : user?.sales_point_details;

    const filteredProducts = transformVariants(
      user?.user_type == "admin"
        ? products.filter((p) => p.sales_point === selectedSalesPoints[0])
        : products.filter((p) => p.sales_point === user?.sales_point)
    );

    // Générer le titre dynamique i18n
    const title = tCommon("productsList.pdf_title", {
      date: new Date().toLocaleDateString(),
      hasFilter:
        selectedCategories.length > 0 || selectedSuppliers.length > 0,
      supplier: selectedSuppliers.length > 0,
      category: selectedCategories.length > 0,
    });

    const pdfDocument = (
      <StockPDF
        //@ts-ignore
        salespoint={selectedSalesPoint}
        title={title}
        products={filteredProducts}
      />
    );

    const blobProvider = new Promise((resolve) => {
      const container = document.createElement("div");
      document.body.appendChild(container);

      ReactDOM.createRoot(container).render(
        <BlobProvider document={pdfDocument}>
          {({ blob }) => {
            if (blob) resolve(blob);
            return null;
          }}
        </BlobProvider>
      );
    });

    blobProvider.then((blob) => {
      if (blob) {
        //@ts-ignore
        const blobUrl = URL.createObjectURL(blob);
        newWindow.location.href = blobUrl;
      } else {
        newWindow.document.write(`<p>${tCommon("productsList.pdf_error")}</p>`);
      }
    });
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
        <h4 className="text-base font-semibold">
          {tCommon("productsList.stock")}
        </h4>

        {hasPermission("add_product") && (
          <div className="grid grid-cols-1 gap-x-4 mt-4 sm:mt-0 sm:grid-cols-2">
            <Button
              variant="secondary"
              onClick={handleClickOpen}
            >
              {tCommon("productsList.add_product_category")}
            </Button>
            <Button
              variant="secondary"
              onClick={() =>
                window.location.assign("/stock/articles/new")
              }
            >
              {tCommon("productsList.add_product")}
            </Button>
          </div>
        )}
      </CardBodyContent>

      <CardBodyContent className="space-y-4">
        <h4 className="text-base font-semibold">
          {tCommon("productsList.filter_products")}
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">

          {user?.user_type === "admin" && (
            <SelectPopover
              items={salespoints}
              getOptionLabel={(o) => `${o.name} - ${o.address}`}
              selectedItems={selectedSalesPoints.map((s) => {
                const sp = salespoints.find((el) => el.id === s);
                return { ...sp } as SalesPoint;
              })}
              onSelect={(el) => handleSelect(el.id)}
              noItemText={tCommon("productsList.no_sales_point")}
              placeholder={tCommon("productsList.sales_point")}
              searchPlaceholder={tCommon("productsList.search_sales_point")}
            />
          )}

          <SelectPopover
            items={selectedSalesPoints.length > 0 ? productsCat : []}
            getOptionLabel={(o) => `${o.name}`}
            onSelect={(el) => handleSelectCategories(el.id)}
            selectedItems={selectedCategories.map((cat) => {
              const category = productsCat.find((el) => el.id === cat);
              return { ...category };
            })}
            noItemText={
              selectedSalesPoints.length > 0
                ? tCommon("productsList.no_product_category")
                : tCommon("productsList.select_sales_point")
            }
            placeholder={tCommon("productsList.product_category")}
            searchPlaceholder={tCommon("productsList.search_category")}
          />

          <SelectPopover
            items={selectedSalesPoints.length > 0 ? suppliers : []}
            getOptionLabel={(o) => `${o.name}`}
            onSelect={(el) => handleSelectSupplier(el.id)}
            selectedItems={selectedSuppliers.map((sup) => {
              const supplier = suppliers.find((el) => el.id === sup);
              return { ...supplier };
            })}
            noItemText={
              selectedSalesPoints.length < 1
                ? tCommon("productsList.select_sales_point")
                : tCommon("productsList.no_supplier_found")
            }
            placeholder={tCommon("productsList.suppliers")}
            searchPlaceholder={tCommon("productsList.search_supplier")}
          />

          <Button variant="primary" onClick={handleFilterProduct}>
            {tCommon("search.action")}
          </Button>
        </div>
      </CardBodyContent>

      <CardBodyContent>
        <h4 className="text-base font-semibold">
          {tCommon("productsList.product_list")}
        </h4>

        <DataTableDemo
          setTableData={setTable}
          filterAttributes={["name", "product_code"]}
          columns={columns}
          searchText={text}
          data={[...products].map((el, index) => ({
            ...el,
            number: index + 1,
          }))}
        >
          <div className="flex items-center flex-col sm:flex-row space-y-3 justify-between py-3">

            <Input
              placeholder={tCommon("productsList.filter_product_placeholder")}
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="max-w-xs"
            />

            <Button
              variant="outline"
              onClick={handleOpenPDF}
              className="px-5 space-x-3 border-green-600 text-green-600 hover:text-white hover:bg-green-600"
            >
              <PrinterIcon className="h-4 w-4" />
              <span>{tCommon("productsList.print_sheet")}</span>
            </Button>
          </div>
        </DataTableDemo>
      </CardBodyContent>

      <Dialog
        PaperProps={{
          component: "form",
          onSubmit: async (event: React.FormEvent<HTMLFormElement>) => {
            event.preventDefault();
            if (loading) return
            setLoading(true)
            try {
              const formData = new FormData(event.currentTarget);
              const formJson = Object.fromEntries((formData as any).entries());
              //@ts-ignore
              const res = await createProductCat(formJson);

              handleClose();

              if (res.id) {
                toast({
                  variant: "success",
                  title: tCommon("success"),
                  description: tCommon("productsList.created_success"),
                  icon: <CheckCircle className="size-4" />,
                });
              }

              setTimeout(() => {
                dispatch(fetchSalesPoints());
                dispatch(fetchProductsCat({ sales_points_id: selectedSalesPoints }));
                dispatch(fetchSuppliers({ sales_points_id: selectedSalesPoints }));
              }, 150);

            } catch (error) {
              console.log(error);
              toast({
                variant: "destructive",
                title: tCommon("error"),
                description: tCommon("productsList.create_error"),
                icon: <XCircle className="size-4" />,
              });
            } finally {
              setLoading(false)
            }
          }
        }}
        open={open}

        TransitionComponent={Transition}
        keepMounted
      >
        <DialogTitle>
          {tCommon("productsList.add_product_category")}
        </DialogTitle>

        <DialogContent className="py-3 space-y-3 max-w-md">

          {user?.user_type === "admin" && (
            <MuiFormControl fullWidth size="small">
              <InputLabel>
                {tCommon("productsList.sales_point")}
              </InputLabel>
              <Select name="sales_point">
                {salespoints.map((s) => (
                  <MenuItem key={s.id} value={s.id}>
                    {s.name} - {s.address}
                  </MenuItem>
                ))}
              </Select>
            </MuiFormControl>
          )}

          <TextField
            name="name"
            label={tCommon("productsList.category_name")}
            required
            fullWidth
            size="small"
          />

          <TextField
            name="ab_name"
            label={tCommon("productsList.category_abbreviation")}
            required
            fullWidth
            size="small"
          />
        </DialogContent>

        <DialogActions>
          <Button variant="destructive" type="button" onClick={handleClose}>
            {tCommon("cancel")}
          </Button>
          <Button disabled={loading} type="submit" variant={'primary'}>
            {loading ? tCommon("please wait") : tCommon("add")}
          </Button>
        </DialogActions>
      </Dialog>
    </section>
  );
}
