"use client";
import CardBodyContent from "@/components/CardContent";
import {
Combobox } from "@/components/ComboBox";
import {DateRangePicker} from "@/components/DateRangePicker";
import SelectPopover from "@/components/SelectPopover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { fetchSalesPoints } from "@/redux/salesPointsSlicer";
import { AppDispatch,
RootState } from "@/redux/store";
import { datesData } from "@/utils/constants";
import {
  ArrowDown,
Check,
ChevronDown,
EllipsisVertical,
Trash,
X,
CheckCircle,
XCircle,
} from "lucide-react";
import moment from "moment";
import * as React from "react";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import { ColumnDef, Row } from "@tanstack/react-table";
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
import { toast } from "@/components/ui/app-toast";
import { deleteInventory } from "../inventory/functions";
import { TransitionProps } from "@mui/material/transitions";
import useForm, { initializeFormValues } from "@/utils/useFormHook";
import { createLoss, validateLoss, deleteLoss } from "./functions";
import { transformVariants } from "../../sell/newsell/functions";
import { fetchProducts } from "@/redux/productsSlicer";
import { fetchLosses } from "@/redux/losses";
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
  const { t: tCommon } = useTranslation("common");
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
    name: tCommon("status_filter.all"),
    value: null,
  });
  const { data: salespoints, status: salespointStatus } = useSelector(
    (state: RootState) => state.salesPoints
  );

  const { data: products, status: productsStatus } = useSelector(
    (state: RootState) => state.products
  );
  const { hasPermission, user, isAdmin } = usePermission()
  const [open, setOpen] = React.useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const inputs = React.useMemo(() => [
    ...(isAdmin() ? [{
      name: "sales_point",
      label: tCommon("sales_points.singular"),
      required: true,
      type: "select",
      options: salespoints,
    },] : []),
    {
      name: "product",
      label: tCommon("article"),
      required: true,
      type: "select",
      options: transformVariants(products),
    },
    {
      name: "quantity",
      label: tCommon("losses.fields.lost_quantity"),
      required: true,
      type: "number",
    },
    {
      name: "reason",
      label: tCommon("comment"),
      required: true,
      type: "text",
    },
  ], [products, salespoints])

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

  const getData = async (id: number) => {
    setLoading(true);
    const params = {
      sales_points: isAdmin() ? [id] : [user?.sales_point],
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
      sales_point: isAdmin() ? selectedSalesPoints : [user?.sales_point],
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
    if (!isAdmin()) {
      dispatch(fetchProducts({ sales_points: [user?.sales_point] }))
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
    ...(isAdmin() ? [{
      accessorKey: "sales_point",
      header: () => <div className="text-center w-[140px]">{tCommon("sales_points.singular")}</div>,
      cell: ({ row }: { row: Row<Loss> }) => {
        return (
          <div className="text-center font-medium">
            {row.original.sales_point_details.name}
          </div>
        );
      },
    },] : []),
    {
      accessorKey: "operateur",
      header: () => <div className="text-center w-[140px]">{tCommon("losses.columns.operator")}</div>,
      cell: ({ row }) => {
        return (
          <div className="text-center font-medium">
            {row.original.created_by_full_name}
          </div>
        );
      },
    },
    {
      accessorKey: "article",
      header: () => <div className="text-center w-[240px]">{tCommon("article")}</div>,
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
      accessorKey: "quantity",
      header: () => <div className="text-center w-[80px]">{tCommon("quantity")}</div>,
      cell: ({ row }) => {
        const variant = row.original;
        return (
          <div className="text-center font-medium">{row.original.quantity}</div>
        );
      },
    },
    {
      accessorKey: "status",
      header: () => <div className="text-center w-[140px]">{tCommon("billing.status")}</div>,
      cell: ({ row }) => {
        return (
          <div className="text-center font-medium">
            <p>
              <span
                className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-${row.original.is_validated ? "green" : "red"
                  }-500 text-${row.original.is_validated ? "white" : "black"}`}
              >
                {row.original.is_validated ? tCommon("status_filter.validated") : tCommon("status_filter.not_validated")}
              </span>
            </p>
          </div>
        );
      },
    },
    {
      accessorKey: "valide",
      header: () => <div className="text-center w-[140px]">{tCommon("losses.columns.validated_by")}</div>,
      cell: ({ row }) => {
        return (
          <div className="text-center font-medium">
            {row.original.validated_by_full_name ?? "-"}
          </div>
        );
      },
    },
    {
      accessorKey: "comment",
      header: () => <div className="text-center w-[270px]">{tCommon("comment")}</div>,
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
      accessorKey: "created_at",
      header: () => (
        <div className="text-center w-[140px]">{tCommon("losses.columns.created_at")}</div>
      ),
      cell: ({ row }) => {
        return (
          <div className="text-center font-medium">
            {new Date(row.original.created_at).toLocaleDateString()}
          </div>
        );
      },
    },
    {
      accessorKey: "validated_at",
      header: () => (
        <div className="text-right w-[140px]">{tCommon("losses.columns.validated_at")}</div>
      ),
      cell: ({ row }) => {
        return (
          <div className="text-center font-medium">
            {row.original.validated_at
              ? new Date(row.original.validated_at).toDateString()
              : "-"}
          </div>
        );
      },
    },
    ...(hasPermission('delete_loss') || hasPermission('validate_loss') ? [{
      accessorKey: "action",
      enableHiding: false,
      header: () => <div className="text-right w-[30px]">{tCommon("table.action")}</div>,
      cell: ({ row }: { row: Row<Loss> }) => {
        const handleValidateLoss = async () => {
          setLoading(true);
          try {
            const res = await validateLoss(row.original.id);
            if (res.data.success) {
              getLosses();
              return toast({
                title: tCommon("success"),
                variant: "success",
                description: res.data.success,
                icon: <CheckCircle className="size-4" />,
              });
            }
          } catch (error) {
            toast({
              title: tCommon("error"),
              description: `${error.response.data.error ??
                tCommon("losses.errors.validate")
                }`,
              icon: <XCircle className="size-4" />,
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
                title: tCommon("success"),
                variant: "success",
                description: res.data.success,
                icon: <CheckCircle className="size-4" />,
              });
            }
          } catch (error) {
            toast({
              title: tCommon("error"),
              variant: "destructive",
              description: `${error.response.data.error ??
                tCommon("losses.errors.delete")
                }`,
              icon: <XCircle className="size-4" />,
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
                  <span className="sr-only">{tCommon("open_menu")}</span>
                  <EllipsisVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>{tCommon("actions")}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {!row.original.is_validated && hasPermission('validate_loss') && (
                  <DropdownMenuItem
                    disabled={row.original.is_validated}
                    onClick={handleValidateLoss}
                  >
                    <ArrowDown size={14} className="mr-3 w-4 h-4" />
                    {tCommon("losses.actions.validate")}
                  </DropdownMenuItem>
                )}
                {!row.original.is_validated && hasPermission('delete_loss') && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-red-500 hover:text-red-500"
                      onClick={handleDeleteInventory}
                    >
                      {" "}
                      <Trash className="mr-3 w-4 h-4" size={14} />
                      {tCommon("losses.actions.delete")}
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          );
        }
      },
    },] : [])
  ];

  const handleSubmitForm = async () => {
    setLoading(true);
    let tempErrors = { ...errors };

    if (!values.sales_point && isAdmin()) {
      tempErrors.sales_point = tCommon("sales_points.select_required");
    } else {
      delete tempErrors.sales_point; // Supprime l'erreur si corrigée
    }

    if (!values.product) {
      tempErrors.product = tCommon("losses.errors.select_article");
    } else {
      delete tempErrors.product;
    }

    if (values.quantity < 1) {
      tempErrors.quantity = tCommon("losses.errors.invalid_quantity");
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
      const res = await createLoss({ ...values, sales_point: isAdmin() ? values.sales_point : user?.sales_point });
      setLoading(false);
      if (res.status === 201) {
        setSelectedSalesPoints([]);
        resetForm();
        handleClose();
        getLosses();
        return toast({
          title: tCommon("success"),
          description: tCommon("losses.success.created"),
          variant: "success",
          icon: <CheckCircle className="size-4" />,
        });
      }
    } catch (error) {
      return toast({
        title: tCommon("error"),
        description:
          error.response.data.error ??
          tCommon("losses.errors.create"),
        variant: "destructive",
        icon: <XCircle className="size-4" />,
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
          <h3 className="text-base">{tCommon("losses.title")}</h3>
          {
            hasPermission('add_loss') ?

              <Button
                variant={'secondary'}
                onClick={handleClickOpen}
                className=""
              >
                {tCommon("losses.actions.new")}
              </Button> : null
          }
        </div>
      </CardBodyContent>
      <CardBodyContent className="shadow border select-none p-5">
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
          {isAdmin() ? <SelectPopover
            selectedItems={selectedSalesPoints}
            items={salespoints}
            getOptionLabel={(option) => `${option.name} - ${option.address}`}
            onSelect={handleSelect}
            placeholder={tCommon("sales_points.label")}
          /> : null}
          <Combobox
            options={[
              { name: tCommon("status_filter.all"), value: null },
              { name: tCommon("status_filter.validated"), value: true },
              { name: tCommon("status_filter.not_validated"), value: false },
            ]}
            getOptionLabel={(option) => `${option.name}`}
            getOptionValue={(option) => `${option.name}`}
            placeholder={tCommon("billing.status")}
            RightIcon={ChevronDown}
            buttonLabel={tCommon("billing.status")}
            onValueChange={(el) => setStatus(el)}
            value={status}
          />
          <Button
            variant={"primary"}
            onClick={getLosses}
            className={cn(
              "w-full"
            )}
          >
            {tCommon("search.action")}
          </Button>
        </div>
      </CardBodyContent>
      <CardBodyContent>
        <h3>{tCommon("losses.list_title")}</h3>
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
                placeholder={tCommon("losses.filter_placeholder")}
                value={
                  table
                    ?.getColumn("article")
                    ?.getFilterValue() as string
                }
                onChange={(event) =>
                  table
                    ?.getColumn("article")
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
        <DialogTitle>{tCommon("losses.actions.new")}</DialogTitle>
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
                        options={input.options}
                        buttonLabel={input.label + "*"}
                        onValueChange={(e) => {
                          if (input.name === "sales_point") {
                            setFieldValue(input.name, e?.id);
                            setValues((prevValues) => ({
                              ...prevValues,
                              variant: null,
                              product: null,
                            }));
                            getData(e?.id);
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
                          `${option.id} ${option.name} ${input.name == "sales_point" ? option?.address : ""
                          }`
                        }
                        placeholder={input.label}
                        className="z-[99999] popover-content-width-full"
                        buttonClassName={errors[input.name] && "border-red-500"}
                        getOptionLabel={(option) =>
                          `${option.name} ${input.name == "sales_point"
                            ? " - " + option?.address
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
              {tCommon("cancel")}
            </Button>
            <Button type="submit">{tCommon("save")}</Button>
          </DialogActions>
        </form>
      </Dialog>
    </div>
  );
}
