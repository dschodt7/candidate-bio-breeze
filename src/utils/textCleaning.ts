const MAX_RESUME_LENGTH = 15000;
const MIN_CONTENT_RATIO = 0.3;
const MAX_CONSECUTIVE_NEWLINES = 3;

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
    .replace(/(?:\([A-F0-9]{6,}\)|\[[A-F0-9]{6,}\])/g, '') // Remove hex color codes and similar artifacts
    .replace(/\\[a-zA-Z0-9]{1,6}/g, '') // Remove escape sequences
    .replace(/\s+/g, ' ') // Collapse multiple spaces
    .replace(/[\r\n]+/g, '\n') // Normalize line endings
    .trim();

  console.log("[textCleaning] PDF artifact cleaning complete, length:", cleaned.length);

  // Step 3: Clean up common formatting issues
  cleaned = cleaned
    .replace(/•/g, '\n• ') // Format bullet points
    .replace(/([.!?])\s*(?=[A-Z])/g, '$1\n') // Add line breaks after sentences
    .replace(/\n{3,}/g, '\n\n') // Reduce multiple line breaks
    .replace(/[ \t]+$/gm, '') // Remove trailing spaces
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

export const validateTextContent = (text: string): { isValid: boolean; issues: string[] } => {
  const issues: string[] = [];
  console.log("[textCleaning] Starting content validation");

  if (!text || text.trim().length === 0) {
    console.log("[textCleaning] Validation failed: Empty text");
    issues.push("Empty text content");
    return { isValid: false, issues };
  }

  if (text.length > MAX_RESUME_LENGTH * 2) {
    console.log("[textCleaning] Validation failed: Text too long");
    issues.push(`Text exceeds maximum length of ${MAX_RESUME_LENGTH * 2} characters`);
  }

  // Check meaningful content ratio
  const meaningfulContent = text.replace(/[^a-zA-Z0-9]/g, '').length;
  const meaningfulContentRatio = meaningfulContent / text.length;
  console.log("[textCleaning] Content ratio analysis:", {
    totalLength: text.length,
    meaningfulContent,
    ratio: meaningfulContentRatio
  });

  if (meaningfulContentRatio < MIN_CONTENT_RATIO) {
    console.log("[textCleaning] Validation failed: Low content ratio:", meaningfulContentRatio);
    issues.push("Text contains too many special characters or formatting artifacts");
  }

  // Check for excessive newlines
  const maxConsecutiveNewlines = Math.max(
    ...text.split(/[^\n]+/).map(nl => nl.length)
  );
  if (maxConsecutiveNewlines > MAX_CONSECUTIVE_NEWLINES) {
    console.log("[textCleaning] Validation failed: Excessive consecutive newlines:", maxConsecutiveNewlines);
    issues.push("Text contains excessive blank lines");
  }

  // Check for common PDF artifacts
  const pdfArtifactPatterns = [
    /\/Type\s*\/\w+/,
    /\/Pages\s*\[\s*\d+\s*\d+\s*R\s*\]/,
    /\/MediaBox\s*\[\s*\d+\s*\d+\s*\d+\s*\d+\s*\]/
  ];

  for (const pattern of pdfArtifactPatterns) {
    if (pattern.test(text)) {
      console.log("[textCleaning] Validation failed: Contains PDF artifacts");
      issues.push("Text contains PDF structural artifacts");
      break;
    }
  }

  const isValid = issues.length === 0;
  console.log("[textCleaning] Validation complete:", { isValid, issueCount: issues.length });
  return { isValid, issues };
};