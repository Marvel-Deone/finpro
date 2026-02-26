
// const ExecutiveLogin = () => {
//     return (
//         <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 selection:bg-red-500 selection:text-white font-sans">
//             <div className="w-full max-w-md animate-in zoom-in-95 duration-500">

//                 {/* Header */}
//                 <div className="text-center mb-10">
//                     <div className="w-16 h-16 bg-red-600 rounded-3xl flex items-center justify-center text-white mx-auto shadow-2xl mb-6">
//                         <svg
//                             xmlns="http://www.w3.org/2000/svg"
//                             width={32}
//                             height={32}
//                             viewBox="0 0 24 24"
//                             fill="none"
//                             stroke="currentColor"
//                             strokeWidth={2}
//                             strokeLinecap="round"
//                             strokeLinejoin="round"
//                             aria-hidden="true"
//                         >
//                             <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
//                             <path d="m9 12 2 2 4-4" />
//                         </svg>
//                     </div>

//                     <h1 className="text-2xl font-bold text-white tracking-tight uppercase mb-1">
//                         D-Degree <span className="text-red-600 italic">FinPro</span>
//                     </h1>
//                     <p className="text-slate-500 font-medium text-xs tracking-wide">
//                         Executive Authorization Gateway
//                     </p>
//                 </div>

//                 {/* Form Card */}
//                 <div className="bg-white rounded-[2.5rem] p-8 shadow-2xl">
//                     <h2 className="text-xl font-bold text-slate-900 mb-8 text-center tracking-tight">
//                         Personnel Access
//                     </h2>

//                     <form className="space-y-6">

//                         {/* Name Field */}
//                         <div className="space-y-1.5">
//                             <label className="text-xs font-semibold text-slate-500 ml-1 uppercase tracking-wider">
//                                 Executive Identity
//                             </label>
//                             <div className="relative">
//                                 <svg
//                                     xmlns="http://www.w3.org/2000/svg"
//                                     width={16}
//                                     height={16}
//                                     viewBox="0 0 24 24"
//                                     fill="none"
//                                     stroke="currentColor"
//                                     strokeWidth={2}
//                                     strokeLinecap="round"
//                                     strokeLinejoin="round"
//                                     className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400"
//                                     aria-hidden="true"
//                                 >
//                                     <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
//                                     <circle cx="12" cy="7" r="4" />
//                                 </svg>
//                                 <input
//                                     name="email"
//                                     type="text"
//                                     placeholder="Enter Name"
//                                     required
//                                     className="w-full bg-slate-50 border border-slate-100 rounded-xl py-4 pl-12 pr-5 text-sm font-medium focus:ring-2 focus:ring-red-100 outline-none transition-all placeholder:text-slate-300"
//                                 />
//                             </div>
//                         </div>

//                         {/* Password Field */}
//                         <div className="space-y-1.5">
//                             <label className="text-xs font-semibold text-slate-500 ml-1 uppercase tracking-wider">
//                                 Credential Token
//                             </label>
//                             <div className="relative">
//                                 <svg
//                                     xmlns="http://www.w3.org/2000/svg"
//                                     width={16}
//                                     height={16}
//                                     viewBox="0 0 24 24"
//                                     fill="none"
//                                     stroke="currentColor"
//                                     strokeWidth={2}
//                                     strokeLinecap="round"
//                                     strokeLinejoin="round"
//                                     className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400"
//                                     aria-hidden="true"
//                                 >
//                                     <path d="M2.586 17.414A2 2 0 0 0 2 18.828V21a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h1a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h.172a2 2 0 0 0 1.414-.586l.814-.814a6.5 6.5 0 1 0-4-4z" />
//                                     <circle cx="16.5" cy="7.5" r=".5" fill="currentColor" />
//                                 </svg>
//                                 <input
//                                     name="password"
//                                     type="password"
//                                     placeholder="••••••••"
//                                     required
//                                     className="w-full bg-slate-50 border border-slate-100 rounded-xl py-4 pl-12 pr-5 text-sm font-medium focus:ring-2 focus:ring-red-100 outline-none transition-all placeholder:text-slate-300"
//                                 />
//                             </div>
//                         </div>

//                         {/* Submit */}
//                         <button
//                             type="submit"
//                             className="w-full bg-red-600 text-white py-4 rounded-xl font-bold shadow-lg shadow-red-200 hover:bg-red-700 transition-all text-sm uppercase tracking-wider mt-2"
//                         >
//                             Authorize Session
//                         </button>

//                     </form>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default ExecutiveLogin;

"use client"

import { useState } from 'react'

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

      const res = await fetch('/api/auth/login', {
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

      window.location.href = '/dashboard'
    } catch (err: any) {
      alert(err.message)
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