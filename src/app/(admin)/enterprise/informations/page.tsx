"use client";
import React from "react";
import UrlBasedTabs, { Tab } from "@/components/URLbasedTab";
import GeneralInformations from "./GenrealInformations";
import PaymentInformations from "./PaymentInformations";

export default function Page() {
  const tabs: Tab[] = [
    {
      value: "generalInformations",
      label: "Générales",
      content: <GeneralInformations />,
    },
    {
      value: "paiementInfo",
      label: "Paiement",
      content: <PaymentInformations />,
    },
  ];
  return (
    <div className="bg-white shadow rounded overflow-x-hidden space-y-5">
      <div className="py-2 px-2 sm:px-2 md:px-3 lg:px-5  border-b">
        <h3 className="text-foreground font-semibold text-xl capitalize my-5">
          Informations d'entreprise
        </h3>
      </div>
      <div className="py-2 px-2 sm:px-2 md:px-3 lg:px-5 space-y-5">
        <UrlBasedTabs tabs={tabs} />
      </div>
    </div>
  );
}
