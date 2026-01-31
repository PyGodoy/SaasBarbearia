"use server"

import { db } from "@/src/app/_lib/prisma"
import { revalidatePath } from "next/cache"

export async function createService(data: {
  name: string
  description: string
  price: number
  maxClients: number
  barbershopId: string
}) {
  // Usar uma imagem padrão ou permitir upload depois
  const imageUrl = "/service-placeholder.jpg"
  
  return await db.barbershopService.create({
    data: {
      ...data,
      imageUrl,
    }
  })
}

export async function updateService(serviceId: string, data: {
  name: string
  description: string
  price: number
  maxClients: number
}) {
  const service = await db.barbershopService.update({
    where: { id: serviceId },
    data
  })

  revalidatePath(`/admin/barbershops/${service.barbershopId}/services`)
  return service
}

export async function deleteService(serviceId: string) {
  const service = await db.barbershopService.findUnique({
    where: { id: serviceId }
  })

  if (!service) {
    throw new Error("Serviço não encontrado")
  }

  // Verificar se há agendamentos futuros para este serviço
  const futureBookings = await db.booking.count({
    where: {
      serviceId,
      date: {
        gte: new Date()
      }
    }
  })

  if (futureBookings > 0) {
    throw new Error("Não é possível excluir um serviço com agendamentos futuros")
  }

  await db.barbershopService.delete({
    where: { id: serviceId }
  })

  revalidatePath(`/admin/barbershops/${service.barbershopId}/services`)
}