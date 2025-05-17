"use client";
import { AppDispatch, RootState } from "@/redux/store";
import { fetchSupplies } from "@/redux/supplies";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { generateCSV, groupBySupplierAndCategory } from "./functions";
import { Backdrop, CircularProgress } from "@mui/material";
import moment from "moment";
import DateRangePicker from "@/components/DateRangePicker";
import { Combobox } from "@/components/ComboBox";
import { datesData } from "@/utils/constants";
import { ChevronDown, CircleAlert, OctagonX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import SelectPopover from "@/components/SelectPopover";
import { fetchProductsCat } from "@/redux/productsCat";
import CardBodyContent from "@/components/CardContent";
import IconButton from "../../sell/roadmap/IconBtn";
import { useToast } from "@/components/ui/use-toast";
import { BlobProvider } from "@react-pdf/renderer";
import BuyRoadmap from "@/app/pdf/buyRoadMap";
import ReactDOM from "react-dom/client";
import { fetchSalesPoints } from "@/redux/salesPointsSlicer";
import { usePermission } from "@/context/PermissionContext";

export default function Page() {
  const dispatch: AppDispatch = useDispatch();
  const [pickedDateRange, setPickedDateRange] = React.useState<DateRange>({
    from: new Date().toString(),
    to: new Date().toString(),
  });
  const [organizedData, setOrganizedData] =
    React.useState<OrganizedRoute | null>(null);
  const [selectedSalesPoint, setSelectedSalesPoint] =
    React.useState<SalesPoint | null>(null);
  const { supplies, status, error } = useSelector(
    (state: RootState) => state.supplies
  );
  const [selectedProductsCat, setSelectedProductsCat] = React.useState([]);
  const {
    data: salesPoints,
    status: statusSalesPoints,
    error: errorSalesPoints,
  } = useSelector((state: RootState) => state.salesPoints);
  const {
    data: productsCat,
    status: productsCatStatus,
    error: productsCatError,
  } = useSelector((state: RootState) => state.productsCat);

  const { toast } = useToast();
  const { isAdmin, user } = usePermission()
  React.useEffect(() => {
    if (status === "idle") {
      dispatch(
        fetchSupplies({
          sales_point: isAdmin() ? selectedSalesPoint ? [selectedSalesPoint.id] : [] : [user?.sales_point],
          start_date: moment(pickedDateRange?.from).format(
            "YYYY-MM-DDT00:00:00.SSS"
          ),
          end_date: moment(pickedDateRange?.to).format(
            "YYYY-MM-DDT23:59:59.SSS"
          ),
        })
      );
    }
    if (productsCatStatus == 'idle' && !isAdmin()) {
      dispatch(fetchProductsCat({ sales_points_id: [user?.sales_point] }))
    }
    if (statusSalesPoints == "idle") {
      dispatch(fetchSalesPoints());
    }
  }, []);

  const getData = async () => {
    if (!selectedSalesPoint && isAdmin()) {
      return toast({
        variant: "destructive",
        className:
          "bg-red-500 border-red-500 text-white text-base font-semibold",
        title: "Erreur",
        description: "Veuillez selectionner un point de vente",
      });
    }
    const fetch = await dispatch(
      fetchSupplies({
        sales_point: isAdmin() ? [selectedSalesPoint?.id] : [user?.sales_point],
        start_date: moment(pickedDateRange?.from).format(
          "YYYY-MM-DDT00:00:00.SSS"
        ),
        end_date: moment(pickedDateRange?.to).format("YYYY-MM-DDT23:59:59.SSS"),
      })
    );
    if (fetchSupplies.fulfilled.match(fetch)) {
      const data: Supply[] = fetch.payload;
      if (!data.find((el) => el.status === "receipt")) {
        return toast({
          variant: "destructive",
          className:
            "bg-red-500 border-red-500 text-white text-base font-semibold",
          title: "Erreur",
          description: "Aucune donnée trouvée",
          icon: <OctagonX className="mr-2" />,
        });
      }
      if (data.some((item) => item.status === "pending")) {
        toast({
          variant: "destructive",
          className:
            "bg-orange-500 border-orange-500 text-white text-base font-semibold",
          title: "Attention",
          description: "Vous avez des commandes en attente dans cette période",
          icon: <CircleAlert className="mr-2" />,
        });
      }
      const organizedData = groupBySupplierAndCategory(
        data.filter((el) => el.status === "receipt")
      );
      setOrganizedData(organizedData);
    }
  };

  const handleDateRangeChange = (range: DateRange) => {
    setPickedDateRange(range);
  };

  const handleValueChange = (value: SalesPoint | null) => {
    setSelectedSalesPoint(value);
    dispatch(fetchProductsCat({ sales_points_id: value ? [value.id] : [] }));
    setSelectedProductsCat([]);
  };

  const handleSelect = (data: any) => {
    setSelectedProductsCat((prev: any) =>
      prev.includes(data)
        ? prev.filter((item: any) => item !== data)
        : [...prev, data]
    );
  };

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
          <BuyRoadmap
            salespoint={isAdmin() ? selectedSalesPoint : user?.sales_point_details}
            //@ts-ignore
            groupedData={organizedData}
            title={`Feuille de route d'achat du ${moment(pickedDateRange?.from).valueOf() ==
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

  const handleGenerateCSV = () => {
    generateCSV({
      groupedData: organizedData,
      title: `Feuille de route d'achat du ${moment(pickedDateRange?.from).valueOf() ==
        moment(pickedDateRange?.to).valueOf()
        ? `${moment(pickedDateRange?.from).format("DD/MM/YYYY")}.`
        : `${moment(pickedDateRange?.from).format("L")} au ${moment(
          pickedDateRange?.to
        ).format("L")}`
        } ${isAdmin() ? selectedSalesPoint?.name : user?.sales_point_details.name}`,
      salespoint: isAdmin() ? selectedSalesPoint : user?.sales_point_details,
    });
  };

  return (
    <div className="space-y-5">
      <Backdrop
        sx={{ color: "#8b5cf6", zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={
          status == "loading" ||
          statusSalesPoints == "loading" ||
          productsCatStatus == "loading"
        }
      >
        <CircularProgress color="inherit" />
      </Backdrop>{" "}
      <div className="shadow border select-none border-neutral-300 rounded-lg bg-white p-5">
        <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-4">
          <DateRangePicker
            defaultDateRange={pickedDateRange}
            datesData={datesData}
            onDateRangeChange={(date) => {
              if (date.from && date.to) {
                handleDateRangeChange(date);
              }
            }}
          />
          {isAdmin() ?
            <Combobox
              options={salesPoints}
              RightIcon={ChevronDown}
              onValueChange={handleValueChange}
              getOptionValue={(option) => `${option.name} - ${option.address}`}
              value={selectedSalesPoint}
              buttonLabel="Points de vente"
              getOptionLabel={(option) => `${option.name} - ${option.address}`}
              placeholder="Points de vente"
            /> : null}
          <SelectPopover
            items={productsCat}
            getOptionLabel={(option) => `${option.name}`}
            onSelect={handleSelect}
            selectedItems={selectedProductsCat}
            noItemText="Aucune catégorie de produit"
            placeholder="Catégories de produits"
            searchPlaceholder="Rechercher une catégorie"
          />
          <Button
            variant={"outline"}
            onClick={getData}
            disabled={!selectedSalesPoint && isAdmin()}
            className={cn(
              "w-full bg-green-600 hover:bg-green-700 hover:text-white text-white"
            )}
          >
            Rechercher
          </Button>
        </div>
      </div>
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
                text="Exporter en CSV"
                onClick={handleGenerateCSV}
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
