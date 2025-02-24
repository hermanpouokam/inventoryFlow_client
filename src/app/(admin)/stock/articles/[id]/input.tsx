import { instance } from "@/components/fetch";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import { TextField } from "@mui/material";
import { Check, Pencil, X } from "lucide-react";
import * as React from "react";

type TranslationKeys = keyof typeof translations;
const getTranslation = (key: TranslationKeys): string => translations[key];

const translations = {
  name: "nom",
  total_quantity: "quantité",
  sales_point_details: "point de vente",
  category_details: "catégorie",
  package_details: "Emballage",
  supplier: "fournisseur",
  product_code: "code produit",
  sell_prices: "prix vente",
  price: "prix d'achat",
  is_beer: "Emballage",
};

const InputComponent = ({
  input,
  isSelected,
  onSelect,
  onSetLoading,
  loading,
  product,
  setProduct,
}: {
  input: any;
  isSelected: boolean;
  onSelect: (e: string) => void;
  onSetLoading: (state: boolean) => void;
  loading: boolean;
  setProduct: (product: Product) => void;
  product: Product;
}) => {
  const { toast } = useToast();
  const [text, setText] = React.useState(input?.value ?? "");
  const inputRef = React.useRef<HTMLInputElement | null>(null);

  React.useEffect(() => {
    if (isSelected && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isSelected]);

  const handleUpdateProduct = async () => {
    if (text === input?.value)
      return toast({
        title: "Aucun changement",
        description: "Le champ de saisie n'a pas été modifié",
        icon: <Pencil className="w-4 h-4" />,
        className: "border-gray-300 text-gray-500",
      });
    onSetLoading(true);
    try {
      const response = await instance.put(
        `/products/${product?.id}/`,
        {
          [input.name]: text,
        },
        { withCredentials: true }
      );
      if (response.status === 200) {
        setText(response.data[input.name]);
        setProduct(response.data);
        setTimeout(() => {
          window.location.reload();
        }, 1000);
        return toast({
          variant: "success",
          title: "Succès",
          description: "Le produit a bien été modifié",
          icon: <Check className="w-4 h-4" />,
          className: "bg-green-500 border-green-500 text-white",
        });
      }
    } catch (error) {
      return toast({
        variant: "destructive",
        title: "Erreur",
        description:
          "Une erreur est survenue lors de la modification du produit",
        icon: <X className="w-4 h-4" />,
        className: "bg-red-500 border-red-500 text-white",
      });
    } finally {
      onSetLoading(false);
    }
  };
  if (!input) return;
  const translated = getTranslation(input.label);
  if (
    input.type === "text" ||
    input.type === "number" ||
    input.type === "boolean"
  ) {
    return (
      <div className="flex items-center justify-start gap-3 overflow-hidden">
        <label className="text-sm col-span-1 font-medium">{translated}</label>

        {isSelected ? (
          <TextField
            fullWidth
            value={text}
            onChange={(el) => setText(el.target.value)}
            size="small"
            inputRef={inputRef} // Attache la ref ici pour qu'on puisse focus
          />
        ) : (
          <div
            className={cn(
              "col-span-2 border border-slate-400 rounded p-2 transition-all duration-300 overflow-hidden w-[60%]"
            )}
          >
            <h4>{input.value}</h4>
          </div>
        )}

        {["name", "product_code", "price"].includes(input.name) && (
          <div
          //   className={cn(
          //     "flex justify-center items-center gap-2 transition-all duration-150",
          //     !checked ? "translate-x-[80%]" : "translate-x-[0]"
          //   )}
          >
            {!isSelected ? (
              <Button
                variant="secondary"
                onClick={() => onSelect(input?.name ?? "")} // Sélectionne cet élément et désélectionne les autres
                className="transition-opacity duration-300"
              >
                <Pencil className="w-4 h-4" />
              </Button>
            ) : (
              <div
                className={cn(
                  "delay-150 duration-150 transition-all flex items-center gap-2",
                  isSelected ? "translate-x-0" : "translate-x-[50%]"
                )}
              >
                <Button onClick={() => onSelect("")} variant="destructive">
                  <X className="w-4 h-4" />
                </Button>
                <Button
                  variant="default"
                  onClick={handleUpdateProduct}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Check className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }
  if (input.type === "object" && input.value && input.name != "sell_prices") {
    return (
      <div className="flex items-center justify-start gap-3 overflow-hidden">
        <label className="text-sm  font-medium">{translated}</label>
        <div
          className={cn(
            "col-span-2 border border-slate-400 rounded p-2 transition-all duration-300 overflow-hidden w-[60%]"
          )}
        >
          <h4>{input.value?.name}</h4>
        </div>
      </div>
    );
  }
  return null;
};

export default InputComponent;
