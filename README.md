# Artist Management System 🚀

Fullstack Application using **Node.js + PostgreSQL + Knex + React (Vite)**

---

# 🧰 Tech Stack

## Backend

* Node.js
* Express.js
* PostgreSQL
* Knex.js (Migration & Query Builder)
* JWT Authentication & Bcrypt for hashing

## Frontend

* React.js
* Vite
* Axios
* React Router

---

# 📁 Project Structure

```
project_root/
│
├── backend_postgres/
│     ├── src/
│      ├── migrations/
│      ├── routes/
│      ├── controllers/
│      ├── utils/
│      ├── db/
│      ├── middlewares/
│      ├── models/
│      ├── knexfile.js
│     └── .env
│
└── frontend/
      ├── src/
      ├── public/
      └── .env
```

---

# ⚙️ Backend Environment Variables

Create `.env` inside **node_backend**

```
DB_USER="postgres"
DB_HOST="localhost"
DATABASE="test_new"
PORT_DB=5432
PASSWORD="postgres"

PORT=3000
JWT_SECRET="your jwt secret
NODE_ENV="development"
```

---

# 📦 Backend Installation

```
cd node_backend
npm install
```

---

# 🐘 PostgreSQL Setup

Create database:

```
CREATE DATABASE test_new;
```

---

# 🧱 Knex Migration Commands

```
npx knex migrate:latest
npx knex migrate:rollback
npx knex migrate:make migration_name
```

---

# ▶️ Run Backend

Development:

```
npm run dev
```

Production:

```
npm start
```

Backend runs on:

```
http://localhost:3000
```

---

# ⚛️ Frontend Setup (React + Vite)

Frontend requires **only one environment variable**.

Create `.env` inside **frontend**

```
BACKEND_URI=http://localhost:3000
```

---

# 📦 Frontend Installation

```
cd frontend
npm install
```

---

# ▶️ Run Frontend

```
npm run dev
```

Frontend runs on:

```
http://localhost:5173
```

---

# 🔐 Authentication

System uses **JWT based authentication**.

Protected routes require:

```
Authorization: Bearer <token>
```

---

# 🧠 System Features

✅ Role Based Access Control
✅ User & Artist Relation
✅ PostgreSQL with Knex Migration
✅ Secure JWT Authentication
✅ Modular Backend Architecture
✅ React Dashboard UI
✅ CSV Import / Export (Planned)

---

# 👨‍💻 Project

**Artist Management System – Final Project Submission**

---
