"use client";

import { Button } from "@/components/ui/button";
import * as React from "react";

import { createClientCat } from "../functions";
import {
  Backdrop,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from "@mui/material";
import { useToast } from "@/components/ui/use-toast";
import {
  Check,
  EllipsisVertical,
  EyeIcon,
  X,
} from "lucide-react";
import { useDispatch } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import { useSelector } from "react-redux";
import { fetchSalesPoints } from "@/redux/salesPointsSlicer";
import Slide from "@mui/material/Slide";
import { TransitionProps } from "@mui/material/transitions";
import { fetchClients } from "@/redux/clients";
import { DataTableDemo } from "@/components/TableComponent";
import { Input } from "@/components/ui/input";
import { Column, ColumnDef, Row } from "@tanstack/react-table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { fetchClientCat } from "@/redux/clientCatSlicer";
import moment from "moment";
import SelectPopover from "@/components/SelectPopover";
import { usePermission } from "@/context/PermissionContext";

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<any, any>;
  },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export default function Page() {
  const dispatch: AppDispatch = useDispatch();
  const { data, status, error } = useSelector(
    (state: RootState) => state.clientCat
  );
  const {
    data: salespoints,
    status: salespointsStatus,
    error: salespointsError,
  } = useSelector((state: RootState) => state.salesPoints);
  const {
    data: clients,
    status: clientsStatus,
    error: clientsError,
  } = useSelector((state: RootState) => state.clients);

  const [selectedSalesPoints, setSelectedSalesPoints] = React.useState<
    number[]
  >([]);
  const [selectedCategories, setSelectedCategories] = React.useState<number[]>(
    []
  );
  const [loading, setLoading] = React.useState(false);
  const [name, setName] = React.useState<string>("");
  const { toast } = useToast();
  const [open, setOpen] = React.useState(false);
  const [table, setTable] = React.useState(null);
  const [salesPoint, setSalePoint] = React.useState<SalesPoint | null>(null);
  const { hasPermission, user, isAdmin } = usePermission()
  const handleChange = (event: any) => {
    setSalePoint(event.target.value);
  };

  React.useEffect(() => {
    document.title = "Gérer les clients";
  });

  const columns: ColumnDef<Customer>[] = [
    // {
    //     id: "select",
    //     header: ({ table }) => (
    //         <Checkbox
    //             className="ring-white"
    //             checked={
    //                 table.getIsAllPageRowsSelected() ||
    //                 (table.getIsSomePageRowsSelected() && "indeterminate")
    //             }
    //             onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
    //             aria-label="Select all"
    //         />
    //     ),
    //     cell: ({ row }) => (
    //         <Checkbox
    //             checked={row.getIsSelected()}
    //             onCheckedChange={(value) => row.toggleSelected(!!value)}
    //             aria-label="Select row"
    //         />
    //     ),
    //     enableSorting: false,
    //     enableHiding: false,
    // },
    {
      accessorKey: "count",
      header: () => <div className="w-[10px]">#</div>,
      cell: ({ row }) => (
        <div className="lowercase w-[10px]">{row.getValue("count")}</div>
      ),
    },
    {
      accessorKey: "code",
      header: () => <div className="text-center">Code</div>,
      cell: ({ row }) => (
        <div className="capitalize text-center">{row.getValue("code")}</div>
      ),
    },

    {
      accessorKey: "name",
      header: ({ column }) => {
        return (
          <div
            className="text-center w-[220px]"
          // onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Nom du client
            {/* <ArrowUpDown className="ml-2 h-4 w-4" /> */}
          </div>
        );
      },
      cell: ({ row }) => {
        const el = row.original;
        return (
          <div className="capitalize text-center w-[220px]">
            {" "}
            {el.name} {el.surname}
          </div>
        );
      },
    },
    ...(isAdmin() ? [{
      accessorKey: "sales_point",
      header: ({ column }: { column: Column<Customer, unknown> }) => {
        return (
          <div
            className="flex justify-center w-[220px]"
          // onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            <span>Point de vente</span>
          </div>
        );
      },
      cell: ({ row }: { row: Row<Customer> }) => {
        const el = row.original;

        return (
          <div className="text-center font-medium first-letter:capitalize w-[220px]">
            {el.sales_point_details.name} - {el.sales_point_details.address}
          </div>
        );
      },
    },] : []),
    {
      accessorKey: "number",
      header: () => <div className="text-center w-[220px]">Email</div>,
      cell: ({ row }) => {
        const el = row.original.number;
        return (
          <div className="text-center font-medium">
            {el == "" || !el ? "N/A" : el}
          </div>
        );
      },
    },
    {
      accessorKey: "email",
      header: () => <div className="text-center w-[220px]">Numero</div>,
      cell: ({ row }) => {
        const el = row.original.email;
        return (
          <div className="text-center font-medium">
            {el == "" || !el ? "N/A" : el}
          </div>
        );
      },
    },
    {
      accessorKey: "address",
      header: () => <div className="text-center w-[140px]">Addesse</div>,
      cell: ({ row }) => {
        const el = row.original.address;
        return (
          <div className="text-center font-medium">
            {el == "" || !el ? "N/A" : el}
          </div>
        );
      },
    },
    {
      accessorKey: "category",
      header: () => <div className="text-center w-[100px]">Catégorie</div>,
      cell: ({ row }) => {
        const el = row.original;

        return (
          <div className="text-center font-medium capitalize">
            {el.client_category_details.name}
          </div>
        );
      },
    },
    {
      accessorKey: "created_at",
      header: () => (
        <div className="text-center w-[140px]">Date de création</div>
      ),
      cell: ({ row }) => {
        const created_at = row.original.created_at;
        const formatted = moment(created_at).format("YYYY-MM-DD HH:mm");
        return <div className="text-center font-medium">{formatted}</div>;
      },
    },
    ...(hasPermission('view_customer') ? [{
      id: "actions",
      enableHiding: false,
      cell: ({ row }: { row: Row<Customer> }) => {
        const el = row.original;
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
              <DropdownMenuItem
                onClick={() => {
                  //   window.location.assign(
                  //     `${window.location.pathname}/${el.code}`
                  //   );
                }}
              >
                <EyeIcon size={14} className="mr-3" />
                Voir les details
              </DropdownMenuItem>
              {/* <DropdownMenuItem
                                onClick={() => {

                                }}
                                className="text-red-500 hover:text-white hover:bg-red-600 "
                            > <Trash className="mr-3" size={14} /> Supprimer</DropdownMenuItem> */}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    }] : []),
  ];

  React.useEffect(() => {
    if (clientsStatus === "idle") {
      dispatch(fetchClients({ categories: [], sales_points: [user?.sales_point] }));
    }
    if (clientsStatus === "idle") {
      dispatch(fetchClientCat({ sales_points: [user?.sales_point] }));
    }
    if (status === "idle") {
      dispatch(fetchSalesPoints());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [salespointsStatus, status, clientsStatus, dispatch]);

  const handleSelectCategories = (id: number) => {
    if (selectedCategories.includes(id)) {
      setSelectedCategories(selectedCategories.filter((s) => s != id));
    } else {
      setSelectedCategories((prev) => [...prev, id]);
    }
  };

  const handleSelect = (id: number) => {
    if (selectedSalesPoints.includes(id)) {
      setSelectedSalesPoints(selectedSalesPoints.filter((s) => s != id));
    } else {
      setSelectedSalesPoints((prev) => [...prev, id]);
    }
    dispatch(fetchClientCat({ sales_points: [...selectedSalesPoints, id] }));
    setSelectedCategories([]);
  };

  const addClientCat = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await createClientCat(name, isAdmin() ? salesPoint?.id : user?.sales_point);
      if (res) {
        toast({
          variant: "success",
          title: "Success",
          className: "bg-green-600",
          description: "Catégorie de client créée avec succès",
          icon: <Check className="mr-4" />,
        });
      }
      setTimeout(() => {
        window.location.reload();
      }, 3000);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Une erreur est survenue veuillez réessayer",
        icon: <X className="mr-4" />,
      });
      console.log(error);
    } finally {
      setOpen(false);
      setLoading(false);
    }
  };

  const searchClient = () => {
    dispatch(
      fetchClients({
        categories: selectedCategories,
        sales_points: selectedSalesPoints,
      })
    );
  };

  return (
    <div className="space-y-5">
      <Backdrop
        sx={{ color: "#8b5cf6", zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={loading || status == "loading" || clientsStatus == "loading"}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
      <div className="w-full p-5 shadow rounded bg-white border border-neutral-300">
        <div className="flex flex-row justify-between items-center">
          <h2 className="font-medium text-base">Gerer les clients</h2>
          {hasPermission('add_customer') ?
            <Dialog
              open={open}
              TransitionComponent={Transition}
              keepMounted
              aria-describedby="alert-dialog-slide-description"
            >
              <DialogTitle>{"Ajouter une categorie de client"}</DialogTitle>
              <form onSubmit={addClientCat}>
                <DialogContent>
                  <DialogContentText id="alert-dialog-slide-description">
                    Créer des categories de client. <br />
                    Cela vous permetra de classer vos clients par categorie
                  </DialogContentText>
                  <div className="w-full my-3 space-y-4">
                    <TextField
                      value={name ?? ""}
                      onChange={(e) => setName(e.target.value)}
                      fullWidth
                      // error={name != ''}
                      // helperText={name && name != '' ? "Entrez un nom de categorie" : undefined}
                      required
                      label="nom de la categorie"
                      placeholder="Ex: gros, demi-gros, detail, etc..."
                      size="small"
                    />
                    {isAdmin() ?
                      <FormControl size="small" required fullWidth>
                        <InputLabel id="demo-simple-select-label">
                          Point de vente
                        </InputLabel>
                        <Select
                          labelId="demo-simple-select-label"
                          value={salesPoint}
                          label="Point de vente"
                          onChange={handleChange}
                        >
                          {salespoints.map((s) => (
                            <MenuItem key={s.id} value={s}>
                              {s.name} - {s.address}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                      : null}
                  </div>
                </DialogContent>
                <DialogActions>
                  <Button variant="destructive" onClick={() => setOpen(false)}>
                    Annuler
                  </Button>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {loading && <CircularProgress size={14} />}
                    Continuer
                  </Button>
                </DialogActions>
              </form>
            </Dialog>
            : null}
        </div>
      </div>
      <div className="w-full p-5 shadow rounded bg-white border space-y-3 border-neutral-300">
        <h2 className="font-medium text-base mb-3">Filter les clients</h2>
        <div className="grid grid-cols-1 my-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {
            isAdmin() ?
              <SelectPopover
                items={salespoints}
                getOptionLabel={(option) => `${option.name} - ${option.address}`}
                onSelect={(item) => handleSelect(item.id)}
                selectedItems={selectedSalesPoints.map((s) => {
                  const sp = salespoints.find((el) => el.id === s);
                  return { ...sp } as SalesPoint;
                })}
                noItemText="Aucun point de vente"
                placeholder="Point de vente"
                searchPlaceholder="Rechercher un point de vente"
              />
              : null
          }
          <SelectPopover
            items={data}
            getOptionLabel={(option) => `${option.name}`}
            onSelect={(item) => handleSelectCategories(item.id)}
            selectedItems={selectedCategories.map((c) => {
              const cat = data.find((el) => el.id === c);
              return { ...cat } as Details;
            })}
            noItemText="Aucune catégorie"
            placeholder="Catégorie"
            searchPlaceholder="Rechercher une catégorie"
          />
          <Button
            onClick={searchClient}
            className="w-full bg-green-600 hover:bg-green-700 text-white hover:text-white"
            type="submit"
            variant={"outline"}
          >
            Rechercher
          </Button>
        </div>
      </div>
      <div className="w-full p-5 shadow rounded bg-white border space-y-3 border-neutral-300">
        <h2 className="font-medium text-base">Liste de client</h2>

        <DataTableDemo
          setTableData={setTable}
          columns={columns}
          data={clients.map((client, index) => {
            return { ...client, count: index + 1 };
          })}
        >
          <div className="flex items-center justify-between py-4">
            <div className="flex space-x-5">
              <Input
                placeholder="Filtrer par nom de client..."
                value={table?.getColumn("name")?.getFilterValue()}
                onChange={(event) => {
                  table?.getColumn("name")?.setFilterValue(event.target.value);
                }}
                className="max-w-sm"
              />
            </div>
          </div>
        </DataTableDemo>
      </div>
    </div>
  );
}
