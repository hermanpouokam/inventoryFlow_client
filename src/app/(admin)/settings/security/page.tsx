"use client";
import React from "react";
import { useSettingsData } from "../account/context/settingsData";
import { Backdrop, CircularProgress, Divider, TextField } from "@mui/material";
import { Switch } from "@/components/ui/switch";

export default function Page() {
  const { user }: { user: User | null } = useSettingsData();

  return (
    <div className="space-y-5">
      <Backdrop
        sx={{ color: "#8b5cf6", zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={!user}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
      <h3 className="text-3xl font-semibold text-neutral-900">Sécurité</h3>
      <Divider />
      <div className="space-y-4">
        <div className="">
          <label htmlFor="name">Ancien mot de passe</label>
          <TextField
            type="text"
            id="name"
            defaultValue={user?.name}
            required
            fullWidth
            size="small"
            name="name"
            placeholder="Entrez votre nom"
          />
        </div>
        <div className="">
          <label htmlFor="name">Nouveau mot de passe</label>
          <TextField
            type="text"
            id="name"
            defaultValue={user?.name}
            required
            fullWidth
            size="small"
            name="name"
            placeholder="Entrez votre nom"
          />
        </div>
        <div className="">
          <label htmlFor="name">confirmez le mot de passe</label>
          <TextField
            type="text"
            id="name"
            defaultValue={user?.name}
            required
            fullWidth
            size="small"
            name="name"
            placeholder="Entrez votre nom"
          />
        </div>
      </div>
      <Divider />
      <div className="flex rounded-lg border p-3 shadow-sm">
        <div className="">
          <p className="text-base font-semibold text-neutral-900">
            Demander un code de connexion
          </p>
          <span className="text-muted-foreground text-sm font-normal w-3/4 block">
            Lorem ipsum dolor sit, amet consectetur adipisicing elit. Voluptas
            officia aliquam iste. Culpa minus, aspernatur debitis amet
            praesentium ducimus deleniti dignissimos voluptas quam aut officia
            nesciunt sapiente non ipsum sit.
          </span>
        </div>
        <Switch />
      </div>
    </div>
  );
}
