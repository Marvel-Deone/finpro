"use client"

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
type Org = { id: string; name: string };

const Sidebar = ({
    selectedOrg,
    onOrgChange,
}: {
    selectedOrg: Org | null;
    onOrgChange: (org: Org) => void;
}) => {
    const [subsidiaries, setSubsidiaries] = useState<any>([])
    const [accessToken, setAccessToken] = useState("")

    useEffect(() => {
        const token = localStorage.getItem("access_token")
        console.log('token:', token);
        if (token) setAccessToken(token)
    }, [])

    useEffect(() => {
        if (accessToken) {
            fetchSubsidiaries()
        }
    }, [accessToken]);

    const fetchSubsidiaries = async () => {
        console.log('accesstoken:', accessToken);

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/subsidiary`, {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            })

            const data = await res.json()

            if (!res.ok) throw new Error(data.message)

            setSubsidiaries(data)
            if (data.length > 0) {
                onOrgChange(data[0]);
            }
        } catch (err: any) {
            toast.error(err.message)
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
                        subsidiaries.map((org: { id: string; name: string }) => (
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
