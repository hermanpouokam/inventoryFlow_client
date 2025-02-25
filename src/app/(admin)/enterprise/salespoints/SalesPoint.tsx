"use client";
import CardBodyContent from "@/components/CardContent";
import { Button } from "@/components/ui/button";
import { fetchSalesPoints } from "@/redux/salesPointsSlicer";
import { AppDispatch, RootState } from "@/redux/store";
import {
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
} from "@mui/material";
import { DollarSign, Grid2x2X, Package, UsersRound } from "lucide-react";
import * as React from "react";
import { useDispatch, useSelector } from "react-redux";
import { formatteCurrency } from "../../stock/functions";
import useForm, { initializeFormValues } from "@/utils/useFormHook";
import { createSalesPoint } from "@/components/fetch";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { fetchProducts } from "@/redux/productsSlicer";
import { fetchBills } from "@/redux/billSlicer";
import { encryptParam, decryptParam } from "@/utils/encryptURL";

const fields = [
  {
    name: "name",
    label: "Nom du point de vente",
    type: "text",
    required: false,
  },
  {
    name: "address",
    label: "Adresse du point de vente",
    type: "text",
    required: false,
  },
  {
    name: "balance",
    label: "Montant initial du solde",
    type: "number",
    required: false,
  },
];

import RenderEmpoyees from "./renderEmployees";
import { useSearchParams } from "next/navigation";
import { SaleProfitChart } from "./renderChart";

const chartData = [
  { month: "January", desktop: 186, mobile: 80 },
  { month: "February", desktop: 305, mobile: 200 },
  { month: "March", desktop: 237, mobile: 120 },
  { month: "April", desktop: 190, mobile: 73 },
  { month: "May", desktop: 209, mobile: 130 },
  { month: "June", desktop: 214, mobile: 140 },
];

function SalesPoint() {
  const dispatch: AppDispatch = useDispatch();
  const { data, error, status } = useSelector(
    (state: RootState) => state.salesPoints
  );
  const {
    data: stock,
    error: errorStock,
    status: statusStock,
  } = useSelector((state: RootState) => state.products);
  const {
    data: bills,
    error: errorBills,
    status: statusBills,
  } = useSelector((state: RootState) => state.bills);
  const [selectedSalesPoints, setSelectedSalesPoints] = React.useState();
  const urlParams = useSearchParams();
  const encryptedSp = urlParams.get("spxts");
  const salespoint = decryptParam(encryptedSp);

  const [open, setOpen] = React.useState(false);

  const { errors, handleChange, handleSubmit, resetForm, values } = useForm(
    initializeFormValues(fields)
  );

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  React.useEffect(() => {
    if (status === "idle") {
      dispatch(fetchSalesPoints());
    }
    if (statusStock === "idle") {
      dispatch(fetchProducts({}));
    }
    if (statusBills === "idle") {
      dispatch(fetchBills({}));
    }
  }, [status, statusStock, statusBills, dispatch]);

  const cards = React.useMemo(
    () => [
      {
        icon: DollarSign,
        label: "Solde caisse",
        value: function () {
          const total = data.reduce((acc, sp) => acc + Number(sp.balance), 0);
          return `${formatteCurrency(total, "XAF", "fr-FR")}`;
        },
      },
      {
        icon: Package,
        label: "Montant du stock",
        value: function () {
          const total = stock.reduce(
            (acc, product) =>
              acc + product.total_quantity * parseFloat(product.price),
            0
          );
          return `${formatteCurrency(total, "XAF", "fr-FR")}`;
        },
      },
      {
        icon: UsersRound,
        label: "Dèttes client",
        value: function () {
          const total = bills
            .filter(
              (bill) => Number(bill.paid) != Number(bill.total_bill_amount)
            )
            .reduce(
              (acc, bill) =>
                acc + bill.total_bill_amount - (Number(bill?.paid) ?? 0),
              0
            );
          return `${formatteCurrency(total, "XAF", "fr-FR")}`;
        },
      },
      {
        icon: DollarSign,
        label: "Total du capital",
        value: function () {
          const total = data.reduce((acc, sp) => acc + Number(sp.balance), 0);
          return `${formatteCurrency(total, "XAF", "fr-FR")}`;
        },
      },
    ],
    [data, stock, bills]
  );

  const selectOptions = React.useMemo(
    () =>
      data.map((salespoint) => (
        <SelectItem key={salespoint.id} value={salespoint.id.toString()}>
          {`${salespoint.name} - ${salespoint.address}`}
        </SelectItem>
      )),
    [data]
  );

  return (
    <React.Suspense fallback={<div>Veuillez patienter</div>}>
      <div className="space-y-3">
        <CardBodyContent>
          <div className="flex flex-row justify-between items-center">
            <h2 className="text-base font-medium">Points de ventes</h2>
            <Button
              variant="default"
              onClick={handleClickOpen}
              className="bg-violet-600 hover:bg-violet-500"
            >
              Créer un point de vente
            </Button>
          </div>
        </CardBodyContent>

        <Select
          onValueChange={(value) => {
            const encryptedParam = encryptParam(value);
            window.location.assign(
              `${window.location.pathname}?spxts=${encodeURIComponent(
                encryptedParam
              )}`
            );
          }}
          value={salespoint?.toString()}
        >
          <SelectTrigger className="w-[280px] shadow">
            <SelectValue placeholder="Tous les points de vente" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Points de ventes</SelectLabel>
              {selectOptions}
            </SelectGroup>
          </SelectContent>
        </Select>

        {status === "loading" && (
          <div className="w-full h-[50%] mt-5 justify-center items-center flex">
            <CircularProgress color="inherit" size={35} />
          </div>
        )}

        {status === "succeeded" && (
          <>
            {data.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {cards.map((card, i) => (
                  <div
                    key={i}
                    className="shadow border select-none border-neutral-300 rounded-lg bg-white p-5"
                  >
                    <div className="flex flex-row justify-between items-center">
                      <p className="text-sm font-semibold">{card.label}</p>
                      <card.icon className="text-muted-foreground" size={15} />
                    </div>
                    <h2 className="text-2xl mt-2 font-bold">{card.value()}</h2>
                    <span className="text-xs text-red-600 -mt-2 text-muted-foreground">
                      +20.1% from last month
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="border-2 flex-col border-dashed h-[500px] gap-1 border-neutral-400 bg-white flex justify-center items-center">
                <Grid2x2X className="w-16 h-16" />
                <h3 className="font-bold text-xl">Aucun point de vente</h3>
                <h3 className="font-mediun text-base text-muted-foreground">
                  Vous n&apos;avez aucun point de vente
                </h3>
                <Button
                  variant="default"
                  onClick={handleClickOpen}
                  className="bg-violet-500 hover:bg-violet-600"
                >
                  Créer un point de vente
                </Button>
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-5">
              <CardBodyContent className="col-span-1 sm:col-span-3">
                {/* <div className="flex flex-row mb-5 justify-around items-center">
                                <h5 className='text-base font-semibold'>Ventes/bénéfices du jour</h5>
                                <select name="" id="" className='border border-slate-700 px-3 py-1 rounded text-base font-medium'>
                                    <option value="">Aujourd&apos;hui</option>
                                    <option value="">Cette semaine</option>
                                    <option value="">Ce mois ci</option>
                                    <option value="">Cette annee</option>
                                    <option value="">Tout</option>
                                </select>
                            </div> */}
                <SaleProfitChart chartData={chartData} />
                {/* <ChartContainer config={chartConfig}>
                                <BarChart accessibilityLayer data={chartData}>
                                    <CartesianGrid vertical={false} />
                                    <XAxis
                                        dataKey="month"
                                        tickLine={false}
                                        tickMargin={10}
                                        axisLine={false}
                                        tickFormatter={(value) => value.slice(0, 3)}
                                    />
                                    <YAxis
                                        dataKey="desktop"
                                        tickLine={false}
                                        tickMargin={10}
                                        axisLine={false}
                                    />
                                    <ChartTooltip
                                        cursor={false}
                                        content={<ChartTooltipContent hideLabel />}
                                    />
                                    <Bar dataKey="desktop" fill="var(--color-desktop)" radius={8} />
                                </BarChart>
                            </ChartContainer> */}
              </CardBodyContent>
              <CardBodyContent className="col-span-1 sm:col-span-2">
                <h2 className="text-base font-semibold">Employees</h2>
                <RenderEmpoyees salespoint={salespoint} />
              </CardBodyContent>
            </div>
          </>
        )}

        {status === "failed" && <div className="text-red-600">{error}</div>}

        <Dialog
          open={open}
          onClose={handleClose}
          PaperProps={{
            component: "form",
            onSubmit: async (event: React.FormEvent<HTMLFormElement>) => {
              event.preventDefault();
              try {
                await handleSubmit(event, await createSalesPoint(values));
                if (!errors) {
                  resetForm();
                  handleClose();
                }
              } catch (error) {
                console.log(error);
              }
            },
          }}
        >
          <DialogTitle>Créer un point de vente</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Entrez les informations du point de vente et enregistrez. <br />
              Assurez-vous de ne pas faire d&apos;erreur dans vos entrées.
            </DialogContentText>
            {fields.map((field) => (
              <TextField
                key={field.name}
                required
                value={values[field.name]}
                //@ts-ignore
                onChange={handleChange}
                margin="dense"
                name={field.name}
                label={field.label}
                type={field.type}
                autoComplete="off"
                fullWidth
                size="small"
              />
            ))}
          </DialogContent>
          <DialogActions>
            <Button variant={"destructive"} onClick={handleClose}>
              Annuler
            </Button>
            <Button
              type="submit"
              variant={"default"}
              className="bg-green-600 hover:bg-green-700"
            >
              Continuer
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    </React.Suspense>
  );
}

export default SalesPoint;
