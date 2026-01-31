"use client"

import { useState } from "react"
import { Button } from "@/src/app/_components/ui/button"
import { Input } from "@/src/app/_components/ui/input"
import { Label } from "@/src/app/_components/ui/label"
import { Card, CardContent } from "@/src/app/_components/ui/card"
import { Barbershop } from "@prisma/client"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

interface BarbershopSettingsFormProps {
  barbershop: Barbershop
}

const BarbershopSettingsForm = ({ barbershop }: BarbershopSettingsFormProps) => {
  const [maxClients, setMaxClients] = useState(barbershop.maxClientsPerSlot)
  const [barbersCount, setBarbersCount] = useState(barbershop.barbersCount)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSave = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/barbershops/${barbershop.id}/settings`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          maxClientsPerSlot: maxClients,
          barbersCount: barbersCount,
        }),
      })

      if (!response.ok) {
        throw new Error('Erro ao salvar configurações')
      }

      toast.success("Configurações salvas com sucesso!")
      router.refresh()
    } catch (error) {
      toast.error("Erro ao salvar configurações")
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="barbersCount">Número de Barbeiros</Label>
        <Input
          id="barbersCount"
          type="number"
          min="1"
          max="10"
          value={barbersCount}
          onChange={(e) => setBarbersCount(parseInt(e.target.value) || 1)}
        />
        <p className="text-sm text-gray-600">
          Quantos barbeiros trabalham simultaneamente
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="maxClients">Clientes por Horário</Label>
        <Input
          id="maxClients"
          type="number"
          min="1"
          max="10"
          value={maxClients}
          onChange={(e) => setMaxClients(parseInt(e.target.value) || 1)}
        />
        <p className="text-sm text-gray-600">
          Máximo de clientes que podem ser atendidos por horário
        </p>
      </div>

      <Card>
        <CardContent className="p-4">
          <h4 className="font-semibold mb-2">Como funciona:</h4>
          <ul className="text-sm space-y-1 text-gray-600">
            <li>• Cada horário permite até {maxClients} cliente(s)</li>
            <li>• Inclui todos os serviços da barbearia</li>
            <li>• Se {maxClients} cliente(s) já estão agendados, o horário fica indisponível</li>
          </ul>
        </CardContent>
      </Card>

      <Button onClick={handleSave} disabled={loading}>
        {loading ? "Salvando..." : "Salvar Configurações"}
      </Button>
    </div>
  )
}

export default BarbershopSettingsForm