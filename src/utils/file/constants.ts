export const FILE_CONSTANTS = {
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_TYPES: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ] as const
} as const;

export type AllowedFileType = typeof FILE_CONSTANTS.ALLOWED_TYPES[number];