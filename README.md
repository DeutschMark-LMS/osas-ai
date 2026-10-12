# Osas AI (DMA Marketing Super Intelligence)

The digital marketing intelligence brain for Deutsch Mark Academy, powered by the Google Gemini API and direct-response marketing knowledge.

## Quick Start

1. **Set environment variable**:
   ```bash
   cp .env.example .env
   # Add your GEMINI_API_KEY in .env
   ```

2. **Run local server**:
   ```bash
   node server.js
   ```
   Open `http://localhost:3000`.

## Architecture
- **Frontend**: Vanilla HTML, CSS, JavaScript (zero build step)
- **Backend**: Node.js & Vercel serverless function (`/api/chat.js`)
- **Knowledge Base**: Curated markdown files in `/knowledge`
