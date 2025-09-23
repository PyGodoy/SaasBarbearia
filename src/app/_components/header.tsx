import Image from "next/image"
import { Card, CardContent } from "./ui/card"
import { Button } from "./ui/button"
import { MenuIcon } from "lucide-react"
import { Sheet, SheetTrigger } from "./ui/sheet"
import SidebarSheet from "./sidebar-sheet"
import Link from "next/link"
import { getCurrentUser, canUserAccessAdmin } from "../_lib/auth-utils"

const Header = async () => {
  const user = await getCurrentUser()
  const showAdminLink = user ? await canUserAccessAdmin(user.id) : false

  return (
    <Card>
      <CardContent className="flex flex-row items-center justify-between p-5">
        <Link href="/">
          <Image alt="FSW Barber" src="/logo.png" height={18} width={120} />
        </Link>

        <div className="flex items-center gap-4">
          {/* Link para o Painel Admin (apenas para administradores) - Versão Desktop */}
          {showAdminLink && (
            <Link
              href="/admin"
              className="hidden text-sm text-gray-600 transition-colors hover:text-gray-900 md:block"
            >
              Painel Admin
            </Link>
          )}

          {/* Menu Mobile */}
          <Sheet>
            <SheetTrigger asChild>
              <Button size="icon" variant="outline">
                <MenuIcon />
              </Button>
            </SheetTrigger>
            <SidebarSheet showAdminLink={showAdminLink} />
          </Sheet>
        </div>
      </CardContent>
    </Card>
  )
}

export default Header
