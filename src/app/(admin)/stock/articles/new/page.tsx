"use client";
import CardBodyContent from "@/components/CardContent";
import { createProduct, createSellPrice } from "@/components/fetch";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { fetchPackagings } from "@/redux/packagingsSlicer";
import { fetchProductsCat } from "@/redux/productsCat";
import { fetchSalesPoints } from "@/redux/salesPointsSlicer";
import { AppDispatch, RootState } from "@/redux/store";
import { fetchSuppliers } from "@/redux/suppliersSlicer";
import useForm, { initializeFormValues } from "@/utils/useFormHook";
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
import { Check } from "lucide-react";
import * as React from "react";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";

export default function Page() {
  const dispatch: AppDispatch = useDispatch();
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

  const fields = [
    {
      name: "sales_point",
      label: "Point de vente",
      required: true,
      type: "select",
      options: data,
    },
    {
      name: "supplier_id",
      label: "Fournisseur du produit",
      required: true,
      type: "select",
      options: suppliers,
    },
    {
      name: "category_id",
      label: "Catégorie du produit",
      required: true,
      type: "select",
      options: productCat,
    },
    {
      name: "name",
      label: "Nom du produit",
      required: true,
      type: "text",
    },
    {
      name: "product_code",
      label: "Code du produit",
      required: true,
      type: "text",
    },
    {
      name: "price",
      label: "Prix d'achat",
      required: true,
      type: "number",
    },
    {
      name: "with_variant",
      label: "Ce produit a des variants ?",
      required: false,
      type: "checkbox",
    },
    {
      name: "quantity",
      label: "Quantité du produit",
      required: true,
      type: "number",
    },
    {
      name: "is_beer",
      label: "Ce produit a des emballages payants ?",
      required: false,
      type: "checkbox",
    },
    {
      name: "package",
      label: "Emabllage du produit",
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
    console.log(values);
  }, [values]);

  const { toast } = useToast();

  const handleChangeSalesPoint = (event: any) => {
    dispatch(fetchSuppliers({ sales_points_id: [event.target.value] }));
    dispatch(fetchProductsCat({ sales_points_id: [event.target.value] }));
    dispatch(fetchPackagings({ sales_points: [event.target.value] }));
  };

  const onSubmit = async () => {
    setLoading(true);
    try {
      if (Object.keys(sellsPricesValue).length == 0) {
        return setFieldError("form", "Entrez au moins 1 prix de vente");
      }
      if (!values["sales_point"]) {
        return setFieldError("form", "Veuillez sélectionner un point de vente");
      }
      if (values["price"] == 0 || values["price"] < 0) {
        return setFieldError("form", "Prix de vente invalide");
      }
      if (
        Object.values(sellsPricesValue).some(
          (value) => parseFloat(value) < values["price"]
        )
      ) {
        return setFieldError(
          "form",
          "Le prix de vente ne peut pas etre inférieur au prix d'achat"
        );
      }
      if (
        Object.values(sellsPricesValue).some(
          (value) => parseFloat(value) < 0
        ) ||
        Object.values(sellsPricesValue).some((value) => !!isNaN(Number(value)))
      ) {
        return setFieldError("form", "Entrez des prix de vente valides");
      }
      const res = await createProduct(values);
      if (res?.status === 201) {
        Object.values(sellsPricesValue).forEach(async (value) => {
          const response = await createSellPrice({
            product: res?.data.id,
            price: Number(value),
          });
        });
        resetForm();
        setSellsPricesValue({});

        toast({
          variant: "success",
          title: "Succès",
          description: `Article ajouté avec succès`,
          className: "bg-green-600 border-green-600 text-white",
          icon: <Check className="mr-2" />,
        });
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        setFieldError(
          "form",
          "Une erreur inattendu s'est produite vérifiez votre connexion et réessayez"
        );
      }
    } catch (error) {
      setFieldError(
        "form",
        "Une erreur inattendu s'est produite vérifiez votre connexion et réessayez"
      );
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
        <h4 className="text-base font-semibold">Ajouter un article au stock</h4>
      </CardBodyContent>
      <CardBodyContent className="space-y-5">
        {errors["form"] && (
          <div
            className={`bg-red-100 text-center border border-red-500 rounded-sm p-3 self-center max-w-[100%] mb-5`}
          >
            <p className={`text-red-500 text-base font-semibold`}>
              {errors["form"]}
            </p>
          </div>
        )}

        <Divider>Informations du produit</Divider>
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
                    <div className="animate-in">
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
                <div className="items-start rounded-md border p-3 border-neutral-500 flex space-x-2">
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
                      {field.name == "is_beer"
                        ? "Notez que si ce produit a des variantes, vous devez obligatoirement ajouter des variantes pour pouvoir ajouter aux factures."
                        : "Si ce produit a des emballages payants, cochez ici et sélectionnez un emballage pré-enregistré."}
                    </p>
                  </div>
                </div>
              ) : (
                <>
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
                </>
              )
            )}
          </div>
          <Divider>Prix de vente du produit</Divider>
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
                label={`prix de vente ${index + 1}`}
                size="small"
              />
            ))}
          </div>
          <div className="flex items-center justify-center w-full mt-4">
            <Button
              type="submit"
              variant={"default"}
              disabled={loading}
              className="bg-green-500 hover:bg-green-500 max-w-[550px] w-full"
            >
              {loading ? "Veuillez patienter..." : "Ajouter"}
            </Button>
          </div>
        </form>
      </CardBodyContent>
    </section>
  );
}
