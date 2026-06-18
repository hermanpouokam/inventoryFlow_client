import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { useTranslation } from "react-i18next";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Check, ChevronsUpDown } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "./ui/command";

interface SelectPopoverProps<T> {
  items: T[];
  selectedItems: T[];
  onSelect: (item: T) => void;
  placeholder?: string;
  getOptionLabel: (option: T) => string;

  searchPlaceholder?: string;
  noItemText?: string;
}

const SelectPopover = <T extends Record<string, any>>({
  items = [],
  selectedItems = [],
  getOptionLabel,
  onSelect,
  placeholder,
  searchPlaceholder,
  noItemText,
}: SelectPopoverProps<T>) => {
  const { t } = useTranslation("common");

  return (
    <Popover >
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          className={cn(
            "justify-between bg-transparent hover:bg-transparent hover:border-primary border-zinc-600 data-[state=open]:border-primary data-[state=open]:text-primary",
            selectedItems.length < 1 && "text-muted-foreground"
          )}
        >
          <div className="overflow-hidden max-w-[90%]">
            {selectedItems.length > 0
              ? selectedItems.length > 1
                ? t("select.selected_count", { count: selectedItems.length })
                : getOptionLabel(selectedItems[0])
              : placeholder ?? t("select.placeholder")}
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-70" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="popover-content-width-full px-1 py-2 bg-white dark:bg-background p-0 border-none shadow-lg"
      >
        <Command>
          <CommandInput placeholder={searchPlaceholder ?? t("select.search_placeholder")} />
          <CommandList className="scrollbar">
            <CommandEmpty>{noItemText ?? t("select.no_items")}</CommandEmpty>
            <CommandGroup className="">
              {items.map((item) => (
                <CommandItem
                  value={`${getOptionLabel(item)} ${item.id}`}
                  key={item.id}
                  onSelect={() => onSelect(item)}
                  className="py-2"
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      selectedItems.some((el) => el.id === item.id)
                        ? "opacity-100"
                        : "opacity-0"
                    )}
                  />
                  {getOptionLabel(item)}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default SelectPopover;
