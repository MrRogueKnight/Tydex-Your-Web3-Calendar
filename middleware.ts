import { NextRequest, NextResponse } from "next/server";
import { verify } from "jose";

export default async function middleware(req: NextRequest) {
  const authToken = req.cookies.get("auth_token");

  if (!authToken) {
    return NextResponse.next();
  }

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-secret');
    const { payload } = await verify(authToken.value, secret);
    const requestHeaders = new Headers(req.headers);
    requestHeaders.set("x-user-fid", payload.fid?.toString() || "");
    requestHeaders.set("x-user-wallet", payload.walletAddress?.toString() || "");

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  } catch (error) {
    console.error("JWT verification failed:", error);
    return NextResponse.next();
  }
}

export const config = {
  matcher: ["/api/((?!auth|webhook|health).*)"],
};
