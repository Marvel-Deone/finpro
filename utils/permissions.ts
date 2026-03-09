export const getPermissions = (): string[] => {
  if (typeof window === "undefined") return []
  const perms = localStorage.getItem("permissions")
  return perms ? JSON.parse(perms) : []
}

export const hasPermission = (permission: string): boolean => {
  const permissions = getPermissions()
  return permissions.includes(permission)
}