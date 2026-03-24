# Synapse

A full-stack learning platform built with React + Vite (client) and Express + Prisma (server).

## Project Structure

```
Synapse/
├── .env                # All environment variables (DO NOT COMMIT)
├── .env.example        # Template with placeholder values (safe to commit)
├── .gitignore
├── package.json        # Root scripts to run everything
├── client/             # React + Vite + TypeScript frontend
│   ├── src/
│   └── package.json
├── server/             # Express + TypeScript backend
│   ├── src/
│   └── package.json
├── shared/             # Shared TypeScript types/utilities
│   ├── src/
│   └── package.json
└── prisma/             # Database schema & migrations
    ├── schema.prisma
    └── prisma.config.ts
```

## Getting Started

### 1. Environment Setup

```bash
# Copy the example env file
cp .env.example .env

# Edit .env and fill in your real API keys
```

### 2. Install Dependencies

```bash
# Install root dependencies
npm install

# Install client dependencies
cd client && npm install && cd ..

# Install server dependencies
cd server && npm install && cd ..

# Install shared dependencies
cd shared && npm install && cd ..
```

### 3. Database Setup

```bash
# Generate Prisma client
cd server && npx prisma generate --schema=../prisma/schema.prisma

# Run migrations (if needed)
npx prisma migrate dev --schema=../prisma/schema.prisma
```

### 4. Run the Project

```bash
# From the project root — starts both client and server
npm run dev

# Or run individually
npm run dev:server
npm run dev:client
```

### 5. Build for Production

```bash
npm run build
npm start
```

## Environment Variables

See [`.env.example`](.env.example) for the full list of required variables. Key sections:

| Section | Variables | Used By |
|---------|-----------|---------|
| Database | `DATABASE_URL` | Prisma / Server |
| Server | `PORT`, `JWT_SECRET` | Server |
| AI Services | `GROQ_API_KEY`, `GEMINI_API_KEY`, `AZURE_OPENAI_*` | Server |
| Azure Cognitive | `AZURE_VISION_*`, `AZURE_SPEECH_*`, `AZURE_TRANSLATOR_*` | Server |
| Azure Storage | `AZURE_STORAGE_CONNECTION_STRING`, `AZURE_STORAGE_CONTAINER` | Server |
| Client | `VITE_API_URL` | Client (Vite) |
