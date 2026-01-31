import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"
import { getToken } from "next-auth/jwt"

export default withAuth(
  async function middleware(req) {
    // Para rotas admin, verificar se o usuário tem permissão
    if (req.nextUrl.pathname.startsWith("/admin")) {
      const token = await getToken({ req })
      
      if (!token) {
        return NextResponse.redirect(new URL('/auth/signin', req.url))
      }

      // Aqui você pode fazer uma verificação adicional se necessário
      // A verificação específica por barbearia será feita em cada página
    }
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Apenas usuários autenticados podem acessar rotas admin
        if (req.nextUrl.pathname.startsWith("/admin")) {
          return !!token
        }
        return true
      },
    },
  }
)

export const config = {
  matcher: ["/admin/:path*"]
}