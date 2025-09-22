# TeeDesign Studio - Custom T-Shirt E-commerce Platform

## Overview

TeeDesign Studio is a full-stack e-commerce application that allows customers to browse and purchase T-shirts while offering a built-in design studio for creating custom designs. The platform includes comprehensive user and admin functionality with features like product catalog, custom design tools, shopping cart, order management, and user authentication. The application supports both customer-facing features (browsing, designing, purchasing) and administrative features (product management, order tracking, user management).

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript using Vite for fast development and building
- **Routing**: Wouter for client-side routing with protected routes for authenticated users
- **State Management**: TanStack React Query for server state management and caching
- **UI Framework**: Radix UI components with shadcn/ui design system providing accessible, customizable components
- **Styling**: Tailwind CSS with custom CSS variables for theming and responsive design
- **Forms**: React Hook Form with Zod validation for type-safe form handling and client-side validation
- **Design Tools**: Custom canvas implementation for T-shirt design studio (prepared for Fabric.js integration)

### Backend Architecture
- **Runtime**: Node.js with Express.js framework using ES modules
- **Language**: TypeScript with strict type checking throughout the application
- **Authentication**: Passport.js with local strategy using session-based authentication
- **Session Storage**: PostgreSQL-backed sessions using connect-pg-simple for scalable session management
- **Password Security**: Node.js crypto module with scrypt for secure password hashing with salt
- **API Design**: RESTful API endpoints with proper error handling and validation

### Data Storage Solutions
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Schema Design**: Comprehensive relational schema including:
  - Users with role-based access control (customer/admin)
  - Products with categories, colors, sizes, and inventory management
  - Custom designs with JSON storage for canvas data and user association
  - Shopping cart and wishlist functionality with product relationships
  - Orders with detailed order items tracking and status management
  - Reviews and ratings system for products
- **Migrations**: Drizzle Kit for database schema migrations and management
- **Connection Pooling**: PostgreSQL connection pooling for efficient database connections

### Authentication and Authorization
- **Strategy**: Session-based authentication with Passport.js local strategy for secure user management
- **Password Security**: Scrypt-based password hashing with unique salt for each password
- **Session Management**: PostgreSQL session store for scalable and persistent session handling
- **Role-based Access**: Differentiated access between customer and admin roles with route protection
- **Protected Routes**: Frontend route protection ensuring authenticated access to sensitive areas

## External Dependencies

### Core Framework Dependencies
- **PostgreSQL Database**: Primary data storage using connection string from DATABASE_URL environment variable
- **Drizzle ORM**: Type-safe database operations with PostgreSQL dialect and schema management
- **Express.js**: Web application framework for Node.js providing API endpoints and middleware
- **React Query**: Server state management and caching for efficient data fetching
- **Passport.js**: Authentication middleware with local strategy support

### UI and Styling Dependencies
- **Radix UI**: Comprehensive set of low-level UI primitives for building accessible design systems
- **Tailwind CSS**: Utility-first CSS framework with custom theming and responsive design
- **Shadcn/ui**: Pre-built component library based on Radix UI with consistent design patterns
- **Lucide React**: Icon library providing consistent iconography throughout the application

### Development and Build Tools
- **Vite**: Fast development server and build tool with TypeScript support
- **TypeScript**: Static type checking for both frontend and backend code
- **ESBuild**: Fast JavaScript bundler for production builds
- **PostCSS**: CSS processing with Tailwind CSS and Autoprefixer plugins

### Validation and Forms
- **Zod**: Schema validation library for runtime type checking and form validation
- **React Hook Form**: Performant form library with minimal re-renders and validation integration
- **Drizzle-Zod**: Integration between Drizzle ORM and Zod for database schema validation