# PDF Processing Edge Function

This Edge Function handles PDF text extraction using the pdf-parse library. It:
1. Receives a file name from the request
2. Downloads the file from Supabase storage
3. Processes the PDF to extract text
4. Returns the extracted text and metadata

## Usage

The function expects a POST request with a JSON body containing:
```json
{
  "fileName": "string" // The name of the file in storage
}
```

## Response

Success response:
```json
{
  "success": true,
  "text": "string",
  "metadata": {
    "pages": number,
    "info": object,
    "version": string
  }
}
```

Error response:
```json
{
  "success": false,
  "error": "string"
}
```