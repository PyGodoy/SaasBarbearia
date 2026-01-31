// app/_data/get-confirmed-bookings.ts
"use server"

import { db } from "../_lib/prisma"
import { getCurrentUser } from "../_lib/auth-utils"

export const getConfirmedBookings = async () => {
  const user = await getCurrentUser()
  if (!user) return []
  
  return db.booking.findMany({
    where: {
      userId: user.id,
      date: {
        gte: new Date(),
      },
    },
    include: {
      barbershop: true, // ← Adicionar barbershop diretamente
      bookingServices: { // ← Mudar de 'service' para 'bookingServices'
        include: {
          service: { // ← Agora service está dentro de bookingServices
            include: {
              barbershop: true,
            },
          },
        },
      },
    },
    orderBy: {
      date: "asc",
    },
  })
}