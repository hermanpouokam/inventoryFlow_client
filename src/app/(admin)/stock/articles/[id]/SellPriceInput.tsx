import * as React from "react";
import { TextField } from "@mui/material";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Check, CircleAlert, Pencil, X } from "lucide-react";
import { instance } from "@/components/fetch";
import { useToast } from "@/components/ui/use-toast";

const InputPrice = ({
  input,
  isSelected,
  onSelect,
  onSetLoading,
  product,
}: {
  input: SellPrice;
  isSelected: boolean;
  onSelect: (e: string) => void;
  onSetLoading: (state: boolean) => void;
  product: Product;
}) => {
  const [text, setText] = React.useState(Number(input?.price) ?? "");
  const inputRef = React.useRef<HTMLInputElement | null>(null);
  const { toast } = useToast();

  React.useEffect(() => {
    if (isSelected && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isSelected]);

  const handleUpdateProduct = async () => {
    if (Number(text) == Number(input.price)) {
      return toast({
        title: "Aucun changement",
        description: "Le prix n'a pas changé",
        className: "bg-gray-200 border-gray-200",
        icon: <Pencil className="mr-2" />,
      });
    }
    if (product.sell_prices.find((pr) => Number(pr.price) === Number(text))) {
      return toast({
        title: "Attention",
        description: "Il semblerait que ce prix existe déjà.",
        variant: "destructive",
        className: "bg-orange-600 border-orange-600",
        icon: <CircleAlert className="w-4 h-4" />,
      });
    }
    if (input.id == 0) {
      if (Number(text) < Number(product.price)) {
        return toast({
          title: "Erreur",
          description:
            "Le prix de vente ne peux pas etre inferieur au prix d'achat.",
          variant: "destructive",
          className: "bg-red-600 border-red-600",
          icon: <X className="w-4 h-4" />,
        });
      }
      const response = await instance.post(
        `/sell-prices/`,
        {
          price: text,
          product: input.product,
        },
        { withCredentials: true }
      );
      if (response.status === 201) {
        setTimeout(() => {
          window.location.reload();
        }, 1000);
        return toast({
          title: "Succès",
          description: "Prix de vente créer avec succès",
          variant: "success",
          className: "bg-green-700 border-green-700",
          icon: <Check className="mr-2" />,
        });
      }
    }
    onSetLoading(true);
    try {
      const res = await instance.patch(
        `/sell-prices/${input.id}/`,
        {
          price: text,
        },
        { withCredentials: true }
      );
      if (res.status === 200) {
        // setProduct({ ...product, sell_prices: res.data });
        setTimeout(() => {
          window.location.reload();
        }, 1000);
        return toast({
          title: "Succès",
          description: "Prix mis à jour avec succès",
          variant: "success",
          className: "bg-green-700 border-green-700",
          icon: <Check className="mr-2" />,
        });
      }
    } catch (error) {
      return toast({
        title: "Erreur",
        description: "Une erreur est survenue veuillez réessayer",
        variant: "destructive",
        className: "bg-red-600 border-red-600",
        icon: <X className="w-4 h-4" />,
      });
    } finally {
      onSetLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-7 items-center gap-3 overflow-hidden">
      <label className="text-sm col-span-2 font-medium text-center">
        {input.id == 0 ? "Nouveau prix de vente" : "Prix de vente"}
      </label>
      <div className={cn(isSelected ? "col-span-3" : "col-span-4")}>
        {isSelected ? (
          <TextField
            fullWidth
            value={text}
            //@ts-ignore
            onChange={(el) => setText(el.target.value)}
            size="small"
            inputRef={inputRef}
            type="number"
          />
        ) : (
          <div
            className={cn(
              " border border-slate-400 rounded p-2 transition-all duration-300 overflow-hidden w-full"
            )}
          >
            <h4>{Number(input.price)}</h4>
          </div>
        )}
      </div>
      {!isSelected ? (
        <Button
          variant="secondary"
          onClick={() => onSelect(`price${input.id}`)} // Sélectionne cet élément et désélectionne les autres
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
  );
};

export default InputPrice;
