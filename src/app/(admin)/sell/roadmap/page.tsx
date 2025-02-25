"use client";
import React from "react";
import { getBill } from "../functions";
import { datesData, orientations } from "@/utils/constants";
import CardBodyContent from "@/components/CardContent";
import DateRangePicker from "@/components/DateRangePicker";
import SelectPopover from "@/components/SelectPopover";
import { AppDispatch, RootState } from "@/redux/store";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import { fetchSalesPoints } from "@/redux/salesPointsSlicer";
import { fetchClients } from "@/redux/clients";
import {
  Backdrop,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
} from "@mui/material";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import moment from "moment";
import { useToast } from "@/components/ui/use-toast";
import { BlobProvider } from "@react-pdf/renderer";
import ReactDOM from "react-dom/client";
import GroupedDataPDF from "@/app/pdf/MyDocument";
import exportToExcel, { groupByCustomer } from "./functions";
import IconButton from "./IconBtn";

export default function Page() {
  const [pickedDateRange, setPickedDateRange] = React.useState<
    | {
        from: Date | undefined;
        to: Date | undefined;
      }
    | undefined
  >({ from: new Date(), to: new Date() });
  const [loading, setLoading] = React.useState(false);
  const [customer, setCustomer] = React.useState<Customer[]>([]);
  const [salespoint, setSalespoint] = React.useState(null);
  const [orientation, setOrientation] = React.useState<string>(
    orientations[1].value
  );
  const dispatch: AppDispatch = useDispatch();

  const [organizedData, setOrganizedData] =
    React.useState<OrganizedRoute | null>(null);
  const { toast } = useToast();
  const {
    data: salespoints,
    status: salespointStatus,
    error: salespointError,
  } = useSelector((state: RootState) => state.salesPoints);
  const {
    data: customers,
    error: errorCustomers,
    status: statusCustomers,
  } = useSelector((state: RootState) => state.clients);

  const getData = async () => {
    if (!salespoint) {
      return toast({
        variant: "destructive",
        className:
          "bg-red-500 border-red-500 text-white text-base font-semibold",
        title: "Erreur",
        description: "Veuillez selectionner un point de vente",
      });
    }
    setLoading(true);
    try {
      const params = {
        customer: customer.map((el) => el.id),
        start_date: moment(pickedDateRange?.from).format(
          "YYYY-MM-DDT00:00:00.SSS"
        ),
        end_date: moment(pickedDateRange?.to).format("YYYY-MM-DDT23:59:59.SSS"),
        sales_point: [salespoint],
      };
      const res: Bill[] = await getBill(params);
      const unReceiptedBill = res.filter((el) => el.state == "created");
      if (unReceiptedBill.length > 0) {
        toast({
          variant: "destructive",
          className:
            "bg-orange-500 border-orange-500 text-white text-base font-semibold",
          title: "Attention",
          description: `Vous avez ${unReceiptedBill.length} facture(s) non receptionnée(s) dans cette période`,
        });
      }
      if (res.filter((el) => el.state != "created").length < 1) {
        setLoading(false);
        return toast({
          variant: "destructive",
          className:
            "bg-red-500 border-red-500 text-white text-base font-semibold",
          title: "Erreur",
          description: "Aucune facture receptionnée cette période",
        });
      }
      const groupedData = groupByCustomer(res);
      console.log(groupedData);
      setOrganizedData(groupedData);
      setLoading(false);
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  };

  const handleDateRangeChange = (range: {
    from: Date | null;
    to: Date | null;
  }) => {
    //@ts-ignore
    setPickedDateRange(range);
    console.log(range);
  };

  const handleSelectCustomers = (data: Customer) => {
    setCustomer((prev) =>
      prev.includes(data)
        ? prev.filter((item) => item !== data)
        : [...prev, data]
    );
  };

  const handleChangeOrientation = (e: any) => {
    setOrientation(e.target.value);
  };

  React.useEffect(() => {
    if (salespointStatus === "idle") {
      dispatch(fetchSalesPoints({}));
    }
  }, [salespointStatus, dispatch]);

  const handleOpenPDF = () => {
    const newWindow = window.open("", "_blank");
    if (!newWindow) {
      alert("Failed to open a new tab. Please allow popups for this site.");
      return;
    }
    newWindow.document.write("<p>Loading PDF...</p>");
    const pdfBlobProvider = (
      <BlobProvider
        document={
          <GroupedDataPDF
            orientation={orientation}
            salespoint={salespoints.find((el) => el.id == salespoint)}
            //@ts-ignore
            groupedData={organizedData}
            title={`Feuille de route de vente du ${
              moment(pickedDateRange?.from).valueOf() ==
              moment(pickedDateRange?.to).valueOf()
                ? `${moment(pickedDateRange?.from).format("DD/MM/YYYY")}.`
                : `${moment(pickedDateRange?.from).format("L")} au ${moment(
                    pickedDateRange?.to
                  ).format("L")}`
            }
        `}
          />
        }
      >
        {/* @ts-ignore */}
        {({ blob }) => {
          console.log("blob", blob);
          if (blob) {
            const blobUrl = URL.createObjectURL(blob);
            newWindow.location.href = blobUrl; // Redirect the popup to the blob URL
          } else {
            newWindow.document.write("<p>Failed to load the PDF.</p>");
          }
        }}
      </BlobProvider>
    );

    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = ReactDOM.createRoot(container);
    root.render(pdfBlobProvider);
  };

  const handleChangeSalesPoint = (e: any) => {
    dispatch(fetchClients({ sales_points: [e.target.value] }));
    setSalespoint(e.target.value);
  };
  const PDFButton = () => {
    const [isHovered, setIsHovered] = React.useState(false);

    return (
      <Button
        variant={"outline"}
        className="border-red-500 hover:bg-red-500 hover:text-white space-x-2"
        onClick={handleOpenPDF}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="1em"
          height="1em"
          viewBox="0 0 16 16"
          className="mr-2"
        >
          <path
            fill="none"
            stroke={isHovered ? "#FFF" : "#ed8796"}
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M2.8 14.34c1.81-1.25 3.02-3.16 3.91-5.5c.9-2.33 1.86-4.33 1.44-6.63c-.06-.36-.57-.73-.83-.7c-1.02.06-.95 1.21-.85 1.9c.24 1.71 1.56 3.7 2.84 5.56c1.27 1.87 2.32 2.16 3.78 2.26c.5.03 1.25-.14 1.37-.58c.77-2.8-9.02-.54-12.28 2.08c-.4.33-.86 1-.6 1.46c.2.36.87.4 1.23.15h0Z"
          ></path>
        </svg>
        Exporter en PDF
      </Button>
    );
  };

  const handleExport = () => {
    exportToExcel(organizedData, "GroupedData");
  };

  return (
    <div className="space-y-3">
      <Backdrop
        sx={{ color: "#8b5cf6", zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={
          salespointStatus == "loading" ||
          statusCustomers == "loading" ||
          loading
        }
      >
        <CircularProgress color="inherit" />
      </Backdrop>
      <CardBodyContent className="space-y-3">
        <h2 className="text-lg font-semibold">Feuille de route de ventes</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4">
          <DateRangePicker
            //@ts-ignore
            defaultDateRange={pickedDateRange}
            //@ts-ignore
            datesData={datesData}
            onDateRangeChange={(date) => {
              if (date.from && date.to) {
                handleDateRangeChange(date);
              }
            }}
          />
          <FormControl size="small" fullWidth>
            <InputLabel id="demo-simple-select-label">
              Point de vente
            </InputLabel>
            <Select
              labelId="demo-simple-select-label"
              id="demo-simple-select"
              label="Point de vente"
              size="small"
              value={salespoint}
              onChange={handleChangeSalesPoint}
            >
              {salespoints.map((s) => (
                <MenuItem key={s.id} value={s.id}>
                  {s.name} - {s.address}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <SelectPopover
            selectedItems={customer}
            items={customers}
            onSelect={handleSelectCustomers}
            getOptionLabel={(option) => option.name}
            placeholder="Clients"
            noItemText="Selectionnez un point de vente"
          />
          <FormControl size="small" fullWidth>
            <InputLabel id="demo-simple-select-label">Orientation</InputLabel>
            <Select
              labelId="demo-simple-select-label"
              id="demo-simple-select"
              label="Orientation"
              size="small"
              value={orientation}
              onChange={handleChangeOrientation}
            >
              {orientations.map((s) => (
                <MenuItem key={s.value} value={s.value}>
                  {s.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Button
            variant={"outline"}
            onClick={getData}
            disabled={!salespoint && true}
            className={cn(
              "w-full bg-green-600 hover:bg-green-700 hover:text-white text-white"
            )}
          >
            Générer
          </Button>
        </div>
      </CardBodyContent>
      <CardBodyContent>
        {organizedData ? (
          <>
            <h4 className="text-center">
              Feuille de route de vente du{" "}
              {moment(pickedDateRange?.from).valueOf() ==
              moment(pickedDateRange?.to).valueOf()
                ? `${moment(pickedDateRange?.from).format("DD/MM/YYYY")}.`
                : `${moment(pickedDateRange?.from).format("L")} au ${moment(
                    pickedDateRange?.to
                  ).format("L")}`}
            </h4>
            <div className="flex mt-3 items-center justify-center space-x-3">
              <PDFButton />{" "}
              <IconButton
                text="Exporter en xlsx"
                onClick={handleExport}
                icon={
                  "M14 14V4.5L9.5 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2M9.5 3A1.5 1.5 0 0 0 11 4.5h2V9H3V2a1 1 0 0 1 1-1h5.5zM3 12v-2h2v2zm0 1h2v2H4a1 1 0 0 1-1-1zm3 2v-2h3v2zm4 0v-2h3v1a1 1 0 0 1-1 1zm3-3h-3v-2h3zm-7 0v-2h3v2z"
                }
                buttonClass="border-green-500 hover:bg-green-500 hover:text-white"
                hoverColor="#FFF"
                defaultColor="#15803d"
              />
            </div>
          </>
        ) : (
          <h4 className="text-center">Aucune donnee générée</h4>
        )}
      </CardBodyContent>
    </div>
  );
}
