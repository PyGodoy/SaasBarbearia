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
      service: {
        include: {
          barbershop: true,
        },
      },
    },
    orderBy: {
      date: "asc",
    },
  })
}