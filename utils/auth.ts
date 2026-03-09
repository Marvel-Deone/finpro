export const getRole = () => {
  if (typeof window === "undefined") return ""
  return localStorage.getItem("role") || ""
}

export const getPermissions = (): string[] => {
  if (typeof window === "undefined") return []
  const perms = localStorage.getItem("permissions")
  return perms ? JSON.parse(perms) : []
}

export const hasPermission = (perm: string) => {
  const permissions = getPermissions()
  return permissions.includes(perm)
}

export const hasRole = (roles: string[]) => {
  const role = getRole()
  return roles.includes(role)
}