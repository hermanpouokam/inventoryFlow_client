"use client";
import React from "react";
import UrlBasedTabs, { Tab } from "@/components/URLbasedTab";
import GeneralInformations from "./GenrealInformations";
import PaymentInformations from "./PaymentInformations";
import CardBodyContent from "@/components/CardContent";

export default function Page() {

  return (
    <CardBodyContent className="shadow overflow-x-hidden space-y-5">
      <PaymentInformations />
    </CardBodyContent>
  );
}
