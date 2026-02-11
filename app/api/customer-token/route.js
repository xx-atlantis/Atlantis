import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  const cookieStore = await cookies(); // ✅ IMPORTANT in Next 16
  const token = cookieStore.get("customerToken")?.value || null;

  if (!token) {
    return NextResponse.json(
      { success: false, error: "No token" },
      { status: 401 }
    );
  }

  return NextResponse.json({ success: true, token }, { status: 200 });
}
