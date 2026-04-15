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
  // { key: "ledger", label: "Ledger", permission: "EXAM_READ" },
  { key: "expenses_income", label: "Expenses & Income", permission: "EXAM_READ" },
  { key: "events", label: "Events", permission: "EXAM_READ" },
  { key: "history", label: "History", permission: "EXAM_READ" },
]

type Tab = {
  id: string;
  label: string;
  content_type: string;
  input_fields?: { key: string; type: string; options?: string[] }[];
};

// const visibleTabs = tabs.filter(tab => hasPermission(tab.permission))

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState<Org | null>(null);
  const [mode, setMode] = useState("business");
  const [visibleTabs, setVisibleTabs] = useState<typeof tabs>([]);
  const [moduleTabs, setModuleTabs] = useState<Tab[]>([]);
  const [activeModuleTab, setActiveModuleTab] = useState<string | null>(null);
  const [moduleModalOpen, setModuleModalOpen] = useState(false);
  const [isSubmittingModule, setIsSubmittingModule] = useState(false);
  // const [inputCount, setInputCount] = useState(0);
  const [accessToken, setAccessToken] = useState("");
  const [fields, setFields] = useState<
    { key: string; type: string; options?: string[] }[]
  >([]);

  useEffect(() => {
    setVisibleTabs(tabs.filter(tab => hasPermission(tab.permission)));

    const token = localStorage.getItem("access_token");
    if (token) setAccessToken(token);
  }, []);

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 1024) setSidebarOpen(false);
    };
    if (accessToken) {
      fetchModuleTabs();
    }
    // fetchModuleTab();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [accessToken]);

  const fetchModuleTabs = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/module-tabs`, {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      })

      const data = await res.json()

      if (!res.ok) throw new Error(data.message)

      setModuleTabs(data)
    } catch (err: any) {
      toast.error(err.message || "Failed to fetch modules")
    }
  }

  const activeLabel = useMemo(() => {
    return tabs.find((t) => t.key === activeTab)?.label ?? "Overview";
  }, [activeTab]);

  // Input fields
  const addField = () => {
    setFields((prev) => [
      ...prev,
      { key: "", type: "string", options: [] },
    ]);
  };

  const updateField = (index: number, field: any) => {
    const updated = [...fields];
    updated[index] = { ...updated[index], ...field };
    setFields(updated);
  };

  const removeField = (index: number) => {
    setFields((prev) => prev.filter((_, i) => i !== index));
  };

  // options
  const addOption = (index: number) => {
    const updated = [...fields];
    updated[index].options = [...(updated[index].options || []), ""];
    setFields(updated);
  };

  const updateOption = (fieldIndex: number, optIndex: number, value: string) => {
    const updated = [...fields];
    updated[fieldIndex].options![optIndex] = value;
    setFields(updated);
  };

  // const handleInputNoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   const value = parseInt(e.target.value, 10);
  //   // if (!isNaN(value) && value >= 0) {
  //   //   setInputCount(value);
  //   // }
  // }

  const handleModuleCLick = (tab: any) => {
    setActiveTab(tab.module_name)
    setActiveModuleTab(tab.id)
  }

  const validateFields = () => {
    for (const field of fields) {
      if (!field.key) {
        toast.error("All fields must have a key");
        return false;
      }

      if (field.type === "select" && (!field.options || field.options.length < 2)) {
        toast.error("Select fields must have at least 2 options");
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateFields()) return;

    if (!selectedOrg?.id) {
      toast.error("Select a subsidiary");
      return;
    }

    try {
      setIsSubmittingModule(true);
      console.log('accessTokenffff:', accessToken);

      const module_name = (e.target as any).module_name.value.trim().toLowerCase().replace(/\s+/g, '_');

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/module-tabs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        credentials: "include",
        body: JSON.stringify({
          module_name: module_name,
          module_desc: (e.target as any).module_desc.value,
          no_input: fields.length,
          input_fields: fields,
          record: {},
          btn_text: (e.target as any).btn_text.value,
          subsidiaryId: selectedOrg.id,
        }),
      });

      if (!res.ok) throw new Error("Failed");

      toast.success("Module created");
      setModuleModalOpen(false);
      setFields([]);

    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsSubmittingModule(false);
    }
  };

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

            <div className="flex justify-end mb-4">
              <button className="hidden lg:flex mb-4 ml-4 items-center gap-2 text-xs font-black uppercase text-red-600 hover:bg-red-50 px-4 py-2 rounded-xl transition-all shadow-sm border border-red-50 shrink-0" type="button">
                Export Audit
              </button>
            </div>
            <div className="flex items-end border-b border-slate-200 mb-8 sm:mb-10">
              <div className="flex-1 overflow-x-auto whitespace-nowrap scrollbar-hide">
                {/* <div className="flex items-center gap-4 pr-6">
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
                  <button
                    onClick={() => setActiveTab('overview')}
                    className={`flex items-center gap-2.5 pb-4 px-1 border-b-2 transition-all font-bold text-xs uppercase tracking-wide shrink-0 border-transparent text-slate-400 hover:text-slate-600
                      }`}
                    type="button"
                  >
                    Add module
                  </button>
                </div> */}
                <div className="flex items-center justify-between mb-6">
                  {/* Tabs */}
                  <div className="flex-1 overflow-x-auto scrollbar-hide">
                    <div className="flex items-center gap-2 pr-4">

                      {/* Overview */}
                      <button
                        onClick={() => setActiveTab("overview")}
                        className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all whitespace-nowrap
          ${activeTab === "overview"
                            ? "bg-red-600 text-white shadow-sm"
                            : "text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                          }`}
                      >
                        Overview
                      </button>

                      {/* Dynamic Tabs */}
                      {visibleTabs.map((tab) => (
                        <button
                          key={tab.key}
                          onClick={() => setActiveTab(tab.key)}
                          className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all whitespace-nowrap
            ${activeTab === tab.key
                              ? "bg-red-600 text-white shadow-sm"
                              : "text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                            }`}
                        >
                          {tab.label}
                        </button>
                      ))}

                      {moduleTabs.map((tab: any) => (
                        <button
                          key={tab.id}
                          onClick={() => handleModuleCLick(tab)}
                          className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all whitespace-nowrap capitalize
            ${activeTab === tab.module_name
                              ? "bg-red-600 text-white shadow-sm"
                              : "text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                            }`}
                        >
                          {tab.module_name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Actions (separate from tabs) */}
                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => setModuleModalOpen(true)}
                      className="px-4 py-2 rounded-xl text-sm font-semibold border border-slate-200 hover:bg-slate-100 transition"
                    >
                      + Add Module
                    </button>

                    <button
                      className="hidden lg:flex items-center px-4 py-2 rounded-xl text-sm font-semibold text-red-600 hover:bg-red-50 border border-red-100 transition"
                    >
                      Export
                    </button>
                  </div>
                </div>
              </div>

            </div>
          </div>

          <div className="mt-6">
            <TabContent activeTab={activeTab} selectedOrg={selectedOrg} moduleTabs={moduleTabs} activeModuleTab={activeModuleTab} fetchModuleTabs={fetchModuleTabs} />
          </div>
        </div>

        {moduleModalOpen && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-[100] flex items-center justify-center p-4 overflow-y-auto text-left">
            <div className="bg-white w-full max-w-xl h-[85vh] rounded-3xl shadow-3xl overflow-y-auto animate-in zoom-in-95 duration-300 border border-slate-100 text-left">
              <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/30 text-left">
                <h2 className="text-lg font-bold uppercase tracking-tight text-slate-900 text-left">
                  Module
                </h2>

                <button
                  onClick={() => setModuleModalOpen(false)}
                  type="button"
                  className="w-8 h-8 rounded-lg bg-white border border-slate-100 flex items-center justify-center text-slate-400 hover:text-red-600 transition-all shadow-sm"
                  disabled={isSubmittingModule}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width={16}
                    height={16}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M18 6 6 18" />
                    <path d="m6 6 12 12" />
                  </svg>
                </button>
              </div>

              <div className="p-8 space-y-6 text-left">
                <form onSubmit={handleSubmit} className="space-y-4 text-left text-slate-800 font-bold">
                  <div className="flex flex-col gap-2 w-full font-semibold text-left">
                    <label className="text-xs text-slate-500 ml-1 uppercase tracking-wider">
                      Content Type
                    </label>
                    <select
                      className="bg-slate-50 border border-slate-100 rounded-xl py-4 px-5 text-sm font-medium focus:ring-2 focus:ring-red-100 outline-none transition-all placeholder:text-slate-300"
                      name="content_type"
                      required
                      disabled={isSubmittingModule}
                    >
                      <option>Content Type</option>
                      <option value="card">Card</option>
                      <option value="table">Table</option>
                      <option value="Calendar">Calendar</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-2 w-full font-semibold text-left">
                    <label className="text-xs text-slate-500 ml-1 uppercase tracking-wider">
                      Module Name
                    </label>
                    <input
                      className="bg-slate-50 border border-slate-100 rounded-xl py-4 px-5 text-sm font-medium focus:ring-2 focus:ring-red-100 outline-none transition-all placeholder:text-slate-300"
                      name="module_name"
                      placeholder="Enter module name"
                      required
                      disabled={isSubmittingModule}
                    />
                  </div>

                  <div className="flex flex-col gap-2 w-full font-semibold text-left">
                    <label className="text-xs text-slate-500 ml-1 uppercase tracking-wider">
                      Module Description
                    </label>
                    <input
                      className="bg-slate-50 border border-slate-100 rounded-xl py-4 px-5 text-sm font-medium focus:ring-2 focus:ring-red-100 outline-none transition-all placeholder:text-slate-300"
                      name="module_desc"
                      placeholder="Module decription"
                      required
                      disabled={isSubmittingModule}
                    />
                  </div>

                  <div className="flex flex-col gap-2 w-full font-semibold text-left">
                    <label className="text-xs text-slate-500 ml-1 uppercase tracking-wider">
                      No Of Input required for the modal
                    </label>
                    <input
                      className="bg-slate-50 border border-slate-100 rounded-xl py-4 px-5 text-sm font-medium focus:ring-2 focus:ring-red-100 outline-none transition-all placeholder:text-slate-300"
                      type="number"
                      name="no_input"
                      placeholder="0"
                      required
                      disabled={isSubmittingModule}
                    // onChange={handleInputNoChange}
                    />
                  </div>
                  {/* If conditions will be here  */}
                  {/* {
                    inputCount > 0 && (
                      <div className="flex flex-col gap-6">
                        {Array.from({ length: inputCount }).map((_, index) => (
                          <div key={index} className="flex gap-2">
                            <div className="flex flex-col gap-2 w-full font-semibold text-left">
                              <label className="text-xs text-slate-500 ml-1 uppercase tracking-wider">
                                Input Text
                              </label>
                              <input
                                className="bg-slate-50 border border-slate-100 rounded-xl py-4 px-5 text-sm font-medium focus:ring-2 focus:ring-red-100 outline-none transition-all placeholder:text-slate-300"
                                type="text"
                                name="input_text"
                                placeholder="Enter input text"
                                required
                                disabled={isSubmittingModule}
                                onChange={handleInputNoChange}
                              />
                            </div>
                            <div className="flex flex-col gap-2 w-full font-semibold text-left">
                              <label className="text-xs text-slate-500 ml-1 uppercase tracking-wider">
                                Input Type
                              </label>
                              <select
                                className="bg-slate-50 border border-slate-100 rounded-xl py-4 px-5 text-sm font-medium focus:ring-2 focus:ring-red-100 outline-none transition-all placeholder:text-gray-300"
                                name="input_type"
                                required
                                disabled={isSubmittingModule}
                              >
                                <option className="text-gray-200">Type</option>
                                <option value="text">Text</option>
                                <option value="number">Number</option>
                                <option value="select">Select</option>
                              </select>
                            </div>
                          </div>
                        ))}
                      </div>
                    )
                  } */}
                  <div className="flex flex-col gap-6">
                    {fields.map((field, index) => (
                      <div key={index} className="p-4 border rounded-xl bg-slate-50 space-y-4">

                        {/* Top row */}
                        <div className="flex gap-2">
                          <input
                            placeholder="Field key (e.g. name)"
                            value={field.key}
                            onChange={(e) =>
                              updateField(index, { key: e.target.value })
                            }
                            className="flex-1 px-4 py-3 rounded-lg border"
                          />

                          <select
                            value={field.type}
                            onChange={(e) =>
                              updateField(index, { type: e.target.value })
                            }
                            className="px-4 py-3 rounded-lg border"
                          >
                            <option value="string">Text</option>
                            <option value="number">Number</option>
                            <option value="boolean">Boolean</option>
                            <option value="select">Select</option>
                          </select>

                          <button
                            onClick={() => removeField(index)}
                            type="button"
                            className="px-3 text-red-500"
                          >
                            ✕
                          </button>
                        </div>

                        {/* SELECT OPTIONS */}
                        {field.type === "select" && (
                          <div className="space-y-2">
                            <p className="text-xs text-slate-500">Options</p>

                            {field.options?.map((opt, optIndex) => (
                              <input
                                key={optIndex}
                                value={opt}
                                onChange={(e) =>
                                  updateOption(index, optIndex, e.target.value)
                                }
                                placeholder={`Option ${optIndex + 1}`}
                                className="w-full px-3 py-2 border rounded-lg"
                              />
                            ))}

                            <button
                              type="button"
                              onClick={() => addOption(index)}
                              className="text-sm text-blue-600"
                            >
                              + Add option
                            </button>
                          </div>
                        )}
                      </div>
                    ))}

                    <button
                      type="button"
                      onClick={addField}
                      className="py-3 border border-dashed rounded-xl text-sm text-slate-500 hover:bg-slate-100"
                    >
                      + Add Field
                    </button>
                  </div>
                  <div className="flex flex-col gap-2 w-full font-semibold text-left">
                    <label className="text-xs text-slate-500 ml-1 uppercase tracking-wider">
                      Submit Button Text
                    </label>
                    <input
                      className="bg-slate-50 border border-slate-100 rounded-xl py-4 px-5 text-sm font-medium focus:ring-2 focus:ring-red-100 outline-none transition-all placeholder:text-slate-300"
                      name="btn_text"
                      placeholder="Submit"
                      required
                      disabled={isSubmittingModule}
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-red-600 text-white py-5 rounded-xl font-bold uppercase tracking-widest text-lg mt-4 text-center"
                    disabled={isSubmittingModule}
                  >
                    {isSubmittingModule ? "Saving..." : "Create Module"}
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
          .scrollbar-hide::-webkit-scrollbar { display: none; }
          .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }

          .custom-scrollbar::-webkit-scrollbar { width: 4px; }
          .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
          .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
        `}</style>
    </div >
  );
};

export default Dashboard;