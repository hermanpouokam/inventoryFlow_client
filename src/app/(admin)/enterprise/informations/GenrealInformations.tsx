"use client";
import { Combobox } from "@/components/ComboBox";
import { instance } from "@/components/fetch";
import { Button } from "@/components/ui/button";
import { translate } from "@/utils/constants";
import { CircularProgress, TextField } from "@mui/material";
import { ChevronDown } from "lucide-react";
import React, { memo, useCallback, useEffect, useState } from "react";
import PhoneNumberField from "@/components/CountryPicker";

const GeneralInformations = React.memo(() => {
  const [enterprise, setEnterprise] = useState<EnterpriseDetails | null>(null);

  useEffect(() => {
    // Charger les données de l'entreprise actuelle depuis l'API
    instance
      .get("/enterprises/")
      .then((response) => {
        const data = response.data[0];
        setEnterprise({
          name: data.name,
          address: data.address,
          phone: data.phone,
          email: data.email,
          currency: data.currency,
          nc: data.nc,
        });
        console.log("entreprise_________-", data);
      })
      .catch((error) => {
        console.error("Error loading enterprise data", error);
      });
  }, []);

  const handleSubmit = (e: any) => {
    e.preventDefault();

    instance
      .put("/enterprise/update/", enterprise)
      .then((response) => {
        console.log("Enterprise updated successfully", response.data);
      })
      .catch((error) => {
        console.error("Error updating enterprise", error);
      });
  };

  const handleChange = (e: any) => {
    if (enterprise) {
      setEnterprise({
        ...enterprise,
        [e.target.name]: e.target.value,
      });
    }
  };

  const handlePhoneNumberChange = useCallback((newValue) => {
    console.log("new phone value", newValue);
    setEnterprise({ ...enterprise, ["phone"]: newValue.number });
    // setEnterprise({ ...enterprise, ["country"]: newValue.country });
  }, []);

  if (!enterprise) {
    return (
      <div className="w-full h-full flex justify-center items-center">
        <CircularProgress />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <h3 className="text-lg text-foreground font-semibold mb-2">Générales</h3>
      <hr />
      <form onSubmit={handleSubmit} className="space-y-5">
        {Object.keys(enterprise).map((key: any) => {
          console.log("enterprise", enterprise);
          if (key === "phone") {
            return (
              <div key={key} className="grid grid-cols-2 sm:grid-cols-3">
                <label className="text-base font-semibold first-letter:capitalize">
                  {translate[key]}:
                </label>
                <PhoneNumberField
                  key={enterprise?.phone}
                  value={enterprise?.phone}
                  onChange={handlePhoneNumberChange}
                />
              </div>
            );
          }
          if (key === "currency") {
            return (
              <div key={key} className="grid grid-cols-2 sm:grid-cols-3">
                <label className="text-base font-semibold first-letter:capitalize">
                  {translate[key]}:
                </label>
                <Combobox
                  options={["USD", "EUR", "GBP", "XAF"]}
                  RightIcon={ChevronDown}
                  onValueChange={(e) =>
                    setEnterprise({ ...enterprise, ["currency"]: e })
                  }
                  getOptionValue={(option) => `${option}`}
                  value={enterprise[key]}
                  buttonLabel="devise"
                  getOptionLabel={(option) => `${option}`}
                  placeholder="Devise"
                />
              </div>
            );
          }
          return (
            <div key={key} className="grid grid-cols-2 sm:grid-cols-3">
              <label className="text-base font-semibold first-letter:capitalize">
                {translate[key]} :
              </label>
              <TextField
                type="text"
                name={key}
                size="small"
                value={enterprise[key]}
                onChange={handleChange}
              />
            </div>
          );
        })}
        <div className="justify-center items-center flex w-full mt-5">
          <Button type="submit" className="w-[40%]">
            Enregistrer les informations
          </Button>
        </div>
      </form>
    </div>
  );
});

export default GeneralInformations;
