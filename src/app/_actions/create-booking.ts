// app/_actions/create-booking.ts
"use server"

import { revalidatePath } from "next/cache"
import { db } from "../_lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "../_lib/auth"

interface CreateBookingParams {
  serviceIds: string[] // Mudar para array de IDs
  date: Date
  barbershopId: string // Adicionar barbershopId
}

export const createBooking = async (params: CreateBookingParams) => {
  const user = await getServerSession(authOptions)
  if (!user) {
    throw new Error("Usuário não autenticado")
  }

  // Buscar serviços selecionados
  const services = await db.barbershopService.findMany({
    where: {
      id: {
        in: params.serviceIds
      }
    }
  })

  if (services.length === 0) {
    throw new Error("Nenhum serviço selecionado")
  }

  // Calcular preço total
  const totalPrice = services.reduce((total, service) => {
    return total + Number(service.price)
  }, 0)

  // Criar booking com múltiplos serviços
  await db.booking.create({
    data: {
      userId: (user.user as any).id,
      barbershopId: params.barbershopId,
      date: params.date,
      totalPrice,
      bookingServices: {
        create: services.map(service => ({
          serviceId: service.id,
          price: service.price
        }))
      }
    }
  })

  revalidatePath("/barbershops/[id]")
  revalidatePath("/bookings")
}