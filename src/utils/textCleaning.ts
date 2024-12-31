const MAX_RESUME_LENGTH = 15000;

export const cleanText = (text: string): string => {
  console.log("Starting text cleaning, original length:", text.length);
  
  // Remove PDF metadata and control characters
  let cleaned = text
    .replace(/\u0000/g, '') // Remove null bytes
    .replace(/[\uFFFD\uFFFE\uFFFF]/g, '') // Remove replacement characters
    .replace(/[^\x20-\x7E\x0A\x0D\u00A0-\u00FF\u0100-\u017F\u0180-\u024F\u1E00-\u1EFF]/g, ' ') // Replace other problematic Unicode with spaces
    .replace(/\s+/g, ' ') // Collapse multiple spaces
    .replace(/[\r\n]+/g, '\n') // Normalize line endings
    .trim();

  console.log("Basic character cleaning complete, length:", cleaned.length);

  // Remove PDF-specific artifacts
  cleaned = cleaned
    .replace(/^(?:(?![\n\r])[^\w\s])+/gm, '') // Remove leading non-word characters
    .replace(/(?:\/Type|\/Pages|\/MediaBox|\/Resources|\/Font).*$/gm, '') // Remove PDF metadata
    .replace(/\b[A-Z]{6,}\b/g, '') // Remove long uppercase strings (likely PDF artifacts)
    .trim();

  console.log("PDF artifact cleaning complete, length:", cleaned.length);

  // Enforce maximum length
  if (cleaned.length > MAX_RESUME_LENGTH) {
    console.log(`Text exceeds ${MAX_RESUME_LENGTH} characters, truncating...`);
    cleaned = cleaned.slice(0, MAX_RESUME_LENGTH);
  }

  console.log("Final cleaned text length:", cleaned.length);
  return cleaned;
};