"use client";

import {
  Button
} from "@/components/ui/button";
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
import { toast } from "@/components/ui/app-toast";
import {
  EllipsisVertical,
  EyeIcon,
  CheckCircle,
  XCircle,
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
import { ColumnDef, Row } from "@tanstack/react-table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { fetchClientCat } from "@/redux/clientCatSlicer";
import SelectPopover from "@/components/SelectPopover";
import { usePermission } from "@/context/PermissionContext";
import CardBodyContent from "@/components/CardContent";
import { encryptParam } from "@/utils/encryptURL";
import { useTranslation } from "react-i18next";
import { formatDate } from "@/utils/formatDate";

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

  const { hasPermission, user, isAdmin } = usePermission()

  const [selectedSalesPoints, setSelectedSalesPoints] = React.useState<
    number[]
  >(isAdmin() ? [] : [user?.sales_point]);
  const [selectedCategories, setSelectedCategories] = React.useState<number[]>(
    []
  );
  const [loading, setLoading] = React.useState(false);
  const [name, setName] = React.useState<string>("");
  const [open, setOpen] = React.useState(false);
  const [table, setTable] = React.useState(null);
  const [salesPoint, setSalesPoint] = React.useState<SalesPoint | null>(null);

  const handleChange = (event: any) => {
    const sp = salespoints.find(sp => sp.id === event.target.value)
    setSalesPoint(sp as SalesPoint);
  };

  const { t, i18n } = useTranslation("common");
  const [text, setText] = React.useState("")

  React.useEffect(() => {
    document.title = t("customers.manage_title");
  });

  const columns: ColumnDef<Customer>[] = [
    {
      accessorKey: "count",
      header: () => <div className="w-[10px]">{t("bills.columns.number")}</div>,
      cell: ({ row }) => (
        <div className="w-[10px]">{row.getValue("count")}</div>
      ),
    },

    ...(hasPermission("view_customer")


      ? [
        {
          id: "actions",
          enableHiding: false,
          header: () => (
            <div className="text-left w-[50px]">
              {t("bills.actions.title")}
            </div>
          ),
          cell: ({ row }: { row: Row<Customer> }) => {
            const el = row.original;

            return (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0">
                    <span className="sr-only">{t("open_menu")}</span>
                    <EllipsisVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>
                    {t("bills.actions.title")}
                  </DropdownMenuLabel>

                  <DropdownMenuSeparator />

                  <DropdownMenuItem
                    onClick={() =>
                      window.location.assign(
                        `${window.location.pathname}/${encryptParam(
                          String(el.id)
                        )}`
                      )
                    }
                  >
                    <EyeIcon size={14} className="mr-3" />
                    {t("actions.view_details")}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            );
          },
        },
      ]
      : []),

    {
      accessorKey: "code",
      header: () => (
        <div className="text-center">
          {t("bills.columns.code")}
        </div>
      ),
      cell: ({ row }) => (
        <div className="text-center">
          {row.getValue("code")}
        </div>
      ),
    },

    {
      accessorKey: "name",
      header: () => (
        <div className="text-center w-[220px]">
          {t("bills.columns.customer_name")}
        </div>
      ),
      cell: ({ row }) => {
        const el = row.original;
        return (
          <div className="text-center w-[220px]">
            {el.name} {el.surname}
          </div>
        );
      },
    },

    ...(isAdmin()
      ? [
        {
          accessorKey: "sales_point",
          header: () => (
            <div className="flex justify-center w-[220px]">
              {t("bills.columns.sales_point")}
            </div>
          ),
          cell: ({ row }: { row: Row<Customer> }) => {
            const el = row.original;

            return (
              <div className="text-center w-[220px] font-medium">
                {el.sales_point_details.name} -{" "}
                {el.sales_point_details.address}
              </div>
            );
          },
        },
      ]
      : []),

    {
      accessorKey: "number",
      header: () => (
        <div className="text-center w-[220px]">
          {t("bills.columns.phone")}
        </div>
      ),
      cell: ({ row }) => {
        const el = row.original.number;
        return (
          <div className="text-center font-medium">
            {el ? el : "N/A"}
          </div>
        );
      },
    },

    {
      accessorKey: "email",
      header: () => (
        <div className="text-center w-[220px]">
          {t("bills.columns.email")}
        </div>
      ),
      cell: ({ row }) => {
        const el = row.original.email;
        return (
          <div className="text-center font-medium">
            {el ? el : "N/A"}
          </div>
        );
      },
    },

    {
      accessorKey: "address",
      header: () => (
        <div className="text-center w-[140px]">
          {t("bills.columns.address")}
        </div>
      ),
      cell: ({ row }) => {
        const el = row.original.address;
        return (
          <div className="text-center font-medium">
            {el ? el : "N/A"}
          </div>
        );
      },
    },

    {
      accessorKey: "category",
      header: () => (
        <div className="text-center w-[100px]">
          {t("bills.columns.category")}
        </div>
      ),
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
        <div className="text-center w-[140px]">
          {t("bills.columns.created_at")}
        </div>
      ),
      cell: ({ row }) => (
        <div className="text-center font-medium">
          {formatDate(row.original.created_at)}
        </div>
      ),
    },
  ];

  React.useEffect(() => {
    if (clientsStatus === "idle") {
      dispatch(fetchClients({ categories: [], sales_points: isAdmin() ? [] : [user?.sales_point] }));
    }
    if (salespointsStatus === "idle") {
      dispatch(fetchSalesPoints());
    }
  }, [salespointsStatus, clientsStatus, dispatch]);

  const handleSelectCategories = (id: number) => {
    if (selectedCategories.includes(id)) {
      setSelectedCategories(selectedCategories.filter((s) => s != id));
    } else {
      setSelectedCategories((prev) => [...prev, id]);
    }
  };

  const handleSelect = (id: number) => {
    const newSelectedSalesPoints = selectedSalesPoints.includes(id)
      ? selectedSalesPoints.filter((s) => s != id)
      : [...selectedSalesPoints, id];

    setSelectedSalesPoints(newSelectedSalesPoints);
    dispatch(fetchClientCat({ sales_points: newSelectedSalesPoints }));
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
          title: t("success"),
          description: t("customers.success.category_created"),
          icon: <CheckCircle className="size-4" />,
        });
      }
      setTimeout(() => {
        window.location.reload();
      }, 3000);
    } catch (error) {
      toast({
        variant: "destructive",
        title: t("error"),
        description: t("errors.retry"),
        icon: <XCircle className="size-4" />,
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

      {/* HEADER */}
      <CardBodyContent className="w-full p-5">
        <div className="flex flex-row justify-between items-center">
          <h2 className="font-medium text-base">
            {t("customers.manage_title")}
          </h2>

          {hasPermission("add_customer") && (
            <Button
              variant={"secondary"}
              onClick={() => setOpen(!open)}
              className="ml-2 text-white text-sm"
            >
              {t("customers.add_category")}
            </Button>
          )}

          <Dialog
            open={open}
            TransitionComponent={Transition}
            keepMounted
          >
            <DialogTitle>
              {t("customers.dialog_title")}
            </DialogTitle>

            <form onSubmit={addClientCat}>
              <DialogContent className="max-w-lg">
                <DialogContentText>
                  {t("customers.dialog_description")}
                </DialogContentText>

                <div className="w-full my-3 space-y-4">

                  {isAdmin() && (
                    <FormControl size="small" required fullWidth>
                      <InputLabel>
                        {t("customers.sales_point")}
                      </InputLabel>

                      <Select
                        value={salesPoint?.id}
                        label={t("customers.sales_point")}
                        onChange={(e) => handleChange(e)}
                      >
                        {salespoints.map((s) => (
                          <MenuItem key={s.id} value={s.id}>
                            {s.name} - {s.address}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )}

                  <TextField
                    value={name ?? ""}
                    onChange={(e) => setName(e.target.value)}
                    fullWidth
                    required
                    label={t("customers.category_name")}
                    placeholder={t("customers.category_placeholder")}
                    size="small"
                  />
                </div>
              </DialogContent>

              <DialogActions>
                <Button
                  variant="destructive"
                  type="button"
                  onClick={() => setOpen(false)}
                >
                  {t("cancel")}
                </Button>

                <Button
                  type="submit"
                  disabled={loading}
                  variant={'primary'}
                  className="space-x-4"
                >
                  {loading && <CircularProgress size={14} />}
                  {t("continue")}
                </Button>
              </DialogActions>
            </form>
          </Dialog>
        </div>
      </CardBodyContent>

      <CardBodyContent className="w-full p-5 ">
        <h2 className="font-medium text-base mb-3">
          {t("customers.filter_title")}
        </h2>

        <div className="grid grid-cols-1 my-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">

          {isAdmin() && (
            <SelectPopover
              items={salespoints}
              getOptionLabel={(option) =>
                `${option.name} - ${option.address}`
              }
              onSelect={(item) => handleSelect(item.id)}
              selectedItems={selectedSalesPoints.map((s) =>
                salespoints.find((el) => el.id === s)
              )}
              noItemText={t("customers.no_salespoint")}
              placeholder={t("customers.sales_point")}
              searchPlaceholder={t("customers.search_salespoint")}
            />
          )}

          <SelectPopover
            items={selectedSalesPoints.length < 1 ? [] : data}
            getOptionLabel={(option) => option.name}
            onSelect={(item) => handleSelectCategories(item.id)}
            selectedItems={selectedCategories.map((c) =>
              data.find((el) => el.id === c)
            )}
            noItemText={selectedSalesPoints.length < 1 ? t("sales_points.select_required") : t("customers.no_category")}
            placeholder={t("customers.category")}
            searchPlaceholder={t("customers.search_category")}
          />

          <Button
            onClick={searchClient}
            className="w-full"
            type="submit"
            variant={"primary"}
          >
            {t("search.action")}
          </Button>
        </div>
      </CardBodyContent>

      {/* TABLE */}
      <CardBodyContent className="w-full p-5 space-y-3">
        <h2 className="font-medium text-base">
          {t("customers.list_title")}
        </h2>

        <DataTableDemo
          setTableData={setTable}
          columns={columns}
          filterAttributes={["name"]}
          searchText={text}
          data={clients.map((client, index) => ({
            ...client,
            count: index + 1,
          }))}
        >
          <div className="flex items-center justify-between py-4">
            <Input
              placeholder={t("customers.search_placeholder")}
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="max-w-md"
            />
          </div>
        </DataTableDemo>
      </CardBodyContent>
    </div>
  )
}
