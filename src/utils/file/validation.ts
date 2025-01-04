const MAX_RESUME_LENGTH = 15000;

// Format-specific validation thresholds
const ValidationThresholds = {
  DOCX: {
    maxConsecutiveNewlines: 6,
    minContentRatio: 0.3
  },
  PDF: {
    maxConsecutiveNewlines: 3,
    minContentRatio: 0.4
  }
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

  // Format-specific pre-cleaning
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

  return { isValid: issues.length === 0, issues };
};