import { put } from "@vercel/blob";

const PLACEHOLDER_URL =
  "https://placehold.co/512x512/1a1a2e/eee?text=Generated+Image";

/** Call OpenAI images API and return raw image bytes. */
export async function generateImage(
  prompt: string,
): Promise<Buffer | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  const response = await fetch(
    "https://api.openai.com/v1/images/generations",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-image-1",
        prompt,
        n: 1,
        size: "1024x1024",
      }),
    },
  );

  if (!response.ok) {
    const text = await response.text();
    console.error(`OpenAI API error (${response.status}): ${text}`);
    return null;
  }

  const json = (await response.json()) as {
    data?: Array<{ url?: string; b64_json?: string }>;
  };

  const entry = json.data?.[0];
  if (!entry) {
    console.error("OpenAI returned no image data");
    return null;
  }

  if (entry.b64_json) {
    return Buffer.from(entry.b64_json, "base64");
  }

  if (entry.url) {
    const imgResponse = await fetch(entry.url);
    if (!imgResponse.ok) {
      console.error(`Failed to download image: ${imgResponse.status}`);
      return null;
    }
    const arrayBuffer = await imgResponse.arrayBuffer();
    return Buffer.from(arrayBuffer);
  }

  console.error("OpenAI response missing both url and b64_json");
  return null;
}

/** Upload image bytes to Vercel Blob storage. */
export async function uploadToBlob(
  imageBuffer: Buffer,
  emailId: string,
): Promise<string> {
  const blob = await put(
    `email-images/${emailId}.png`,
    imageBuffer,
    { access: "public", contentType: "image/png" },
  );
  return blob.url;
}

/**
 * End-to-end: compose prompt, generate image, upload to blob.
 * Returns placeholder in mock mode (no API key).
 */
export async function generateAndStoreImage(
  emailId: string,
  subject: string | null,
  bodyText: string | null,
): Promise<{ blobUrl: string; prompt: string } | null> {
  const { composeImagePrompt } = await import(
    "@/lib/prompt-composer"
  );
  const prompt = composeImagePrompt(subject, bodyText);

  const imageBuffer = await generateImage(prompt);

  if (!imageBuffer) {
    // Mock mode — no API key or generation failed
    if (!process.env.OPENAI_API_KEY) {
      return { blobUrl: PLACEHOLDER_URL, prompt };
    }
    return null;
  }

  const blobUrl = await uploadToBlob(imageBuffer, emailId);
  return { blobUrl, prompt };
}
