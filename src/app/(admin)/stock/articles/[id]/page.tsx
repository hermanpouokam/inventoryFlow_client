"use client";
import CardBodyContent from "@/components/CardContent";
import { instance } from "@/components/fetch";
import { DataTableDemo } from "@/components/TableComponent";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { decryptParam } from "@/utils/encryptURL";
import useForm, { initializeFormValues } from "@/utils/useFormHook";
import {
  Backdrop,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  TextField,
} from "@mui/material";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, Check, ChevronDown, Pencil, X } from "lucide-react";
import * as React from "react";
import { createVariant, formatteCurrency } from "../../functions";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import { el } from "date-fns/locale";
import { set } from "date-fns";
import InputComponent from "./input";
import InputPrice from "./SellPriceInput";
import { PlusOneTwoTone } from "@mui/icons-material";

export default function Page({ params }: { params: { id: string } }) {
  const decryptedParam = decryptParam(decodeURIComponent(params.id));
  const [product, setProduct] = React.useState<Product | null>(null);
  const [error, setError] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [table, setTable] = React.useState<any | null>(null);
  const [open, setOpen] = React.useState(false);
  const { toast } = useToast();
  const [selectedInput, setSelectedInput] = React.useState<string | null>(null);
  const [newPrice, setNewPrice] = React.useState<SellPrice | null>(null);
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
            // onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Nom de la variante
            {/* <ArrowUpDown className="ml-2 h-4 w-4" /> */}
          </div>
        );
      },
      cell: ({ row }) => {
        const variant = row.original;
        return <div className="capitalize">{variant.name}</div>;
      },
    },
    {
      accessorKey: "Prix d'achat",
      header: () => <div className="text-center w-[140px]">Prix d'achat</div>,
      cell: ({ row }) => {
        const variant = row.original;
        return (
          <div className="text-center font-medium">{Number(product.price)}</div>
        );
      },
    },
    {
      accessorKey: "quantité",
      header: () => <div className="text-center w-[140px]">quantité</div>,
      cell: ({ row }) => {
        const variant = row.original;
        return (
          <div className="text-center font-medium">{variant.quantity}</div>
        );
      },
      footer: () => {
        return <div className="w-full text-center ">Total</div>;
      },
    },
    {
      accessorKey: "Total",
      header: () => <div className="text-right w-[140px]">Total</div>,
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
      label: "Nom de variante",
      type: "text",
    },
    {
      name: "quantity",
      required: true,
      label: "Quantité",
      type: "text",
    },
  ];

  const { errors, handleChange, handleSubmit, resetForm, values } = useForm(
    initializeFormValues(inputs)
  );

  const handleCreateVariant = async () => {
    console.log("creating variant...");
    try {
      const res = await createVariant({ ...values, product: product.id });
      if (res.status === 201) {
        setOpen(false);
        setTimeout(() => {
          window.location.reload();
        }, 1000);
        return toast({
          variant: "success",
          title: "Succès",
          description: "La variante a bien été créée",
          className: "bg-green-600 border-green-600",
          icon: <Check className="w-4 h-4" />,
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Une est survenue lors de la creation de la variante",
        icon: <X className="w-4 h-4" />,
      });
    }
  };
  if (error) {
    <div className="flex justify-center items-center h-full w-full">
      Impossile d&apos;afficher les details de produits
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
      <CardBodyContent className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">{product?.name}</h3>
        {product?.with_variant && (
          <Button
            onClick={() => setOpen(true)}
            className="bg-green-600 hover:bg-green-600"
          >
            Ajouter une variante
          </Button>
        )}
      </CardBodyContent>
      <CardBodyContent className="space-y-5">
        <Divider>DETAILS DE PRODUITS </Divider>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {inputData.map((input) => (
            <InputComponent
              key={input?.name}
              input={input}
              isSelected={selectedInput === input?.name}
              onSelect={(el) => setSelectedInput(el)}
              loading={loading}
              onSetLoading={(el) => setLoading(el)}
              product={product}
              setProduct={(el) => setProduct(el)}
            />
          ))}
        </div>
        <Divider>
          {" "}
          PRIX DE VENTE{" "}
          <Chip
            label="Ajouter un prix"
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
              isSelected={selectedInput === `price0`}
              product={product}
            />
          ) : null}
        </div>
      </CardBodyContent>
      {product?.variants?.length > 0 && (
        <CardBodyContent>
          <h4 className="text-base font-semibold">Liste d&#39;articles</h4>
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
                  placeholder="Filtrer par articles..."
                  value={
                    table
                      ?.getColumn("Nom de la variante")
                      ?.getFilterValue() as string
                  }
                  onChange={(event) =>
                    table
                      ?.getColumn("Nom de la variante")
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
          <DialogTitle>Ajouter une variante</DialogTitle>
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
              Annuler
            </Button>
            <Button type="submit" className="bg-green-600 hover:bg-green-700">
              Ajouter
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </div>
  );
}
