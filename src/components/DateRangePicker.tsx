"use client";

import * as React from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { DateRange } from "react-day-picker";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Field, FieldLabel } from "@/components/ui/field";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { useTranslation } from "react-i18next";

type DatePreset = {
  name: string;
  value: DateRange;
};

type Props = {
  defaultDateRange?: DateRange;
  datesData: DatePreset[];
  onDateRangeChange: (range: DateRange) => void;
  label?: string;
};

export function DateRangePicker({
  defaultDateRange,
  datesData,
  onDateRangeChange,
  label,
}: Props) {
  const [date, setDate] = React.useState<DateRange | undefined>(
    defaultDateRange
  );
  const { t: tCommon } = useTranslation("common")

  const handleSelect = (range: DateRange | undefined) => {
    setDate(range);
    if (range?.from && range?.to) {
      onDateRangeChange(range);
    }
  };

  const handlePreset = (preset: DatePreset) => {
    setDate(preset.value);
    onDateRangeChange(preset.value);
  };

  return (
    <Field className="w-full">
      {label && <FieldLabel>{label}</FieldLabel>}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="justify-start px-2.5 font-normal w-full bg-transparent hover:bg-transparent hover:border-primary border-zinc-600 data-[state=open]:border-primary data-[state=open]:text-primary"
          >
            <CalendarIcon className="mr-2 size-4" />

            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, "dd MMM yyyy")} -{" "}
                  {format(date.to, "dd MMM yyyy")}
                </>
              ) : (
                format(date.from, "dd MMM yyyy")
              )
            ) : (
              <span>{tCommon("date_range.select_placeholder")}</span>
            )}
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-auto p-3 gap-4 bg-card dark:bg-background" align="start">
          <div className=" max-w-[18rem] ml-5">
            <Select
              onValueChange={(value) => {
                const preset = datesData.find((p) => p.name === value);
                if (preset) handlePreset(preset);
              }}
              defaultValue={datesData[0].name}
            >
              <SelectTrigger className="w-full bg-card">
                <SelectValue placeholder={tCommon("date_range.select_placeholder")} />
              </SelectTrigger>

              <SelectContent>
                {datesData.map((preset) => (
                  <SelectItem key={preset.name} value={preset.name}>
                    {preset.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Calendar
            mode="range"
            selected={date}
            onSelect={handleSelect}
            numberOfMonths={2}
            showOutsideDays={false}
          />
        </PopoverContent>
      </Popover>
    </Field>
  );
}