# Selava Therinchuka 💰 — Full Stack Expense Tracker
## Complete Setup & Run Guide

---

## 📁 Project Structure

```
selava-therinchuka/
├── frontend/               ← Open this in browser
│   ├── index.html
│   ├── register.html
│   ├── dashboard.html
│   ├── css/
│   │   ├── auth.css
│   │   └── dashboard.css
│   └── js/
│       ├── auth.js         ← API base URL is here
│       ├── login.js
│       ├── register.js
│       └── dashboard.js
│
├── backend/                ← Run this with Node.js
│   ├── .env               ← Database & JWT config (READY TO USE)
│   ├── server.js
│   ├── app.js
│   ├── package.json
│   ├── config/
│   ├── controllers/
│   ├── routes/
│   ├── middleware/
│   ├── models/
│   ├── services/
│   ├── validators/
│   └── utils/
│
└── database/
    └── schema.sql          ← Import this into MySQL
```

---

## ✅ STEP-BY-STEP: RUN THE PROJECT

---

### STEP 1 — Start XAMPP

1. Open **XAMPP Control Panel**
2. Click **Start** next to **Apache**
3. Click **Start** next to **MySQL**
4. Both should show green ✅

---

### STEP 2 — Create the Database

1. Open your browser → go to: **http://localhost/phpmyadmin**
2. Click **Import** in the top menu
3. Click **Choose File** → select `database/schema.sql`
4. Click **Go** at the bottom
5. You should see: ✅ **Import has been successfully finished**

The database `selava_therinchuka_db` is now created with all tables.

---

### STEP 3 — Install Node.js (if not installed)

Download from: https://nodejs.org (LTS version)

Verify installation:
```bash
node -v    # should show v18 or higher
npm -v     # should show version number
```

---

### STEP 4 — Run the Backend

Open a **terminal / command prompt** and run:

```bash
# Go into the backend folder
cd path/to/selava-therinchuka/backend

# Install all packages (first time only)
npm install

# Start the backend server
npm run dev
```

You should see:
```
────────────────────────────────────────
  Selava Therinchuka 💰 – Backend
  Environment : development
  Server      : http://localhost:5000
  API Base    : http://localhost:5000/api
────────────────────────────────────────
```

✅ Backend is running on **port 5000**

Test it: open **http://localhost:5000/health** in your browser
→ You should see: `{"success":true,"message":"Selava Therinchuka API is running 💰"}`

---

### STEP 5 — Open the Frontend

**Option A — VS Code Live Server (Recommended)**
1. Open VS Code
2. Open the `frontend/` folder
3. Right-click `index.html` → **Open with Live Server**
4. Frontend opens at `http://127.0.0.1:5500`

**Option B — Python (simple)**
```bash
cd path/to/selava-therinchuka/frontend
python3 -m http.server 5500
```
Then open: **http://localhost:5500**

**Option C — Direct file (if CORS issues occur, use Option A or B instead)**
Just double-click `frontend/index.html`

---

### STEP 6 — Use the App

1. Go to `http://127.0.0.1:5500` (or wherever frontend is running)
2. Click **"Create one"** → Register with your name, age, email, password
3. Login with the same email and password
4. You are in the dashboard! ✅
5. Click **+ Add Expense** → fill in the form → click **Save Expense**
6. Data goes to MySQL database via Node.js backend

---

## 🔧 Configuration

The `.env` file in `/backend/` is pre-configured for XAMPP:

```env
DB_HOST=localhost
DB_PORT=3306
DB_NAME=selava_therinchuka_db
DB_USER=root
DB_PASSWORD=        ← leave blank for XAMPP default
```

If your MySQL has a password, add it here.

---

## ⚠️ Common Problems & Fixes

**Problem: "Failed to load data. Is the backend running?"**
→ The Node.js backend is not started. Do Step 4.

**Problem: Database connection failed on npm run dev**
→ XAMPP MySQL is not running. Do Step 1.
→ Check that DB_NAME, DB_USER, DB_PASSWORD in `.env` match your MySQL.

**Problem: Login says "Invalid email or password"**
→ You must register first! Click "Create one" on the login page.

**Problem: CORS error in browser console**
→ Use VS Code Live Server (Option A in Step 5), not file://

**Problem: Port 5000 already in use**
→ Change `PORT=5001` in `.env`, and also update `auth.js` line 7:
   `const API_BASE = 'http://localhost:5001/api'`

---

## 📡 API Endpoints (for testing with Postman)

| Method | URL                          | Auth | Body |
|--------|------------------------------|------|------|
| POST   | /api/auth/register           | No   | name, email, password, age |
| POST   | /api/auth/login              | No   | email, password |
| GET    | /api/expenses                | Yes  | - |
| POST   | /api/expenses                | Yes  | amount, description, category, expense_date, payment_mode |
| PUT    | /api/expenses/:id            | Yes  | same as POST |
| DELETE | /api/expenses/:id            | Yes  | - |
| GET    | /api/dashboard               | Yes  | - |

Auth header: `Authorization: Bearer <your_token>`

---

## 🗄️ Database Tables

| Table           | Description |
|-----------------|-------------|
| users           | User accounts |
| expenses        | All expense records |
| budgets         | Monthly category budgets |
| user_sessions   | Session tracking |
| password_resets | Password reset tokens |
| activity_logs   | Audit log |

---

Built with ❤️ — Selava Therinchuka 💰
