"use client"

import { useState } from "react";

const Sidebar = () => {
    const [selectedExecutive, setSelectedExecutive] = useState<string>("Datforte CBT");

    const handleExecutiveChange = (executive: string) => {
        console.log('selected executive:',  executive);
        setSelectedExecutive(executive);
    }

    return (
        <aside className="lg:w-72 shrink-0">
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col h-[75vh]">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">
                    Executive Access
                </h3>

                <div className="space-y-1.5 overflow-y-auto pr-2 custom-scrollbar flex-1">
                    {[
                        "Datforte CBT",
                        "D-Degree Digital",
                        "D-Degree Marketing",
                        "DDNewsOnline",
                        "Direct Digital Sales Agent (DDSA)",
                        "DDComply Application",
                        "DDTech",
                        "CBTech",
                        "Daily Hustle",
                        "CivilGuard",
                        "DDRent Application",
                        "TFO Canada",
                        "DDNearest Doctors Application",
                        "AfriSuite Application",
                        "HECOS Application",
                        "ASBON E-Commerce Application",
                        "ELECTRAS Application",
                        "DDoctTech Software",
                        "DD-ClipShare",
                        "FaceReview Application",
                        "DDMusicPro",
                        "ABU DLI Project",
                        "General Operations",
                    ].map((item, i) => (
                        <button
                            key={i}
                            onClick={() => handleExecutiveChange(item)}
                            className={`w-full text-left px-4 py-3.5 rounded-xl text-sm font-semibold transition-all ${selectedExecutive === item
                                    ? "bg-red-600 text-white shadow-md"
                                    : "text-slate-500 hover:bg-slate-50"
                                }`}
                        >
                            {item}
                        </button>
                    ))}
                </div>
            </div>
        </aside>
    )
}

export default Sidebar
