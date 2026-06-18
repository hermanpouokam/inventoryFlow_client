"use client";

import {
  Tag,
  Users,
  Truck,
  Package,
  User,
  Box,
  Layers,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { DataType } from "@/lib/types";
import { DATA_TYPE_LABELS, DATA_TYPE_DESCRIPTIONS } from "@/lib/types";

const ICONS: Record<DataType, React.ElementType> = {
  category: Tag,
  client_category: Users,
  supplier: Truck,
  packaging: Package,
  client: User,
  product: Box,
  product_variant: Layers,
};

interface DataTypeSelectorProps {
  value: DataType | null;
  onChange: (type: DataType) => void;
}

const DATA_TYPES = Object.keys(DATA_TYPE_LABELS) as DataType[];

export function DataTypeSelector({ value, onChange }: DataTypeSelectorProps) {
  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
      {DATA_TYPES.map((type) => {
        const Icon = ICONS[type];
        const selected = value === type;
        return (
          <button
            key={type}
            onClick={() => onChange(type)}
            className={cn(
              "group relative flex flex-col items-start gap-2 rounded-lg border p-3.5 text-left transition-all duration-150",
              selected
                ? "border-primary/60 bg-accent glow-primary"
                : "border-border bg-card hover:border-border/80 hover:bg-muted"
            )}
          >
            <div
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-md transition-colors",
                selected
                  ? "bg-primary/20 text-primary"
                  : "bg-muted text-muted-foreground group-hover:text-foreground"
              )}
            >
              <Icon size={15} />
            </div>
            <div>
              <p
                className={cn(
                  "text-sm font-medium leading-none",
                  selected ? "text-foreground" : "text-foreground/80"
                )}
              >
                {DATA_TYPE_LABELS[type]}
              </p>
              <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                {DATA_TYPE_DESCRIPTIONS[type]}
              </p>
            </div>
            {selected && (
              <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-primary" />
            )}
          </button>
        );
      })}
    </div>
  );
}
