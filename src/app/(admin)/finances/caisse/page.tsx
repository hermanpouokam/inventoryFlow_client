"use client";
import CardBodyContent from "@/components/CardContent";
import DateRangePicker from "@/components/DateRangePicker";
import SelectPopover from "@/components/SelectPopover";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { RootState } from "@/redux/store";
import { datesData } from "@/utils/constants";
import { DollarSignIcon } from "lucide-react";
import moment from "moment";
import React from "react";
import { useSelector } from "react-redux";

export default function page() {
  const [selectedSalesPoints, setSelectedSalesPoints] = React.useState<
    SalesPoint[]
  >([]);
  const [loading, setLoading] = React.useState(false);

  const [pickedDateRange, setPickedDateRange] = React.useState<{
    from: Date | null;
    to: Date | null;
  } | null>({ from: new Date(), to: new Date() });

  const { data: bills, status: billsStatus } = useSelector(
    (state: RootState) => state.bills
  );

  const { data: salespoints, status: statusSalespoint } = useSelector(
    (state: RootState) => state.salesPoints
  );
  const handleDateRangeChange = (range: {
    from: Date | null;
    to: Date | null;
  }) => {
    setPickedDateRange(range);
  };
  const handleSelect = (data: SalesPoint) => {
    setSelectedSalesPoints((prev) =>
      prev.includes(data)
        ? prev.filter((item) => item !== data)
        : [...prev, data]
    );
  };

  const getData = async () => {
    setLoading(true);
    try {
      const params = {
        start_date: moment(pickedDateRange?.from).format(
          "YYYY-MM-DDT00:00:00.SSS"
        ),
        end_date: moment(pickedDateRange?.to).format("YYYY-MM-DDT23:59:59.SSS"),
        sales_point: selectedSalesPoints,
      };
      setLoading(false);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      <CardBodyContent>
        <div className="flex justify-between items-center">
          <h2>Ma caise</h2>
          <div className="flex">
            <Button className="bg-red-600 hover:bg-red-700 text-white text-sm ">
              Entrée de fonds
            </Button>
            <Button className="ml-2 bg-green-600 hover:bg-green-700 text-white text-sm ">
              Sortie de fonds
            </Button>
          </div>
        </div>
      </CardBodyContent>
      <CardBodyContent className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        <DateRangePicker
          defaultDateRange={pickedDateRange}
          datesData={datesData}
          onDateRangeChange={(date) => {
            if (date.from && date.to) {
              handleDateRangeChange(date);
            }
          }}
        />
        <SelectPopover
          selectedItems={selectedSalesPoints}
          items={salespoints}
          getOptionLabel={(option) => `${option.name} - ${option.address}`}
          onSelect={handleSelect}
          // displayProperties={["name", "address"]}
          placeholder="Points de vente"
        />
        <Button
          variant={"outline"}
          onClick={getData}
          className={cn(
            "w-full bg-green-600 hover:bg-green-700 hover:text-white text-white"
          )}
        >
          Rechercher
        </Button>
      </CardBodyContent>
      <div
        // key={i}
        className={
          "shadow-md border select-none border-neutral-300 rounded-lg bg-white p-5"
        }
      >
        <div className="flex flex-row justify-between items-center">
          <p className="text-sm font-semibold">Solde caisse</p>
          <DollarSignIcon className="text-muted-foreground" size={15} />
        </div>
        {/* {_.status.includes("loading") ? (
          <Skeleton className="h-8 mt-2" />
        ) : _.status.includes("failed") ? (
          <h2 className="text-2xl mt-2 font-bold ">{_.error}</h2>
        ) : (
          <h2 className="text-2xl mt-2 font-bold">{_.data()}</h2>
        )}
        {_.status.includes("loading") ? (
          <Skeleton className="h-[0.73rem] mt-2" />
        ) : _.status.includes("failed") ? (
          <span className={`text-xs font-medium -mt-2 ${_.subTextColor}`}>
            {}
          </span>
        ) : (
          <span className={`text-xs font-medium -mt-2 ${_.subTextColor()}`}>
            {_?.subText()}
          </span>
        )} */}
      </div>
    </div>
  );
}
