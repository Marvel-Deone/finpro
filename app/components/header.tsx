import Link from "next/link"

const Header = ({
    mode,
    onModeChange,
}: {
    mode: string;
    onModeChange: (mode: string) => void;
}) => {
    const logout = () => {
        localStorage.removeItem('access_token');
        window.location.href = '/auth/signin    '
    }
    return (
        <header className="bg-white border-b border-slate-100 sticky top-0 z-50">
            <div className="max-w-[1600px] mx-auto px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-6">

                {/* Logo + Title */}
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center text-white shadow-lg shrink-0">
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
                        >
                            <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
                            <path d="m9 12 2 2 4-4" />
                        </svg>
                    </div>

                    <div>
                        <h1 className="text-lg font-bold tracking-tight uppercase text-slate-900">
                            D-DEGREE <span className="text-red-600 italic font-black">FINPRO</span>
                        </h1>
                        <div className="flex items-center gap-2 font-semibold text-[10px] uppercase tracking-wide">
                            <span className="text-red-600">Chief Executive Officer</span>
                            <span className="text-slate-300">• Ifeanyi Active</span>
                        </div>
                    </div>
                </div>

                {/* Right Controls */}
                <div className="flex items-center gap-6">
                    <div className="flex bg-slate-100 p-1 rounded-xl">
                        <button onClick={() => onModeChange('business')} className="flex items-center gap-2 px-6 py-2 rounded-lg text-xs font-bold bg-white text-red-600 shadow-sm">
                            Business
                        </button>
                        <button onClick={() => onModeChange('personal')} className="flex items-center gap-2 px-6 py-2 rounded-lg text-xs font-bold text-slate-500 hover:text-slate-700">
                            Personal
                        </button>
                    </div>

                    <div className="flex items-center gap-2">
                        <Link href="/settings" className="p-2.5 rounded-xl bg-white text-slate-400 border border-slate-100 hover:text-red-600">
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
                                className="lucide lucide-settings"
                                aria-hidden="true"
                            >
                                <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
                                <circle cx="12" cy="12" r="3" />
                            </svg>
                        </Link>
                        <button onClick={logout}
                            title="Terminate Session"
                            className="p-2.5 bg-white text-slate-400 border border-slate-100 rounded-xl hover:text-red-600 shadow-sm"
                        >
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
                                className="lucide lucide-log-out"
                                aria-hidden="true"
                            >
                                <path d="m16 17 5-5-5-5" />
                                <path d="M21 12H9" />
                                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </header>
    )
}

export default Header
