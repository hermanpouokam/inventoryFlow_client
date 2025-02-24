import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
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
  placeholder = "Select an item",
  searchPlaceholder = "Search...",
  noItemText = "No items found.",
}: SelectPopoverProps<T>) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          className={cn(
            "justify-between",
            selectedItems.length < 1 && "text-muted-foreground"
          )}
        >
          <div className="overflow-hidden max-w-[90%]">
            {selectedItems.length > 0
              ? selectedItems.length > 1
                ? `${selectedItems.length} selected`
                : getOptionLabel(selectedItems[0])
              : placeholder}
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="popover-content-width-full px-1 py-2"
      >
        <Command>
          <CommandInput placeholder={searchPlaceholder} />
          <CommandList>
            <CommandEmpty>{noItemText}</CommandEmpty>
            <CommandGroup>
              {items.map((item) => (
                <CommandItem
                  value={getOptionLabel(item)}
                  key={item.id}
                  onSelect={() => onSelect(item)}
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
