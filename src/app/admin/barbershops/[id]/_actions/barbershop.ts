// app/admin/barbershops/[id]/_actions/barbershop.ts
"use server"

import { db } from "@/src/app/_lib/prisma"
import { revalidatePath } from "next/cache"

export const updateBarbershop = async (id: string, data: {
  name: string
  address: string
  description: string
  phones: string[]
}) => {
  try {
    await db.barbershop.update({
      where: { id },
      data: {
        name: data.name,
        address: data.address,
        description: data.description,
        phones: data.phones,
      },
    })

    revalidatePath(`/admin/barbershops/${id}`)
    revalidatePath(`/admin/barbershops/${id}/settings`)
    
    return { success: true }
  } catch (error) {
    console.error(error)
    return { error: "Erro ao atualizar barbearia" }
  }
}