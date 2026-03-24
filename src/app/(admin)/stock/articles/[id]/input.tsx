import { instance } from "@/components/fetch";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { usePermission } from "@/context/PermissionContext";
import { cn } from "@/lib/utils";
import { TextField } from "@mui/material";
import { Check, Pencil, X } from "lucide-react";
import * as React from "react";

const InputComponent = ({
  input,
  isSelected,
  onSelect,
  onSetLoading,
  loading,
  product,
  setProduct,
  translations,
  link = "products",
}: {
  input: any;
  isSelected: boolean;
  onSelect: (e: string) => void;
  onSetLoading: (state: boolean) => void;
  loading: boolean;
  setProduct: (product: Product) => void;
  product: Product;
  translations: Record<string, string>;
  link: "products" | "packagings";
}) => {
  type TranslationKeys = keyof typeof translations;
  const getTranslation = (key: TranslationKeys): string => translations[key];

  const { toast } = useToast();
  const [text, setText] = React.useState(input?.value ?? "");
  const inputRef = React.useRef<HTMLInputElement | null>(null);
  const { hasPermission, user } = usePermission()
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
      const response = await instance.patch(
        `/${link}/${product?.id}/`,
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
          icon: <Check className="mr-2" />,
          className: "bg-green-500 border-green-500 text-white",
        });
      }
    } catch (error) {
      return toast({
        variant: "destructive",
        title: "Erreur",
        description:
          "Une erreur est survenue lors de la modification du produit",
        icon: <X className="mr-2" />,
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
      <div className="grid grid-cols-5 gap-3 place-items-center space-x-1">
        <label className=" col-span-1 font-medium truncate max-w-full text-xs sm:text-sm">
          {translated}
        </label>
        {isSelected ? (
          <div className="w-full col-span-3 mr-1">
            <TextField
              fullWidth
              value={text}
              onChange={(el) => setText(el.target.value)}
              size="small"
              inputRef={inputRef}
            />
          </div>
        ) : (
          <div
            className={cn(
              "col-span-3 border border-slate-400 truncate rounded p-2 transition-all duration-300 overflow-hidden w-full"
            )}
          >
            <h4>
              {typeof input.value == "string"
                ? input.value
                : typeof input.value == "number"
                  ? Number(input.value)
                  : new Date(input.value).toLocaleString()}
            </h4>
          </div>
        )}
        {["name", "product_code", "price"].includes(input.name) && (
          <div>
            {(hasPermission('edit_product') && link == 'products') || (hasPermission('modifiy_packaging') && link == 'packagings') ? !isSelected ? (
              <Button
                variant="secondary"
                onClick={() => onSelect(input?.name ?? "")}
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
            ) : null}
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
