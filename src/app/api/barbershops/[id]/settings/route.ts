import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/src/app/_lib/prisma'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    
    const updatedBarbershop = await db.barbershop.update({
      where: { id: params.id },
      data: {
        maxClientsPerSlot: body.maxClientsPerSlot,
        barbersCount: body.barbersCount,
      },
    })

    return NextResponse.json(updatedBarbershop)
  } catch (error) {
    console.error('Erro ao atualizar configurações:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}