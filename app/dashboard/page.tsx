"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import Header from "../components/header";
import Sidebar from "../components/sidebar";
import { hasPermission } from "@/utils/permissions"
import TabContent from "../components/TabContent";

type Org = { id: string; name: string };

const tabs = [
  { key: "exams", label: "Exams", permission: "EXAM_READ" },
  { key: "inventory", label: "Inventory", permission: "STOCK_READ" },
  { key: "liabilities", label: "Liabilities", permission: "LOAN_READ" },
  { key: "vault", label: "Vault", permission: "EXAM_READ" },
  { key: "ledger", label: "Ledger", permission: "EXAM_READ" },
  { key: "history", label: "History", permission: "EXAM_READ" },
]

// const visibleTabs = tabs.filter(tab => hasPermission(tab.permission))

interface LedgerEntry {
  timeline: string;
  narrative: string;
  lead: string;
  value: string;
  isPositive: boolean;
}

const ledgerEntries: LedgerEntry[] = [
  {
    timeline: "15 Feb, 05:45 pm",
    narrative: "JAMB Registration Fees (Total Batch)",
    lead: "Tunde",
    value: "+₦1,850,000",
    isPositive: true,
  },
  {
    timeline: "6 Jan, 11:20 am",
    narrative: "Generator Fueling (Abbey)",
    lead: "Tunde",
    value: "-₦110,000",
    isPositive: false,
  },
  {
    timeline: "7 Jan, 05:00 pm",
    narrative: "Utility Bill (December)",
    lead: "Ifeanyi",
    value: "-₦59,290",
    isPositive: false,
  },
];

interface Liability {
  category: string;
  date: string;
  lead: string;
  title: string;
  description: string;
  monthlyInstallment: string;
  totalValue: string;
}

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState<Org | null>(null);
  const [mode, setMode] = useState("business");
  const [visibleTabs, setVisibleTabs] = useState<typeof tabs>([]);

  useEffect(() => {
    setVisibleTabs(tabs.filter(tab => hasPermission(tab.permission)));
  }, []);

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 1024) setSidebarOpen(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const activeLabel = useMemo(() => {
    return tabs.find((t) => t.key === activeTab)?.label ?? "Overview";
  }, [activeTab]);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-16 sm:pb-20 selection:bg-red-100 selection:text-red-700">
      <Header mode={mode} onModeChange={setMode} />

      <div className="lg:hidden sticky top-0 z-30 bg-slate-50/90 backdrop-blur border-b border-slate-100">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-3 flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(true)}
            className="w-10 h-10 rounded-xl border border-slate-200 bg-white shadow-sm flex items-center justify-center"
            aria-label="Open sidebar"
            type="button"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>

          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
              Active Tab
            </p>
            <p className="text-sm font-black uppercase truncate">{activeLabel}</p>
          </div>

          <button className="ml-auto flex items-center gap-2 text-xs font-black uppercase text-red-600 hover:bg-red-50 px-4 py-2 rounded-xl transition-all shadow-sm border border-red-50" type="button">
            Export
          </button>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 flex flex-col lg:flex-row gap-6 lg:gap-10">
        <div className={`${mode == "business" ? "lg:block" : "lg:hidden"}  hidden`}>
          <Sidebar selectedOrg={selectedOrg} onOrgChange={setSelectedOrg} />
        </div>

        <div className={`lg:hidden fixed inset-0 z-40 ${sidebarOpen ? "" : "pointer-events-none"}`}>
          <div
            className={`absolute inset-0 bg-black/40 transition-opacity ${sidebarOpen ? "opacity-100" : "opacity-0"}`}
            onClick={() => setSidebarOpen(false)}
          />
          <div
            className={`absolute left-0 top-0 h-full w-[86%] max-w-[360px] bg-slate-50 border-r border-slate-100 shadow-xl transition-transform ${sidebarOpen ? "translate-x-0" : "-translate-x-full"
              }`}
          >
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <p className="text-xs font-black uppercase tracking-widest text-slate-500">Menu</p>
              <button
                onClick={() => setSidebarOpen(false)}
                className="w-9 h-9 rounded-xl border border-slate-200 bg-white flex items-center justify-center"
                aria-label="Close sidebar"
                type="button"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 6 6 18" />
                  <path d="m6 6 12 12" />
                </svg>
              </button>
            </div>

            <div className="p-4">
              <Sidebar selectedOrg={selectedOrg} onOrgChange={setSelectedOrg} />
            </div>
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="relative">
            <div className="pointer-events-none absolute left-0 top-0 h-full w-6 bg-gradient-to-r from-slate-50 to-transparent" />
            <div className="pointer-events-none absolute right-0 top-0 h-full w-10 bg-gradient-to-l from-slate-50 to-transparent" />

            <div className="flex items-end border-b border-slate-200 mb-8 sm:mb-10">
              <div className="flex-1 overflow-x-auto whitespace-nowrap scrollbar-hide">
                <div className="flex items-center gap-4 pr-6">
                  <button
                    onClick={() => setActiveTab('overview')}
                    className={`flex items-center gap-2.5 pb-4 px-1 border-b-2 transition-all font-bold text-xs uppercase tracking-wide shrink-0 ${activeTab === 'overview'
                      ? "border-red-600 text-red-600"
                      : "border-transparent text-slate-400 hover:text-slate-600"
                      }`}
                    type="button"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M8 2v4" />
                      <path d="M16 2v4" />
                      <rect width="18" height="18" x="3" y="4" rx="2" />
                      <path d="M3 10h18" />
                      <path d="M8 14h.01" />
                      <path d="M12 14h.01" />
                      <path d="M16 14h.01" />
                      <path d="M8 18h.01" />
                      <path d="M12 18h.01" />
                      <path d="M16 18h.01" />
                    </svg>
                    Overview
                  </button>
                  {visibleTabs.map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key)}
                      className={`flex items-center gap-2.5 pb-4 px-1 border-b-2 transition-all font-bold text-xs uppercase tracking-wide shrink-0 ${activeTab === tab.key
                        ? "border-red-600 text-red-600"
                        : "border-transparent text-slate-400 hover:text-slate-600"
                        }`}
                      type="button"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M8 2v4" />
                        <path d="M16 2v4" />
                        <rect width="18" height="18" x="3" y="4" rx="2" />
                        <path d="M3 10h18" />
                        <path d="M8 14h.01" />
                        <path d="M12 14h.01" />
                        <path d="M16 14h.01" />
                        <path d="M8 18h.01" />
                        <path d="M12 18h.01" />
                        <path d="M16 18h.01" />
                      </svg>
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              <button className="hidden lg:flex mb-4 ml-4 items-center gap-2 text-xs font-black uppercase text-red-600 hover:bg-red-50 px-4 py-2 rounded-xl transition-all shadow-sm border border-red-50 shrink-0" type="button">
                Export Audit
              </button>
            </div>
          </div>

          <div className="mt-6">
            <TabContent activeTab={activeTab} selectedOrg={selectedOrg} />
          </div>
        </div>
      </div>

      <style>{`
          .scrollbar-hide::-webkit-scrollbar { display: none; }
          .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }

          .custom-scrollbar::-webkit-scrollbar { width: 4px; }
          .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
          .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
        `}</style>
    </div>
  );
};

export default Dashboard;