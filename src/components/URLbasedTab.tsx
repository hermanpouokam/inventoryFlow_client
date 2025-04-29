"use client";

import React, { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export interface Tab {
  value: string;
  label: string;
  content: JSX.Element;
}

interface UrlBasedTabsProps {
  tabs: Tab[];
}

const UrlBasedTabs: React.FC<UrlBasedTabsProps> = ({ tabs }) => {
  const [activeTab, setActiveTab] = useState<string>(tabs[0].value);

  // Récupérer l'onglet actif depuis l'URL au chargement
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tabFromUrl = urlParams.get("tab");
    if (tabFromUrl && tabs.some((tab) => tab.value === tabFromUrl)) {
      setActiveTab(tabFromUrl);
    }
  }, [tabs]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);

    // Mettre à jour l'URL sans recharger la page
    const url = new URL(window.location.href);
    url.searchParams.set("tab", value);
    window.history.pushState({}, "", url.toString());
  };

  return (
    <Tabs
      defaultValue={activeTab}
      value={activeTab}
      onValueChange={handleTabChange}
      className=""
    >
      <TabsList className="rounded-full">
        {tabs.map((tab) => (
          <TabsTrigger
            key={tab.value}
            className="px-10 sm:px-5 md:px-10 lg:px-14 rounded-full"
            value={tab.value}
          >
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
      <div className="bg-white min-w-full min-h-[70vh] p-5 rounded">
        {tabs.map((tab) => (
          <TabsContent key={tab.value} value={tab.value}>
            {tab.content}
          </TabsContent>
        ))}
      </div>
    </Tabs>
  );
};

export default UrlBasedTabs;
