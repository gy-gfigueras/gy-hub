import { NextResponse } from "next/server";
import { AssistantRequest } from "../types/assistant";

export async function validateRequest(req: Request): Promise<AssistantRequest> {
  try {
    const body = await req.json();
    const prompt = String(body?.prompt ?? "").trim();

    if (!prompt) {
      throw new Error("Prompt is required");
    }

    return {
      prompt,
      topic: body?.topic,
    };
  } catch {
    throw new Error("Invalid request body");
  }
}

export function createErrorResponse(
  message: string,
  status: number = 500
): NextResponse {
  return NextResponse.json({ error: message }, { status });
}

export function createSuccessResponse<T>(data: T): NextResponse {
  return NextResponse.json(data);
}
