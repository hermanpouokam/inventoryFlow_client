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
import { UserPlus } from "lucide-react";

export default function Page() {
  const [salesPoint, setSalesPoint] = React.useState<number | null>();
  const [client_category, setCategory] = React.useState<number | null>();
  const [message, setMessage] = React.useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [loading, setLoading] = React.useState(false);

  const dispatch: AppDispatch = useDispatch();

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
      dispatch(fetchSalesPoints({}));
    }
    document.title = "Ajouter un client";
  }, [status, statuscat, dispatch]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    try {
      const { data: fieldData, isEmpty } = getFormData(event.currentTarget);
      const data = { ...fieldData, sales_point: salesPoint, client_category };
      const res = await createClient({ ...data, salesPoint });
      if (res) {
        setMessage({
          type: "success",
          text: "Client crée avec succès",
        });
      }
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      setMessage({
        type: "error",
        text: "Une erreur s'est produite vérifiez votre connexion et réessayez",
      });
      setLoading(false);
    }
  };

  const handleChange = (event: SelectChangeEvent) => {
    setSalesPoint(event.target.value);
    dispatch(fetchClientCat({ sales_points: [event.target.value] }));
  };
  const handleChangeCat = (event: SelectChangeEvent) => {
    setCategory(event.target.value);
  };

  return (
    <div className="space-y-5">
      <form onSubmit={handleSubmit} autoComplete="off">
        <div className="w-full p-5 shadow flex flex-row justify-between items-center rounded bg-white border border-neutral-300">
          <h2 className="font-medium text-base">Ajouter un client</h2>
          <Button
            disabled={loading}
            type="submit"
            className="bg-violet-600 hover:bg-violet-700 space-x-3"
          >
            {loading ? (
              <>
                <CircularProgress size={15} color={"inherit"} />
                {"  "}
                Veuillez patienter
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4 mr-3" />
                {"   "}
                Enregistrer le client
              </>
            )}
          </Button>
        </div>
        <div className="w-full place-items-center gap-5">
          <div className="max-w-lg w-full py-5 px-2 mt-5 shadow rounded bg-white border  border-neutral-300 space-x-5">
            {message && (
              <div
                className={`${
                  message.type == "success" ? "bg-green-200" : "bg-red-200"
                } text-center rounded-sm p-3 self-center max-w-[100%] mb-5`}
              >
                <p
                  className={`${
                    message.type == "success"
                      ? "text-green-600"
                      : "text-red-500"
                  } text-base font-semibold`}
                >
                  {message.text}
                </p>
              </div>
            )}
            <h2 className="font-medium text-bases text-center">
              Remplissez les informations
            </h2>
            <div className="grid mt-5 pb-5 sm:px-[10%] px-[5%]  grid-cols-1 gap-5">
              <FormControl size="small" required fullWidth>
                <InputLabel id="demo-simple-select-label">
                  Point de vente
                </InputLabel>
                <Select
                  labelId="demo-simple-select-label"
                  id="demo-simple-select"
                  size="small"
                  value={salesPoint}
                  label="Point de vente"
                  onChange={handleChange}
                >
                  {data.map((sp) => (
                    <MenuItem key={sp.id} value={sp.id}>
                      {sp.name} - {sp.address}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl size="small" required fullWidth>
                <InputLabel id="demo-simple-select-label">
                  Catégorie du client
                </InputLabel>
                <Select
                  labelId="demo-simple-select-label"
                  id="demo-simple-select"
                  value={client_category}
                  label="Catégorie du client"
                  onChange={handleChangeCat}
                  size="small"
                >
                  {categories.map((sp) => (
                    <MenuItem key={sp.id} value={sp.id}>
                      {sp.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              {fields.map((field) => (
                <TextField
                  required={field.reuired}
                  label={`${field.label} du client`}
                  key={field.name}
                  name={field.name}
                  size="small"
                />
              ))}
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

const fields = [
  {
    name: "name",
    reuired: true,
    label: "nom",
  },
  {
    name: "surname",
    reuired: false,
    label: "Prenom",
  },
  {
    name: "number",
    reuired: false,
    label: "email",
  },
  {
    name: "email",
    reuired: false,
    label: "numero",
  },
  {
    name: "address",
    reuired: false,
    label: "Adresse",
  },
];
