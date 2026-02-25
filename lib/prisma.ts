// // import { PrismaClient } from '@prisma/client'
// // import { PrismaNeon } from '@prisma/adapter-neon'
// // import { neon } from '@neondatabase/serverless'

// // const connectionString = process.env.DATABASE_URL!

// // const sql = neon(connectionString)
// // const adapter = new PrismaNeon({
// //     connectionString,
// // })

// // const globalForPrisma = global as unknown as { prisma: PrismaClient }

// // export const prisma =
// //     globalForPrisma.prisma ??
// //     new PrismaClient({
// //         adapter,
// //     })

// // if (process.env.NODE_ENV !== 'production') {
// //     globalForPrisma.prisma = prisma
// // }


// // import PrismaClientPkg from '@prisma/client' // default import in Prisma 7
// // import { PrismaNeon } from '@prisma/adapter-neon'
// // import { neon } from '@neondatabase/serverless'

// // const { PrismaClient } = PrismaClientPkg // destructure the default import

// // const connectionString = process.env.DATABASE_URL!

// // // Neon SQL client
// // const sql = neon(connectionString)

// // // Prisma Neon adapter
// // const adapter = new PrismaNeon({
// //   connectionString,
// // })

// // // Global singleton for serverless
// // const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }

// // export const prisma =
// //   globalForPrisma.prisma ??
// //   new PrismaClient({
// //     adapter,
// //   })

// // if (process.env.NODE_ENV !== 'production') {
// //   globalForPrisma.prisma = prisma
// // }


// import PrismaClientPkg from '@prisma/client' // default import in Prisma 7
// import { PrismaNeon } from '@prisma/adapter-neon'
// import { neon } from '@neondatabase/serverless'

// const { PrismaClient } = PrismaClientPkg // value

// const connectionString = process.env.DATABASE_URL!

// // Neon SQL client
// const sql = neon(connectionString)

// // Prisma Neon adapter
// const adapter = new PrismaNeon({
//   connectionString,
// })

// // Global singleton for serverless
// const globalForPrisma = globalThis as unknown as { prisma?: InstanceType<typeof PrismaClient> }

// export const prisma =
//   globalForPrisma.prisma ??
//   new PrismaClient({
//     adapter,
//   })

// if (process.env.NODE_ENV !== 'production') {
//   globalForPrisma.prisma = prisma
// }

// import { PrismaClient } from '@prisma/client'

// const connectionString = process.env.DATABASE_URL!
// if (!connectionString) throw new Error("DATABASE_URL not set")

// // Global singleton for serverless
// const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }

// export const prisma =
//   globalForPrisma.prisma ??
//   new PrismaClient()

// if (process.env.NODE_ENV !== 'production') {
//   globalForPrisma.prisma = prisma
// }

// import PrismaClientDefault from '@prisma/client'

// const connectionString = process.env.DATABASE_URL
// if (!connectionString) throw new Error("DATABASE_URL is not set")

// const globalForPrisma = globalThis as unknown as { prisma?: PrismaClientDefault }

// export const prisma =
//   globalForPrisma.prisma ??
//   new PrismaClientDefault({
//     datasources: { db: { url: connectionString } },
//   })

// if (process.env.NODE_ENV !== 'production') {
//   globalForPrisma.prisma = prisma
// }


// import { PrismaClient } from '@prisma/client'

// const connectionString = process.env.DATABASE_URL
// if (!connectionString) throw new Error("DATABASE_URL is not set")

// // Global singleton for serverless
// const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }

// export const prisma =
//   globalForPrisma.prisma ??
//   new PrismaClient({
//     datasources: { db: { url: connectionString } },
//   })

// if (process.env.NODE_ENV !== 'production') {
//   globalForPrisma.prisma = prisma
// }

// import { PrismaClient } from '@prisma/client'

// if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL environment variable is not set")

// // Global singleton for serverless
// const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }

// export const prisma =
//   globalForPrisma.prisma ?? new PrismaClient()

// if (process.env.NODE_ENV !== 'production') {
//   globalForPrisma.prisma = prisma
// }

// import { PrismaClient } from '@prisma/client'

// // Singleton for serverless
// const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }

// export const prisma =
//     globalForPrisma.prisma ?? new PrismaClient()

// if (process.env.NODE_ENV !== 'production') {
//     globalForPrisma.prisma = prisma
// }
// console.log("DATABASE_URL is set?", !!process.env.DATABASE_URL)

// import { PrismaClient } from '@prisma/client'

// if (!process.env.DATABASE_URL) {
//   throw new Error("DATABASE_URL environment variable is not set")
// }

// // Singleton for serverless
// const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }

// export const prisma =
//   globalForPrisma.prisma ?? new PrismaClient()

// if (process.env.NODE_ENV !== 'production') {
//   globalForPrisma.prisma = prisma
// }

// lib/prisma.ts
// import { PrismaClient } from '@prisma/client'

// declare global {
//   // allow global prisma in dev to persist across hot reloads
//   // eslint-disable-next-line no-var
//   var prisma: PrismaClient | undefined
// }

// let prisma: PrismaClient

// if (process.env.NODE_ENV === 'production') {
//   // In production, just create a new client
//   if (!process.env.DATABASE_URL) {
//     throw new Error("DATABASE_URL environment variable is not set")
//   }
//   prisma = new PrismaClient()
// } else {
//   // In development, use a global variable to preserve across hot reloads
//   if (!global.prisma) {
//     if (!process.env.DATABASE_URL) {
//       throw new Error("DATABASE_URL environment variable is not set")
//     }
//     global.prisma = new PrismaClient()
//   }
//   prisma = global.prisma
// }

// export { prisma }

// lib/prisma.ts
// import { PrismaClient } from '@prisma/client'
// import { neon } from '@neondatabase/serverless'

// if (!process.env.DATABASE_URL) {
//   throw new Error("DATABASE_URL environment variable is not set")
// }

// export const sql = neon(process.env.DATABASE_URL)

// // Lazy singleton for Prisma client
// declare global {
//   // allow global prisma in dev to persist across hot reloads
//   // eslint-disable-next-line no-var
//   var prisma: PrismaClient | undefined
// }

// export const prisma: PrismaClient =
//   global.prisma ??
//   new PrismaClient()

// if (process.env.NODE_ENV !== 'production') {
//   global.prisma = prisma
// }

// lib/prisma.ts
import PrismaClientDefault from '@prisma/client'
import { neon } from '@neondatabase/serverless'

// Default import is already the class
const PrismaClient = PrismaClientDefault as any

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set")
}

// Raw SQL client for Neon (optional)
export const sql = neon(process.env.DATABASE_URL)

// Lazy singleton for Prisma (prevents multiple connections in dev / serverless)
declare global {
  // eslint-disable-next-line no-var
  var prisma: any
}

export const prisma: any =
  global.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma
}