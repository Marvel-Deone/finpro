"use client"

import React, { useEffect, useState } from "react"
import Header from "../components/header"
import toast from "react-hot-toast"

// const PERMISSION_GROUPS = {
//     SUBSIDIARY: ["CREATE", "READ", "UPDATE", "DELETE"],
//     ROLE: ["CREATE", "UPDATE", "DELETE", "ASSIGN"],
//     PERMISSION: ["CREATE", "UPDATE", "DELETE"],
//     EXAM: ["CREATE", "READ", "UPDATE", "DELETE"],
//     STOCK: ["CREATE", "READ", "UPDATE", "DELETE"],
//     LOAN: ["CREATE", "READ", "UPDATE", "DELETE"],
// }

const Settings = () => {

    const [subsidiaries, setSubsidiaries] = useState<any[]>([])
    const [roles, setRoles] = useState<any[]>([])
    const [personnel, setPersonnel] = useState<any[]>([])

    const [loadingSubsidiaries, setLoadingSubsidiaries] = useState(false)
    const [loadingPersonnel, setLoadingPersonnel] = useState(false)
    const [creatingPersonnel, setCreatingPersonnel] = useState(false)
    const [creatingRole, setCreatingRole] = useState(false)


    const [entityModalOpen, setEntityModalOpen] = useState(false)
    const [personnelModalOpen, setPersonnelModalOpen] = useState(false)
    const [roleModalOpen, setRoleModalOpen] = useState(false)

    const [entityName, setEntityName] = useState("")
    const [description, setDescription] = useState("")
    const [industrialSector, setIndustrialSector] = useState("")
    const [creating, setCreating] = useState(false)
    const [accessToken, setAccessToken] = useState("")
    const [name, setName] = useState("")
    const [title, setTitle] = useState("")
    const [roleId, setRoleId] = useState("")
    const [subsidiaryId, setSubsidiaryId] = useState("")
    const [password, setPassword] = useState("")
    const [allPermissions, setAllPermissions] = useState<any[]>([])
    const [selectedRoleId, setSelectedRoleId] = useState("")
    const [selectedPermissions, setSelectedPermissions] = useState<string[]>([])

    const [roleName, setRoleName] = useState("")

    // const [permissions, setPermissions] = useState({
    //     create: false,
    //     update: false,
    //     delete: false
    // })
    const [permissions, setPermissions] = useState<string[]>([])
    const groupedPermissions = allPermissions.reduce((acc: any, perm: any) => {
        const module = perm.name.split("_")[0]

        if (!acc[module]) acc[module] = []

        acc[module].push(perm)

        return acc
    }, {})

    useEffect(() => {

        const token = localStorage.getItem("access_token")

        if (token) setAccessToken(token)

    }, [])

    useEffect(() => {

        if (accessToken) {
            fetchSubsidiaries()
            fetchRoles()
            fetchPersonnel()
            fetchPermissions()
        }

    }, [accessToken])

    const fetchRoles = async () => {

        try {

            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/roles`, {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            })

            const data = await res.json()

            if (!res.ok) throw new Error(data.message)

            setRoles(data)

        } catch (err: any) {

            toast.error(err.message)

        }

    }

    const fetchPermissions = async () => {
        try {

            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/permissions`, {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            })

            const data = await res.json()

            if (!res.ok) throw new Error(data.message)

            setAllPermissions(data)

        } catch (err: any) {

            toast.error(err.message)

        }

    }

    const fetchSubsidiaries = async () => {

        try {

            setLoadingSubsidiaries(true)

            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/subsidiary`, {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            })

            const data = await res.json()

            if (!res.ok) throw new Error(data.message)

            setSubsidiaries(data)

        } catch (err: any) {

            toast.error(err.message)

        } finally {

            setLoadingSubsidiaries(false)

        }

    }

    const fetchPersonnel = async () => {

        try {

            setLoadingPersonnel(true)

            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/personnel`, {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            })

            const data = await res.json()

            if (!res.ok) throw new Error(data.message)

            setPersonnel(data)

        } catch (err: any) {

            toast.error(err.message)

        } finally {

            setLoadingPersonnel(false)

        }

    }

    const handleCreateEntity = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()

        if (!entityName.trim() || !description.trim() || !industrialSector.trim()) return
        console.log('data:', entityName, description, industrialSector);

        setCreating(true)
        const body = {
            name: entityName,
            description,
            industrial_sector: industrialSector
        }

        try {
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/subsidiary`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${accessToken}`,
                    },
                    credentials: "include",
                    body: JSON.stringify(body)
                }
            )

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.message || "Failed to create entity")
            }

            toast.success("Entity deployed successfully")
            fetchSubsidiaries()

            setEntityName("")
            setDescription("")
            setIndustrialSector("")
            setEntityModalOpen(false)

        } catch (err: any) {
            toast.error(err.message || "Failed to deploy entity")
        } finally {
            setCreating(false)
        }
    }

    const generatePassword = () => {
        console.log('reaff:');
        const random = Math.random().toString(36).slice(-10)
        console.log('sdd:', random);

        setPassword(random)
    }

    const selectRole = (role: any) => {
        setSelectedRoleId(role.id)
        const permissionIds = role.permissions.map(
            (p: any) => p.permission.id
        )
        setSelectedPermissions(permissionIds)

    }

    const handleCreatePersonnel = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()

        if (!name || !title || !roleId || !password) return

        setCreatingPersonnel(true)

        try {
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/personnel`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${accessToken}`,
                    },
                    body: JSON.stringify({
                        identity: name,
                        title,
                        roleId,
                        subsidiary_id: subsidiaryId,
                        password
                    }),
                }
            )

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.message || "Failed to create personnel")
            }

            toast.success("Personnel created")

            fetchPersonnel()

            setPersonnelModalOpen(false)
            setName("")
            setTitle("")
            setRoleId("")
            setSubsidiaryId("")
            setPassword("")

        } catch (err: any) {
            toast.error(err.message)
        } finally {
            setCreatingPersonnel(false)
        }
    }

    // const togglePermission = (key: string) => {

    //     setPermissions((prev: any) => ({
    //         ...prev,
    //         [key]: !prev[key]
    //     }))

    // }
    const togglePermission = (permissionId: string) => {
        setSelectedPermissions((prev) => {
            if (prev.includes(permissionId)) {
                return prev.filter((p) => p !== permissionId)
            }
            return [...prev, permissionId]
        })

    }

    const createRole = async (e: any) => {
        e.preventDefault()

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/roles`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${accessToken}`
                },
                body: JSON.stringify({
                    name: roleName,
                    permissions
                })
            })

            const data = await res.json()

            if (!res.ok) throw new Error(data.message)

            toast.success("Role created")

            fetchRoles()

            setRoleModalOpen(false)

            setRoleName("")
        } catch (err: any) {
            toast.error(err.message)
        }

    }
    const saveRolePermissions = async () => {

        if (!selectedRoleId) {
            toast.error("Select a role first")
            return
        }

        try {

            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/roles/${selectedRoleId}/permissions`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${accessToken}`
                    },
                    body: JSON.stringify({
                        permissionIds: selectedPermissions
                    })
                }
            )

            const data = await res.json()

            if (!res.ok) throw new Error(data.message)

            toast.success("Permissions updated")

            fetchRoles()

        } catch (err: any) {

            toast.error(err.message)

        }

    }

    const updateRolePermission = async (roleId: string, permission: string, value: boolean) => {

        try {

            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/roles/${roleId}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${accessToken}`
                },
                body: JSON.stringify({
                    permission,
                    value
                })
            })

            const data = await res.json()

            if (!res.ok) throw new Error(data.message)

            fetchRoles()

        } catch (err: any) {

            toast.error(err.message)

        }

    }

    const deleteEntity = async (id: string) => {

        if (!confirm("Delete this entity?")) return

        try {

            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/subsidiary/${id}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            })

            const data = await res.json()

            if (!res.ok) throw new Error(data.message)

            toast.success("Entity deleted")

            fetchSubsidiaries()

        } catch (err: any) {

            toast.error(err.message)

        }

    }

    return (

        <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-16">

            <Header />

            <div className="max-w-[1600px] mx-auto px-6 pt-8">

                {/* HEADER */}

                <div className="flex justify-between mb-10">

                    <div>

                        <h2 className="text-3xl font-black uppercase">
                            Strategic Command
                        </h2>

                        <p className="text-xs text-slate-500 uppercase">
                            Entity Control & Executive Governance
                        </p>

                    </div>
                    <div className="flex justify-end gap-4">
                        <button onClick={() => setPersonnelModalOpen(true)} className="bg-slate-900 text-white px-6 py-3.5 rounded-xl text-xs flex items-center gap-2 hover:bg-black transition-all uppercase tracking-wide font-black">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                                <circle cx="9" cy="7" r="4" />
                                <line x1="19" x2="19" y1="8" y2="14" />
                                <line x1="22" x2="16" y1="11" y2="11" />
                            </svg>
                            Add Personnel
                        </button>

                        <button onClick={() => setEntityModalOpen(true)} className="bg-red-600 text-white px-6 py-3.5 rounded-xl text-xs flex items-center gap-2 hover:bg-red-700 transition-all uppercase tracking-wide font-black">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <circle cx="12" cy="12" r="10" />
                                <path d="M8 12h8" />
                                <path d="M12 8v8" />
                            </svg>
                            Deploy Entity
                        </button>
                        <button
                            onClick={() => setRoleModalOpen(true)}
                            className="bg-slate-900 text-white px-6 py-3 rounded-xl text-xs font-black uppercase"
                        >
                            Add Role
                        </button>
                    </div>

                </div>

                <div className="grid xl:grid-cols-2 gap-8">

                    {/* PERSONNEL */}

                    <div className="bg-white rounded-3xl border border-black/5 shadow-sm">

                        <div className="p-6 border-b border-black/5">

                            <h3 className="font-black text-sm uppercase">
                                Executive Personnel
                            </h3>

                        </div>

                        <div>

                            {personnel.map((person: any) => (

                                <div
                                    key={person.id}
                                    className="p-5 border-b border-black/5 flex gap-4"
                                >

                                    <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold">

                                        {(person.identity || "?").charAt(0)}

                                    </div>

                                    <div>

                                        <p className="font-bold text-sm">
                                            {person.identity}
                                        </p>

                                        <p className="text-xs text-slate-500">
                                            {person.title}
                                        </p>

                                    </div>

                                </div>

                            ))}

                        </div>

                    </div>

                    {/* ENTITIES */}

                    <div className="bg-white rounded-3xl border border-black/5 shadow-sm">

                        <div className="p-6 border-b border-black/5">

                            <h3 className="font-black text-sm uppercase">
                                Strategic Entities
                            </h3>

                        </div>

                        <div>
                            {subsidiaries.map((entity: any) => (
                                <div
                                    key={entity.id}
                                    className="group p-5 border-b border-slate-100 flex items-center justify-between hover:bg-slate-50 transition"
                                >

                                    <span className="text-sm font-medium">
                                        {entity.name}
                                    </span>

                                    <button
                                        onClick={() => deleteEntity(entity.id)}
                                        className="opacity-0 group-hover:opacity-100 transition text-slate-400 hover:text-red-600"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-trash2 lucide-trash-2" aria-hidden="true"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path><line x1="10" x2="10" y1="11" y2="17"></line><line x1="14" x2="14" y1="11" y2="17"></line></svg>
                                    </button>

                                </div>

                            ))}
                        </div>

                    </div>
                </div>

                {/* Role Section */}
                <div className="mt-10">
                    {/* ROLES */}

                    <div className="bg-white rounded-3xl border border-black/5 shadow-sm">

                        <div className="p-6 border-b border-black/5 flex justify-between">

                            <h3 className="font-black text-sm uppercase">
                                Access Roles
                            </h3>

                        </div>

                        {/* <div className="space-y-6 max-h-[600px] overflow-y-auto pr-2">

                            {Object.entries(PERMISSION_GROUPS).map(([module, actions]) => (

                                <div key={module} className="border border-black/5 rounded-xl p-4">

                                    <p className="text-xs font-black uppercase mb-3 text-slate-500">
                                        {module}
                                    </p>

                                    <div className="grid grid-cols-2 gap-3 text-sm">

                                        {actions.map((action) => {

                                            const permission = `${module}_${action}`

                                            return (

                                                <label key={permission} className="flex items-center gap-2">

                                                    <input
                                                        type="checkbox"
                                                        checked={permissions.includes(permission)}
                                                        onChange={() => togglePermission(permission)}
                                                    />

                                                    {action}

                                                </label>

                                            )

                                        })}

                                    </div>

                                </div>

                            ))}

                        </div> */}
                        <div className="p-6 space-y-6">

                            {/* <select
                                value={selectedRoleId}
                                onChange={(e) => {

                                    const role = roles.find(r => r.id === e.target.value)

                                    if (role) selectRole(role)

                                }}
                                className="w-full border border-black/10 rounded-xl p-3"
                            >
                                <option value="">Select Role</option>

                                {roles.map((role: any) => (
                                    <option key={role.id} value={role.id}>
                                        {role.name}
                                    </option>
                                ))}

                            </select> */}

                            {/* <select
                                value={selectedRoleId}
                                onChange={(e) => {

                                    const role = roles.find((r) => r.id === e.target.value)

                                    if (role) selectRole(role)

                                }}
                                className="w-full border border-black/10 rounded-xl p-3"
                            >
                                <option value="">Select Role</option>

                                {roles.map((role) => (
                                    <option key={role.id} value={role.id}>
                                        {role.name}
                                    </option>
                                ))}
                            </select> */}

                            <div className="flex flex-wrap gap-2">

                                {roles.map((role) => (

                                    <button
                                        key={role.id}
                                        onClick={() => selectRole(role)}
                                        className={`px-4 py-2 rounded-xl text-xs font-bold uppercase border transition
      ${selectedRoleId === role.id
                                                ? "bg-slate-900 text-white border-slate-900"
                                                : "bg-white text-slate-700 border-black/10 hover:bg-slate-100"
                                            }`}
                                    >
                                        {role.name}
                                    </button>

                                ))}

                            </div>


                            <div className="grid md:grid-cols-3 gap-6">

                                {Object.entries(groupedPermissions).map(([module, actions]) => {

                                    const modulePermissions = allPermissions.filter(
                                        (p) => p.name.startsWith(module)
                                    )

                                    return (

                                        <div key={module} className="border border-black/5 rounded-xl p-4">

                                            <p className="text-xs font-black uppercase mb-4 text-slate-500">
                                                {module}
                                            </p>

                                            <div className="space-y-2">

                                                {modulePermissions.map((perm: any) => (

                                                    <label key={perm.id} className="flex items-center gap-2 text-sm">

                                                        {/* <input
                                                            type="checkbox"
                                                            checked={selectedPermissions.includes(perm.id)}
                                                            onChange={() => togglePermission(perm.id)}
                                                        /> */}
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedPermissions.includes(perm.id)}
                                                            onChange={() => togglePermission(perm.id)}
                                                        />

                                                        {perm.name.replace(module + "_", "")}

                                                    </label>

                                                ))}

                                            </div>

                                        </div>

                                    )

                                })}

                            </div>


                            <button
                                onClick={saveRolePermissions}
                                className="bg-red-600 text-white px-6 py-3 rounded-xl text-xs font-black uppercase"
                            >
                                Save Permissions
                            </button>

                        </div>
                    </div>
                </div>
            </div>

            {entityModalOpen && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-[100] flex items-center justify-center p-4 overflow-y-auto text-left font-black">
                    <div className="bg-white w-full max-w-xl rounded-3xl shadow-3xl overflow-hidden animate-in zoom-in-95 duration-300 border border-slate-100 text-left text-slate-900 font-bold font-black">

                        <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/30 text-left font-black text-slate-900">
                            <h2 className="text-lg font-bold uppercase tracking-tight text-left text-slate-900 font-black">
                                company
                            </h2>

                            <button onClick={() => setEntityModalOpen(false)} className="w-8 h-8 rounded-lg bg-white border border-slate-100 flex items-center justify-center text-slate-400 hover:text-red-600 transition-all shadow-sm font-bold font-black">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="16"
                                    height="16"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
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

                        <div className="p-8 space-y-6 text-left text-slate-800 font-black">
                            <form onSubmit={handleCreateEntity} className="space-y-6 text-left text-slate-800 font-black">
                                <div className="flex flex-col gap-2 w-full text-left font-semibold">
                                    <label className="text-xs text-slate-500 ml-1 uppercase tracking-wider font-bold">
                                        Strategic Entity Identity
                                    </label>

                                    <input
                                        className="bg-slate-50 border border-slate-100 rounded-xl py-4 px-5 text-sm font-medium focus:ring-2 focus:ring-red-100 outline-none transition-all placeholder:text-slate-300 text-slate-900"
                                        name="entityIdentity"
                                        placeholder="e.g. D-Degree Real Estate"
                                        required
                                        value={entityName}
                                        onChange={(e) => setEntityName(e.target.value)}
                                    />
                                </div>

                                <div className="flex flex-col gap-2 w-full text-left font-semibold">
                                    <label className="text-xs text-slate-500 ml-1 uppercase tracking-wider font-bold">
                                        Strategic Deployment Narrative
                                    </label>

                                    <input
                                        className="bg-slate-50 border border-slate-100 rounded-xl py-4 px-5 text-sm font-medium focus:ring-2 focus:ring-red-100 outline-none transition-all placeholder:text-slate-300 text-slate-900"
                                        name="strategicNarrative"
                                        placeholder="Provide justification..."
                                        required
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                    />
                                </div>

                                <div className="flex flex-col gap-2 text-left">
                                    <label className="text-xs font-semibold text-slate-500 ml-1 uppercase tracking-wider">
                                        Industrial Sector
                                    </label>

                                    <select
                                        name="sector"
                                        value={industrialSector}
                                        onChange={(e) => setIndustrialSector(e.target.value)}
                                        className="bg-slate-50 border border-slate-100 rounded-xl py-4 px-5 text-sm font-bold outline-none text-slate-700"
                                    >
                                        <option value="">Select Sector</option>
                                        <option value="technology">Technology</option>
                                        <option value="real_estate">Real Estate</option>
                                        <option value="logistics">Logistics</option>
                                        <option value="education">Education</option>
                                        <option value="media">Media</option>
                                    </select>
                                </div>

                                <button
                                    type="submit"
                                    disabled={creating}
                                    className="w-full bg-red-600 text-white py-4 rounded-xl font-bold uppercase tracking-widest text-sm mt-4 disabled:opacity-60"
                                >
                                    {creating ? "Deploying..." : "Deploy Portfolio"}
                                </button>
                            </form>
                        </div>

                    </div>
                </div>
            )}

            {personnelModalOpen && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-[100] flex items-center justify-center p-4 overflow-y-auto text-left font-black">
                    <div className="bg-white w-full max-w-xl rounded-3xl shadow-3xl overflow-hidden animate-in zoom-in-95 duration-300 border border-slate-100 text-slate-900 font-bold font-black">

                        {/* Header */}
                        <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/30 text-slate-900">
                            <h2 className="text-lg font-bold uppercase tracking-tight">
                                personnel
                            </h2>

                            <button onClick={() => setPersonnelModalOpen(false)} className="w-8 h-8 rounded-lg bg-white border border-slate-100 flex items-center justify-center text-slate-400 hover:text-red-600 transition-all shadow-sm">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="16"
                                    height="16"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="lucide lucide-x"
                                    aria-hidden="true"
                                >
                                    <path d="M18 6 6 18" />
                                    <path d="m6 6 12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Body */}
                        <div className="p-8 space-y-6 text-slate-800">
                            <form onSubmit={handleCreatePersonnel} className="space-y-4 text-slate-700 font-bold">

                                {/* Name */}
                                <div className="flex flex-col gap-2 w-full font-semibold">
                                    <label className="text-xs text-slate-500 ml-1 uppercase tracking-wider">
                                        Full Executive Name
                                    </label>
                                    <input
                                        className="bg-slate-50 border border-slate-100 rounded-xl py-4 px-5 text-sm font-medium focus:ring-2 focus:ring-red-100 outline-none transition-all placeholder:text-slate-300 text-slate-900"
                                        name="name"
                                        placeholder="e.g. John Doe"
                                        required
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                    />
                                </div>

                                {/* Title */}
                                <div className="flex flex-col gap-2 w-full font-semibold">
                                    <label className="text-xs text-slate-500 ml-1 uppercase tracking-wider">
                                        Designated Title
                                    </label>
                                    <input
                                        className="bg-slate-50 border border-slate-100 rounded-xl py-4 px-5 text-sm font-medium focus:ring-2 focus:ring-red-100 outline-none transition-all placeholder:text-slate-300 text-slate-900"
                                        name="title"
                                        placeholder="e.g. Operations Manager"
                                        required
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                    />
                                </div>

                                {/* Tier */}
                                <div className="flex flex-col gap-2">
                                    <label className="text-xs font-semibold text-slate-500 ml-1 uppercase tracking-wider">
                                        Tier Access Level
                                    </label>
                                    <select
                                        value={roleId || ""}
                                        onChange={(e) => setRoleId(e.target.value)}
                                        className="bg-slate-50 border border-slate-100 rounded-xl py-4 px-5 text-sm font-bold outline-none"
                                    >
                                        <option value="">Select Role</option>

                                        {roles.map((role) => (
                                            <option key={role.id} value={role.id}>
                                                {role.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Portfolio */}
                                <div className="flex flex-col gap-2">
                                    <label className="text-xs font-semibold text-slate-500 ml-1 uppercase tracking-wider">
                                        Strategic Portfolio Assignment
                                    </label>
                                    <select
                                        value={subsidiaryId || ""}
                                        onChange={(e) => setSubsidiaryId(e.target.value)}
                                        className="bg-slate-50 border border-slate-100 rounded-xl py-4 px-5 text-sm font-bold outline-none"
                                    >
                                        <option value="">Select Portfolio</option>

                                        {subsidiaries.map((sub) => (
                                            <option key={sub.id} value={sub.id}>
                                                {sub.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Token Section */}
                                <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
                                    <label className="text-xs font-semibold text-slate-500 ml-1 uppercase tracking-wider">
                                        Strategic Token Configuration
                                    </label>

                                    <div className="flex gap-4 mt-4">
                                        <div className="flex flex-col gap-2 w-full font-semibold">
                                            <label className="text-xs text-slate-500 ml-1 uppercase tracking-wider">
                                                Authorization Token
                                            </label>
                                            <input
                                                className="bg-slate-50 border border-slate-100 rounded-xl py-4 px-5 text-sm font-medium focus:ring-2 focus:ring-red-100 outline-none transition-all placeholder:text-slate-300 text-slate-900"
                                                name="password"
                                                placeholder="Set Credential"
                                                required
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                            />
                                        </div>

                                        <button onClick={generatePassword}
                                            type="button"
                                            className="px-4 py-2 bg-slate-200 rounded-xl hover:bg-slate-300 transition-all font-bold text-[10px] uppercase"
                                        >
                                            Generate
                                        </button>
                                    </div>

                                    <p className="text-[9px] font-bold text-red-500 uppercase mt-4 flex items-center gap-2">
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            width="14"
                                            height="14"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            className="lucide lucide-shield-ellipsis"
                                        >
                                            <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
                                            <path d="M8 12h.01" />
                                            <path d="M12 12h.01" />
                                            <path d="M16 12h.01" />
                                        </svg>
                                        All provisioned credentials undergo strategic mock encryption.
                                    </p>
                                </div>

                                {/* Submit */}
                                <button
                                    type="submit"
                                    disabled={creatingPersonnel}
                                    className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold uppercase tracking-widest text-sm mt-4 flex items-center justify-center gap-2"
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="16"
                                        height="16"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        className="lucide lucide-shield-check"
                                    >
                                        <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
                                        <path d="m9 12 2 2 4-4" />
                                    </svg>
                                    {creatingPersonnel ? "Finalizing..." : "Finalize Authorization"}
                                </button>

                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* ROLE MODAL */}

            {
                roleModalOpen && (

                    <div className="fixed inset-0 bg-black/40 flex items-center justify-center">

                        <div className="bg-white p-8 rounded-3xl w-[450px] border border-black/5">
                            {/* Header */}
                            <div className="border-b border-slate-50 flex justify-between items-center bg-slate-50/30 text-slate-900">
                                <h2 className="font-black text-lg mb-6">
                                    Create Role
                                </h2>

                                <button onClick={() => setRoleModalOpen(false)} className="w-8 h-8 rounded-lg bg-white border border-slate-100 flex items-center justify-center text-slate-400 hover:text-red-600 transition-all shadow-sm">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="16"
                                        height="16"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        className="lucide lucide-x"
                                        aria-hidden="true"
                                    >
                                        <path d="M18 6 6 18" />
                                        <path d="m6 6 12 12" />
                                    </svg>
                                </button>
                            </div>

                            <form onSubmit={createRole} className="space-y-6">

                                <input
                                    className="w-full border border-black/10 rounded-xl p-4"
                                    placeholder="Role Name"
                                    value={roleName}
                                    onChange={(e) => setRoleName(e.target.value)}
                                />

                                <button disabled={creatingRole} className="w-full bg-red-600 text-white py-4 rounded-xl font-bold uppercase text-sm">
                                    {creatingRole ? 'Creating...' : 'Create Role'}
                                </button>
                            </form>
                        </div>
                    </div>
                )
            }
        </div>
    )
}

export default Settings