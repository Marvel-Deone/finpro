import { z } from "zod"

export const createOrgSchema = z.object({
  name: z
    .string()
    .min(2, "Organization name must be at least 2 characters")
    .max(100, "Organization name too long"),
})

export const updateOrgSchema = z.object({
  name: z
    .string()
    .min(2, "Organization name must be at least 2 characters")
    .max(100, "Organization name too long"),
})