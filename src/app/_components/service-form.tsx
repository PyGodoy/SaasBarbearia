"use client"

import { useState } from "react"
import { Button } from "@/src/app/_components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/src/app/_components/ui/dialog"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/src/app/_components/ui/form"
import { Input } from "@/src/app/_components/ui/input"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { BarbershopService } from "@prisma/client"
import { createService, updateService, deleteService } from "../admin/barbershops/[id]/_actions/services"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { Textarea } from "@/src/app/_components/ui/textarea"
import Image from "next/image"
import { Trash2, Upload, Camera } from "lucide-react"

const serviceSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  description: z.string().min(1, "Descrição é obrigatória"),
  price: z.string().min(1, "Preço é obrigatório"),
  maxClients: z.number().min(1, "Mínimo 1 cliente").max(10, "Máximo 10 clientes"),
  imageUrl: z.string().min(1, "Imagem é obrigatória"),
})

type ServiceFormData = z.infer<typeof serviceSchema>

interface ServiceFormProps {
  barbershopId: string
  service?: BarbershopService
  mode: "create" | "edit" | "delete"
  trigger: React.ReactNode
}

const ServiceForm = ({ barbershopId, service, mode, trigger }: ServiceFormProps) => {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(service?.imageUrl || null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const router = useRouter()

  const form = useForm<ServiceFormData>({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      name: service?.name || "",
      description: service?.description || "",
      price: service?.price.toString() || "",
      maxClients: (service as any)?.maxClients || 1,
      imageUrl: service?.imageUrl || "/service-placeholder.jpg",
    },
  })

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Verificar se é imagem
      if (!file.type.startsWith('image/')) {
        toast.error("Por favor, selecione uma imagem")
        return
      }

      // Verificar tamanho (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("A imagem deve ter no máximo 5MB")
        return
      }

      setSelectedFile(file)
      
      // Criar preview
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
        form.setValue("imageUrl", e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeImage = () => {
    setSelectedFile(null)
    setImagePreview(null)
    form.setValue("imageUrl", "/service-placeholder.jpg")
  }

  const uploadImage = async (file: File): Promise<string> => {
    const formData = new FormData()
    formData.append('image', file)

    try {
      const response = await fetch('/api/upload-service-image', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Erro no upload')
      }

      const data = await response.json()
      return data.imageUrl
    } catch (error) {
      console.error('Erro no upload:', error)
      throw new Error('Falha no upload da imagem')
    }
  }

  const onSubmit = async (data: ServiceFormData) => {
    setLoading(true)
    
    try {
      let imageUrl = data.imageUrl

      // Se há um novo arquivo selecionado, faz o upload
      if (selectedFile) {
        imageUrl = await uploadImage(selectedFile)
      }

      const serviceData = {
        ...data,
        barbershopId,
        price: parseFloat(data.price),
        imageUrl: imageUrl,
      }

      if (mode === "create") {
        await createService(serviceData)
        toast.success("Serviço criado com sucesso!")
      } else if (mode === "edit" && service) {
        await updateService(service.id, serviceData)
        toast.success("Serviço atualizado com sucesso!")
      }
      
      setOpen(false)
      router.refresh()
    } catch (error) {
      toast.error("Erro ao salvar serviço!")
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!service) return
    
    setLoading(true)
    try {
      await deleteService(service.id)
      toast.success("Serviço excluído com sucesso!")
      setOpen(false)
      router.refresh()
    } catch (error) {
      toast.error("Erro ao excluir serviço!")
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  if (mode === "delete") {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          {trigger}
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir Serviço</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir o serviço &quot;{service?.name}&quot;? 
              Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={loading}>
              {loading ? "Excluindo..." : "Excluir"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Novo Serviço" : "Editar Serviço"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Upload de Imagem */}
            <div className="space-y-3">
              <FormLabel>Imagem do Serviço</FormLabel>
              
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                {imagePreview ? (
                  <div className="relative group">
                    <div className="relative h-48 w-full rounded-lg overflow-hidden mx-auto mb-4">
                      <Image
                        src={imagePreview}
                        alt="Preview do serviço"
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex gap-2 justify-center">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => document.getElementById('imageInput')?.click()}
                      >
                        <Camera className="h-4 w-4 mr-2" />
                        Trocar Imagem
                      </Button>
                      <Button
                        type="button"
                        variant="destructive"
                        onClick={removeImage}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Remover
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <Camera className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-sm text-gray-600 mb-4">
                      Clique para selecionar uma imagem
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById('imageInput')?.click()}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Selecionar Imagem
                    </Button>
                  </>
                )}

                <Input
                  id="imageInput"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageSelect}
                />
                
                <FormField
                  control={form.control}
                  name="imageUrl"
                  render={({ field }) => (
                    <FormItem className="hidden">
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <p className="text-xs text-gray-500 mt-2">
                  Formatos: JPG, PNG, WEBP. Máximo: 5MB
                </p>
              </div>
              <FormMessage />
            </div>

            {/* Campos do formulário */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Serviço</FormLabel>
                  <FormControl>
                    <Input placeholder="Corte de cabelo" {...field} />
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
                      placeholder="Descrição detalhada do serviço..." 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preço (R$)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number"
                        step="0.01"
                        placeholder="50.00" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="maxClients"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Clientes/Horário</FormLabel>
                    <FormControl>
                      <Input 
                        type="number"
                        min="1"
                        max="10"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                      />
                    </FormControl>
                    <FormDescription>
                      Máximo por horário
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex gap-2 justify-end pt-4">
              <Button 
                variant="outline" 
                type="button" 
                onClick={() => setOpen(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Salvando..." : mode === "create" ? "Criar" : "Salvar"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

export default ServiceForm