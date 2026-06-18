import {
  instance
} from "@/components/fetch";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/app-toast";
import { usePermission } from "@/context/PermissionContext";
import { cn } from "@/lib/utils";
import { TextField } from "@mui/material";
import {
  Check,
  Pencil,
  X,
  CheckCircle,
  XCircle,
  CircleAlert,
} from "lucide-react";
import * as React from "react";
import { useTranslation } from "react-i18next";

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

  const { t } = useTranslation("common");
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
        variant: "warning",
        title: t("warning"),
        description: t("product.details.field_unchanged"),
        icon: <CircleAlert className="size-4" />,
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
          title: t("success"),
          description: t("product.details.updated"),
          icon: <CheckCircle className="size-4" />,
        });
      }
    } catch (error) {
      return toast({
        variant: "destructive",
        title: t("error"),
        description: t("product.details.update_error"),
        icon: <XCircle className="size-4" />,
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
        {/* <label className=" col-span-1 font-medium truncate max-w-full text-xs sm:text-sm">
          {translated}
        </label> */}
        <div className="w-full col-span-3 mr-1">
          <TextField
            fullWidth
            value={text}
            // disabled={!isSelected}
            onChange={(el) => {
              if (!isSelected) return;
              setText(el.target.value)
            }}
            size="small"
            label={translated}
            inputRef={inputRef}
          />
        </div>
        {/* ) : (
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
        )} */}
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
                <Button
                  onClick={() => {
                    onSelect("")
                    setText(input.value)
                  }}
                  variant="destructive"
                >
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
      <div className="flex items-center justify-start gap-3 ">
        <TextField
          fullWidth
          value={input?.value?.name}
          // disabled={!isSelected}
          size="small"
          label={translated}
          className="max-w-xs"
          inputRef={inputRef}
        />
      </div>
    );
  }
  return null;
};

export default InputComponent;
