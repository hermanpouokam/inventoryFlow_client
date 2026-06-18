"use client";
import CardBodyContent from "@/components/CardContent";
import {
  Combobox
} from "@/components/ComboBox";
import SelectPopover from "@/components/SelectPopover";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  AppDispatch,
  RootState
} from "@/redux/store";
import useForm,
{ initializeFormValues } from "@/utils/useFormHook";
import {
  Backdrop,
  CircularProgress,
  TextField,
  Dialog as MuiDialog,
  DialogTitle,
  DialogContentText,
  DialogActions,
  Button as MuiButton,
  DialogContent,
} from "@mui/material";
import {
  Check,
  ChevronDown,
  EllipsisVertical,
  Pencil,
  Trash,
  X,
  CheckCircle,
  XCircle,
} from "lucide-react";
import * as React from "react";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { createSupplier } from "../functions";
import { toast } from "@/components/ui/app-toast";
import { fetchSuppliers } from "@/redux/suppliersSlicer";
import { DataTableDemo } from "@/components/TableComponent";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ColumnDef } from "@tanstack/react-table";
import { deleteSupplier } from "../../sell/functions";
import { instance } from "@/components/fetch";
import { fetchSalesPoints } from "@/redux/salesPointsSlicer";
import { usePermission } from "@/context/PermissionContext";
import { useTranslation } from "react-i18next";


export default function Page() {
  const dispatch: AppDispatch = useDispatch();
  const {
    data: salespoints,
    status,
    error,
  } = useSelector((state: RootState) => state.salesPoints);
  const {
    data: suppliers,
    status: statusSuppliers,
    error: errorSuppliers,
  } = useSelector((state: RootState) => state.suppliers);

  const [selectedSalesPoints, setSelectedSalesPoints] = React.useState<
    number[]
  >([]);
  const [loading, setLoading] = React.useState(false);
  const [searchText, setSearchText] = React.useState("");
  const [table, setTable] = React.useState<any | null>(null);
  const handleSearch = (sp?: number[]) => {
    dispatch(fetchSuppliers({ sales_points_id: sp }));
  };
  const { t: tCommon } = useTranslation('common');

  const handleSelect = (id: number) => {
    if (selectedSalesPoints.includes(id)) {
      setSelectedSalesPoints(selectedSalesPoints.filter((s) => s != id));
    } else {
      setSelectedSalesPoints((prev) => [...prev, id]);
    }
  };

  React.useEffect(() => {
    document.title = "Fournisseurs";
    if (status === "idle") {
      dispatch(fetchSalesPoints());
      handleSearch();
    }
  }, []);
  const { hasPermission, user } = usePermission();

  const buttonRef = React.useRef<HTMLButtonElement>(null);

  const handleClick = () => {
    if (buttonRef.current) {
      buttonRef.current.click();
    }
  };

  const inputs = [
    ...(user?.user_type === "admin"
      ? [{
        name: "sales_point",
        label: tCommon("sales_points.singular"),
        required: true,
        type: "select",
        options: salespoints,
      }]
      : []),
    {
      name: "name",
      label: tCommon("supplier.form.name"),
      required: true,
      type: "text",
    },
    {
      name: "ab_name",
      label: tCommon("supplier.form.abbreviation"),
      required: false,
      type: "text",
    },
    {
      name: "email",
      label: tCommon("supplier.form.email"),
      required: false,
      type: "email",
    },
    {
      name: "contact",
      label: tCommon("supplier.form.phone"),
      required: false,
      type: "text",
    },
  ];


  const handleDeleteSupplier = async () => {
    try {
      const res = await deleteSupplier(currentSupplier?.id);

      if (res.status === 204) {
        return toast({
          title: tCommon("success"),
          variant: "success",
          description: tCommon("supplier.supplier_deleted_success"),
          icon: <CheckCircle className="size-4" />,
        });
      }

      if (
        res.status === 400 &&
        res.data.code === "MATCHING_SUPPLIES_FOUNDED"
      ) {
        return toast({
          title: tCommon("error"),
          description: tCommon("supplier.supplier_delete_blocked"),
          variant: "destructive",
          icon: <XCircle className="size-4" />,
        });
      }
    } catch (error) {
      return toast({
        title: tCommon("error"),
        description: tCommon("supplier.supplier_delete_error"),
        variant: "destructive",
        icon: <XCircle className="size-4" />,
      });
    } finally {
      setOpen(null);
      setCurrentSupplier(null);
      handleSearch();
      setLoading(false);
    }
  };

  const {
    values,
    errors,
    handleChange,
    handleSubmit,
    resetForm,
    setFieldError,
    setFieldValue,
  } = useForm(initializeFormValues(inputs));
  const [open, setOpen] = React.useState<"add" | "delete" | null>(null)
  const [currentSupplier, setCurrentSupplier] = React.useState<Supplier | null>(
    null
  );


  const submitForm = async () => {
    setLoading(true);

    if (!values.sales_point && user?.user_type == "admin") {
      setLoading(false);
      return setFieldError(
        "sales_point",
        tCommon("supplier.select_sales_point_error")
      );
    }

    try {
      const res = await createSupplier(values);
      setLoading(false);

      if (res.status === 201) {
        handleClick();
        setSelectedSalesPoints([]);
        handleSearch([]);
        setOpen(null);
        resetForm();

        return toast({
          title: tCommon("success"),
          description: tCommon("supplier.supplier_created_success"),
          variant: "success",
          icon: <CheckCircle className="size-4" />,
        });
      }
    } catch (error) {
      setLoading(false);

      return toast({
        title: tCommon("error"),
        description: tCommon("supplier.supplier_create_error"),
        variant: "destructive",
        icon: <XCircle className="size-4" />,
      });
    } finally {
      setLoading(false);
    }
  };


  const SupplierActions = ({ row }: { row: ColumnDef<Supplier> }) => {

    const [load, setLoad] = React.useState(false);
    const [editOpen, setEditOpen] = React.useState(false); // pour l'AlertDialog d'édition
    const [menuOpen, setMenuOpen] = React.useState(false);

    const inputsModifications = [
      {
        label: tCommon("supplier.form.name"),
        name: "name",
        type: "text",
        value: row.original.name,
        required: true,
      },
      {
        label: tCommon("supplier.form.abbreviation"),
        name: "ab_name",
        type: "text",
        value: row.original.ab_name || "",
        required: false,
      },
      {
        label: tCommon("supplier.form.email"),
        name: "email",
        type: "email",
        value: row.original.email || "",
        required: false,
      },
      {
        label: tCommon("supplier.form.phone"),
        name: "contact",
        type: "text",
        value: row.original.contact || "",
        required: false,
      },
    ];

    const {
      values: valuesM,
      errors: errorsM,
      handleChange: handleChangeM,
      resetForm: resetFormM,
      handleSubmit: handleSubmitM,
    } = useForm(initializeFormValues(inputsModifications));

    const handleModify = async () => {
      setLoad(true);
      try {
        const res = await instance.put(
          `/suppliers/${row.original.id}/`,
          valuesM,
          { withCredentials: true }
        );

        if (res.status === 200) {
          resetFormM();
          setSelectedSalesPoints([]);
          handleSearch();

          toast({
            title: tCommon("success"),
            description: tCommon("supplier.toast.update_success"),
            variant: "success",
            icon: <CheckCircle className="size-4" />,
          });
        }
      } catch (error) {
        toast({
          title: tCommon("error"),
          description: tCommon("supplier.toast.update_error"),
          variant: "destructive",
          icon: <XCircle className="size-4" />,
        });
      } finally {
        setLoad(false);
      }
    };

    const handleDelete = async () => {
      setLoading(true);
      try {
        const res = await instance.get(
          `/supplies/?suppliers=${row.original.id}`,
          { withCredentials: true }
        );

        if (res.data.length > 0) {
          toast({
            title: tCommon("error"),
            description: tCommon("supplier.toast.delete_blocked"),
            variant: "destructive",
            icon: <XCircle className="size-4" />,
          });
        } else {
          setCurrentSupplier(row.original);
          setOpen("delete");
        }
      } catch (error) {
        toast({
          title: tCommon("error"),
          description: tCommon("supplier.toast.delete_error"),
          variant: "destructive",
          icon: <XCircle className="size-4" />,
        });
      } finally {
        setLoading(false);
      }
    };

    return (
      <div className="flex justify-center items-center">
        <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost">
              <EllipsisVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent className="w-36">
            {hasPermission("edit_supplier") && (
              <DropdownMenuItem
                className="w-full"
                onSelect={(e) => {
                  e.preventDefault();        // empêche Radix de fermer/refocus avant l'ouverture du dialog
                  setMenuOpen(false);         // ferme le dropdown explicitement
                  setEditOpen(true);          // ouvre le dialog d'édition
                }}
              >
                {tCommon("edit")}
                <DropdownMenuShortcut>
                  <Pencil className="h-4 w-4" />
                </DropdownMenuShortcut>
              </DropdownMenuItem>
            )}

            {hasPermission("delete_supplier") && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-red-600 hover:text-white hover:bg-red-600"
                  onSelect={(e) => {
                    e.preventDefault();
                    setMenuOpen(false);
                    handleDelete();
                  }}
                >
                  {tCommon("supplier.actions.delete")}
                  <DropdownMenuShortcut>
                    <Trash className="h-4 w-4" />
                  </DropdownMenuShortcut>
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* AlertDialog d'édition désormais INDÉPENDANT du DropdownMenu */}
        <AlertDialog open={editOpen} onOpenChange={setEditOpen}>
          <AlertDialogContent className="max-w-lg">
            <AlertDialogHeader>
              <AlertDialogTitle>
                {tCommon("supplier.modal.edit_supplier")}
              </AlertDialogTitle>
            </AlertDialogHeader>

            <form onSubmit={(e) => handleSubmitM(e, async () => {
              await handleModify();
              setEditOpen(false);
            })}>
              <div className="mb-4 space-y-4">
                {inputsModifications.map((input) => (
                  <TextField
                    key={input.name}
                    fullWidth
                    margin="dense"
                    label={input.label}
                    type={input.type}
                    required={input.required}
                    size="small"
                    name={input.name}
                    value={valuesM[input.name]}
                    onChange={handleChangeM}
                    error={!!errorsM[input.name] && valuesM[input.name] !== ""}
                    helperText={valuesM[input.name] !== "" && errorsM[input.name]}
                  />
                ))}
              </div>

              <AlertDialogFooter>
                <AlertDialogCancel
                  onClick={() => {
                    resetFormM();
                    setEditOpen(false);
                  }}
                  className="destructive"
                >
                  {tCommon("supplier.actions.cancel")}
                </AlertDialogCancel>

                <Button type="submit" disabled={load} variant={'primary'}>
                  {load ? tCommon("supplier.actions.loading") : tCommon("supplier.actions.confirm")}
                </Button>
              </AlertDialogFooter>
            </form>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    );
  };

  const actionsColumn =
    hasPermission("edit_supplier") || hasPermission("delete_supplier")
      ? {
        id: "actions",
        enableHiding: false,
        header: () => (
          <div className="text-center w-[50px]">
            {tCommon("bills.columns.actions")}
          </div>
        ),
        cell: ({ row }: { row: Supplier }) => <SupplierActions row={row} />,
      }

      : null;

  const columns: ColumnDef<Supplier>[] = [
    {
      accessorKey: "number",
      header: () => <div className="w-[20px]">#</div>,
      cell: ({ row }) => (
        <div className="lowercase">{row.getValue("number")}</div>
      ),
    },
    ...(user?.user_type === "admin"
      ? [
        {
          accessorKey: "sales_point",
          header: () => (
            <div className="text-center w-[220px]">
              {tCommon("bills.columns.sales_point")}
            </div>
          ),
          cell: ({ row }: { row: Row<Supplier> }) => (
            <div className="text-center capitalize truncate">
              {row.original.sales_point_details.name} -{" "}
              {row.original.sales_point_details.address}
            </div>
          ),
        },
      ]
      : []),

    {
      accessorKey: "name",
      header: () => (
        <div className="text-center w-[220px]">
          {tCommon("bills.columns.supplier_name")}
        </div>
      ),
      cell: ({ row }) => (
        <div className="text-center text-base font-medium capitalize">
          {row.original.name}
        </div>
      ),
    },

    {
      accessorKey: "ab_name",
      header: () => (
        <div className="text-center w-[220px]">
          {tCommon("bills.columns.abbreviation")}
        </div>
      ),
      cell: ({ row }) => (
        <div className="text-center text-base font-medium">
          {row.original.ab_name?.trim() ? row.original.ab_name : "N/A"}
        </div>
      ),
    },

    {
      accessorKey: "email",
      header: () => (
        <div className="text-center w-[190px]">
          {tCommon("bills.columns.email")}
        </div>
      ),
      cell: ({ row }) => (
        <div className="text-center">
          {row.original.email?.trim() ? row.original.email : "N/A"}
        </div>
      ),
    },

    {
      accessorKey: "contact",
      header: () => (
        <div className="text-center w-[190px]">
          {tCommon("bills.columns.phone")}
        </div>
      ),
      cell: ({ row }) => (
        <div className="text-center">
          {row.original.contact?.trim() ? row.original.contact : "N/A"}
        </div>
      ),
    },

    {
      accessorKey: "created_at",
      header: () => (
        <div className="text-center w-[200px]">
          {tCommon("bills.columns.created_at")}
        </div>
      ),
      cell: ({ row }) => (
        <div className="text-center">
          {new Date(row.original.created_at).toLocaleString()}
        </div>
      ),
    },

    {
      accessorKey: "last_update",
      header: () => (
        <div className="text-center w-[200px]">
          {tCommon("bills.columns.updated_at")}
        </div>
      ),
      cell: ({ row }) => (
        <div className="text-center">
          {new Date(row.original.last_update).toLocaleString()}
        </div>
      ),
    },

    ...(actionsColumn ? [actionsColumn] : []),
  ];


  return (
    <div className="space-y-5">
      <Backdrop
        sx={{ color: "#8b5cf6", zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={
          statusSuppliers == "loading" ||
          status == "loading" ||
          loading
        }
      >
        <CircularProgress color="inherit" />
      </Backdrop>

      <CardBodyContent className="flex justify-between items-center">
        <h2 className="text-base font-semibold">
          {tCommon("supplier.title")}
        </h2>

        {hasPermission("add_supplier") && (
          <Button
            onClick={() => setOpen("add")}
            variant="secondary"
          >
            {tCommon("supplier.actions.add_supplier")}
          </Button>
        )}
      </CardBodyContent>

      {user?.user_type === "admin" && (
        <CardBodyContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 content-center">
            <SelectPopover
              items={salespoints}
              getOptionLabel={(option) =>
                `${option.name} - ${option.address}`
              }
              onSelect={(e) => handleSelect(e.id)}
              selectedItems={selectedSalesPoints.map((id) => {
                const sp = salespoints.find((s) => s.id === id);
                return { ...sp };
              })}
              searchPlaceholder={tCommon("supplier.filters.search_sales_point")}
              noItemText={tCommon("supplier.filters.no_sales_point")}
              placeholder={tCommon("supplier.filters.sales_point")}
            />

            <Button
              variant="primary"
              onClick={() => handleSearch(selectedSalesPoints)}
            >
              {tCommon("search.action")}
            </Button>
          </div>
        </CardBodyContent>
      )}

      <CardBodyContent className="">
        <h3 className="font-medium text-base">
          {tCommon("supplier.list.title")}
        </h3>

        <DataTableDemo
          setTableData={setTable}
          filterAttributes={["name",]}
          searchText={searchText}
          columns={columns}
          data={suppliers
            .map((el, index) => ({
              ...el,
              number: index + 1,
            }))
            .sort(
              (a, b) =>
                new Date(b.last_update).getTime() -
                new Date(a.last_update).getTime()
            )}
        >
          <div className="flex items-center justify-between py-4">
            <Input
              placeholder={tCommon("supplier.filters.search_supplier")}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="max-w-xs"
            />
          </div>
        </DataTableDemo>
      </CardBodyContent>

      <MuiDialog
        open={open ?? false}
        aria-labelledby="dialog-title"
        aria-describedby="dialog-description"
      >
        {open === "add" && (
          <DialogContent className="max-w-lg bg-card dark:bg-background">
            <DialogTitle>{tCommon("supplier.modal.add_supplier")}</DialogTitle>

            <form
              onSubmit={(e) => handleSubmit(e, submitForm)}
              id="subscription-form"
            >
              <div className="mb-4 space-y-4">
                {inputs.map((input) => {
                  if (input.type === "select") {
                    return (
                      <div key={input.name}>
                        <Combobox
                          RightIcon={ChevronDown}
                          options={input.options}
                          buttonLabel={input.label}
                          getOptionLabel={(option) => `${option.name} - ${option.address}`}
                          onValueChange={(e) =>
                            setFieldValue(input.name, e?.id)
                          }
                          value={salespoints.find(
                            (s) => s.id === values[input.name]
                          )}
                          getOptionValue={(option) =>
                            `${option.name} ${option.address}`
                          }
                          placeholder={input.label}
                        />

                        {errors[input.name] && (
                          <p className="text-red-500 text-xs ml-4 mt-1">
                            {errors[input.name]}
                          </p>
                        )}
                      </div>
                    );
                  }

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
                      error={
                        !!errors[input.name] && values[input.name] !== ""
                      }
                      helperText={
                        values[input.name] !== "" && errors[input.name]
                      }
                    />
                  );
                })}
              </div>

              <DialogActions>
                <Button
                  onClick={() => {
                    resetForm();
                    setOpen(null);
                  }}
                  variant={'destructive'}
                >
                  {tCommon("cancel")}
                </Button>

                <Button type="submit" disabled={loading} variant={'primary'}>
                  {!loading
                    ? tCommon("add")
                    : `${tCommon("please wait")}...`}
                </Button>
              </DialogActions>
            </form>
          </DialogContent>
        )}

        {open === "delete" && (
          <DialogContent className="max-w-lg bg-card dark:bg-background">
            <DialogTitle>
              {tCommon("supplier.modal.delete_supplier")}
            </DialogTitle>

            <DialogContentText className="p-3">
              {tCommon("supplier.confirm.delete_message", {
                name: currentSupplier?.name,
              })}

              <p className="text-orange-400 font-medium">
                {tCommon("supplier.confirm.delete_warning")}
              </p>
            </DialogContentText>

            <DialogActions>
              <MuiButton
                color="error"
                className="bg-red-600 hover:bg-red-700"
                onClick={() => {
                  setOpen(null);
                  setCurrentSupplier(null);
                }}
              >
                {tCommon("cancel")}
              </MuiButton>

              <MuiButton
                disabled={loading}
                color="success"
                onClick={handleDeleteSupplier}
                className="bg-green-600 hover:bg-green-700"
              >
                {loading
                  ? tCommon("please wait")
                  : tCommon("delete")}
              </MuiButton>
            </DialogActions>
          </DialogContent>
        )}
      </MuiDialog>
    </div>
  );
}
