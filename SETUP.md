# AI Boardroom v2.0 - Enterprise Edition
## Setup & Run Instructions

This repository contains the production-ready code for AI Boardroom v2.0, an enterprise-grade strategic intelligence platform powered by Google Gemini and RAG.

### 1. Prerequisites
- Node.js 18.x or higher
- MongoDB (Atlas or Local)
- Google Gemini API Key

### 2. Backend Setup
\`\`\`bash
cd server
npm i
\`\`\`
Create a \`.env\` file in \`server/\`:
\`\`\`env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/ai-boardroom-v2
JWT_SECRET=your_super_secret_jwt_key
GEMINI_API_KEY=your_gemini_api_key_here
AI_MODEL=gemini-2.5-flash
CORS_ORIGIN=http://localhost:5173
\`\`\`
Run the server:
\`\`\`bash
npm run dev
\`\`\`

### 3. Frontend Setup
\`\`\`bash
cd client
npm i
\`\`\`
Create a \`.env\` file in \`client/\`:
\`\`\`env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
\`\`\`
Run the client:
\`\`\`bash
npm run dev
\`\`\`

### 4. Production Build & Verification Tests
To verify the application for production deployment, run the following:
\`\`\`bash
cd server && npm test
cd client && npm run build
\`\`\`
Ensure all Jest tests pass and the Vite application builds output bundles correctly. CI/CD will automatically run these configured in \`.github/workflows/main.yml\`.
