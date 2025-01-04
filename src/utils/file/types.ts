export class TextExtractionError extends Error {
  type: 'PDF_PARSING' | 'DOCX_PARSING' | 'VALIDATION' | 'FILE_SIZE' | 'UNKNOWN';
  details?: unknown;

  constructor(message: string, type: TextExtractionError['type'], details?: unknown) {
    super(message);
    this.type = type;
    this.details = details;
    this.name = 'TextExtractionError';
  }
}

export interface ValidationResult {
  isValid: boolean;
  issues: string[];
}