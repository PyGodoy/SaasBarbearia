import { db } from "../_lib/prisma"
import { getCurrentUser } from "../_lib/auth-utils"

export const getConcludedBookings = async () => {
  const user = await getCurrentUser()
  if (!user) return []
  
  return db.booking.findMany({
    where: {
      userId: user.id,
      date: {
        lt: new Date(),
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