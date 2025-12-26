# replit.md

## Overview

This is a full-stack inventory and invoicing application built for a battery/inverter retail business. The system manages stock items with serial numbers, generates GST-compliant invoices, and tracks inventory status. It features a React frontend with shadcn/ui components and an Express backend with in-memory storage (designed to be extended to PostgreSQL).

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight client-side routing)
- **State Management**: TanStack React Query for server state
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming
- **Build Tool**: Vite with custom plugins for Replit integration

The frontend follows a pages-based structure with components organized by functionality:
- `/client/src/pages/` - Route components (stock-management, invoice-form, invoices-list)
- `/client/src/components/ui/` - Reusable shadcn/ui components
- `/client/src/hooks/` - Custom React hooks for data fetching and utilities

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Runtime**: Node.js with tsx for TypeScript execution
- **Storage**: In-memory storage class (designed for PostgreSQL migration)
- **API Design**: RESTful endpoints defined in shared routes contract

The backend uses a simple layered structure:
- `server/index.ts` - Express app setup and middleware
- `server/routes.ts` - API route handlers
- `server/storage.ts` - Data access layer (in-memory, ready for database)
- `server/vite.ts` - Development server integration with Vite HMR

### Shared Code
- `shared/schema.ts` - TypeScript interfaces for stock items, invoices, and company details
- `shared/routes.ts` - API route constants ensuring frontend/backend consistency

### Database Design (Prepared)
- **ORM**: Drizzle ORM configured for PostgreSQL
- **Schema Location**: `shared/schema.ts` (currently TypeScript interfaces, ready for Drizzle tables)
- **Migrations**: Drizzle Kit configured to output to `/migrations`

The application currently uses in-memory storage but is structured for easy PostgreSQL migration. The drizzle.config.ts expects a DATABASE_URL environment variable.

### Build System
- **Development**: Vite dev server with HMR proxied through Express
- **Production**: Custom build script using esbuild for server bundling and Vite for client
- **Output**: Compiled to `/dist` with server as CommonJS and client as static assets

## External Dependencies

### Database
- **PostgreSQL** (planned) - Connection via DATABASE_URL environment variable
- **Drizzle ORM** - Type-safe database queries with drizzle-zod for validation
- **connect-pg-simple** - Session storage for PostgreSQL

### UI Framework
- **Radix UI** - Accessible component primitives (dialog, dropdown, toast, etc.)
- **shadcn/ui** - Pre-styled component library using Radix
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Icon library

### Data & Forms
- **TanStack React Query** - Server state management and caching
- **React Hook Form** - Form state management
- **Zod** - Schema validation (shared between client and server)

### Development Tools
- **Vite** - Frontend build tool and dev server
- **tsx** - TypeScript execution for Node.js
- **esbuild** - Server bundling for production