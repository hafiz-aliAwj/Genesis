import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
export async function authenticatedDb(req: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL,
    key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key)
    throw new ApiError(
      503,
      "Connected API requires Supabase. Keyless mode stores data in the browser.",
    );
  const token = req.headers.get("authorization")?.replace(/^Bearer /i, "");
  if (!token) throw new ApiError(401, "Bearer token required.");
  const db = createClient(url, key, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false },
  });
  const {
    data: { user },
    error,
  } = await db.auth.getUser(token);
  if (error || !user) throw new ApiError(401, "Invalid or expired session.");
  return db;
}
export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}
export function apiError(e: unknown) {
  if (e instanceof SyntaxError)
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  return NextResponse.json(
    {
      error:
        e instanceof ApiError ? e.message : "Request could not be completed.",
    },
    { status: e instanceof ApiError ? e.status : 500 },
  );
}
