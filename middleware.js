export function middleware(request) {
  // Your non-auth middleware logic here
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};

export const protectedRoutes = ["/universe", "/points"];
