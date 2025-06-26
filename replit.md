# Business Network Platform

## Overview

This is a full-stack React application that connects investors and entrepreneurs for networking and collaboration opportunities. The platform facilitates profile discovery, collaboration requests, messaging, and connection management between users in the business ecosystem.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query (React Query) for server state management
- **UI Framework**: Shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming
- **Forms**: React Hook Form with Zod validation
- **Build Tool**: Vite for development and production builds

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **Session Management**: Express sessions with in-memory storage
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **Storage Layer**: Database-backed storage implementation
- **API Design**: RESTful API endpoints with comprehensive CRUD operations

## Key Components

### Authentication System
- Session-based authentication using express-session
- Role-based access control (investor vs entrepreneur)
- Protected routes with middleware validation
- Secure password handling (currently plain text - needs encryption)

### User Management
- User profiles with role differentiation
- Profile information including company, bio, industries
- Avatar support and social links
- Investment preferences and funding needs tracking

### Messaging System
- Real-time messaging between connected users
- Message history and conversation management
- Chat interface with user avatars and timestamps

### Collaboration Features
- Collaboration request system with status tracking
- Connection management between users
- Request approval/rejection workflow

### Data Layer
- **Database Schema**: 
  - Users table with comprehensive profile fields
  - Collaboration requests with status management
  - Messages table for chat functionality
  - Connections table for user relationships
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Validation**: Zod schemas for type safety

## Data Flow

1. **Authentication Flow**: Users login/register → Session creation → Role-based dashboard routing
2. **Profile Discovery**: Users browse profiles filtered by role → View detailed profiles → Send collaboration requests
3. **Collaboration Flow**: Request sent → Status tracking → Acceptance/rejection → Connection establishment
4. **Messaging Flow**: Connected users → Chat interface → Real-time message exchange → Message persistence

## External Dependencies

### Core Framework Dependencies
- React ecosystem (React, React DOM, React Query)
- Express.js with session management
- Drizzle ORM with Neon Database connection

### UI/UX Dependencies
- Radix UI primitives for accessible components
- Tailwind CSS for styling
- Lucide React for icons
- React Hook Form for form management

### Development Dependencies
- Vite for build tooling
- TypeScript for type safety
- ESBuild for server bundling

## Deployment Strategy

### Development Environment
- Vite dev server for frontend hot reloading
- TSX for server-side TypeScript execution
- PostgreSQL database connection via environment variables

### Production Build
- Vite builds optimized client bundle to `dist/public`
- ESBuild bundles server code to `dist/index.js`
- Single-command deployment with `npm run build`

### Hosting Configuration
- Replit deployment with autoscale target
- Port 5000 for development, port 80 for production
- PostgreSQL module integration for database

### Environment Requirements
- `DATABASE_URL` environment variable for database connection
- Session secret configuration
- Node.js 20+ runtime environment

## Changelog
- June 26, 2025. Initial setup and complete implementation
- June 26, 2025. Resolved TypeScript compilation errors in session handling
- June 26, 2025. Fixed ChatModal component error with null checking in getInitials utility
- June 26, 2025. Completed comprehensive testing of all core features
- June 26, 2025. Verified authentication, collaboration requests, messaging, and connection systems
- June 26, 2025. Integrated PostgreSQL database with Drizzle ORM for persistent data storage
- June 26, 2025. Migrated from in-memory storage to database-backed storage implementation
- June 26, 2025. Successfully seeded database with sample users, collaboration requests, and messages

## User Preferences

Preferred communication style: Simple, everyday language.