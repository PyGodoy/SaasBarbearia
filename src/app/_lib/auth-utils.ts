import { db } from "./prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "./auth"
import { UserRole } from "@prisma/client"

export async function getUserRole(userId: string): Promise<UserRole> {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { role: true }
  })
  
  return user?.role || UserRole.CLIENT
}

export async function getAdminBarbershops(userId: string) {
  return await db.barbershopAdmin.findMany({
    where: { userId },
    include: { 
      barbershop: {
        include: {
          services: true,
          _count: {
            select: {
              services: true,
              admins: true
            }
          }
        }
      }
    }
  })
}

export async function isUserAdminOfBarbershop(userId: string, barbershopId: string) {
  const admin = await db.barbershopAdmin.findFirst({
    where: {
      userId,
      barbershopId
    }
  })
  
  return !!admin
}

export async function getCurrentUserAdminBarbershops() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    return []
  }
  
  // Verificar se o usuário tem role de admin
  const userRole = await getUserRole(session.user.id)
  if (userRole !== UserRole.BARBERSHOP_ADMIN && userRole !== UserRole.SUPER_ADMIN) {
    return []
  }
  
  return await getAdminBarbershops(session.user.id)
}

export async function canUserAccessAdmin(userId: string): Promise<boolean> {
  const userRole = await getUserRole(userId)
  return userRole === UserRole.BARBERSHOP_ADMIN || userRole === UserRole.SUPER_ADMIN
}

// Função auxiliar para obter o usuário atual de forma segura
export async function getCurrentUser() {
  const session = await getServerSession(authOptions)
  return session?.user || null
}