// app/api/admin/logout/route.js
import { NextResponse } from "next/server";

export async function GET(request) {
  const redirectURL = new URL("/auth/login", request.url);

  const response = NextResponse.redirect(redirectURL);

  response.cookies.set("adminToken", "", {
    expires: new Date(0),
    path: "/",
  });

  return response;
}
