"use client";
import * as React from "react";
import CardBodyContent from "@/components/CardContent";
import {
  Button } from "@/components/ui/button";
import { AppDispatch,
  RootState } from "@/redux/store";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { fetchSalesPoints } from "@/redux/salesPointsSlicer";
import {
  ArrowUpDown,
  EllipsisVertical,
  EyeIcon,
  PrinterIcon,
  X,
  XCircle,
  CheckCircle,
} from "lucide-react";
import { DataTableDemo } from "@/components/TableComponent";
import { ColumnDef, Row } from "@tanstack/react-table";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatteCurrency } from "../functions";
import { toast } from "@/components/ui/app-toast";
import {
  Backdrop,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Slide,
  TextField,
  FormControl as MuiFormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { fetchSuppliers } from "@/redux/suppliersSlicer";
import { TransitionProps } from "@mui/material/transitions";
import { createPackaging } from "@/components/fetch";
import { fetchPackagings } from "@/redux/packagingsSlicer";
import StockPackagingsPDF from "@/app/pdf/stockPackagingsPdf";
import { BlobProvider } from "@react-pdf/renderer";
import ReactDOM from "react-dom/client";
import { encryptParam } from "@/utils/encryptURL";
import { usePermission } from "@/context/PermissionContext";
import SelectPopover from "@/components/SelectPopover";
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
  const dispatch: AppDispatch = useDispatch();

  const {
    data: salespoints,
    error,
    status,
  } = useSelector((state: RootState) => state.salesPoints);
  const {
    data: packagings,
    error: packagingsError,
    status: packagingsStatus,
  } = useSelector((state: RootState) => state.packagings);
  const {
    data: suppliers,
    error: errorSuppliers,
    status: statusSuppliers,
  } = useSelector((state: RootState) => state.suppliers);

  const [suppliersData, setSuppliersData] = React.useState<Supplier[]>([]);
  const [selectedSalesPoints, setSelectedSalesPoints] = React.useState<
    number[]
  >([]);
  const [selectedSuppliers, setSelectedSuppliers] = React.useState<number[]>(
    []
  );
  const [open, setOpen] = React.useState(false);
  const { hasPermission, user, isAdmin } = usePermission()
  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const [table, setTable] = React.useState<any | null>(null);


  React.useEffect(() => {
    if (status == "idle") {
      dispatch(fetchSalesPoints());
    }
    if (packagingsStatus == "idle") {
      dispatch(fetchPackagings({}));
    }
    if (statusSuppliers == "idle") {
      dispatch(fetchSuppliers({}));
    }
  }, [status, packagingsStatus, statusSuppliers, dispatch]);

  const handleSelect = (id: number) => {
    if (selectedSalesPoints.includes(id)) {
      setSelectedSalesPoints(selectedSalesPoints.filter((s) => s != id));
    } else {
      setSelectedSalesPoints((prev) => [...prev, id]);
    }
  };

  React.useEffect(() => {
    dispatch(fetchSuppliers({ sales_points_id: selectedSalesPoints }));
    setSelectedSuppliers([]);
    document.title = tCommon("packaging.title");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSalesPoints]);

  const handleSelectSupplier = (id: number) => {
    if (selectedSuppliers.includes(id)) {
      setSelectedSuppliers(selectedSuppliers.filter((s) => s != id));
    } else {
      setSelectedSuppliers((prev) => [...prev, id]);
    }
  };

  const columns: ColumnDef<Packaging>[] = [
    // {
    //     id: "select",
    //     header: ({ table }) => (
    //         <div className='w-8 flex justify-center items-center'>
    //             <Checkbox
    //                 className="border-slate-400"
    //                 checked={
    //                     table.getIsAllPageRowsSelected() ||
    //                     (table.getIsSomePageRowsSelected() && "indeterminate")
    //                 }
    //                 onCheckedChange={(value: any) => table.toggleAllPageRowsSelected(!!value)}
    //                 aria-label="Select all"
    //             />
    //         </div>
    //     ),
    //     cell: ({ row }) => (
    //         <div className='w-8 flex justify-center items-center'>
    //             <Checkbox
    //                 className="border-slate-400"
    //                 checked={row.getIsSelected()}
    //                 onCheckedChange={(value: any) => row.toggleSelected(!!value)}
    //                 aria-label="Select row"
    //             />
    //         </div>
    //     ),
    //     enableSorting: false,
    //     enableHiding: false,
    // },

    {
      accessorKey: "number",
      header: () => <div className="w-5 text-center">#</div>,
      cell: ({ row }) => (
        <div className="text-center w-5">{row.getValue("number")}</div>
      ),
    },
    {
      accessorKey: "name",
      header: ({ column }) => {
        return (
          <div
            className="flex justify-center w-[220px]"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            {tCommon("name")}
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </div>
        );
      },
      cell: ({ row }) => {
        const product = row.original;
        return (
          <div className="capitalize text-center w-[220px]">{product.name}</div>
        );
      },
    },
    ...(isAdmin() ? [{
      accessorKey: "sales_point",
      header: () => <div className="text-center w-[160px]">{tCommon("sales_points.singular")}</div>,
      cell: ({ row }) => {
        const product = row.original;
        return (
          <div className="text-center font-medium w-[160px]">
            {product.sales_point_details.name}
          </div>
        );
      },
    }] : []),
    {
      accessorKey: "supplier",
      header: () => <div className="text-center w-[160px]">{tCommon("supplier.singular")}</div>,
      cell: ({ row }) => {
        const product = row.original;
        return (
          <div className="text-center font-medium w-[160px]">
            {product.supplier_details.name}
          </div>
        );
      },
    },
    {
      accessorKey: "price",
      header: ({ column }) => {
        return (
          <div
            className="text-center w-28"
          >
            <span>{tCommon("packaging.columns.unit_price")}</span>
          </div>
        );
      },
      cell: ({ row }) => {
        const product = row.original;
        const formatted = new Intl.NumberFormat("fr-FR", {
          currency: "XAF",
          style: "currency",
        }).format(product.price);

        return <div className="capitalize text-center">{formatted}</div>;
      },
      footer: () => <div className="text-center">{tCommon("total")}</div>,
    },
    {
      accessorKey: "full",
      header: ({ column }) => {
        return (
          <div
            className="flex justify-center w-36"
          >
            <span>{tCommon("packaging.columns.full")}</span>
          </div>
        );
      },
      cell: ({ row }) => {
        const product = row.original;
        return (
          <div className="capitalize text-center">{product.full_quantity}</div>
        );
      },
      footer: () => {
        const total = packagings.reduce((acc, product) => {
          return (acc += product.full_quantity);
        }, 0);
        return <div className="text-center">{total}</div>;
      },
    },
    {
      accessorKey: "empty",
      header: ({ column }) => {
        return (
          <div
            className="text-center w-36"
          >
            <span>{tCommon("packaging.columns.empty")}</span>
          </div>
        );
      },
      cell: ({ row }) => {
        const product = row.original;
        return (
          <div className="capitalize text-center">{product.empty_quantity}</div>
        );
      },
      footer: () => {
        const total = packagings.reduce((acc, product) => {
          return (acc += product.empty_quantity);
        }, 0);
        return <div className="text-center">{total}</div>;
      },
    },
    {
      accessorKey: "total_quantity",
      header: ({ column }) => {
        return (
          <div
            className="text-center w-28"
          >
            <span>{tCommon("total")}</span>
          </div>
        );
      },
      cell: ({ row }) => {
        const product = row.original;
        return (
          <div className="capitalize text-center">
            {product.empty_quantity + product.full_quantity}
          </div>
        );
      },
      footer: () => {
        const total = packagings.reduce((acc, product) => {
          return (acc += product.empty_quantity + product.full_quantity);
        }, 0);
        return <div className="text-center">{total}</div>;
      },
    },
    {
      accessorKey: "total_amount",
      header: ({ column }) => {
        return (
          <div
            className="text-center w-40"
          >
            <span>{tCommon("total_amount")}</span>
          </div>
        );
      },
      cell: ({ row }) => {
        const product = row.original;

        return (
          <div className="capitalize text-center">
            {formatteCurrency(
              Number(product.price) *
              (product.empty_quantity + product.full_quantity),
              "XAF",
              "fr-FR"
            )}
          </div>
        );
      },
      footer: () => {
        const total = packagings.reduce((acc, product) => {
          return (acc +=
            (product.empty_quantity + product.full_quantity) *
            Number(product.price));
        }, 0);
        const formatted = new Intl.NumberFormat("fr-FR", {
          style: "currency",
          currency: "XAF",
        }).format(total);

        return <div className="text-center">{formatted}</div>;
      },
    },
    ...(hasPermission('modifiy_packaging') ? [{
      id: "actions",
      header: () => <div className="w-10 text-center">{tCommon("actions.title")}</div>,
      enableHiding: false,
      cell: ({ row }: { row: Row<Packaging> }) => {
        const pk = row.original;
        const handleNavigate = () => {
          try {
            const encryptedId = encryptParam(encodeURI(pk.id.toString()));
            window.location.assign(`/stock/packagings/${encryptedId}`);
          } catch (error) {
            console.log(error);
          }
        };
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">{tCommon("open_menu")}</span>
                <EllipsisVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuLabel>{tCommon("actions.title")}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {/* <DropdownMenuItem onClick={() => { }}>
                <Edit size={14} className="mr-3" />
                Modifier
              </DropdownMenuItem> */}
              <DropdownMenuItem onClick={handleNavigate}>
                {" "}
                <EyeIcon className="mr-3" size={14} /> {tCommon("details")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    }] : []),
  ];

  const handleFilterProduct = () => {
    dispatch(
      fetchPackagings({
        sales_points: selectedSalesPoints,
        suppliers: selectedSuppliers,
      })
    );
  };

  const filterSuppliers = async () => {
    const asyncFetch = await dispatch(
      fetchSuppliers({ sales_points_id: [user?.sales_point] })
    );
    if (fetchSuppliers.fulfilled.match(asyncFetch)) {
      setSuppliersData(asyncFetch.payload);
    }
  };

  React.useEffect(() => {
    if (!isAdmin()) {
      filterSuppliers()
    }
  }, [])


  const handleOpenPDF = () => {
    if (selectedSalesPoints.length != 1 && isAdmin()) {
      return toast({
        title: tCommon("error"),
        variant: "destructive",
        description:
          tCommon("packaging.errors.select_sales_point_for_pdf"),
        icon: <XCircle className="size-4" />,
      });
    }
    const newWindow = window.open("", "_blank");
    if (!newWindow) {
      alert(tCommon("popup_blocked"));
      return;
    }
    newWindow.document.write(`<p>${tCommon("loading_pdf")}</p>`);
    const pdfBlobProvider = (
      <BlobProvider
        document={
          <StockPackagingsPDF
            salespoint={isAdmin() ? salespoints.find(
              (s) => s.id === selectedSalesPoints[0]
            ) : user?.sales_point_details}
            //@ts-ignore
            title={tCommon("packaging.pdf.stock_title", { date: new Date().toLocaleDateString(), filtered: selectedSuppliers.length > 0 ? tCommon("filtered_by_supplier") : "" })}
            packagings={packagings.filter(
              (p) => p.sales_point === (isAdmin() ? selectedSalesPoints[0] : user?.sales_point)
            )}
          />
        }
      >
        {/* @ts-ignore */}
        {({ blob }) => {
          console.log("blob", blob);
          if (blob) {
            const blobUrl = URL.createObjectURL(blob);
            newWindow.location.href = blobUrl;
          } else {
            newWindow.document.write(`<p>${tCommon("pdf_error")}</p>`);
          }
        }}
      </BlobProvider>
    );

    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = ReactDOM.createRoot(container);
    root.render(pdfBlobProvider);
  };

  return (
    <section className="space-y-4">
      <Backdrop
        sx={{ color: "#8b5cf6", zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={
          packagingsStatus == "loading" ||
          statusSuppliers == "loading" ||
          status == "loading"
        }
      >
        <CircularProgress color="inherit" />
      </Backdrop>
      <CardBodyContent className="flex lg:flex-row md:flex-row sm:flex-row flex-col justify-between items-center">
        <h4 className="text-base font-semibold">{tCommon("packaging.title")}</h4>
        {hasPermission('add_packaging') ?
          <Button
            variant={"secondary"}
            onClick={handleClickOpen}
          >
            {tCommon("packaging.actions.add")}
          </Button>
          : null
        }
      </CardBodyContent>
      <CardBodyContent className="space-y-4">
        <h4 className="text-base font-semibold">{tCommon("packaging.filters.title")}</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {isAdmin() ?
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
              searchPlaceholder={tCommon("sales_points.label")}
              noItemText={tCommon("sales_points.empty")}
              placeholder={tCommon("sales_points.singular")}
            />
            :
            null
          }
          <SelectPopover
            items={suppliers}
            getOptionLabel={(option) => `${option.name}`}
            onSelect={(el) => handleSelectSupplier(el.id)}
            selectedItems={selectedSuppliers.map((sup) => {
              const supplier = suppliers.find((el) => el.id === sup);
              return { ...supplier };
            })}
            noItemText={tCommon("supplier.empty")}
            placeholder={tCommon("supplier.plural")}
            searchPlaceholder={tCommon("supplier.search")}
          />

          <Button
            variant={"primary"}
            onClick={handleFilterProduct}
            className=""
          >
            {tCommon("search.action")}
          </Button>
        </div>
      </CardBodyContent>
      <CardBodyContent>
        <h4 className="text-base font-semibold">{tCommon("packaging.list_title")}</h4>

        <DataTableDemo
          setTableData={setTable}
          columns={columns}
          searchText=""
          filterAttributes={["name"]}
          data={[...packagings]
            .sort(
              (a, b) =>
                new Date(a.created_at).getTime() -
                new Date(b.created_at).getTime()
            )
            .map((el, index) => {
              return { ...el, number: index + 1 };
            })}
        >
          <div className="flex items-center flex-col sm:flex-row space-y-3 justify-between py-4">
            <div className="flex gap-3 flex-col sm:flex-row">
              <Input
                placeholder={tCommon("packaging.filter_placeholder")}
                value={table?.getColumn("name")?.getFilterValue() as string}
                onChange={(event) =>
                  table?.getColumn("name")?.setFilterValue(event.target.value)
                }
                className="max-w-sm"
              />
              {/* <DropdownMenu>
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
              </DropdownMenu> */}
            </div>
            <div className="flex justify-center items-center">
              {/* <Button variant='outline' className="h-12 w-12 p-0 border-red-600 text-red-600 hover:text-white hover:bg-red-600 ">
                                <span className="sr-only">{tCommon("open_menu")}</span>
                                <Trash className="h-4 w-4" />
                            </Button> */}
              <Button
                onClick={handleOpenPDF}
                variant="outline"
                className="px-5 space-x-3 border-green-600 text-green-600 transition hover:text-white hover:bg-green-600"
              >
                {
                  <>
                    <PrinterIcon className="h-4 w-4" />
                  </>
                }
                <span className="">{tCommon("packaging.actions.print_sheet")}</span>
              </Button>
            </div>
          </div>
        </DataTableDemo>
      </CardBodyContent>
      <Dialog
        open={open}
        TransitionComponent={Transition}
        keepMounted
        aria-describedby="alert-dialog-slide-description"
        PaperProps={{
          component: "form",
          onSubmit: async (event: React.FormEvent<HTMLFormElement>) => {
            event.preventDefault();
            try {
              const formData = new FormData(event.currentTarget);
              const formJson = Object.fromEntries((formData as any).entries());
              //@ts-ignore
              const res = await createPackaging(formJson);
              handleClose();
              if (res.status === 201) {
                toast({
                  variant: "success",
                  icon: <CheckCircle className="size-4" />,
                  title: tCommon("success"),
                  description: res.data.success ?? tCommon("packaging.success.created"),
                });
                setTimeout(() => {
                  window.location.reload();
                }, 3000);
              } else {
                toast({
                  variant: "destructive",
                  icon: <XCircle className="size-4" />,
                  title: tCommon("error"),
                  description: res.response.data.error ?? tCommon("errors.retry"),
                });
              }
            } catch (error) {
              console.log(error);
            }
          },
        }}
      >
        <DialogTitle>{tCommon("packaging.actions.add")}</DialogTitle>
        <DialogContent sx={{ maxWidth: 450 }} className="py-3 space-y-3">
          {
            isAdmin() ?
              <MuiFormControl margin="dense" size="small" fullWidth>
                <InputLabel id="demo-simple-select-label">{tCommon("sales_points.singular")}</InputLabel>
                <Select
                  labelId="demo-simple-select-label"
                  name="sales_point"
                  label={tCommon("sales_points.singular")}
                  size="small"
                  required
                  onChange={(e) => {
                    //@ts-ignore
                    filterSuppliers(e.target.value);
                  }}
                  margin="dense"
                >
                  {salespoints.map((s) => (
                    <MenuItem key={s.id} value={s.id}>
                      {s.name} - {s.address}
                    </MenuItem>
                  ))}
                </Select>
              </MuiFormControl>
              : null}
          <MuiFormControl margin="dense" size="small" fullWidth>
            <InputLabel id="simple-select-label">{tCommon("supplier.singular")}</InputLabel>
            <Select
              labelId="simple-select-label"
              name="supplier"
              required
              label={tCommon("supplier.singular")}
              size="small"
              margin="dense"
            >
              {suppliersData.map((s) => (
                <MenuItem key={s.id} value={s.id}>
                  {s.name}
                </MenuItem>
              ))}
            </Select>
          </MuiFormControl>
          <TextField
            size="small"
            required
            margin="dense"
            name="name"
            label={tCommon("name")}
            type="text"
            fullWidth
            autoComplete="off"
          />
          <TextField
            size="small"
            required
            margin="dense"
            name="price"
            label={tCommon("purchase_price")}
            type="text"
            autoComplete="off"
            fullWidth
          />
          <TextField
            size="small"
            required
            margin="dense"
            helperText={tCommon("packaging.fields.empty_quantity_helper")}
            name="empty_quantity"
            label={tCommon("quantity")}
            type="number"
            autoComplete="off"
            fullWidth
          />
        </DialogContent>
        <DialogActions>
          <Button variant={"destructive"} onClick={handleClose}>
            {tCommon("cancel")}
          </Button>
          <Button
            type="submit"
            className="bg-green-500 hover:bg-green-600 text-white"
          >
            {tCommon("add")}
          </Button>
        </DialogActions>
      </Dialog>
    </section>
  );
}
