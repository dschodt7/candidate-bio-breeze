const MAX_RESUME_LENGTH = 15000;

// Format-specific validation thresholds
const ValidationThresholds = {
  DOCX: {
    // Higher threshold for DOCX as mammoth conversion often adds extra spacing
    maxConsecutiveNewlines: 6,
    // Lower ratio for DOCX due to formatting characters
    minContentRatio: 0.3
  },
  PDF: {
    // Stricter for PDF as they have less formatting
    maxConsecutiveNewlines: 3,
    // Higher ratio for PDF as they have less formatting characters
    minContentRatio: 0.4
  }
};

export const cleanText = (text: string): string => {
  console.log("[textCleaning] Starting text cleaning, original length:", text.length);
  
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
    
  console.log("[textCleaning] Final cleaned text length:", cleaned.length);
  return cleaned;
};

export const validateTextContent = (
  text: string, 
  format: 'DOCX' | 'PDF'
): { isValid: boolean; issues: string[] } => {
  console.log(`[textCleaning] Starting ${format} validation, text length:`, text.length);
  const issues: string[] = [];
  const thresholds = ValidationThresholds[format];

  if (!text || text.trim().length === 0) {
    console.log("[textCleaning] Validation failed: Empty text");
    issues.push("Empty text content");
    return { isValid: false, issues };
  }

  // DOCX-specific pre-cleaning
  const processedText = format === 'DOCX' 
    ? text.replace(/\r\n/g, '\n').replace(/\n{3,}/g, '\n\n')
    : text;

  if (text.length > MAX_RESUME_LENGTH * 2) {
    console.log("[textCleaning] Validation failed: Text too long");
    issues.push(`Text exceeds maximum length of ${MAX_RESUME_LENGTH * 2} characters`);
  }

  // Check consecutive newlines with format-specific threshold
  const maxConsecutiveNewlines = Math.max(
    ...processedText.split(/[^\n]+/).map(nl => nl.length)
  );
  console.log(`[textCleaning] Max consecutive newlines:`, maxConsecutiveNewlines);

  if (maxConsecutiveNewlines > thresholds.maxConsecutiveNewlines) {
    console.log(`[textCleaning] Validation failed: Too many consecutive newlines (${maxConsecutiveNewlines})`);
    issues.push(
      `Format validation failed: Found ${maxConsecutiveNewlines} consecutive blank lines ` +
      `(maximum allowed for ${format}: ${thresholds.maxConsecutiveNewlines})`
    );
  }

  // Check meaningful content ratio with format-specific threshold
  const meaningfulContent = processedText.replace(/[^a-zA-Z0-9]/g, '').length;
  const meaningfulContentRatio = meaningfulContent / processedText.length;
  console.log(`[textCleaning] Content ratio analysis:`, {
    totalLength: processedText.length,
    meaningfulContent,
    ratio: meaningfulContentRatio
  });

  if (meaningfulContentRatio < thresholds.minContentRatio) {
    console.log(`[textCleaning] Validation failed: Low content ratio (${meaningfulContentRatio.toFixed(2)})`);
    issues.push(
      `Content validation failed: Text contains ${((1 - meaningfulContentRatio) * 100).toFixed(1)}% ` +
      `special characters (maximum allowed: ${((1 - thresholds.minContentRatio) * 100).toFixed(1)}%)`
    );
  }

  // Check for PDF artifacts if it's a PDF
  if (format === 'PDF') {
    const pdfArtifactPatterns = [
      /\/Type\s*\/\w+/,
      /\/Pages\s*\[\s*\d+\s*\d+\s*R\s*\]/,
      /\/MediaBox\s*\[\s*\d+\s*\d+\s*\d+\s*\d+\s*\]/
    ];

    for (const pattern of pdfArtifactPatterns) {
      if (pattern.test(processedText)) {
        console.log("[textCleaning] Validation failed: Contains PDF artifacts");
        issues.push("Text contains PDF structural artifacts");
        break;
      }
    }
  }

  console.log(`[textCleaning] Validation complete:`, {
    format,
    isValid: issues.length === 0,
    issueCount: issues.length,
    issues
  });

  return { isValid: issues.length === 0, issues };
};
