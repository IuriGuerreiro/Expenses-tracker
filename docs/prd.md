---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
inputDocuments: []
workflowType: 'prd'
lastStep: 11
project_name: 'ExpensesTracker'
user_name: 'a'
date: '2025-12-02'
---

# Product Requirements Document - ExpensesTracker

**Author:** a
**Date:** 2025-12-02

## Executive Summary

**ExpensesTracker** is a flexible personal finance web application that gives users complete control over how they track and manage their money. Unlike rigid budgeting tools that force users into predefined workflows, ExpensesTracker provides a customizable envelope budgeting system where users manually log income from any source (paychecks, side gigs, gifts), automatically allocate funds by percentage to custom categories (savings, emergency fund, spending buckets), and track expenses against those allocated amounts.

The core value proposition is **flexibility without complexity** - users define their own categories, set their own allocation rules, and get immediate visual feedback through graphs and reporting, all without the overhead of bank integrations or complicated financial concepts.

### What Makes This Special

**User-Defined Financial Structure:** ExpensesTracker doesn't impose a "right way" to budget. Users create their own category system, define their own percentage splits, and organize their money in a way that makes sense to them - whether that's traditional budgeting categories, project-based funds, or completely custom buckets.

**Manual Control, Automatic Allocation:** The sweet spot between manual entry and automation. Users manually log income (maintaining control and simplicity), but the system automatically splits that income across categories based on user-defined rules. This eliminates the friction of bank syncing while still providing intelligent money management.

**Visual Financial Clarity:** Graphs and visualizations transform raw transaction data into actionable insights, helping users see spending patterns, category balances, and financial trends at a glance without needing to be a spreadsheet wizard.

## Project Classification

**Technical Type:** web_app
**Domain:** general
**Complexity:** low

**Rationale:** ExpensesTracker is a browser-based single-page application (SPA) built with Vite + React frontend and Node.js backend using SQLite for data persistence. The domain is classified as general (not fintech) because it handles manual financial tracking without regulatory concerns - no bank integrations, payment processing, or compliance requirements. Complexity is low due to straightforward CRUD operations, percentage-based calculations, and standard authentication patterns. The technical challenges are well-understood web development patterns: user auth, data modeling for transactions and categories, calculation logic for allocations, and data visualization with charting libraries.

## Success Criteria

### User Success

**ExpensesTracker succeeds when users (starting with you) achieve three core outcomes:**

1. **Instant Allocation Success** - Users log income (paycheck, side gig, gift) and immediately see it automatically split across their custom categories based on predefined percentage rules. No manual math, no splitting logic - the system handles allocation instantly upon income entry.

2. **Spending Confidence** - Before logging any expense, users can clearly see their current balance in each category. This visibility prevents accidental overspending and provides confidence that spending decisions align with their allocation strategy.

3. **Visual Pattern Recognition** - Users access graphs and visualizations that reveal spending patterns, category distribution, and trends over time. These insights surface behaviors that would remain hidden in raw transaction lists or spreadsheets.

**Measurable Success Indicator:** You use ExpensesTracker consistently as your primary expense tracking tool, replacing spreadsheets or other manual methods. The tool becomes your default for financial decision-making.

### Business Success

**Primary Success:** ExpensesTracker solves your personal expense tracking needs and becomes your daily/weekly financial management tool.

**Secondary Success:** Other users discover value in the flexible envelope budgeting approach and adopt it for their own use. Public adoption is a bonus, not a requirement.

**Success Metric:** Personal adoption and consistent usage. The tool proves valuable enough that you continue using it rather than reverting to previous methods.

### Technical Success

**ExpensesTracker is technically successful when:**

- **Performance:** Income allocation calculations execute in real-time (< 1 second from save to category update)
- **Data Integrity:** Category balances remain accurate across all income and expense transactions with zero calculation errors
- **Reliability:** Users can access their financial data whenever needed with minimal downtime
- **Visualization Performance:** Graphs render efficiently even with months of transaction history
- **User Experience:** The Vite + React frontend provides responsive, intuitive interactions with no noticeable lag

### Measurable Outcomes

- **User adopts the tool:** Logs at least one income and multiple expenses per week
- **Allocation works flawlessly:** 100% accuracy in percentage-based category splits
- **Visualization provides insights:** Graphs load in < 2 seconds and reveal spending patterns at a glance
- **Data persistence:** SQLite reliably stores and retrieves all transactions with zero data loss
- **Authentication security:** User accounts remain secure with proper auth implementation

## Product Scope

### MVP - Minimum Viable Product

**The core loop that makes ExpensesTracker immediately useful:**

**User Management:**
- User registration and authentication
- Secure login/logout functionality
- User session management

**Category Management:**
- Create custom spending categories (savings, emergency, food, entertainment, etc.)
- Define percentage allocation rules for each category
- Edit/delete categories
- View all categories with current balances

**Income Tracking:**
- Manually log income entries (paycheck, side gig, gift, etc.)
- Add income amount, source, and date
- System automatically splits income across categories based on allocation percentages
- View income transaction history

**Expense Tracking:**
- Manually log expenses against specific categories
- Add expense amount, description, category, and date
- System automatically deducts from category balance
- View expense transaction history

**Balance Visibility:**
- Dashboard showing all category balances at a glance
- Real-time balance updates after income/expense entries
- Clear indication of available funds per category

**Visualizations:**
- Basic graphs showing spending by category
- Spending patterns over time (weekly, monthly views)
- Category distribution visualizations
- Income vs. expenses overview

**Tech Stack (Fixed):**
- Frontend: Vite + React
- Backend: Node.js
- Database: SQLite
- Authentication: Secure user auth implementation

### Growth Features (Post-MVP)

**Enhanced after core loop is validated:**

- **Advanced Visualizations:** Interactive charts, spending forecasts, trend analysis
- **Budget Alerts:** Warnings when approaching category limits or overspending detected
- **Recurring Transactions:** Auto-log monthly paychecks or regular expenses
- **Transaction Search & Filtering:** Find specific expenses or income entries quickly
- **Data Export:** Export transactions to CSV or PDF for external analysis
- **Category Goals:** Set savings targets or spending limits per category
- **Multi-timeframe Views:** Compare month-over-month, quarter-over-quarter spending
- **Mobile Optimization:** Responsive design improvements for on-the-go tracking
- **Transaction Notes:** Add detailed notes or tags to income/expense entries

### Vision (Future)

**Dream features for comprehensive financial management:**

- **Bank Import Automation:** Connect to banks for automatic transaction import (optional alternative to manual entry)
- **Receipt Management:** Photo upload and OCR for receipt tracking
- **Bill Reminders:** Due date tracking and payment reminders
- **Goal Tracking:** Save $X by Y date with progress visualization
- **Multi-user Support:** Shared household budgets with multiple users
- **Account Types:** Support for checking, savings, credit card accounts
- **Investment Tracking:** Expand beyond expenses to full financial overview
- **Smart Insights:** AI-powered spending recommendations and anomaly detection
- **API Access:** Public API for third-party integrations
- **Multi-currency Support:** Track expenses in multiple currencies

## User Journeys

**Journey 1: The Primary User - Taking Control of Personal Finances**

A person sits down with their latest paycheck, ready to allocate their money across different financial goals. In the past, this meant opening a spreadsheet, manually calculating percentages, updating multiple cells, and hoping they didn't make a formula error. Existing budgeting apps force them into predefined categories that don't match how they think about money, and they're tired of rigid systems that don't flex to their needs.

They discover ExpensesTracker and decide to build something that works exactly the way they want. The first step is simple: create an account, log in, and set up their custom categories - not the generic "Food" and "Entertainment" that every other app forces on them, but their own meaningful buckets: "Emergency Fund 20%", "Savings 30%", "Daily Spending 40%", "Fun Money 10%".

Next comes the magic moment. They log their paycheck amount, hit save, and watch as ExpensesTracker instantly splits that income across all their categories based on the percentages they defined. No calculator needed. No manual math. The system just handles it. Within seconds, they see their dashboard update with fresh balances in each category - they know exactly how much they have to work with.

Throughout the week, they log expenses as they happen. Coffee purchase? Subtract from Daily Spending. Emergency car repair? Deduct from Emergency Fund. Each entry is quick - amount, description, category, done. The balance updates immediately, and they always know where they stand before making the next purchase.

The real breakthrough comes when they open the visualizations tab. Graphs show their spending patterns over the past month - they can see which categories drain fastest, whether their allocation percentages actually match their lifestyle, and where adjustments might help. What used to be hidden in rows of spreadsheet data now jumps out visually: "I'm spending way more on dining out than I thought" or "My savings rate is actually holding steady - I'm on track."

Three months later, this person has completely replaced their old tracking methods. No more spreadsheets. No more generic budgeting apps that don't understand their needs. ExpensesTracker has become their default financial dashboard - the first thing they check before making spending decisions, the tool that gives them confidence they're managing money the way they want to manage it.

### Journey Requirements Summary

**This journey reveals the following capabilities needed for ExpensesTracker:**

**User Management & Authentication:**
- User registration and secure login system
- Session management to maintain user state across visits
- Personal account with isolated data per user

**Category Management System:**
- Create custom categories with user-defined names
- Assign percentage allocation rules to each category
- Edit existing categories (name, percentage)
- Delete categories when no longer needed
- View all categories with current balances on a dashboard

**Income Tracking & Auto-Allocation:**
- Manual income entry form (amount, source, date)
- Real-time calculation engine that splits income by category percentages
- Instant balance updates across all affected categories
- Income transaction history view

**Expense Tracking & Balance Management:**
- Manual expense entry form (amount, description, category, date)
- Real-time balance deduction from selected category
- Clear display of available balance before expense entry
- Expense transaction history view
- Prevent confusion about "where did my money go"

**Dashboard & Balance Visibility:**
- Central dashboard showing all category balances at a glance
- Real-time updates after every income/expense transaction
- Clear visual indicators of available funds per category
- Quick access to add income or expenses from dashboard

**Data Visualization & Insights:**
- Graphs showing spending by category (pie charts, bar charts)
- Time-based spending patterns (weekly, monthly views)
- Category distribution visualizations
- Income vs. expenses overview
- Visual trend analysis to spot patterns

**Data Persistence & Reliability:**
- SQLite database storing all transactions and categories
- Zero data loss across sessions
- Transaction history always available
- Accurate calculations maintained over time

## Web App Specific Requirements

### Project-Type Overview

ExpensesTracker is a single-page web application (SPA) accessed through modern web browsers. The architecture follows a standard client-server model with a React-based frontend communicating with a Node.js REST API backend, backed by SQLite for data persistence.

### Technical Architecture Considerations

**Browser Compatibility:**
- Support for modern evergreen browsers (Chrome, Firefox, Safari, Edge)
- Minimum browser versions: Last 2 major versions
- Progressive enhancement approach for optimal experience

**Responsive Design:**
- Mobile-responsive layout (320px minimum width)
- Tablet and desktop optimized views
- Touch-friendly interactions for mobile devices

**Client-Side Architecture:**
- React SPA with client-side routing
- State management for real-time balance calculations
- Local session management
- API communication via REST endpoints

**Backend Architecture:**
- Node.js REST API server
- SQLite database for data persistence
- JWT-based authentication
- RESTful endpoint design

**Deployment Considerations:**
- Static frontend assets served via standard web hosting
- Backend API server deployment
- Database backup and recovery procedures
- Environment configuration management

### Implementation Considerations

**Frontend Stack:**
- Vite build tooling for fast development
- React for component-based UI
- Modern JavaScript (ES6+)
- CSS framework or styled components for styling
- Charting library for visualizations (Chart.js, Recharts, or similar)

**Backend Stack:**
- Node.js runtime
- Express.js or similar framework for API routing
- SQLite3 driver for database access
- bcrypt or similar for password hashing
- JWT libraries for authentication tokens

**Development Workflow:**
- Local development environment setup
- Hot module replacement for frontend development
- API endpoint testing and documentation
- Database migration strategy

## Functional Requirements

### User Management & Authentication

- FR1: Users can register for a new account with email and password
- FR2: Users can log in to their account with credentials
- FR3: Users can log out of their account
- FR4: Users can reset their password if forgotten
- FR5: System maintains user session across page refreshes
- FR6: System isolates user data per account (no cross-user data access)

### Category Management

- FR7: Users can create custom spending categories with user-defined names
- FR8: Users can assign percentage allocation rules to each category
- FR9: Users can edit existing category names and allocation percentages
- FR10: Users can delete categories when no longer needed
- FR11: Users can view all categories with current balances on a dashboard
- FR12: System prevents category deletion if transactions exist for that category
- FR13: System validates that total allocation percentages equal 100%

### Income Tracking & Auto-Allocation

- FR14: Users can manually log income entries with amount, source description, and date
- FR15: System automatically splits income across categories based on defined allocation percentages upon save
- FR16: System updates all affected category balances in real-time after income allocation
- FR17: Users can view complete income transaction history
- FR18: Users can edit or delete income transactions
- FR19: System recalculates category balances when income transactions are modified or deleted

### Expense Tracking & Balance Management

- FR20: Users can manually log expenses with amount, description, category selection, and date
- FR21: System automatically deducts expense amount from selected category balance
- FR22: System displays available balance for each category before expense entry
- FR23: Users can view complete expense transaction history
- FR24: Users can edit or delete expense transactions
- FR25: System recalculates category balances when expense transactions are modified or deleted
- FR26: Users can filter expense history by category, date range, or description

### Dashboard & Balance Visibility

- FR27: Users can view a dashboard showing all category balances at a glance
- FR28: Dashboard updates in real-time after every income or expense transaction
- FR29: Dashboard provides quick access buttons to add income or expenses
- FR30: Users can see total available funds across all categories
- FR31: Dashboard highlights categories with low or zero balances

### Data Visualization & Insights

- FR32: Users can view graphs showing spending distribution by category (pie or bar charts)
- FR33: Users can view spending patterns over time with selectable timeframes (weekly, monthly)
- FR34: Users can view category distribution visualizations
- FR35: Users can view income vs. expenses overview for selected time periods
- FR36: System provides visual trend analysis to identify spending patterns
- FR37: Users can export visualization data for external analysis

### Transaction Management

- FR38: Users can search transaction history by description, amount, or category
- FR39: System maintains complete audit trail of all income and expense transactions
- FR40: Users can sort transactions by date, amount, or category
- FR41: System displays transaction timestamps for all entries

## Non-Functional Requirements

### Performance

- NFR1: User interface actions (button clicks, form submissions) respond within 200ms
- NFR2: Income allocation calculations complete within 1 second of save action
- NFR3: Dashboard and category balances update in real-time (< 1 second) after transactions
- NFR4: Graphs and visualizations render within 2 seconds even with 12 months of transaction data
- NFR5: Page load time remains under 3 seconds on standard broadband connections
- NFR6: API endpoint responses complete within 1 second for standard operations

### Security

- NFR7: All user passwords are hashed using industry-standard algorithms (bcrypt or similar)
- NFR8: User sessions are managed via secure JWT tokens with appropriate expiration
- NFR9: All API endpoints require authentication except registration and login
- NFR10: SQL injection attacks are prevented through parameterized queries
- NFR11: User data is isolated per account with no cross-user data leakage
- NFR12: HTTPS is required for all production deployments
- NFR13: Sensitive data (passwords, tokens) is never logged or exposed in error messages

### Reliability & Data Integrity

- NFR14: Category balance calculations maintain 100% accuracy across all transactions
- NFR15: Database transactions ensure atomic operations (all-or-nothing for multi-step operations)
- NFR16: System prevents data loss through regular database backup mechanisms
- NFR17: System gracefully handles and reports errors without exposing technical details to users
- NFR18: System validates all user inputs to prevent invalid data entry
- NFR19: Transaction history remains accessible and accurate indefinitely

### Usability

- NFR20: User interface provides clear visual feedback for all actions
- NFR21: Forms include validation with helpful error messages
- NFR22: Critical actions (delete category, delete transaction) require confirmation
- NFR23: Interface is intuitive enough for first-time users without training
- NFR24: Mobile responsive design works effectively on devices 320px width and above

### Scalability

- NFR25: System supports individual user accounts with up to 50 categories without performance degradation
- NFR26: System handles up to 10,000 transactions per user without significant performance impact
- NFR27: Database queries remain performant as transaction history grows over years of use

### Maintainability

- NFR28: Codebase follows consistent coding standards and conventions
- NFR29: Database schema supports future additions without breaking changes
- NFR30: API endpoints are versioned to support future evolution
- NFR31: Code includes appropriate error handling and logging for debugging
