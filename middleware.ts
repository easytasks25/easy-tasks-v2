import { withAuth } from "next-auth/middleware"

export default withAuth(
  function middleware(req) {
    // Zusätzliche Middleware-Logik hier
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Erlaube Zugriff auf Auth-Seiten ohne Token
        if (req.nextUrl.pathname.startsWith('/auth/')) {
          return true
        }
        
        // Erlaube Zugriff auf API-Routen ohne Token (für Registrierung)
        if (req.nextUrl.pathname.startsWith('/api/auth/register')) {
          return true
        }
        
        // Alle anderen Routen benötigen einen Token
        return !!token
      },
    },
  }
)

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (auth routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico|public).*)',
  ],
}
