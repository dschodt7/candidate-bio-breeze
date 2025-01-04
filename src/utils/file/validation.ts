interface ValidationResult {
  isValid: boolean;
  issues: string[];
}

export const validateTextContent = (text: string, fileType: 'PDF' | 'DOCX'): ValidationResult => {
  const issues: string[] = [];
  const minLength = 100; // Minimum characters for a valid resume
  const maxLength = 15000; // Maximum characters we process

  if (!text || text.trim().length < minLength) {
    issues.push(`Extracted text is too short (minimum ${minLength} characters)`);
  }

  if (text.length > maxLength) {
    issues.push(`Extracted text is too long (maximum ${maxLength} characters)`);
  }

  // Check for common PDF artifacts
  if (fileType === 'PDF') {
    if (text.includes('/Type') || text.includes('/Pages') || text.includes('/MediaBox')) {
      issues.push('PDF contains structural artifacts that need cleaning');
    }
  }

  // Check for meaningful content ratio
  const meaningfulContent = text.replace(/[\s\n\r\t]+/g, ' ').trim();
  if (meaningfulContent.length < text.length * 0.5) {
    issues.push('Text contains too much whitespace or formatting');
  }

  return {
    isValid: issues.length === 0,
    issues
  };
};