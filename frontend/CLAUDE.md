# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

SmartMillScale is a palm oil mill weighing and grading system frontend built with Next.js 15 and React 19. The application manages:
- Digital weighing transactions with real-time scale integration
- Palm fruit grading and quality assessment  
- Master data for suppliers (pemasok), drivers (sopir), and vehicles (kendaraan)
- Report generation and PDF receipts
- Role-based authentication and authorization

## Development Commands

**Development server (with Turbopack):**
```bash
npm run dev
```

**Build and deployment:**
```bash
npm run build
npm start
```

**Code quality:**
```bash
npm run lint
```

## Architecture Overview

### Authentication & Authorization
- Context-based auth using `src/contexts/auth-context.tsx`
- Role and permission-based access control with `hasRole()` and `hasPermission()` helpers
- JWT token management via localStorage
- Route protection through Next.js middleware (`src/middleware.ts`)
- Auto-redirect to `/login` for unauthenticated users on protected routes

### API Layer Architecture
Organized in a layered structure under `src/lib/api/`:

**Types (`src/lib/api/types/`):**
- `auth.ts` - Authentication types (User, Role, LoginRequest, etc.)
- `business.ts` - Core business entities (Pemasok, Sopir, Kendaraan, TransaksiTimbang, Grading)
- `dto.ts` - Data Transfer Objects for API requests
- `common.ts` - Shared types (PaginationResponse, ApiResponse)

**Services (`src/lib/api/services/`):**
- Individual service files for each domain (pemasok, sopir, kendaraan, timbangan, grading)
- Each service handles CRUD operations for its respective entity
- Consistent pagination and search patterns

**Client (`src/lib/api/client.ts`):**
- Centralized HTTP client with automatic token management
- Auto-redirect to login on 401 responses
- Error handling and JSON response parsing

### Real-time Integration
- Socket.io client hook (`src/hooks/useSocket.ts`) for digital scale integration
- WebSocket connection to `http://localhost:3001/scale` namespace
- Real-time weight data with events: `scale-data`, `current-weight`, `weighing-started/stopped`
- Scale control functions: `startWeighing()`, `stopWeighing()`, `tareScale()`, `getCurrentWeight()`

### Component Organization
- **UI Components (`src/components/ui/`):** Reusable primitives built on Radix UI
- **Layout Components (`src/components/layout/`):** Header, sidebar, main layout
- **Forms (`src/components/forms/`):** Entity-specific form components (to be organized)
- **Features (`src/components/features/`):** Business domain components (to be organized)
- **Common (`src/components/common/`):** Shared utilities like debug components

### Utilities Structure
- **Formatters (`src/lib/utils/formatters/`):** Currency and date formatting with Indonesian locale
- **Validators (`src/lib/utils/validators/`):** Zod schemas for form validation
- **Constants (`src/lib/utils/constants/`):** App configuration, API endpoints, status options

### PDF Generation
- Custom receipt generator (`src/lib/pdf-generator.ts`) using jsPDF
- Weighing receipt with supplier, driver, vehicle, and weight information
- Automatic grading data inclusion when available
- Print and download functionality

### Route Structure
App Router with nested layouts:
- `/` - Dashboard/home page
- `/login` - Authentication
- `/timbangan` - Weighing transactions (has own layout)
- `/grading` - Quality grading
- `/master/*` - Master data (pemasok, sopir, kendaraan)
- `/laporan/*` - Reports (harian, bulanan, grading)
- `/unauthorized` - Access denied page

## Development Patterns

### Form Handling
- React Hook Form with Zod validation resolvers
- Consistent validation schemas in `src/lib/utils/validators/`
- Form components should use the established patterns from existing forms

### Data Fetching
- Services return typed responses using the API client
- Pagination handled consistently with `PaginationResponse<T>` type
- Error handling through try/catch with user feedback

### State Management
- Context for authentication state
- Local state for UI components
- Socket state managed through custom hook
- Future: Zustand store structure prepared in `src/stores/`

### Environment Configuration
- API base URL via `NEXT_PUBLIC_API_URL` (defaults to `http://localhost:3001`)
- Socket.io connects to same backend server with `/scale` namespace

## Testing & Quality

When making changes, always run:
1. `npm run lint` - ESLint validation
2. `npm run build` - Build verification
3. Manual testing of authentication flow
4. Socket connection testing for weighing features

## Backend Integration Notes

The frontend expects a NestJS backend at `http://localhost:3001` with:
- REST API endpoints matching the service patterns
- JWT authentication with `/auth/login` and `/auth/profile`
- Socket.io server with `/scale` namespace for real-time weighing
- CORS configured for frontend domain