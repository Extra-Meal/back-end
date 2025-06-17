import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { generateText, streamText } from "ai";
import { tools } from "../ai/tools";
import model, { SYSTEM_PROMPT } from "../ai/ai-model";
const aiChatHandler = asyncHandler(async (req: Request, res: Response) => {
  console.log("Received request body message from chatbot");
  const { messages } = req.body;

  try {
    const result = streamText({
      model,
      system: SYSTEM_PROMPT,
      messages,
      tools,
      maxSteps: 20,
      toolCallStreaming: true,
    });

    // If no tool was called, just return the initial result
    return result.pipeDataStreamToResponse(res);
  } catch (error) {
    console.error("Error processing request:", error);
    res.status(500).json({ error: "Internal Server Error" });
    return;
  }
});

export { aiChatHandler };
