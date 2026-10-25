import { NextResponse } from "next/server";
export async function GET() {
  return NextResponse.json(
    {
      status: "ok",
      mode:
        process.env.NEXT_PUBLIC_SUPABASE_URL &&
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
          ? "connected"
          : "demo",
      imageSuggestions: process.env.GEMINI_API_KEY ? "enabled" : "manual",
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
