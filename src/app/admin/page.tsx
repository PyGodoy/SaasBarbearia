import { getServerSession } from "next-auth"
import { authOptions } from "../_lib/auth"
import { redirect } from "next/navigation"
import { getCurrentUserAdminBarbershops, canUserAccessAdmin } from "../_lib/auth-utils"
import Header from "../_components/header"
import { Card, CardContent, CardHeader, CardTitle } from "../_components/ui/card"
import { Button } from "../_components/ui/button"
import Link from "next/link"
import { MapPin, Scissors, Users } from "lucide-react"

const AdminPage = async () => {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    redirect("/auth/signin?callbackUrl=/admin")
  }

  // Verificar se o usuário tem acesso ao admin
  const canAccessAdmin = await canUserAccessAdmin(session.user.id)
  
  if (!canAccessAdmin) {
    return (
      <div>
        <Header />
        <div className="p-5 text-center">
          <h1 className="text-2xl font-bold mb-4">Acesso Negado</h1>
          <p className="text-gray-600 mb-4">
            Você não tem permissão para acessar o painel administrativo.
          </p>
          <p className="text-sm text-gray-500 mb-4">
            Entre em contato com o suporte se você é um administrador de barbearia.
          </p>
          <Button asChild>
            <Link href="/">
              Voltar para a página inicial
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  const userBarbershops = await getCurrentUserAdminBarbershops()

  if (userBarbershops.length === 0) {
    return (
      <div>
        <Header />
        <div className="p-5 text-center">
          <h1 className="text-2xl font-bold mb-4">Painel Administrativo</h1>
          <p className="text-gray-600 mb-4">
            Você não está vinculado a nenhuma barbearia como administrador.
          </p>
          <Button asChild>
            <Link href="/">
              Voltar para a página inicial
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <Header />
      
      <div className="p-5">
        <h1 className="text-2xl font-bold mb-6">Minhas Barbearias</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {userBarbershops.map(({ barbershop, role }) => (
            <Card key={barbershop.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  {barbershop.name}
                  <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded-full">
                    {role}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin className="h-4 w-4" />
                  <span>{barbershop.address}</span>
                </div>
                
                <div className="flex justify-between text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <Scissors className="h-3 w-3" />
                    <span>Serviços: {barbershop._count?.services || 0}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    <span>Admins: {barbershop._count?.admins || 0}</span>
                  </div>
                </div>
                
                <Button asChild className="w-full">
                  <Link href={`/admin/barbershops/${barbershop.id}`}>
                    Gerenciar Barbearia
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}

export default AdminPage