"use client";
import CardBodyContent from "@/components/CardContent";
import { instance } from "@/components/fetch";
import { DataTableDemo } from "@/components/TableComponent";
import { Button } from "@/components/ui/button";
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
  DialogTitle,
  Divider,
  TextField,
} from "@mui/material";
import { ColumnDef } from "@tanstack/react-table";
import { Check, X } from "lucide-react";
import * as React from "react";
import { createVariant, formatteCurrency } from "../../functions";
import { useToast } from "@/components/ui/use-toast";
import { PlusOneTwoTone } from "@mui/icons-material";
import InputComponent from "../../articles/[id]/input";

export default function Page({ params }: { params: { id: string } }) {
  const decryptedParam = decryptParam(decodeURIComponent(params.id));
  const [product, setProduct] = React.useState<Packaging | null>(null);
  const [error, setError] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [selectedInput, setSelectedInput] = React.useState<string | null>(null);

  const getProduct = async (decryptedParam: string) => {
    try {
      const res = await instance.get(`/packagings/${decryptedParam}/`);
      if (res.status === 200) setProduct(res.data);
    } catch (error) {
      setError(error);
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  React.useLayoutEffect(() => {
    getProduct(decryptedParam);
  }, []);

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
      ["id", "sales_point", "enterprise", "created_at", "updated_at"].includes(
        key
      )
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
      </CardBodyContent>
      <CardBodyContent className="space-y-5">
        <Divider>DETAILS DE PRODUITS </Divider>
        <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 px-3">
          {inputData.map((input) => {
            if (input?.name != "supplier") {
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
                  link="packagings"
                />
              );
            }
          })}
        </div>
      </CardBodyContent>
    </div>
  );
}

const translations = {
  name: "nom",
  empty_quantity: "Quantité vide",
  full_quantity: "Quantité pleine",
  sales_point_details: "Point de vente",
  category_details: "Catégorie",
  supplier_details: "Fournisseur",
  price: "Prix d'achat",
  created_at: "Crée le",
  updated_at: "Dernière MAJ",
};
