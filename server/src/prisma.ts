import dotenv from 'dotenv'
import { PrismaClient } from './generated'

dotenv.config()

const prisma = new PrismaClient()

export default prisma