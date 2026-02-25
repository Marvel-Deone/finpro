"use client";

import { useEffect, useMemo, useState } from "react";
import Header from "../components/header";
import Sidebar from "../components/sidebar";

type Org = { id: string; name: string };

const TABS = [
    { id: "overview", label: "Overview" },
    { id: "history", label: "History" },
    { id: "exams", label: "Exams" },
    { id: "inventory", label: "Inventory" },
    { id: "vault", label: "Vault" },
    { id: "ledger", label: "Ledger" },
    { id: "liabilities", label: "Liabilities" },
];

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

const liabilities: Liability[] = [
    {
        category: "ABU DLI",
        date: "5 Jan, 09:00 am",
        lead: "Ifeanyi",
        title: "Exams guys mobilization",
        description: "Strategic debt for mobilizing exam team.",
        monthlyInstallment: "₦112,850",
        totalValue: "₦677,100",
    },
    {
        category: "Salary",
        date: "1 Jan, 10:00 am",
        lead: "Ifeanyi",
        title: "DD Office Salary Fund",
        description: "Internal salary support fund for core staffs.",
        monthlyInstallment: "₦83,333",
        totalValue: "₦1,000,000",
    },
];

const TabContent = ({
    activeTab,
    selectedOrg,
}: {
    activeTab: string,
    selectedOrg: { id: string; name: string } | null;
}) => {

    const orgId = selectedOrg?.id;

    const [liabilityModalOpen, setLiabilityModalOpen] = useState(false);
    const [examModalOpen, setExamModalOpen] = useState(false);
    const [stockModalOpen, setStockModalOpen] = useState(false);
    const [exams, setExams] = useState<any>([]);
    const [stocks, setStocks] = useState<any[]>([])
    const [loans, setLoans] = useState<any[]>([])

    useEffect(() => {
        if (!orgId) return;

        fetchStocks(orgId)
        fetchExams(orgId)
        fetchLoans(orgId)
    }, [orgId])

    const fetchExams = async (orgId: string) => {
        try {
            const res = await fetch(`/api/exams?orgId=${orgId}`, {
                credentials: 'include',
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.error)
            }

            setExams(data)

            console.log('datahhh:', data);

        } catch (err: any) {
            console.error(err.message)
        }
    }

    const fetchStocks = async (orgId: string) => {
        try {
            const res = await fetch(`/api/stocks?orgId=${orgId}`, {
                credentials: 'include',
            })

            const data = await res.json()

            if (!res.ok) throw new Error(data.error)

            setStocks(data)
        } catch (err) {
            console.error(err)
        }
    }

    const fetchLoans = async (orgId: string) => {
        try {
            const res = await fetch(`/api/loans?orgId=${orgId}`, {
                credentials: 'include',
            })

            const data = await res.json()

            if (!res.ok) throw new Error(data.error)

            // Transform DB data → UI shape
            const formatted = data.map((loan: any) => {
                const termMonths = Number(loan.term)
                const monthly = termMonths
                    ? loan.principal / termMonths
                    : loan.principal

                return {
                    id: loan.id,
                    category: "Loan",
                    date: new Date(loan.createdAt).toLocaleDateString(),
                    lead: "You",
                    title: loan.ledger_identity,
                    description: loan.operational_narrative,
                    monthlyInstallment: `₦${monthly.toLocaleString()}`,
                    totalValue: `₦${loan.principal.toLocaleString()}`,
                }
            })

            setLoans(formatted)
        } catch (err) {
            console.error(err)
        }
    }

    const handleExamSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        console.log('Hello', e.target);

        try {
            const target = e.target as typeof e.target & {
                category: { value: string }
                sessionName: { value: string }
                studentsCount: { value: string }
                documentProof: { value: string } // We'll use a URL or temp
            }

            const payload = {
                orgId,
                category: target.category.value,
                session_name: target.sessionName.value,
                total_candidates: parseInt(target.studentsCount.value, 10),
                document_proof: target.documentProof.value || 'https://example.com/temp.pdf',
            }

            const res = await fetch('/api/exams', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
                credentials: 'include',
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.error || 'Something went wrong')
            }

            alert('Exam recorded successfully!')
            fetchExams(selectedOrg!.id)
            setExamModalOpen(false)
        } catch (err: any) {
            console.log(err.message)
        }
    }

    const handleStockSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()

        const formData = new FormData(e.currentTarget)

        const payload = {
            orgId,
            asset_identity: formData.get('name'),
            operational_narrative: formData.get('narrative'),
            count: Number(formData.get('quantity')),
            unit: formData.get('unit'),
            purchase_value: Number(formData.get('totalAmount')),
            category: formData.get('category'),
            asset_proof: "", // handle upload later
        }

        try {
            const res = await fetch('/api/stocks', {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            })

            const data = await res.json()

            if (!res.ok) throw new Error(data.error)

            setStockModalOpen(false)
            fetchStocks(selectedOrg!.id)
            setStockModalOpen(false)
        } catch (err) {
            console.error(err)
        }
    }

    const handleLoanSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()

        const formData = new FormData(e.currentTarget)

        const principal = formData.get("principal")

        if (!principal) return

        const payload = {
            orgId,
            ledger_identity: String(formData.get("ledger_identity") ?? ""),
            operational_narrative: String(formData.get("operational_narrative") ?? ""),
            principal: Number(formData.get("principal")),
            term: String(formData.get("term") ?? ""),
            category: "Loan", // or from formData if you add it
            liability_proof: String(formData.get("liability_proof") ?? ""),
        }

        const res = await fetch("/api/loans", {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        })

        if (res.ok) {
            setLiabilityModalOpen(false)
            fetchLoans(selectedOrg!.id)
        }
    }

    switch (activeTab) {
        case "overview":
            return (
                <div className="animate-in fade-in duration-500 text-left">
                    <div className="mb-8 sm:mb-10 text-slate-900">
                        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-1 truncate uppercase">
                            Datforte CBT
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
                        {/* Capacity Card */}
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
                            <p className="text-2xl font-bold text-slate-900 tracking-tight">385</p>
                        </div>

                        {/* Revenue Card */}
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
                            <p className="text-2xl font-bold text-slate-900 tracking-tight">₦1,850,000</p>
                        </div>

                        {/* Assets Card */}
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
                            <p className="text-2xl font-bold text-slate-900 tracking-tight">₦405,300</p>
                        </div>

                        {/* Liability Card */}
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
                            <p className="text-2xl font-bold text-slate-900 tracking-tight">₦196,183</p>
                        </div>
                    </div>

                    {/* Net Capital */}
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 sm:gap-8">
                        <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-xl">
                            <div className="relative z-10">
                                <h3 className="text-lg font-bold mb-1 uppercase tracking-tight">Net Capital Status</h3>
                                <p className="text-[10px] sm:text-xs text-slate-400 font-medium uppercase tracking-widest">
                                    Strategic Balance projection
                                </p>

                                <div className="mt-8 sm:mt-10">
                                    <span className="text-3xl sm:text-4xl font-bold tracking-tight text-emerald-400">
                                        ₦1,484,527
                                    </span>

                                    <div className="w-full bg-white/10 h-1.5 rounded-full mt-6 overflow-hidden">
                                        <div
                                            className="bg-emerald-400 h-full transition-all duration-1000"
                                            style={{ width: "80%" }}
                                        />
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
                                    { title: "Strategic Ledger", sub: "3 Strategic Records", count: 3 },
                                    { title: "Asset Documentation", sub: "3 Strategic Records", count: 3 },
                                    { title: "Liability Agreements", sub: "2 Strategic Records", count: 1 },
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
                        {/* CALENDAR */}
                        <div className="w-full xl:w-96 shrink-0 bg-white rounded-3xl p-5 sm:p-6 border border-slate-100 shadow-sm">
                            <div className="flex items-center justify-between mb-6 sm:mb-8">
                                <h3 className="text-base font-bold text-slate-900 uppercase tracking-tight">
                                    February 2026
                                </h3>
                                <div className="flex gap-1.5">
                                    <button className="p-1.5 text-slate-400 hover:text-red-600 transition-all">
                                        ←
                                    </button>
                                    <button className="p-1.5 text-slate-400 hover:text-red-600 transition-all">
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

                                {Array.from({ length: 28 }, (_, i) => {
                                    const day = i + 1;
                                    const highlighted = [5, 10, 12, 15, 20, 22].includes(day);

                                    return (
                                        <div
                                            key={`day-${day}`}
                                            className={`aspect-square rounded-xl flex flex-col items-center justify-center text-xs font-bold border transition-all ${highlighted
                                                ? "bg-red-50 border-red-100 text-red-600"
                                                : "bg-white border-transparent text-slate-700 hover:bg-slate-50"
                                                }`}
                                        >
                                            {day}
                                            {highlighted && <div className="w-1 h-1 rounded-full mt-0.5 bg-red-600" />}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* TIMELINE */}
                        <div className="flex-1 bg-slate-900 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden min-h-[420px] shadow-xl">
                            <div className="relative z-10">
                                <div className="flex items-center gap-3 mb-6 sm:mb-8">
                                    <h3 className="text-xl sm:text-2xl font-bold uppercase tracking-tight">
                                        Audit History Footprints
                                    </h3>
                                </div>

                                <div className="space-y-6">
                                    {[
                                        { date: "22 Feb, 01:00 am", title: "Staff Briefing", desc: "Datforte CBT • Lead: Tunde" },
                                        { date: "20 Feb, 01:00 am", title: "Server Maintenance", desc: "DDTech • Lead: Sarah" },
                                        { date: "15 Feb, 01:00 am", title: "JAMB Registration Fees (Total Batch)", desc: "Datforte CBT • Lead: Tunde" },
                                        { date: "12 Feb, 01:00 am", title: "LaserJet Pro 400", desc: "Datforte CBT • Lead: Ifeanyi" },
                                        { date: "10 Feb, 01:00 am", title: "NECO", desc: "CBTech • Lead: Tunde" },
                                        { date: "5 Feb, 01:00 am", title: "Diesel Fuel Reserve", desc: "Datforte CBT • Lead: Tunde" },
                                        { date: "26 Jan, 01:00 am", title: "JAMB", desc: "Datforte CBT • Lead: Tunde" },
                                        { date: "9 Jan, 01:00 am", title: "ABU DLI", desc: "Datforte CBT • Lead: Ifeanyi" },
                                    ].map((item, index) => (
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
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            );

        case "exams":
            return (
                <div className="animate-in fade-in duration-500">
                    {/* Header */}
                    <div className="flex justify-between items-center mb-8 text-left">
                        <h3 className="text-xl font-bold uppercase tracking-tight text-slate-900">
                            Seat Utilization Log
                        </h3>
                        <button onClick={() => setExamModalOpen(true)} className="bg-red-600 text-white px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wide shadow-md">
                            Record Daily Entry
                        </button>
                    </div>

                    {/* Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 text-left">
                        {/* CARD 1 */}
                        {exams.map((exam: any) => (
                            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm relative overflow-hidden group hover:border-red-500 transition-all">
                                <div className="flex justify-between items-start">
                                    <span className="text-[10px] font-bold text-red-600 uppercase tracking-widest bg-red-50 px-2.5 py-1.5 rounded-lg">
                                        {exam.category}
                                    </span>

                                    <div className="flex flex-col items-end gap-1 text-slate-500">
                                        <button title="View Proof" className="text-emerald-500 hover:scale-110 transition-transform">
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
                                            {exam.created_at && `• Recorded ${Math.floor((Date.now() - new Date(exam.created_at).getTime()) / (1000 * 60 * 60))} hours ago`}
                                        </span>

                                        <button className="text-red-600 hover:underline flex items-center gap-1">
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

                    {/* Exam's modal */}
                    {examModalOpen && (
                        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-[100] flex items-center justify-center p-4 overflow-y-auto text-left">
                            <div className="bg-white w-full max-w-xl rounded-3xl shadow-3xl overflow-hidden animate-in zoom-in-95 duration-300 border border-slate-100 text-left">
                                <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/30 text-left">
                                    <h2 className="text-lg font-bold uppercase tracking-tight text-slate-900 text-left">
                                        exam session
                                    </h2>

                                    <button onClick={() => setExamModalOpen(false)}
                                        type="button"
                                        className="w-8 h-8 rounded-lg bg-white border border-slate-100 flex items-center justify-center text-slate-400 hover:text-red-600 transition-all shadow-sm"
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
                                                name="sessionName"
                                                placeholder="e.g. Morning Batch A"
                                                required
                                            />
                                        </div>

                                        <div className="flex flex-col gap-2 w-full font-semibold text-left">
                                            <label className="text-xs text-slate-500 ml-1 uppercase tracking-wider">
                                                Total Candidates Count
                                            </label>
                                            <input
                                                className="bg-slate-50 border border-slate-100 rounded-xl py-4 px-5 text-sm font-medium focus:ring-2 focus:ring-red-100 outline-none transition-all placeholder:text-slate-300"
                                                name="studentsCount"
                                                type="number"
                                                required
                                            />
                                        </div>

                                        <div className="flex flex-col gap-2">
                                            <label className="text-xs font-bold text-slate-500 ml-1 uppercase tracking-wider">
                                                Document Proof (Log/Register)
                                            </label>

                                            <div className="border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all bg-slate-50 border-slate-200 text-slate-400 hover:bg-slate-100">
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
                                            </div>
                                        </div>
                                        <input
                                            type="text"
                                            name="documentProof"
                                            defaultValue="https://example.com/temp.pdf"
                                            hidden
                                        />

                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2 italic text-center">
                                            Strategic Entry Point Available for Final Processing
                                        </p>

                                        <button
                                            type="submit"
                                            className="w-full bg-red-600 text-white py-4 rounded-xl font-bold uppercase tracking-widest text-sm mt-4"
                                        >
                                            Record Daily Inventory
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
                    {/* Header */}
                    <div className="flex justify-between items-center mb-8 text-slate-900">
                        <h3 className="text-xl font-bold uppercase tracking-tight">
                            Asset Repository
                        </h3>
                        <button onClick={() => setStockModalOpen(true)} className="bg-red-600 text-white px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wide shadow-md">
                            Listing New Stock
                        </button>
                    </div>

                    {/* Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                        {/* CARD 1 */}
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
                                        <button title="View Proof" className="text-emerald-500 hover:scale-110 transition-transform">
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
                                            ₦{stock.purchase_value.toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {stockModalOpen && (
                        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-[100] flex items-center justify-center p-4 overflow-y-auto text-left">
                            <div className="bg-white w-full max-w-xl rounded-3xl shadow-3xl overflow-hidden animate-in zoom-in-95 duration-300 border border-slate-100 text-left">
                                <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/30 text-left">
                                    <h2 className="text-lg font-bold uppercase tracking-tight text-slate-900 text-left">
                                        New Stock
                                    </h2>
                                    <button onClick={() => setStockModalOpen(false)} className="w-8 h-8 rounded-lg bg-white border border-slate-100 flex items-center justify-center text-slate-400 hover:text-red-600 transition-all shadow-sm">
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
                                            className="lucide lucide-x"
                                            aria-hidden="true"
                                        >
                                            <path d="M18 6 6 18"></path>
                                            <path d="m6 6 12 12"></path>
                                        </svg>
                                    </button>
                                </div>

                                <div className="p-8 space-y-6 text-left">
                                    <form
                                        className="space-y-4 text-left text-slate-800 font-bold"
                                        onSubmit={handleStockSubmit}
                                    >
                                        {/* Asset Identity */}
                                        <div className="flex flex-col gap-2 w-full text-left font-semibold">
                                            <label htmlFor="name" className="text-xs text-slate-500 ml-1 uppercase tracking-wider text-left">
                                                Asset Identity
                                            </label>
                                            <input
                                                id="name"
                                                name="name"
                                                placeholder="e.g. Office PC"
                                                required
                                                className="bg-slate-50 border border-slate-100 rounded-xl py-4 px-5 text-sm font-medium focus:ring-2 focus:ring-red-100 outline-none transition-all placeholder:text-slate-300 text-left"
                                            />
                                        </div>

                                        {/* Operational Narrative */}
                                        <div className="flex flex-col gap-2 w-full text-left font-semibold">
                                            <label htmlFor="narrative" className="text-xs text-slate-500 ml-1 uppercase tracking-wider text-left">
                                                Operational Narrative
                                            </label>
                                            <input
                                                id="narrative"
                                                name="narrative"
                                                placeholder="Operational use..."
                                                required
                                                className="bg-slate-50 border border-slate-100 rounded-xl py-4 px-5 text-sm font-medium focus:ring-2 focus:ring-red-100 outline-none transition-all placeholder:text-slate-300 text-left"
                                            />
                                        </div>

                                        {/* Count & Unit */}
                                        <div className="grid grid-cols-2 gap-4 text-left">
                                            <div className="flex flex-col gap-2 w-full text-left font-semibold">
                                                <label htmlFor="quantity" className="text-xs text-slate-500 ml-1 uppercase tracking-wider text-left">
                                                    Count
                                                </label>
                                                <input
                                                    id="quantity"
                                                    name="quantity"
                                                    type="number"
                                                    required
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
                                                    className="bg-slate-50 border border-slate-100 rounded-xl py-4 px-5 text-sm font-medium focus:ring-2 focus:ring-red-100 outline-none transition-all placeholder:text-slate-300 text-left"
                                                />
                                            </div>
                                        </div>

                                        {/* Purchase Value */}
                                        <div className="flex flex-col gap-2 w-full text-left font-semibold">
                                            <label htmlFor="totalAmount" className="text-xs text-slate-500 ml-1 uppercase tracking-wider text-left">
                                                Purchase Value (₦)
                                            </label>
                                            <input
                                                id="totalAmount"
                                                name="totalAmount"
                                                type="number"
                                                required
                                                className="bg-slate-50 border border-slate-100 rounded-xl py-4 px-5 text-sm font-medium focus:ring-2 focus:ring-red-100 outline-none transition-all placeholder:text-slate-300 text-left"
                                            />
                                        </div>

                                        {/* Category */}
                                        <div className="flex flex-col gap-2 text-left text-slate-500 font-bold">
                                            <label htmlFor="category" className="text-xs font-semibold text-slate-500 ml-1 uppercase tracking-wider text-left">
                                                Category
                                            </label>
                                            <select
                                                id="category"
                                                name="category"
                                                className="bg-slate-50 border border-slate-100 rounded-xl py-4 px-5 text-sm font-bold outline-none text-left"
                                            >
                                                <option>Hardware</option>
                                                <option>Stationery</option>
                                                <option>Operations</option>
                                            </select>
                                        </div>

                                        {/* Asset Proof Upload */}
                                        <div className="flex flex-col gap-2 text-left">
                                            <label className="text-xs font-semibold text-slate-500 ml-1 uppercase tracking-wider font-bold text-left">
                                                Asset Proof (Invoice/Receipt)
                                            </label>
                                            <div className="border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all bg-slate-50 border-slate-200 text-slate-400 hover:bg-slate-100">
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
                                                    className="lucide lucide-upload"
                                                    aria-hidden="true"
                                                >
                                                    <path d="M12 3v12"></path>
                                                    <path d="m17 8-5-5-5 5"></path>
                                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                                </svg>
                                                <span className="text-[10px] font-bold uppercase text-left">
                                                    Upload Asset Proof
                                                </span>
                                            </div>
                                        </div>

                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2 italic text-center">
                                            Strategic Entry Point Available for Final Processing
                                        </p>

                                        <button
                                            type="submit"
                                            className="w-full bg-red-600 text-white py-4 rounded-xl font-bold uppercase tracking-widest text-sm mt-4 text-center"
                                        >
                                            Confirm Listing
                                        </button>
                                    </form>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )

        case "vault":
            return (
                <div className="animate-in fade-in duration-500 text-left">
                    <h3 className="text-xl font-bold uppercase tracking-tight mb-8 text-slate-900">
                        Executive Document Vault
                    </h3>

                    <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-6 text-slate-800">
                        {/* DOCUMENT CARD */}
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

                                <button className="mt-4 text-[10px] font-bold text-red-600 uppercase flex items-center gap-1 mx-auto hover:underline w-full justify-center">
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
            )

        case "ledger":
            return (
                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden animate-in slide-in-from-bottom-4 text-left">
                    <div className="p-5 sm:p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/20 uppercase font-black tracking-widest text-xs sm:text-sm">
                        Departmental Strategic Ledger
                    </div>

                    {/* Desktop table */}
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

                    {/* Mobile stacked cards */}
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
                                    <div
                                        className={`shrink-0 text-sm font-black ${entry.isPositive ? "text-emerald-500" : "text-red-600"
                                            }`}
                                    >
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
                    {loans.map((item, index) => (
                        <div
                            key={index}
                            className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm hover:border-red-600 transition-all relative overflow-hidden group"
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
                    ))}

                    <button onClick={() => setLiabilityModalOpen(true)} className="border-2 border-dashed border-slate-200 rounded-3xl p-8 flex flex-col items-center justify-center gap-4 text-slate-400 hover:border-red-200 hover:text-red-600 transition-all group min-h-[220px] sm:min-h-[300px]">
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

                    {/* Liability modal */}
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
                                                />
                                            </div>
                                        </div>

                                        <div className="flex flex-col gap-2 text-left">
                                            <label className="text-xs font-bold text-slate-500 ml-1 uppercase tracking-wider">
                                                Liability Proof (Agreement)
                                            </label>

                                            <div className="border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all bg-slate-50 border-slate-200 text-slate-400 hover:bg-slate-100">
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

                                                <span className="text-[10px] font-bold uppercase text-left">
                                                    Upload Liability Proof
                                                </span>
                                            </div>
                                        </div>

                                        <input
                                            type="text"
                                            name="liability_proof"
                                            defaultValue="https://example.com/temp.pdf"
                                            hidden
                                        />

                                        <p className="text-[10px] font-bold text-red-600 uppercase tracking-widest px-2 italic text-center">
                                            Strategic Entry Point Available for Final Processing
                                        </p>

                                        <button
                                            type="submit"
                                            className="w-full bg-red-600 text-white py-5 rounded-xl font-bold uppercase tracking-widest text-lg mt-4 text-center"
                                        >
                                            Finalize Confirmation
                                        </button>
                                    </form>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            );

        default:
            return null;
    }
};

const Dashboard = () => {
    const [activeTab, setActiveTab] = useState("overview");
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [selectedOrg, setSelectedOrg] = useState<Org | null>(null);

    // Close drawer on desktop resize
    useEffect(() => {
        const onResize = () => {
            if (window.innerWidth >= 1024) setSidebarOpen(false);
        };
        window.addEventListener("resize", onResize);
        return () => window.removeEventListener("resize", onResize);
    }, []);

    const activeLabel = useMemo(
        () => TABS.find((t) => t.id === activeTab)?.label ?? "Overview",
        [activeTab]
    );

    const handleOrgSubmit = async () => {
        const payload = {
            name: "General Operations"
        }

        try {
            const res = await fetch('/api/org', {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            })

            const data = await res.json()

            if (!res.ok) throw new Error(data.error)
            console.log('data:', data);

        } catch (err) {
            console.error(err)
        }
    }

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-16 sm:pb-20 selection:bg-red-100 selection:text-red-700">
            <Header />
            {/* <button onClick={handleOrgSubmit}>Hello there</button> */}
            {/* Mobile topbar (hamburger + active tab) */}
            <div className="lg:hidden sticky top-0 z-30 bg-slate-50/90 backdrop-blur border-b border-slate-100">
                <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-3 flex items-center gap-3">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="w-10 h-10 rounded-xl border border-slate-200 bg-white shadow-sm flex items-center justify-center"
                        aria-label="Open sidebar"
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

                    <button className="ml-auto flex items-center gap-2 text-xs font-black uppercase text-red-600 hover:bg-red-50 px-4 py-2 rounded-xl transition-all shadow-sm border border-red-50">
                        Export
                    </button>
                </div>
            </div>

            <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 flex flex-col lg:flex-row gap-6 lg:gap-10">
                {/* Desktop sidebar */}
                <div className="hidden lg:block">
                    <Sidebar selectedOrg={selectedOrg} onOrgChange={setSelectedOrg} />
                </div>

                {/* Mobile sidebar drawer */}
                <div className={`lg:hidden fixed inset-0 z-40 ${sidebarOpen ? "" : "pointer-events-none"}`}>
                    <div
                        className={`absolute inset-0 bg-black/40 transition-opacity ${sidebarOpen ? "opacity-100" : "opacity-0"
                            }`}
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

                {/* Main Content */}
                <div className="flex-1 min-w-0">
                    {/* Tabs row: scrollable + export aligns on desktop */}
                    <div className="relative">
                        {/* fade edges */}
                        <div className="pointer-events-none absolute left-0 top-0 h-full w-6 bg-gradient-to-r from-slate-50 to-transparent" />
                        <div className="pointer-events-none absolute right-0 top-0 h-full w-10 bg-gradient-to-l from-slate-50 to-transparent" />

                        <div className="flex items-end border-b border-slate-200 mb-8 sm:mb-10">
                            <div className="flex-1 overflow-x-auto whitespace-nowrap scrollbar-hide">
                                <div className="flex items-center gap-4 pr-6">
                                    {TABS.map((tab) => (
                                        <button
                                            key={tab.id}
                                            onClick={() => setActiveTab(tab.id)}
                                            className={`flex items-center gap-2.5 pb-4 px-1 border-b-2 transition-all font-bold text-xs uppercase tracking-wide shrink-0 ${activeTab === tab.id
                                                ? "border-red-600 text-red-600"
                                                : "border-transparent text-slate-400 hover:text-slate-600"
                                                }`}
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

                            <button className="hidden lg:flex mb-4 ml-4 items-center gap-2 text-xs font-black uppercase text-red-600 hover:bg-red-50 px-4 py-2 rounded-xl transition-all shadow-sm border border-red-50 shrink-0">
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

        /* (kept) */
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
      `}</style>
        </div>
    );
};

export default Dashboard;