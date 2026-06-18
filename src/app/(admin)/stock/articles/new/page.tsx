"use client";
import CardBodyContent from "@/components/CardContent";
import { createProduct, createSellPrice } from "@/components/fetch";
import { PlanGate } from "@/components/PlanGate";
import { toast } from "@/components/ui/app-toast";
import { Button } from "@/components/ui/button";
import { usePermission } from "@/context/PermissionContext";
import { fetchPackagings } from "@/redux/packagingsSlicer";
import { fetchProductsCat } from "@/redux/productsCat";
import { fetchSalesPoints } from "@/redux/salesPointsSlicer";
import { AppDispatch, RootState } from "@/redux/store";
import { fetchSuppliers } from "@/redux/suppliersSlicer";
import useForm, { Field, initializeFormValues } from "@/utils/useFormHook";
import {
  Backdrop,
  Checkbox,
  CircularProgress,
  Divider,
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from "@mui/material";
import { Check, CheckCircle } from "lucide-react";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";

export default function Page() {
  const dispatch: AppDispatch = useDispatch();
  const { hasPermission, user } = usePermission();
  const { t } = useTranslation("common");

  const { data, error, status } = useSelector(
    (state: RootState) => state.salesPoints
  );
  const {
    data: suppliers,
    error: suppliersError,
    status: suppliersStatus,
  } = useSelector((state: RootState) => state.suppliers);
  const {
    data: productCat,
    error: productCatError,
    status: productCatStatus,
  } = useSelector((state: RootState) => state.productsCat);
  const {
    data: packagings,
    error: packagingsError,
    status: packagingsStatus,
  } = useSelector((state: RootState) => state.packagings);

  const [sellsPrices, setSellPrices] = React.useState(4);

  const [sellsPricesValue, setSellsPricesValue] = React.useState({});
  const [loading, setLoading] = React.useState(false);

  const fields: Field[] = [
    ...(user?.user_type === "admin"
      ? [
        {
          name: "sales_point",
          label: t("product.fields.sales_point"),
          required: true,
          type: "select",
          options: data,
        },
      ]
      : []),
    {
      name: "supplier_id",
      label: t("product.fields.supplier"),
      required: true,
      type: "select",
      options: suppliers,
    },
    {
      name: "category_id",
      label: t("product.fields.category"),
      required: true,
      type: "select",
      options: productCat,
    },
    {
      name: "name",
      label: t("product.fields.name"),
      required: true,
      type: "text",
    },
    {
      name: "product_code",
      label: t("product.fields.code"),
      required: true,
      type: "text",
    },
    {
      name: "price",
      label: t("product.fields.price"),
      required: true,
      type: "number",
    },
    {
      name: "with_variant",
      label: t("product.fields.with_variant"),
      required: false,
      type: "checkbox",
    },
    {
      name: "quantity",
      label: t("product.fields.quantity"),
      required: true,
      type: "number",
      value: 0
    },
    {
      name: "is_beer",
      label: t("product.fields.is_beer"),
      required: false,
      type: "checkbox",
    },
    {
      name: "package",
      label: t("product.fields.package"),
      required: false,
      type: "select",
      options: packagings,
    },
  ];

  const {
    values,
    errors,
    handleChange,
    handleSubmit,
    setFieldError,
    resetForm,
    setFieldValue,
  } = useForm(initializeFormValues(fields));

  React.useEffect(() => {
    if (status === "idle") {
      dispatch(fetchSalesPoints());
    }
  }, [status, dispatch]);

  React.useEffect(() => {
    if (user?.user_type != 'admin') {
      dispatch(fetchSuppliers({ sales_points_id: [user?.sales_point] }));
      dispatch(fetchProductsCat({ sales_points_id: [user?.sales_point] }));
      dispatch(fetchPackagings({ sales_points: [user?.sales_point] }));
    }
  }, [user?.user_type, dispatch]);


  const handleChangeSalesPoint = (event: any) => {
    dispatch(fetchSuppliers({ sales_points_id: [event.target.value] }));
    dispatch(fetchProductsCat({ sales_points_id: [event.target.value] }));
    dispatch(fetchPackagings({ sales_points: [event.target.value] }));
  };

  const onSubmit = async () => {
    setLoading(true);

    try {
      if (Object.keys(sellsPricesValue).length === 0) {
        return setFieldError("form", t("product.errors.no_sell_price"));
      }

      if (!values["sales_point"] && user?.user_type === "admin") {
        return setFieldError("form", t("product.errors.select_sales_point"));
      }

      if (values["price"] == 0 || values["price"] < 0) {
        return setFieldError("form", t("product.errors.invalid_price"));
      }

      if (
        Object.values(sellsPricesValue).some(
          (value) => parseFloat(value) < values["price"]
        )
      ) {
        return setFieldError(
          "form",
          t("product.errors.sell_price_lower_than_buy")
        );
      }
      if (values['is_beer'] && !values['package']) {
        return setFieldError(
          "form",
          t("product.errors.select_packaging")
        );
      }
      if (
        Object.values(sellsPricesValue).some(
          (value) => Number(value) < 0
        ) ||
        Object.values(sellsPricesValue).some((value) =>
          isNaN(Number(value))
        )
      ) {
        return setFieldError("form", t("product.errors.invalid_sell_prices"));
      }

      const res = await createProduct(values);

      if (res?.status === 201) {
        await Promise.all(
          Object.values(sellsPricesValue).map((value) =>
            createSellPrice({
              product: res?.data.id,
              price: Number(value),
            })
          )
        );

        resetForm();
        setSellsPricesValue({});

        toast({
          variant: "success",
          title: t("success"),
          description: t("product.success.created"),
          icon: <CheckCircle className="size-4" />,
        });

        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        setFieldError("form", t("unexpected_error"));
      }
    } catch (error) {
      console.log(error)
      setFieldError("form", t("unexpected_error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="space-y-4">
      <Backdrop
        sx={{ color: "#8b5cf6", zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={
          status === "loading" ||
          productCatStatus === "loading" ||
          suppliersStatus === "loading"
        }
      >
        <CircularProgress color="inherit" />
      </Backdrop>
      <CardBodyContent className="flex lg:flex-row md:flex-row sm:flex-row flex-col justify-between items-center">
        <h4 className="text-base font-semibold">
          {t("product.add.title")}
        </h4>
      </CardBodyContent>
      <CardBodyContent className="space-y-5">
        {errors["form"] && (
          <div
            className={`bg-red-400/20 text-center border border-red-500 rounded-sm p-3 self-center max-w-[100%] mb-5`}
          >
            <p className={`text-red-500 text-base font-semibold`}>
              {errors["form"]}
            </p>
          </div>
        )}

        <Divider>{t("product.sections.info")}</Divider>
        <PlanGate resource="products">
          <form
            autoComplete="off"
            onSubmit={(e) => handleSubmit(e, onSubmit)}
            method="post"
          >
            <div className="grid gap-x-4 gap-y-3 grid-col-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 mb-5">
              {fields.map((field) =>
                field.type === "select" ? (
                  field.name !== "package" ? (
                    <FormControl key={field.name} size="small" fullWidth>
                      <InputLabel>{field.label}</InputLabel>
                      <Select
                        name={field.name}
                        value={values[field.name]}
                        label={field.label}
                        required={field.required}
                        error={!!errors[field.name]}
                        onChange={(e) => {
                          //@ts-ignore
                          handleChange(e);
                          if (field.name === "sales_point") {
                            handleChangeSalesPoint(e);
                          }
                        }}
                        size="small"
                      >
                        {field.options?.map((option) => (
                          <MenuItem key={option.id} value={option.id}>
                            {/* @ts-ignore */}
                            {option.name}
                            {option?.address && ` - ${option.address}`}
                          </MenuItem>
                        ))}
                      </Select>
                      <FormHelperText>
                        {errors[field.name] && errors[field.name]}
                      </FormHelperText>
                    </FormControl>
                  ) : (
                    values.is_beer && (
                      <div className="animate-in" key={field.name}>
                        <FormControl key={field.name} size="small" fullWidth>
                          <InputLabel>{field.label}</InputLabel>
                          <Select
                            name={field.name}
                            value={values[field.name]}
                            label={field.label}
                            required={field.required}
                            error={!!errors[field.name]}
                            onChange={(e) => {
                              //@ts-ignore
                              handleChange(e);
                              if (field.name === "sales_point") {
                                handleChangeSalesPoint(e);
                              }
                            }}
                            size="small"
                          >
                            {field.options?.map((option) => (
                              <MenuItem key={option.id} value={option.id}>
                                {/* @ts-ignore */}
                                {option.name}
                                {option?.address && ` - ${option.address}`}
                              </MenuItem>
                            ))}
                          </Select>
                          <FormHelperText>
                            {errors[field.name] && errors[field.name]}
                          </FormHelperText>
                        </FormControl>
                      </div>
                    )
                  )
                ) : field.type === "checkbox" ? (
                  <div key={field.name} className="items-start rounded-md border p-3 border-neutral-500 flex space-x-2">
                    <Checkbox
                      id={field.name}
                      checked={values[field.name]}
                      onChange={handleChange}
                      name={field.name}
                    />
                    <div className="grid gap-1.5 leading-none">
                      <label
                        htmlFor={field.name}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {field.label}
                      </label>
                      <p className="text-sm text-muted-foreground">
                        {field.name !== "is_beer"
                          ? t("product.hints.with_variant")
                          : t("product.hints.packaging")}
                      </p>
                    </div>
                  </div>
                ) : field.name == "quantity" ? (
                  <input
                    name={field.name}
                    value={field.value}
                    type="hidden"
                    key={field.name}
                  />
                ) : (
                  <React.Fragment key={field.name}>
                    <TextField
                      type={field.type}
                      required={field.required}
                      value={values[field.name]}
                      name={field.name}
                      disabled={
                        values["with_variant"] === true &&
                        field.name === "quantity"
                      }
                      //@ts-ignore
                      onChange={handleChange}
                      error={!!errors[field.name]}
                      helperText={errors[field.name] && errors[field.name]}
                      label={field.label}
                      size="small"
                    />
                  </React.Fragment>
                )
              )}
            </div>
            <Divider>{t("product.sections.sell_prices")}</Divider>
            <div className="grid gap-x-4 gap-y-2 grid-col-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 mt-5">
              {[...Array(sellsPrices)].map((sell, index) => (
                <TextField
                  key={index}
                  type={"number"}
                  //@ts-ignore
                  value={sellsPricesValue[`sell_price${index + 1}`] ?? ""}
                  onChange={(e) => {
                    setSellsPricesValue({
                      ...sellsPricesValue,
                      [`sell_price${index + 1}`]: e.target.value,
                    });
                  }}
                  label={t("product.fields.sell_price", { index: index + 1 })}
                  size="small"
                />
              ))}
            </div>
            <div className="flex items-center justify-center w-full mt-4">
              <PlanGate resource="products" bannerSize="compact">
                <Button
                  type="submit"
                  variant={"default"}
                  disabled={loading}
                  className="bg-green-500 hover:bg-green-500 max-w-[550px] w-full"
                >
                  {loading
                    ? t("please wait")
                    : t("add")}
                </Button>
              </PlanGate>
            </div>
          </form>
        </PlanGate>
      </CardBodyContent>
    </section>
  );
}
