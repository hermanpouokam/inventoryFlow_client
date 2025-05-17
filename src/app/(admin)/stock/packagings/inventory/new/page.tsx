"use client";
import CardBodyContent from "@/components/CardContent";
import { Combobox } from "@/components/ComboBox";
import NumericTextField from "@/components/NumericInput";
import { Button } from "@/components/ui/button";
import { fetchProductsCat } from "@/redux/productsCat";
import { fetchProducts } from "@/redux/productsSlicer";
import { fetchSalesPoints } from "@/redux/salesPointsSlicer";
import { AppDispatch, RootState } from "@/redux/store";
import { fetchSuppliers } from "@/redux/suppliersSlicer";
import {
  Backdrop,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from "@mui/material";
import {
  Check,
  ChevronDown,
  Edit,
  EllipsisVertical,
  Save,
  Trash,
  X,
} from "lucide-react";
import React from "react";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ColumnDef } from "@tanstack/react-table";
import { DataTableDemo } from "@/components/TableComponent";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { createSupply } from "@/components/fetch";
import { transformVariants } from "@/app/(admin)/sell/newsell/functions";
import { createEmptyPackagingInventory } from "../../../inventory/functions";
import { fetchPackagings } from "@/redux/packagingsSlicer";
import { usePermission } from "@/context/PermissionContext";

interface InventoryPackage {
  id: number;
  package: string;
  number: number;
  quantity: number;
  diff: number;
  empty_quantity: number;
}

export default function Page() {
  const dispatch: AppDispatch = useDispatch();
  const [salespoint, setSalespoint] = React.useState(null);
  const [data, setData] = React.useState<InventoryPackage[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [selectedProduct, setSelectedProduct] = React.useState<
    Packaging | null | undefined
  >(null);
  const [table, setTable] = React.useState<any | null>(null);
  const [number, setNumber] = React.useState<string | number>("");
  const handleNumberChange = (newValue: string) => {
    setNumber(newValue);
  };
  React.useEffect(() => {
    document.title = "Nouvel Inventaire d'emballage";
  }, []);
  const textFieldRef = React.useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { user, hasPermission, isAdmin } = usePermission()

  const {
    data: salespoints,
    error: errorSalespoints,
    status: statusSalespoint,
  } = useSelector((state: RootState) => state.salesPoints);
  const {
    data: packagings,
    error: errorpackagings,
    status: statusPackagings,
  } = useSelector((state: RootState) => state.packagings);

  const columns: ColumnDef<InventoryPackage>[] = [
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
      accessorKey: "number",
      header: () => <div className="w-[30px]">#</div>,
      cell: ({ row }) => (
        <div className="lowercase w-[30px]">{row.getValue("number")}</div>
      ),
    },
    {
      accessorKey: "Emballage",
      header: ({ column }) => {
        return (
          <div
            className="flex w-[130px]"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Emballage
            {/* <ArrowUpDown className="ml-2 h-4 w-4" /> */}
          </div>
        );
      },
      cell: ({ row }) => (
        <div className="capitalize text-left w-[130px]">
          {row.original.package}
        </div>
      ),
    },
    {
      accessorKey: "stock",
      header: () => <div className="text-right w-[100px]">Quantité vide</div>,
      cell: ({ row }) => {
        return (
          <div className="text-right font-medium w-[100px]">
            {row.original.empty_quantity}
          </div>
        );
      },
    },
    {
      accessorKey: "quantity",
      header: ({ column }) => {
        return (
          <div
            className="flex justify-center w-[180px]"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            <span>Nouvelle quantité</span>
            {/* <ArrowUpDown className="ml-2 h-4 w-4" /> */}
          </div>
        );
      },
      cell: ({ row }) => (
        <div className="capitalize text-center w-[180px]">
          {row.original.quantity}
        </div>
      ),
      footer: () => (
        <div className="text- center w-[180px]">
          {data.reduce((acc, curr) => (acc = acc + Number(curr.quantity)), 0)}
        </div>
      ),
    },
    {
      accessorKey: "total",
      header: () => <div className="text-right w-[130px]">Différence</div>,
      cell: ({ row }) => {
        const total = parseFloat(row.getValue("total"));
        return (
          <div className="text-right font-medium w-[130px]">
            {row.original.diff}
          </div>
        );
      },
      footer: () => {
        return (
          <div className="text-right w-[130px]">
            {data.reduce((acc, curr) => {
              return (acc += curr.diff);
            }, 0)}
          </div>
        );
      },
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const packaging = row.original;

        return (
          <div className="w-[40px]">
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
                    setSelectedProduct(
                      packagings?.find((pa) => pa.id === packaging.id)
                    );
                    setNumber(packaging.quantity);
                    setData((prev) => {
                      return prev.filter((it) => it.id != packaging.id);
                    });
                  }}
                >
                  <Edit size={14} className="mr-3" />
                  Modifier
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    setData((prev) => {
                      return prev.filter((it) => it.id != packaging.id);
                    });
                  }}
                  className="text-red-500 hover:text-white hover:bg-red-600 "
                >
                  {" "}
                  <Trash className="mr-3" size={14} /> Supprimer
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ];

  React.useEffect(() => {
    if (statusSalespoint == "idle") {
      dispatch(fetchSalesPoints());
    }
    if (!isAdmin()) {
      dispatch(
        fetchPackagings({
          sales_points: [user?.sales_point],
        })
      );
    }
  }, [statusSalespoint, dispatch]);

  const handleChangeSalesPoint = (e: any) => {
    dispatch(
      fetchPackagings({
        sales_points: [e.target.value],
      })
    );
    setSalespoint(e.target.value);
  };

  const handleAddProduct = (e: any) => {
    if (data.find((pr) => pr.id === selectedProduct.id)) {
      return toast({
        title: "Erreur",
        description: `Cet emballage existe déjà`,
        variant: "destructive",
        icon: <X className="mr-2" />,
      });
    }
    setData((prev) => {
      return [
        ...prev,
        {
          id: selectedProduct?.id,
          number: prev.length + 1,
          quantity: number,
          empty_quantity: selectedProduct?.empty_quantity,
          diff: Number(number) - Number(selectedProduct?.empty_quantity),
        },
      ];
    });
    setNumber("");
    setSelectedProduct(null);
  };

  const handleValueChange = (value: Product | null) => {
    setSelectedProduct(value);
    if (textFieldRef.current) {
      textFieldRef.current.focus();
    }
  };

  const handleAddInventory = async () => {
    setLoading(true);
    try {
      const inventoryData = {
        sales_point: isAdmin() ? salespoint : user?.sales_point,
        items: data.map((obj) => {
          return {
            new_quantity: parseFloat(obj.quantity),
            packaging: obj.id,
          };
        }),
      };
      const response = await createEmptyPackagingInventory(inventoryData);
      if (response.status === 201) {
        toast({
          title: "Succès",
          description: `Inventaire créé avec succès`,
          variant: "destructive",
          className: "bg-green-600 border-green-600",
          icon: <Check className="mr-2 h-4 w-4" />,
        });
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      }
    } catch (error) {
      setLoading(false);
      toast({
        title: "Erreur",
        description: `${error.response.data.error}`,
        variant: "destructive",
        icon: <X className="mr-2 h-4 w-4" />,
      });
    }
  };

  return (
    <div className="space-y-5">
      <Backdrop
        sx={{ color: "#8b5cf6", zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={
          statusPackagings == "loading" ||
          statusSalespoint == "loading" ||
          loading
        }
      >
        <CircularProgress color="inherit" />
      </Backdrop>
      <CardBodyContent className="space-y-5">
        <h3 className="font-medium text-base">Inventaire</h3>
        {
          isAdmin() ?
            <div className="grid sm:grid-cols-4 lg:grid-cols-4 md:grid-cols-3 grid-cols-1 gap-5">
              <FormControl required size="small" fullWidth>
                <InputLabel id="demo-simple-select-label">
                  Point de vente
                </InputLabel>
                <Select
                  labelId="demo-simple-select-label"
                  id="demo-simple-select"
                  name="sales_point"
                  label="Point de vente"
                  disabled={data.length > 0}
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
            </div>
            : null}
      </CardBodyContent >
      <form autoComplete="off" action={handleAddProduct}>
        <CardBodyContent className="space-y-5">
          <ul className="px-1 text-sm font-medium text-orange-700">
            <li>
              Vous ne pouvez faire qu&apos;un inventaire par jour de préférence le
              matin.
            </li>
            <li>
              Vous ne pouvez faire un inventaire que si vous n&apos;avez pas aucune
              facture pour la journée.
            </li>
            <li>
              Il vous sera impossible de faire une facture si vous avez un
              inventaire en cours.
            </li>
            <li>
              Les inventaires non validés sont automatique supprimés le
              lendemain
            </li>
            <li>
              Vous ne pouvez faire d&apos;inventaire que sur les emballages vides car
              les emballages pleins s&apos;ajustent automatiment avec les inventaires
              d&apos;articles.
            </li>
          </ul>
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 md:grid-cols-3 grid-cols-1 gap-5">
            <Combobox
              options={packagings}
              placeholder="Rechercher un emballage..."
              buttonLabel="Emballage* "
              getOptionLabel={(option) => `${option.name}`}
              value={selectedProduct}
              getOptionValue={(option) => `${option.name}`}
              onValueChange={handleValueChange}
              RightIcon={ChevronDown}
            />
            <TextField
              size="small"
              value={selectedProduct?.empty_quantity ?? ""}
              label="Emballage vide"
            />
            <NumericTextField
              label="Quantité"
              value={number}
              required
              ref={textFieldRef}
              //@ts-ignore
              onChange={handleNumberChange}
              size="small"
              errorMessage="Caractère non accepté!"
            />
            <Button
              variant={"default"}
              type="submit"
              className="bg-violet-700 hover:bg-violet-600"
            >
              {" "}
              Ajouter
            </Button>
          </div>
        </CardBodyContent>
      </form>
      <div
        className={
          "shadow border mt-5 select-none border-neutral-300 rounded-lg bg-white p-5"
        }
      >
        <DataTableDemo
          searchText=""
          filterAttributes={["package"]}
          setTableData={setTable}
          columns={columns}
          data={data}
        >
          <div className="flex items-center justify-between py-4">
            <div className="flex space-x-5">
              <Input
                placeholder="Filtrer par articles..."
                value={table?.getColumn("article")?.getFilterValue() as string}
                onChange={(event) =>
                  table
                    ?.getColumn("article")
                    ?.setFilterValue(event.target.value)
                }
                className="max-w-sm"
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
            <div className="flex justify-center items-center">
              <Button
                disabled={data.length < 1 || loading}
                onClick={handleAddInventory}
                variant="outline"
                className="px-5 space-x-3 border-green-600 text-green-600 hover:text-white hover:bg-green-600"
              >
                {loading ? (
                  <>
                    <CircularProgress size={14} color="inherit" />
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                  </>
                )}
                <span className="">Enregister l&apos;inventaire </span>
              </Button>
            </div>
          </div>
        </DataTableDemo>
      </div>
    </div >
  );
}
