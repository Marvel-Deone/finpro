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

import { PrismaClient } from '@prisma/client'

const connectionString = process.env.DATABASE_URL!
if (!connectionString) throw new Error("DATABASE_URL not set")

// Global singleton for serverless
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}