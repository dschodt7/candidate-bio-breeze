const MAX_RESUME_LENGTH = 15000;

export const cleanText = (text: string): string => {
  console.log("[textCleaning] Starting text cleaning, original length:", text.length);
  
  // Step 1: Remove basic problematic characters
  let cleaned = text
    .replace(/\u0000/g, '') // Remove null bytes
    .replace(/[\uFFFD\uFFFE\uFFFF]/g, '') // Remove replacement characters
    .replace(/[^\x20-\x7E\x0A\x0D\u00A0-\u00FF\u0100-\u017F\u0180-\u024F\u1E00-\u1EFF]/g, ' ') // Replace other problematic Unicode
    .trim();
    
  console.log("[textCleaning] Basic character cleaning complete, length:", cleaned.length);

  // Step 2: Remove PDF-specific artifacts
  cleaned = cleaned
    .replace(/^(?:(?![\n\r])[^\w\s])+/gm, '') // Remove leading non-word characters
    .replace(/(?:\/Type|\/Pages|\/MediaBox|\/Resources|\/Font).*$/gm, '') // Remove PDF metadata
    .replace(/\b[A-Z]{6,}\b/g, '') // Remove long uppercase strings (likely PDF artifacts)
    .replace(/\s+/g, ' ') // Collapse multiple spaces
    .replace(/[\r\n]+/g, '\n') // Normalize line endings
    .trim();

  console.log("[textCleaning] PDF artifact cleaning complete, length:", cleaned.length);

  // Step 3: Clean up common formatting issues
  cleaned = cleaned
    .replace(/•/g, '\n• ') // Format bullet points
    .replace(/([.!?])\s*(?=[A-Z])/g, '$1\n') // Add line breaks after sentences
    .replace(/\n{3,}/g, '\n\n') // Reduce multiple line breaks
    .trim();

  console.log("[textCleaning] Format cleaning complete, length:", cleaned.length);

  // Step 4: Enforce maximum length
  if (cleaned.length > MAX_RESUME_LENGTH) {
    console.log(`[textCleaning] Text exceeds ${MAX_RESUME_LENGTH} characters, truncating...`);
    cleaned = cleaned.slice(0, MAX_RESUME_LENGTH);
  }

  console.log("[textCleaning] Final cleaned text length:", cleaned.length);
  return cleaned;
};

export const validateTextContent = (text: string): boolean => {
  if (!text || text.trim().length === 0) {
    console.log("[textCleaning] Validation failed: Empty text");
    return false;
  }

  if (text.length > MAX_RESUME_LENGTH * 2) {
    console.log("[textCleaning] Validation failed: Text too long");
    return false;
  }

  const meaningfulContentRatio = text.replace(/[^a-zA-Z0-9]/g, '').length / text.length;
  if (meaningfulContentRatio < 0.3) {
    console.log("[textCleaning] Validation failed: Low content ratio:", meaningfulContentRatio);
    return false;
  }

  return true;
};