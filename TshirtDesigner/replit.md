# TeeDesign Studio - Custom T-Shirt E-commerce Platform

## Overview

TeeDesign Studio is a full-stack e-commerce application that allows customers to browse and purchase T-shirts while offering a built-in design studio for creating custom designs. The platform includes an admin panel for product and order management, user authentication, shopping cart functionality, and a comprehensive wishlist system.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript using Vite for fast development and building
- **Routing**: Wouter for client-side routing with protected routes for authenticated users
- **State Management**: TanStack React Query for server state management and caching
- **UI Framework**: Radix UI components with shadcn/ui design system
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **Forms**: React Hook Form with Zod validation for type-safe form handling

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Authentication**: Passport.js with local strategy using session-based auth
- **Session Storage**: PostgreSQL-backed sessions using connect-pg-simple
- **Password Security**: Node.js crypto module with scrypt for password hashing

### Data Storage Solutions
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Schema Design**: Comprehensive relational schema including:
  - Users with role-based access (customer/admin)
  - Products with categories, colors, sizes, and stock management
  - Custom designs with JSON storage for canvas data
  - Shopping cart and wishlist functionality
  - Orders with detailed item tracking
- **Connection**: Neon serverless PostgreSQL with connection pooling

### Authentication and Authorization
- **Strategy**: Session-based authentication with Passport.js local strategy
- **Security**: Scrypt-based password hashing with salt for secure storage
- **Session Management**: PostgreSQL session store for scalable session handling
- **Role-based Access**: Admin and customer roles with protected routes
- **CSRF Protection**: Built into session configuration

### External Dependencies

#### Core Framework Dependencies
- **@neondatabase/serverless**: Serverless PostgreSQL database connection
- **drizzle-orm**: Type-safe ORM with PostgreSQL dialect
- **express**: Web application framework for Node.js
- **passport**: Authentication middleware with local strategy

#### Frontend UI Dependencies
- **@radix-ui/***: Complete primitive component library for accessible UI
- **@tanstack/react-query**: Server state management and caching
- **react-hook-form**: Performant forms with easy validation
- **@hookform/resolvers**: Zod resolver for form validation
- **tailwindcss**: Utility-first CSS framework

#### Development and Build Tools
- **vite**: Fast build tool and development server
- **typescript**: Static type checking
- **esbuild**: Fast JavaScript bundler for production builds
- **tsx**: TypeScript execution engine for development

#### Authentication and Session Management
- **express-session**: Session middleware for Express
- **connect-pg-simple**: PostgreSQL session store
- **passport-local**: Username/password authentication strategy

The architecture follows a clear separation between client and server with shared TypeScript schemas, ensuring type safety across the full stack. The design supports both ready-made product purchases and custom design creation through an integrated canvas-based design studio.

## Recent Changes

### September 22, 2025 - Replit Environment Setup
- Successfully imported GitHub repository and configured for Replit environment
- Installed all Node.js dependencies (593 packages)
- Configured PostgreSQL database with proper environment variables
- Initialized database schema using Drizzle ORM
- Verified application runs correctly on port 5000 with proper host configuration
- Set up development workflow for continuous development
- Configured deployment settings for production with autoscale target
- Application now fully functional in Replit environment