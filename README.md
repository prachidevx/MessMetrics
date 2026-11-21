# MessMetrics

> **Build smarter. Waste less.**  
> A full-stack campus mess management and food waste analytics platform designed to monitor meal demand, track food preparation vs. waste, and empower mess administrators with data-driven insights.

---

## 🎯 Overview

MessMetrics combines modern web engineering with data analytics to address food wastage and meal planning in university dining halls. By tracking daily student attendance, meal-specific food preparation, and leftover waste across daily dining slots, MessMetrics delivers actionable analytics to reduce operational costs and prevent food waste.

### Key Capabilities

* 📊 **Interactive Analytics Dashboard:** Real-time visibility into overall waste percentages, total attendance, food consumption rates, and 90-day trend lines powered by Chart.js.
* 📅 **7-Day Weekly Menu System:** Manage and view recurring dining schedules across all 4 daily slots: **Breakfast**, **Lunch**, **Snacks**, and **Dinner**.
* 🍲 **Meal & Dish Logging:** Seamless workflow for staff to record meal sessions, student turnout, and dish-level metrics.
* 🥗 **Master Dish Catalog:** Centralized repository of all dishes with categorization and historical meal associations.
* 🔐 **Role-Based Portals:** Dedicated views for **Students** (today's menu, ratings) and **Staff/Admin** (operations, data logging, analytics).
* 🗄️ **Relational PostgreSQL Backend:** Backed by Prisma ORM and Neon PostgreSQL with strict schema constraints, unique meal session indexing, and referential integrity.

---

## 🛠️ Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, Vite, Tailwind CSS (v3), Chart.js, React-Chartjs-2, Lucide React |
| **Backend** | Node.js, Express.js (ES Modules) |
| **Database & ORM** | PostgreSQL (Neon Serverless), Prisma ORM |
| **Authentication** | JSON Web Tokens (JWT), bcryptjs |

---

## 📁 Repository Structure

```text
messmetrics/
├── package.json               # Monorepo orchestration scripts
├── README.md                  # Project documentation
├── .gitignore                 # Ignores node_modules, dist, env files
│
├── frontend/                  # React + Vite client
│   ├── index.html             # Application HTML entry point
│   ├── vite.config.js         # Dev server with /api proxy to backend
│   ├── tailwind.config.js     # Custom design system tokens
│   ├── postcss.config.js      # PostCSS pipeline for Tailwind & Autoprefixer
│   ├── package.json
│   └── src/
│       ├── App.jsx            # Main app shell & navigation router
│       ├── main.jsx           # Root DOM mount
│       ├── api.js             # Centralized API fetch client with JWT interceptor
│       ├── store.jsx          # App state & auth context
│       ├── data.js            # Default static fallback menu data
│       ├── styles.css         # Global design tokens & Tailwind directives
│       ├── components/        # Reusable UI widgets (Header, MealCard, Stars)
│       └── pages/             # PortalLanding, Student, Staff, WeeklyMenu, Analytics, Profile
│
└── backend/                   # Express.js REST API
    ├── package.json
    ├── prisma7.config.ts
    ├── prisma/
    │   └── schema.prisma      # Prisma schema definitions (Meal, Dish, MealDish)
    ├── data/
    │   └── weekly-menu.json   # Default 7-day campus mess menu data
    └── src/
        ├── index.js           # Server entry point & DB connection
        ├── db/
        │   ├── prisma.js      # Prisma client singleton
        │   ├── seed.js        # Synthetic 90-day meal & waste data seeder
        │   └── seed_dishes.js # Master dish seeder from weekly menu
        ├── middleware/
        │   └── authMiddleware.js # JWT verification middleware
        └── routes/
            ├── authRoutes.js        # Authentication endpoints (login, register, me)
            ├── dishRoutes.js        # Dish catalog CRUD
            ├── mealRoutes.js        # Meals & MealDish logging CRUD
            ├── weeklyMenuRoutes.js  # Weekly dining schedule endpoints
            └── analyticsRoutes.js   # Summary, by-meal-type, and daily metrics
```

---

## 🚀 Getting Started

### Prerequisites

* **Node.js** (v18.x or higher)
* **npm** (v9.x or higher)
* A **PostgreSQL** database (e.g., [Neon Serverless Postgres](https://neon.tech))

---

### 1. Clone the Repository

```bash
git clone <repository-url>
cd messmetrics
```

---

### 2. Configure Environment Variables

Create a `.env` file in the `backend/` directory:

```bash
cp backend/.env.example backend/.env
```

Open `backend/.env` and provide your database connection string and JWT secret:

```env
DATABASE_URL="postgresql://username:password@ep-sample-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require"
JWT_SECRET="your_secure_jwt_secret_key"
ADMIN_EMAIL="admin@messmetrics.com"
ADMIN_PASSWORD="admin123"
```

---

### 3. Install Dependencies

Install root, backend, and frontend dependencies:

```bash
# Install root orchestration packages
npm install

# Install backend dependencies
cd backend && npm install

# Install frontend dependencies
cd ../frontend && npm install
cd ..
```

---

### 4. Database Setup & Seeding

From the repository root:

```bash
# 1. Generate Prisma Client
cd backend
npx prisma generate
cd ..

# 2. Seed database with master dishes and 90 days of operational records
npm run seed:backend
```

---

### 5. Running the Application

You can run both servers in separate terminal windows:

#### Terminal 1 — Backend Server (Port 3000)
```bash
npm run dev:backend
```
* Backend runs at: `http://localhost:3000`

#### Terminal 2 — Frontend Client (Port 5173)
```bash
npm run dev:frontend
```
* Frontend runs at: `http://localhost:5173`
* Vite automatically proxies `/api/*` requests to the backend at `http://127.0.0.1:3000`.

---

```bash
npx prisma generate
```
