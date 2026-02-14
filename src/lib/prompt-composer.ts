const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
const PHONE_REGEX =
  /(\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g;
const SSN_REGEX = /\b\d{3}[-.\s]?\d{2}[-.\s]?\d{4}\b/g;

const MAX_BODY_CHARS = 500;
const MAX_PROMPT_CHARS = 1000;

const STYLE_DIRECTIVE =
  "Style: New Yorker magazine editorial cartoon, witty, " +
  "black and white with one accent color.";

/** Remove email addresses, phone numbers, and SSN patterns. */
export function stripPII(text: string): string {
  return text
    .replace(EMAIL_REGEX, "[REDACTED]")
    .replace(SSN_REGEX, "[REDACTED]")
    .replace(PHONE_REGEX, "[REDACTED]");
}

/**
 * Compose an image generation prompt from email subject and body.
 * Strips PII, truncates, and wraps in an art style directive.
 */
export function composeImagePrompt(
  subject: string | null,
  bodyText: string | null,
): string {
  const cleanSubject = subject ? stripPII(subject).trim() : "";
  const cleanBody = bodyText
    ? stripPII(bodyText).trim().slice(0, MAX_BODY_CHARS)
    : "";

  const parts: string[] = [];
  if (cleanSubject) parts.push(cleanSubject);
  if (cleanBody) parts.push(cleanBody);

  const summary = parts.join(" — ") || "an unnamed correspondence";

  const prompt =
    `Create a satirical editorial cartoon illustration about: ` +
    `${summary}. ${STYLE_DIRECTIVE}`;

  return prompt.slice(0, MAX_PROMPT_CHARS);
}
