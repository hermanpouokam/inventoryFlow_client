"use client";
import { getUserData } from "@/components/auth";
import { createContext, ReactNode, useContext, useEffect, useState } from "react";

// Définition du type pour le contexte
// interface SettingsDataProps {
//   data: string;
//   setData: (value: string) => void;
// }

// Création du contexte avec un type explicite
const DataContext = createContext({});

export const useSettingsData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error(
      "useSettingsData must be used within a SettingsDataProvider"
    );
  }
  return context;
};

// Provider pour envelopper l'application ou un layout
export const SettingsDataProvider = ({ children }) => {

  const [data, setData] = useState("Hello from Layout!");
  const [user, setUser] = useState(null)

  const getUser = async () => {
    const res = await getUserData()
    setUser(res)
  }

  useEffect(() => {
    getUser()
  }, []);

  const value = { data, user };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

// Hook personnalisé pour utiliser le contexte
