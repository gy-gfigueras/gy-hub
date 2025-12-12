import { NextRequest } from "next/server";
import { StormlightService } from "./service";
import {
  validateRequest,
  createErrorResponse,
  createSuccessResponse,
} from "../shared/utils/request.utils";
import { ERROR_MESSAGES } from "../shared/constants";

export async function POST(req: NextRequest) {
  try {
    const { prompt, topic } = await validateRequest(req);

    const service = new StormlightService();
    const text = await service.generateResponse(prompt, topic);

    return createSuccessResponse({ text });
  } catch (error) {
    console.error("Stormlight API error:", error);

    const message =
      error instanceof Error ? error.message : ERROR_MESSAGES.GENERATION_FAILED;
    return createErrorResponse(message, 500);
  }
}
