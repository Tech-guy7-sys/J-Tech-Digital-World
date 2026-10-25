# JT AI Agent workspace — implementation status

Updated: 2026-10-25

This file distinguishes shipped workspace features from future work. A green website build or Cloudflare deployment does not by itself mean that the Jeff AI provider is configured.

## Implemented in the web workspace

- **Text and code attachments:** select up to four supported text/code files per message. Supported extensions: TXT, Markdown, CSV, JSON, HTML, XML, LOG, JavaScript/TypeScript/JSX/TSX, CSS, Python, YAML, TOML, SQL, shell scripts, and PowerShell.
- **Attachment limits:** each file is limited to 150 KB; browser-extracted text is capped at 12,000 characters per file; combined extracted text is capped at 24,000 characters. The server independently validates and bounds attachment content.
- **Document analysis:** attach supported text files and ask for a summary, explanation, comparison, extraction, review, or transformation. CSV and JSON content can be analyzed as text, subject to the same limits.
- **Reusable project context:** open Project context, save a brief or instructions (maximum 4,000 characters), and it will be included with requests until cleared. It is stored in the current browser's local storage, not synced to JT Account.
- **Response actions:** copy a response or download it as a Markdown (.md) file.
- **Conversation history:** previous turns are sent to the server in the expected role/content shape. History is saved in this browser.
- **Guardrails:** attachments are explicitly marked as untrusted file content; server-side limits apply; secrets stay in server environment variables rather than browser code.

## Configuration requirements

Jeff AI replies only when the Cloudflare Pages Function is enabled and a supported provider is configured. The API checks `JEFF_API_ENABLED=true` and the selected provider's server-side configuration. For example, OpenAI requires `OPENAI_API_KEY`; Ollama requires a secured, reachable `OLLAMA_BASE_URL` and the selected model. Do not put provider API keys into client-side JavaScript or commit them to Git.

A provider choice in the interface is not proof that the provider is configured. Copilot CLI still requires a native Agent Jeff bridge and is not run by the hosted website function.

## Data and privacy notes

- Project context and conversation history persist in the browser that created them; they do not automatically sync between devices or JT Account.
- When a user sends a message with attachments, extracted file text and project context are sent to the deployed JT AI endpoint and then to the selected configured model provider to answer the request. Do not attach passwords, API keys, payment details, or confidential material unless the configured provider and data handling are appropriate for it.
- The browser attachment feature reads file text locally before submission. It does not upload a file until the user sends the message.
- The server treats file contents as untrusted input and bounds the text it accepts, but this is not a malware scanner or a complete document-sandboxing system.

## Not implemented by this change

- Native PDF or Microsoft Word parsing, spreadsheet workbook parsing, audio/video transcription, image understanding, or OCR.
- True streaming output, citations/research browsing, or generated DOCX/PDF/XLSX/PPTX artifacts.
- Server-side project storage, JT Account synchronization, team sharing, vector search, or cross-device memory.
- Automatic execution of app-specific actions, desktop control from the website, or Copilot CLI access.
- A guarantee that any provider works before its server-side credentials, endpoint, model, usage limits, and security settings are configured and tested.

## Verification

The GitHub Actions website CI and Cloudflare deployment workflows should be checked for the commit that contains the latest workspace/API changes. A successful build validates the site package and code checks; a live end-to-end AI test still requires a configured provider and a real test request.
