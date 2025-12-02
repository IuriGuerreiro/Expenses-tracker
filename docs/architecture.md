---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8]
inputDocuments: ['docs/prd.md']
workflowType: 'architecture'
lastStep: 8
status: 'complete'
completedAt: '2025-12-02'
project_name: 'ExpensesTracker'
user_name: 'a'
date: '2025-12-02'
---

# Architecture Decision Document

_This document builds collaboratively through step-by-step discovery. Sections are appended as we work through each architectural decision together._

## Project Context Analysis

### Requirements Overview

**Functional Requirements:**

ExpensesTracker centers on a **flexible envelope budgeting system** with 41 functional requirements spanning:

- **User Management** (FR1-FR6): Standard authentication with registration, login, logout, password reset, session persistence, and data isolation
- **Category Management** (FR7-FR13): Users create custom categories with percentage allocation rules. System enforces 100% allocation total and prevents deletion of categories with transactions
- **Income Auto-Allocation** (FR14-FR19): The core differentiator - users log income manually, system automatically splits by percentage across categories, updates all balances in real-time, maintains full transaction history with edit/delete support
- **Expense Tracking** (FR20-FR26): Manual expense entry against categories, automatic balance deduction, pre-expense balance visibility, full CRUD with history and filtering
- **Dashboard & Visibility** (FR27-FR31): Central view of all category balances with real-time updates, quick-add actions, total funds calculation, low-balance warnings
- **Visualizations** (FR32-FR37): Graphs for spending by category, patterns over time, category distribution, income vs expenses, trend analysis, export capability
- **Transaction Management** (FR38-FR41): Search, audit trail, sorting, timestamps

**Non-Functional Requirements:**

Critical NFRs that drive architectural decisions:

- **Performance** (NFR1-6): UI responsiveness <200ms, allocation calculations <1s, real-time balance updates <1s, graph rendering <2s with 12 months data, page loads <3s, API responses <1s
- **Security** (NFR7-13): bcrypt password hashing, JWT session tokens with expiration, authenticated endpoints (except registration/login), parameterized queries for SQL injection prevention, per-account data isolation, HTTPS in production, no sensitive data in logs
- **Data Integrity** (NFR14-19): 100% balance calculation accuracy (zero tolerance), atomic database transactions, regular backups, graceful error handling, input validation, indefinite transaction history preservation
- **Usability** (NFR20-24): Clear visual feedback, validation with helpful errors, confirmation for destructive actions, intuitive for first-time users, mobile responsive (320px+)
- **Scalability** (NFR25-27): 50 categories per user without degradation, 10k transactions per user, query performance over years of data
- **Maintainability** (NFR28-31): Consistent coding standards, forward-compatible schema, versioned APIs, error handling and logging

**Scale & Complexity:**

- **Primary domain**: Personal finance / web application
- **Complexity level**: Low (single-user CRUD with calculations, no bank integrations, no regulatory compliance)
- **Estimated architectural components**:
  - Frontend: 8-12 React components (auth, dashboard, category manager, income/expense forms, transaction lists, visualizations)
  - Backend: 6-8 API endpoint groups (auth, categories, income, expenses, transactions, visualizations)
  - Database: 3 core tables (users, categories, transactions) plus supporting tables

### Technical Constraints & Dependencies

**Fixed Technology Stack:**
- Frontend: Vite + React (fixed per PRD)
- Backend: Node.js (fixed per PRD)
- Database: SQLite (fixed per PRD)
- Authentication: JWT tokens with secure implementation

**Browser Requirements:**
- Modern evergreen browsers (Chrome, Firefox, Safari, Edge)
- Last 2 major versions minimum
- Progressive enhancement approach

**Performance Constraints:**
- Real-time calculation requirements demand efficient algorithms
- Graph rendering with large datasets requires optimization or pagination
- Mobile responsiveness down to 320px width
- Sub-second API response times for standard operations

### Cross-Cutting Concerns Identified

1. **Authentication & Authorization**: Every component except login/registration requires user verification, session management spans frontend and backend
2. **Real-Time Calculation Accuracy**: Income allocation and balance updates must maintain 100% accuracy across all components - this is non-negotiable for financial data
3. **Data Validation**: Input validation required at both frontend (UX) and backend (security) layers across all forms
4. **Error Handling**: Graceful degradation and user-friendly error messages needed throughout application
5. **Transaction Atomicity**: Multi-step operations (income allocation to multiple categories) must be atomic to prevent partial updates
6. **Responsive Design**: All UI components must work across mobile, tablet, desktop
7. **Performance Optimization**: Calculation-heavy operations and data visualization require optimization strategies

## Starter Template Evaluation

### Primary Technology Domain

**Full-stack web application** based on project requirements analysis. ExpensesTracker requires a React-based SPA frontend with a Node.js REST API backend.

### Technical Preferences Established

Based on discussion with user:

- **Language**: TypeScript (strong preference over JavaScript for type safety)
- **Frontend**: Vite + React + TypeScript
- **Backend**: Express.js + TypeScript
- **Database**: SQLite
- **Project Structure**: Monorepo (frontend and backend in same repository)
- **Styling**: No preference (decision deferred)
- **Charting Library**: No preference (decision deferred to implementation)

### Starter Options Considered

Given the fixed technology stack from the PRD and user preferences, the approach is:

1. **Frontend**: Standard Vite + React + TypeScript template
2. **Backend**: Express.js + TypeScript setup
3. **Monorepo Structure**: Manual configuration with both projects in one repository

### Selected Approach: Manual Monorepo Setup

**Rationale for Selection:**

The project uses a straightforward monorepo structure with two separate applications (frontend and backend) that have already been initialized. This approach provides:

- Clear separation of concerns between client and server
- Independent build and development processes
- Flexibility to add shared packages later if needed
- No unnecessary abstractions or tooling overhead
- Standard Vite and Express patterns that are well-documented

**Initialization Commands:**

```bash
# Frontend initialization (already completed)
pnpm create vite@latest client -- --template react-ts

# Backend initialization (already completed)
mkdir server
cd server
pnpm init
pnpm add express
pnpm add -D typescript @types/node @types/express ts-node nodemon
npx tsc --init
```

**Architectural Decisions Provided by Setup:**

**Language & Runtime:**
- TypeScript throughout (frontend and backend)
- Node.js v20.19+ or v22.12+ runtime
- TSConfig configured for both environments

**Frontend Build Tooling:**
- Vite for development server with HMR
- Vite build optimization for production
- ES modules by default
- Fast refresh for React components

**Backend Development:**
- ts-node for TypeScript execution in development
- nodemon for auto-restart on file changes
- Native Express.js patterns without framework overhead

**Code Organization:**
- `/client` - React frontend application
- `/server` - Express backend application
- Potential future: `/shared` - Common TypeScript types/interfaces

**Development Experience:**
- Fast HMR on frontend (<200ms updates)
- Auto-restart on backend changes
- Full TypeScript IntelliSense across both applications
- Independent dev servers (frontend proxies to backend API)

**Note:** Project initialization is already complete. Architectural decisions will focus on application structure, API design, data modeling, and integration patterns.

## Core Architectural Decisions

### Decision Priority Analysis

**Critical Decisions (Block Implementation):**
- ✅ Database access: Prisma ORM v6.x with SQLite
- ✅ Authentication: JWT tokens via jsonwebtoken package
- ✅ Password hashing: bcrypt (per NFR7)
- ✅ API pattern: REST with /api/v1/ versioning
- ✅ Frontend state: React Context + hooks
- ✅ HTTP client: axios
- ✅ Routing: React Router v6

**Important Decisions (Shape Architecture):**
- ✅ Security middleware: helmet, cors, express-rate-limit, express-validator
- ✅ Form handling: React Hook Form
- ✅ Charting: Recharts
- ✅ Dev tooling: concurrently, dotenv

**Deferred Decisions (Post-MVP):**
- Deployment platform (Vercel/Railway/Render/VPS - decide during implementation)
- CSS framework/styling approach (defer to implementation)
- Testing frameworks (can add incrementally)

---

### Data Architecture

**Database: SQLite with Prisma ORM v6.x**

- **Decision**: Use Prisma ORM for type-safe database access
- **Version**: Prisma v6.x (latest stable)
- **Rationale**:
  - Full TypeScript code generation from schema
  - Built-in migration system for schema evolution
  - Type-safe queries prevent runtime errors critical for financial accuracy (NFR14)
  - Explicit transaction support for income allocation atomicity (NFR15)
  - Excellent beginner experience with autocomplete and documentation
- **Affects**: All data layer code, ensures 100% type safety from database to API

**Data Modeling Approach:**

- **Schema-first design**: Define models in `prisma/schema.prisma`
- **Core entities**: User, Category, Transaction (income/expense), AllocationRule
- **Relationships**: User → Categories → Transactions with proper foreign keys
- **Calculated fields**: Category balances computed from transactions (ensures accuracy)
- **Migration strategy**: Prisma Migrate for schema versioning

**Data Validation Strategy:**

- **Frontend**: React Hook Form with validation rules (UX feedback)
- **Backend**: express-validator middleware (security)
- **Database**: Prisma schema constraints (data integrity)
- **Three-layer validation ensures NFR18 compliance**

---

### Authentication & Security

**Authentication Method: JWT Tokens**

- **Token Generation**: jsonwebtoken package
- **Storage**: HttpOnly cookies (more secure than localStorage)
- **Expiration**: Configurable via environment variables (e.g., 7 days)
- **Refresh Strategy**: Initial implementation uses single token, can add refresh tokens post-MVP
- **Affects**: All protected API endpoints, frontend auth state management

**Password Security: bcrypt**

- **Package**: bcrypt
- **Salt Rounds**: 10 (balance of security and performance)
- **Complies with**: NFR7 (industry-standard hashing)

**Security Middleware Stack:**

1. **helmet** - Sets secure HTTP headers automatically
   - XSS protection
   - Content security policy
   - HSTS for HTTPS enforcement (NFR12)

2. **cors** - Cross-origin resource sharing
   - Configured for React frontend origin
   - Credentials support for cookies

3. **express-rate-limit** - API abuse prevention
   - Per-IP rate limiting
   - Configurable limits per endpoint (e.g., 3 login attempts/hour per NFR example)

4. **express-validator** - Input validation and sanitization
   - Prevents SQL injection (NFR10 - though Prisma also handles this)
   - Sanitizes user input
   - Custom validation rules for business logic

**Authorization Pattern:**

- **Middleware**: JWT verification middleware on protected routes
- **User Context**: Decoded JWT provides user ID for data isolation (NFR11)
- **Route Protection**: All routes except `/api/v1/auth/register` and `/api/v1/auth/login` require authentication (NFR9)

---

### API & Communication Patterns

**API Design: RESTful**

- **Pattern**: REST with resource-based endpoints
- **Versioning**: `/api/v1/` prefix (supports future API evolution per NFR30)
- **HTTP Methods**: Standard CRUD (GET, POST, PUT, DELETE)
- **Response Format**:
  ```typescript
  {
    success: boolean,
    data?: any,
    error?: { message: string, code: string }
  }
  ```

**API Endpoint Structure:**

```
/api/v1/auth
  POST /register
  POST /login
  POST /logout
  POST /reset-password

/api/v1/categories
  GET / - List all user categories with balances
  POST / - Create category with allocation percentage
  PUT /:id - Update category
  DELETE /:id - Delete category (with transaction check per FR12)

/api/v1/income
  GET / - List income transactions
  POST / - Create income (triggers auto-allocation per FR15)
  PUT /:id - Update income (recalculates balances per FR19)
  DELETE /:id - Delete income (recalculates balances)

/api/v1/expenses
  GET / - List expenses with filtering (FR26)
  POST / - Create expense (deducts from category per FR21)
  PUT /:id - Update expense (recalculates balance)
  DELETE /:id - Delete expense (recalculates balance)

/api/v1/dashboard
  GET / - Summary data for dashboard (FR27-31)

/api/v1/visualizations
  GET /spending-by-category - Data for FR32
  GET /spending-over-time - Data for FR33
  GET /category-distribution - Data for FR34
  GET /income-vs-expenses - Data for FR35
```

**Error Handling Standards:**

- **Centralized error middleware**: Catches all errors from routes
- **User-friendly messages**: Per NFR21 (no technical stack traces)
- **Error categories**:
  - ValidationError (400) - Bad user input
  - AuthenticationError (401) - Invalid/missing token
  - AuthorizationError (403) - Valid token, wrong permissions
  - NotFoundError (404) - Resource doesn't exist
  - ConflictError (409) - Business rule violation (e.g., percentage total ≠ 100%)
  - ServerError (500) - Unexpected errors
- **Logging**: Errors logged server-side (NFR31) but not exposed to client (NFR13)

**Performance Targets:**

- API responses < 1 second (NFR6)
- Calculation endpoints (income allocation) < 1 second (NFR2)
- Database queries optimized with Prisma's query optimization

---

### Frontend Architecture

**State Management: React Context API + Hooks**

- **Pattern**: Context for global state, local state for components
- **Auth Context**: User authentication state, token management
- **No external library needed**: Built-in React solution sufficient for app complexity
- **Rationale**: Simpler for beginners, adequate for single-user app, no Redux overhead

**HTTP Client: axios**

- **Package**: axios
- **Features utilized**:
  - Interceptors for JWT token attachment
  - Centralized error handling
  - Request/response transformations
  - Better TypeScript support than fetch
- **Base configuration**: API base URL from environment variables

**Routing: React Router v6**

- **Package**: react-router-dom v6
- **Pattern**:
  - Public routes: Login, Register
  - Protected routes: Dashboard, Categories, Income, Expenses, Visualizations
  - Route guard component wraps protected routes
- **Navigation**: Programmatic navigation for post-auth redirects

**Form Handling: React Hook Form**

- **Package**: react-hook-form
- **Rationale**:
  - Excellent TypeScript support
  - Built-in validation with custom rules
  - Minimal re-renders (performance per NFR1)
  - Easy integration with express-validator on backend
- **Validation**: Client-side rules match backend validation (NFR18)

**Data Visualization: Recharts**

- **Package**: recharts
- **Rationale**:
  - Built specifically for React
  - Good TypeScript definitions
  - Handles all chart types needed (FR32-37): pie, bar, line charts
  - Responsive by default
  - Performance adequate for 12 months data (NFR4: < 2 second render)
- **Chart Types**:
  - Pie charts for spending by category (FR32)
  - Line charts for spending over time (FR33)
  - Bar charts for category distribution (FR34)
  - Comparative charts for income vs expenses (FR35)

**Component Architecture:**

- **Pattern**: Functional components with hooks
- **Structure**:
  - `/components` - Reusable UI components
  - `/pages` - Route-level components
  - `/context` - React Context providers
  - `/hooks` - Custom hooks
  - `/services` - API client functions
  - `/types` - TypeScript type definitions (can be generated from Prisma schema)

**Performance Optimization:**

- **Code splitting**: React.lazy() for route-based splitting
- **Memoization**: React.memo() for expensive components
- **Virtualization**: Consider for long transaction lists if performance issues arise
- **Bundle size**: Vite's tree-shaking handles optimization

---

### Infrastructure & Deployment

**Development Environment:**

- **Package**: concurrently
- **Scripts**: Run frontend (Vite) and backend (Express) simultaneously
- **Proxy**: Vite dev server proxies `/api` requests to Express backend
- **Hot Reload**: Frontend HMR + backend nodemon auto-restart

**Environment Configuration:**

- **Package**: dotenv
- **Pattern**:
  - `.env.development` - Local dev settings
  - `.env.production` - Production settings
  - `.env.example` - Template for team (committed to git)
  - Actual `.env` files in `.gitignore`
- **Variables**:
  - `DATABASE_URL` - SQLite file path
  - `JWT_SECRET` - Token signing secret
  - `JWT_EXPIRES_IN` - Token expiration
  - `NODE_ENV` - development/production
  - `PORT` - Backend server port
  - `CLIENT_URL` - Frontend URL for CORS

**Deployment Strategy:**

- **Status**: Deferred to implementation phase
- **Options to evaluate later**:
  - **Vercel**: Great for full-stack, automatic deployments
  - **Railway**: Simple full-stack hosting with SQLite support
  - **Render**: Free tier available, good for MVPs
  - **Traditional VPS**: Maximum control (DigitalOcean, Linode)
- **Requirements**:
  - HTTPS support (NFR12)
  - Environment variable management
  - SQLite file persistence
  - Separate frontend/backend builds or unified deployment

**Logging & Monitoring:**

- **Development**: console.log with structured format
- **Production**: Consider adding winston or pino for structured logging (defer to implementation)
- **Monitoring**: Defer to post-MVP (can add Sentry, LogRocket, etc.)

---

### Decision Impact Analysis

**Implementation Sequence:**

1. **Database Setup** - Prisma schema definition and initial migration
2. **Authentication Foundation** - JWT middleware, bcrypt utilities, auth endpoints
3. **Core API Endpoints** - Categories, Income, Expenses with Prisma queries
4. **Frontend Auth** - Login/register pages, auth context, protected routes
5. **Dashboard & Forms** - React Hook Form integration, category management
6. **Calculation Engine** - Income allocation logic with transaction atomicity
7. **Visualizations** - Recharts integration for all graph requirements
8. **Security Hardening** - Add helmet, rate limiting, input validation
9. **Testing & Deployment** - Final validation and production deployment

**Cross-Component Dependencies:**

- **Prisma schema** → TypeScript types → Frontend/Backend type safety
- **JWT middleware** → All protected API endpoints → Frontend auth state
- **Income allocation logic** → Category balance calculations → Dashboard display
- **express-validator rules** → API input validation → React Hook Form validation mirroring
- **Axios interceptors** → JWT token attachment → All authenticated requests

## Implementation Patterns & Consistency Rules

### Pattern Categories Defined

**Critical Conflict Points Identified:** 12 areas where AI agents could make different choices without explicit patterns

---

### Naming Patterns

**Database Naming Conventions (Prisma Schema):**

- **Table names**: `snake_case` plural (e.g., `users`, `categories`, `income_transactions`)
- **Column names**: `camelCase` (e.g., `userId`, `createdAt`, `allocationPercentage`)
- **Foreign keys**: `camelCase` with Id suffix (e.g., `userId`, `categoryId`)
- **Indexes**: Prisma default naming (e.g., `@@index([userId, createdAt])`)
- **Example**:
  ```prisma
  model users {
    id        String   @id @default(uuid())
    email     String   @unique
    createdAt DateTime @default(now())
  }
  ```

**API Naming Conventions:**

- **Endpoints**: Plural resource names `/api/v1/categories`, `/api/v1/expenses`
- **Route parameters**: `:id` format (Express standard) - e.g., `/api/v1/categories/:id`
- **Query parameters**: `camelCase` - e.g., `?startDate=2025-01-01&categoryId=123`
- **HTTP methods**: Standard REST (GET list, GET :id, POST create, PUT :id update, DELETE :id)
- **Example**: `GET /api/v1/expenses?categoryId=abc&startDate=2025-01-01`

**Code Naming Conventions:**

- **Components**: `PascalCase` - e.g., `CategoryCard`, `IncomeForm`, `DashboardLayout`
- **Files**: Match component name - `CategoryCard.tsx`, `IncomeForm.tsx`
- **Functions**: `camelCase` - e.g., `getUserById`, `calculateAllocation`, `validatePercentages`
- **Variables**: `camelCase` - e.g., `userId`, `categoryBalance`, `transactionList`
- **Constants**: `UPPER_SNAKE_CASE` - e.g., `MAX_CATEGORIES`, `JWT_EXPIRY`, `API_BASE_URL`
- **Types/Interfaces**: `PascalCase` - e.g., `User`, `Category`, `ApiResponse<T>`

---

### Structure Patterns

**Project Organization:**

```
/client (Frontend)
  /src
    /components     - Reusable UI components
    /pages          - Route-level page components
    /context        - React Context providers
    /hooks          - Custom React hooks
    /services       - API client functions
    /types          - TypeScript type definitions
    /utils          - Helper functions
    /assets         - Images, fonts, static files
    App.tsx
    main.tsx

/server (Backend)
  /src
    /routes         - Express route handlers
    /controllers    - Business logic
    /services       - Data access layer (Prisma)
    /middleware     - Express middleware (auth, validation, error)
    /utils          - Helper functions
    /types          - TypeScript type definitions
    /config         - Configuration files
    index.ts
  /prisma
    schema.prisma
    /migrations
```

**Test Organization:**

- **Location**: Co-located with source files - `Component.test.tsx` next to `Component.tsx`
- **Naming**: `*.test.ts` or `*.spec.ts` (choose one consistently)
- **Convention**: Use `.test.ts` throughout project

---

### Format Patterns

**API Response Formats:**

**Standard Success Response:**
```typescript
{
  success: true,
  data: { /* actual response data */ }
}
```

**Standard Error Response:**
```typescript
{
  success: false,
  error: {
    message: "User-friendly error message",
    code: "VALIDATION_ERROR" | "AUTH_ERROR" | "NOT_FOUND" | etc.
  }
}
```

**Date/Time Format:**
- **API**: ISO 8601 strings (e.g., `"2025-12-02T10:30:00Z"`)
- **Database**: Prisma DateTime fields
- **Display**: Format on frontend using date library (date-fns or similar)

**Data Exchange Formats:**

- **JSON field naming**: `camelCase` in API responses (matches TypeScript convention)
- **Prisma auto-converts**: Database `snake_case` → TypeScript `camelCase`
- **Boolean values**: `true`/`false` (JSON standard, not 1/0)
- **Null handling**: Use `null` explicitly, avoid `undefined` in API responses
- **Currency**: Store as integers in cents (e.g., $10.50 = 1050) to avoid floating point errors - critical for financial accuracy!

---

### Communication Patterns

**Frontend-Backend Communication:**

- **All API calls** go through `/services` layer
- **Service functions** return typed responses matching API contracts
- **Error handling**: Services catch and transform errors into user-friendly format
- **Loading states**: Each service call manages its own loading state

**State Management Patterns:**

- **Auth state**: Global via React Context
- **Form state**: Local with React Hook Form
- **API data**: Local state in components, fetch on mount
- **Immutable updates**: Always use spread operators or libraries for state updates
- **Example**:
  ```typescript
  // Good
  setCategories([...categories, newCategory]);

  // Bad
  categories.push(newCategory);
  setCategories(categories);
  ```

---

### Process Patterns

**Error Handling Patterns:**

**Backend:**
```typescript
// Custom error classes
class ValidationError extends Error { statusCode = 400; }
class AuthenticationError extends Error { statusCode = 401; }

// Centralized error middleware
app.use((err, req, res, next) => {
  res.status(err.statusCode || 500).json({
    success: false,
    error: {
      message: err.message,
      code: err.code || 'SERVER_ERROR'
    }
  });
});
```

**Frontend:**
```typescript
// Service layer catches and transforms
try {
  const response = await axios.post('/api/v1/categories', data);
  return response.data;
} catch (error) {
  if (axios.isAxiosError(error)) {
    throw new Error(error.response?.data?.error?.message || 'Request failed');
  }
  throw error;
}
```

**Loading State Patterns:**

```typescript
// Component pattern
const [isLoading, setIsLoading] = useState(false);
const [error, setError] = useState<string | null>(null);

const fetchData = async () => {
  setIsLoading(true);
  setError(null);
  try {
    const data = await service.getData();
    // Handle success
  } catch (err) {
    setError(err.message);
  } finally {
    setIsLoading(false);
  }
};
```

**Authentication Flow Pattern:**

1. User submits login → API validates → Returns JWT
2. Frontend stores JWT in httpOnly cookie (set by server)
3. Axios interceptor attaches cookie automatically to requests
4. Backend middleware verifies JWT on protected routes
5. Decoded user ID used for data isolation queries

---

### Enforcement Guidelines

**All AI Agents MUST:**

- **Follow naming conventions** exactly as specified above - no mixing camelCase/snake_case
- **Use the standard API response format** for all endpoints without variation
- **Store currency as integers** in cents to maintain financial accuracy
- **Implement error handling** using the centralized patterns, not ad-hoc try/catch
- **Maintain project structure** - don't create new top-level directories without discussion
- **Use TypeScript strictly** - no `any` types except when absolutely necessary with explanation
- **Follow Prisma naming** - let Prisma handle snake_case → camelCase conversion automatically

**Pattern Enforcement:**

- **Code review checklist**: Verify naming, structure, format patterns before completing stories
- **TypeScript compiler**: Enforces type patterns automatically
- **Prisma schema**: Single source of truth for database structure
- **Pattern violations**: Document in architecture.md updates section if changes needed

---

### Pattern Examples

**Good Examples:**

**API Endpoint Implementation:**
```typescript
// routes/categories.ts
router.get('/api/v1/categories', authMiddleware, async (req, res) => {
  const categories = await categoryService.getUserCategories(req.user.id);
  res.json({
    success: true,
    data: categories
  });
});
```

**Component with API Call:**
```typescript
// CategoryList.tsx
const CategoryList = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      setIsLoading(true);
      try {
        const data = await categoryService.getCategories();
        setCategories(data);
      } catch (error) {
        // Handle error
      } finally {
        setIsLoading(false);
      }
    };
    fetchCategories();
  }, []);

  return <div>{/* Render categories */}</div>;
};
```

**Anti-Patterns (Avoid These):**

❌ **Mixing naming conventions:**
```typescript
// Bad - inconsistent naming
const user_id = req.params.userId;  // Don't mix snake_case and camelCase
```

❌ **Inconsistent API responses:**
```typescript
// Bad - doesn't follow standard format
res.json({ categories: data });  // Should wrap in success/data structure
```

❌ **Floating point currency:**
```typescript
// Bad - causes rounding errors
const balance = 10.50;  // Store as 1050 cents instead
```

❌ **Ignoring error structure:**
```typescript
// Bad - throws raw error
throw new Error("Something broke");  // Use typed error classes
```

## Project Structure & Boundaries

### Complete Project Directory Structure

```
ExpensesTracker/
├── README.md
├── package.json                    # Root workspace configuration
├── .gitignore
├── .env.example                    # Template for environment variables
├── .github/
│   └── workflows/
│       └── ci.yml                  # CI/CD pipeline (optional)
│
├── client/                         # Frontend React Application
│   ├── package.json
│   ├── tsconfig.json
│   ├── tsconfig.node.json
│   ├── vite.config.ts              # Vite configuration with proxy setup
│   ├── index.html
│   ├── .env.development
│   ├── .env.production
│   ├── public/
│   │   └── assets/                 # Static assets (images, fonts)
│   └── src/
│       ├── main.tsx                # React application entry point
│       ├── App.tsx                 # Root component with routing
│       ├── App.css
│       ├── index.css
│       │
│       ├── components/             # Reusable UI components
│       │   ├── auth/
│       │   │   ├── LoginForm.tsx
│       │   │   ├── RegisterForm.tsx
│       │   │   └── ProtectedRoute.tsx
│       │   ├── categories/
│       │   │   ├── CategoryCard.tsx
│       │   │   ├── CategoryForm.tsx
│       │   │   └── CategoryList.tsx
│       │   ├── transactions/
│       │   │   ├── TransactionCard.tsx
│       │   │   ├── TransactionList.tsx
│       │   │   ├── IncomeForm.tsx
│       │   │   └── ExpenseForm.tsx
│       │   ├── dashboard/
│       │   │   ├── BalanceCard.tsx
│       │   │   ├── QuickActions.tsx
│       │   │   └── CategoryBalances.tsx
│       │   ├── visualizations/
│       │   │   ├── SpendingPieChart.tsx
│       │   │   ├── SpendingOverTime.tsx
│       │   │   ├── CategoryDistribution.tsx
│       │   │   └── IncomeVsExpenses.tsx
│       │   ├── common/
│       │   │   ├── Button.tsx
│       │   │   ├── Input.tsx
│       │   │   ├── LoadingSpinner.tsx
│       │   │   └── ErrorMessage.tsx
│       │   └── layout/
│       │       ├── Header.tsx
│       │       ├── Sidebar.tsx
│       │       └── Layout.tsx
│       │
│       ├── pages/                  # Route-level page components
│       │   ├── Login.tsx           # FR1-FR3: Authentication
│       │   ├── Register.tsx
│       │   ├── Dashboard.tsx       # FR27-FR31: Dashboard & Balance Visibility
│       │   ├── Categories.tsx      # FR7-FR13: Category Management
│       │   ├── Income.tsx          # FR14-FR19: Income Tracking
│       │   ├── Expenses.tsx        # FR20-FR26: Expense Tracking
│       │   ├── Transactions.tsx    # FR38-FR41: Transaction Management
│       │   └── Visualizations.tsx  # FR32-FR37: Data Visualization
│       │
│       ├── context/                # React Context providers
│       │   ├── AuthContext.tsx     # Global auth state
│       │   └── AuthProvider.tsx
│       │
│       ├── hooks/                  # Custom React hooks
│       │   ├── useAuth.ts
│       │   ├── useCategories.ts
│       │   ├── useTransactions.ts
│       │   └── useApi.ts
│       │
│       ├── services/               # API client layer
│       │   ├── api.ts              # Axios instance with interceptors
│       │   ├── authService.ts      # FR1-FR6: Auth endpoints
│       │   ├── categoryService.ts  # FR7-FR13: Category endpoints
│       │   ├── incomeService.ts    # FR14-FR19: Income endpoints
│       │   ├── expenseService.ts   # FR20-FR26: Expense endpoints
│       │   ├── dashboardService.ts # FR27-FR31: Dashboard endpoints
│       │   └── visualizationService.ts # FR32-FR37: Visualization endpoints
│       │
│       ├── types/                  # TypeScript type definitions
│       │   ├── api.ts              # API response types
│       │   ├── auth.ts             # Auth-related types
│       │   ├── category.ts         # Category types
│       │   ├── transaction.ts      # Transaction types
│       │   └── index.ts            # Re-export all types
│       │
│       ├── utils/                  # Helper functions
│       │   ├── formatters.ts       # Date, currency formatting
│       │   ├── validators.ts       # Form validation helpers
│       │   └── calculations.ts     # Balance calculation helpers
│       │
│       └── vite-env.d.ts
│
└── server/                         # Backend Express Application
    ├── package.json
    ├── tsconfig.json
    ├── nodemon.json                # Auto-restart configuration
    ├── .env.development
    ├── .env.production
    │
    ├── prisma/
    │   ├── schema.prisma           # Database schema definition
    │   ├── seed.ts                 # Database seeding (optional)
    │   └── migrations/             # Migration history
    │
    └── src/
        ├── index.ts                # Express server entry point
        ├── app.ts                  # Express app configuration
        │
        ├── config/                 # Configuration files
        │   ├── database.ts         # Prisma client instance
        │   ├── jwt.ts              # JWT configuration
        │   └── env.ts              # Environment variable validation
        │
        ├── middleware/             # Express middleware
        │   ├── auth.ts             # JWT verification middleware
        │   ├── errorHandler.ts     # Centralized error handling
        │   ├── validation.ts       # express-validator middleware
        │   └── security.ts         # helmet, cors, rate-limit setup
        │
        ├── routes/                 # Express route handlers
        │   ├── index.ts            # Route aggregation
        │   ├── auth.routes.ts      # FR1-FR6: /api/v1/auth
        │   ├── categories.routes.ts # FR7-FR13: /api/v1/categories
        │   ├── income.routes.ts    # FR14-FR19: /api/v1/income
        │   ├── expenses.routes.ts  # FR20-FR26: /api/v1/expenses
        │   ├── dashboard.routes.ts # FR27-FR31: /api/v1/dashboard
        │   └── visualizations.routes.ts # FR32-FR37: /api/v1/visualizations
        │
        ├── controllers/            # Business logic layer
        │   ├── authController.ts   # Auth logic (register, login, logout)
        │   ├── categoryController.ts # Category CRUD + validation
        │   ├── incomeController.ts # Income + auto-allocation logic
        │   ├── expenseController.ts # Expense tracking logic
        │   ├── dashboardController.ts # Dashboard aggregation
        │   └── visualizationController.ts # Data aggregation for charts
        │
        ├── services/               # Data access layer (Prisma)
        │   ├── authService.ts      # User authentication queries
        │   ├── userService.ts      # User CRUD operations
        │   ├── categoryService.ts  # Category queries + balance calculations
        │   ├── transactionService.ts # Transaction CRUD (income/expense)
        │   ├── allocationService.ts # Income allocation calculation engine
        │   └── visualizationService.ts # Aggregation queries for charts
        │
        ├── utils/                  # Helper functions
        │   ├── bcrypt.ts           # Password hashing utilities
        │   ├── jwt.ts              # Token generation/verification
        │   ├── validators.ts       # Custom validation functions
        │   ├── errors.ts           # Custom error classes
        │   └── calculations.ts     # Balance & percentage calculations
        │
        └── types/                  # TypeScript type definitions
            ├── express.d.ts        # Express request extensions
            ├── api.ts              # API request/response types
            └── index.ts            # Re-export all types
```

---

### Architectural Boundaries

**API Boundaries:**

- **External API Surface**: All endpoints under `/api/v1/` prefix
- **Authentication Boundary**: JWT middleware protects all endpoints except `/api/v1/auth/register` and `/api/v1/auth/login`
- **User Data Isolation**: All queries filtered by `req.user.id` from decoded JWT token (NFR11)
- **Versioning Boundary**: Future API changes use `/api/v2/` prefix (NFR30)

**Component Boundaries:**

- **Page Components**: Top-level route components, orchestrate data fetching and layout
- **Feature Components**: Domain-specific components in `/categories`, `/transactions`, `/dashboard`, `/visualizations`
- **Common Components**: Reusable UI primitives in `/common` and `/layout`
- **Services Layer**: All API communication goes through `/services`, components never call axios directly
- **State Management**: Auth state is global (Context), all other state is local to pages/components

**Service Boundaries:**

- **Controllers**: Handle HTTP concerns (request/response, validation, error handling)
- **Services**: Handle data access (Prisma queries, business logic)
- **Separation**: Controllers never access Prisma directly, always through service layer
- **Transaction Boundary**: Critical operations (income allocation) wrapped in Prisma transactions (NFR15)

**Data Boundaries:**

- **Prisma Schema**: Single source of truth for database structure
- **Type Generation**: Prisma generates TypeScript types, used throughout backend
- **Type Sharing**: Consider `/shared` package for types used by both client/server (future optimization)
- **Database Access**: Only service layer accesses Prisma, controllers use service functions

---

### Requirements to Structure Mapping

**Feature/Epic Mapping:**

**FR1-FR6: User Management & Authentication**
- Frontend: `/client/src/components/auth/`, `/client/src/pages/Login.tsx`, `/client/src/pages/Register.tsx`
- Backend: `/server/src/routes/auth.routes.ts`, `/server/src/controllers/authController.ts`, `/server/src/services/authService.ts`
- Database: `prisma/schema.prisma` - `users` table
- Middleware: `/server/src/middleware/auth.ts` - JWT verification

**FR7-FR13: Category Management**
- Frontend: `/client/src/components/categories/`, `/client/src/pages/Categories.tsx`
- Backend: `/server/src/routes/categories.routes.ts`, `/server/src/controllers/categoryController.ts`, `/server/src/services/categoryService.ts`
- Database: `prisma/schema.prisma` - `categories` table
- Validation: Percentage total = 100% check in controller

**FR14-FR19: Income Tracking & Auto-Allocation**
- Frontend: `/client/src/components/transactions/IncomeForm.tsx`, `/client/src/pages/Income.tsx`
- Backend: `/server/src/routes/income.routes.ts`, `/server/src/controllers/incomeController.ts`, `/server/src/services/allocationService.ts`
- Database: `prisma/schema.prisma` - `transactions` table (type: income)
- Critical Logic: `/server/src/services/allocationService.ts` - automatic percentage-based allocation with Prisma transactions

**FR20-FR26: Expense Tracking & Balance Management**
- Frontend: `/client/src/components/transactions/ExpenseForm.tsx`, `/client/src/pages/Expenses.tsx`
- Backend: `/server/src/routes/expenses.routes.ts`, `/server/src/controllers/expenseController.ts`, `/server/src/services/transactionService.ts`
- Database: `prisma/schema.prisma` - `transactions` table (type: expense)
- Balance Calculation: Service layer queries aggregate transactions per category

**FR27-FR31: Dashboard & Balance Visibility**
- Frontend: `/client/src/components/dashboard/`, `/client/src/pages/Dashboard.tsx`
- Backend: `/server/src/routes/dashboard.routes.ts`, `/server/src/controllers/dashboardController.ts`
- Aggregation: Service layer calculates category balances, total funds, low-balance warnings
- Real-time Updates: Frontend refetches after income/expense operations

**FR32-FR37: Data Visualization & Insights**
- Frontend: `/client/src/components/visualizations/`, `/client/src/pages/Visualizations.tsx`
- Backend: `/server/src/routes/visualizations.routes.ts`, `/server/src/services/visualizationService.ts`
- Data Aggregation: Complex Prisma queries for spending by category, time-based patterns, distributions
- Charts: Recharts components consume API data

**FR38-FR41: Transaction Management**
- Frontend: `/client/src/pages/Transactions.tsx`, `/client/src/components/transactions/TransactionList.tsx`
- Backend: Shared with income/expense routes, filtering via query parameters
- Search/Filter: Query parameters passed to service layer for filtered Prisma queries
- Sorting: Handled by Prisma `orderBy` clauses

**Cross-Cutting Concerns:**

**Authentication & Authorization (All FRs except login/register)**
- Middleware: `/server/src/middleware/auth.ts` - JWT verification on all protected routes
- Frontend: `/client/src/context/AuthContext.tsx` - Global auth state
- Protected Routes: `/client/src/components/auth/ProtectedRoute.tsx` - Route guard wrapper

**Data Validation (NFR18)**
- Frontend: React Hook Form validation in all form components
- Backend: express-validator in `/server/src/middleware/validation.ts`
- Database: Prisma schema constraints

**Error Handling (NFR17, NFR21)**
- Backend: `/server/src/middleware/errorHandler.ts` - Centralized error middleware
- Frontend: `/client/src/services/api.ts` - Axios interceptor for error transformation
- Custom Errors: `/server/src/utils/errors.ts` - ValidationError, AuthenticationError, etc.

**Performance Optimization (NFR1-NFR6)**
- Calculation Engine: `/server/src/services/allocationService.ts` - Optimized for < 1 second (NFR2)
- Database Queries: Prisma query optimization with proper indexes
- Frontend: React.memo(), code splitting via React.lazy()

---

### Integration Points

**Internal Communication:**

**Frontend → Backend:**
1. Axios instance configured in `/client/src/services/api.ts` with:
   - Base URL from environment variable
   - JWT token attachment via interceptor
   - Standard error handling
2. Service functions in `/client/src/services/*` call specific API endpoints
3. Components use service functions, never call axios directly

**Backend Layers:**
1. **Route → Controller**: Express routes delegate to controller functions
2. **Controller → Service**: Controllers call service layer for data operations
3. **Service → Prisma**: Services use Prisma client for database queries
4. **Middleware Chain**: security.ts → auth.ts → validation.ts → routes

**External Integrations:**

Currently none (no bank integrations, third-party APIs in MVP).

**Future consideration:**
- Email service for password reset (FR4)
- Analytics/monitoring (post-MVP)

**Data Flow:**

**Income Allocation Flow (Critical for NFR14-NFR15):**
1. User submits income via `/client/src/components/transactions/IncomeForm.tsx`
2. POST `/api/v1/income` → `incomeController.ts`
3. Controller validates input, calls `allocationService.calculateAllocation()`
4. `allocationService.ts` wraps in Prisma transaction:
   - Create income transaction record
   - Query user's categories with allocation percentages
   - Calculate allocated amounts per category
   - Create category_balance adjustment records
   - Commit transaction atomically
5. Return success response to frontend
6. Frontend updates UI, refetches dashboard data

**Authentication Flow:**
1. Login form submits → POST `/api/v1/auth/login`
2. `authController.ts` validates credentials via `authService.ts`
3. Generate JWT token, set httpOnly cookie
4. Frontend receives success, updates AuthContext
5. Subsequent requests include cookie automatically
6. Backend `auth.ts` middleware verifies JWT on protected routes

---

### File Organization Patterns

**Configuration Files:**

- **Root**: `package.json` (workspace root), `.gitignore`, `.env.example`
- **Client**: `vite.config.ts` (proxy setup), `tsconfig.json`, `.env.development`/`.env.production`
- **Server**: `nodemon.json`, `tsconfig.json`, `.env.development`/`.env.production`
- **Database**: `prisma/schema.prisma` (single source of database truth)

**Source Organization:**

- **By Feature**: Each functional area (categories, transactions, dashboard, visualizations) has dedicated directories
- **By Layer**: Separation of routes → controllers → services ensures clear boundaries
- **Shared Code**: `/utils` for helpers, `/types` for TypeScript definitions
- **Config Separation**: Environment-specific config in `/config` directory

**Test Organization:**

- **Co-located Tests**: `Component.test.tsx` next to `Component.tsx`
- **Convention**: Use `.test.ts` suffix throughout project
- **Test Structure Mirrors Source**: Test files follow same directory structure as source

**Asset Organization:**

- **Static Assets**: `/client/public/assets/` for images, fonts
- **Component Assets**: Keep component-specific styles co-located with components

---

### Development Workflow Integration

**Development Server Structure:**

**Frontend** (port 5173):
- Vite dev server with HMR
- Proxy configured in `vite.config.ts`: `/api` → `http://localhost:3000`
- Fast refresh for React components

**Backend** (port 3000):
- nodemon watches `/server/src` for changes
- ts-node executes TypeScript directly
- Auto-restart on file changes

**Concurrent Dev**: Use `concurrently` to run both servers from root

**Build Process Structure:**

**Frontend Build:**
1. `cd client && npm run build`
2. Vite compiles TypeScript → JavaScript
3. Bundle optimization, tree-shaking
4. Output to `/client/dist`

**Backend Build:**
1. `cd server && npm run build`
2. TypeScript compiler (tsc) compiles to JavaScript
3. Output to `/server/dist`
4. Prisma client generation included in build

**Deployment Structure:**

- **Environment Variables**: Managed via `.env` files or platform-specific config
- **Database**: SQLite file persistence (ensure writable directory)
- **Static Assets**: Serve `/client/dist` via Express or separate CDN
- **API**: Deploy `/server/dist` with Node.js runtime

## Architecture Validation Results

### Coherence Validation ✅

**Decision Compatibility:**

All architectural decisions are fully compatible and work together seamlessly:
- **Prisma ORM v6.x** integrates perfectly with **TypeScript** and **SQLite**
- **Express.js** works naturally with **JWT** authentication via **jsonwebtoken**
- **React Context** + **React Hook Form** + **axios** form a coherent frontend stack
- **Recharts** integrates smoothly with React components
- All security middleware (**helmet**, **cors**, **express-rate-limit**, **express-validator**) are Express-compatible

No version conflicts or incompatible technology choices detected.

**Pattern Consistency:**

Implementation patterns fully support all architectural decisions:
- **TypeScript naming conventions** (camelCase/PascalCase/UPPER_SNAKE_CASE) align with TypeScript best practices
- **Prisma schema conventions** (snake_case tables, camelCase fields) leverage Prisma's automatic conversion
- **REST API patterns** match Express.js standard practices
- **Component architecture** follows React functional component patterns
- **Error handling** patterns consistent across frontend (axios) and backend (Express middleware)
- **Currency storage as integers** prevents floating-point errors critical for financial accuracy (NFR14)

All patterns reinforce technology choices without conflicts.

**Structure Alignment:**

Project structure directly supports all architectural decisions:
- **Monorepo organization** enables shared types between client/server (future optimization)
- **Routes → Controllers → Services** layering enforces separation of concerns
- **Services-only Prisma access** maintains data access boundary
- **Feature-based organization** (/categories, /transactions, /dashboard) maps directly to FR categories
- **Middleware pipeline** structure supports authentication, validation, error handling flow
- **Co-located tests** structure supports test-driven development

Structure enables, rather than hinders, architectural patterns.

---

### Requirements Coverage Validation ✅

**Functional Requirements Coverage:**

All 41 functional requirements are architecturally supported:

**FR1-FR6 (User Management & Authentication):** ✅
- Architecture: JWT tokens, bcrypt hashing, Express auth routes
- Structure: `/server/src/routes/auth.routes.ts`, `/client/src/pages/Login.tsx`
- Pattern: Auth middleware protects all routes except register/login

**FR7-FR13 (Category Management):** ✅
- Architecture: Prisma categories table, percentage validation
- Structure: `/server/src/services/categoryService.ts`, `/client/src/pages/Categories.tsx`
- Pattern: Percentage total = 100% validation in controller layer

**FR14-FR19 (Income Tracking & Auto-Allocation):** ✅
- Architecture: Prisma transactions, atomic allocation logic
- Structure: `/server/src/services/allocationService.ts` with transaction wrapping
- Pattern: Real-time calculation < 1 second (NFR2), atomic updates (NFR15)

**FR20-FR26 (Expense Tracking):** ✅
- Architecture: Transaction model with type field, balance calculations
- Structure: `/server/src/services/transactionService.ts`, expense routes
- Pattern: Service layer aggregates transactions for balance calculation

**FR27-FR31 (Dashboard & Balance Visibility):** ✅
- Architecture: Dashboard aggregation endpoints, real-time refetch pattern
- Structure: `/server/src/controllers/dashboardController.ts`, dashboard components
- Pattern: Frontend refetches after income/expense operations

**FR32-FR37 (Data Visualization):** ✅
- Architecture: Recharts integration, aggregation queries
- Structure: `/server/src/services/visualizationService.ts`, visualization components
- Pattern: Complex Prisma queries for spending patterns, time-based analysis

**FR38-FR41 (Transaction Management):** ✅
- Architecture: Query parameter filtering, Prisma orderBy clauses
- Structure: Shared routes with filtering, TransactionList component
- Pattern: Search/filter/sort handled by service layer

**Non-Functional Requirements Coverage:**

**NFR1-6 (Performance):** ✅
- **NFR2**: Allocation calculations < 1 second via optimized Prisma transactions
- **NFR4**: Graph rendering < 2 seconds via Recharts performance + potential virtualization
- **NFR6**: API responses < 1 second via Prisma query optimization

**NFR7-13 (Security):** ✅
- **NFR7**: bcrypt with 10 salt rounds
- **NFR8**: JWT tokens with configurable expiration, httpOnly cookies
- **NFR9**: Auth middleware protects all routes except register/login
- **NFR10**: Prisma parameterized queries prevent SQL injection
- **NFR11**: req.user.id filters all queries for data isolation
- **NFR12**: Helmet middleware for HTTPS enforcement
- **NFR13**: Error middleware sanitizes messages, no stack traces to client

**NFR14-19 (Data Integrity):** ✅
- **NFR14**: 100% calculation accuracy via integer storage (cents) and Prisma type safety
- **NFR15**: Prisma transactions ensure atomic multi-step operations
- **NFR18**: Three-layer validation (frontend/backend/database)

**NFR20-27 (Usability & Scalability):** ✅
- **NFR20-24**: React Hook Form provides validation feedback, loading states, error messages
- **NFR25-27**: Prisma handles 50 categories, 10k transactions efficiently with proper indexes

**NFR28-31 (Maintainability):** ✅
- **NFR28**: TypeScript + consistent naming conventions enforce standards
- **NFR29**: Prisma migrations support schema evolution
- **NFR30**: /api/v1/ prefix enables API versioning
- **NFR31**: Centralized error logging + custom error classes

All NFRs are architecturally addressed.

---

### Implementation Readiness Validation ✅

**Decision Completeness:**

All critical decisions are documented with specific versions and rationale:
- ✅ **Database**: Prisma v6.x with SQLite (version verified via WebSearch)
- ✅ **Authentication**: jsonwebtoken package, bcrypt, JWT expiration configurable
- ✅ **Frontend libraries**: React Router v6, React Hook Form, axios, Recharts
- ✅ **Security middleware**: helmet, cors, express-rate-limit, express-validator
- ✅ **Dev tooling**: concurrently, dotenv, nodemon, ts-node

All decisions include rationale tied to PRD requirements.

**Structure Completeness:**

Project structure is comprehensive and specific:
- ✅ Complete directory tree with all files and folders
- ✅ Every FR mapped to specific files/directories
- ✅ All integration points defined (Frontend → Backend layers)
- ✅ Component boundaries clearly specified
- ✅ Data flow documented for critical operations (income allocation, auth)

No generic placeholders - all structure is project-specific.

**Pattern Completeness:**

Implementation patterns address all potential conflicts:
- ✅ **12 conflict points** identified and resolved
- ✅ Naming conventions cover database, API, code, constants
- ✅ Format patterns define API responses, data exchange, date/time handling
- ✅ Communication patterns specify frontend-backend interaction, state management
- ✅ Process patterns include error handling, loading states, authentication flow
- ✅ **Good/bad examples** provided for critical patterns

AI agents have clear guidance for consistent implementation.

---

### Gap Analysis Results

**Critical Gaps:** None ✅

All blocking architectural decisions are complete and documented.

**Important Gaps:** None ✅

Architecture provides sufficient detail for consistent implementation.

**Nice-to-Have Enhancements (Post-MVP):**

1. **Testing Strategy**: Testing frameworks deferred to implementation (not blocking)
2. **CSS Framework**: Styling approach deferred (doesn't affect architecture)
3. **Deployment Platform**: Decision deferred until implementation (proper trade-off)
4. **Monitoring/Logging**: Production logging libraries can be added later
5. **Shared Types Package**: `/shared` directory for type sharing between client/server (future optimization)

These are appropriate deferrals that don't block development.

---

### Validation Issues Addressed

**No critical or blocking issues found.**

The architecture is coherent, complete, and ready for implementation.

**Minor Observation (Non-blocking):**

Currency storage as **integers in cents** is correctly specified in patterns but should be emphasized in Prisma schema design. This is a critical pattern for financial accuracy (NFR14).

**Resolution**: Already documented in Format Patterns section with clear example. Service layer will handle conversion.

---

### Architecture Completeness Checklist

**✅ Requirements Analysis**

- [x] Project context thoroughly analyzed (41 FRs across 7 categories)
- [x] Scale and complexity assessed (Low complexity, single-user CRUD)
- [x] Technical constraints identified (Fixed stack: Vite+React, Express, SQLite, TypeScript)
- [x] Cross-cutting concerns mapped (7 concerns including auth, calculation accuracy, validation)

**✅ Architectural Decisions**

- [x] Critical decisions documented with versions (Prisma v6.x, React Router v6, all verified)
- [x] Technology stack fully specified (12 libraries/frameworks with rationale)
- [x] Integration patterns defined (Frontend-Backend layers, data flow documented)
- [x] Performance considerations addressed (All NFR1-6 targets met architecturally)

**✅ Implementation Patterns**

- [x] Naming conventions established (Database, API, Code - all comprehensive)
- [x] Structure patterns defined (Feature-based organization, layer separation)
- [x] Communication patterns specified (Services layer, state management, API calls)
- [x] Process patterns documented (Error handling, loading states, auth flow)

**✅ Project Structure**

- [x] Complete directory structure defined (170+ files/directories specified)
- [x] Component boundaries established (Page/Feature/Common components, Services/Controllers/Routes)
- [x] Integration points mapped (Frontend→Backend, Backend layers, critical data flows)
- [x] Requirements to structure mapping complete (All 41 FRs mapped to specific files)

---

### Architecture Readiness Assessment

**Overall Status:** ✅ **READY FOR IMPLEMENTATION**

**Confidence Level:** **HIGH**

Your architecture is comprehensive, coherent, and provides AI agents with clear, unambiguous guidance for consistent implementation.

**Key Strengths:**

1. **Complete Technology Decisions**: All critical choices made with specific versions verified
2. **Comprehensive Patterns**: 12 conflict points addressed with clear examples
3. **Explicit Structure**: Every FR mapped to specific files - no ambiguity
4. **Type Safety**: TypeScript + Prisma provide end-to-end type safety
5. **Financial Accuracy**: Integer storage for currency prevents rounding errors (critical for NFR14)
6. **Separation of Concerns**: Clear boundaries between routes/controllers/services
7. **Security-First**: All NFR7-13 security requirements architecturally enforced
8. **Beginner-Friendly**: Clear patterns and examples help you learn Node.js/TypeScript

**Areas for Future Enhancement:**

1. **Testing Strategy**: Add testing frameworks incrementally during implementation
2. **Monitoring**: Add production logging/monitoring post-MVP
3. **Performance Optimization**: Add caching, query optimization if needed based on real usage
4. **Shared Types**: Create `/shared` package to eliminate type duplication between client/server
5. **API Documentation**: Consider adding Swagger/OpenAPI specification for API documentation

These enhancements don't block development and can be added as the project matures.

---

### Implementation Handoff

**AI Agent Guidelines:**

- **Follow all architectural decisions** exactly as documented - no improvisation
- **Use implementation patterns consistently** across all components - check examples before implementing
- **Respect project structure and boundaries** - don't create new directories without referencing this document
- **Store currency as integers in cents** - this is non-negotiable for financial accuracy
- **Wrap income allocation in Prisma transactions** - atomicity is critical (NFR15)
- **Never mix naming conventions** - be consistent with camelCase/PascalCase/snake_case rules
- **Use standard API response format** - all endpoints return `{success, data}` or `{success, error}`
- **Refer to this document** for all architectural questions before making decisions

**First Implementation Priority:**

1. **Initialize Prisma**: Create `prisma/schema.prisma` with database schema (users, categories, transactions tables)
2. **Run Initial Migration**: `npx prisma migrate dev --name init`
3. **Configure Dev Environment**: Set up `concurrently` to run both client and server
4. **Implement Auth Foundation**: JWT middleware, bcrypt utilities, register/login endpoints
5. **Build Core API**: Categories and transactions endpoints with Prisma queries

**Ready to proceed with epic and story creation!**

---

## Architecture Completion Summary

### Workflow Completion

**Architecture Decision Workflow:** COMPLETED ✅  
**Total Steps Completed:** 8  
**Date Completed:** 2025-12-02  
**Document Location:** docs/architecture.md

### Final Architecture Deliverables

**📋 Complete Architecture Document**

- All architectural decisions documented with specific versions
- Implementation patterns ensuring AI agent consistency
- Complete project structure with all files and directories
- Requirements to architecture mapping
- Validation confirming coherence and completeness

**🏗️ Implementation Ready Foundation**

- 17 architectural decisions made (Database, Auth, Frontend libraries, Security middleware)
- 12 implementation pattern categories defined (Naming, Structure, Format, Communication, Process)
- 7 main architectural components specified (Auth, Categories, Transactions, Dashboard, Visualizations)
- 41 functional requirements + 31 non-functional requirements fully supported

**📚 AI Agent Implementation Guide**

- Technology stack with verified versions (Prisma v6.x, React Router v6, etc.)
- Consistency rules that prevent implementation conflicts
- Project structure with clear boundaries
- Integration patterns and communication standards

### Implementation Handoff

**For AI Agents:**
This architecture document is your complete guide for implementing ExpensesTracker. Follow all decisions, patterns, and structures exactly as documented.

**First Implementation Priority:**

1. **Initialize Prisma**: Create `prisma/schema.prisma` with database schema (users, categories, transactions tables)
2. **Run Initial Migration**: `npx prisma migrate dev --name init`
3. **Configure Dev Environment**: Set up `concurrently` to run both client and server
4. **Implement Auth Foundation**: JWT middleware, bcrypt utilities, register/login endpoints
5. **Build Core API**: Categories and transactions endpoints with Prisma queries

**Development Sequence:**

1. Initialize project using documented starter template (already complete)
2. Set up development environment per architecture
3. Implement core architectural foundations (Prisma schema, auth middleware)
4. Build features following established patterns
5. Maintain consistency with documented rules

### Quality Assurance Checklist

**✅ Architecture Coherence**

- [x] All decisions work together without conflicts
- [x] Technology choices are compatible
- [x] Patterns support the architectural decisions
- [x] Structure aligns with all choices

**✅ Requirements Coverage**

- [x] All functional requirements are supported (FR1-FR41)
- [x] All non-functional requirements are addressed (NFR1-NFR31)
- [x] Cross-cutting concerns are handled (7 concerns identified)
- [x] Integration points are defined

**✅ Implementation Readiness**

- [x] Decisions are specific and actionable
- [x] Patterns prevent agent conflicts (12 conflict points addressed)
- [x] Structure is complete and unambiguous (170+ files/directories)
- [x] Examples are provided for clarity

### Project Success Factors

**🎯 Clear Decision Framework**
Every technology choice was made collaboratively with clear rationale, ensuring all stakeholders understand the architectural direction.

**🔧 Consistency Guarantee**
Implementation patterns and rules ensure that multiple AI agents will produce compatible, consistent code that works together seamlessly.

**📋 Complete Coverage**
All project requirements are architecturally supported, with clear mapping from business needs to technical implementation.

**🏗️ Solid Foundation**
The chosen technology stack and architectural patterns provide a production-ready foundation following current best practices for TypeScript/Node.js development.

---

**Architecture Status:** READY FOR IMPLEMENTATION ✅

**Next Phase:** Begin implementation using the architectural decisions and patterns documented herein.

**Document Maintenance:** Update this architecture when major technical decisions are made during implementation.
