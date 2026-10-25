import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { authenticatedDb, ApiError, apiError } from "@/lib/api";
const donation = z
  .object({
    food_name: z.string().trim().min(1).max(120),
    category: z.enum([
      "Prepared meals",
      "Bakery",
      "Produce",
      "Dairy",
      "Packaged food",
    ]),
    image_url: z
      .union([z.literal(""), z.string().url().startsWith("https://")])
      .default(""),
    quantity: z.number().int().min(1).max(10000),
    pickup_at: z.string().datetime({ offset: true }),
    expires_at: z.string().datetime({ offset: true }),
    location: z.string().trim().min(1).max(250),
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180),
    description: z.string().trim().min(1).max(2000),
  })
  .strict();
export async function GET(req: NextRequest) {
  try {
    const db = await authenticatedDb(req);
    const status = req.nextUrl.searchParams.get("status");
    const offset = Math.max(
      0,
      Number(req.nextUrl.searchParams.get("offset")) || 0,
    );
    let q = db
      .from("donations")
      .select("*")
      .order("expires_at", { ascending: true })
      .range(offset, offset + 49);
    if (status) {
      if (!["available", "reserved", "collected", "completed"].includes(status))
        throw new ApiError(400, "Invalid status.");
      q = q.eq("status", status);
    }
    const { data, error } = await q;
    if (error) throw new ApiError(400, error.message);
    return NextResponse.json(
      { donations: data, limit: 50, offset },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (e) {
    return apiError(e);
  }
}
export async function POST(req: NextRequest) {
  try {
    const db = await authenticatedDb(req);
    const parsed = donation.safeParse(await req.json());
    if (!parsed.success) throw new ApiError(400, "Invalid donation fields.");
    const d = parsed.data;
    if (
      +new Date(d.expires_at) <= Date.now() ||
      +new Date(d.expires_at) <= +new Date(d.pickup_at)
    )
      throw new ApiError(400, "Expiry must be in the future and after pickup.");
    const {
      data: { user },
    } = await db.auth.getUser(
      req.headers.get("authorization")!.replace(/^Bearer /i, ""),
    );
    const { data, error } = await db
      .from("donations")
      .insert({ ...d, restaurant_id: user!.id })
      .select()
      .single();
    if (error) throw new ApiError(400, error.message);
    return NextResponse.json({ donation: data }, { status: 201 });
  } catch (e) {
    return apiError(e);
  }
}
