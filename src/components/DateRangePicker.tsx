"use client";
import React, { useEffect, useState } from "react";

import moment from "moment";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Button } from "./ui/button";
import { CalendarIcon } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { cn } from "@/lib/utils";
import { Calendar } from "./ui/calendar";

// Define the type for each date range item
interface DateRange {
  from: string | null;
  to: string | null;
}

interface DateRangeItem {
  name: string;
  value: DateRange;
}

// Define the props type for DateRangePicker
interface DateRangePickerProps {
  datesData: DateRangeItem[];
  onDateRangeChange: (range: DateRange) => void;
  defaultDateRange?: DateRange; // Optional default date range
}

const DateRangePicker: React.FC<DateRangePickerProps> = ({
  datesData,
  onDateRangeChange,
  defaultDateRange,
}) => {
  const [open, setOpen] = useState<boolean>(false);

  const [date, setDate] = useState<DateRangeItem>(
    defaultDateRange || datesData[0]
  );
  const [selectedDate, setSelectedDate] = useState<DateRange>({
    from: defaultDateRange?.from || date.value?.from || null,
    to: defaultDateRange?.to || date.value?.to || null,
  });

  useEffect(() => {
    if (onDateRangeChange) {
      onDateRangeChange(selectedDate);
    }
  }, []);

  const handleDateRangeChange = (newDate: DateRangeItem) => {
    setDate(newDate);
    setSelectedDate(newDate.value);
    setOpen(false);

    if (onDateRangeChange) {
      onDateRangeChange(newDate.value);
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          onClick={() => setOpen((prev) => !prev)}
          className={cn("w-full justify-start text-left font-normal")}
        >
          <CalendarIcon className="mr-4 h-4 w-4" />
          {selectedDate?.from && selectedDate?.to
            ? `${moment(selectedDate.from).format("DD/MM/YYYY")} - ${moment(
                selectedDate?.to
              ).format("DD/MM/YYYY")}`
            : "Select date range"}
        </Button>
      </PopoverTrigger>

      <PopoverContent className="p-1 w-full">
        <div className="flex space-x-5">
          <Select
            onValueChange={(value: DateRangeItem) =>
              handleDateRangeChange(value)
            }
            defaultValue={date}
          >
            <SelectTrigger>
              <SelectValue>{date.name}</SelectValue>
            </SelectTrigger>
            <SelectContent position="popper">
              {datesData.map((obj, i) => (
                <SelectItem
                  className={cn(
                    "w-full flex items-center justify-start text-left font-semibold"
                  )}
                  key={i}
                  value={obj}
                >
                  {obj.name ?? "Sélectionnez une période"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant={"outline"}
            onClick={() => {
              const newDate = {
                name:
                  datesData.find((d) => d.value === selectedDate)?.name ??
                  moment(selectedDate?.from).format("DD/MM/YYYY") +
                    " - " +
                    moment(selectedDate?.to).format("DD/MM/YYYY"),
                value: {
                  from: selectedDate.from ? new Date(selectedDate.from) : null,
                  to: selectedDate.to ? new Date(selectedDate.to) : null,
                },
              };
              handleDateRangeChange(newDate);
            }}
            disabled={!selectedDate?.to || !selectedDate?.from}
            className={cn(
              "w-full bg-green-600 hover:bg-green-700 hover:text-white text-white"
            )}
          >
            Continue
          </Button>
        </div>
        <Calendar
          initialFocus
          mode="range"
          defaultMonth={selectedDate?.from || new Date()}
          selected={selectedDate}
          onDayClick={(e: Date) => {
            if (!selectedDate.from) {
              setSelectedDate({
                from: e,
                to: null,
              });
            } else if (selectedDate?.to) {
              setSelectedDate({
                from: e,
                to: null,
              });
            } else if (
              selectedDate?.from &&
              !selectedDate?.to &&
              new Date(selectedDate?.from) > new Date(e)
            ) {
              setSelectedDate({
                from: e,
                to: null,
              });
            } else {
              setSelectedDate({ ...selectedDate, to: e });
            }
          }}
          numberOfMonths={2}
        />
      </PopoverContent>
    </Popover>
  );
};

export default DateRangePicker;
