"use client";

import * as React from "react";
import { Check, LucideProps } from "lucide-react";
import { useTranslation } from "react-i18next";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

// Generic type for option
interface ComboboxProps<T> {
  options: T[];
  value?: T | null; // Add value prop
  placeholder?: string;
  buttonLabel?: string;
  getOptionLabel: (option: T) => string;
  getOptionValue: (option: T) => string;
  onValueChange?: (value: T | null) => void;
  RightIcon: React.ForwardRefExoticComponent<
    Omit<LucideProps, "ref"> & React.RefAttributes<SVGSVGElement>
  >;
  className?: string;
  buttonClassName?: string;
  emptyStateMessage?: string;
}

export function Combobox<T>({
  options,
  value: propValue = null,
  placeholder,
  buttonLabel,
  getOptionLabel,
  getOptionValue,
  onValueChange,
  RightIcon,
  className,
  buttonClassName,
  emptyStateMessage,
}: ComboboxProps<T>) {
  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState<T | null>(propValue);
  const { t } = useTranslation("common");

  React.useEffect(() => {
    setValue(propValue);
  }, [propValue]);

  const handleSelect = (selectedValue: T) => {
    const isSameValue =
      value && getOptionValue(selectedValue) === getOptionValue(value);
    const newValue = isSameValue ? null : selectedValue;
    setValue(newValue);
    setOpen(false);
    onValueChange?.(newValue);
  };

  return (
    <div className="w-full z-40">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger className={cn("w-full", buttonClassName)} asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn("justify-between bg-transparent border border-zinc-600 hover:border-primary hover:bg-transparent", open && "border-primary hover:border-primary text-primary hover:text-[text-primary ")}
          >
            <span className="truncate">
              {value ? getOptionLabel(value) : buttonLabel ?? t("select.placeholder")}
            </span>
            <RightIcon className="opacity-50 w-4 h-4 -mr-1" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className={cn("px-1 py-2 popover-content-width-full z-[9999] bg-card p-0 border-0 shadow-lg", className)}
          align="start"
        >
          <Command className="bg-card dark:bg-background">
            <CommandInput placeholder={placeholder ?? t("select.search_placeholder")} className="p-4" />
            <CommandList>
              <CommandEmpty>{emptyStateMessage ?? t("select.no_data")}</CommandEmpty>
              <CommandGroup>
                {options.map((option) => (
                  <CommandItem
                    key={getOptionValue(option)}
                    value={getOptionValue(option)}
                    onSelect={() => handleSelect(option)}
                    className="py-2"
                  >
                    {getOptionLabel(option)}
                    <Check
                      className={cn(
                        "ml-auto",
                        value &&
                          getOptionValue(value) === getOptionValue(option)
                          ? "opacity-100"
                          : "opacity-0"
                      )}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div >
  );
}
