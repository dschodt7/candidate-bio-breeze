# PDF Processing Edge Function

This edge function handles PDF text extraction for uploaded resumes. It:
1. Downloads the PDF from Supabase storage
2. Extracts text using pdf.js
3. Updates the candidate's resume_text field
4. Returns success/failure status

## Limitations
- Maximum file size: 5MB
- Basic text extraction only
- No advanced formatting preservation
- 10 second timeout limit

## Error Handling
- Validates input parameters
- Checks file size
- Handles storage access errors
- Manages PDF processing errors
- Database update error handling

## Future Improvements
- Advanced text cleaning
- Format preservation
- Large file handling
- OCR capabilities
- Error recovery mechanisms