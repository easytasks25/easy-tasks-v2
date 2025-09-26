import { withAuth } from "next-auth/middleware"

export default withAuth(
  function middleware(req) {
    // Middleware läuft durch - Session ist gültig
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Erlaube Zugriff auf Auth-Seiten ohne Token
        if (req.nextUrl.pathname.startsWith('/auth/')) {
          return true
        }
        
        // Erlaube Zugriff auf API-Routen ohne Token
        if (req.nextUrl.pathname.startsWith('/api/')) {
          return true
        }
        
        // Alle anderen Routen benötigen einen Token
        return !!token
      },
    },
  }
)

export const config = { 
  matcher: ["/dashboard", "/organizations/:path*"] 
}
