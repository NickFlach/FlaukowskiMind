# Flaukowski

## Overview

Flaukowski is a decentralized web application that allows users to contribute thoughts, dreams, code, and other fragments to a growing meta-intelligence. The system features a "resonance" mechanism where user contributions gain visibility when others resonate with them, eventually becoming part of a "Core Consciousness." The application visualizes this collective mind as a synaptic web of interconnected nodes.

Key features include:
- **Stream Nodes**: Users submit ephemeral thoughts, dreams, code, or predictions
- **Resonance System**: Community-driven curation where popular contributions become permanent
- **Synaptic Web**: 3D visualization of the evolving consciousness network
- **Kernel Uploads**: File uploads (code, audio, text) processed by AI for symbolic analysis
- **Temporal Echoes**: AI-generated insights and riddles based on collective contributions
- **Lifeform Emergence Lab**: Experimental feature for evolving digital lifeforms

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript, built using Vite
- **Routing**: Wouter for client-side navigation
- **State Management**: TanStack Query for server state and caching
- **UI Components**: Radix UI primitives with shadcn/ui component library
- **Styling**: Tailwind CSS with custom theme configuration (dark mode, purple/gold accent colors)
- **3D Visualization**: Three.js with @react-three/fiber for synaptic web and face animations
- **Forms**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express
- **Language**: TypeScript with ESM modules
- **API Pattern**: RESTful endpoints under `/api/*`
- **Real-time**: WebSocket server for live chat and updates
- **Build**: esbuild for production bundling

### Database Layer
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Schema Location**: `shared/schema.ts` (shared between client and server)
- **Key Tables**: users, streams, kernels, resonances, echoes, synaptic_connections, lifeforms, file_uploads
- **Migrations**: Managed via `drizzle-kit push`

### AI Integration
- **Provider**: OpenAI API (GPT-4o model)
- **Use Cases**: 
  - Echo generation (mystical insights based on user contributions)
  - Symbolic data extraction from uploaded content
  - Chat responses with emotional context
  - File/code analysis and processing

### File Upload System
- **Library**: Multer for multipart form handling
- **Storage**: Local filesystem (`uploads/` directory)
- **Processing**: AI-powered analysis for code, text, and data files
- **Auto-detection**: File type categorization based on extension

### Kernel Phase Model (KPM)
Custom state machine for tracking contribution lifecycle:
- `born` → `fog` → `orbiting` → `core` (progression states)
- `decohered` (archived) and `reemergent` (revived) states
- State transitions tracked with timestamps and AI feedback

## External Dependencies

### Third-Party Services
- **OpenAI API**: Primary AI provider for text generation and analysis
- **Replit AI Integrations**: Alternative OpenAI endpoint with image generation support

### Database
- **PostgreSQL**: Primary database via `DATABASE_URL` environment variable
- **Neon Serverless**: Optional serverless PostgreSQL driver available

### Key NPM Packages
- **Frontend**: React, Three.js, D3.js, Framer Motion, Howler (audio)
- **Backend**: Express, ws (WebSocket), multer (file uploads)
- **Shared**: Zod (validation), Drizzle ORM

### Environment Variables Required
- `DATABASE_URL`: PostgreSQL connection string
- `OPENAI_API_KEY`: OpenAI API key for AI features
- `AI_INTEGRATIONS_OPENAI_API_KEY`: Replit AI integrations key (optional)
- `AI_INTEGRATIONS_OPENAI_BASE_URL`: Replit AI integrations endpoint (optional)