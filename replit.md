# YouTube Video Downloader - Architecture Overview

## Overview

This is a full-stack YouTube video downloader application built with modern web technologies. The system allows users to input YouTube URLs, fetch video metadata, select download quality/format, and download videos with real-time progress tracking.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack React Query for server state management
- **UI Framework**: Shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming
- **Build Tool**: Vite for development and bundling

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **API**: RESTful endpoints for video info and download management
- **Video Processing**: ytdl-core for YouTube video extraction

### Data Storage Solutions
- **Database**: PostgreSQL with Drizzle ORM
- **Schema**: Users and downloads tables with type-safe schemas
- **Migrations**: Drizzle Kit for database migrations
- **Connection**: Neon Database (serverless PostgreSQL)

## Key Components

### Frontend Components
1. **UrlInput**: Handles YouTube URL validation and video info fetching
2. **VideoMetadata**: Displays video information and quality selection
3. **DownloadPanel**: Manages download initiation and progress tracking
4. **DownloadHistory**: Shows past downloads with status indicators

### Backend Services
1. **Video Information Service**: Extracts metadata using ytdl-core
2. **Download Manager**: Handles download requests and progress tracking
3. **Storage Layer**: In-memory storage with interface for future database integration

### Database Schema
- **Users Table**: User authentication (prepared for future implementation)
- **Downloads Table**: Download history with status, progress, and metadata
- **Type Safety**: Zod schemas for validation and type inference

## Data Flow

1. **URL Submission**: User enters YouTube URL → Frontend validates → API fetches video info
2. **Quality Selection**: User selects format/quality → Frontend prepares download request
3. **Download Initiation**: Download request → Backend starts download → Progress tracking begins
4. **Progress Updates**: Real-time polling for download status and progress
5. **History Management**: Completed downloads stored in database for user reference

## External Dependencies

### Core Libraries
- **ytdl-core**: YouTube video downloading and metadata extraction
- **@neondatabase/serverless**: Serverless PostgreSQL connection
- **drizzle-orm**: Type-safe database ORM
- **@tanstack/react-query**: Server state management

### UI/UX Libraries
- **@radix-ui/***: Accessible UI primitives
- **tailwindcss**: Utility-first CSS framework
- **lucide-react**: Icon library
- **date-fns**: Date manipulation utilities

### Development Tools
- **vite**: Build tool and dev server
- **typescript**: Type safety and development experience
- **tsx**: TypeScript execution for development

## Deployment Strategy

### Replit Configuration
- **Modules**: Node.js 20, Web, PostgreSQL 16
- **Development**: `npm run dev` with hot reload
- **Production Build**: Vite build + esbuild for server bundling
- **Deployment**: Autoscale deployment target with port 5000→80 mapping

### Build Process
1. **Frontend**: Vite builds React app to `dist/public`
2. **Backend**: esbuild bundles server code to `dist/index.js`
3. **Database**: Drizzle migrations applied via `npm run db:push`

### Environment Variables
- `DATABASE_URL`: PostgreSQL connection string (required)
- `NODE_ENV`: Environment setting (development/production)

## Changelog

```
Changelog:
- June 23, 2025. Applied Anthropic-inspired design system with warm color palette
- June 22, 2025. Initial setup and direct download functionality
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```