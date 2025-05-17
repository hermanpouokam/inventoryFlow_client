"use client";

import CardBodyContent from "@/components/CardContent";
import { Combobox } from "@/components/ComboBox";
import DateRangePicker from "@/components/DateRangePicker";
import { instance } from "@/components/fetch";
import SelectPopover from "@/components/SelectPopover";
import { DataTableDemo } from "@/components/TableComponent";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import { fetchExpenses } from "@/redux/expenses";
import { fetchSalesPoints } from "@/redux/salesPointsSlicer";
import { AppDispatch, RootState } from "@/redux/store";
import { datesData } from "@/utils/constants";
import useForm, { Field, initializeFormValues } from "@/utils/useFormHook";
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
import { TransitionProps } from "@mui/material/transitions";
import { ColumnDef, Row } from "@tanstack/react-table";
import {
  ArrowDown,
  Check,
  ChevronDown,
  EllipsisVertical,
  Trash,
  X,
} from "lucide-react";
import moment from "moment";
import React from "react";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { deleteExpense, validateExpense } from "./functions";
import { usePermission } from "@/context/PermissionContext";
import { useTranslation } from "react-i18next";

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<any, any>;
  },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});
export default function Page() {
  const [open, setOpen] = React.useState(false);
  const [selectedSalesPoints, setSelectedSalesPoints] = React.useState<
    number[]
  >([]);
  const [text, setText] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [status, setStatus] = React.useState<{
    name: string;
    value: boolean | null;
  } | null>({
    name: "tous",
    value: null,
  });
  const [table, setTable] = React.useState<any | null>(null);
  const { user, hasPermission, isAdmin } = usePermission()
  const handleClickOpen = () => {
    setOpen(true);
  };
  const { t: tCommon } = useTranslation('common');

  const handleClose = () => {
    setOpen(false);
  };

  const dispatch: AppDispatch = useDispatch();
  const [pickedDateRange, setPickedDateRange] = React.useState<DateRange>({
    from: new Date().toString(),
    to: new Date().toString(),
  });
  const { data: salespoints, status: statusSalesPoint } = useSelector(
    (state: RootState) => state.salesPoints
  );

  const { expenses, status: statusExpenses } = useSelector(
    (state: RootState) => state.expenses
  );

  const getExpenses = async () => {
    const params = {
      start_date: moment(pickedDateRange?.from).format(
        "YYYY-MM-DDT00:00:00.SSS"
      ),
      end_date: moment(pickedDateRange?.to).format("YYYY-MM-DDT23:59:59.SSS"),
      sales_point: isAdmin() ? selectedSalesPoints : [user?.sales_point],
      ...(status != null ? { is_validated: status.value } : {}),
    };
    dispatch(fetchExpenses(params));
  };

  React.useEffect(() => {
    if (statusSalesPoint == "idle") {
      dispatch(fetchSalesPoints());
    }
    if (statusExpenses == "idle") {
      getExpenses();
    }
  }, []);

  const { toast } = useToast();

  const inputs = [
    ...(isAdmin() ? [{
      name: "sales_point",
      required: true,
      label: "Point de vente",
      type: "select",
      options: salespoints,
    }] : []),
    {
      name: "amount",
      required: true,
      label: "Montant",
      type: "number",
    },
    {
      name: "description",
      required: true,
      label: "Description",
      type: "text",
    },
  ];

  const {
    errors,
    handleChange,
    handleSubmit,
    resetForm,
    setValues,
    values,
    setFieldError,
  } = useForm(initializeFormValues(inputs));

  const submitForm = async () => {
    setLoading(true);
    if (values.amount < 1) {
      setLoading(false);
      return setFieldError("amount", "Entrez un montant valide");
    }
    if (!values.sales_point && isAdmin()) {
      setLoading(false);
      return setFieldError("sales_point", "Sélectionnez un point de vente");
    }
    try {
      const data = { ...values, remove_from_balance: true, ...(isAdmin() ? {} : { sales_point: user?.sales_point }) };
      const res = await instance.post("/expenses/", data, {
        withCredentials: true,
      });
      if (res.status == 201) {
        toast({
          variant: "default",
          description: "Dépense crée avec succès!",
          title: "Succès",
          className: "bg-green-600 border-green-600 text-white",
          icon: <Check className="mr-2" />,
        });
        resetForm();
        handleClose();
        await getExpenses();
        setLoading(false);
      }
    } catch (error) {
      setLoading(false);
      console.log(error);
      return toast({
        variant: "destructive",
        description: "Une erreur n'est produite veuillez réessayer!",
        title: "Erreur",
        className: "bg-red-600 border-red-600 text-white",
        icon: <Check className="mr-2" />,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (id: number) => {
    if (selectedSalesPoints.includes(id)) {
      setSelectedSalesPoints(selectedSalesPoints.filter((s) => s != id));
    } else {
      setSelectedSalesPoints((prev) => [...prev, id]);
    }
  };

  const handleDateRangeChange = (range: DateRange) => {
    setPickedDateRange(range);
  };

  const columns: ColumnDef<Expense>[] = [
    {
      accessorKey: "number",
      header: () => <div className="w-5">#</div>,
      cell: ({ row }) => (
        <div className="text-center">{row.getValue("number")}</div>
      ),
    },
    {
      accessorKey: "numero",
      header: () => (
        <div className="text-center w-[140px]">
          Dépense N<sup>o</sup>
        </div>
      ),
      cell: ({ row }) => {
        return (
          <div className="text-center font-medium">
            {row.original.expense_number}
          </div>
        );
      },
    },
    ...(isAdmin() ? [{
      accessorKey: "Point de vente",
      header: () => <div className="text-center w-[140px]">Point de vente</div>,
      cell: ({ row }: { row: Row<Expense> }) => {
        return (
          <div className="text-center font-medium">
            {row.original.sales_point_details?.name}
          </div>
        );
      },
    }] : []),
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
      header: () => <div className="text-center w-[140px]">Montant</div>,
      cell: ({ row }) => {
        const variant = row.original;
        return (
          <div className="text-center font-medium">{row.original.amount}</div>
        );
      },
    },
    {
      accessorKey: "Quantité",
      header: () => <div className="text-center w-[270px]">Commentaire</div>,
      cell: ({ row }) => {
        return (
          <div className="text-center font-medium">
            {row.original.description}
          </div>
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
                className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-${row.original.is_validated ? "green" : "red"
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
    ...(hasPermission('validate_expense') || hasPermission('delete_expense') ? [{
      accessorKey: "Action",
      enableHiding: false,
      header: () => <div className="text-right w-[30px]">Action</div>,
      cell: ({ row }) => {
        const handleValidateLoss = async () => {
          setLoading(true);
          try {
            const res = await validateExpense(row.original.id);
            if (res.data.success) {
              await getExpenses();
              return toast({
                title: "Succès",
                variant: "success",
                className: "bg-green-500 border-green-500",
                description: tCommon(`${res.data.success}`),
                icon: <Check className="mr-2 h-4 w-4" />,
              });
            }
          } catch (error) {
            toast({
              title: "Erreur",
              className: "bg-red-500 border-red-500",
              description: `${error.response.data.error ??
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
            const res = await deleteExpense(row.original.id);
            if (res.status === 204) {
              await getExpenses();
              return toast({
                title: "Succès",
                variant: "success",
                className: "bg-green-600 border-green-600",
                description: "Dépense supprimée avec succès",
                icon: <Check className="mr-2 h-4 w-4" />,
              });
            }
          } catch (error) {
            console.log(error);
            toast({
              title: "Erreur",
              className: "bg-red-500 border-red-500",
              variant: "destructive",
              description: `${error.response.data.error.replace("[", "") ??
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
                {!row.original.is_validated && hasPermission('validate_expense') && (
                  <DropdownMenuItem
                    disabled={row.original.is_validated}
                    onClick={handleValidateLoss}
                  >
                    <ArrowDown size={14} className="mr-3 w-4 h-4" />
                    Valider la dépense
                  </DropdownMenuItem>
                )}
                {!row.original.is_validated && hasPermission('delete_expense') && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-red-500 hover:text-red-500"
                      onClick={handleDeleteInventory}
                    >
                      {" "}
                      <Trash className="mr-3 w-4 h-4" size={14} />
                      Supprimer la dépense
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          );
        }
      },
    }] : []),
  ];

  return (
    <div className="space-y-5">
      <Backdrop
        sx={{ color: "#8b5cf6", zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={
          statusSalesPoint == "loading" ||
          statusExpenses == "loading" ||
          loading
        }
      >
        <CircularProgress color="inherit" />
      </Backdrop>
      <CardBodyContent className="flex justify-between items-center">
        <h2 className="text-base font-medium">Dépenses</h2>
        {
          hasPermission('add_expense') ?
            <Button
              onClick={handleClickOpen}
              className="bg-indigo-600 hover:bg-indigo-700 transition"
            >
              Entrer une depense
            </Button> : null
        }
      </CardBodyContent>
      <CardBodyContent className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-5">
        <DateRangePicker
          defaultDateRange={pickedDateRange}
          datesData={datesData}
          onDateRangeChange={(date) => {
            if (date.from && date.to) {
              handleDateRangeChange(date);
            }
          }}
        />
        {
          isAdmin() ?

            <SelectPopover
              items={salespoints}
              getOptionLabel={(option) => `${option.name} - ${option.address}`}
              selectedItems={selectedSalesPoints.map((s) => {
                const sp = salespoints.find((salespoint) => salespoint.id === s);
                return { ...sp } as SalesPoint;
              })}
              onSelect={(el) => handleSelect(el.id)}
              noItemText="Aucun point de vente"
              placeholder="Point de vente"
              searchPlaceholder="Rechercher un point de vente"
            />
            : null
        }
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
        />{" "}
        <Button
          onClick={getExpenses}
          className="bg-green-500 hover:bg-green-600 transition"
        >
          Rechercher
        </Button>
      </CardBodyContent>
      <CardBodyContent>
        <h2 className="text-base font-medium">Liste de dépenses</h2>
        <DataTableDemo
          setTableData={setTable}
          columns={columns}
          searchText={text}
          filterAttributes={["expense_number"]}
          data={[...expenses]
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
            <div className="flex gap-3 items-center flex-col sm:flex-row w-full">
              <Input
                placeholder="Filtrer par numero d'inventaire..."
                value={text}
                onChange={(event) => setText(event.target.value)}
                className="max-w-sm"
              />
            </div>
          </div>
        </DataTableDemo>
      </CardBodyContent>
      <Dialog
        open={open}
        onClose={handleClose}
        TransitionComponent={Transition}
      >
        <DialogTitle>Enter une depense</DialogTitle>
        <form onSubmit={(e) => handleSubmit(e, submitForm)}>
          <DialogContent sx={{ width: "100%" }}>
            <div className="max-w-[18rem] w-screen md:max-w-md space-y-5">
              {inputs.map((input) => {
                if (input.type == "select") {
                  return (
                    <div>
                      <Combobox
                        options={salespoints}
                        RightIcon={ChevronDown}
                        getOptionLabel={(option) =>
                          `${option.name} - ${option.address}`
                        }
                        getOptionValue={(option) =>
                          `${option.name} ${option.id} ${option.address}`
                        }
                        value={salespoints.find(
                          (s) => s.id === values[input.name]
                        )}
                        onValueChange={(val) =>
                          setValues((oldVal) => {
                            return { ...oldVal, [input.name]: val?.id };
                          })
                        }
                        placeholder={input.label}
                        className="z-[99999] popover-content-width-full"
                        buttonClassName={cn(
                          errors[input.name] && "border-red-600"
                        )}
                      />
                      {errors[input.name] ? (
                        <p className="text-red-500 text-xs pl-3 mt-1 font-normal">
                          {errors[input.name]}{" "}
                        </p>
                      ) : (
                        ""
                      )}
                    </div>
                  );
                } else {
                  return (
                    <TextField
                      autoFocus
                      required
                      margin="dense"
                      id={input.name}
                      name={input.name}
                      label={input.label}
                      size="small"
                      onChange={handleChange}
                      type={input.type}
                      value={values[input.name]}
                      fullWidth
                      error={!!errors[input.name]}
                      helperText={errors[input.name] && errors[input.name]}
                    />
                  );
                }
              })}
            </div>
          </DialogContent>
          <DialogActions>
            <Button
              className="bg-red-500 hover:bg-red-600 transition"
              onClick={handleClose}
            >
              Annuler
            </Button>
            <Button disabled={loading} type="submit">
              {!loading ? "Ajouter" : "Veuillez patienter"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </div>
  );
}
