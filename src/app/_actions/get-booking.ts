// get-bookings.ts (versão simplificada)
"use server"

import { endOfDay, startOfDay } from "date-fns"
import { db } from "../_lib/prisma"

interface GetBookingsProps {
  serviceId?: string
  date: Date
  barbershopId?: string
}

export const getBookings = async ({ serviceId, date }: GetBookingsProps) => {
  return await db.booking.findMany({
    where: {
      serviceId,
      date: {
        lte: endOfDay(date),
        gte: startOfDay(date),
      },
    },
  })
}