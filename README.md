# ExpensesTracker

A full-stack envelope budgeting expense tracker with automatic income allocation across custom categories.

## Features

- **User Authentication**: JWT-based authentication with secure password hashing
- **Category Management**: Create custom spending categories with percentage-based allocation
- **Income Auto-Allocation**: Automatically splits income across categories based on defined percentages
- **Expense Tracking**: Log expenses against specific categories with real-time balance updates
- **Dashboard**: Comprehensive overview of category balances and recent transactions
- **Visualizations**: Charts showing spending patterns, income vs expenses, and category distributions
- **Transaction History**: Search, filter, and sort all transactions

## Tech Stack

### Backend
- **Node.js** + **Express.js** (TypeScript)
- **Prisma ORM** v6.x with SQLite database
- **JWT** authentication with httpOnly cookies
- **bcrypt** for password hashing
- Security: **helmet**, **cors**, **express-rate-limit**

### Frontend
- **React** 19 + **TypeScript**
- **Vite** for build tooling
- **React Router** for navigation
- **Axios** for API communication
- **Recharts** for data visualizations
- **React Hook Form** for form handling

## Project Structure

```
ExpensesTracker/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── types/
│   │   ├── utils/
│   │   └── server.ts
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── contexts/
│   │   ├── pages/
│   │   ├── types/
│   │   ├── utils/
│   │   ├── App.tsx
│   │   └── main.tsx
│   └── package.json
└── package.json (root)
```

## Getting Started

### Prerequisites
- Node.js >= 18.0.0
- npm or yarn

### Installation

1. **Install dependencies**:
   ```bash
   # Install root dependencies (concurrently)
   npm install

   # Install backend dependencies
   cd backend && npm install

   # Install frontend dependencies
   cd ../frontend && npm install
   ```

2. **Set up environment variables**:
   ```bash
   # Copy the example env file
   cp .env.example backend/.env.development

   # Edit backend/.env.development with your values
   # Ensure you change JWT_SECRET in production!
   ```

3. **Initialize the database**:
   ```bash
   cd backend
   npx prisma migrate dev --name init
   npx prisma generate
   ```

### Running the Application

**Development mode** (runs both frontend and backend concurrently):
```bash
npm run dev
```

Or run them separately:
```bash
# Backend (from backend directory)
npm run dev

# Frontend (from frontend directory)
npm run dev
```

The application will be available at:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000/api/v1
- **Health Check**: http://localhost:3000/health

### Building for Production

```bash
npm run build
```

## API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login user
- `POST /api/v1/auth/logout` - Logout user
- `GET /api/v1/auth/me` - Get current user

### Categories
- `GET /api/v1/categories` - Get all categories with balances
- `POST /api/v1/categories` - Create category
- `PUT /api/v1/categories/:id` - Update category
- `DELETE /api/v1/categories/:id` - Delete category

### Income
- `POST /api/v1/income` - Log income (auto-allocates)
- `GET /api/v1/income` - Get income history
- `PUT /api/v1/income/:id` - Update income
- `DELETE /api/v1/income/:id` - Delete income

### Expenses
- `POST /api/v1/expenses` - Log expense
- `GET /api/v1/expenses` - Get expenses (with filters)
- `PUT /api/v1/expenses/:id` - Update expense
- `DELETE /api/v1/expenses/:id` - Delete expense

### Dashboard
- `GET /api/v1/dashboard` - Get dashboard data

### Visualizations
- `GET /api/v1/visualizations/spending-by-category` - Spending by category
- `GET /api/v1/visualizations/spending-over-time` - Spending trends
- `GET /api/v1/visualizations/income-vs-expenses` - Income vs expenses
- `GET /api/v1/visualizations/transactions` - All transactions with filters

## Key Features Explained

### Envelope Budgeting System
ExpensesTracker implements envelope budgeting where:
1. You create categories (e.g., "Savings 20%", "Rent 30%", "Food 15%")
2. Categories must total exactly 100% allocation
3. When income is logged, it's automatically split across all categories
4. Expenses deduct from specific category balances

### Automatic Income Allocation
When you log $1,000 income:
- Savings (20%): Gets $200
- Rent (30%): Gets $300
- Food (15%): Gets $150
- And so on...

### Currency Accuracy
All amounts are stored as integers in cents to prevent floating-point errors:
- $10.50 = 1050 cents
- Calculations are always accurate to the cent

## Security Features

- Password hashing with bcrypt (10 salt rounds)
- JWT tokens in httpOnly cookies (XSS protection)
- CORS configuration
- Rate limiting (100 requests/15min general, 5 requests/15min auth)
- Helmet for security headers
- Input validation with express-validator
- User data isolation (all queries filter by userId)

## License

ISC

---

Built with ❤️ using the BMM (BMAD Methodology Manager) development workflow
