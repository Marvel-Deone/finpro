"use client"

import { useEffect, useState } from "react";
type Org = { id: string; name: string };

const Sidebar = ({
    selectedOrg,
    onOrgChange,
}: {
    selectedOrg: Org | null;
    onOrgChange: (org: Org) => void;
}) => {
    // const [selectedOrg, setSelectedOrg] = useState<Org[]>([]);
    const [orgs, setOrgs] = useState<any>([])

    // const handleOrgChange = (org: any) => {
    //     console.log('selected org:', org);
    //     setSelectedOrg(org);
    // }

    useEffect(() => {
        fetchOrg()
    }, []);

    const fetchOrg = async () => {
        try {
            const res = await fetch('/api/org', {
                credentials: 'include',
            })

            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.error);
            }

            setOrgs(data);
        } catch (err: any) {
            console.error(err.message);
        }
    }

    return (
        <aside className="lg:w-72 shrink-0">
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col h-[75vh]">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">
                    Executive Access
                </h3>

                <div className="space-y-1.5 overflow-y-auto pr-2 custom-scrollbar flex-1">
                    {
                        // [
                        //     "Datforte CBT",
                        //     "D-Degree Digital",
                        //     "D-Degree Marketing",
                        //     "DDNewsOnline",
                        //     "Direct Digital Sales Agent (DDSA)",
                        //     "DDComply Application",
                        //     "DDTech",
                        //     "CBTech",
                        //     "Daily Hustle",
                        //     "CivilGuard",
                        //     "DDRent Application",
                        //     "TFO Canada",
                        //     "DDNearest Doctors Application",
                        //     "AfriSuite Application",
                        //     "HECOS Application",
                        //     "ASBON E-Commerce Application",
                        //     "ELECTRAS Application",
                        //     "DDoctTech Software",
                        //     "DD-ClipShare",
                        //     "FaceReview Application",
                        //     "DDMusicPro",
                        //     "ABU DLI Project",
                        //     "General Operations",
                        // ]
                        orgs.map((org: { id: string; name: string }) => (
                            <button
                                key={org.id}
                                onClick={() => onOrgChange(org)}
                                className={`w-full text-left px-4 py-3.5 rounded-xl text-sm font-semibold transition-all ${selectedOrg?.id === org.id
                                    ? "bg-red-600 text-white shadow-md"
                                    : "text-slate-500 hover:bg-slate-50"
                                    }`}
                            >
                                {org.name}
                            </button>
                        ))}
                </div>
            </div>
        </aside>
    )
}

export default Sidebar
