"use client";
import CardBodyContent from "@/components/CardContent";
import { Combobox } from "@/components/ComboBox";
import SelectPopover from "@/components/SelectPopover";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { AppDispatch, RootState } from "@/redux/store";
import useForm, { initializeFormValues } from "@/utils/useFormHook";
import {
  Backdrop,
  CircularProgress,
  TextField,
  Dialog as MuiDialog,
  DialogTitle,
  DialogContentText,
  DialogActions,
  Button as MuiButton,
} from "@mui/material";
import {
  Check,
  ChevronDown,
  EllipsisVertical,
  Pencil,
  Trash,
  X,
} from "lucide-react";
import * as React from "react";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { createSupplier } from "../functions";
import { useToast } from "@/components/ui/use-toast";
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
import { deleteSupplier, getSupplies } from "../../sell/functions";
import { instance } from "@/components/fetch";
import { fetchSalesPoints } from "@/redux/salesPointsSlicer";

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
  const handleSelect = (id: number) => {
    if (selectedSalesPoints.includes(id)) {
      setSelectedSalesPoints(selectedSalesPoints.filter((s) => s != id));
    } else {
      setSelectedSalesPoints((prev) => [...prev, id]);
    }
  };
  const { toast } = useToast();
  React.useEffect(() => {
    window.document.title = "Fournisseurs";
    if (status === "idle") {
      dispatch(fetchSalesPoints());
    }
    handleSearch();
  }, []);

  const buttonRef = React.useRef<HTMLButtonElement>(null);

  const handleClick = () => {
    if (buttonRef.current) {
      buttonRef.current.click();
    }
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
      name: "name",
      label: "Nom",
      required: true,
      type: "text",
    },
    {
      name: "ab_name",
      label: "Nom abrégé",
      required: false,
      type: "text",
    },
    { name: "email", label: "Email", required: false, type: "email" },
    {
      name: "contact",
      label: "Numero de téléphone",
      required: false,
      type: "text",
    },
  ];

  const handleDeleteSupplier = async () => {
    try {
      const res = await deleteSupplier(currentSupplier?.id);
      if (res.status === 204) {
        return toast({
          title: "Succès",
          variant: "success",
          description: "fournisseur supprimé avec succès.",
          className: "bg-green-600 border-green-600",
          icon: <Check className="mr-2" />,
        });
      } else if (
        res.status === 400 &&
        res.data.code === "MATCHING_SUPPLIES_FOUNDED"
      ) {
        return toast({
          title: "Erreur",
          description:
            "Impossible de supprimer le fournisseur car il est associé à des approvisionements.",
          variant: "destructive",
          className: "bg-red-600 border-red-600",
          icon: <X className="mr-2" />,
        });
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description:
          "Une erreur s'est produite lors de la suppression du fournisseur",
        variant: "destructive",
        className: "bg-red-600 border-red-600",
        icon: <X className="mr-2" />,
      });
    } finally {
      setOpen(false);
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
  const [open, setOpen] = React.useState(false);
  const [currentSupplier, setCurrentSupplier] = React.useState<Supplier | null>(
    null
  );

  const submitForm = async () => {
    setLoading(true);
    if (!values.sales_point) {
      return setFieldError("sales_point", "Sélectionnez un point de vente");
    }

    try {
      const res = await createSupplier(values);
      setLoading(false);
      if (res.status === 201) {
        handleClick();
        setSelectedSalesPoints([]);
        handleSearch([]);
        return toast({
          title: "Succès",
          description: "Fournisseur ajouté avec succès",
          variant: "success",
          className: "bg-green-600 text-white border-green-600 ",
          icon: <Check className="mr-2" />,
        });
      }
    } catch (error) {
      setLoading(false);
      return toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'ajout du fournisseur",
        variant: "destructive",
        className: "bg-red-600 border-red-600",
        icon: <X className="mr-2" />,
      });
    } finally {
      setLoading(false);
    }
  };

  const columns: ColumnDef<Supplier>[] = [
    {
      accessorKey: "number",
      header: () => <div className="w-[20px]">#</div>,
      cell: ({ row }) => (
        <div className="lowercase ">{row.getValue("number")}</div>
      ),
    },
    {
      accessorKey: "Point de vente",
      header: () => <div className="text-center w-[220px]">Point de vente</div>,
      cell: ({ row }) => (
        <div className="text-center capitalize truncate">
          {row.original.sales_point_details.name} -{" "}
          {row.original.sales_point_details.address}
        </div>
      ),
    },
    {
      accessorKey: "Nom du fournisseur",
      header: ({ column }) => {
        return (
          <div
            className="text-center w-[220px]"
            // onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Nom du fournisseur
            {/* <ArrowUpDown className="ml-2 h-4 w-4" /> */}
          </div>
        );
      },
      cell: ({ row }) => {
        return (
          <div className="capitalize text-center text-base font-medium">
            {row.original.name}
          </div>
        );
      },
      // footer: () => <div className="text-right">Total</div>,
    },
    {
      accessorKey: "Abréviation",
      header: ({ column }) => {
        return (
          <div
            className="text-center w-[220px]"
            // onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Abréviation
            {/* <ArrowUpDown className="ml-2 h-4 w-4" /> */}
          </div>
        );
      },
      cell: ({ row }) => {
        return (
          <div className="capitalize text-center text-base font-medium">
            {row.original.ab_name
              ? row.original.ab_name != "" && row.original.ab_name
              : "N/A"}
          </div>
        );
      },
      // footer: () => <div className="text-right">Total</div>,
    },
    {
      accessorKey: "email",
      header: () => <div className="text-center w-[190px]">Email</div>,
      cell: ({ row }) => (
        <div className="capitalize text-center">
          {row.original.email
            ? row.original.email != "" && row.original.email
            : "N/A"}
        </div>
      ),
    },
    {
      accessorKey: "Numéro",
      header: () => <div className="text-center w-[190px]">Numéro</div>,
      cell: ({ row }) => (
        <div className="capitalize text-center">
          {row.original.contact
            ? row.original.contact != "" && row.original.contact
            : "N/A"}
        </div>
      ),
    },
    {
      accessorKey: "Date de création",
      header: () => (
        <div className="text-center w-[200px]">Date de création</div>
      ),
      cell: ({ row }) => (
        <div className="capitalize text-center">
          {new Date(row.original.created_at).toLocaleString()}
        </div>
      ),
    },
    {
      accessorKey: "Dernière MAJ",
      header: () => <div className="text-center w-[200px]">Dernière MAJ</div>,
      cell: ({ row }) => (
        <div className="capitalize text-center">
          {new Date(row.original.last_update).toLocaleString()}
        </div>
      ),
    },
    {
      id: "actions",
      enableHiding: false,
      header: () => <div className="text-center w-[50px]">Actions</div>,
      cell: ({ row }) => {
        const [load, setLoad] = React.useState(false);
        const [opened, setOpened] = React.useState(false);

        const inputsModifications = [
          {
            label: "Nom du fournisseur",
            name: "name",
            type: "text",
            value: row.original.name,
            required: true,
          },
          {
            label: "Abréviation",
            name: "ab_name",
            type: "text",
            value: row.original.ab_name || "",
            required: false,
          },
          {
            label: "Email",
            name: "email",
            type: "email",
            value: row.original.email || "",
            required: false,
          },
          {
            label: "Numéro",
            name: "contact",
            type: "text",
            value: row.original.contact || "",
            require: false,
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
              {
                withCredentials: true,
              }
            );
            if (res.status === 200) {
              // setOpened(false);
              resetFormM();
              setSelectedSalesPoints([]);
              handleSearch();
              return toast({
                title: "Succès",
                description: "Le fournisseur a été modifié avec succès",
                variant: "success",
                className: "bg-green-600 border-green-600",
                icon: <Check className="mr-2" />,
              });
            }
          } catch (error) {
            return toast({
              title: "Erreur",
              description:
                "Une erreur est survenue lors de la modification du fournisseur",
              variant: "destructive",
              className: "bg-red-600 border-red-600",
              icon: <X className="mr-2" />,
            });
          } finally {
            setLoad(false);
          }
        };

        const handleDelete = async () => {
          setLoading(true);
          try {
            const params = {
              suppliers: [row.original.id],
            };
            const res: Supply[] = await getSupplies(params);
            if (res.length > 0) {
              return toast({
                title: "Erreur",
                description:
                  "Impossible de supprimer le fournisseur car il est associé à des approvisionements.",
                variant: "destructive",
                className: "bg-red-600 border-red-600",
                icon: <X className="mr-2" />,
              });
            } else {
              setCurrentSupplier(row.original);
              setOpen(true);
            }
          } catch (error) {
            console.log(error);
            return toast({
              title: "Erreur",
              description:
                "Une erreur est survenue lors de la suppression du fournisseur",
              variant: "destructive",
              className: "bg-red-600 border-red-600",
              icon: <X className="mr-2" />,
            });
          } finally {
            setLoading(false);
          }
        };

        return (
          <div className="flex justify-center items-center">
            <DropdownMenu open={opened}>
              <DropdownMenuTrigger asChild>
                <Button
                  onClick={() => setOpened(true)}
                  variant="ghost"
                  className=""
                >
                  <EllipsisVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-36">
                <AlertDialog>
                  <AlertDialogTrigger className="w-full">
                    <DropdownMenuItem className="w-full">
                      Modifier
                      <DropdownMenuShortcut>
                        <Pencil className="h-4 w-4" />
                      </DropdownMenuShortcut>
                    </DropdownMenuItem>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        Modifier un fournisseur
                      </AlertDialogTitle>
                      <AlertDialogDescription></AlertDialogDescription>
                    </AlertDialogHeader>
                    <form onSubmit={(e) => handleSubmitM(e, handleModify)}>
                      <div className="mb-4 space-y-4">
                        {inputsModifications.map((input) => {
                          return (
                            <TextField
                              fullWidth
                              margin="dense"
                              label={input.label}
                              type={input.type}
                              required={input.required}
                              size="small"
                              name={input.name}
                              value={valuesM[input.name]}
                              onChange={handleChangeM}
                              error={
                                !!errorsM[input.name] &&
                                valuesM[input.name] != ""
                              }
                              helperText={
                                valuesM[input.name] != "" && errorsM[input.name]
                              }
                            />
                          );
                        })}
                      </div>
                      <AlertDialogFooter>
                        <AlertDialogCancel
                          onClick={() => {
                            resetFormM;
                            setOpened(false);
                          }}
                        >
                          Annuler
                        </AlertDialogCancel>
                        <Button type="submit" disabled={loading}>
                          {!loading ? "Ajouter" : "Veuillez patienter..."}
                        </Button>
                      </AlertDialogFooter>
                    </form>
                  </AlertDialogContent>
                </AlertDialog>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-red-600 hover:text-white hover:bg-red-600"
                  onClick={handleDelete}
                >
                  Supprimer
                  <DropdownMenuShortcut>
                    <Trash className="h-4 w-4" />
                  </DropdownMenuShortcut>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-5">
      <Backdrop
        sx={{ color: "#8b5cf6", zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={statusSuppliers == "loading" || status == "loading" || loading}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
      <CardBodyContent className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Fournisseurs</h2>
        <AlertDialog>
          <AlertDialogTrigger className="p-2 rounded text-sm font-normal bg-indigo-600 hover:bg-indigo-700 text-white">
            Ajouter un fournisseur
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Ajouter un fournisseur</AlertDialogTitle>
              <AlertDialogDescription></AlertDialogDescription>
            </AlertDialogHeader>
            <form onSubmit={(e) => handleSubmit(e, submitForm)}>
              <div className="mb-4 space-y-4">
                {inputs.map((input) => {
                  if (input.type === "select" && Array.isArray(input.options)) {
                    return (
                      <div>
                        <Combobox
                          RightIcon={ChevronDown}
                          options={input.options}
                          buttonLabel={input.label}
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
                          className="z-[99999] popover-content-width-full"
                          getOptionLabel={(option) =>
                            `${option.name} - ${option.address}`
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
                  if (input.type === "text" || input.type === "email") {
                    return (
                      <TextField
                        fullWidth
                        margin="dense"
                        label={input.label}
                        type={input.type}
                        required={input.required}
                        size="small"
                        name={input.name}
                        value={values[input.name]}
                        onChange={handleChange}
                        error={!!errors[input.name] && values[input.name] != ""}
                        helperText={
                          values[input.name] != "" && errors[input.name]
                        }
                      />
                    );
                  }
                })}
              </div>
              <AlertDialogFooter>
                <AlertDialogCancel onClick={resetForm} ref={buttonRef}>
                  Annuler
                </AlertDialogCancel>
                <Button type="submit" disabled={loading}>
                  {!loading ? "Ajouter" : "Veuillez patienter..."}
                </Button>
              </AlertDialogFooter>
            </form>
          </AlertDialogContent>
        </AlertDialog>
      </CardBodyContent>
      <CardBodyContent className="space-y-4">
        {/* <h4 className="text-base font-semibold">Liste de fournisseurs</h4> */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 content-center">
          <SelectPopover
            items={salespoints}
            getOptionLabel={(option) => `${option.name} - ${option.address}`}
            onSelect={(e) => handleSelect(e.id)}
            selectedItems={selectedSalesPoints.map((id) => {
              {
                const sp = salespoints.find((s) => s.id === id);
                return { ...sp } as SalesPoint;
              }
            })}
            searchPlaceholder="Points de vente"
            noItemText="Aucun point de vente"
            placeholder="Point de vente"
          />
          <Button
            className="bg-green-600 hover:bg-green-700"
            onClick={() => handleSearch(selectedSalesPoints)}
          >
            Rechercher
          </Button>
        </div>
      </CardBodyContent>
      <div className="shadow border select-none border-neutral-300 rounded-lg bg-white p-5">
        <h3 className="font-medium text-base">Liste de fournisseurs</h3>
        <DataTableDemo
          setTableData={setTable}
          filterAttributes={["name", "ab_name"]}
          searchText={searchText}
          columns={columns}
          data={suppliers
            .map((el, index) => {
              return {
                ...el,
                number: index + 1,
              };
            })
            .sort((a, b) => new Date(b.last_update) - new Date(a.last_update))}
        >
          <div className="flex items-center justify-between py-4">
            <div className="flex space-x-5">
              <Input
                placeholder="Nom de fournisseur..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="max-w-lg"
              />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="ml-auto">
                    Colonnes <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {table
                    ?.getAllColumns()
                    .filter((column: any) => column.getCanHide())
                    .map((column: any) => {
                      return (
                        <DropdownMenuCheckboxItem
                          key={column.id}
                          className="capitalize"
                          checked={column.getIsVisible()}
                          onCheckedChange={(value) =>
                            column.toggleVisibility(!!value)
                          }
                        >
                          {column.id}
                        </DropdownMenuCheckboxItem>
                      );
                    })}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </DataTableDemo>
      </div>
      <MuiDialog
        open={open}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          Supprimer le fournisseur
        </DialogTitle>
        <DialogContentText className="p-3">
          Voulez vous vraiment supprimer{" "}
          <span className="font-semibold text-neutral-800">
            {currentSupplier?.name}
          </span>{" "}
          de la liste de vos fournisseurs ?
          <p className="text-orange-400 text-base font-medium">
            NB: si un approvisionement est lié a ce fournisseur il vous sera
            impossible de le supprimer.
          </p>
        </DialogContentText>
        <DialogActions>
          <MuiButton
            color="error"
            onClick={() => {
              setOpen(false);
              setCurrentSupplier(null);
            }}
          >
            Annuler
          </MuiButton>
          <MuiButton
            disabled={loading}
            color="success"
            onClick={handleDeleteSupplier}
            autoFocus
          >
            {loading ? "Veuillez patienter..." : "Supprimer"}
          </MuiButton>
        </DialogActions>
      </MuiDialog>
    </div>
  );
}
