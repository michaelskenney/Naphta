import { GoogleGenAI } from "@google/genai";

const PLACEHOLDER_URL =
  "https://placehold.co/512x512/1a1a2e/eee?text=Generated+Image";

const MODEL = "gemini-2.5-flash-image";

export class ImageGenerationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ImageGenerationError";
  }
}

/** Call Gemini image generation API and return raw image bytes. */
export async function generateImage(
  prompt: string,
): Promise<{ buffer: Buffer; mimeType: string }> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new ImageGenerationError("GEMINI_API_KEY is not set");
  }

  const ai = new GoogleGenAI({ apiKey });

  const response = await ai.models.generateContent({
    model: MODEL,
    contents: prompt,
    config: {
      responseModalities: ["IMAGE"],
    },
  });

  const parts = response.candidates?.[0]?.content?.parts;
  if (!parts) {
    throw new ImageGenerationError(
      "Gemini returned no content parts",
    );
  }

  for (const part of parts) {
    if (part.inlineData?.data) {
      return {
        buffer: Buffer.from(part.inlineData.data, "base64"),
        mimeType: part.inlineData.mimeType ?? "image/png",
      };
    }
  }

  throw new ImageGenerationError(
    "Gemini response contained no image data",
  );
}

/** Encode image bytes as a data URL for direct DB storage. */
function toDataUrl(buffer: Buffer, mimeType: string): string {
  return `data:${mimeType};base64,${buffer.toString("base64")}`;
}

/**
 * End-to-end: compose prompt, generate image, return as data URL.
 * Set IMAGE_MOCK=true to skip Gemini and use placeholder images.
 * Throws ImageGenerationError with a descriptive message on failure.
 */
export async function generateAndStoreImage(
  emailId: string,
  subject: string | null,
  bodyText: string | null,
): Promise<{ blobUrl: string; prompt: string }> {
  const { composeImagePrompt } = await import(
    "@/lib/prompt-composer"
  );
  const prompt = composeImagePrompt(subject, bodyText);

  if (process.env.IMAGE_MOCK === "true") {
    return { blobUrl: PLACEHOLDER_URL, prompt };
  }

  const { buffer, mimeType } = await generateImage(prompt);
  const blobUrl = toDataUrl(buffer, mimeType);
  return { blobUrl, prompt };
}
