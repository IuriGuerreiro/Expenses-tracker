# ExpensesTracker - Epic Breakdown

**Author:** a
**Date:** 2025-12-02
**Project Level:** Intermediate
**Target Scale:** Low Complexity Web Application

---

## Overview

This document provides the complete epic and story breakdown for ExpensesTracker, decomposing the requirements from the [PRD](./prd.md) into implementable stories.

**Living Document Notice:** This is the initial version created from comprehensive context including PRD requirements, Architecture technical decisions, and implementation patterns.

## Epic Summary

ExpensesTracker implementation is organized into **5 user-value-focused epics** that deliver incremental functionality:

1. **Epic 1: Foundation & Authentication** - Set up infrastructure and secure user accounts
2. **Epic 2: Category System & Allocation Engine** - Enable users to create custom categories and define allocation rules
3. **Epic 3: Income & Expense Tracking** - Allow users to log transactions and see real-time balance updates
4. **Epic 4: Dashboard & Financial Visibility** - Provide comprehensive overview of financial status
5. **Epic 5: Insights & Visualizations** - Enable pattern recognition through graphs and analytics

Each epic delivers working functionality that users can immediately benefit from, building toward the complete MVP experience.

---

## Functional Requirements Inventory

### User Management & Authentication (FR1-FR6)
- **FR1**: Users can register for a new account with email and password
- **FR2**: Users can log in to their account with credentials
- **FR3**: Users can log out of their account
- **FR4**: Users can reset their password if forgotten
- **FR5**: System maintains user session across page refreshes
- **FR6**: System isolates user data per account (no cross-user data access)

### Category Management (FR7-FR13)
- **FR7**: Users can create custom spending categories with user-defined names
- **FR8**: Users can assign percentage allocation rules to each category
- **FR9**: Users can edit existing category names and allocation percentages
- **FR10**: Users can delete categories when no longer needed
- **FR11**: Users can view all categories with current balances on a dashboard
- **FR12**: System prevents category deletion if transactions exist for that category
- **FR13**: System validates that total allocation percentages equal 100%

### Income Tracking & Auto-Allocation (FR14-FR19)
- **FR14**: Users can manually log income entries with amount, source description, and date
- **FR15**: System automatically splits income across categories based on defined allocation percentages upon save
- **FR16**: System updates all affected category balances in real-time after income allocation
- **FR17**: Users can view complete income transaction history
- **FR18**: Users can edit or delete income transactions
- **FR19**: System recalculates category balances when income transactions are modified or deleted

### Expense Tracking & Balance Management (FR20-FR26)
- **FR20**: Users can manually log expenses with amount, description, category selection, and date
- **FR21**: System automatically deducts expense amount from selected category balance
- **FR22**: System displays available balance for each category before expense entry
- **FR23**: Users can view complete expense transaction history
- **FR24**: Users can edit or delete expense transactions
- **FR25**: System recalculates category balances when expense transactions are modified or deleted
- **FR26**: Users can filter expense history by category, date range, or description

### Dashboard & Balance Visibility (FR27-FR31)
- **FR27**: Users can view a dashboard showing all category balances at a glance
- **FR28**: Dashboard updates in real-time after every income or expense transaction
- **FR29**: Dashboard provides quick access buttons to add income or expenses
- **FR30**: Users can see total available funds across all categories
- **FR31**: Dashboard highlights categories with low or zero balances

### Data Visualization & Insights (FR32-FR37)
- **FR32**: Users can view graphs showing spending distribution by category (pie or bar charts)
- **FR33**: Users can view spending patterns over time with selectable timeframes (weekly, monthly)
- **FR34**: Users can view category distribution visualizations
- **FR35**: Users can view income vs. expenses overview for selected time periods
- **FR36**: System provides visual trend analysis to identify spending patterns
- **FR37**: Users can export visualization data for external analysis

### Transaction Management (FR38-FR41)
- **FR38**: Users can search transaction history by description, amount, or category
- **FR39**: System maintains complete audit trail of all income and expense transactions
- **FR40**: Users can sort transactions by date, amount, or category
- **FR41**: System displays transaction timestamps for all entries

---

## FR Coverage Map

| Epic | Stories | Functional Requirements Covered |
|------|---------|--------------------------------|
| **Epic 1** | 6 stories | FR1-FR6 (Authentication), Foundation setup |
| **Epic 2** | 5 stories | FR7-FR13 (Category Management) |
| **Epic 3** | 6 stories | FR14-FR26 (Income & Expense Tracking) |
| **Epic 4** | 4 stories | FR27-FR31 (Dashboard & Balance Visibility) |
| **Epic 5** | 5 stories | FR32-FR41 (Visualizations & Transaction Management) |

**Total: 5 Epics, 26 Stories, 41 Functional Requirements**

---

## Epic 1: Foundation & Authentication

**Epic Goal:** Establish the technical foundation and secure user authentication system, enabling users to create accounts and safely access their personal financial data.

**User Value:** Users can securely register, log in, and have confidence that their financial data is protected and isolated from other users.

**PRD Coverage:** FR1-FR6 (User Management & Authentication)

**Technical Context:**
- Monorepo structure with `/client` (Vite+React+TypeScript) and `/server` (Express+TypeScript)
- Prisma ORM v6.x with SQLite database
- JWT authentication with httpOnly cookies
- bcrypt password hashing (10 salt rounds)
- Security middleware: helmet, cors, express-rate-limit
- Architecture sections: Authentication & Security, Data Architecture

**Dependencies:** None (foundation epic)

---

### Story 1.1: Project Foundation Setup

As a developer,
I want to initialize the complete monorepo development environment,
So that all subsequent development can proceed with proper tooling and structure.

**Acceptance Criteria:**

**Given** I am starting the ExpensesTracker project
**When** I set up the development environment
**Then** the monorepo structure is initialized with client and server directories

**And** I have a root `package.json` configured with workspace scripts
**And** `concurrently` is configured to run both frontend and backend simultaneously
**And** the frontend Vite server runs on port 5173 with proxy to backend `/api` → `http://localhost:3000`
**And** the backend Express server runs on port 3000 with ts-node and nodemon auto-restart
**And** both servers support hot reload (frontend HMR, backend nodemon restart)

**And** environment configuration is set up:
- `.env.example` in root with template variables
- `.env.development` files in client and server (git-ignored)
- `dotenv` package configured in both applications
- Required variables: `DATABASE_URL`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `NODE_ENV`, `PORT`, `CLIENT_URL`

**And** TypeScript is configured consistently:
- `tsconfig.json` in both client and server
- Strict mode enabled
- Path aliases configured if needed

**Prerequisites:** None (first story)

**Technical Notes:**
- Follow Architecture section: Infrastructure & Deployment → Development Environment
- Use `concurrently` package for parallel dev server execution
- Vite proxy configuration in `client/vite.config.ts`
- Project structure per Architecture: Project Structure & Boundaries

---

### Story 1.2: Database Schema & Prisma Setup

As a developer,
I want to define the complete database schema using Prisma ORM,
So that all data models are type-safe and support the full application requirements.

**Acceptance Criteria:**

**Given** the project foundation is set up
**When** I create the Prisma schema
**Then** `prisma/schema.prisma` is created with complete data model

**And** the `users` table includes:
- `id` (String, UUID, primary key)
- `email` (String, unique, not null)
- `passwordHash` (String, not null)
- `createdAt` (DateTime, default now)
- `updatedAt` (DateTime, auto-update)

**And** the `categories` table includes:
- `id` (String, UUID, primary key)
- `userId` (String, foreign key to users)
- `name` (String, not null)
- `allocationPercentage` (Int, not null) - stored as integer 0-100
- `createdAt` (DateTime, default now)
- `updatedAt` (DateTime, auto-update)
- Index on `userId` for query performance

**And** the `transactions` table includes:
- `id` (String, UUID, primary key)
- `userId` (String, foreign key to users)
- `categoryId` (String, foreign key to categories, nullable for income allocation)
- `type` (Enum: 'INCOME', 'EXPENSE')
- `amountCents` (Int, not null) - **CRITICAL: Store as cents (integer) for accuracy**
- `description` (String, not null)
- `sourceDescription` (String, nullable) - for income source
- `transactionDate` (DateTime, not null)
- `createdAt` (DateTime, default now)
- `updatedAt` (DateTime, auto-update)
- Indexes on `userId`, `categoryId`, `transactionDate`, `type` for query performance

**And** I run `npx prisma migrate dev --name init` to create initial migration
**And** Prisma Client is generated with TypeScript types
**And** a Prisma client instance is configured in `/server/src/config/database.ts`

**Prerequisites:** Story 1.1 (Project Foundation Setup)

**Technical Notes:**
- Follow Architecture: Data Architecture section
- **CRITICAL**: Currency stored as integers in cents (e.g., $10.50 = 1050) per NFR14
- Prisma naming: `snake_case` tables, `camelCase` fields (auto-converts)
- All foreign keys use cascading deletes appropriately
- Architecture file location: `server/prisma/schema.prisma`

---

### Story 1.3: Authentication Utilities & JWT Configuration

As a developer,
I want to implement password hashing and JWT token utilities,
So that user credentials are secure and sessions can be managed safely.

**Acceptance Criteria:**

**Given** the database schema is defined
**When** I implement authentication utilities
**Then** password hashing utilities are created in `/server/src/utils/bcrypt.ts` with:
- `hashPassword(password: string): Promise<string>` using bcrypt with 10 salt rounds
- `comparePassword(password: string, hash: string): Promise<boolean>` for verification

**And** JWT utilities are created in `/server/src/utils/jwt.ts` with:
- `generateToken(payload: { userId: string }): string` returning signed JWT
- `verifyToken(token: string): { userId: string } | null` for token validation
- Token expiration from `JWT_EXPIRES_IN` environment variable (default: 7 days)
- Token secret from `JWT_SECRET` environment variable

**And** custom error classes are created in `/server/src/utils/errors.ts`:
- `ValidationError` (statusCode: 400)
- `AuthenticationError` (statusCode: 401)
- `AuthorizationError` (statusCode: 403)
- `NotFoundError` (statusCode: 404)
- `ConflictError` (statusCode: 409)
- All extend base Error with consistent structure

**Prerequisites:** Story 1.2 (Database Schema & Prisma Setup)

**Technical Notes:**
- Follow Architecture: Authentication & Security section
- bcrypt salt rounds: 10 (per NFR7)
- JWT stored in httpOnly cookies (more secure than localStorage)
- Error classes support Architecture: Format Patterns → API Response Formats

---

### Story 1.4: Authentication Middleware & Security Setup

As a developer,
I want to implement authentication middleware and security hardening,
So that all protected routes verify user identity and the application is secured against common attacks.

**Acceptance Criteria:**

**Given** JWT utilities are implemented
**When** I create the authentication middleware
**Then** `/server/src/middleware/auth.ts` exports `authMiddleware` that:
- Extracts JWT token from httpOnly cookie or Authorization header
- Verifies token using `verifyToken` utility
- Attaches decoded `userId` to `req.user` for downstream use
- Returns 401 AuthenticationError if token is missing or invalid
- TypeScript extension: `/server/src/types/express.d.ts` extends Request interface with `user` property

**And** security middleware is configured in `/server/src/middleware/security.ts`:
- `helmet()` middleware for secure HTTP headers (HSTS, XSS protection, CSP)
- `cors()` middleware configured with:
  - `origin`: `CLIENT_URL` from environment
  - `credentials: true` for cookie support
- `rateLimit()` from express-rate-limit:
  - General API: 100 requests per 15 minutes per IP
  - Auth endpoints: 5 requests per 15 minutes per IP
- Express JSON body parser with size limits

**And** centralized error handling middleware in `/server/src/middleware/errorHandler.ts`:
- Catches all errors from routes
- Transforms custom error classes to standard API response format
- Logs errors server-side (without exposing to client per NFR13)
- Returns `{ success: false, error: { message, code } }` format
- Never exposes stack traces to client in production

**Prerequisites:** Story 1.3 (Authentication Utilities & JWT Configuration)

**Technical Notes:**
- Follow Architecture: Authentication & Security → Security Middleware Stack
- All protected routes use `authMiddleware` (except `/api/v1/auth/register` and `/api/v1/auth/login`)
- Error handling per Architecture: Implementation Patterns → Process Patterns
- Complies with NFR7-NFR13 (Security requirements)

---

### Story 1.5: User Registration API

As a new user,
I want to register for an account with email and password,
So that I can create my personal expense tracking system.

**Acceptance Criteria:**

**Given** I am a new user visiting the application
**When** I submit registration with valid email and password
**Then** POST `/api/v1/auth/register` endpoint is called

**And** the backend validates input using express-validator:
- Email format (RFC 5322 compliant)
- Password minimum 8 characters, contains 1 uppercase, 1 number, 1 special character
- Email uniqueness check against database

**And** if validation fails:
- Return 400 with `{ success: false, error: { message: "Specific validation error", code: "VALIDATION_ERROR" } }`

**And** if email already exists:
- Return 409 with `{ success: false, error: { message: "Email already registered", code: "EMAIL_EXISTS" } }`

**And** if validation passes:
- Password is hashed using bcrypt (10 salt rounds)
- User record created in `users` table via Prisma
- JWT token generated with `userId` payload
- Token set in httpOnly cookie (secure in production, sameSite strict)
- Return 201 with `{ success: true, data: { userId, email, token } }`

**And** user data is isolated per account (userId used in all subsequent queries per NFR11)

**Prerequisites:** Story 1.4 (Authentication Middleware & Security Setup)

**Technical Notes:**
- Architecture location: `/server/src/routes/auth.routes.ts`, `/server/src/controllers/authController.ts`, `/server/src/services/authService.ts`
- Follow Architecture: API & Communication Patterns → API Endpoint Structure
- Validation middleware: express-validator in `/server/src/middleware/validation.ts`
- Implements FR1: User registration
- Security: NFR7 (bcrypt), NFR10 (parameterized queries via Prisma)

---

### Story 1.6: User Login & Session Management API

As a registered user,
I want to log in with my credentials and maintain my session,
So that I can access my expense tracking data securely.

**Acceptance Criteria:**

**Given** I am a registered user
**When** I submit login with email and password
**Then** POST `/api/v1/auth/login` endpoint is called

**And** the backend validates credentials:
- Query user by email using Prisma
- If user not found: return 401 with `{ success: false, error: { message: "Invalid credentials", code: "INVALID_CREDENTIALS" } }`
- Compare submitted password with stored hash using bcrypt
- If password incorrect: return 401 with same generic error (don't reveal which field is wrong)

**And** if credentials are valid:
- Generate JWT token with `userId` payload
- Set token in httpOnly cookie (secure in production, sameSite strict)
- Return 200 with `{ success: true, data: { userId, email, token } }`

**When** I make subsequent requests with the token cookie
**Then** `authMiddleware` verifies the token and attaches `userId` to `req.user`

**And** all protected routes use this `userId` to filter data per user (NFR11)

**When** I submit POST `/api/v1/auth/logout`
**Then** the httpOnly cookie is cleared
**And** return 200 with `{ success: true, data: { message: "Logged out successfully" } }`

**Prerequisites:** Story 1.5 (User Registration API)

**Technical Notes:**
- Architecture location: `/server/src/routes/auth.routes.ts`, `/server/src/controllers/authController.ts`
- Implements FR2 (Login), FR3 (Logout), FR5 (Session persistence via JWT)
- Security: Generic error messages prevent user enumeration
- Rate limiting: 5 login attempts per 15 minutes per IP (via express-rate-limit)
- Session maintained via JWT cookie (FR5)

---

## Epic 2: Category System & Allocation Engine

**Epic Goal:** Enable users to create and manage custom spending categories with percentage-based allocation rules, forming the foundation of the envelope budgeting system.

**User Value:** Users can organize their money into meaningful buckets (savings, emergency fund, spending categories) with automatic percentage splits that match their financial goals.

**PRD Coverage:** FR7-FR13 (Category Management)

**Technical Context:**
- Prisma queries for category CRUD operations
- Percentage validation: total must equal 100%
- Real-time balance calculations from transaction aggregations
- Prevention of category deletion when transactions exist
- Architecture sections: Data Architecture, API & Communication Patterns

**Dependencies:** Epic 1 (Foundation & Authentication required for protected routes)

---

### Story 2.1: Create Category with Allocation Percentage

As a user,
I want to create custom spending categories with allocation percentages,
So that I can organize my money according to my financial goals.

**Acceptance Criteria:**

**Given** I am logged in to my account
**When** I submit a new category with name and allocation percentage
**Then** POST `/api/v1/categories` endpoint is called with authentication

**And** the backend validates input using express-validator:
- Category name required (1-100 characters)
- Allocation percentage required (integer 0-100)
- User authenticated via JWT token

**And** the backend creates category record via Prisma:
- `userId` from authenticated user (`req.user.id`)
- `name` from request body
- `allocationPercentage` stored as integer (0-100)
- `createdAt` and `updatedAt` timestamps auto-generated

**And** return 201 with `{ success: true, data: { id, userId, name, allocationPercentage, balance: 0, createdAt, updatedAt } }`

**When** I view my categories list
**Then** GET `/api/v1/categories` returns all my categories with current balances calculated from transactions

**Prerequisites:** Story 1.6 (User Login & Session Management API)

**Technical Notes:**
- Architecture location: `/server/src/routes/categories.routes.ts`, `/server/src/controllers/categoryController.ts`, `/server/src/services/categoryService.ts`
- Balance calculation: aggregate transactions where `categoryId` matches and `userId` matches (data isolation)
- Balance = SUM(income allocations to category) - SUM(expenses from category)
- Implements FR7 (Create categories), FR8 (Assign allocation percentage), FR11 (View categories with balances)
- Architecture: API Endpoint Structure → `/api/v1/categories`

---

### Story 2.2: Validate Total Allocation Percentage Equals 100%

As a user,
I want the system to ensure my allocation percentages total exactly 100%,
So that all my income is properly distributed without over or under allocation.

**Acceptance Criteria:**

**Given** I have existing categories with allocation percentages
**When** I create or update a category
**Then** the backend calculates the total allocation percentage across all my categories

**And** if the total would not equal 100% after this operation:
- Return 409 ConflictError with `{ success: false, error: { message: "Total allocation must equal 100%. Current total would be X%", code: "INVALID_ALLOCATION_TOTAL" } }`
- Do not save the category changes

**And** if the total equals exactly 100%:
- Save the category successfully
- Return success response

**When** I view my categories dashboard
**Then** I see a visual indicator showing "Total Allocation: 100%" (or warning if not 100%)

**Prerequisites:** Story 2.1 (Create Category with Allocation Percentage)

**Technical Notes:**
- Architecture location: `/server/src/services/categoryService.ts` → validation function
- Validation in controller layer before calling service
- Query sum: `await prisma.categories.aggregate({ where: { userId }, _sum: { allocationPercentage: true } })`
- Implements FR13 (Validate 100% total allocation)
- Business rule enforcement per Architecture: API & Communication Patterns → Error Handling

---

### Story 2.3: Edit Category Name and Allocation Percentage

As a user,
I want to edit my category names and allocation percentages,
So that I can adjust my budget structure as my financial goals change.

**Acceptance Criteria:**

**Given** I have an existing category
**When** I submit updates to category name or allocation percentage
**Then** PUT `/api/v1/categories/:id` endpoint is called with authentication

**And** the backend validates:
- Category exists and belongs to authenticated user (`userId` match)
- If not found or wrong user: return 404 NotFoundError
- New allocation percentage (if changed) doesn't break 100% total rule (call validation from Story 2.2)

**And** if validation passes:
- Update category record via Prisma
- Return 200 with `{ success: true, data: { id, userId, name, allocationPercentage, balance, updatedAt } }`

**And** if 100% validation fails:
- Return 409 ConflictError with total allocation message
- Do not save changes

**Prerequisites:** Story 2.2 (Validate Total Allocation Percentage Equals 100%)

**Technical Notes:**
- Architecture location: `/server/src/controllers/categoryController.ts`
- Prisma update query: `prisma.categories.update({ where: { id, userId }, data: { name, allocationPercentage } })`
- Data isolation: always include `userId` in where clause (NFR11)
- Implements FR9 (Edit category name and allocation percentage)

---

### Story 2.4: Delete Category with Transaction Check

As a user,
I want to delete categories I no longer need,
But the system should prevent deletion if transactions exist to maintain data integrity.

**Acceptance Criteria:**

**Given** I have a category I want to remove
**When** I submit a delete request for the category
**Then** DELETE `/api/v1/categories/:id` endpoint is called with authentication

**And** the backend validates:
- Category exists and belongs to authenticated user
- If not found or wrong user: return 404 NotFoundError

**And** the backend checks for existing transactions:
- Query: `await prisma.transactions.count({ where: { categoryId: id, userId } })`
- If transaction count > 0:
  - Return 409 ConflictError with `{ success: false, error: { message: "Cannot delete category with existing transactions. Please reassign or delete transactions first.", code: "CATEGORY_HAS_TRANSACTIONS" } }`
  - Do not delete category

**And** if no transactions exist:
- Delete category via Prisma: `prisma.categories.delete({ where: { id, userId } })`
- Recalculate total allocation percentage for remaining categories
- Return 200 with `{ success: true, data: { message: "Category deleted successfully", remainingAllocationTotal: X } }`
- Note: User must rebalance to 100% before logging new income

**Prerequisites:** Story 2.3 (Edit Category Name and Allocation Percentage)

**Technical Notes:**
- Architecture location: `/server/src/controllers/categoryController.ts`, `/server/src/services/categoryService.ts`
- Implements FR10 (Delete categories), FR12 (Prevent deletion with transactions)
- Transaction check ensures data integrity (NFR19)
- Prisma cascading deletes NOT used here (explicit prevention)

---

### Story 2.5: View All Categories with Real-Time Balance Calculation

As a user,
I want to view all my categories with current balances at a glance,
So that I know exactly how much money I have allocated in each bucket.

**Acceptance Criteria:**

**Given** I am logged in and have categories with transactions
**When** I request my categories list
**Then** GET `/api/v1/categories` returns all my categories

**And** each category includes real-time calculated balance:
- Balance = SUM(income allocations to this category) - SUM(expenses from this category)
- Calculation via Prisma aggregation or raw SQL for performance:
  ```typescript
  const incomeAllocations = await prisma.transactions.aggregate({
    where: { categoryId, userId, type: 'INCOME' },
    _sum: { amountCents: true }
  });
  const expenses = await prisma.transactions.aggregate({
    where: { categoryId, userId, type: 'EXPENSE' },
    _sum: { amountCents: true }
  });
  const balanceCents = (incomeAllocations._sum.amountCents || 0) - (expenses._sum.amountCents || 0);
  ```

**And** response format:
```json
{
  "success": true,
  "data": {
    "categories": [
      {
        "id": "uuid",
        "name": "Emergency Fund",
        "allocationPercentage": 20,
        "balanceCents": 50000,
        "balanceFormatted": "$500.00",
        "createdAt": "2025-12-02T10:00:00Z",
        "updatedAt": "2025-12-02T10:00:00Z"
      }
    ],
    "totalAllocationPercentage": 100,
    "totalBalanceCents": 150000,
    "totalBalanceFormatted": "$1,500.00"
  }
}
```

**And** balance calculations are accurate to the cent (NFR14: 100% calculation accuracy)
**And** query performance remains under 1 second even with thousands of transactions (NFR6)

**Prerequisites:** Story 2.4 (Delete Category with Transaction Check)

**Technical Notes:**
- Architecture location: `/server/src/services/categoryService.ts` → balance calculation logic
- **CRITICAL**: All amounts stored and calculated in cents (integers) for accuracy
- Frontend formats cents to dollars for display (divide by 100)
- Implements FR11 (View categories with current balances)
- Performance: Consider adding database indexes on `categoryId`, `userId`, `type` for aggregation queries
- NFR14 compliance: Integer math prevents floating-point rounding errors

---

## Epic 3: Income & Expense Tracking

**Epic Goal:** Enable users to log income and expenses with automatic balance updates, forming the core transaction tracking functionality of the envelope budgeting system.

**User Value:** Users manually log income (which automatically splits across categories) and expenses (which deduct from specific categories), maintaining accurate real-time balances.

**PRD Coverage:** FR14-FR26 (Income Tracking & Auto-Allocation, Expense Tracking & Balance Management)

**Technical Context:**
- Income auto-allocation algorithm with Prisma transactions (atomic operations)
- Expense deduction with balance checks
- Transaction CRUD with recalculation on edit/delete
- Real-time balance updates (< 1 second per NFR2-NFR3)
- Architecture sections: Data Architecture, Performance Optimization

**Dependencies:** Epic 2 (Category System required for allocation and expense assignment)

---

### Story 3.1: Log Income with Automatic Category Allocation

As a user,
I want to log income entries that automatically split across my categories,
So that my money is instantly allocated according to my predefined percentages without manual calculations.

**Acceptance Criteria:**

**Given** I am logged in and have categories with allocation percentages totaling 100%
**When** I submit a new income entry with amount, source description, and date
**Then** POST `/api/v1/income` endpoint is called with authentication

**And** the backend validates:
- Amount is positive number (will be converted to cents)
- Source description provided (1-200 characters)
- Transaction date provided (ISO 8601 format)
- User has categories with allocation totaling 100%
- If allocation ≠ 100%: return 409 ConflictError "Please set up categories with 100% allocation first"

**And** the backend performs atomic allocation using Prisma transaction:
```typescript
await prisma.$transaction(async (tx) => {
  // 1. Create main income transaction record
  const incomeTransaction = await tx.transactions.create({
    data: {
      userId,
      type: 'INCOME',
      amountCents: amountInCents, // e.g., $500.00 = 50000 cents
      description: 'Income allocation',
      sourceDescription,
      transactionDate,
      categoryId: null // Income not assigned to single category
    }
  });

  // 2. Query all user categories
  const categories = await tx.categories.findMany({ where: { userId } });

  // 3. Calculate and create allocation transactions for each category
  for (const category of categories) {
    const allocationCents = Math.floor(
      (amountInCents * category.allocationPercentage) / 100
    );

    await tx.transactions.create({
      data: {
        userId,
        categoryId: category.id,
        type: 'INCOME',
        amountCents: allocationCents,
        description: `Allocation from ${sourceDescription}`,
        sourceDescription,
        transactionDate,
      }
    });
  }
});
```

**And** allocation calculation handles rounding:
- Each category allocation rounded down (Math.floor)
- Any remaining cents from rounding can be ignored or added to first category
- Total allocated should equal or be very close to original amount (within a few cents acceptable)

**And** the allocation completes in < 1 second (NFR2)
**And** return 201 with `{ success: true, data: { incomeId, allocations: [...], totalAmountCents } }`

**Prerequisites:** Story 2.5 (View All Categories with Real-Time Balance Calculation)

**Technical Notes:**
- Architecture location: `/server/src/routes/income.routes.ts`, `/server/src/services/allocationService.ts`
- **CRITICAL**: Prisma transaction ensures atomicity (NFR15) - all-or-nothing operation
- Amount conversion: dollars to cents before storage (multiply by 100, round to integer)
- Implements FR14 (Log income), FR15 (Automatic allocation), FR16 (Real-time balance updates)
- Performance: NFR2 requires calculation < 1 second
- Data integrity: Transaction atomicity prevents partial allocations (NFR15)

---

### Story 3.2: View Income Transaction History

As a user,
I want to view my complete income transaction history,
So that I can track all money coming into my system.

**Acceptance Criteria:**

**Given** I am logged in and have logged income entries
**When** I request my income history
**Then** GET `/api/v1/income` returns all my income transactions

**And** response includes:
- Main income transactions (not individual allocation entries)
- Sorted by `transactionDate` descending (most recent first)
- Each entry shows: id, amountCents, amountFormatted, sourceDescription, transactionDate, createdAt
- Pagination support: query params `?page=1&limit=20` (default 20 per page)

**And** response format:
```json
{
  "success": true,
  "data": {
    "transactions": [
      {
        "id": "uuid",
        "type": "INCOME",
        "amountCents": 50000,
        "amountFormatted": "$500.00",
        "sourceDescription": "Paycheck - Acme Corp",
        "transactionDate": "2025-12-01T00:00:00Z",
        "createdAt": "2025-12-01T10:30:00Z",
        "allocations": [
          { "categoryId": "uuid1", "categoryName": "Savings", "amountCents": 15000 },
          { "categoryId": "uuid2", "categoryName": "Spending", "amountCents": 35000 }
        ]
      }
    ],
    "pagination": { "page": 1, "limit": 20, "total": 45 }
  }
}
```

**And** query performance remains under 1 second (NFR6)

**Prerequisites:** Story 3.1 (Log Income with Automatic Category Allocation)

**Technical Notes:**
- Architecture location: `/server/src/routes/income.routes.ts`, `/server/src/services/transactionService.ts`
- Prisma query with relations: include allocation breakdown per income entry
- Implements FR17 (View income transaction history), FR41 (Display timestamps)
- Performance: Index on `userId`, `type`, `transactionDate` for efficient sorting

---

### Story 3.3: Edit and Delete Income Transactions with Balance Recalculation

As a user,
I want to edit or delete income entries and have category balances automatically recalculated,
So that I can correct mistakes without manual balance adjustments.

**Acceptance Criteria:**

**Given** I have an existing income transaction
**When** I submit an update to the income amount, source, or date
**Then** PUT `/api/v1/income/:id` endpoint is called with authentication

**And** the backend performs atomic update using Prisma transaction:
1. Delete old allocation transactions for this income entry
2. Update main income transaction with new values
3. Recalculate and create new allocation transactions based on current category percentages
4. All within single transaction (atomicity per NFR15)

**And** return 200 with updated income data and new allocations

**When** I delete an income transaction
**Then** DELETE `/api/v1/income/:id` endpoint is called

**And** the backend performs atomic deletion:
1. Delete all allocation transactions for this income entry
2. Delete main income transaction
3. All within single transaction

**And** return 200 with `{ success: true, data: { message: "Income deleted successfully" } }`

**And** category balances reflect the changes immediately (recalculated on next GET `/api/v1/categories`)
**And** operations complete in < 1 second (NFR2-NFR3)

**Prerequisites:** Story 3.2 (View Income Transaction History)

**Technical Notes:**
- Architecture location: `/server/src/controllers/incomeController.ts`, `/server/src/services/allocationService.ts`
- Implements FR18 (Edit income), FR19 (Recalculate balances on modification)
- **CRITICAL**: Prisma transaction ensures atomic operations (NFR15)
- Balance recalculation: Balances are computed on-demand via aggregation, no stored balance field
- Data integrity: Transaction ACID properties prevent orphaned allocations

---

### Story 3.4: Log Expenses Against Categories

As a user,
I want to log expenses against specific categories and see balances deduct automatically,
So that I can track spending and know how much remains in each bucket.

**Acceptance Criteria:**

**Given** I am logged in and have categories with positive balances
**When** I submit a new expense with amount, description, category, and date
**Then** POST `/api/v1/expenses` endpoint is called with authentication

**And** the backend validates:
- Amount is positive number (converted to cents)
- Description provided (1-200 characters)
- Category ID provided and belongs to user
- Transaction date provided (ISO 8601 format)

**And** the backend creates expense transaction via Prisma:
```typescript
await prisma.transactions.create({
  data: {
    userId,
    categoryId,
    type: 'EXPENSE',
    amountCents: amountInCents,
    description,
    transactionDate,
  }
});
```

**And** return 201 with `{ success: true, data: { expenseId, categoryId, amountCents, description, transactionDate, newCategoryBalanceCents } }`

**And** the category balance is automatically deducted (calculated via aggregation on next balance query)
**And** operation completes in < 1 second (NFR3)

**When** I view the category balance before logging an expense
**Then** the frontend displays the current available balance (FR22)

**Prerequisites:** Story 3.3 (Edit and Delete Income Transactions with Balance Recalculation)

**Technical Notes:**
- Architecture location: `/server/src/routes/expenses.routes.ts`, `/server/src/controllers/expenseController.ts`, `/server/src/services/transactionService.ts`
- Implements FR20 (Log expenses), FR21 (Automatic deduction), FR22 (Display available balance)
- No explicit balance update query needed - balances computed via aggregation
- Consider warning if expense would result in negative balance (optional enhancement)

---

### Story 3.5: View and Filter Expense Transaction History

As a user,
I want to view my expense history with filtering options,
So that I can find specific expenses and analyze spending patterns.

**Acceptance Criteria:**

**Given** I am logged in and have logged expenses
**When** I request my expense history
**Then** GET `/api/v1/expenses` returns all my expense transactions

**And** I can filter by:
- `?categoryId=uuid` - expenses for specific category
- `?startDate=2025-01-01&endDate=2025-12-31` - date range
- `?description=coffee` - search in description (case-insensitive partial match)
- Filters can be combined

**And** response includes:
- Expense transactions sorted by `transactionDate` descending
- Each entry shows: id, categoryId, categoryName, amountCents, amountFormatted, description, transactionDate, createdAt
- Pagination support: query params `?page=1&limit=20`

**And** response format:
```json
{
  "success": true,
  "data": {
    "transactions": [
      {
        "id": "uuid",
        "type": "EXPENSE",
        "categoryId": "uuid",
        "categoryName": "Dining Out",
        "amountCents": 2500,
        "amountFormatted": "$25.00",
        "description": "Coffee shop",
        "transactionDate": "2025-12-02T08:30:00Z",
        "createdAt": "2025-12-02T08:35:00Z"
      }
    ],
    "pagination": { "page": 1, "limit": 20, "total": 120 },
    "filters": { "categoryId": "uuid", "startDate": null, "endDate": null, "description": null }
  }
}
```

**And** query performance remains under 1 second even with thousands of transactions (NFR6)

**Prerequisites:** Story 3.4 (Log Expenses Against Categories)

**Technical Notes:**
- Architecture location: `/server/src/services/transactionService.ts`
- Prisma query with filters: `where: { userId, type: 'EXPENSE', categoryId?, transactionDate: { gte?, lte? }, description: { contains?, mode: 'insensitive' } }`
- Implements FR23 (View expense history), FR26 (Filter by category, date range, description)
- Performance: Indexes on `userId`, `type`, `categoryId`, `transactionDate` for efficient filtering

---

### Story 3.6: Edit and Delete Expense Transactions

As a user,
I want to edit or delete expense entries and have balances automatically recalculated,
So that I can correct mistakes or remove incorrect entries.

**Acceptance Criteria:**

**Given** I have an existing expense transaction
**When** I submit an update to expense amount, description, category, or date
**Then** PUT `/api/v1/expenses/:id` endpoint is called with authentication

**And** the backend validates:
- Expense exists and belongs to authenticated user
- If not found or wrong user: return 404 NotFoundError
- New values pass validation (positive amount, valid category, etc.)

**And** the backend updates the expense transaction via Prisma:
```typescript
await prisma.transactions.update({
  where: { id, userId },
  data: { amountCents, description, categoryId, transactionDate }
});
```

**And** return 200 with updated expense data
**And** affected category balances reflect changes on next query (automatic via aggregation)

**When** I delete an expense transaction
**Then** DELETE `/api/v1/expenses/:id` endpoint is called

**And** the backend validates ownership and deletes:
```typescript
await prisma.transactions.delete({
  where: { id, userId }
});
```

**And** return 200 with `{ success: true, data: { message: "Expense deleted successfully" } }`
**And** category balance reflects deletion on next query

**Prerequisites:** Story 3.5 (View and Filter Expense Transaction History)

**Technical Notes:**
- Architecture location: `/server/src/controllers/expenseController.ts`
- Implements FR24 (Edit expenses), FR25 (Recalculate balances on modification)
- Balance recalculation: Automatic via aggregation queries, no explicit update needed
- Data isolation: Always include `userId` in where clause (NFR11)

---

## Epic 4: Dashboard & Financial Visibility

**Epic Goal:** Provide users with a comprehensive dashboard showing all category balances, total funds, and quick actions for managing transactions.

**User Value:** Users get instant visibility into their financial status with all category balances at a glance, enabling confident spending decisions.

**PRD Coverage:** FR27-FR31 (Dashboard & Balance Visibility)

**Technical Context:**
- Dashboard aggregation queries combining category and transaction data
- Real-time balance calculations
- Low balance detection and highlighting
- Quick action buttons for income/expense entry
- Architecture sections: API & Communication Patterns, Frontend Architecture

**Dependencies:** Epic 3 (Transaction tracking required for balance calculations)

---

### Story 4.1: Dashboard API with Aggregated Financial Data

As a user,
I want to access a dashboard endpoint that provides all my financial data in one call,
So that the dashboard loads quickly with comprehensive information.

**Acceptance Criteria:**

**Given** I am logged in and have categories with transactions
**When** I request the dashboard data
**Then** GET `/api/v1/dashboard` returns comprehensive financial summary

**And** response includes:
```json
{
  "success": true,
  "data": {
    "categories": [
      {
        "id": "uuid",
        "name": "Emergency Fund",
        "allocationPercentage": 20,
        "balanceCents": 50000,
        "balanceFormatted": "$500.00",
        "isLowBalance": false
      }
    ],
    "summary": {
      "totalBalanceCents": 150000,
      "totalBalanceFormatted": "$1,500.00",
      "totalAllocationPercentage": 100,
      "categoryCount": 5,
      "lowBalanceCategories": 2
    },
    "recentTransactions": [
      {
        "id": "uuid",
        "type": "EXPENSE",
        "categoryName": "Groceries",
        "amountCents": 8500,
        "amountFormatted": "$85.00",
        "description": "Weekly shopping",
        "transactionDate": "2025-12-02T00:00:00Z"
      }
    ]
  }
}
```

**And** low balance detection logic:
- Category flagged as `isLowBalance: true` if balance < 10% of average category balance OR balance = 0
- `lowBalanceCategories` count in summary

**And** recent transactions:
- Last 10 transactions (income and expense combined)
- Sorted by transactionDate descending

**And** query completes in < 1 second (NFR6)

**Prerequisites:** Story 3.6 (Edit and Delete Expense Transactions)

**Technical Notes:**
- Architecture location: `/server/src/routes/dashboard.routes.ts`, `/server/src/controllers/dashboardController.ts`
- Implements FR27 (View dashboard with all balances), FR30 (Total available funds), FR31 (Low balance highlights)
- Performance: Single endpoint reduces frontend API calls (optimization per NFR1)
- Balance calculations use aggregation queries from categoryService

---

### Story 4.2: Dashboard React Component with Real-Time Updates

As a user,
I want to see my dashboard with all category balances and quick actions,
So that I can understand my financial status at a glance.

**Acceptance Criteria:**

**Given** I am logged in to the frontend application
**When** I navigate to the dashboard page
**Then** I see the Dashboard component (`/client/src/pages/Dashboard.tsx`)

**And** the dashboard displays:
- **Header section**: "Dashboard" title with total balance prominently displayed
- **Quick Actions section**:
  - "Add Income" button (opens income form)
  - "Add Expense" button (opens expense form)
- **Category Balances section**:
  - Grid/list of all categories with names, allocation percentages, and current balances
  - Low balance categories highlighted in red/warning color
  - Each category shows balance bar visualization (percentage of total funds)
- **Recent Transactions section**:
  - List of last 10 transactions with type, category, amount, description, date
  - Link to full transaction history

**And** dashboard automatically refetches data after:
- Income entry completed
- Expense entry completed
- Category created/updated/deleted
- Real-time update in < 1 second (NFR3)

**And** all balances displayed in formatted currency ($X.XX format)
**And** UI is responsive and works on mobile (320px+ per NFR24)

**Prerequisites:** Story 4.1 (Dashboard API with Aggregated Financial Data)

**Technical Notes:**
- Architecture location: `/client/src/pages/Dashboard.tsx`, `/client/src/components/dashboard/`
- State management: Local state with React hooks, refetch via custom `useDashboard` hook
- API service: `/client/src/services/dashboardService.ts` wraps dashboard endpoint
- Implements FR27-FR29 (Dashboard visibility, real-time updates, quick actions)
- Format utilities: `/client/src/utils/formatters.ts` for currency formatting (cents to dollars)

---

### Story 4.3: Quick Action Modals for Income and Expense Entry

As a user,
I want to quickly add income or expenses from the dashboard without navigating away,
So that I can log transactions efficiently.

**Acceptance Criteria:**

**Given** I am viewing the dashboard
**When** I click "Add Income" button
**Then** a modal opens with income entry form (IncomeForm component)

**And** the form includes:
- Amount field (numeric input, validates positive number)
- Source description field (text input)
- Transaction date field (date picker, defaults to today)
- "Submit" and "Cancel" buttons

**And** when I submit the form:
- POST `/api/v1/income` is called via `incomeService.createIncome()`
- Loading state shows during submission
- On success: Modal closes, dashboard refetches data, success toast notification
- On error: Error message displays in modal, form remains open

**When** I click "Add Expense" button
**Then** a modal opens with expense entry form (ExpenseForm component)

**And** the form includes:
- Amount field (numeric input)
- Description field (text input)
- Category dropdown (populated from user's categories)
- Category balance display: "Available: $X.XX" for selected category
- Transaction date field (date picker, defaults to today)
- "Submit" and "Cancel" buttons

**And** when I submit the form:
- POST `/api/v1/expenses` is called via `expenseService.createExpense()`
- Same loading/success/error handling as income form
- Dashboard refetches on success

**Prerequisites:** Story 4.2 (Dashboard React Component with Real-Time Updates)

**Technical Notes:**
- Architecture location: `/client/src/components/transactions/IncomeForm.tsx`, `/client/src/components/transactions/ExpenseForm.tsx`
- Form handling: React Hook Form with validation (per Architecture: Frontend → Form Handling)
- Implements FR22 (Display available balance before expense), FR29 (Quick access buttons)
- Modal library: Use React state or lightweight modal component
- Currency input: Convert dollars to cents before API submission (multiply by 100)

---

### Story 4.4: Category Balance Visualization and Low Balance Warnings

As a user,
I want to see visual indicators for category balances and warnings for low balances,
So that I can quickly identify which categories need attention.

**Acceptance Criteria:**

**Given** I am viewing the dashboard
**When** the dashboard loads
**Then** each category displays a visual balance indicator:
- Progress bar or gauge showing balance relative to total funds
- Color coding: Green (healthy balance), Yellow (low balance), Red (zero balance)
- Percentage of total funds displayed

**And** low balance categories are highlighted:
- Visual warning icon next to category name
- Red/orange background or border
- Tooltip explaining: "Balance below 10% of average"

**And** if any categories have zero balance:
- More prominent warning with red color
- Message: "No funds available in this category"

**And** summary section shows:
- Total balance across all categories (large, prominent display)
- Number of categories with low/zero balance
- Optional: Allocation percentage total (should always be 100%)

**Prerequisites:** Story 4.3 (Quick Action Modals for Income and Expense Entry)

**Technical Notes:**
- Architecture location: `/client/src/components/dashboard/CategoryBalances.tsx`, `/client/src/components/dashboard/BalanceCard.tsx`
- Implements FR31 (Highlight low/zero balance categories)
- Visual design: Use CSS or component library (Material-UI, Chakra UI, or custom)
- Calculations: Low balance threshold computed frontend-side from dashboard data
- Responsive: Ensure mobile-friendly display (NFR24)

---

## Epic 5: Insights & Visualizations

**Epic Goal:** Enable users to visualize spending patterns, category distributions, and trends through interactive graphs and charts.

**User Value:** Users gain actionable insights into spending behavior through visual representations that reveal patterns hidden in transaction lists.

**PRD Coverage:** FR32-FR37 (Data Visualization & Insights), FR38-FR41 (Transaction Management)

**Technical Context:**
- Recharts library for React-based data visualizations
- Backend aggregation queries for chart data
- Multiple chart types: pie, bar, line charts
- Transaction search and filtering
- Architecture sections: Frontend Architecture → Data Visualization, API & Communication Patterns

**Dependencies:** Epic 4 (Dashboard required as foundation; transaction data required for visualizations)

---

### Story 5.1: Spending by Category Visualization API

As a user,
I want to access aggregated spending data by category,
So that the frontend can render pie and bar charts showing spending distribution.

**Acceptance Criteria:**

**Given** I am logged in and have expense transactions
**When** I request spending by category data
**Then** GET `/api/v1/visualizations/spending-by-category` returns aggregated data

**And** query parameters supported:
- `?startDate=2025-01-01&endDate=2025-12-31` - date range filter
- Default: last 30 days if no dates provided

**And** response format:
```json
{
  "success": true,
  "data": {
    "categories": [
      {
        "categoryId": "uuid",
        "categoryName": "Groceries",
        "totalSpentCents": 45000,
        "totalSpentFormatted": "$450.00",
        "transactionCount": 12,
        "percentageOfTotal": 30.5
      }
    ],
    "summary": {
      "totalSpentCents": 147500,
      "totalSpentFormatted": "$1,475.00",
      "dateRange": { "startDate": "2025-11-02", "endDate": "2025-12-02" }
    }
  }
}
```

**And** aggregation query via Prisma:
```typescript
const expenses = await prisma.transactions.groupBy({
  by: ['categoryId'],
  where: {
    userId,
    type: 'EXPENSE',
    transactionDate: { gte: startDate, lte: endDate }
  },
  _sum: { amountCents: true },
  _count: true
});
```

**And** query completes in < 1 second even with thousands of transactions (NFR6)

**Prerequisites:** Story 4.4 (Category Balance Visualization and Low Balance Warnings)

**Technical Notes:**
- Architecture location: `/server/src/routes/visualizations.routes.ts`, `/server/src/services/visualizationService.ts`
- Implements FR32 (Spending distribution by category)
- Performance: Database indexes on `userId`, `type`, `categoryId`, `transactionDate`
- Percentage calculation: `(categoryTotal / grandTotal) * 100`

---

### Story 5.2: Recharts Integration with Pie and Bar Charts

As a user,
I want to see my spending distribution as pie and bar charts,
So that I can quickly understand which categories consume the most money.

**Acceptance Criteria:**

**Given** I am logged in and navigate to the Visualizations page
**When** the page loads
**Then** I see spending by category visualizations

**And** Pie Chart displays:
- Each category as a colored slice
- Percentage labels on slices
- Legend showing category names with colors
- Tooltip on hover showing: category name, amount, percentage

**And** Bar Chart displays:
- X-axis: Category names
- Y-axis: Amount spent (formatted as $X.XX)
- Colored bars per category
- Tooltip on hover showing exact amount and transaction count

**And** date range selector:
- Dropdown or date picker: "Last 7 days", "Last 30 days", "Last 3 months", "Custom range"
- Charts update when date range changes
- Data fetched from `/api/v1/visualizations/spending-by-category?startDate=X&endDate=Y`

**And** charts render in < 2 seconds even with 12 months of data (NFR4)
**And** charts are responsive and work on mobile devices

**Prerequisites:** Story 5.1 (Spending by Category Visualization API)

**Technical Notes:**
- Architecture location: `/client/src/pages/Visualizations.tsx`, `/client/src/components/visualizations/SpendingPieChart.tsx`, `/client/src/components/visualizations/CategoryDistribution.tsx`
- Library: Recharts (`<PieChart>`, `<BarChart>` components)
- Implements FR32 (Pie/bar charts for category distribution), FR34 (Category distribution visualizations)
- Data transformation: Convert API response to Recharts data format
- State management: Local state with date range filter, refetch on filter change

---

### Story 5.3: Spending Over Time Line Chart

As a user,
I want to see my spending patterns over time with selectable timeframes,
So that I can identify trends and seasonal variations in my expenses.

**Acceptance Criteria:**

**Given** I am logged in and viewing the Visualizations page
**When** I request spending over time data
**Then** GET `/api/v1/visualizations/spending-over-time` returns time-series aggregated data

**And** query parameters supported:
- `?startDate=2025-01-01&endDate=2025-12-31` - date range
- `?groupBy=day|week|month` - aggregation granularity (default: day)

**And** response format:
```json
{
  "success": true,
  "data": {
    "timeSeries": [
      {
        "date": "2025-12-01",
        "totalSpentCents": 15000,
        "totalSpentFormatted": "$150.00",
        "transactionCount": 5
      }
    ],
    "summary": {
      "totalSpentCents": 147500,
      "averagePerPeriodCents": 4916,
      "dateRange": { "startDate": "2025-11-02", "endDate": "2025-12-02" }
    }
  }
}
```

**And** Line Chart displays:
- X-axis: Date/time period
- Y-axis: Amount spent (formatted as $X.XX)
- Line graph showing spending trend
- Tooltip on hover: date, amount, transaction count
- Timeframe selector: "Daily", "Weekly", "Monthly"

**And** chart updates when timeframe changes
**And** chart renders in < 2 seconds (NFR4)

**Prerequisites:** Story 5.2 (Recharts Integration with Pie and Bar Charts)

**Technical Notes:**
- Architecture location: `/server/src/services/visualizationService.ts`, `/client/src/components/visualizations/SpendingOverTime.tsx`
- Recharts: `<LineChart>` component
- Implements FR33 (Spending patterns over time with selectable timeframes), FR36 (Visual trend analysis)
- Backend aggregation: Group transactions by date period using SQL date functions or application-level grouping
- Date formatting: ISO dates converted to display-friendly format on frontend

---

### Story 5.4: Income vs Expenses Overview Chart

As a user,
I want to compare my income and expenses over time,
So that I can see if I'm staying within my means or overspending.

**Acceptance Criteria:**

**Given** I am logged in and viewing the Visualizations page
**When** I request income vs expenses data
**Then** GET `/api/v1/visualizations/income-vs-expenses` returns comparative time-series data

**And** query parameters supported:
- `?startDate=2025-01-01&endDate=2025-12-31` - date range
- `?groupBy=week|month` - aggregation period (default: month)

**And** response format:
```json
{
  "success": true,
  "data": {
    "timeSeries": [
      {
        "period": "2025-11",
        "incomeCents": 250000,
        "incomeFormatted": "$2,500.00",
        "expensesCents": 180000,
        "expensesFormatted": "$1,800.00",
        "netCents": 70000,
        "netFormatted": "$700.00"
      }
    ],
    "summary": {
      "totalIncomeCents": 750000,
      "totalExpensesCents": 520000,
      "netSavingsCents": 230000,
      "savingsRate": 30.7
    }
  }
}
```

**And** Comparative Bar Chart displays:
- X-axis: Time period (weeks or months)
- Y-axis: Amount (formatted as $X.XX)
- Two bars per period: Income (green), Expenses (red)
- Optional: Net savings line overlay
- Tooltip shows: period, income, expenses, net

**And** summary section shows:
- Total income, total expenses, net savings
- Savings rate percentage

**And** chart updates when period granularity changes

**Prerequisites:** Story 5.3 (Spending Over Time Line Chart)

**Technical Notes:**
- Architecture location: `/server/src/services/visualizationService.ts`, `/client/src/components/visualizations/IncomeVsExpenses.tsx`
- Recharts: `<BarChart>` with multiple bars or `<ComposedChart>` with bars and line
- Implements FR35 (Income vs expenses overview for time periods)
- Backend: Two aggregation queries (income and expenses) joined by period
- Savings rate calculation: `(net / income) * 100`

---

### Story 5.5: Transaction Search, Sort, and Export

As a user,
I want to search and sort my complete transaction history and export data,
So that I can find specific transactions and analyze data externally.

**Acceptance Criteria:**

**Given** I am logged in and navigate to Transactions page
**When** the page loads
**Then** I see a searchable, sortable transaction list

**And** search functionality:
- Search box filters by description (case-insensitive partial match)
- API: GET `/api/v1/transactions?search=coffee` returns matching transactions

**And** filtering options:
- Filter by transaction type: All, Income, Expense
- Filter by category (dropdown)
- Filter by date range (date pickers)
- API: Combine filters `?type=EXPENSE&categoryId=uuid&startDate=X&endDate=Y&search=query`

**And** sorting options:
- Sort by: Date (default, descending), Amount (high to low, low to high), Category (alphabetical)
- API: `?sortBy=transactionDate&sortOrder=desc`

**And** transaction list displays:
- Date, Type (icon/badge), Category, Description, Amount
- Pagination: 50 transactions per page
- Total transaction count

**And** export functionality:
- "Export to CSV" button
- GET `/api/v1/visualizations/export?format=csv&startDate=X&endDate=Y`
- Downloads CSV file with all transactions in date range
- CSV columns: Date, Type, Category, Description, Amount

**And** all queries complete in < 1 second (NFR6)

**Prerequisites:** Story 5.4 (Income vs Expenses Overview Chart)

**Technical Notes:**
- Architecture location: `/client/src/pages/Transactions.tsx`, `/client/src/components/transactions/TransactionList.tsx`, `/server/src/routes/transactions.routes.ts`
- Implements FR38 (Search transactions), FR39 (Audit trail), FR40 (Sort transactions), FR37 (Export data)
- Backend: Prisma query with dynamic where clause and orderBy
- CSV generation: Use library like `csv-writer` or manual string building
- Performance: Indexes on search fields (`description`, `transactionDate`, `type`, `categoryId`)

---

## FR Coverage Matrix

### Detailed Requirements to Stories Mapping

| FR | Requirement | Epic.Story | Implementation Details |
|----|-------------|------------|------------------------|
| **FR1** | User registration with email/password | 1.5 | POST `/api/v1/auth/register`, bcrypt hashing, JWT token |
| **FR2** | User login with credentials | 1.6 | POST `/api/v1/auth/login`, credential validation, JWT session |
| **FR3** | User logout | 1.6 | POST `/api/v1/auth/logout`, clear httpOnly cookie |
| **FR4** | Password reset | - | Deferred to post-MVP (requires email service) |
| **FR5** | Session persistence across page refreshes | 1.6 | JWT token in httpOnly cookie, authMiddleware verification |
| **FR6** | User data isolation per account | 1.4, All | `userId` filter in all queries, `req.user.id` from JWT |
| **FR7** | Create custom categories | 2.1 | POST `/api/v1/categories`, Prisma categories table |
| **FR8** | Assign allocation percentage to categories | 2.1 | `allocationPercentage` field (0-100 integer) |
| **FR9** | Edit category name and percentage | 2.3 | PUT `/api/v1/categories/:id` with 100% validation |
| **FR10** | Delete categories | 2.4 | DELETE `/api/v1/categories/:id` |
| **FR11** | View categories with balances | 2.5 | GET `/api/v1/categories`, real-time balance aggregation |
| **FR12** | Prevent category deletion with transactions | 2.4 | Transaction count check before delete |
| **FR13** | Validate 100% allocation total | 2.2 | Backend validation on create/update |
| **FR14** | Log income with amount, source, date | 3.1 | POST `/api/v1/income`, transactions table |
| **FR15** | Automatic income split by percentage | 3.1 | allocationService with Prisma transaction (atomic) |
| **FR16** | Real-time balance updates after income | 3.1 | Balance aggregation on next query, < 1 second |
| **FR17** | View income transaction history | 3.2 | GET `/api/v1/income` with pagination |
| **FR18** | Edit/delete income transactions | 3.3 | PUT/DELETE `/api/v1/income/:id` |
| **FR19** | Recalculate balances on income modification | 3.3 | Atomic transaction: delete old allocations, create new |
| **FR20** | Log expenses with amount, description, category, date | 3.4 | POST `/api/v1/expenses`, transactions table |
| **FR21** | Automatic expense deduction from category | 3.4 | Balance aggregation includes expenses |
| **FR22** | Display available balance before expense | 4.3 | ExpenseForm shows category balance from API |
| **FR23** | View expense transaction history | 3.5 | GET `/api/v1/expenses` with pagination |
| **FR24** | Edit/delete expense transactions | 3.6 | PUT/DELETE `/api/v1/expenses/:id` |
| **FR25** | Recalculate balances on expense modification | 3.6 | Automatic via aggregation queries |
| **FR26** | Filter expenses by category, date, description | 3.5 | Query parameters: `?categoryId=X&startDate=Y&description=Z` |
| **FR27** | Dashboard showing all category balances | 4.1, 4.2 | GET `/api/v1/dashboard`, Dashboard React component |
| **FR28** | Real-time dashboard updates after transactions | 4.2 | Refetch dashboard after income/expense mutations |
| **FR29** | Quick access buttons for income/expense | 4.3 | IncomeForm and ExpenseForm modals |
| **FR30** | Total available funds across categories | 4.1 | Summary section with total balance |
| **FR31** | Highlight low/zero balance categories | 4.4 | Low balance detection and visual warnings |
| **FR32** | Graphs showing spending by category | 5.1, 5.2 | Pie and bar charts with Recharts |
| **FR33** | Spending patterns over time (weekly, monthly) | 5.3 | Line chart with date range and groupBy filters |
| **FR34** | Category distribution visualizations | 5.2 | Bar chart showing category spending |
| **FR35** | Income vs expenses overview | 5.4 | Comparative bar chart with time periods |
| **FR36** | Visual trend analysis | 5.3 | Line chart reveals spending trends |
| **FR37** | Export visualization data | 5.5 | CSV export endpoint |
| **FR38** | Search transactions by description, amount, category | 5.5 | GET `/api/v1/transactions?search=query` |
| **FR39** | Complete audit trail of transactions | 5.5 | All transactions stored with timestamps |
| **FR40** | Sort transactions by date, amount, category | 5.5 | Query parameter: `?sortBy=field&sortOrder=asc|desc` |
| **FR41** | Display transaction timestamps | 3.2, 3.5, 5.5 | `createdAt` field in response, formatted on frontend |

### Coverage Summary

**✅ Complete Coverage: 40 of 41 FRs (97.6%)**

**FR4 (Password Reset)** deferred to post-MVP as it requires email service integration, which adds complexity outside MVP scope. Users can work around by recreating accounts if needed during MVP phase.

**All other functional requirements** are fully covered across 26 stories in 5 epics with complete technical implementation details.

---

## Summary

### Epic Breakdown Statistics

- **Total Epics:** 5
- **Total Stories:** 26
- **Total FRs Covered:** 40 of 41 (97.6%)
- **Functional Requirements:** 41 from PRD
- **Non-Functional Requirements:** 31 from PRD (all architecturally supported)

### Implementation Readiness

**✅ All stories include:**
- Complete user stories in standard format (As a... I want... So that...)
- Detailed acceptance criteria in BDD format (Given/When/Then/And)
- Technical implementation notes from Architecture document
- API endpoints with request/response formats
- Prisma schema references
- Security considerations (JWT auth, data isolation, input validation)
- Performance targets (< 1 second for operations per NFR2-NFR6)
- Architecture file locations for implementation
- Prerequisites defining story execution order

**✅ Technical Context Incorporated:**
- TypeScript monorepo structure (client + server)
- Prisma ORM v6.x with SQLite
- JWT authentication with httpOnly cookies
- bcrypt password hashing (10 salt rounds)
- Express.js REST API with `/api/v1/` versioning
- React frontend with Vite, React Hook Form, axios, Recharts
- Security middleware: helmet, cors, express-rate-limit, express-validator
- **CRITICAL**: Currency stored as integers in cents for accuracy (NFR14)
- Atomic transactions using Prisma.$transaction for income allocation (NFR15)

### Architecture Compliance

All stories follow architectural decisions:
- **Naming conventions**: camelCase (code), PascalCase (components), snake_case (DB tables)
- **API response format**: `{ success: boolean, data?: any, error?: { message, code } }`
- **Error handling**: Custom error classes with centralized middleware
- **Data validation**: Three layers (frontend, backend, database)
- **Performance**: All operations target < 1 second (NFR2-NFR6)
- **Security**: JWT auth on all protected routes, bcrypt hashing, data isolation per user

### Next Steps for Implementation

1. **Epic 1: Foundation & Authentication** - Start here to establish infrastructure
2. **Epic 2: Category System** - Build core envelope budgeting functionality
3. **Epic 3: Income & Expense Tracking** - Implement transaction management
4. **Epic 4: Dashboard** - Create financial visibility interface
5. **Epic 5: Insights & Visualizations** - Add analytics and reporting

Each epic delivers working, user-valuable functionality that builds toward the complete MVP.

---

_For implementation: Use the `/bmad:bmm:workflows:dev-story` workflow to execute individual stories from this epic breakdown._

_This document provides complete implementation guidance for AI agents with all architectural context, technical decisions, and acceptance criteria needed for consistent development._

