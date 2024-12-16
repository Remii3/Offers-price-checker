import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.SECRET });

  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/auth")) {
    return NextResponse.next();
  }

  if (!token) {
    const url = req.nextUrl.clone();
    url.pathname = "/auth/signin";
    url.search = "";
    return NextResponse.redirect(url);
  } else {
    return NextResponse.next();
  }
}

export const config = {
  matcher: ["/"],
};
