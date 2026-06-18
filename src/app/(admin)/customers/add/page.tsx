"use client";
import getFormData from "@/components/functions";
/* eslint-disable react-hooks/rules-of-hooks */
import { Button } from "@/components/ui/button";
import { fetchSalesPoints } from "@/redux/salesPointsSlicer";
import { AppDispatch, RootState } from "@/redux/store";
import {
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  TextField,
} from "@mui/material";
import * as React from "react";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import { createClient } from "../functions";
import { fetchClientCat } from "@/redux/clientCatSlicer";
import { ChevronDown, UserPlus } from "lucide-react";
import { usePermission } from "@/context/PermissionContext";
import SelectPopover from "@/components/SelectPopover";
import { Combobox } from "@/components/ComboBox";
import CardBodyContent from "@/components/CardContent";
import { useTranslation } from "react-i18next";

export default function Page() {
  const [salesPoint, setSalesPoint] = React.useState<number | null>();
  const [client_category, setCategory] = React.useState<number | null>(null);
  const [message, setMessage] = React.useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [loading, setLoading] = React.useState(false);
  const { t } = useTranslation("common");

  const dispatch: AppDispatch = useDispatch();
  const { isAdmin, user } = usePermission()
  const { data, error, status } = useSelector(
    (state: RootState) => state.salesPoints
  );
  const {
    data: categories,
    error: errorCat,
    status: statuscat,
  } = useSelector((state: RootState) => state.clientCat);

  React.useEffect(() => {
    if (status === "idle") {
      dispatch(fetchSalesPoints());
    }
    if (!isAdmin() && statuscat === 'idle') {
      dispatch(fetchClientCat({ sales_points: [user?.sales_point] }))
    }
    document.title = t("customers.add_title");
  }, [status, statuscat, dispatch, t]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!client_category) {
      return setMessage({
        type: "error",
        text: t("customers.errors.select_category"),
      });
    }

    setLoading(true);

    try {
      const { data: fieldData } = getFormData(event.currentTarget);

      const data = {
        ...fieldData,
        sales_point: isAdmin() ? salesPoint : user?.sales_point,
        client_category,
      };

      const res = await createClient({ ...data, salesPoint });

      if (res) {
        setMessage({
          type: "success",
          text: t("customers.success.created"),
        });
      }

      setTimeout(() => {
        window.location.reload();
      }, 1000);

    } catch (error) {
      setMessage({
        type: "error",
        text: t("customers.errors.network"),
      });

      setLoading(false);
    }
  };

  const handleChange = (item: SalesPoint) => {
    setSalesPoint(item.id);
    dispatch(fetchClientCat({ sales_points: [item.id] }));
  };
  
  const handleChangeCat = (item: Category) => {
    if (client_category) {
      return setCategory(null)
    }
    setCategory(item.id);
  };

  return (
    <div className="space-y-5">
      <form onSubmit={handleSubmit} autoComplete="off">
        <div className="w-full place-items-center -mt-5">
          <CardBodyContent className="max-w-lg w-full py-5 px-2 mt-5 rounded-lg space-x-5">

            {message && (
              <div
                className={`${message.type == "success" ? "bg-green-600/20" : "bg-red-200"
                  } text-center rounded-sm p-3 self-center max-w-[100%] mb-5`}
              >
                <p
                  className={`${message.type == "success"
                    ? "text-green-600"
                    : "text-red-500"
                    } text-base font-semibold`}
                >
                  {t(`common.messages.${message.type}`, message.text)}
                </p>
              </div>
            )}

            <h2 className="font-medium text-center text-lg">
              {t("customers.add_title")}
            </h2>

            <h2 className="text-hero-muted text-sm text-center mt-3">
              {t("customers.subtitle")}
            </h2>

            <div className="grid mt-5 pb-5 sm:px-[10%] px-[5%] grid-cols-1 gap-5">

              {isAdmin() && (
                <Combobox
                  options={data}
                  getOptionLabel={(option) => `${option.name} - ${option.address}`}
                  getOptionValue={(option) => `${option.id}`}
                  onValueChange={(item) => handleChange(item)}
                  RightIcon={ChevronDown}
                  buttonLabel={t("customers.sales_point")}
                  placeholder={t("customers.sales_point")}
                  value={data.find((sp) => sp.id === salesPoint)}
                  className="z-[999999999999]"
                />
              )}

              <Combobox
                options={categories}
                getOptionLabel={(option) => `${option.name}`}
                getOptionValue={(option) => `${option.name}${option.id}`}
                onValueChange={(item) => handleChangeCat(item)}
                RightIcon={ChevronDown}
                buttonLabel={t("customers.category")}
                placeholder={t("customers.category")}
                value={categories.find(el => el.id == client_category)}
              />

              {fields.map((field) => (
                <TextField
                  required={field.required}
                  label={t(`customers.fields.${field.name}`)}
                  key={field.name}
                  className="bg-card"
                  name={field.name}
                  size="small"
                />
              ))}
              <Button
                disabled={loading}
                variant={"primary"}
                type="submit"
                className="space-x-3"
              >
                {loading ? (
                  <>
                    <span>{t("loading")}</span>
                  </>
                ) : (
                  <>
                    <span>{t("customers.submit")}</span>
                  </>
                )}
              </Button>
            </div>
          </CardBodyContent>
        </div>
      </form>
    </div>
  )
}

const fields = [
  {
    name: "name",
    reuired: true,
    
  },
  {
    name: "surname",
    reuired: false,
    
  },
  {
    name: "number",
    reuired: false,
    
  },
  {
    name: "email",
    reuired: false,
    
  },
  {
    name: "address",
    reuired: false,
    
  },
];
