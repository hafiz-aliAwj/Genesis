import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { authenticatedDb, ApiError, apiError } from "@/lib/api";
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const db = await authenticatedDb(req);
    const { id } = await params;
    if (!z.string().uuid().safeParse(id).success)
      throw new ApiError(400, "Invalid donation ID.");
    const body = z
      .object({
        action: z.enum(["reserve", "accept", "collect", "deliver", "confirm"]),
      })
      .strict()
      .safeParse(await req.json());
    if (!body.success) throw new ApiError(400, "Invalid action.");
    const { error } = await db.rpc("transition_donation", {
      p_action: body.data.action,
      p_donation: id,
    });
    if (error) throw new ApiError(409, error.message);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return apiError(e);
  }
}
