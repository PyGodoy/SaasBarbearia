// Alternativa: Criar um componente separado para o campo de telefones
"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Barbershop } from "@prisma/client"
import { Button } from "@/src/app/_components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/src/app/_components/ui/form"
import { Input } from "@/src/app/_components/ui/input"
import { Textarea } from "@/src/app/_components/ui/textarea"
import { toast } from "sonner"

import { Loader2, Plus, Trash2 } from "lucide-react"
import { updateBarbershop } from "../_actions/barbershop"

const barbershopSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  address: z.string().min(1, "Endereço é obrigatório"),
  description: z.string().min(1, "Descrição é obrigatória"),
})

type BarbershopFormData = z.infer<typeof barbershopSchema>

interface BarbershopEditFormProps {
  barbershop: Barbershop
}

const BarbershopEditForm = ({ barbershop }: BarbershopEditFormProps) => {
  const [loading, setLoading] = useState(false)
  const [phones, setPhones] = useState<string[]>(
    barbershop.phones.length > 0 ? barbershop.phones : [""]
  )

  const form = useForm<BarbershopFormData>({
    resolver: zodResolver(barbershopSchema),
    defaultValues: {
      name: barbershop.name || "",
      address: barbershop.address || "",
      description: barbershop.description || "",
    },
  })

  const addPhone = () => {
    setPhones([...phones, ""])
  }

  const removePhone = (index: number) => {
    if (phones.length > 1) {
      setPhones(phones.filter((_, i) => i !== index))
    }
  }

  const updatePhone = (index: number, value: string) => {
    const newPhones = [...phones]
    newPhones[index] = value
    setPhones(newPhones)
  }

  const onSubmit = async (data: BarbershopFormData) => {
    setLoading(true)
    
    try {
      // Filtrar telefones vazios
      const validPhones = phones.filter(phone => phone.trim() !== "")
      
      await updateBarbershop(barbershop.id, {
        ...data,
        phones: validPhones.length > 0 ? validPhones : [""]
      })
      toast.success("Barbearia atualizada com sucesso!")
    } catch (error) {
      toast.error("Erro ao atualizar barbearia!")
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome da Barbearia</FormLabel>
              <FormControl>
                <Input placeholder="Nome da sua barbearia" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Endereço</FormLabel>
              <FormControl>
                <Input placeholder="Endereço completo" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Descreva sua barbearia..." 
                  {...field} 
                  rows={4}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-4">
          <FormLabel>Telefones</FormLabel>
          {phones.map((phone, index) => (
            <div key={index} className="flex gap-2">
              <Input 
                placeholder="(11) 99999-9999" 
                value={phone}
                onChange={(e) => updatePhone(index, e.target.value)}
              />
              {phones.length > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => removePhone(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
          
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addPhone}
          >
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Telefone
          </Button>
        </div>

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Salvando...
            </>
          ) : (
            "Salvar Alterações"
          )}
        </Button>
      </form>
    </Form>
  )
}

export default BarbershopEditForm