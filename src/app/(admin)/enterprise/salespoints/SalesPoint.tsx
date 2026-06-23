"use client";
import CardBodyContent from "@/components/CardContent";
import {
  Button
} from "@/components/ui/button";
import { fetchSalesPoints } from "@/redux/salesPointsSlicer";
import {
  AppDispatch,
  RootState
} from "@/redux/store";
import {
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Slide,
  TextField,
} from "@mui/material";
import {
  Check,
  CheckIcon,
  ChevronDown,
  CircleDollarSignIcon,
  DollarSign,
  Eye,
  Grid2x2X,
  Package,
  Plus,
  RotateCcwSquare,
  UserPlus2,
  Users,
  UsersRound,
  X,
  XCircle,
  CheckCircle,
} from "lucide-react";
import * as React from "react";
import { useDispatch, useSelector } from "react-redux";
import { formatteCurrency } from "../../stock/functions";
import useForm, { Field, initializeFormValues } from "@/utils/useFormHook";
import { createSalesPoint, instance } from "@/components/fetch";
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
    labelKey: "sales_points.fields.name",
    type: "text",
    required: false,
  },
  {
    name: "address",
    labelKey: "sales_points.fields.address",
    type: "text",
    required: false,
  },
];

import { useSearchParams } from "next/navigation";
import { fetchPackagings } from "@/redux/packagingsSlicer";
import { fetchEmployees } from "@/redux/employeesSlicer";
import { fetchUsers } from "@/redux/usersSlicer";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TransitionProps } from "@mui/material/transitions";
import { Combobox } from "@/components/ComboBox";
import { toast } from "@/components/ui/app-toast";
import { Checkbox } from "@/components/ui/checkbox";
import { fetchTaxes } from "@/redux/taxesSlicer";
import ActionsDropdown from "@/components/ActionButton";
import { translate } from "@/utils/constants";
import { usePermission } from "@/context/PermissionContext";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import { PlanGate } from "@/components/PlanGate";
import { createAdditionalFee, createEmployee, createTax } from "./function";
import { fetchAdditionalFees } from "@/redux/additionalFeesSlicer";

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<any, any>;
  },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

function SalesPoint() {
  const dispatch: AppDispatch = useDispatch();
  const { t } = useTranslation("common");
  const { data, error, status } = useSelector(
    (state: RootState) => state.salesPoints
  );
  const { data: stock, status: statusStock } = useSelector(
    (state: RootState) => state.products
  );
  const { data: bills, status: statusBills } = useSelector(
    (state: RootState) => state.bills
  );
  const { data: packagings, status: statusPackagings } = useSelector(
    (state: RootState) => state.packagings
  );
  const { taxes, status: taxesStatus } = useSelector(
    (state: RootState) => state.taxes
  );
  const { additionalFees, status: additionalFeesStatus } = useSelector(
    (state: RootState) => state.additionalFees
  );

  const { hasPermission, user, isAdmin } = usePermission()

  const [loading, setLoading] = React.useState(false)

  const {
    data: employees,
    status: statusEmployees,
    error: errorEmployee,
  } = useSelector((state: RootState) => state.employees);
  const {
    data: users,
    status: statusUsers,
    error: errorUsers,
  } = useSelector((state: RootState) => state.users);
  const { data: clients, status: statusClient } = useSelector(
    (state: RootState) => state.clients
  );
  const urlParams = useSearchParams();
  const encryptedSp = urlParams.get("spxts");
  const salespoint = encryptedSp ? decryptParam(encryptedSp) : null;

  const [open, setOpen] = React.useState(false);

  const [openModal, setOpenModal] = React.useState(false);
  const [modalType, setModalType] = React.useState<
    "employee" | "taxes" | "addinional_fees" | "users"
  >("addinional_fees");
  const handleClickOpenModal = (
    type: "employee" | "taxes" | "addinional_fees" | "users"
  ) => {
    setOpenModal(true);
    setModalType(type);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    resetformM();
    resetformN();
    resetformF();
  };

  const { errors, handleChange, handleSubmit, resetForm, values } = useForm(
    initializeFormValues(fields)
  );

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };
  const getData = () => {
    if (status === "idle" && isAdmin()) {
      dispatch(fetchSalesPoints());
    }
    if (statusStock === "idle") {
      dispatch(fetchProducts({ sales_points: isAdmin() ? salespoint ? [salespoint] : [] : [user?.sales_point] }));
    }
    if (statusPackagings == "idle") {
      dispatch(
        fetchPackagings({ sales_points: isAdmin() ? salespoint ? [salespoint] : [] : [user?.sales_point] })
      );
    }
    if (statusBills === "idle") {
      dispatch(fetchBills({ sales_point: isAdmin() ? salespoint ? [salespoint] : [] : [user?.sales_point] }));
    }
    if (statusEmployees === "idle") {
      dispatch(fetchEmployees({ sales_point: isAdmin() ? salespoint ? [salespoint] : [] : [user?.sales_point] }));
    }
    if (statusUsers === "idle") {
      dispatch(fetchUsers({ sales_point: isAdmin() ? salespoint ? [salespoint] : [] : [user?.sales_point] }));
    }
    if (taxesStatus === "idle") {
      dispatch(fetchTaxes({ sales_point: isAdmin() ? salespoint ? [salespoint] : [] : [user?.sales_point] }));
    }
    if (additionalFeesStatus === "idle") {
      dispatch(fetchAdditionalFees({ sales_point: isAdmin() ? salespoint ? [salespoint] : [] : [user?.sales_point] }));
    }
  };

  React.useEffect(() => {
    getData();
  }, [
    status,
    statusStock,
    statusBills,
    statusPackagings,
    dispatch,
    salespoint,
  ]);

  const cards = React.useMemo(
    () => [
      {
        icon: DollarSign,
        iconColor: "blue-500",
        label: t("daily_closure.cash_balance"),
        value: function () {
          const total = [
            ...(salespoint ? data.filter((sp) => sp.id == salespoint) : data),
          ].reduce((acc, sp) => acc + Number(sp.cash_register.balance), 0);
          return `${formatteCurrency(total, "XAF", "fr-FR")}`;
        },
        subText: t("sales_points.count", { count: salespoint ? 1 : data.length }),
      },
      {
        icon: Package,
        iconColor: "orange-500",
        label: t("sales_points.stock_amount"),
        value: function () {
          const total = stock.reduce(
            (acc, product) =>
              (acc += product.total_quantity * parseFloat(product.price)),
            0
          );
          const totalPackagings = packagings.reduce(
            (acc, packaging) =>
            (acc +=
              (packaging.empty_quantity + packaging.full_quantity) *
              Number(packaging.price)),
            0
          );
          return `${formatteCurrency(total + totalPackagings, "XAF", "fr-FR")}`;
        },
        subText: t("dashboard.stock_value.sub", { products: stock.length, packaging: packagings.length }),
      },
      {
        icon: CircleDollarSignIcon,
        iconColor: "red-500",
        label: t("dashboard.customer_debt.title"),
        value: function () {
          const total = bills
            .filter(
              (bill) =>
                Number(bill.paid) !=
                Number(bill.total_amount_with_taxes_fees) &&
                bill.state != "created"
            )
            .reduce(
              (acc, bill) =>
                acc +
                bill.total_amount_with_taxes_fees -
                (Number(bill?.paid) ?? 0),
              0
            );
          return `${formatteCurrency(total, "XAF", "fr-FR")}`;
        },
        subText: t(bills.filter(
          (bill) =>
            Number(bill.paid) != Number(bill.total_amount_with_taxes_fees) &&
            bill.state != "created"
        ).length !== 1 ? "invoices" : "invoices_sin", {
          count: bills.filter(
            (bill) =>
              Number(bill.paid) != Number(bill.total_amount_with_taxes_fees) &&
              bill.state != "created"
          ).length
        }),
      },
      {
        icon: DollarSign,
        iconColor: "green-500",
        label: t("sales_points.total_capital"),
        value: function () {
          const total = [
            ...(salespoint ? data.filter((sp) => sp.id == salespoint) : data),
          ].reduce((acc, sp) => acc + Number(sp.cash_register.balance), 0);
          const totalBills = bills
            .filter(
              (bill) =>
                Number(bill.paid) != Number(bill.total_amount_with_taxes_fees)
            )
            .reduce(
              (acc, bill) =>
                acc +
                bill.total_amount_with_taxes_fees -
                (Number(bill?.paid) ?? 0),
              0
            );
          const totalStock = stock.reduce(
            (acc, product) =>
              (acc += product.total_quantity * parseFloat(product.price)),
            0
          );
          const totalPackagings = packagings.reduce(
            (acc, packaging) =>
            (acc +=
              (packaging.empty_quantity + packaging.full_quantity) *
              Number(packaging.price)),
            0
          );
          return `${formatteCurrency(
            total + totalBills + totalPackagings + totalStock
          )}`;
        },
        subText: "",
      },
      {
        icon: Users,
        iconColor: "purple-500",
        label: t("users.employees_count_label"),
        value: function () {
          return `${employees.length}`;
        },
        subText: salespoint
          ? t("sales_points.count", { count: 1 })
          : t("sales_points.count", { count: data.length }),
      },
      {
        icon: Users,
        iconColor: "sky-500",
        label: t("sales_points.payroll"),
        value: function () {
          const total = employees.reduce((acc, curr) => {
            return (acc += Number(curr.monthly_salary));
          }, 0);
          return `${formatteCurrency(total)}`;
        },
        subText: t("dashboard.employees.count", { count: employees.length, salespoints: salespoint ? 1 : data.length }),
      },
      {
        icon: UsersRound,
        iconColor: "yellow-500",
        label: t("dashboard.active_clients.title"),
        value: function () {
          return `${clients.length}`;
        },
        subText: t("sales_points.count", { count: salespoint ? 1 : data.length }),
      },
    ],
    [data, stock, bills, packagings, employees, clients, salespoint, t]
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

  const fieldsM: Field[] = React.useMemo(
    () => [
      {
        name: "sales_point",
        required: true,
        label: t("sales_points.singular"),
        type: "select",
        options: data,
      },
      {
        name: "name",
        required: true,
        label: t("name"),
        type: "text",
      },
      {
        name: "surname",
        required: true,
        label: t("surname"),
        type: "text",
      },
      {
        name: "role",
        required: true,
        label: t("users.role"),
        type: "text",
      },
      {
        name: "salary",
        required: true,
        label: t("users.salary"),
        type: "number",
      },
      {
        name: "is_deliverer",
        required: true,
        label: t("deliverer.label"),
        type: "checkbox",
      },
    ],
    [status, t]
  );

  const {
    errors: errorsM,
    handleChange: handleChangeM,
    handleSubmit: handleSubmitM,
    resetForm: resetformM,
    values: valuesM,
    setFieldValue: setFieldValueM,
    setValues: setValuesM,
  } = useForm(initializeFormValues(fieldsM));

  const fieldsN: Field<any>[] = React.useMemo(
    () => [
      {
        name: "sales_point",
        required: true,
        label: t("sales_points.singular"),
        type: "select",
        options: data,
      },
      {
        name: "tax_name",
        required: true,
        label: t("name"),
        type: "text",
      },
      {
        name: "tax_type",
        required: true,
        label: t("taxes.type"),
        type: "select",
        options: [
          {
            value: "percentage",
            text: t("taxes.types.percentage"),
          },
          {
            value: "flat",
            text: t("taxes.types.flat"),
          },
        ],
      },
      {
        name: "value",
        required: true,
        label: t("taxes.value"),
        type: "number",
      },
      {
        name: "tax_application",
        required: true,
        label: t("taxes.application"),
        type: "select",
        options: [
          {
            value: "bill",
            text: t("taxes.applications.bill"),
          },
          {
            value: "supply",
            text: t("taxes.applications.supply"),
          },
        ],
      },
    ],
    [status, t]
  );

  const {
    errors: errorsN,
    handleChange: handleChangeN,
    handleSubmit: handleSubmitN,
    resetForm: resetformN,
    values: valuesN,
    setFieldValue: setFieldValueN,
    setValues: setValuesN,
    setFieldError: setFieldErrorN,
  } = useForm(initializeFormValues(fieldsN));

  const fieldsF: Field<any>[] = React.useMemo(
    () => [
      {
        name: "sales_point",
        required: true,
        label: t("sales_points.singular"),
        type: "select",
        options: data,
      },
      {
        name: "name",
        required: true,
        label: t("name"),
        type: "text",
      },
      {
        name: "fee_type",
        required: true,
        label: t("fees.type"),
        type: "select",
        options: [
          {
            value: "percentage",
            text: t("fees.types.percentage"),
          },
          {
            value: "flat",
            text: t("fees.types.flat"),
          },
        ],
      },
      {
        name: "amount",
        required: true,
        label: t("fees.amount"),
        type: "number",
      },
      {
        name: "fee_application",
        required: true,
        label: t("fees.application"),
        type: "select",
        options: [
          {
            value: "bill",
            text: t("fees.applications.bill"),
          },
          {
            value: "supply",
            text: t("fees.applications.supply"),
          },
        ],
      },
      {
        name: "application_order",
        required: true,
        label: t("fees.order"),
        type: "select",
        options: [
          {
            value: "before_tax",
            text: t("fees.orders.before_tax"),
          },
          {
            value: "after_tax",
            text: t("fees.orders.after_tax"),
          },
        ],
      },
    ],
    [status, t]
  );

  const {
    errors: errorsF,
    handleChange: handleChangeF,
    handleSubmit: handleSubmitF,
    resetForm: resetformF,
    values: valuesF,
    setFieldValue: setFieldValueF,
    setValues: setValuesF,
    setFieldError: setFieldErrorF,
  } = useForm(initializeFormValues(fieldsF));

  const showSuccessToast = (message: string) => {
    toast({
      variant: "success",
      title: t("success"),
      description: message,
      icon: <CheckCircle className="size-4" />,
    });
  };

  const showErrorToast = (error: any, fallback: string) => {
    const message =
      error?.response?.data?.error ||
      error?.message ||
      fallback;

    toast({
      variant: "destructive",
      title: t("error"),
      description: message,
      icon: <XCircle className="size-4" />,
    });
  };

  const handleSuccess = (message: string, resetFn: () => void) => {
    getData();
    setOpenModal(false);
    resetFn();
    showSuccessToast(message);
  };

  const handleSubmitForm = async () => {
    try {
      switch (modalType) {
        case "employee": {
          const res = await createEmployee({ ...valuesM });

          if (res.status === 201) {
            handleSuccess(
              res.data.success ?? t("sales_points.success.employee_created"),
              resetformM
            );
            getData()
          }
          break;
        }

        case "taxes": {
          if (!valuesN.sales_point) {
            return setFieldErrorN(
              "sales_point",
              t("sales_points.select_required")
            );
          }

          const res = await createTax({ ...valuesN });

          if (res.status === 201) {
            handleSuccess(
              res.data.success ?? t("sales_points.success.tax_created"),
              resetformN
            );
            getData()
          }
          break;
        }

        case "addinional_fees": {
          if (!valuesF.sales_point) {
            return setFieldErrorF(
              "sales_point",
              t("sales_points.select_required")
            );
          }

          const res = await createAdditionalFee({ ...valuesF });

          if (res.status === 201) {
            handleSuccess(
              res.data.success ?? t("sales_points.success.fee_created"),
              resetformF
            );
            getData()
          }
          break;
        }

        default:
          console.warn("Type de modal inconnu :", modalType);
      }
    } catch (error) {
      showErrorToast(
        error,
        t("errors.retry")
      );
    }
  };

  return (
    <>
      <div className="space-y-5">
        <CardBodyContent>
          <div className="flex flex-row justify-between items-center">
            <h2 className="text-base font-medium">{t("sales_points.label")}</h2>
            <Button
              variant="secondary"
              onClick={handleClickOpen}
            >{t("sales_points.actions.create")}</Button>
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
            <SelectValue placeholder={t("sales_points.all")} />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>{t("sales_points.label")}</SelectLabel>
              {selectOptions}
            </SelectGroup>
          </SelectContent>
        </Select>
        {status === "loading" && (
          <div className="w-full h-[50%] mt-10 justify-center items-center flex">
            <CircularProgress color="inherit" size={35} />
          </div>
        )}
        {status === "succeeded" && (
          <>
            {data.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {cards.map((card, i) => (
                  <CardBodyContent
                    key={i}
                    className="shadow border select-none  p-5"
                  >
                    <div className="flex flex-row justify-between items-center">
                      <p className="text-sm font-semibold">{card.label}</p>
                      <div className={`h-10 w-10 rounded-lg justify-center items-center flex bg-${card.iconColor}/10`}>
                        <card.icon className={`text-${card.iconColor}`} size={15} />
                      </div>
                    </div>
                    <h2 className="text-2xl mt-2 font-bold">{card.value()}</h2>
                    <span className="text-xs -mt-2 text-muted-foreground">
                      {card.subText}
                    </span>
                  </CardBodyContent>
                ))}
              </div>
            ) : (
              <div className="border-2 flex-col border-dashed h-[500px] gap-1 border-neutral-400 bg-white flex justify-center items-center">
                <Grid2x2X className="w-16 h-16" />
                <h3 className="font-bold text-xl">{t("sales_points.empty")}</h3>
                <h3 className="font-mediun text-base text-muted-foreground">
                  {t("sales_points.empty_description")}
                </h3>
                <Button
                  variant="default"
                  onClick={handleClickOpen}
                  className="bg-violet-500 hover:bg-violet-600"
                >{t("sales_points.actions.create")}</Button>
              </div>
            )}
          </>
        )}
        {statusUsers != "succeeded" ? (
          <div>{errorUsers}</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            <CardBodyContent className="col-span-1 md:col-span-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <h3>{t("users.list_title")}</h3>
                  <Button
                    onClick={() => window.location.assign("/enterprise/salespoints/newUser")}
                    variant={"outline"}
                  >
                    {t("add")}
                    <UserPlus2 className="w-4 h-4 ml-1" />
                  </Button>
                </div>
                {/* <Button variant={"link"}>{t("view_all")}</Button> */}
              </div>
              { }
              <Table className="mt-5">
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[10px]">#</TableHead>
                    <TableHead className="w-[100px]">{t("users.full_name")}</TableHead>
                    <TableHead className="w-[130px]">{t("username")}</TableHead>
                    <TableHead className="w-[40px]">{t("users.role")}</TableHead>
                    <TableHead className="w-[40px]">{t("bills.columns.status")}</TableHead>
                    <TableHead className="w-[20px]">{t("table.action")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody >
                  {users.length > 0 ? (
                    [
                      ...users.map((el, index) => {
                        return { count: index + 1, ...el };
                      }),
                    ].filter(el => el.id != user?.id)
                      // .slice(0, 9)
                      .map((el, index) => {
                        const isSelf = el.id === user?.id;
                        const encryptId = encryptParam(String(el.id))
                        const canToggleStatus =
                          isAdmin() || user?.user_type === "manager";
                        const userActions = [
                          {
                            label: t("actions.view_details"),
                            icon: Eye,
                            onClick: () => {
                              window.location.assign(
                                `/enterprise/salespoints/user/${encryptId}`
                              );
                            },
                          },
                          ...(canToggleStatus
                            ? [
                              {
                                label: el.is_active
                                  ? t("actions.deactivate")
                                  : t("actions.activate"),
                                icon: RotateCcwSquare,
                                onClick: async () => {
                                  try {
                                    const res = await instance.patch(
                                      `/users/${el.id}/`,
                                      { is_active: !el.is_active }
                                    );
                                    if (res.status === 200) {
                                      showSuccessToast(
                                        res.data?.detail ?? t("success")
                                      );
                                      getData();
                                      dispatch(fetchUsers({ sales_point: isAdmin() ? salespoint ? [salespoint] : [] : [user?.sales_point] }));
                                    }
                                  } catch (error) {
                                    showErrorToast(error, t("errors.retry"));
                                  }
                                },
                              },
                            ]
                            : []),
                        ];

                        return (
                          <TableRow key={el.id}>
                            <TableCell className="font-medium">
                              {el.count - 1}
                            </TableCell>
                            <TableCell className="font-medium capitalize truncate">
                              {el.name} {el.surname}
                            </TableCell>
                            <TableCell className="font-medium">
                              {el.username}
                            </TableCell>
                            <TableCell className="font-medium">
                              {t(`users.types.${el.user_type}`)}
                            </TableCell>
                            <TableCell className="text-right">
                              {el.is_active ? (
                                <div className="flex justify-left items-center gap-1">
                                  <div className="pulse w-3 h-3" />
                                  <p className="text-green-800 font-medium">{t("status.active")}</p>
                                </div>
                              ) : (
                                <div className="flex justify-left items-center gap-1">
                                  <div className="bg-muted-foreground w-2 h-2 rounded-full" />
                                  <p className="text-muted-foreground font-medium">{t("status.inactive")}</p>
                                </div>
                              )}
                            </TableCell>
                            <TableCell>
                              <ActionsDropdown actions={userActions} />
                            </TableCell>
                          </TableRow>
                        );
                      })
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="font-medium text-center"
                      >
                        {t("users.empty_registered")}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardBodyContent>
            <CardBodyContent className="col-span-1 md:col-span-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <h3>{t("dashboard.employees.title")}</h3>
                  <Button
                    onClick={() => handleClickOpenModal("employee")}
                    variant={"outline"}
                  >{t("add")}<UserPlus2 className="w-4 h-4 ml-1" />
                  </Button>
                </div>
                {/* <Button variant={"link"}>{t("view_all")}</Button> */}
              </div>
              { }
              <Table className="mt-5">
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[10px]">#</TableHead>
                    <TableHead className="w-[100px]">{t("name")}</TableHead>
                    <TableHead className="w-[80px]">{t("users.role")}</TableHead>
                    <TableHead className="w-[80px]">{t("users.salary")}</TableHead>
                    <TableHead className="w-[40px]">{t("bills.columns.status")}</TableHead>
                    <TableHead className="w-[20px]">{t("table.action")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {employees.length > 0 ? (
                    [
                      ...employees.map((el, index) => {
                        return { count: index + 1, ...el };
                      }),
                    ]
                      // .slice(0, 9)
                      .map((el, index) => {
                        const encryptId = encryptParam(String(el.id))
                        const employeeActions = [
                          {
                            label: t("view_details"),
                            icon: Eye,
                            onClick: () => {
                              window.location.assign(
                                `/enterprise/salespoints/employee/${encryptId}`
                              );
                            },
                          },
                          {
                            label: el.is_active
                              ? t("actions.deactivate")
                              : t("actions.activate"),
                            icon: RotateCcwSquare,
                            onClick: async () => {
                              try {
                                const res = await instance.patch(
                                  `/employees/${el.id}/`,
                                  { is_active: !el.is_active }
                                );
                                if (res.status === 200) {
                                  showSuccessToast(t("success"));
                                  dispatch(fetchEmployees({ sales_point: isAdmin() ? salespoint ? [salespoint] : [] : [user?.sales_point] }));
                                }
                              } catch (error) {
                                showErrorToast(error, t("errors.retry"));
                              }
                            },
                          },
                        ];

                        return (
                          <TableRow key={el.id}>
                            <TableCell className="font-medium">
                              {el.number}
                            </TableCell>
                            <TableCell className="font-medium capitalize truncate">
                              {el.name} {el.surname}
                            </TableCell>
                            <TableCell className="font-medium capitalize">
                              {el.role}
                            </TableCell>
                            <TableCell className="truncate">
                              {formatteCurrency(el.salary)}
                            </TableCell>
                            <TableCell className="text-right">
                              {el.is_active ? (
                                <div className="flex justify-left items-center gap-1">
                                  <div className="pulse w-3 h-3" />
                                  <p className="text-green-800 font-medium">{t("status.active")}</p>
                                </div>
                              ) : (
                                <div className="flex justify-left items-center gap-1">
                                  <div className="bg-muted-foreground w-2 h-2 rounded-full" />
                                  <p className="text-muted-foreground font-medium">{t("status.inactive")}</p>
                                </div>
                              )}
                            </TableCell>
                            <TableCell>
                              <ActionsDropdown actions={employeeActions} />
                            </TableCell>
                          </TableRow>
                        );
                      })
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="font-medium text-center"
                      >
                        {t("dashboard.employees.empty")}</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardBodyContent>
            <CardBodyContent className="col-span-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <h3>{t("taxes.title")}</h3>
                  <Button
                    onClick={() => handleClickOpenModal("taxes")}
                    variant={"outline"}
                  >{t("add")}<Plus className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </div>
              <Table className="mt-5">
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[10px]">#</TableHead>
                    <TableHead className="w-[100px]">{t("name")}</TableHead>
                    <TableHead className="w-[80px]">{t("taxes.type")}</TableHead>
                    <TableHead className="w-[80px]">{t("taxes.value")}</TableHead>
                    <TableHead className="w-[40px]">{t("taxes.application")}</TableHead>
                    <TableHead className="w-[40px]">{t("bills.columns.status")}</TableHead>
                    <TableHead className="w-[20px]">{t("table.action")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {taxes.length > 0 ? (
                    [
                      ...taxes.map((el, index) => {
                        return { number: index + 1, ...el };
                      }),
                    ]
                      .sort((a, b) => Number(b.is_active) - Number(a.is_active))
                      .slice(0, 9)
                      .map((el, index) => {
                        const taxActions = [
                          {
                            label: el.is_active ? t("actions.deactivate") : t("actions.activate"),
                            icon: RotateCcwSquare,
                            onClick: async () => {
                              try {
                                const res = await instance.post(
                                  `/taxes/${el.id}/${el.is_active ? "deactivate" : "activate"
                                  }/`
                                );
                                if (res.status === 200) {
                                  setTimeout(() => {
                                    window.location.reload();
                                  }, 500);
                                  return toast({
                                    title: t("success"),
                                    description: res.data.status,
                                    variant: "success",
                                    icon: <CheckCircle className="size-4" />,
                                  });
                                }
                              } catch (error) {
                                return toast({
                                  title: t("error"),
                                  description:
                                    error.response.data.detail ||
                                    t("errors.retry"),
                                  variant: "destructive",
                                  icon: <XCircle className="size-4" />,
                                });
                              }
                            },
                          },
                        ];

                        return (
                          <TableRow key={el.id}>
                            <TableCell className="font-medium">
                              {el.number}
                            </TableCell>
                            <TableCell className="font-medium capitalize truncate">
                              {el.tax_name}
                            </TableCell>
                            <TableCell className="font-medium capitalize">
                              {translate[el.tax_type]}
                            </TableCell>
                            <TableCell className="truncate">
                              {Number(el.value)}
                            </TableCell>
                            <TableCell className="font-medium capitalize">
                              {translate[el.tax_application]}
                            </TableCell>
                            <TableCell className="text-right">
                              {el.is_active ? (
                                <div className="flex justify-left items-center gap-1">
                                  <div className="pulse w-3 h-3" />
                                  <p className="text-green-800 font-medium">{t("status.active")}</p>
                                </div>
                              ) : (
                                <div className="flex justify-left items-center gap-1">
                                  <div className="bg-muted-foreground w-2 h-2 rounded-full" />
                                  <p className="text-muted-foreground font-medium">{t("status.inactive")}</p>
                                </div>
                              )}
                            </TableCell>
                            <TableCell>
                              <ActionsDropdown actions={taxActions} />
                            </TableCell>
                          </TableRow>
                        );
                      })
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="font-medium text-center"
                      >
                        {t("users.empty")}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardBodyContent>

            <CardBodyContent className="col-span-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <h3>{t("fees.title")}</h3>
                  <Button
                    onClick={() => handleClickOpenModal("addinional_fees")}
                    variant={"outline"}
                  >{t("add")}<Plus className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </div>
              <Table className="mt-5">
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[10px]">#</TableHead>
                    <TableHead className="w-[100px]">{t("name")}</TableHead>
                    <TableHead className="w-[80px]">{t("fees.type")}</TableHead>
                    <TableHead className="w-[80px]">{t("fees.amount")}</TableHead>
                    <TableHead className="w-[40px]">{t("fees.application")}</TableHead>
                    <TableHead className="w-[40px]">{t("fees.order")}</TableHead>
                    <TableHead className="w-[40px]">{t("bills.columns.status")}</TableHead>
                    <TableHead className="w-[20px]">{t("table.action")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {additionalFees.length > 0 ? (
                    [
                      ...additionalFees.map((el, index) => {
                        return { number: index + 1, ...el };
                      }),
                    ]
                      .sort((a, b) => Number(b.is_active) - Number(a.is_active))
                      .slice(0, 9)
                      .map((el, index) => {
                        const feeActions = [
                          {
                            label: el.is_active ? t("actions.deactivate") : t("actions.activate"),
                            icon: RotateCcwSquare,
                            onClick: async () => {
                              try {
                                const res = await instance.post(
                                  `/additional-fees/${el.id}/${el.is_active ? "deactivate" : "activate"
                                  }/`
                                );
                                if (res.status === 200) {
                                  setTimeout(() => {
                                    window.location.reload();
                                  }, 500);
                                  return toast({
                                    title: t("success"),
                                    description: res.data.status,
                                    variant: "success",
                                    icon: <CheckCircle className="size-4" />,
                                  });
                                }
                              } catch (error) {
                                return toast({
                                  title: t("error"),
                                  description:
                                    error.response.data.detail ||
                                    t("errors.retry"),
                                  variant: "destructive",
                                  icon: <XCircle className="size-4" />,
                                });
                              }
                            },
                          },
                        ];

                        return (
                          <TableRow key={el.id}>
                            <TableCell className="font-medium">
                              {el.number}
                            </TableCell>
                            <TableCell className="font-medium capitalize truncate">
                              {el.name}
                            </TableCell>
                            <TableCell className="font-medium capitalize">
                              {translate[el.fee_type] ?? el.fee_type}
                            </TableCell>
                            <TableCell className="truncate">
                              {Number(el.amount)}
                            </TableCell>
                            <TableCell className="font-medium capitalize">
                              {translate[el.fee_application] ?? el.fee_application}
                            </TableCell>
                            <TableCell className="font-medium capitalize">
                              {translate[el.application_order] ?? el.application_order}
                            </TableCell>
                            <TableCell className="text-right">
                              {el.is_active ? (
                                <div className="flex justify-left items-center gap-1">
                                  <div className="pulse w-3 h-3" />
                                  <p className="text-green-800 font-medium">{t("status.active")}</p>
                                </div>
                              ) : (
                                <div className="flex justify-left items-center gap-1">
                                  <div className="bg-muted-foreground w-2 h-2 rounded-full" />
                                  <p className="text-muted-foreground font-medium">{t("status.inactive")}</p>
                                </div>
                              )}
                            </TableCell>
                            <TableCell>
                              <ActionsDropdown actions={feeActions} />
                            </TableCell>
                          </TableRow>
                        );
                      })
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={8}
                        className="font-medium text-center"
                      >
                        {t("users.empty")}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardBodyContent>

          </div>
        )}
        {status === "failed" && <div className="text-red-600">{error}</div>}
        <Dialog
          open={openModal}
          TransitionComponent={Transition}
          keepMounted
          onClose={handleCloseModal}
          aria-describedby="alert-dialog-slide-description"

        >
          <DialogTitle>{t(modalType == "taxes" ? "taxes.actions.add" : modalType == "addinional_fees" ? "fees.actions.add" : modalType == "employee" ? "users.actions.add_employee" : "add")}</DialogTitle>
          {modalType == "employee" ? (
            <form
              onSubmit={(e) => handleSubmitN(e, handleSubmitForm)}
              className="space-y-3 mt-3"
            >
              <DialogContent className="max-w-lg">
                <DialogContentText id="alert-dialog-slide-description">
                  {
                    t("users.add_employee_description")
                  }
                </DialogContentText>
                {fieldsM.map((input) => {
                  if (input.type === "select" && Array.isArray(input.options)) {
                    return (
                      <div key={input.name} className="mt-3">
                        <Combobox
                          RightIcon={ChevronDown}
                          options={input.options}
                          buttonLabel={input.label + " *"}
                          onValueChange={(option) => {
                            if (!option) return;

                            setFieldValueM(input.name, option.id);

                            if (input.name === "sales_point") {
                              getData(option.id);
                            }
                          }}
                          value={
                            data.find((s) => s.id == valuesM[input.name]) || null
                          }
                          getOptionValue={(option) => option.id}
                          getOptionLabel={(option) =>
                            `${option.name}${input.name === "sales_point"
                              ? " - " + option?.address
                              : ""
                            }`
                          }
                          placeholder={input.label}
                          className="z-[99999] popover-content-width-full"
                          buttonClassName={
                            errorsM[input.name] ? "border-red-500" : ""
                          }
                        />

                        {errorsM[input.name] && (
                          <p className="text-red-500 text-xs font-medium ml-4 mt-1">
                            {errorsM[input.name]}
                          </p>
                        )}
                      </div>
                    );
                  }

                  if (["text", "email", "number"].includes(input.type)) {
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
                        value={valuesM[input.name] || ""}
                        onChange={handleChangeM}
                        error={!!errorsM[input.name]}
                        helperText={errorsM[input.name]}
                      />
                    );
                  }

                  if (input.type === "checkbox") {
                    return (
                      <div
                        className="flex items-center mt-4 space-x-2"
                        key={input.name}
                      >
                        <Checkbox
                          id={input.name}
                          checked={!!valuesM[input.name]}
                          onCheckedChange={(checked) =>
                            setFieldValueM(input.name, !!checked)
                          }
                        />
                        <label
                          htmlFor={input.name}
                          className="text-sm font-medium"
                        >
                          {input.label}
                        </label>
                      </div>
                    );
                  }

                  return null;
                })}
              </DialogContent>
              <DialogActions>
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleCloseModal}
                >{t("cancel")}</Button>
                <Button
                  variant="primary"
                  type="submit"
                >{t("add")}</Button>
              </DialogActions>
            </form>
          ) : null}
          {modalType == "taxes" ? (
            <form
              onSubmit={(e) => handleSubmitN(e, handleSubmitForm)}
              className="space-y-3 mt-3"
            >
              <DialogContent className="max-w-lg">
                <DialogContentText id="alert-dialog-slide-description">
                  {
                    t("taxes.add_description")
                  }
                </DialogContentText>
                <div className="space-y-3">
                  {fieldsN.map((input) => {
                    if (
                      input.name == "sales_point" &&
                      Array.isArray(input.options)
                    ) {
                      return (
                        <div key={input.name} className="mt-3">
                          <Combobox
                            RightIcon={ChevronDown}
                            options={input.options}
                            buttonLabel={input.label + " *"}
                            onValueChange={(e) => {
                              if (input.name === "sales_point") {
                                setFieldValueN(input.name, e?.id);
                                setValuesN((prevValues) => ({
                                  ...prevValues,
                                }));
                                getData();
                              }
                              if (input.name === "product") {
                                setValuesN((prevValues) => ({
                                  ...prevValues,
                                }));
                              }
                            }}
                            value={data.find(
                              (s) => s.id == values["sales_point"]
                            )}
                            getOptionValue={(option) =>
                              `${option.id} ${option.name} ${input.name == "sales_point"
                                ? option?.address
                                : ""
                              }`
                            }
                            placeholder={input.label}
                            className="z-[99999] popover-content-width-full"
                            buttonClassName={
                              errorsN[input.name] && "border-red-500"
                            }
                            getOptionLabel={(option) =>
                              `${option.name} ${input.name == "sales_point"
                                ? " - " + option?.address
                                : ""
                              }`
                            }
                          />
                          {errorsN[input.name] && (
                            <p className="text-red-500 text-xs font-medium ml-4 mt-1">
                              {errorsN[input.name]}
                            </p>
                          )}
                        </div>
                      );
                    }
                    if (
                      (input.name == "tax_application" ||
                        input.name == "tax_type") &&
                      Array.isArray(input.options)
                    ) {
                      return (
                        <Select
                          required={input.required}
                          name={input.name}
                          key={input.name}
                          value={valuesN[input.name] ?? ""}
                          onValueChange={(e) => {
                            setFieldValueN(input.name, e);
                            setValuesN((val) => {
                              return { ...val, [input.name]: e };
                            });
                          }}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder={input.label} />
                          </SelectTrigger>
                          <SelectContent className="z-[9999]">
                            <SelectGroup>
                              <SelectLabel>{input.label}</SelectLabel>
                              {input?.options?.map((option) => (
                                <SelectItem
                                  key={option.value}
                                  value={option.value}
                                >
                                  {option?.text}
                                </SelectItem>
                              ))}
                            </SelectGroup>
                          </SelectContent>
                        </Select>
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
                          value={valuesN[input.name]}
                          onChange={handleChangeN}
                          error={!!errorsN[input.name]}
                          helperText={errorsN[input.name]}
                        />
                      );
                    }
                  })}
                </div>
              </DialogContent>
              <DialogActions>
                <Button
                  className="hover:bg-red-600 transition bg-red-500"
                  onClick={handleCloseModal}
                >{t("cancel")}</Button>
                <Button
                  className="hover:bg-green-600 transition bg-green-500"
                  type="submit"
                >{t("add")}</Button>
              </DialogActions>
            </form>
          ) : null}
          {modalType == "addinional_fees" ? (
            <form
              onSubmit={(e) => handleSubmitF(e, handleSubmitForm)}
              className="space-y-3 mt-3"
            >
              <DialogContent className="max-w-lg">
                <DialogContentText id="alert-dialog-slide-description">
                  {
                    t("fees.add_description")
                  }
                </DialogContentText>
                <div className="space-y-3">
                  {fieldsF.map((input) => {
                    if (
                      input.name == "sales_point" &&
                      Array.isArray(input.options)
                    ) {
                      return (
                        <div key={input.name} className="mt-3">
                          <Combobox
                            RightIcon={ChevronDown}
                            options={input.options}
                            buttonLabel={input.label + " *"}
                            onValueChange={(e) => {
                              setFieldValueF(input.name, e?.id);
                              setValuesF((prevValues) => ({
                                ...prevValues,
                              }));
                              getData();
                            }}
                            value={data.find(
                              (s) => s.id == valuesF["sales_point"]
                            ) || null}
                            getOptionValue={(option) => option.id}
                            getOptionLabel={(option) =>
                              `${option.name} - ${option?.address}`
                            }
                            placeholder={input.label}
                            className="z-[99999] popover-content-width-full"
                            buttonClassName={
                              errorsF[input.name] ? "border-red-500" : ""
                            }
                          />
                          {errorsF[input.name] && (
                            <p className="text-red-500 text-xs font-medium ml-4 mt-1">
                              {errorsF[input.name]}
                            </p>
                          )}
                        </div>
                      );
                    }
                    if (
                      (input.name == "fee_type" ||
                        input.name == "fee_application" ||
                        input.name == "application_order") &&
                      Array.isArray(input.options)
                    ) {
                      return (
                        <Select
                          required={input.required}
                          name={input.name}
                          key={input.name}
                          value={valuesF[input.name] ?? ""}
                          onValueChange={(e) => {
                            setFieldValueF(input.name, e);
                            setValuesF((val) => {
                              return { ...val, [input.name]: e };
                            });
                          }}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder={input.label} />
                          </SelectTrigger>
                          <SelectContent className="z-[9999]">
                            <SelectGroup>
                              <SelectLabel>{input.label}</SelectLabel>
                              {input?.options?.map((option) => (
                                <SelectItem
                                  key={option.value}
                                  value={option.value}
                                >
                                  {option?.text}
                                </SelectItem>
                              ))}
                            </SelectGroup>
                          </SelectContent>
                        </Select>
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
                          value={valuesF[input.name] ?? ""}
                          onChange={handleChangeF}
                          error={!!errorsF[input.name]}
                          helperText={errorsF[input.name]}
                        />
                      );
                    }
                  })}
                </div>
              </DialogContent>
              <DialogActions>
                <Button
                  className="hover:bg-red-600 transition bg-red-500"
                  onClick={handleCloseModal}
                >{t("cancel")}</Button>
                <Button
                  className="hover:bg-green-600 transition bg-green-500"
                  type="submit"
                >{t("add")}</Button>
              </DialogActions>
            </form>
          ) : null}
          {modalType == "users" ? (
            <form
              onSubmit={(e) => handleChangeN(e, handleSubmitForm)}
              className="space-y-3 mt-3"
            >
              <DialogContent className="max-w-lg">
                <DialogContentText id="alert-dialog-slide-description">
                  {
                    t("users.add_employee_description")
                  }
                </DialogContentText>
                {fieldsM.map((input) => {
                  if (input.type === "select" && Array.isArray(input.options)) {
                    return (
                      <div key={input.name} className="mt-3">
                        <Combobox
                          RightIcon={ChevronDown}
                          options={input.options}
                          buttonLabel={input.label + " *"}
                          onValueChange={(e) => {
                            if (input.name === "sales_point") {
                              setFieldValueM(input.name, e?.id);
                              setValuesM((prevValues) => ({
                                ...prevValues,
                              }));
                              getData();
                            }
                            if (input.name === "product") {
                              setValuesM((prevValues) => ({
                                ...prevValues,
                              }));
                            }
                          }}
                          value={data.find(
                            (s) => s.id == values["sales_point"]
                          )}
                          getOptionValue={(option) =>
                            `${option.id} ${option.name} ${input.name == "sales_point" ? option?.address : ""
                            }`
                          }
                          placeholder={input.label}
                          className="z-[99999] popover-content-width-full"
                          buttonClassName={
                            errorsM[input.name] && "border-red-500"
                          }
                          getOptionLabel={(option) =>
                            `${option.name} ${input.name == "sales_point"
                              ? " - " + option?.address
                              : ""
                            }`
                          }
                        />
                        {errorsM[input.name] && (
                          <p className="text-red-500 text-xs font-medium ml-4 mt-1">
                            {errorsM[input.name]}
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
                        value={valuesM[input.name]}
                        onChange={handleChangeM}
                        error={!!errorsM[input.name]}
                        helperText={errorsM[input.name]}
                      />
                    );
                  }
                  if (input.type === "checkbox") {
                    return (
                      <div
                        className="flex items-center mt-4 space-x-2"
                        key={input.name}
                      >
                        <Checkbox
                          id={input.name}
                          checked={valuesM[input.name]}
                          onCheckedChange={(checked) =>
                            setFieldValueM(input.name, checked)
                          }
                        />
                        <label
                          htmlFor={input.name}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {input.label}
                        </label>
                      </div>
                    );
                  }
                })}
              </DialogContent>
              <DialogActions>
                <Button
                  className="hover:bg-red-600 transition bg-red-500"
                  onClick={handleCloseModal}
                >{t("cancel")}</Button>
                {modalType === 'employee' ?
                  <PlanGate resource="employees" bannerSize="compact">
                    <Button
                      className="hover:bg-green-600 transition bg-green-500"
                      type="submit"
                    >
                      {t("add")}
                    </Button>
                  </PlanGate>
                  :
                  <Button
                    className="hover:bg-green-600 transition bg-green-500"
                    type="submit"
                  >
                    {t("add")}
                  </Button>
                }
              </DialogActions>
            </form>
          ) : null}
        </Dialog>

        <Dialog
          open={open}
          onClose={handleClose}
          TransitionComponent={Transition}
          PaperProps={{
            component: "form",
            onSubmit: async (event: React.FormEvent<HTMLFormElement>) => {
              event.preventDefault();
              setLoading(true)
              try {
                await handleSubmit(event, await createSalesPoint(values));
                resetForm();
                handleClose();
                getData()
              } catch (error) {
                console.log(error);
              } finally {
                setLoading(false)
              }
            },
          }}
        >
          <DialogTitle>{t("sales_points.actions.create")}</DialogTitle>
          <DialogContent className="max-w-lg">
            <DialogContentText>
              {t("sales_points.dialog_description")} <br />
              {t("sales_points.dialog_warning")}
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
                label={t(field.labelKey)}
                type={field.type}
                autoComplete="off"
                fullWidth
                size="small"
              />
            ))}
          </DialogContent>
          <DialogActions>
            <Button variant={"destructive"} onClick={handleClose}>{t("cancel")}</Button>
            <PlanGate resource="sales_points" bannerSize="compact">
              <Button
                type="submit"
                variant={"default"}
                disabled={loading}
                className="bg-green-600 hover:bg-green-700"
              >{loading ? t("please wait") : t("continue")}</Button>
            </PlanGate>
          </DialogActions>
        </Dialog>
      </div>
    </>
  );
}

export default SalesPoint;