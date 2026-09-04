import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Handle /app/* protected route boundaries
  if (pathname.startsWith('/app')) {
    const response = NextResponse.next()
    
    // Prevent client and proxy caching of sensitive workspace data
    response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0")
    response.headers.set("Pragma", "no-cache")
    response.headers.set("Expires", "0")
    
    return response
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/app/:path*",
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
}
