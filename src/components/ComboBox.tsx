"use client";

import * as React from "react";
import { Check, LucideProps } from "lucide-react";

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
}

export function Combobox<T>({
  options,
  value: propValue = null,
  placeholder = "Search...",
  buttonLabel = "Select...",
  getOptionLabel,
  getOptionValue,
  onValueChange,
  RightIcon,
  className,
  buttonClassName,
}: ComboboxProps<T>) {
  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState<T | null>(propValue);

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
    <div className="w-full">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger className={cn("w-full", buttonClassName)} asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="justify-between"
          >
            <span className="truncate">
              {value ? getOptionLabel(value) : buttonLabel}
            </span>
            <RightIcon className="opacity-50 w-4 h-4 -mr-1" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className={cn(
            "px-1 py-2",
            className ? className : "popover-content-width-full" 
          )}
          align="start"
        >
          <Command>
            <CommandInput placeholder={placeholder} className="p-4" />
            <CommandList>
              <CommandEmpty>No options found.</CommandEmpty>
              <CommandGroup>
                {options.map((option) => (
                  <CommandItem
                    key={getOptionValue(option)}
                    value={getOptionValue(option)}
                    onSelect={() => handleSelect(option)}
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
    </div>
  );
}
