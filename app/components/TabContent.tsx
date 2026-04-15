"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import Header from "../components/header";
import Sidebar from "../components/sidebar";
import { hasPermission } from "@/utils/permissions"

const tabs = [
  { key: "exams", label: "Exams", permission: "EXAM_READ" },
  { key: "inventory", label: "Inventory", permission: "STOCK_READ" },
  { key: "liabilities", label: "Liabilities", permission: "LOAN_READ" },
  { key: "vault", label: "Vault", permission: "EXAM_READ" },
  { key: "ledger", label: "Ledger", permission: "EXAM_READ" },
  { key: "history", label: "History", permission: "EXAM_READ" },
]

const visibleTabs = tabs.filter(tab => hasPermission(tab.permission))

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

const TabContent = ({
  activeTab,
  activeModuleTab,
  selectedOrg,
  moduleTabs,
  fetchModuleTabs
}: {
  activeTab: string;
  selectedOrg: any | null;
  moduleTabs: any[];
  activeModuleTab: string | null;
  fetchModuleTabs: () => Promise<void>;
}) => {
  // const categoryId = selectedOrg?.id;
  const categoryId = selectedOrg?.categories?.business?.id ?? null;

  const [liabilityModalOpen, setLiabilityModalOpen] = useState(false);
  const [examModalOpen, setExamModalOpen] = useState(false);
  const [stockModalOpen, setStockModalOpen] = useState(false);
  const [financeModalOpen, setFinanceModalOpen] = useState(false);
  const [eventModalOpen, setEventModalOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const [overview, setOverview] = useState<any>({
    seat_throughput: 0,
      project_inflow: 0,
      inventory: 0,
      monthly_dept: 0,
      net_capital: 0,
      compliance_audit: 0,
      asset: 0,
  });
  const [exams, setExams] = useState<any[]>([]);
  const [stocks, setStocks] = useState<any[]>([]);
  const [loans, setLoans] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [eventMode, setEventMode] = useState<"create" | "edit">("create");
  const [deleteTarget, setDeleteTarget] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [locationType, setLocationType] = useState<string>("physical");
  const [selectedEvents, setSelectedEvents] = useState<any[]>([]);
  const [eventDetailsOpen, setEventDetailsOpen] = useState(false);

  const [isOrgLoading, setIsOrgLoading] = useState(false);
  const [isSubmittingExam, setIsSubmittingExam] = useState(false);
  const [isSubmittingStock, setIsSubmittingStock] = useState(false);
  const [isSubmittingLoan, setIsSubmittingLoan] = useState(false);
  const [isSubmittingFinance, setIsSubmittingFinance] = useState(false);
  const [isSubmittingEvent, setIsSubmittingEvent] = useState(false);
  const [isDeletingEvent, setIsDeletingEvent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [accessToken, setAccessToken] = useState("");

  const abortRef = useRef<AbortController | null>(null);

  const EmptyState = ({ title }: { title: string }) => (
    <div className="bg-white rounded-3xl p-10 border border-slate-100 shadow-sm text-center">
      <p className="text-xs font-bold uppercase tracking-widest text-slate-400">{title}</p>
    </div>
  );

  const LoadingState = ({ title }: { title: string }) => (
    <div className="bg-white rounded-3xl p-10 border border-slate-100 shadow-sm text-center">
      <p className="text-xs font-bold uppercase tracking-widest text-slate-400">{title}</p>
    </div>
  );

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (token) setAccessToken(token);
  }, []);

  const fetchOverview = async () => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/subsidiary-categories/overview`, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    })

    const data = await res.json()
    console.log('overview_data:', data);
    setOverview(data);
  };

  const fetchExams = async (categoryIdValue: string, signal?: AbortSignal) => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/exams?categoryId=${categoryIdValue}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    })

    const data = await res.json()
    setExams(data);
  };

  const fetchStocks = async (categoryIdValue: string, signal?: AbortSignal) => {
    if (!accessToken) return;
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/stocks?categoryId=${categoryIdValue}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    })

    const data = await res.json()
    if (!res.ok) throw new Error(data.message)
    setStocks(data);
  };

  const fetchLoans = async (categoryIdValue: string, signal?: AbortSignal) => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/loans?categoryId=${categoryIdValue}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.message)

    const formatted = data.map((loan: any) => {
      const termMonths = Number(loan.term);
      const monthly = termMonths ? loan.principal / termMonths : loan.principal;

      return {
        id: loan.id,
        category: "Loan",
        date: new Date(loan.createdAt).toLocaleDateString(),
        lead: "You",
        title: loan.ledger_identity,
        description: loan.operational_narrative,
        monthlyInstallment: `₦${monthly.toLocaleString()}`,
        totalValue: `₦${loan.principal.toLocaleString()}`,
      };
    });

    setLoans(formatted);
  };

  const fetchEvents = async (categoryIdValue: string) => {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/events?categoryId=${categoryIdValue}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    const data = await res.json();
    setEvents(data);
  };

  const refetchAll = async (categoryIdValue: string) => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setIsOrgLoading(true);

    try {
      await Promise.all([
        fetchOverview(),
        fetchStocks(categoryIdValue, controller.signal),
        fetchExams(categoryIdValue, controller.signal),
        fetchLoans(categoryIdValue, controller.signal),
        fetchEvents(categoryIdValue),
      ]);
    } catch (err: any) {
      if (err?.name !== "AbortError") {
        toast.error(err?.message || "Failed to load data.");
      }
    } finally {
      setIsOrgLoading(false);
    }
  };

  useEffect(() => {
    if (!categoryId) {
      setExams([]);
      setStocks([]);
      setLoans([]);
      return;
    }

    void refetchAll(categoryId);

    return () => {
      abortRef.current?.abort();
    };
  }, [categoryId, accessToken]);

  const handleExamSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!business?.id) {
      toast.error("Select an organization first.");
      return;
    }

    setIsSubmittingExam(true);

    try {
      const form = e.currentTarget;
      const formData = new FormData(form);

      // Append required field
      formData.append("subsidiaryCategoryId", business.id);

      // validate file exists
      const file = formData.get("file");
      if (!file || !(file instanceof File) || file.size === 0) {
        toast.error("Please upload a valid document.");
        return;
      }

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/exams`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          body: formData,
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to create exam");
      }

      toast.success("Exam recorded successfully.");

      // Refresh data
      await fetchExams(business.id);

      // Reset form
      form.reset();
      setSelectedFile(null);

      setExamModalOpen(false);

    } catch (err: any) {
      toast.error(err?.message || "Failed to record exam.");
    } finally {
      setIsSubmittingExam(false);
    }
  };

  const handleStockSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!business?.id) {
      toast.error("Select an organization first.");
      return;
    }

    setIsSubmittingStock(true);

    try {
      const form = e.currentTarget;
      const formData = new FormData(form);

      // Append required field
      formData.append("subsidiaryCategoryId", business.id);

      // validate file exists
      const file = formData.get("file");
      if (!file || !(file instanceof File) || file.size === 0) {
        toast.error("Please upload a valid document.");
        return;
      }

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/stocks`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          body: formData
        }
      )
      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.message || "Failed to create stock")
      }

      toast.success("Stock recorded successfully.");
      setStockModalOpen(false);
      await fetchStocks(business.id);

      // Reset form
      form.reset();
      setSelectedFile(null);
    } catch (err: any) {
      toast.error(err?.message || "Failed to record stock.");
    } finally {
      setIsSubmittingStock(false);
    }
  };

  const handleLoanSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!business?.id) {
      toast.error("Select an organization first.");
      return;
    }

    setIsSubmittingLoan(true);

    try {
      // const formData = new FormData(e.currentTarget);
      const form = e.currentTarget;
      const formData = new FormData(form);

      // Append required field
      formData.append("subsidiaryCategoryId", business.id);

      // validate file exists
      const file = formData.get("file");
      if (!file || !(file instanceof File) || file.size === 0) {
        toast.error("Please upload a valid document.");
        return;
      }

      const principal = formData.get("principal");
      if (!principal) return;

      // const payload = {
      //   subsidiaryCategoryId: business.id,
      //   ledger_identity: String(formData.get("ledger_identity") ?? ""),
      //   operational_narrative: String(formData.get("operational_narrative") ?? ""),
      //   principal: Number(principal),
      //   term: String(formData.get("term") ?? ""),
      //   category: "Loan",
      //   liability_proof: String(formData.get("liability_proof") ?? ""),
      // };

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/loans`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          credentials: "include",
          body: formData,
        }
      )
      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.message || "Failed to create loan")
      }

      toast.success("Loan recorded successfully.");
      setLiabilityModalOpen(false);
      await fetchLoans(business.id);

      // Reset form
      form.reset();
      setSelectedFile(null);
    } catch (err: any) {
      toast.error(err?.message || "Failed to record loan.");
    } finally {
      setIsSubmittingLoan(false);
    }
  };

  const handleEventSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!business?.id) {
      toast.error("Select an organization first.");
      return;
    }

    setIsSubmittingEvent(true);

    try {
      const formData = new FormData(e.currentTarget);

      const payload = {
        subsidiaryCategoryId: business.id,
        title: formData.get("event_title"),
        description: formData.get("event_desc"),
        event_datetime: formData.get("event_datetime"),
        location_type: formData.get("location_type"),
        address: formData.get("event_address"),
        google_meet_link: formData.get("google_meet_link"),
      };

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/events`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to create event");
      }

      toast.success("Event created");
      await fetchEvents(business.id)
      setEventModalOpen(false);
      // TODO: refetch events
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsSubmittingEvent(false);
    }
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // First day of month (0 = Sunday)
  const firstDayOfMonth = new Date(year, month, 1).getDay();

  // Total days in month
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const calendarDays = [
    ...Array(firstDayOfMonth).fill(null), // empty slots
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const monthName = currentDate.toLocaleString("default", {
    month: "long",
  });

  const eventsByDate = useMemo(() => {
    const map: Record<string, any[]> = {};

    events.length > 0 && events.forEach((event) => {
      const d = new Date(event.event_datetime);

      const dateKey = `${d.getFullYear()}-${String(
        d.getMonth() + 1
      ).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

      if (!map[dateKey]) {
        map[dateKey] = [];
      }

      map[dateKey].push(event);
    });

    return map;
  }, [events]);


  const openCreateEvent = () => {
    setEventMode("create");
    setSelectedEvent(null);
    setEventModalOpen(true);
  };

  const openEditEvent = (event: any) => {
    setEventMode("edit");
    setSelectedEvent(event);
    setEventModalOpen(true);
  };

  const handleView = (event: any) => {
    toast(
      `${event.title}\n${event.description}`,
      { duration: 4000 }
    );
  };

  const openDeleteModal = (event: any) => {
    setDeleteTarget(event);
  };

  const handleDayClick = (dateKey: string) => {
    const date = new Date(dateKey);
    setSelectedDate(date);

    const eventsForDay = eventsByDate[dateKey] || [];
    setSelectedEvents(eventsForDay);

    setEventDetailsOpen(true);
  }
  const handleUpdateEvent = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmittingEvent(true);

    try {
      const formData = new FormData(e.currentTarget as HTMLFormElement);

      const payload = {
        title: formData.get("event_title"),
        description: formData.get("event_desc"),
        event_datetime: formData.get("event_datetime"),
        location_type: formData.get("location_type"),
        address: formData.get("event_address"),
        google_meet_link: formData.get("google_meet_link"),
      };

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/events/${selectedEvent.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await res.json();

      if (!res.ok) throw new Error(data.message);

      toast.success("Event updated");
      setEventModalOpen(false);

      await fetchEvents(business.id);

    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsSubmittingEvent(false);
    }
  };

  // Ensure business is defined safely
  const confirmDelete = async () => {
    setIsDeletingEvent(true);
    if (!deleteTarget) return;

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/events/${deleteTarget.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!res.ok) throw new Error("Failed");

      toast.success("Event deleted");

      setDeleteTarget(null);
      await fetchEvents(business.id);

    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsDeletingEvent(false);
    }
  };

  const business = selectedOrg?.categories?.business ?? null;

  const currentTab = moduleTabs.find(tab => tab.id === activeModuleTab);

  const openModal = (tab: any) => {
    console.log('tabfff:', tab);

    const initialData: any = {};

    tab.input_fields.forEach((field: any) => {
      initialData[field.key] = "";
    });

    setFormData(initialData);
    setIsModalOpen(true);
  };

  const handleChange = (key: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleDynamicSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Hello');


    if (!currentTab) return;

    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);

    const record: any = {};

    formData.forEach((value, key) => {
      const field = currentTab.input_fields.find((f: any) => f.key === key);

      if (!field) return;

      switch (field.type) {
        case "number":
          record[key] = Number(value);
          break;

        case "boolean":
          record[key] = value === "true";
          break;

        default:
          record[key] = value;
      }
    });

    try {
      setIsSubmitting(true);

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/module-tabs/${currentTab.id}/records`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify(record),
        }
      );

      if (!res.ok) throw new Error("Failed to save");

      toast.success("Record added 🚀");

      form.reset();
      await fetchModuleTabs();
      setIsModalOpen(false);

    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const NoData = ({ message }: { message?: string }) => (
    <div style={{ textAlign: "center", padding: "30px" }}>
      <p>{message || "No data available"}</p>
    </div>
  );

  const renderContent = (tab: any) => {
    switch (tab.content_type) {
      case "table":
        return (
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden animate-in slide-in-from-bottom-4 text-left">
            <div className="p-5 sm:p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/20 uppercase font-black tracking-widest text-xs sm:text-sm">
              <h1>{tab.module_name}</h1>

              <button
                onClick={() => openModal(tab)}
                className="bg-red-600 text-white px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wide shadow-md"
                disabled={!business?.id || isOrgLoading}
                type="button"
              >
                {tab.btn_text}
              </button>
            </div>


            {/* Table */}
            <div className="hidden md:block overflow-x-auto">
              {tab.records.length === 0 ? (
                <NoData message="No records yet. Click the button above to add one." />
              ) : (
                <table className="w-full text-slate-800 text-left">
                  <thead className="bg-slate-50/50 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    <tr>
                      {tab.input_fields.map((field: any) => (
                        <th key={field.key} className="px-6 lg:px-8 py-5 text-left">
                          {field.key}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {tab.records.map((record: any, index: number) => (
                      <tr
                        key={index}
                        className="border-t border-slate-100 hover:bg-slate-50 transition"
                      >
                        {tab.input_fields.map((field: any) => (
                          <td key={field.key} className="px-6 lg:px-8 py-4 text-sm font-medium">
                            {renderCellValue(record[field.key], field)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        );

      case "card":
        return (
          <div className="animate-in fade-in duration-500 text-left">
            <div className="flex justify-between items-center mb-8 text-slate-900">
              <h3 className="text-xl font-bold uppercase tracking-tight">
                Asset Repository
              </h3>
              {hasPermission("STOCK_CREATE") && (
                <button
                  onClick={() => openModal(tab)}
                  className="bg-red-600 text-white px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wide shadow-md"
                  disabled={!business?.id || isOrgLoading}
                  type="button"
                >
                  {tab.btn_text}
                </button>
              )}
            </div>

            {isOrgLoading ? (
              <LoadingState title="Loading stocks..." />
            ) : stocks.length === 0 ? (
              <EmptyState title="No stocks recorded yet." />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                {tab.records.length === 0 ? (
                  <NoData message="No records yet. Click the button above to add one." />
                ) : (
                  <>
                    {stocks.map((stock) => (
                      <div
                        key={stock.id}
                        className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm group hover:border-red-500 transition-all"
                      >
                        <div className="flex justify-between items-start">
                          <span className="text-[10px] font-bold text-red-600 uppercase tracking-widest bg-red-50 px-2.5 py-1.5 rounded-lg">
                            {stock.category}
                          </span>

                          <div className="flex flex-col items-end gap-1 text-slate-500">
                            <button title="View Proof" className="text-emerald-500 hover:scale-110 transition-transform" type="button">
                              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                                <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
                                <path d="M14 2v4a2 2 0 0 0 2 2h4" />
                                <path d="m9 15 2 2 4-4" />
                              </svg>
                            </button>
                            <span className="text-[8px] font-black text-red-600 uppercase tracking-tighter">
                              Auth: Ifeanyi
                            </span>
                          </div>
                        </div>

                        <h4 className="text-base font-bold mt-4 uppercase text-slate-900 truncate">
                          {stock.asset_identity}
                        </h4>

                        <p className="text-[11px] text-slate-500 mt-2 font-medium line-clamp-2 leading-relaxed">
                          {stock.operational_narrative}
                        </p>

                        <div className="mt-8 pt-6 border-t border-slate-50 flex items-end justify-between">
                          <div>
                            <p className="text-2xl font-bold">{stock.count}</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                              Unit(s)
                            </p>
                          </div>

                          <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase mb-0.5 tracking-widest">
                              Strategic Value
                            </p>
                            <p className="text-base font-bold text-red-600">
                              ₦{Number(stock.purchase_value).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </>

                )}
              </div>
            )}
          </div>
        );

      default:
        return <div>Unknown content type</div>;
    }
  };

  const renderInputField = (field: any) => {
    switch (field.type) {
      case "string":
        return (
          <input
            type="text"
            placeholder={field.key}
            name={field.key}
            value={formData[field.key] || ""}
            onChange={(e) => handleChange(field.key, e.target.value)}
            className="bg-slate-50 border border-slate-100 rounded-xl py-4 px-5 text-sm font-medium focus:ring-2 focus:ring-red-100 outline-none transition-all placeholder:text-slate-300"
          />
        );

      case "number":
        return (
          <input
            type="number"
            name={field.key}
            placeholder={field.key}
            value={formData[field.key] || ""}
            onChange={(e) => handleChange(field.key, e.target.value)}
            className="bg-slate-50 border border-slate-100 rounded-xl py-4 px-5 text-sm font-medium focus:ring-2 focus:ring-red-100 outline-none transition-all placeholder:text-slate-300"
          />
        );

      case "select":
        return (
          <select
            name={field.key}
            value={formData[field.key] || ""}
            onChange={(e) => handleChange(field.key, e.target.value)}
            className="bg-slate-50 border border-slate-100 rounded-xl py-4 px-5 text-sm font-medium focus:ring-2 focus:ring-red-100 outline-none transition-all placeholder:text-slate-300"
          >
            <option value="">Select {field.key}</option>
            {field.options.map((opt: string) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        );

      default:
        return null;
    }
  };

  const renderCellValue = (value: any, field: any) => {
    if (value === undefined || value === null || value === "") {
      return <span className="text-slate-300">—</span>;
    }

    switch (field.type) {
      case "boolean":
        return value ? "Yes" : "No";

      case "number":
        return Number(value).toLocaleString();

      case "select":
        return (
          <span className="px-2 py-1 rounded-lg bg-slate-100 text-xs font-semibold">
            {value}
          </span>
        );

      default:
        return value;
    }
  };

  switch (activeTab) {
    case "overview":
      return (
        <div className="animate-in fade-in duration-500 text-left">
          <div className="mb-8 sm:mb-10 text-slate-900">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-1 truncate uppercase">
              {selectedOrg?.name}
            </h2>

            <p className="text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              Executive Strategic View • Level 1 Access
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6 mb-8">
            <div className="rounded-3xl p-5 sm:p-6 border transition-all hover:scale-[1.02] bg-white border-slate-100 shadow-sm">
              <div className="flex justify-between items-start mb-6">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center bg-red-600 text-white shadow-lg shadow-red-200">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M18 21a8 8 0 0 0-16 0" />
                    <circle cx="10" cy="8" r="5" />
                    <path d="M22 20c0-3.37-2-6.5-4-8a5 5 0 0 0-.45-8.3" />
                  </svg>
                </div>
                <span className="text-[10px] font-bold uppercase px-2.5 py-1 rounded-lg bg-slate-50 text-slate-400 tracking-wide">
                  Capacity
                </span>
              </div>

              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                Seat Throughput
              </p>
              <p className="text-2xl font-bold text-slate-900 tracking-tight">{overview?.seat_throughput ?? 0}</p>
            </div>

            <div className="rounded-3xl p-5 sm:p-6 border transition-all hover:scale-[1.02] bg-white border-slate-100 shadow-sm">
              <div className="flex justify-between items-start mb-6">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center bg-slate-100 text-slate-500">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <path d="m16 12-4-4-4 4" />
                    <path d="M12 16V8" />
                  </svg>
                </div>
                <span className="text-[10px] font-bold uppercase px-2.5 py-1 rounded-lg bg-slate-50 text-slate-400 tracking-wide">
                  Revenue
                </span>
              </div>

              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                Project Inflow
              </p>
              <p className="text-2xl font-bold text-slate-900 tracking-tight">₦{overview?.project_inflow ?? 0}</p>
            </div>

            <div className="rounded-3xl p-5 sm:p-6 border transition-all hover:scale-[1.02] bg-white border-slate-100 shadow-sm">
              <div className="flex justify-between items-start mb-6">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center bg-slate-100 text-slate-500">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73z" />
                    <path d="M12 22V12" />
                    <polyline points="3.29 7 12 12 20.71 7" />
                    <path d="m7.5 4.27 9 5.15" />
                  </svg>
                </div>
                <span className="text-[10px] font-bold uppercase px-2.5 py-1 rounded-lg bg-slate-50 text-slate-400 tracking-wide">
                  Assets
                </span>
              </div>

              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                Inventory Value
              </p>
              <p className="text-2xl font-bold text-slate-900 tracking-tight">₦{overview?.inventory ?? 0}</p>
            </div>

            <div className="rounded-3xl p-5 sm:p-6 border transition-all hover:scale-[1.02] bg-white border-slate-100 shadow-sm">
              <div className="flex justify-between items-start mb-6">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center bg-slate-100 text-slate-500">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="19" x2="5" y1="5" y2="19" />
                    <circle cx="6.5" cy="6.5" r="2.5" />
                    <circle cx="17.5" cy="17.5" r="2.5" />
                  </svg>
                </div>
                <span className="text-[10px] font-bold uppercase px-2.5 py-1 rounded-lg bg-slate-50 text-slate-400 tracking-wide">
                  Liability
                </span>
              </div>

              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                Monthly Debt
              </p>
              <p className="text-2xl font-bold text-slate-900 tracking-tight">₦{overview?.monthly_dept ?? 0}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 sm:gap-8">
            <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-xl">
              <div className="relative z-10">
                <h3 className="text-lg font-bold mb-1 uppercase tracking-tight">Net Capital Status</h3>
                <p className="text-[10px] sm:text-xs text-slate-400 font-medium uppercase tracking-widest">
                  Strategic Balance projection
                </p>

                <div className="mt-8 sm:mt-10">
                  <span className="text-3xl sm:text-4xl font-bold tracking-tight text-emerald-400">
                    ₦{overview?.net_capital ?? 0}
                  </span>

                  <div className="w-full bg-white/10 h-1.5 rounded-full mt-6 overflow-hidden">
                    <div className="bg-emerald-400 h-full transition-all duration-1000" style={{ width: "80%" }} />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm flex flex-col gap-6 text-left">
              <h3 className="text-sm font-bold uppercase tracking-widest flex items-center gap-2 text-slate-800">
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
                  className="text-red-600"
                >
                  <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
                  <path d="M14 2v4a2 2 0 0 0 2 2h4" />
                  <path d="m9 15 2 2 4-4" />
                </svg>
                Compliance Audit Status
              </h3>

              <div className="grid grid-cols-1 gap-4">
                {[
                  { title: "Strategic Ledger", sub: "3 Strategic Records", count: overview?.compliance_audit ?? 0 },
                  { title: "Asset Documentation", sub: "3 Strategic Records", count: overview?.compliance_audit ?? 0 },
                  { title: "Liability Agreements", sub: "2 Strategic Records", count: overview?.compliance_audit ?? 0 },
                ].map((x) => (
                  <div
                    key={x.title}
                    className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100/50"
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-bold uppercase text-slate-700 leading-none mb-1 truncate">
                        {x.title}
                      </p>
                      <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest truncate">
                        {x.sub}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-xl font-bold text-red-600 leading-none">{x.count}</span>

                      <div className="w-9 h-9 bg-white rounded-xl border border-slate-100 flex items-center justify-center text-emerald-500 shadow-sm">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width={18}
                          height={18}
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={2}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
                          <path d="M14 2v4a2 2 0 0 0 2 2h4" />
                          <path d="m9 15 2 2 4-4" />
                        </svg>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      );

    case "history":
      return (
        <div className="animate-in fade-in duration-500">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">History Content</h2>

          <div className="flex flex-col xl:flex-row gap-6 sm:gap-8">
            <div className="w-full bg-slate-900 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden min-h-[420px] shadow-xl">
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6 sm:mb-8">
                  <h3 className="text-xl sm:text-2xl font-bold uppercase tracking-tight">
                    Audit History Footprints
                  </h3>
                </div>

                <div className="space-y-6">
                  {/* {history.map((item, index) => (
                    <div key={`item-${index}`} className="border-l border-white/10 pl-5 sm:pl-6 pb-6 relative">
                      <div className="absolute -left-1 top-0 w-2 h-2 bg-red-600 rounded-full shadow-[0_0_8px_rgba(220,38,38,0.5)]" />
                      <p className="text-[10px] font-bold uppercase text-slate-500 tracking-wider mb-3 sm:mb-4">
                        {item.date}
                      </p>

                      <div className="rounded-xl p-3.5 border transition-all bg-white/5 border-white/5 hover:bg-white/10">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-red-500">
                            ●
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold truncate uppercase">{item.title}</p>
                            <p className="text-[9px] font-medium text-white/40 truncate uppercase">{item.desc}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))} */}
                </div>
              </div>
            </div>
          </div>
        </div>
      );

    case "events":
      return (
        <div className="animate-in fade-in duration-500">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">Events</h2>

          {hasPermission("STOCK_CREATE") && (
            <button
              onClick={() => setFinanceModalOpen(true)}
              className="bg-red-600 text-white px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wide shadow-md"
              disabled={!business?.id || isOrgLoading}
              type="button"
            >
              {isSubmittingEvent ? "Loading..." : ""}
            </button>
          )}

          <div className="flex flex-col xl:flex-row gap-6 sm:gap-8">
            <div className="w-full xl:w-96 shrink-0 bg-white rounded-3xl p-5 sm:p-6 border border-slate-100 shadow-sm">
              <div className="flex items-center justify-between mb-6 sm:mb-8">
                <h3 className="text-base font-bold text-slate-900 uppercase tracking-tight">
                  {monthName} {year}
                </h3>
                <div className="flex gap-1.5">
                  <button onClick={() =>
                    setCurrentDate(new Date(year, month - 1, 1))
                  } className="p-1.5 text-slate-400 hover:text-red-600 transition-all" type="button">
                    ←
                  </button>
                  <button onClick={() =>
                    setCurrentDate(new Date(year, month + 1, 1))
                  } className="p-1.5 text-slate-400 hover:text-red-600 transition-all" type="button">
                    →
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-7 gap-1 text-center mb-4">
                {["S", "M", "T", "W", "T", "F", "S"].map((day, index) => (
                  <div key={`day-${index}`} className="text-[10px] font-bold text-slate-300 py-2">
                    {day}
                  </div>
                ))}

                {calendarDays.map((day, index) => {
                  if (!day) {
                    return <div key={index} />; // empty cell
                  }

                  const dateKey = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                  const hasEvent = !!eventsByDate[dateKey];

                  const today = new Date();

                  const isToday =
                    day === today.getDate() &&
                    month === today.getMonth() &&
                    year === today.getFullYear();

                  const baseClass =
                    "cursor-pointer aspect-square rounded-xl flex flex-col items-center justify-center text-xs font-bold border transition-all";

                  const eventClass = hasEvent
                    ? "bg-red-50 border-red-100 text-red-600"
                    : "bg-white border-transparent text-slate-700 hover:bg-slate-50";

                  const todayClass = isToday ? "ring-2 ring-red-500" : "";

                  return (
                    <div
                      key={day + `_${index}`}
                      onClick={() => handleDayClick(dateKey)}
                      className={`${baseClass} ${eventClass} ${todayClass}`}
                    >
                      {day}
                      {hasEvent && (
                        <div className="w-1 h-1 rounded-full mt-0.5 bg-red-600" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex-1 bg-slate-900 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden min-h-[420px] shadow-xl">
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-6 sm:mb-8">
                  <h3 className="text-xl sm:text-2xl font-bold uppercase tracking-tight">
                    Events
                  </h3>

                  <button onClick={openCreateEvent} className="px-4 py-2 text-xs font-bold bg-red-600 rounded-lg hover:bg-red-700 transition">
                    + Add Event
                  </button>
                </div>

                <div className="space-y-4">
                  {events.length === 0 ? (
                    <NoData message="No records yet. Click the button above to add one." />
                  ) : (
                    <>
                      {events.map((item, index) => (
                        <div
                          key={`event-${index}`}
                          className="rounded-xl p-4 border border-white/10 bg-white/5 hover:bg-white/10 transition-all"
                        >
                          <div className="flex items-start justify-between gap-4">
                            {/* Event Info */}
                            <div className="min-w-0">
                              <p className="text-[10px] font-bold uppercase text-slate-500 tracking-wider mb-2">
                                {new Date(item.event_datetime).toLocaleString()}
                              </p>

                              <p className="text-sm font-bold uppercase truncate">
                                {item.title}
                              </p>

                              <p className="text-[10px] text-white/40 uppercase truncate">
                                {item.description}
                              </p>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-2 shrink-0">
                              {/* <button onClick={() => handleView(item)} className="px-2 py-1 text-[10px] font-bold bg-white/10 rounded hover:bg-white/20 transition">
                                View
                              </button> */}
                              <button onClick={() => openEditEvent(item)} className="px-2 py-1 text-[10px] font-bold bg-blue-600 rounded hover:bg-blue-700 transition">
                                Edit
                              </button>
                              <button onClick={() => openDeleteModal(item)} className="px-2 py-1 text-[10px] font-bold bg-red-600 rounded hover:bg-red-700 transition">
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {eventModalOpen && (
            <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-[100] flex items-center justify-center p-4 overflow-y-auto text-left">
              <div className="bg-white w-full max-w-xl rounded-3xl shadow-3xl overflow-hidden animate-in zoom-in-95 duration-300 border border-slate-100 text-left">
                <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/30 text-left">
                  <h2 className="text-lg font-bold uppercase tracking-tight text-slate-900 text-left">
                    {eventMode === "edit" ? "Edit Event" : "Create Event"}
                  </h2>

                  <button
                    onClick={() => setEventModalOpen(false)}
                    type="button"
                    className="w-8 h-8 rounded-lg bg-white border border-slate-100 flex items-center justify-center text-slate-400 hover:text-red-600 transition-all shadow-sm"
                    disabled={isSubmittingEvent}
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
                  <form onSubmit={eventMode === "edit" ? handleUpdateEvent : handleEventSubmit} className="space-y-4 text-left text-slate-800 font-bold">
                    <div className="flex flex-col gap-2 w-full font-semibold text-left">
                      <label className="text-xs text-slate-500 ml-1 uppercase tracking-wider">
                        Event Title
                      </label>
                      <input
                        className="bg-slate-50 border border-slate-100 rounded-xl py-4 px-5 text-sm font-medium focus:ring-2 focus:ring-red-100 outline-none transition-all placeholder:text-slate-300"
                        name="event_title"
                        defaultValue={selectedEvent?.title || ""}
                        placeholder="Staff briefing"
                        required
                        disabled={isSubmittingEvent}
                      />
                    </div>

                    <div className="flex flex-col gap-2 w-full font-semibold text-left">
                      <label className="text-xs text-slate-500 ml-1 uppercase tracking-wider">
                        Event Description
                      </label>
                      <input
                        className="bg-slate-50 border border-slate-100 rounded-xl py-4 px-5 text-sm font-medium focus:ring-2 focus:ring-red-100 outline-none transition-all placeholder:text-slate-300"
                        name="event_desc"
                        defaultValue={
                          selectedEvent?.event_datetime
                            ? new Date(selectedEvent.event_datetime).toISOString().slice(0, 16)
                            : ""
                        }
                        placeholder="Event decription"
                        required
                        disabled={isSubmittingEvent}
                      />
                    </div>

                    <div className="flex flex-col gap-2 w-full font-semibold text-left">
                      <label className="text-xs text-slate-500 ml-1 uppercase tracking-wider">
                        Date & Time
                      </label>
                      <input
                        className="bg-slate-50 border border-slate-100 rounded-xl py-4 px-5 text-sm font-medium focus:ring-2 focus:ring-red-100 outline-none transition-all placeholder:text-slate-300"
                        name="event_datetime"
                        defaultValue={selectedEvent?.event_datetime ? new Date(selectedEvent.event_datetime).toISOString().slice(0, 16) : ""}
                        placeholder="Select date and time"
                        type="datetime-local"
                        required
                        disabled={isSubmittingEvent}
                      />
                    </div>

                    <div className="flex flex-col gap-2 w-full font-semibold text-left">
                      <label className="text-xs text-slate-500 ml-1 uppercase tracking-wider">
                        Location Type
                      </label>
                      <select
                        className="bg-slate-50 border border-slate-100 rounded-xl py-4 px-5 text-sm font-medium focus:ring-2 focus:ring-red-100 outline-none transition-all placeholder:text-slate-300"
                        name="location_type"
                        defaultValue={selectedEvent?.location_type || ""}
                        required
                        onChange={(e) => setLocationType(e.target.value)}
                        disabled={isSubmittingEvent}
                      >
                        <option>Location Type</option>
                        <option value="remote">Remote</option>
                        <option value="physical">Physical</option>
                      </select>
                    </div>

                    {locationType === "physical" ? (
                      <div className="flex flex-col gap-2 w-full font-semibold text-left">
                        <label className="text-xs text-slate-500 ml-1 uppercase tracking-wider">
                          Address
                        </label>
                        <input
                          className="bg-slate-50 border border-slate-100 rounded-xl py-4 px-5 text-sm font-medium focus:ring-2 focus:ring-red-100 outline-none transition-all placeholder:text-slate-300"
                          name="event_address"
                          defaultValue={selectedEvent?.address || ""}
                          placeholder="Enter event address"
                          required
                          disabled={isSubmittingEvent}
                        />
                      </div>
                    ) : (
                      <div className="flex flex-col gap-2 w-full font-semibold text-left">
                        <label className="text-xs text-slate-500 ml-1 uppercase tracking-wider">
                          Google Meet Link
                        </label>
                        <input
                          className="bg-slate-50 border border-slate-100 rounded-xl py-4 px-5 text-sm font-medium focus:ring-2 focus:ring-red-100 outline-none transition-all placeholder:text-slate-300"
                          name="google_meet_link"
                          defaultValue={selectedEvent?.google_meet_link || ""}
                          placeholder="https://meet.google.com/abc-defg-hij"
                          required
                        />
                      </div>
                    )}

                    <button
                      type="submit"
                      className="w-full bg-red-600 text-white py-5 rounded-xl font-bold uppercase tracking-widest text-lg mt-4 text-center"
                      disabled={isSubmittingLoan}
                    >
                      {isSubmittingEvent
                        ? "Saving..."
                        : eventMode === "edit"
                          ? "Update Event"
                          : "Create Event"}
                    </button>
                  </form>
                </div>
              </div>
            </div>
          )}

          {deleteTarget && (
            <div className="fixed inset-0 bg-black/40 z-[200] flex items-center justify-center">
              <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl text-center">

                <h3 className="text-lg font-bold mb-2">
                  Delete Event?
                </h3>

                <p className="text-sm text-slate-500 mb-6">
                  This action cannot be undone.
                </p>

                <div className="flex gap-3">
                  <button
                    onClick={() => setDeleteTarget(null)}
                    className="flex-1 py-2 rounded-lg border"
                  >
                    Cancel
                  </button>

                  <button
                    onClick={confirmDelete}
                    className="flex-1 py-2 rounded-lg bg-red-600 text-white"
                  >
                    {isDeletingEvent ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {eventDetailsOpen && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-md z-[200] flex items-center justify-center p-4">

              <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-300">

                {/* HEADER */}
                <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 uppercase tracking-tight">
                      Events
                    </h3>
                    <p className="text-xs text-slate-500 font-semibold uppercase tracking-widest mt-1">
                      {selectedDate?.toDateString()}
                    </p>
                  </div>

                  <button
                    onClick={() => setEventDetailsOpen(false)}
                    className="w-9 h-9 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 hover:text-red-600 hover:scale-105 transition"
                  >
                    ✕
                  </button>
                </div>

                {/* BODY */}
                <div className="p-6 space-y-4 max-h-[420px] overflow-y-auto">

                  {selectedEvents.length === 0 ? (
                    <div className="text-center py-10">
                      <p className="text-sm text-slate-400 font-semibold">
                        No events scheduled
                      </p>
                    </div>
                  ) : (
                    selectedEvents.map((event, index) => {
                      const dateObj = new Date(event.event_datetime);

                      return (
                        <div
                          key={index}
                          className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm hover:shadow-md transition-all"
                        >
                          {/* TITLE */}
                          <div className="flex justify-between items-start gap-3">
                            <div>
                              <p className="text-sm font-bold text-slate-900 uppercase">
                                {event.title}
                              </p>
                              <p className="text-xs text-slate-500 mt-1">
                                {event.description}
                              </p>
                            </div>

                            <span className="text-[10px] font-bold bg-red-50 text-red-600 px-2 py-1 rounded-lg uppercase">
                              {event.location_type}
                            </span>
                          </div>

                          {/* META */}
                          <div className="mt-4 flex flex-col gap-2 text-xs text-slate-600">

                            <div className="flex items-center gap-2">
                              <span>📅</span>
                              <span>{dateObj.toDateString()}</span>
                            </div>

                            <div className="flex items-center gap-2">
                              <span>⏰</span>
                              <span>{dateObj.toLocaleTimeString()}</span>
                            </div>

                            <div className="flex items-start gap-2">
                              <span>📍</span>

                              {event.location_type === "physical" ? (
                                <span>{event.address}</span>
                              ) : (
                                <a
                                  href={event.google_meet_link}
                                  target="_blank"
                                  className="text-blue-600 underline hover:text-blue-700"
                                >
                                  Join Google Meet
                                </a>
                              )}
                            </div>

                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      );

    case "exams":
      return (
        <div className="animate-in fade-in duration-500">
          <div className="flex justify-between items-center mb-8 text-left">
            <h3 className="text-xl font-bold uppercase tracking-tight text-slate-900">
              Seat Utilization Log
            </h3>
            {hasPermission("EXAM_CREATE") && (
              <button
                onClick={() => setExamModalOpen(true)}
                className="bg-red-600 text-white px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wide shadow-md"
                disabled={!business?.id || isOrgLoading}
                type="button"
              >
                {isOrgLoading ? "Loading..." : "Record Daily Entry"}
              </button>
            )}
          </div>

          {isOrgLoading ? (
            <LoadingState title="Loading exams..." />
          ) : exams.length === 0 ? (
            <EmptyState title="No exam records yet." />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 text-left">
              {exams.map((exam: any) => (
                <div
                  key={exam.id ?? `${exam.session_name}-${exam.created_at}`}
                  className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm relative overflow-hidden group hover:border-red-500 transition-all"
                >
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-bold text-red-600 uppercase tracking-widest bg-red-50 px-2.5 py-1.5 rounded-lg">
                      {exam.category}
                    </span>

                    <div className="flex flex-col items-end gap-1 text-slate-500">
                      <button
                        title="View Proof"
                        className="text-emerald-500 hover:scale-110 transition-transform"
                        type="button"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                          <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
                          <path d="M14 2v4a2 2 0 0 0 2 2h4" />
                          <path d="m9 15 2 2 4-4" />
                        </svg>
                      </button>
                      <span className="text-[8px] font-black text-red-600 uppercase tracking-tighter">
                        Auth: Tunde
                      </span>
                    </div>
                  </div>

                  <h4 className="text-base font-bold mt-4 uppercase text-slate-900">
                    {exam.session_name}
                  </h4>

                  <div className="mt-10 flex items-end justify-between">
                    <div>
                      <p className="text-3xl font-bold">{exam.total_candidates}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        Candidates
                      </p>
                    </div>

                    <div className="text-slate-300 font-bold text-[9px] flex flex-col items-end gap-1 uppercase">
                      <span className="flex items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10" />
                          <polyline points="12 6 12 12 16 14" />
                        </svg>
                        {exam.created_at &&
                          `• Recorded ${Math.floor(
                            (Date.now() - new Date(exam.created_at).getTime()) /
                            (1000 * 60 * 60)
                          )} hours ago`}
                      </span>

                      <button className="text-red-600 hover:underline flex items-center gap-1" type="button">
                        <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                          <path d="M12 15V3" />
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                          <path d="m7 10 5 5 5-5" />
                        </svg>
                        Open Proof
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {examModalOpen && (
            <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-[100] flex items-center justify-center p-4 overflow-y-auto text-left">
              <div className="bg-white w-full max-w-xl rounded-3xl shadow-3xl overflow-hidden animate-in zoom-in-95 duration-300 border border-slate-100 text-left">
                <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/30 text-left">
                  <h2 className="text-lg font-bold uppercase tracking-tight text-slate-900 text-left">
                    exam session
                  </h2>

                  <button
                    onClick={() => setExamModalOpen(false)}
                    type="button"
                    className="w-8 h-8 rounded-lg bg-white border border-slate-100 flex items-center justify-center text-slate-400 hover:text-red-600 transition-all shadow-sm"
                    disabled={isSubmittingExam}
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
                  <form className="space-y-4 text-left text-slate-800" onSubmit={handleExamSubmit}>
                    <div className="flex flex-col gap-2 text-left">
                      <label className="text-xs font-bold text-slate-500 ml-1 uppercase tracking-wider">
                        Exam Category
                      </label>

                      <select
                        name="category"
                        className="bg-slate-50 border border-slate-100 rounded-xl py-4 px-5 text-sm font-bold outline-none text-left"
                        disabled={isSubmittingExam}
                      >
                        <option>JAMB</option>
                        <option>ABU DLI</option>
                        <option>NECO</option>
                        <option>WAEC</option>
                      </select>
                    </div>

                    <div className="flex flex-col gap-2 w-full font-semibold text-left">
                      <label className="text-xs text-slate-500 ml-1 uppercase tracking-wider">
                        Batch / Session Name
                      </label>
                      <input
                        className="bg-slate-50 border border-slate-100 rounded-xl py-4 px-5 text-sm font-medium focus:ring-2 focus:ring-red-100 outline-none transition-all placeholder:text-slate-300"
                        name="session_name"
                        placeholder="e.g. Morning Batch A"
                        required
                        disabled={isSubmittingExam}
                      />
                    </div>

                    <div className="flex flex-col gap-2 w-full font-semibold text-left">
                      <label className="text-xs text-slate-500 ml-1 uppercase tracking-wider">
                        Total Candidates Count
                      </label>
                      <input
                        className="bg-slate-50 border border-slate-100 rounded-xl py-4 px-5 text-sm font-medium focus:ring-2 focus:ring-red-100 outline-none transition-all placeholder:text-slate-300"
                        name="total_candidates"
                        type="number"
                        required
                        disabled={isSubmittingExam}
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-bold text-slate-500 ml-1 uppercase tracking-wider">
                        Document Proof (Log/Register)
                      </label>
                      {/* <label htmlFor=""></label> */}
                      {/* <label htmlFor="proof_document" className="border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all bg-slate-50 border-slate-200 text-slate-400 hover:bg-slate-100">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width={24}
                          height={24}
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={2}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >
                          <path d="M12 3v12" />
                          <path d="m17 8-5-5-5 5" />
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        </svg>

                        <span className="text-[10px] font-bold uppercase">
                          Upload Strategic Proof
                        </span>
                      </label> */}
                      <label
                        htmlFor="proof_document"
                        className="border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all bg-slate-50 border-slate-200 text-slate-400 hover:bg-slate-100"
                      >
                        {selectedFile ? (
                          <>
                            <span className="text-xs font-bold text-emerald-600 uppercase">
                              {selectedFile.name}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              Click to change file
                            </span>
                          </>
                        ) : (
                          <>
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width={24}
                              height={24}
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth={2}
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              aria-hidden="true"
                            >
                              <path d="M12 3v12" />
                              <path d="m17 8-5-5-5 5" />
                              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                            </svg>
                            <span className="text-[10px] font-bold uppercase">
                              Upload Strategic Proof
                            </span>
                          </>
                        )}
                      </label>
                      <input
                        type="file"
                        id="proof_document"
                        name="file"
                        accept="image/*,application/pdf"
                        className="hidden"
                        required
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setSelectedFile(file);
                          }
                        }}
                      />
                    </div>
                    {/* <input type="text" name="documentProof" defaultValue="https://example.com/temp.pdf" hidden /> */}

                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2 italic text-center">
                      Strategic Entry Point Available for Final Processing
                    </p>

                    <button
                      type="submit"
                      className="w-full bg-red-600 text-white py-4 rounded-xl font-bold uppercase tracking-widest text-sm mt-4"
                      disabled={isSubmittingExam}
                    >
                      {isSubmittingExam ? "Saving..." : "Record Daily Inventory"}
                    </button>
                  </form>
                </div>
              </div>
            </div>
          )}
        </div>
      );

    case "inventory":
      return (
        <div className="animate-in fade-in duration-500 text-left">
          <div className="flex justify-between items-center mb-8 text-slate-900">
            <h3 className="text-xl font-bold uppercase tracking-tight">
              Asset Repository
            </h3>
            {hasPermission("STOCK_CREATE") && (
              <button
                onClick={() => setStockModalOpen(true)}
                className="bg-red-600 text-white px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wide shadow-md"
                disabled={!business?.id || isOrgLoading}
                type="button"
              >
                {isOrgLoading ? "Loading..." : "Listing New Stock"}
              </button>
            )}
          </div>

          {isOrgLoading ? (
            <LoadingState title="Loading stocks..." />
          ) : stocks.length === 0 ? (
            <EmptyState title="No stocks recorded yet." />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              {stocks.map((stock) => (
                <div
                  key={stock.id}
                  className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm group hover:border-red-500 transition-all"
                >
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-bold text-red-600 uppercase tracking-widest bg-red-50 px-2.5 py-1.5 rounded-lg">
                      {stock.category}
                    </span>

                    <div className="flex flex-col items-end gap-1 text-slate-500">
                      <button title="View Proof" className="text-emerald-500 hover:scale-110 transition-transform" type="button">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                          <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
                          <path d="M14 2v4a2 2 0 0 0 2 2h4" />
                          <path d="m9 15 2 2 4-4" />
                        </svg>
                      </button>
                      <span className="text-[8px] font-black text-red-600 uppercase tracking-tighter">
                        Auth: Ifeanyi
                      </span>
                    </div>
                  </div>

                  <h4 className="text-base font-bold mt-4 uppercase text-slate-900 truncate">
                    {stock.asset_identity}
                  </h4>

                  <p className="text-[11px] text-slate-500 mt-2 font-medium line-clamp-2 leading-relaxed">
                    {stock.operational_narrative}
                  </p>

                  <div className="mt-8 pt-6 border-t border-slate-50 flex items-end justify-between">
                    <div>
                      <p className="text-2xl font-bold">{stock.count}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        Unit(s)
                      </p>
                    </div>

                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase mb-0.5 tracking-widest">
                        Strategic Value
                      </p>
                      <p className="text-base font-bold text-red-600">
                        ₦{Number(stock.purchase_value).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {stockModalOpen && (
            <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-[100] flex items-center justify-center p-4 overflow-y-auto text-left">
              <div className="bg-white w-full max-w-xl rounded-3xl shadow-3xl overflow-hidden animate-in zoom-in-95 duration-300 border border-slate-100 text-left">
                <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/30 text-left">
                  <h2 className="text-lg font-bold uppercase tracking-tight text-slate-900 text-left">
                    New Stock
                  </h2>
                  <button
                    onClick={() => setStockModalOpen(false)}
                    className="w-8 h-8 rounded-lg bg-white border border-slate-100 flex items-center justify-center text-slate-400 hover:text-red-600 transition-all shadow-sm"
                    type="button"
                    disabled={isSubmittingStock}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M18 6 6 18"></path>
                      <path d="m6 6 12 12"></path>
                    </svg>
                  </button>
                </div>

                <div className="p-8 space-y-6 text-left">
                  <form className="space-y-4 text-left text-slate-800 font-bold" onSubmit={handleStockSubmit}>
                    <div className="flex flex-col gap-2 w-full text-left font-semibold">
                      <label htmlFor="name" className="text-xs text-slate-500 ml-1 uppercase tracking-wider text-left">
                        Asset Identity
                      </label>
                      <input
                        id="name"
                        name="asset_identity"
                        placeholder="e.g. Office PC"
                        required
                        disabled={isSubmittingStock}
                        className="bg-slate-50 border border-slate-100 rounded-xl py-4 px-5 text-sm font-medium focus:ring-2 focus:ring-red-100 outline-none transition-all placeholder:text-slate-300 text-left"
                      />
                    </div>

                    <div className="flex flex-col gap-2 w-full text-left font-semibold">
                      <label htmlFor="narrative" className="text-xs text-slate-500 ml-1 uppercase tracking-wider text-left">
                        Operational Narrative
                      </label>
                      <input
                        id="narrative"
                        name="operational_narrative"
                        placeholder="Operational use..."
                        required
                        disabled={isSubmittingStock}
                        className="bg-slate-50 border border-slate-100 rounded-xl py-4 px-5 text-sm font-medium focus:ring-2 focus:ring-red-100 outline-none transition-all placeholder:text-slate-300 text-left"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-left">
                      <div className="flex flex-col gap-2 w-full text-left font-semibold">
                        <label htmlFor="quantity" className="text-xs text-slate-500 ml-1 uppercase tracking-wider text-left">
                          Count
                        </label>
                        <input
                          id="quantity"
                          name="count"
                          type="number"
                          required
                          disabled={isSubmittingStock}
                          className="bg-slate-50 border border-slate-100 rounded-xl py-4 px-5 text-sm font-medium focus:ring-2 focus:ring-red-100 outline-none transition-all placeholder:text-slate-300 text-left"
                        />
                      </div>
                      <div className="flex flex-col gap-2 w-full text-left font-semibold">
                        <label htmlFor="unit" className="text-xs text-slate-500 ml-1 uppercase tracking-wider text-left">
                          Unit
                        </label>
                        <input
                          id="unit"
                          name="unit"
                          placeholder="e.g. Units"
                          required
                          disabled={isSubmittingStock}
                          className="bg-slate-50 border border-slate-100 rounded-xl py-4 px-5 text-sm font-medium focus:ring-2 focus:ring-red-100 outline-none transition-all placeholder:text-slate-300 text-left"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 w-full text-left font-semibold">
                      <label htmlFor="totalAmount" className="text-xs text-slate-500 ml-1 uppercase tracking-wider text-left">
                        Purchase Value (₦)
                      </label>
                      <input
                        id="totalAmount"
                        name="purchase_value"
                        type="number"
                        required
                        disabled={isSubmittingStock}
                        className="bg-slate-50 border border-slate-100 rounded-xl py-4 px-5 text-sm font-medium focus:ring-2 focus:ring-red-100 outline-none transition-all placeholder:text-slate-300 text-left"
                      />
                    </div>

                    <div className="flex flex-col gap-2 text-left text-slate-500 font-bold">
                      <label htmlFor="category" className="text-xs font-semibold text-slate-500 ml-1 uppercase tracking-wider text-left">
                        Category
                      </label>
                      <select
                        id="category"
                        name="category"
                        disabled={isSubmittingStock}
                        className="bg-slate-50 border border-slate-100 rounded-xl py-4 px-5 text-sm font-bold outline-none text-left"
                      >
                        <option>Hardware</option>
                        <option>Stationery</option>
                        <option>Operations</option>
                      </select>
                    </div>

                    <div className="flex flex-col gap-2 text-left">
                      <label className="text-xs font-semibold text-slate-500 ml-1 uppercase tracking-wider font-bold text-left">
                        Asset Proof (Invoice/Receipt)
                      </label>
                      {/* Upload */}
                      <label
                        htmlFor="assest_proof"
                        className="border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all bg-slate-50 border-slate-200 text-slate-400 hover:bg-slate-100"
                      >
                        {selectedFile ? (
                          <>
                            <span className="text-xs font-bold text-emerald-600 uppercase">
                              {selectedFile.name}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              Click to change file
                            </span>
                          </>
                        ) : (
                          <>
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width={24}
                              height={24}
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth={2}
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              aria-hidden="true"
                            >
                              <path d="M12 3v12" />
                              <path d="m17 8-5-5-5 5" />
                              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                            </svg>
                            <span className="text-[10px] font-bold uppercase">
                              Upload Asset Proof
                            </span>
                          </>
                        )}
                      </label>
                      <input
                        type="file"
                        id="assest_proof"
                        name="file"
                        accept="image/*,application/pdf"
                        className="hidden"
                        required
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setSelectedFile(file);
                          }
                        }}
                      />
                    </div>

                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2 italic text-center">
                      Strategic Entry Point Available for Final Processing
                    </p>

                    <button
                      type="submit"
                      className="w-full bg-red-600 text-white py-4 rounded-xl font-bold uppercase tracking-widest text-sm mt-4 text-center"
                      disabled={isSubmittingStock}
                    >
                      {isSubmittingStock ? "Saving..." : "Confirm Listing"}
                    </button>
                  </form>
                </div>
              </div>
            </div>
          )}
        </div>
      );

    case "vault":
      return (
        <div className="animate-in fade-in duration-500 text-left">
          <h3 className="text-xl font-bold uppercase tracking-tight mb-8 text-slate-900">
            Executive Document Vault
          </h3>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6 text-slate-800">
            {[
              { name: "jamb_log_jan26.pdf", lead: "Tunde" },
              { name: "jamb_log_jan26.pdf", lead: "Tunde" },
              { name: "abu_session_d1.pdf", lead: "Ifeanyi" },
              { name: "inv_printer_100k.png", lead: "Ifeanyi" },
              { name: "fan_receipts.pdf", lead: "Tunde" },
              { name: "fuel_receipt.png", lead: "Tunde" },
              { name: "loan_agr.pdf", lead: "Ifeanyi" },
              { name: "bank_stmt_feb.pdf", lead: "Tunde" },
              { name: "fuel_rec_110k.png", lead: "Tunde" },
              { name: "bill_dec_25.pdf", lead: "Ifeanyi" },
            ].map((doc, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:border-red-600 transition-all text-center group"
              >
                <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center text-red-600 mb-4 mx-auto group-hover:scale-110 transition-transform">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M14 2v4a2 2 0 0 0 2 2h4" />
                    <path d="M4.268 21a2 2 0 0 0 1.727 1H18a2 2 0 0 0 2-2V7l-5-5H6a2 2 0 0 0-2 2v3" />
                    <path d="m9 18-1.5-1.5" />
                    <circle cx="5" cy="14" r="3" />
                  </svg>
                </div>

                <p className="text-[10px] font-bold text-slate-900 truncate w-full">
                  {doc.name}
                </p>
                <p className="text-[8px] font-black text-slate-400 uppercase mt-1 truncate w-full">
                  Lead: {doc.lead}
                </p>

                <button className="mt-4 text-[10px] font-bold text-red-600 uppercase flex items-center gap-1 mx-auto hover:underline w-full justify-center" type="button">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="10"
                    height="10"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 15V3" />
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <path d="m7 10 5 5 5-5" />
                  </svg>
                  Open Proof
                </button>
              </div>
            ))}
          </div>
        </div>
      );

    case "ledger":
      return (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden animate-in slide-in-from-bottom-4 text-left">
          <div className="p-5 sm:p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/20 uppercase font-black tracking-widest text-xs sm:text-sm">
            Departmental Strategic Ledger
          </div>

          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-slate-800 text-left">
              <thead className="bg-slate-50/50 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                <tr>
                  <th className="px-6 lg:px-8 py-5 text-left">Timeline</th>
                  <th className="px-6 lg:px-8 py-5 text-left">Strategic Narrative</th>
                  <th className="px-6 lg:px-8 py-5 text-left">Executive Lead</th>
                  <th className="px-6 lg:px-8 py-5 text-right">Value (₦)</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-50">
                {ledgerEntries.map((entry, index) => (
                  <tr key={index} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-6 lg:px-8 py-5 text-[11px] font-medium text-slate-400">
                      {entry.timeline}
                    </td>

                    <td className="px-6 lg:px-8 py-5 font-semibold text-slate-900 uppercase text-xs">
                      {entry.narrative}
                    </td>

                    <td className="px-6 lg:px-8 py-5 text-xs font-bold text-red-600 uppercase">
                      {entry.lead}
                    </td>

                    <td
                      className={`px-6 lg:px-8 py-5 text-right font-bold ${entry.isPositive ? "text-emerald-500" : "text-red-600"
                        }`}
                    >
                      {entry.value}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="md:hidden p-4 space-y-4">
            {ledgerEntries.map((entry, index) => (
              <div key={index} className="rounded-2xl border border-slate-100 p-4 bg-white">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                      {entry.timeline}
                    </p>
                    <p className="mt-2 text-xs font-bold uppercase text-slate-900 break-words">
                      {entry.narrative}
                    </p>
                    <p className="mt-2 text-[10px] font-black uppercase text-red-600">
                      Lead: {entry.lead}
                    </p>
                  </div>
                  <div className={`shrink-0 text-sm font-black ${entry.isPositive ? "text-emerald-500" : "text-red-600"}`}>
                    {entry.value}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      );

    case "expenses_income":
      return (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden animate-in slide-in-from-bottom-4 text-left">
          <div className="p-5 sm:p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/20 uppercase font-black tracking-widest text-xs sm:text-sm">
            <h1>Departmental Strategic Ledger</h1>

            {hasPermission("STOCK_CREATE") && (
              <button
                onClick={() => setFinanceModalOpen(true)}
                className="bg-red-600 text-white px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wide shadow-md"
                disabled={!business?.id || isOrgLoading}
                type="button"
              >
                {isSubmittingFinance ? "Loading..." : "Add Record"}
              </button>
            )}
          </div>

          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-slate-800 text-left">
              <thead className="bg-slate-50/50 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                <tr>
                  <th className="px-6 lg:px-8 py-5 text-left">Timeline</th>
                  <th className="px-6 lg:px-8 py-5 text-left">Strategic Narrative</th>
                  <th className="px-6 lg:px-8 py-5 text-left">Executive Lead</th>
                  <th className="px-6 lg:px-8 py-5 text-right">Value (₦)</th>
                  <th className="px-6 lg:px-8 py-5 text-right">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-50">
                {ledgerEntries.map((entry, index) => (
                  <tr key={index} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-6 lg:px-8 py-5 text-[11px] font-medium text-slate-400">
                      {entry.timeline}
                    </td>

                    <td className="px-6 lg:px-8 py-5 font-semibold text-slate-900 uppercase text-xs">
                      {entry.narrative}
                    </td>

                    <td className="px-6 lg:px-8 py-5 text-xs font-bold text-red-600 uppercase">
                      {entry.lead}
                    </td>

                    <td
                      className={`px-6 lg:px-8 py-5 text-right font-bold ${entry.isPositive ? "text-emerald-500" : "text-red-600"
                        }`}
                    >
                      {entry.value}
                    </td>
                    <td className="px-6 lg:px-8 py-5 text-right">
                      <button className="text-red-600 hover:underline flex items-center gap-1" type="button">
                        Delete
                      </button>
                      <button className="text-blue-600 hover:underline flex items-center gap-1" type="button">
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {financeModalOpen && (
              <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-[100] flex items-center justify-center p-4 overflow-y-auto text-left">
                <div className="bg-white w-full max-w-xl rounded-3xl shadow-3xl overflow-hidden animate-in zoom-in-95 duration-300 border border-slate-100 text-left">
                  <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/30 text-left">
                    <h2 className="text-lg font-bold uppercase tracking-tight text-slate-900 text-left">
                      Finance
                    </h2>

                    <button
                      onClick={() => setFinanceModalOpen(false)}
                      type="button"
                      className="w-8 h-8 rounded-lg bg-white border border-slate-100 flex items-center justify-center text-slate-400 hover:text-red-600 transition-all shadow-sm"
                      disabled={isSubmittingFinance}
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
                    <form onSubmit={handleLoanSubmit} className="space-y-4 text-left text-slate-800 font-bold">
                      <div className="flex flex-col gap-2 w-full font-semibold text-left">
                        <label className="text-xs text-slate-500 ml-1 uppercase tracking-wider">
                          Record Type
                        </label>
                        <select
                          className="bg-slate-50 border border-slate-100 rounded-xl py-4 px-5 text-sm font-medium focus:ring-2 focus:ring-red-100 outline-none transition-all placeholder:text-slate-300"
                          name="record_type"
                          required
                          disabled={isSubmittingFinance}
                        >
                          <option>Record Type</option>
                          <option value="income">Income</option>
                          <option value="expense">Expense</option>
                        </select>
                      </div>

                      <div className="flex flex-col gap-2 w-full font-semibold text-left">
                        <label className="text-xs text-slate-500 ml-1 uppercase tracking-wider">
                          Timeline
                        </label>
                        <input
                          type="date"
                          className="bg-slate-50 border border-slate-100 rounded-xl py-4 px-5 text-sm font-medium focus:ring-2 focus:ring-red-100 outline-none transition-all placeholder:text-slate-300"
                          name="timeline"
                          required
                          disabled={isSubmittingFinance}
                        />
                      </div>

                      <div className="flex flex-col gap-2 w-full font-semibold text-left">
                        <label className="text-xs text-slate-500 ml-1 uppercase tracking-wider">
                          Strategic Narrative
                        </label>
                        <input
                          className="bg-slate-50 border border-slate-100 rounded-xl py-4 px-5 text-sm font-medium focus:ring-2 focus:ring-red-100 outline-none transition-all placeholder:text-slate-300"
                          name="strategic_narrative"
                          placeholder="Strategic..."
                          required
                          disabled={isSubmittingFinance}
                        />
                      </div>

                      <div className="flex flex-col gap-2 w-full font-semibold">
                        <label className="text-xs text-slate-500 ml-1 uppercase tracking-wider">
                          Principal (₦)
                        </label>
                        <input
                          className="bg-slate-50 border border-slate-100 rounded-xl py-4 px-5 text-sm font-medium focus:ring-2 focus:ring-red-100 outline-none transition-all placeholder:text-slate-300"
                          name="principal"
                          type="number"
                          placeholder="0.00"
                          required
                          disabled={isSubmittingFinance}
                        />
                      </div>


                      <button
                        type="submit"
                        className="w-full bg-red-600 text-white py-5 rounded-xl font-bold uppercase tracking-widest text-lg mt-4 text-center"
                        disabled={isSubmittingLoan}
                      >
                        {isSubmittingFinance ? "Saving..." : "Submit Financial Record"}
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="md:hidden p-4 space-y-4">
            {ledgerEntries.map((entry, index) => (
              <div key={index} className="rounded-2xl border border-slate-100 p-4 bg-white">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                      {entry.timeline}
                    </p>
                    <p className="mt-2 text-xs font-bold uppercase text-slate-900 break-words">
                      {entry.narrative}
                    </p>
                    <p className="mt-2 text-[10px] font-black uppercase text-red-600">
                      Lead: {entry.lead}
                    </p>
                  </div>
                  <div className={`shrink-0 text-sm font-black ${entry.isPositive ? "text-emerald-500" : "text-red-600"}`}>
                    {entry.value}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      );

    case "liabilities":
      return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-10 text-left">
          {isOrgLoading ? (
            <div className="lg:col-span-2">
              <LoadingState title="Loading liabilities..." />
            </div>
          ) : loans.length === 0 ? (
            <div className="lg:col-span-2">
              <EmptyState title="No liabilities recorded yet." />
            </div>
          ) : (
            loans.map((item, index) => (
              <div
                key={item.id ?? index}
                className="bg-white rounded-3xl p-6 sm:p-6 border border-slate-100 shadow-sm hover:border-red-600 transition-all relative overflow-hidden group"
              >
                <div className="flex justify-between items-start gap-4">
                  <span className="text-[10px] font-bold text-red-600 uppercase tracking-widest bg-red-50 px-2.5 py-1.5 rounded-lg">
                    {item.category}
                  </span>

                  <div className="flex flex-col items-end gap-1 text-slate-500">
                    <div className="flex items-center gap-1 text-slate-400 font-bold text-[10px]">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="10"
                        height="10"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 16 14" />
                      </svg>
                      {item.date}
                    </div>

                    <span className="text-red-600 font-black uppercase text-[9px] tracking-tight">
                      Lead: {item.lead}
                    </span>
                  </div>
                </div>

                <h4 className="text-base sm:text-lg font-bold text-slate-900 uppercase truncate mt-4">
                  {item.title}
                </h4>

                <p className="text-xs text-slate-500 font-medium mt-4 min-h-[40px] line-clamp-2">
                  {item.description}
                </p>

                <div className="mt-8 flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4 border-t border-slate-50 pt-8 text-slate-900">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                      Monthly Inst.
                    </p>
                    <p className="text-xl font-bold text-red-600">{item.monthlyInstallment}</p>
                  </div>

                  <div className="sm:text-right">
                    <p className="text-2xl sm:text-3xl font-black">{item.totalValue}</p>
                  </div>
                </div>

                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="200"
                  height="200"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="absolute -bottom-8 -right-8 opacity-[0.03] group-hover:opacity-10 transition-all rotate-12"
                >
                  <rect width="16" height="20" x="4" y="2" rx="2" />
                  <line x1="8" x2="16" y1="6" y2="6" />
                  <line x1="16" x2="16" y1="14" y2="18" />
                  <path d="M16 10h.01" />
                  <path d="M12 10h.01" />
                  <path d="M8 10h.01" />
                  <path d="M12 14h.01" />
                  <path d="M8 14h.01" />
                  <path d="M12 18h.01" />
                  <path d="M8 18h.01" />
                </svg>
              </div>
            ))
          )}
          {hasPermission("LOAN_CREATE") && (
            <button
              onClick={() => setLiabilityModalOpen(true)}
              className="border-2 border-dashed border-slate-200 rounded-3xl p-8 flex flex-col items-center justify-center gap-4 text-slate-400 hover:border-red-200 hover:text-red-600 transition-all group min-h-[220px] sm:min-h-[300px]"
              disabled={!business?.id || isOrgLoading}
              type="button"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="40"
                height="40"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="group-hover:rotate-90 transition-transform"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M8 12h8" />
                <path d="M12 8v8" />
              </svg>

              <span className="text-xs font-bold uppercase tracking-widest">Register Liability</span>
            </button>
          )}

          {liabilityModalOpen && (
            <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-[100] flex items-center justify-center p-4 overflow-y-auto text-left">
              <div className="bg-white w-full max-w-xl rounded-3xl shadow-3xl overflow-hidden animate-in zoom-in-95 duration-300 border border-slate-100 text-left">
                <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/30 text-left">
                  <h2 className="text-lg font-bold uppercase tracking-tight text-slate-900 text-left">
                    loan
                  </h2>

                  <button
                    onClick={() => setLiabilityModalOpen(false)}
                    type="button"
                    className="w-8 h-8 rounded-lg bg-white border border-slate-100 flex items-center justify-center text-slate-400 hover:text-red-600 transition-all shadow-sm"
                    disabled={isSubmittingLoan}
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
                  <form onSubmit={handleLoanSubmit} className="space-y-4 text-left text-slate-800 font-bold">
                    <div className="flex flex-col gap-2 w-full font-semibold text-left">
                      <label className="text-xs text-slate-500 ml-1 uppercase tracking-wider">
                        Lender Identity
                      </label>
                      <input
                        className="bg-slate-50 border border-slate-100 rounded-xl py-4 px-5 text-sm font-medium focus:ring-2 focus:ring-red-100 outline-none transition-all placeholder:text-slate-300"
                        name="ledger_identity"
                        placeholder="e.g. Bank"
                        required
                        disabled={isSubmittingLoan}
                      />
                    </div>

                    <div className="flex flex-col gap-2 w-full font-semibold text-left">
                      <label className="text-xs text-slate-500 ml-1 uppercase tracking-wider">
                        Operational Narrative
                      </label>
                      <input
                        className="bg-slate-50 border border-slate-100 rounded-xl py-4 px-5 text-sm font-medium focus:ring-2 focus:ring-red-100 outline-none transition-all placeholder:text-slate-300"
                        name="operational_narrative"
                        placeholder="Operational use..."
                        required
                        disabled={isSubmittingLoan}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-left">
                      <div className="flex flex-col gap-2 w-full font-semibold">
                        <label className="text-xs text-slate-500 ml-1 uppercase tracking-wider">
                          Principal (₦)
                        </label>
                        <input
                          className="bg-slate-50 border border-slate-100 rounded-xl py-4 px-5 text-sm font-medium focus:ring-2 focus:ring-red-100 outline-none transition-all placeholder:text-slate-300"
                          name="principal"
                          type="number"
                          required
                          disabled={isSubmittingLoan}
                        />
                      </div>

                      <div className="flex flex-col gap-2 w-full font-semibold">
                        <label className="text-xs text-slate-500 ml-1 uppercase tracking-wider">
                          Term (Mo)
                        </label>
                        <input
                          className="bg-slate-50 border border-slate-100 rounded-xl py-4 px-5 text-sm font-medium focus:ring-2 focus:ring-red-100 outline-none transition-all placeholder:text-slate-300"
                          name="term"
                          type="number"
                          required
                          disabled={isSubmittingLoan}
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 text-left">
                      <label className="text-xs font-bold text-slate-500 ml-1 uppercase tracking-wider">
                        Liability Proof (Agreement)
                      </label>

                      {/* Uplaod proof */}
                      <label
                        htmlFor="liability_proof"
                        className="border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all bg-slate-50 border-slate-200 text-slate-400 hover:bg-slate-100"
                      >
                        {selectedFile ? (
                          <>
                            <span className="text-xs font-bold text-emerald-600 uppercase">
                              {selectedFile.name}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              Click to change file
                            </span>
                          </>
                        ) : (
                          <>
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width={24}
                              height={24}
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth={2}
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              aria-hidden="true"
                            >
                              <path d="M12 3v12" />
                              <path d="m17 8-5-5-5 5" />
                              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                            </svg>
                            <span className="text-[10px] font-bold uppercase">
                              Upload Liability Proof
                            </span>
                          </>
                        )}
                      </label>
                      <input
                        type="file"
                        id="liability_proof"
                        name="file"
                        accept="image/*,application/pdf"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setSelectedFile(file);
                          }
                        }}
                      />
                    </div>

                    <p className="text-[10px] font-bold text-red-600 uppercase tracking-widest px-2 italic text-center">
                      Strategic Entry Point Available for Final Processing
                    </p>

                    <button
                      type="submit"
                      className="w-full bg-red-600 text-white py-5 rounded-xl font-bold uppercase tracking-widest text-lg mt-4 text-center"
                      disabled={isSubmittingLoan}
                    >
                      {isSubmittingLoan ? "Saving..." : "Finalize Confirmation"}
                    </button>
                  </form>
                </div>
              </div>
            </div>
          )}
        </div>
      );

    default:
      return (
        <div>
          {currentTab && renderContent(currentTab)}

          {
            isModalOpen && currentTab && (
              <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-100 flex items-center justify-center p-4 overflow-y-auto text-left">
                <div className="bg-white w-full max-w-xl rounded-3xl shadow-3xl overflow-hidden animate-in zoom-in-95 duration-300 border border-slate-100 text-left">
                  <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/30 text-left">
                    <h2 className="text-lg font-bold uppercase tracking-tight text-slate-900 text-left">
                      Add {currentTab.module_desc}
                    </h2>

                    <button
                      onClick={() => setIsModalOpen(false)}
                      type="button"
                      className="w-8 h-8 rounded-lg bg-white border border-slate-100 flex items-center justify-center text-slate-400 hover:text-red-600 transition-all shadow-sm"
                      disabled={isSubmitting}
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
                    <form onSubmit={handleDynamicSubmit} className="space-y-4 text-left text-slate-800 font-bold">
                      {currentTab.input_fields.map((field: any) => (
                        <div key={field.key} className="flex flex-col gap-2 w-full font-semibold text-left">
                          <label className="text-sm font-semibold">
                            {field.key}
                          </label>
                          {renderInputField(field)}
                        </div>
                      ))}

                      <button
                        type="submit"
                        className="w-full bg-red-600 text-white text-[16px] py-5 rounded-xl font-bold uppercase tracking-widest text-lg mt-4 text-center"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? "Subimitting..." : "Submit"}
                      </button>
                    </form>

                  </div>

                </div>
              </div>
            )
          }
        </div>
      );
  }
};


export default TabContent;