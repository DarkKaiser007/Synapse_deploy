import { PrismaClient } from './generated'

// env is already loaded by ./env (imported first in index.ts)
const prisma = new PrismaClient()

export default prisma