"use client";
import CardBodyContent from "@/components/CardContent";
import { Button } from "@/components/ui/button";
import { fetchSalesPoints } from "@/redux/salesPointsSlicer";
import { AppDispatch, RootState } from "@/redux/store";
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
  Grid2x2X,
  Package,
  Plus,
  RotateCcwSquare,
  UserPlus2,
  Users,
  UsersRound,
  X,
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
    label: "Nom du point de vente",
    type: "text",
    required: false,
  },
  {
    name: "address",
    label: "Adresse du point de vente",
    type: "text",
    required: false,
  },
  {
    name: "balance",
    label: "Montant initial du solde",
    type: "number",
    required: false,
  },
];

import { useSearchParams } from "next/navigation";
import { fetchPackagings } from "@/redux/packagingsSlicer";
import { fetchEmployees } from "@/redux/employeesSlicer";
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
import { createEmployee, createTax } from "./function";
import { useToast } from "@/components/ui/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import { fetchTaxes } from "@/redux/taxesSlicer";
import ActionsDropdown from "@/components/ActionButton";
import { translate } from "@/utils/constants";

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
  const { toast } = useToast();
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
  const {
    data: employees,
    status: statusEmployees,
    error: errorEmployee,
  } = useSelector((state: RootState) => state.employees);
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
    if (status === "idle") {
      dispatch(fetchSalesPoints());
    }
    if (statusStock === "idle") {
      dispatch(fetchProducts({ sales_points: salespoint ? [salespoint] : [] }));
    }
    if (statusPackagings == "idle") {
      dispatch(
        fetchPackagings({ sales_points: salespoint ? [salespoint] : [] })
      );
    }
    if (statusBills === "idle") {
      dispatch(fetchBills({ sales_point: salespoint ? [salespoint] : [] }));
    }
    if (statusEmployees === "idle") {
      dispatch(fetchEmployees({ sales_point: salespoint ? [salespoint] : [] }));
    }
    if (taxesStatus === "idle") {
      dispatch(fetchTaxes({ sales_point: salespoint ? [salespoint] : [] }));
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
        label: "Solde caisse",
        value: function () {
          const total = [
            ...(salespoint ? data.filter((sp) => sp.id == salespoint) : data),
          ].reduce((acc, sp) => acc + Number(sp.cash_register.balance), 0);
          return `${formatteCurrency(total, "XAF", "fr-FR")}`;
        },
        subText: `${salespoint ? "1 point de vente" : data.length + " points de vente"
          }`,
      },
      {
        icon: Package,
        label: "Montant du stock",
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
        subText: `${stock.length} articles et ${packagings.length} emballages`,
      },
      {
        icon: CircleDollarSignIcon,
        label: "Dèttes client",
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
        subText: `${bills.filter(
          (bill) =>
            Number(bill.paid) != Number(bill.total_amount_with_taxes_fees) &&
            bill.state != "created"
        ).length
          } factures(s)`,
      },
      {
        icon: DollarSign,
        label: "Total du capital",
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
        label: "Nombre d'employées",
        value: function () {
          return `${employees.length}`;
        },
        subText: `${salespoint ? "1 point de vente" : data.length + " points de vente"
          }`,
      },
      {
        icon: Users,
        label: "Masse salariale",
        value: function () {
          const total = employees.reduce((acc, curr) => {
            return (acc += Number(curr.monthly_salary));
          }, 0);
          return `${formatteCurrency(total)}`;
        },
        subText: `${employees.length + " employee"}${employees.length > 1 ? "s" : ""
          }`,
      },
      {
        icon: UsersRound,
        label: "Clients actifs",
        value: function () {
          return `${clients.length}`;
        },
        subText: `${salespoint ? "1 point de vente" : data.length + " points de vente"
          }`,
      },
    ],
    [data, stock, bills, packagings]
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
        label: "Point de vente",
        type: "select",
        options: data,
      },
      {
        name: "name",
        required: true,
        label: "Nom",
        type: "text",
      },
      {
        name: "surname",
        required: true,
        label: "prénom",
        type: "text",
      },
      {
        name: "role",
        required: true,
        label: "Role",
        type: "text",
      },
      {
        name: "salary",
        required: true,
        label: "Salaire",
        type: "number",
      },
      {
        name: "is_deliverer",
        required: true,
        label: "Livreur",
        type: "checkbox",
      },
    ],
    [status]
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
        label: "Point de vente",
        type: "select",
        options: data,
      },
      {
        name: "tax_name",
        required: true,
        label: "Nom",
        type: "text",
      },
      {
        name: "tax_type",
        required: true,
        label: "Type de taxe",
        type: "select",
        options: [
          {
            value: "percentage",
            text: "Pourcentage",
          },
          {
            value: "flat",
            text: "Fixe",
          },
        ],
      },
      {
        name: "value",
        required: true,
        label: "Valeur",
        type: "number",
      },
      {
        name: "tax_application",
        required: true,
        label: "Application",
        type: "select",
        options: [
          {
            value: "bill",
            text: "Vente",
          },
          {
            value: "supply",
            text: "Achat",
          },
        ],
      },
    ],
    [status]
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

  const handleSubmitForm = async () => {
    if (modalType == "employee") {
      try {
        const res = await createEmployee({ ...valuesM });
        if (res.status == 201) {
          getData();
          setOpenModal(false);
          resetformM();
          setTimeout(() => {
            window.location.reload();
          }, 500);
          return toast({
            variant: "default",
            title: "Succès",
            description: res.data.success ?? "Employé créé avec succès.",
            icon: <Check className="mr-4" />,
            className: "text-white bg-green-600 border-green-600",
          });
        }
      } catch (error) {
        return toast({
          variant: "destructive",
          title: "Erreur",
          description:
            error.response.data.error ??
            "Une erreur est survenue lors de la crétion de l'employé.",
          icon: <X className="mr-4" />,
        });
      }
    } else if (modalType == "taxes") {
      if (!valuesN.sales_point) {
        return setFieldErrorN("sales_point", "Sélectionnez un point de vente");
      }
      try {
        const res = await createTax({ ...valuesN });
        if (res.status == 201) {
          getData();
          setOpenModal(false);
          resetformN();
          setTimeout(() => {
            window.location.reload();
          }, 500);
          return toast({
            variant: "default",
            title: "Succès",
            description: res.data.success ?? "Taxe créée avec succès.",
            icon: <Check className="mr-4" />,
            className: "text-white bg-green-600 border-green-600",
          });
        }
      } catch (error) {
        return toast({
          variant: "destructive",
          title: "Erreur",
          description:
            error.response.data.error ??
            "Une erreur est survenue lors de la crétion de la taxe.",
          icon: <X className="mr-4" />,
        });
      }
    }
  };

  return (
    <>
      <div className="space-y-5">
        <CardBodyContent>
          <div className="flex flex-row justify-between items-center">
            <h2 className="text-base font-medium">Points de ventes</h2>
            <Button
              variant="default"
              onClick={handleClickOpen}
              className="bg-violet-600 hover:bg-violet-500"
            >
              Créer un point de vente
            </Button>
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
            <SelectValue placeholder="Tous les points de vente" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Points de ventes</SelectLabel>
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
                  <div
                    key={i}
                    className="shadow border select-none border-neutral-300 rounded-lg bg-white p-5"
                  >
                    <div className="flex flex-row justify-between items-center">
                      <p className="text-sm font-semibold">{card.label}</p>
                      <card.icon className="text-muted-foreground" size={15} />
                    </div>
                    <h2 className="text-2xl mt-2 font-bold">{card.value()}</h2>
                    <span className="text-xs -mt-2 text-muted-foreground">
                      {card.subText}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="border-2 flex-col border-dashed h-[500px] gap-1 border-neutral-400 bg-white flex justify-center items-center">
                <Grid2x2X className="w-16 h-16" />
                <h3 className="font-bold text-xl">Aucun point de vente</h3>
                <h3 className="font-mediun text-base text-muted-foreground">
                  Vous n&apos;avez aucun point de vente
                </h3>
                <Button
                  variant="default"
                  onClick={handleClickOpen}
                  className="bg-violet-500 hover:bg-violet-600"
                >
                  Créer un point de vente
                </Button>
              </div>
            )}
          </>
        )}
        {statusEmployees != "succeeded" ? (
          <div>{errorEmployee}</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            <CardBodyContent className="col-span-1 md:col-span-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <h3>{"Liste d'utilisateurs"}</h3>
                  <Button
                    onClick={() => window.location.assign("/enterprise/salespoints/newUser")}
                    variant={"outline"}
                  >
                    Ajouter
                    <UserPlus2 className="w-4 h-4 ml-1" />
                  </Button>
                </div>
                <Button variant={"link"}>Voir tout</Button>
              </div>
              { }
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[10px]">#</TableHead>
                    <TableHead className="w-[100px]">Nom Prenom</TableHead>
                    <TableHead className="w-[80px]">Username</TableHead>
                    <TableHead className="w-[80px]">Role</TableHead>
                    <TableHead className="w-[40px]">Statut</TableHead>
                    <TableHead className="w-[20px]">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {employees.length > 0 ? (
                    [
                      ...employees.map((el, index) => {
                        return { number: index + 1, ...el };
                      }),
                    ]
                      .slice(0, 9)
                      .map((el, index) => (
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
                                <p className="text-green-800 font-medium">
                                  Actif
                                </p>
                              </div>
                            ) : (
                              <div className="flex justify-left items-center gap-1">
                                <div className="bg-muted-foreground w-2 h-2 rounded-full" />
                                <p className="text-muted-foreground font-medium">
                                  Inactif
                                </p>
                              </div>
                            )}
                          </TableCell>
                          <TableCell></TableCell>
                        </TableRow>
                      ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="font-medium text-center"
                      >
                        Aucun utilisateur enregistré
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardBodyContent>
            <CardBodyContent className="col-span-1 md:col-span-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <h3>Liste d'employés</h3>
                  <Button
                    onClick={() => handleClickOpenModal("employee")}
                    variant={"outline"}
                  >
                    Ajouter
                    <UserPlus2 className="w-4 h-4 ml-1" />
                  </Button>
                </div>
                <Button variant={"link"}>Voir tout</Button>
              </div>
              { }
              <Table>
                {/* <TableCaption>A list of your recent invoices.</TableCaption> */}
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[10px]">#</TableHead>
                    <TableHead className="w-[100px]">Nom</TableHead>
                    <TableHead className="w-[80px]">Role</TableHead>
                    <TableHead className="w-[80px]">Salaire</TableHead>
                    <TableHead className="w-[40px]">Statut</TableHead>
                    <TableHead className="w-[20px]">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {employees.length > 0 ? (
                    [
                      ...employees.map((el, index) => {
                        return { number: index + 1, ...el };
                      }),
                    ]
                      .slice(0, 9)
                      .map((el, index) => (
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
                                <p className="text-green-800 font-medium">
                                  Actif
                                </p>
                              </div>
                            ) : (
                              <div className="flex justify-left items-center gap-1">
                                <div className="bg-muted-foreground w-2 h-2 rounded-full" />
                                <p className="text-muted-foreground font-medium">
                                  Inactif
                                </p>
                              </div>
                            )}
                          </TableCell>
                          <TableCell></TableCell>
                        </TableRow>
                      ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="font-medium text-center"
                      >
                        Aucun employé
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
                {/* <TableFooter>
                  <TableRow>
                    <TableCell colSpan={3}>Total</TableCell>
                    <TableCell className="text-right">$2,500.00</TableCell>
                  </TableRow>
                </TableFooter> */}
              </Table>
            </CardBodyContent>
            <CardBodyContent className="col-span-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <h3>Taxes</h3>
                  <Button
                    onClick={() => handleClickOpenModal("taxes")}
                    variant={"outline"}
                  >
                    Ajouter
                    <Plus className="w-4 h-4 ml-1" />
                  </Button>
                </div>
                {/* <Button variant={"link"}>Voir tout</Button> */}
              </div>
              { }
              <Table>
                {/* <TableCaption>A list of your recent invoices.</TableCaption> */}
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[10px]">#</TableHead>
                    <TableHead className="w-[100px]">Nom</TableHead>
                    <TableHead className="w-[80px]">Type</TableHead>
                    <TableHead className="w-[80px]">valeur</TableHead>
                    <TableHead className="w-[40px]">Application</TableHead>
                    <TableHead className="w-[20px]">Statut</TableHead>
                    <TableHead className="w-[20px]">Action</TableHead>
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
                            label: el.is_active ? "Désactiver" : "Activer",
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
                                    title: "Succès",
                                    description: res.data.status,
                                    variant: "destructive",
                                    className: "bg-green-600 border-green-600",
                                    icon: <CheckIcon className="mr-2" />,
                                  });
                                }
                              } catch (error) {
                                return toast({
                                  title: "Succès",
                                  description:
                                    error.response.data.detail ||
                                    "Une erreur est survenue veuillez réessayer",
                                  variant: "destructive",
                                  className: "bg-red-500 border-red-500",
                                  icon: <X className="mr-2" />,
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
                                  <p className="text-green-800 font-medium">
                                    Actif
                                  </p>
                                </div>
                              ) : (
                                <div className="flex justify-left items-center gap-1">
                                  <div className="bg-muted-foreground w-2 h-2 rounded-full" />
                                  <p className="text-muted-foreground font-medium">
                                    Inactif
                                  </p>
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
                        Aucun employé
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
                {/* <TableFooter>
                  <TableRow>
                    <TableCell colSpan={3}>Total</TableCell>
                    <TableCell className="text-right">$2,500.00</TableCell>
                  </TableRow>
                </TableFooter> */}
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
          <DialogTitle>{`Ajouter ${modalType == "taxes"
            ? "une taxe"
            : modalType == "addinional_fees"
              ? "frais supplémentaire"
              : modalType == "employee"
                ? " un employé"
                : null
            }`}</DialogTitle>
          {modalType == "employee" ? (
            <form
              onSubmit={(e) => handleChangeN(e, handleSubmitForm)}
              className="space-y-3 mt-3"
            >
              <DialogContent>
                <DialogContentText id="alert-dialog-slide-description">
                  {
                    "Vous allez ajouter un nouvel employé. Entrez les informations et continuez"
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
                >
                  Annuler
                </Button>
                <Button
                  className="hover:bg-green-600 transition bg-green-500"
                  type="submit"
                >
                  Ajouter
                </Button>
              </DialogActions>
            </form>
          ) : null}
          {modalType == "taxes" ? (
            <form
              onSubmit={(e) => handleSubmitN(e, handleSubmitForm)}
              className="space-y-3 mt-3"
            >
              <DialogContent>
                <DialogContentText id="alert-dialog-slide-description">
                  {
                    "Vous allez ajouter une taxe. Entrez les informations et continuez"
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
                >
                  Annuler
                </Button>
                <Button
                  className="hover:bg-green-600 transition bg-green-500"
                  type="submit"
                >
                  Ajouter
                </Button>
              </DialogActions>
            </form>
          ) : null}
          {modalType == "users" ? (
            <form
              onSubmit={(e) => handleChangeN(e, handleSubmitForm)}
              className="space-y-3 mt-3"
            >
              <DialogContent>
                <DialogContentText id="alert-dialog-slide-description">
                  {
                    "Vous allez ajouter un nouvel employé. Entrez les informations et continuez"
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
                >
                  Annuler
                </Button>
                <Button
                  className="hover:bg-green-600 transition bg-green-500"
                  type="submit"
                >
                  Ajouter
                </Button>
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
              try {
                await handleSubmit(event, await createSalesPoint(values));
                if (!errors) {
                  resetForm();
                  handleClose();
                }
              } catch (error) {
                console.log(error);
              }
            },
          }}
        >
          <DialogTitle>Créer un point de vente</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Entrez les informations du point de vente et enregistrez. <br />
              Assurez-vous de ne pas faire d&apos;erreur dans vos entrées.
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
                label={field.label}
                type={field.type}
                autoComplete="off"
                fullWidth
                size="small"
              />
            ))}
          </DialogContent>
          <DialogActions>
            <Button variant={"destructive"} onClick={handleClose}>
              Annuler
            </Button>
            <Button
              type="submit"
              variant={"default"}
              className="bg-green-600 hover:bg-green-700"
            >
              Continuer
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    </>
  );
}

export default SalesPoint;
