import { getServerSession } from "next-auth"
import { authOptions } from "@/src/app/_lib/auth"
import { notFound, redirect } from "next/navigation"
import { isUserAdminOfBarbershop } from "@/src/app/_lib/auth-utils"
import { db } from "@/src/app/_lib/prisma"
import Header from "@/src/app/_components/header"
import { Button } from "@/src/app/_components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/src/app/_components/ui/card"
import { ArrowLeft, Users, Scissors, Building, Phone, MapPin, FileText } from "lucide-react"
import Link from "next/link"
import BarbershopSettingsForm from "../_components/barbershop-settings-form"
import BarbershopEditForm from "../_components/barbershop-edit-form"


interface SettingsPageProps {
  params: {
    id: string
  }
}

const SettingsPage = async ({ params }: SettingsPageProps) => {
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
      services: true,
      _count: {
        select: {
          bookings: {
            where: {
              date: {
                gte: new Date()
              }
            }
          }
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
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" asChild>
              <Link href={`/admin/barbershops/${params.id}`}>
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Configurações</h1>
              <p className="text-gray-600">{barbershop.name}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Coluna 1: Informações da Barbearia */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  Informações da Barbearia
                </CardTitle>
              </CardHeader>
              <CardContent>
                <BarbershopEditForm barbershop={barbershop} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Capacidade de Atendimento
                </CardTitle>
              </CardHeader>
              <CardContent>
                <BarbershopSettingsForm barbershop={barbershop} />
              </CardContent>
            </Card>
          </div>

          {/* Coluna 2: Estatísticas */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Scissors className="h-5 w-5" />
                  Estatísticas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Serviços cadastrados:</span>
                  <span className="font-bold">{barbershop.services.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Agendamentos futuros:</span>
                  <span className="font-bold">{barbershop._count.bookings}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Capacidade atual:</span>
                  <span className="font-bold text-right">{barbershop.maxClientsPerSlot} cliente(s) por horário</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Barbeiros:</span>
                  <span className="font-bold">{barbershop.barbersCount}</span>
                </div>
              </CardContent>
            </Card>

            {/* Informações de Contato */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="h-5 w-5" />
                  Contato
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-gray-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Endereço</p>
                    <p className="text-sm text-gray-600">{barbershop.address}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-2">
                  <Phone className="h-4 w-4 text-gray-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Telefones</p>
                    <div className="text-sm text-gray-600">
                      {barbershop.phones.map((phone, index) => (
                        <p key={index}>{phone}</p>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-start gap-2">
                  <FileText className="h-4 w-4 text-gray-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Descrição</p>
                    <p className="text-sm text-gray-600 line-clamp-3">{barbershop.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SettingsPage