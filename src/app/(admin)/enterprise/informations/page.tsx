"use client";
import React from "react";
import UrlBasedTabs, { Tab } from "@/components/URLbasedTab";
import GeneralInformations from "./GenrealInformations";
import PaymentInformations from "./PaymentInformations";
import CardBodyContent from "@/components/CardContent";

export default function Page() {
  
  return (
    <CardBodyContent className="shadow rounded overflow-x-hidden space-y-5">
      <div className="py-2 px-2 sm:px-2 md:px-3 lg:px-5 space-y-5">
        <PaymentInformations />
      </div>
    </CardBodyContent>
  );
}
