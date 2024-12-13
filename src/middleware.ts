import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.SECRET });

  const { pathname } = req.nextUrl;

  // Allow requests to public routes (e.g., /auth/signin) or if a token exists
  if (pathname.startsWith("/auth")) {
    return NextResponse.next();
  }

  // Redirect to sign-in page if no token exists
  if (!token) {
    const url = req.nextUrl.clone();
    url.pathname = "/auth/signin";
    return NextResponse.redirect(url);
  } else {
    return NextResponse.next();
  }
}

export const config = {
  matcher: ["/"],
};
