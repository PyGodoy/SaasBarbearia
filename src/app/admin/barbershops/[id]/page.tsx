import { getServerSession } from "next-auth"
import { authOptions } from "@/src/app/_lib/auth"
import { notFound, redirect } from "next/navigation"
import { isUserAdminOfBarbershop } from "@/src/app/_lib/auth-utils"
import { db } from "@/src/app/_lib/prisma"
import Header from "@/src/app/_components/header"
import { Button } from "@/src/app/_components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/src/app/_components/ui/card"
import { Calendar, Users, Scissors, ArrowLeft, ShieldAlert, Settings } from "lucide-react"
import Link from "next/link"

interface AdminBarbershopPageProps {
  params: {
    id: string
  }
}

const AdminBarbershopPage = async ({ params }: AdminBarbershopPageProps) => {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    redirect("/auth/signin?callbackUrl=/admin")
  }

  // Verificar se o usuário é admin desta barbearia específica
  const isAdmin = await isUserAdminOfBarbershop(session.user.id, params.id)
  
  if (!isAdmin) {
    return (
      <div>
        <Header />
        <div className="p-5 text-center">
          <ShieldAlert className="h-16 w-16 mx-auto text-red-500 mb-4" />
          <h1 className="text-2xl font-bold mb-4">Acesso Negado</h1>
          <p className="text-gray-600 mb-4">
            Você não tem permissão para acessar esta barbearia.
          </p>
          <Button asChild>
            <Link href="/admin">
              Voltar para o painel
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  // Buscar dados da barbearia
  const barbershop = await db.barbershop.findUnique({
    where: { id: params.id },
    include: {
      services: true,
      admins: {
        include: {
          user: true
        }
      }
    }
  })

  if (!barbershop) {
    notFound()
  }

  // Buscar agendamentos recentes
  const recentBookings = await db.booking.findMany({
    where: {
      bookingServices: {
        some: {
          service: {
            barbershopId: params.id
          }
        }
      },
      date: {
        gte: new Date()
      }
    },
    include: {
      user: true,
      bookingServices: {
        include: {
          service: true
        }
      }
    },
    orderBy: {
      date: 'asc'
    },
    take: 5
  })

  // Estatísticas
  const totalServices = barbershop.services.length
  const todayBookings = await db.booking.count({
    where: {
      bookingServices: {
        some: {
          service: {
            barbershopId: params.id
          }
        }
      },
      date: {
        gte: new Date(new Date().setHours(0, 0, 0, 0)),
        lt: new Date(new Date().setHours(23, 59, 59, 999))
      }
    }
  })

  return (
    <div>
      <Header />
      
      <div className="p-5">
        {/* Cabeçalho */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" asChild>
              <Link href="/admin">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold">{barbershop.name}</h1>
              <p className="text-gray-600">Painel Administrativo</p>
            </div>
          </div>
          
          {/* Botão de Configurações */}
          <Button asChild variant="outline">
            <Link href={`/admin/barbershops/${params.id}/settings`}>
              <Settings className="h-4 w-4 mr-2" />
              Configurações
            </Link>
          </Button>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Agendamentos Hoje</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{todayBookings}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Serviços</CardTitle>
              <Scissors className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalServices}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Administradores</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{barbershop.admins.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Próximos Agendamentos */}
        <Card>
          <CardHeader>
            <CardTitle>Próximos Agendamentos</CardTitle>
          </CardHeader>
          <CardContent>
            {recentBookings.length > 0 ? (
              <div className="space-y-3">
                {recentBookings.map((booking) => (
                  <div key={booking.id} className="flex justify-between items-center p-3 border rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium">{booking.user.name}</p>
                      
                      {/* Exibir todos os serviços em vez de apenas o primeiro */}
                      <div className="flex flex-wrap gap-1 mt-1">
                        {booking.bookingServices.map((bookingService, index) => (
                          <span 
                            key={bookingService.id} 
                            className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full"
                          >
                            {bookingService.service.name}
                          </span>
                        ))}
                      </div>
                      
                      <p className="text-sm text-gray-500 mt-1">
                        {new Date(booking.date).toLocaleString('pt-BR')}
                      </p>
                    </div>
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                      Confirmado
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">Nenhum agendamento para hoje.</p>
            )}
          </CardContent>
        </Card>

        {/* Ações Rápidas */}
        <div className="mt-6 flex gap-4">
          <Button asChild>
            <Link href={`/admin/barbershops/${params.id}/services`}>
              Gerenciar Serviços
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href={`/admin/barbershops/${params.id}/bookings`}>
              Ver Todos Agendamentos
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}

export default AdminBarbershopPage