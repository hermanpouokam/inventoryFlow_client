"use client";
import CardBodyContent from "@/components/CardContent";
import { Combobox } from "@/components/ComboBox";
import DateRangePicker from "@/components/DateRangePicker";
import SelectPopover from "@/components/SelectPopover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { fetchSalesPoints } from "@/redux/salesPointsSlicer";
import { AppDispatch, RootState } from "@/redux/store";
import { datesData } from "@/utils/constants";
import {
  ArrowDown,
  Check,
  ChevronDown,
  EllipsisVertical,
  Trash,
  X,
} from "lucide-react";
import moment from "moment";
import * as React from "react";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import { ColumnDef } from "@tanstack/react-table";
import { DataTableDemo } from "@/components/TableComponent";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuTrigger,
} from "@radix-ui/react-dropdown-menu";
import {
  Backdrop,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Slide,
  TextField,
} from "@mui/material";
import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { toast } from "@/components/ui/use-toast";
import { deleteInventory } from "../inventory/functions";
import { TransitionProps } from "@mui/material/transitions";
import useForm, { initializeFormValues } from "@/utils/useFormHook";
import { createLoss, validateLoss, deleteLoss } from "./functions";
import { transformVariants } from "../../sell/newsell/functions";
import { fetchProducts } from "@/redux/productsSlicer";
import { fetchLosses } from "@/redux/losses";
const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<any, any>;
  },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export default function Page() {
  const [pickedDateRange, setPickedDateRange] = React.useState<DateRange>({
    from: new Date().toString(),
    to: new Date().toString(),
  });
  const [loading, setLoading] = React.useState(false);
  const handleDateRangeChange = (range: DateRange) => {
    setPickedDateRange(range);
  };
  const dispatch: AppDispatch = useDispatch();
  const [selectedSalesPoints, setSelectedSalesPoints] = React.useState<
    SalesPoint[]
  >([]);
  const [status, setStatus] = React.useState<{
    name: string;
    value: boolean | null;
  } | null>({
    name: "tous",
    value: null,
  });
  const { data: salespoints, status: salespointStatus } = useSelector(
    (state: RootState) => state.salesPoints
  );

  const { data: products, status: productsStatus } = useSelector(
    (state: RootState) => state.products
  );

  const [open, setOpen] = React.useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const inputs = [
    {
      name: "sales_point",
      label: "Point de vente",
      required: true,
      type: "select",
      options: salespoints,
    },
    {
      name: "product",
      label: "Article",
      required: true,
      type: "select",
      options: transformVariants(products),
    },
    {
      name: "quantity",
      label: "Quantité perdu",
      required: true,
      type: "number",
    },
    {
      name: "reason",
      label: "Commentaire",
      required: true,
      type: "text",
    },
  ];

  const {
    values,
    errors,
    handleChange,
    handleSubmit,
    resetForm,
    setFieldError,
    setFieldValue,
    setValues,
    setErrors,
  } = useForm(initializeFormValues(inputs));

  const [table, setTable] = React.useState<any | null>(null);

  const { losses, status: lossesStatus } = useSelector(
    (state: RootState) => state.losses
  );
  const handleSelect = (data: SalesPoint) => {
    setSelectedSalesPoints((prev) =>
      prev.includes(data)
        ? prev.filter((item) => item !== data)
        : [...prev, data]
    );
  };

  const getData = async () => {
    setLoading(true);
    const params = {
      sales_point: [values["sales_point"]],
    };
    dispatch(fetchProducts(params));
    setLoading(false);
  };

  const getLosses = () => {
    const params = {
      start_date: moment(pickedDateRange?.from).format(
        "YYYY-MM-DDT00:00:00.SSS"
      ),
      end_date: moment(pickedDateRange?.to).format("YYYY-MM-DDT23:59:59.SSS"),
      sales_point: selectedSalesPoints,
      ...(status != null ? { is_validated: status.value } : {}),
    };
    dispatch(fetchLosses(params));
  };

  React.useEffect(() => {
    if (salespointStatus == "idle") {
      dispatch(fetchSalesPoints());
    }
    if (lossesStatus == "idle") {
      getLosses();
    }
  }, []);

const columns: ColumnDef<Loss>[] = [
  {
    accessorKey: "number",
    header: () => <div className="w-5">#</div>,
    cell: ({ row }) => (
      <div className="text-center">{row.getValue("number")}</div>
    ),
  },
  {
    accessorKey: "Point de vente",
    header: () => <div className="text-center w-[140px]">Point de vente</div>,
    cell: ({ row }) => {
      return (
        <div className="text-center font-medium">
          {row.original.sales_point_details.name}
        </div>
      );
    },
  },
  {
    accessorKey: "operateur",
    header: () => <div className="text-center w-[140px]">Opérateur</div>,
    cell: ({ row }) => {
      return (
        <div className="text-center font-medium">
          {row.original.created_by_name}
        </div>
      );
    },
  },
  {
    accessorKey: "Article",
    header: () => <div className="text-center w-[140px]">Article</div>,
    cell: ({ row }) => {
      const variant = row.original;
      return (
        <div className="text-center font-medium">
          {row.original.product_name} {row.original.variant_name}
        </div>
      );
    },
  },
  {
    accessorKey: "Quantité",
    header: () => <div className="text-center w-[140px]">Quantité</div>,
    cell: ({ row }) => {
      const variant = row.original;
      return (
        <div className="text-center font-medium">{row.original.quantity}</div>
      );
    },
  },
  {
    accessorKey: "Status",
    header: () => <div className="text-center w-[140px]">Status</div>,
    cell: ({ row }) => {
      return (
        <div className="text-center font-medium">
          <p>
            <span
              className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-${
                row.original.is_validated ? "green" : "red"
              }-500 text-${row.original.is_validated ? "white" : "black"}`}
            >
              {row.original.is_validated ? "Validé" : "Non validé"}
            </span>
          </p>
        </div>
      );
    },
  },
  {
    accessorKey: "valide",
    header: () => <div className="text-center w-[140px]">Validé par</div>,
    cell: ({ row }) => {
      return (
        <div className="text-center font-medium">
          {row.original.validated_by_name ?? "-"}
        </div>
      );
    },
  },
  {
    accessorKey: "Commentaire",
    header: () => <div className="text-center w-[270px]">Commentaire</div>,
    cell: ({ row }) => {
      const variant = row.original;
      return (
        <div className="text-justify truncate font-medium">
          {row.original.reason}
        </div>
      );
    },
  },
  {
    accessorKey: "Date de création",
    header: () => (
      <div className="text-right w-[140px]">Date de création</div>
    ),
    cell: ({ row }) => {
      return (
        <div className="text-right font-medium">
          {new Date(row.original.created_at).toLocaleString()}
        </div>
      );
    },
  },
  {
    accessorKey: "Date de création",
    header: () => (
      <div className="text-right w-[140px]">Date de validation</div>
    ),
    cell: ({ row }) => {
      return (
        <div className="text-center font-medium">
          {row.original.validated_at
            ? new Date(row.original.validated_at).toLocaleString()
            : "-"}
        </div>
      );
    },
  },
  {
    accessorKey: "Action",
    enableHiding: false,
    header: () => <div className="text-right w-[30px]">Action</div>,
    cell: ({ row }) => {
      const handleValidateLoss = async () => {
        setLoading(true);
        try {
          const res = await validateLoss(row.original.id);
          if (res.data.success) {
            await getLosses();
            return toast({
              title: "Succès",
              variant: "success",
              className: "bg-green-500 border-green-500",
              description: res.data.success,
              icon: <Check className="mr-2 h-4 w-4" />,
            });
          }
        } catch (error) {
          toast({
            title: "Erreur",
            className: "bg-red-500 border-red-500",
            description: `${
              error.response.data.error ??
              "Erreur lors de la validation de la perte"
            }`,
            icon: <X className="mr-2 h-4 w-4" />,
            variant: "destructive",
          });
        } finally {
          setLoading(false);
        }
      };

      const handleDeleteInventory = async () => {
        setLoading(true);
        try {
          const res = await deleteLoss(row.original.id);
          if (res.data.success) {
            await getLosses();
            return toast({
              title: "Succès",
              variant: "success",
              className: "bg-green-500 border-green-500",
              description: res.data.success,
              icon: <Check className="mr-2 h-4 w-4" />,
            });
          }
        } catch (error) {
          toast({
            title: "Erreur",
            className: "bg-red-500 border-red-500",
            variant: "destructive",
            description: `${
              error.response.data.error ??
              "Erreur lors de la suppression de l'inventaire"
            }`,
            icon: <X className="mr-2 h-4 w-4" />,
          });
        } finally {
          setLoading(false);
        }
      };

      if (!row.original.is_validated) {
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <EllipsisVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {!row.original.is_validated && (
                <DropdownMenuItem
                  disabled={row.original.is_validated}
                  onClick={handleValidateLoss}
                >
                  <ArrowDown size={14} className="mr-3 w-4 h-4" />
                  Valider la perte
                </DropdownMenuItem>
              )}
              {!row.original.is_validated && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-red-500 hover:text-red-500"
                    onClick={handleDeleteInventory}
                  >
                    {" "}
                    <Trash className="mr-3 w-4 h-4" size={14} />
                    Supprimer la perte
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      }
    },
  },
];

  const handleSubmitForm = async () => {
    setLoading(true);
    let tempErrors = { ...errors };

    if (!values.sales_point) {
      tempErrors.sales_point = "Sélectionnez un point de vente.";
    } else {
      delete tempErrors.sales_point; // Supprime l'erreur si corrigée
    }

    if (!values.product) {
      tempErrors.product = "Sélectionnez un article.";
    } else {
      delete tempErrors.product;
    }

    if (values.quantity < 1) {
      tempErrors.quantity = "La quantité ne peut pas être inférieure à 1.";
    } else {
      delete tempErrors.quantity;
    }

    // Mettre à jour l'état des erreurs
    setErrors(tempErrors);

    // Vérifie s'il reste des erreurs
    if (Object.keys(tempErrors).length > 0) {
      setLoading(false);
      return;
    }

    try {
      console.log(values);
      const res = await createLoss(values);
      setLoading(false);
      if (res.status === 201) {
        setSelectedSalesPoints([]);
        resetForm();
        handleClose();
        return toast({
          title: "Succès",
          description: "Perte ajoutée avec succès",
          variant: "success",
          className: "bg-green-600 border-green-600",
          icon: <Check className="mr-2 h-4 w-4" />,
        });
      }
    } catch (error) {
      return toast({
        title: "Erreur",
        description:
          error.response.data.error ??
          "Une erreur est survenue lors de l'ajout du fournisseur",
        variant: "destructive",
        className: "bg-red-600 border-red-600",
        icon: <X className="mr-2 h-4 w-4" />,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      <Backdrop
        sx={{ color: "#8b5cf6", zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={
          salespointStatus == "loading" ||
          productsStatus == "loading" ||
          lossesStatus == "loading" ||
          loading
        }
      >
        <CircularProgress color="inherit" />
      </Backdrop>
      <CardBodyContent>
        <div className="flex justify-between items-center">
          <h3 className="text-base font-semibold">Gestion de pertes</h3>

          <Button
            onClick={handleClickOpen}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            Entrer une perte
          </Button>
        </div>
      </CardBodyContent>
      <div className="shadow border select-none border-neutral-300 rounded-lg bg-white p-5">
        <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-5 gap-4">
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
            placeholder="Points de vente"
          />
          <Combobox
            options={[
              { name: "Tous", value: null },
              { name: "Validé", value: true },
              { name: "Non validé", value: false },
            ]}
            getOptionLabel={(option) => `${option.name}`}
            getOptionValue={(option) => `${option.name}`}
            placeholder="Status"
            RightIcon={ChevronDown}
            buttonLabel="Status"
            onValueChange={(el) => setStatus(el)}
            value={status}
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
        </div>
      </div>
      <CardBodyContent>
        <h3>Liste de perte</h3>
        <DataTableDemo
          setTableData={setTable}
          columns={columns}
          searchText=""
          filterAttributes={["created_by_name"]}
          data={[...losses]
            ?.sort(
              (a, b) =>
                new Date(a.created_at).getTime() -
                new Date(b.created_at).getTime()
            )
            .map((el, index) => {
              return { ...el, number: index + 1 };
            })}
        >
          <div className="flex items-center flex-col sm:flex-row space-y-3 justify-between py-4">
            <div className="flex gap-3 items-center flex-col sm:flex-row">
              <Input
                placeholder="Filtrer operateur..."
                value={
                  table
                    ?.getColumn("Nom de la variante")
                    ?.getFilterValue() as string
                }
                onChange={(event) =>
                  table
                    ?.getColumn("Nom de la variante")
                    ?.setFilterValue(event.target.value)
                }
                className="max-w-sm"
              />
            </div>
          </div>
        </DataTableDemo>
      </CardBodyContent>

      <Dialog
        open={open}
        TransitionComponent={Transition}
        keepMounted
        aria-describedby="alert-dialog-slide-description"
      >
        <DialogTitle>{"Entrez une perte."}</DialogTitle>
        <form onSubmit={(e) => handleSubmit(e, handleSubmitForm)}>
          <DialogContent>
            <div className="mb-4 space-y-4 sm:w-[450px]">
              {errors["form"] && (
                <div className="text-red-600 bg-red-100 border text-center rounded py-3 border-red-600">
                  {errors["form"]}
                </div>
              )}
              {inputs.map((input) => {
                if (input.type === "select" && Array.isArray(input.options)) {
                  return (
                    <div key={input.name}>
                      <Combobox
                        RightIcon={ChevronDown}
                        options={
                          input.name === "product"
                            ? values["sales_point"]
                              ? input.options
                              : []
                            : input.options
                        }
                        buttonLabel={input.label + "*"}
                        onValueChange={(e) => {
                          if (input.name === "sales_point") {
                            setFieldValue(input.name, e?.id);
                            setValues((prevValues) => ({
                              ...prevValues,
                              variant: null,
                              product: null,
                            }));
                            getData();
                          }
                          if (input.name === "product") {
                            setValues((prevValues) => ({
                              ...prevValues,
                              variant: e?.variant_id,
                              product: e?.product_id,
                            }));
                          }
                        }}
                        value={
                          input.name === "sales_point"
                            ? salespoints.find(
                                (s) => s.id == values["sales_point"]
                              )
                            : transformVariants(products).find(
                                (pr) => pr.id == values["product"]
                              )
                        }
                        getOptionValue={(option) =>
                          `${option.name} ${
                            input.name == "sales_point" ? option.address : ""
                          }`
                        }
                        placeholder={input.label}
                        className="z-[99999999999999999999999999999] popover-content-width-full"
                        buttonClassName={errors[input.name] && "border-red-500"}
                        getOptionLabel={(option) =>
                          `${option.name} ${
                            input.name == "sales_point"
                              ? " - " + option.address
                              : ""
                          }`
                        }
                      />
                      {errors[input.name] && (
                        <p className="text-red-500 text-xs font-medium ml-4 mt-1">
                          {errors[input.name]}
                        </p>
                      )}
                    </div>
                  );
                }
                if (
                  input.type === "text" ||
                  input.type === "email" ||
                  input.type === "number"
                ) {
                  return (
                    <TextField
                      key={input.name}
                      fullWidth
                      margin="dense"
                      label={input.label}
                      type={input.type}
                      required={input.required}
                      size="small"
                      name={input.name}
                      value={values[input.name]}
                      onChange={handleChange}
                      error={!!errors[input.name]}
                      helperText={errors[input.name]}
                    />
                  );
                }
              })}
            </div>
          </DialogContent>
          <DialogActions>
            <Button
              variant="destructive"
              onClick={() => {
                resetForm();
                handleClose();
              }}
            >
              Annuler
            </Button>
            <Button type="submit">Enregister</Button>
          </DialogActions>
        </form>
      </Dialog>
    </div>
  );
}
