"use client"

import { useState } from 'react'
import toast from 'react-hot-toast'

const ExecutiveLogin = () => {
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading(true)

        try {
            const target = e.target as typeof e.target & {
                email: { value: string }
                password: { value: string }
            }

            const payload = {
                identity: target.email.value,
                password: target.password.value,
            }

            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
                credentials: 'include'
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.error || 'Login failed')
            }
            console.log('res:', data);
            localStorage.setItem("access_token", data.access_token);
            localStorage.setItem("role", data.personnel.role)
            localStorage.setItem("permissions", JSON.stringify(data.permissions));
            toast.success("Login successfully.");
            window.location.href = '/dashboard'
        } catch (err: any) {
            toast.error(err?.message || "Failed to login in.");
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 selection:bg-red-500 selection:text-white font-sans">
            <div className="w-full max-w-md animate-in zoom-in-95 duration-500">

                {/* Header */}
                <div className="text-center mb-10">
                    <div className="w-16 h-16 bg-red-600 rounded-3xl flex items-center justify-center text-white mx-auto shadow-2xl mb-6">
                        {/* SVG icon */}
                    </div>

                    <h1 className="text-2xl font-bold text-white tracking-tight uppercase mb-1">
                        D-Degree <span className="text-red-600 italic">FinPro</span>
                    </h1>
                    <p className="text-slate-500 font-medium text-xs tracking-wide">
                        Executive Authorization Gateway
                    </p>
                </div>

                {/* Form Card */}
                <div className="bg-white rounded-[2.5rem] p-8 shadow-2xl">
                    <h2 className="text-xl font-bold text-slate-900 mb-8 text-center tracking-tight">
                        Personnel Access
                    </h2>

                    <form className="space-y-6" onSubmit={handleSubmit}>

                        {/* Identity Field */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-slate-500 ml-1 uppercase tracking-wider">
                                Executive Identity
                            </label>
                            <input
                                name="email"
                                type="text"
                                placeholder="Enter Name"
                                required
                                className="w-full text-gray-600! bg-slate-50 border border-slate-100 rounded-xl py-4 px-5 text-sm font-medium focus:ring-2 focus:ring-red-100 outline-none transition-all placeholder:text-slate-300"
                            />
                        </div>

                        {/* Password Field */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-slate-500 ml-1 uppercase tracking-wider">
                                Credential Token
                            </label>
                            <input
                                name="password"
                                type="password"
                                placeholder="••••••••"
                                required
                                className="w-full text-slate-600! bg-slate-50 border border-slate-100 rounded-xl py-4 px-5 text-sm font-medium focus:ring-2 focus:ring-red-100 outline-none transition-all placeholder:text-slate-300"
                            />
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full bg-red-600 text-white py-4 rounded-xl font-bold shadow-lg shadow-red-200 hover:bg-red-700 transition-all text-sm uppercase tracking-wider mt-2 ${loading ? 'opacity-70 cursor-not-allowed' : ''
                                }`}
                        >
                            {loading ? 'Authorizing...' : 'Authorize Session'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default ExecutiveLogin