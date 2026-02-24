// import { PrismaClient } from '@prisma/client'

// const globalForPrisma = global as unknown as { prisma: PrismaClient }

// export const prisma =
//   globalForPrisma.prisma ||
//   new PrismaClient({
//     log: ['query'],
//   })

// if (process.env.NODE_ENV !== 'production')
//   globalForPrisma.prisma = prisma

// import { PrismaClient } from '@prisma/client'

// const globalForPrisma = global as unknown as { prisma: PrismaClient }

// export const prisma =
//   globalForPrisma.prisma ||
//   new PrismaClient()

// if (process.env.NODE_ENV !== 'production')
//   globalForPrisma.prisma = prisma

// import { PrismaClient } from '@prisma/client'
// import { NeonHTTPAdapter } from '@prisma/adapter-neon'

// const adapter = new NeonHTTPAdapter({
//     connectionString: process.env.DATABASE_URL!,
// })

// const globalForPrisma = global as unknown as { prisma: PrismaClient }

// export const prisma =
//     globalForPrisma.prisma ||
//     new PrismaClient({
//         adapter,
//     })

// if (process.env.NODE_ENV !== 'production')
//     globalForPrisma.prisma = prisma


import { PrismaClient } from '@prisma/client'
import { PrismaNeon } from '@prisma/adapter-neon'
import { neon } from '@neondatabase/serverless'

const connectionString = process.env.DATABASE_URL!

const sql = neon(connectionString)
const adapter = new PrismaNeon({
    connectionString,
})

const globalForPrisma = global as unknown as { prisma: PrismaClient }

export const prisma =
    globalForPrisma.prisma ??
    new PrismaClient({
        adapter,
    })

if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prisma
}