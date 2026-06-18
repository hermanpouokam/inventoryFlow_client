"use client";

import CardBodyContent from "@/components/CardContent";
import {
  instance
} from "@/components/fetch";
import { DataTableDemo } from "@/components/TableComponent";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { decryptParam } from "@/utils/encryptURL";
import useForm,
{ initializeFormValues } from "@/utils/useFormHook";
import {
  Backdrop,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  TextField,
} from "@mui/material";
import { ColumnDef } from "@tanstack/react-table";
import {
  Check,
  X,
  CheckCircle,
  XCircle,
  FileBarChart,
  Download,
  Eye,
  EyeOff,
} from "lucide-react";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { createVariant, formatteCurrency } from "../../functions";
import { toast } from "@/components/ui/app-toast";
import InputComponent from "./input";
import InputPrice from "./SellPriceInput";
import { PlusOneTwoTone } from "@mui/icons-material";
import { usePermission } from "@/context/PermissionContext";
import { PlanGate } from "@/components/PlanGate";
import ProductReportDrawer from "@/components/ProductReportDrawer";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { DateRangePicker } from "@/components/DateRangePicker";
import { datesData } from "@/utils/constants";
import moment from "moment";
import { DateRange } from "react-day-picker";

export default function Page({ params }: { params: { id: string } }) {
  const decryptedParam = decryptParam(decodeURIComponent(params.id));
  const [product, setProduct] = React.useState<Product | null>(null);
  const [error, setError] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [table, setTable] = React.useState<any | null>(null);
  const [open, setOpen] = React.useState(false);
  const { t } = useTranslation("common");
  const [selectedInput, setSelectedInput] = React.useState<string | null>(null);
  const [newPrice, setNewPrice] = React.useState<SellPrice | null>(null);
  const { hasPermission, user } = usePermission()
  const [showReport, setShowReport] = React.useState(true);
  const [showDetails, setShowDetails] = React.useState(false);

  const [pickedDateRange, setPickedDateRange] = React.useState<DateRange>(datesData[2]?.value);

  const handleDateRangeChange = (range: DateRange) => {
    setPickedDateRange(range);
  };
  const getProduct = async (decryptedParam: string) => {
    try {
      const res = await instance.get(`/products/${decryptedParam}/`);
      if (res.status === 200) setProduct(res.data);
    } catch (error) {
      setError(error);
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const getDateParams = () => ({
    start_date: moment(pickedDateRange?.from).format("YYYY-MM-DD"),
    end_date: moment(pickedDateRange?.to).format("YYYY-MM-DD"),
  });

  const handleDownloadPDF = async () => {

    const response = await instance.get(`reports/product/${decryptedParam}/pdf/`, {
      params: getDateParams(),
      responseType: 'blob', withCredentials: true
    })
    const blob = new Blob([response.data], {
      type: "application/pdf",
    })

    const url = URL.createObjectURL(blob)

    window.open(url, "_blank")

  };

  const columns: ColumnDef<Variant>[] = [
    {
      accessorKey: "number",
      header: () => <div className="w-5">#</div>,
      cell: ({ row }) => (
        <div className="text-center">{row.getValue("number")}</div>
      ),
    },
    {
      accessorKey: "name",
      header: ({ column }) => {
        return (
          <div
            className="text-center w-[180px]"
          >
            {t("product.details.variant_name")}
          </div>
        );
      },
      cell: ({ row }) => {
        const variant = row.original;
        return <div className="capitalize">{variant.name}</div>;
      },
    },
    {
      accessorKey: "purchase_price",
      header: () => (
        <div className="text-center w-[140px]">{t("purchase_price")}</div>
      ),
      cell: ({ row }) => {
        const variant = row.original;
        return (
          <div className="text-center font-medium">{Number(product.price)}</div>
        );
      },
    },
    {
      accessorKey: "quantity",
      header: () => <div className="text-center w-[140px]">{t("quantity")}</div>,
      cell: ({ row }) => {
        const variant = row.original;
        return (
          <div className="text-center font-medium">{variant.quantity}</div>
        );
      },
      footer: () => {
        return <div className="w-full text-center ">{t("total")}</div>;
      },
    },
    {
      accessorKey: "Total",
      header: () => <div className="text-right w-[140px]">{t("total")}</div>,
      cell: ({ row }) => {
        const variant = row.original;
        return (
          <div className="text-right font-medium">
            {formatteCurrency(variant.quantity * Number(product?.price))}
          </div>
        );
      },
      footer: () => {
        return (
          <div className="text-right w-full">
            {formatteCurrency(
              Number(product?.total_quantity) * Number(product?.price)
            )}
          </div>
        );
      },
    },
  ];

  React.useLayoutEffect(() => {
    getProduct(decryptedParam);
  }, []);

  const inputs = [
    {
      name: "name",
      required: true,
      label: t("product.details.variant_name"),
      type: "text",
    },
  ];

  const { errors, handleChange, handleSubmit, resetForm, values } = useForm(
    initializeFormValues(inputs)
  );

  const translations = {
    name: t("name"),
    total_quantity: t("quantity"),
    sales_point_details: t("sales_points.singular"),
    category_details: t("customers.category"),
    package_details: t("packaging.singular"),
    supplier: t("supplier.singular"),
    product_code: t("bills.columns.code"),
    sell_prices: t("product.fields.sell_price", { index: "" }),
    price: t("purchase_price"),
    is_beer: t("packaging.singular"),
  };

  const handleCreateVariant = async () => {
    try {
      const res = await createVariant({ ...values, product: product.id, quantity: 0 });
      if (res.status === 201) {
        setOpen(false);
        setTimeout(() => {
          window.location.reload();
        }, 1000);
        return toast({
          variant: "success",
          title: t("success"),
          description: t("product.details.variant_created"),
          icon: <CheckCircle className="size-4" />,
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: t("error"),
        description: t("product.details.variant_create_error"),
        icon: <XCircle className="size-4" />,
      });
    }
  };
  if (error) {
    <div className="flex justify-center items-center h-full w-full">
      {t("product.details.unavailable")}
    </div>;
  }

  if (!product) {
    return (
      <div className="flex-col justify-center items-center h-full w-full space-y-5">
        <Skeleton className="w-full h-16 shadow" />
        <Skeleton className="w-full h-16 shadow" />
      </div>
    );
  }

  const inputData = Object.entries(product).map(([key, value], index) => {
    if (
      [
        "variants",
        "id",
        "sales_point",
        "package",
        "enterprise",
        "category",
        "created_at",
        "last_update",
        "quantity",
        "with_variant",
      ].includes(key)
    )
      return;
    const input = {
      name: key,
      value:
        typeof value === "boolean" ? (value === true ? "oui" : "non") : value,
      type:
        typeof value === "string"
          ? "text"
          : typeof value === "number"
            ? "number"
            : typeof value === "boolean"
              ? "boolean"
              : typeof value === "object"
                ? "object"
                : "option",

      label: key,
      disabled: key === "id",
    };
    return input;
  });

  const handleClick = () => {
    //@ts-ignore
    setNewPrice({
      price: 0,
      product: product.id,
      id: 0,
    });
    setSelectedInput("price0");
  };

  return (
    <div className="space-y-5">
      <Backdrop
        sx={{ color: "#8b5cf6", zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={loading}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
      <CardBodyContent className="">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">{product?.name}</h3>
          <div className="flex items-center gap-2">

            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowDetails(e => !e)} className="gap-1.5">
                {showDetails ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                {t('details')}
              </Button>
            </div>
            {product?.with_variant && hasPermission('edit_product') && (
              <Button
                onClick={() => setOpen(true)}
                className="bg-green-600 hover:bg-green-600"
              >
                {t("product.details.add_variant")}
              </Button>
            )}
          </div>
        </div>
      </CardBodyContent>

      <CardBodyContent className="grid grid-cols-5 gap-4 ">
        <DateRangePicker
          defaultDateRange={pickedDateRange}
          datesData={datesData}
          onDateRangeChange={handleDateRangeChange}
        />

        <div className="flex items-center gap-2">
          <Button variant="secondary"
            onClick={() => {
              const btn = document.getElementById("getReport")
              btn?.click()
            }}
            className="gap-1.5 w-full">
            {t("search.action")}
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={handleDownloadPDF} className="gap-1.5 w-full">
            <Download className="h-3.5 w-3.5" />
            PDF
          </Button>
        </div>

      </CardBodyContent>

      <AnimatePresence mode="sync">
        {
          showDetails &&
          <motion.div
            initial={{ opacity: 0.8, height: 0 }}
            exit={{ opacity: 0.8, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            transition={{ duration: 0.15 }}
          >
            <CardBodyContent className={cn("space-y-5")}>
              <Divider>{t("product.details.title")}</Divider>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {inputData.map((input) => {
                  if (input?.name == 'sales_point_details' && user?.user_type !== 'admin') {
                    return null
                  }
                  return (
                    <InputComponent
                      key={input?.name}
                      input={input}
                      isSelected={selectedInput === input?.name}
                      onSelect={(el) => setSelectedInput(el)}
                      loading={loading}
                      onSetLoading={(el) => setLoading(el)}
                      product={product}
                      setProduct={(el) => setProduct(el)}
                      translations={translations}
                      link="products"
                    />
                  )
                })}
              </div>
              <Divider>
                {" "}
                {t("product.details.sell_prices_title")}{" "}
                <Chip
                  label={t("product.details.add_price")}
                  variant="outlined"
                  onClick={handleClick}
                  color="primary"
                  deleteIcon={<PlusOneTwoTone />}
                />
              </Divider>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {product?.sell_prices
                  ?.sort((a, b) => a.price - b.price)
                  ?.map((price) => (
                    <InputPrice
                      key={price.id}
                      isSelected={selectedInput === `price${price.id}`}
                      input={price}
                      onSelect={(el) => setSelectedInput(el)}
                      onSetLoading={(el) => setLoading(el)}
                      product={product}
                      loading={loading}
                    />
                  ))}
                {newPrice && selectedInput == "price0" ? (
                  <InputPrice
                    onSelect={(el) => {
                      setSelectedInput(el);
                      if (el !== "price0") {
                        setNewPrice(null);
                      }
                    }}
                    onSetLoading={(el) => setLoading(el)}
                    input={newPrice}
                    loading={loading}
                    isSelected={selectedInput === `price0`}
                    product={product}
                  />
                ) : null}
              </div>
            </CardBodyContent>
          </motion.div>
        }
      </AnimatePresence>

      <ProductReportDrawer
        productId={product.id}
        productName={product.name}
        open={showReport}
        pickedDateRange={pickedDateRange}
      />


      {product?.with_variant && (
        <CardBodyContent>
          <h4 className="text-base font-semibold">{t("productsList.product_list")}</h4>
          <DataTableDemo
            setTableData={setTable}
            columns={columns}
            searchText=""
            filterAttributes={["name"]}
            data={product?.variants.map((el, index) => {
              return { ...el, number: index + 1 };
            })}
          >
            <div className="flex items-center flex-col sm:flex-row space-y-3 justify-between py-4">
              <div className="flex gap-3 items-center flex-col sm:flex-row">
                <Input
                  placeholder={t("article_filter_placeholder")}
                  value={
                    table
                      ?.getColumn("name")
                      ?.getFilterValue() as string
                  }
                  onChange={(event) =>
                    table
                      ?.getColumn("name")
                      ?.setFilterValue(event.target.value)
                  }
                  className="max-w-sm"
                />
              </div>
            </div>
          </DataTableDemo>
        </CardBodyContent>
      )}
      <Dialog open={open}>
        <form onSubmit={(e) => handleSubmit(e, handleCreateVariant)}>
          <DialogTitle>{t("product.details.add_variant")}</DialogTitle>
          <DialogContent className="md:w-[500px]">
            {inputs.map((input) => (
              <TextField
                key={input.name}
                autoFocus
                required={input.required}
                margin="dense"
                id={input.name}
                name={input.name}
                label={input.label}
                type={input.type}
                value={values[input.name]}
                onChange={handleChange}
                size="small"
                fullWidth
              />
            ))}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpen(false)} variant={"destructive"}>
              {t("cancel")}
            </Button>
            <Button type="submit" className="bg-green-600 hover:bg-green-700">
              {t("add")}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </div>
  );
}
