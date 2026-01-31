import { getServerSession } from "next-auth"
import { authOptions } from "@/src/app/_lib/auth"
import { notFound, redirect } from "next/navigation"
import { isUserAdminOfBarbershop } from "@/src/app/_lib/auth-utils"
import { db } from "@/src/app/_lib/prisma"
import Header from "@/src/app/_components/header"
import { Button } from "@/src/app/_components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/src/app/_components/ui/card"
import { ArrowLeft, Plus, Edit, Trash2, Scissors } from "lucide-react"
import Link from "next/link"
import ServiceForm from "@/src/app/_components/service-form"


interface ServicesPageProps {
  params: {
    id: string
  }
}

const ServicesPage = async ({ params }: ServicesPageProps) => {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    redirect("/auth/signin?callbackUrl=/admin")
  }

  const isAdmin = await isUserAdminOfBarbershop(session.user.id, params.id)
  
  if (!isAdmin) {
    notFound()
  }

  const barbershop = await db.barbershop.findUnique({
    where: { id: params.id },
    include: {
      services: {
        orderBy: {
          name: 'asc'
        }
      }
    }
  })

  if (!barbershop) {
    notFound()
  }

  return (
    <div>
      <Header />
      
      <div className="p-5">
        {/* Cabeçalho */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" asChild>
              <Link href={`/admin/barbershops/${params.id}`}>
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Gerenciar Serviços</h1>
              <p className="text-gray-600">{barbershop.name}</p>
            </div>
          </div>
          
          <ServiceForm 
            barbershopId={params.id} 
            mode="create"
            trigger={
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Novo Serviço
              </Button>
            }
          />
        </div>

        {/* Lista de Serviços */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {barbershop.services.map((service) => (
            <Card key={service.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{service.name}</CardTitle>
                  <Scissors className="h-5 w-5 text-primary" />
                </div>
              </CardHeader>
              
              <CardContent className="space-y-3">
                <p className="text-sm text-gray-600 line-clamp-2">
                  {service.description}
                </p>
                
                <div className="flex justify-between items-center text-sm">
                  <span className="font-bold text-primary">
                    {Intl.NumberFormat("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    }).format(Number(service.price))}
                  </span>
                  
                  <span className="text-gray-500">
                    {service.maxClients} cliente{service.maxClients !== 1 ? 's' : ''}/horário
                  </span>
                </div>

                <div className="flex gap-2">
                  <ServiceForm 
                    barbershopId={params.id}
                    service={service}
                    mode="edit"
                    trigger={
                      <Button variant="outline" size="sm" className="flex-1">
                        <Edit className="h-3 w-3 mr-1" />
                        Editar
                      </Button>
                    }
                  />
                  
                  <ServiceForm 
                    barbershopId={params.id}
                    service={service}
                    mode="delete"
                    trigger={
                      <Button variant="destructive" size="sm" className="flex-1">
                        <Trash2 className="h-3 w-3 mr-1" />
                        Excluir
                      </Button>
                    }
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {barbershop.services.length === 0 && (
          <div className="text-center py-12">
            <Scissors className="h-16 w-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum serviço cadastrado</h3>
            <p className="text-gray-600 mb-4">
              Comece adicionando seu primeiro serviço para que os clientes possam agendar.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default ServicesPage