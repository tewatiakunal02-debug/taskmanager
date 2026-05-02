# 🚀 Team Task Manager

A full-stack project management web application where teams can create projects, assign tasks, track progress, and manage work efficiently with role-based access control.

🔗 **Live Demo:** https://your-live-app-link.up.railway.app  
📂 **GitHub Repository:** https://github.com/tewatiakunla02-debug/taskmanager

---

## 📌 Features

### 🔐 Authentication & Security
- User Signup / Login
- JWT Token Authentication
- Protected Routes
- Password Hashing with bcryptjs
- Role-Based Access Control (Admin / Member)

### 👥 Project Management
- Create Projects
- Edit / Delete Projects
- Add Team Members
- Track Project Progress
- Set Deadlines

### ✅ Task Management
- Create Tasks
- Assign Tasks to Members
- Update Task Status:
  - Todo
  - In Progress
  - Done
- Set Priorities:
  - Low
  - Medium
  - High
- Track Overdue Tasks

### 📊 Dashboard
- Total Projects
- Total Tasks
- Completed Tasks
- Pending Tasks
- Overdue Tasks
- Quick Project Overview

---

## 🛠 Tech Stack

### Frontend
- React.js
- Vite
- Tailwind CSS
- React Router DOM
- Axios

### Backend
- Node.js
- Express.js

### Database
- MongoDB Atlas
- Mongoose

### Authentication
- JWT
- bcryptjs

### Deployment
- Railway

---

## 📁 Project Structure

```bash
taskmanager/
│── client/        # React Frontend
│── server/        # Express Backend
│── README.md
│── .gitignore

## Setup commands

1. Install backend dependencies:
   ```bash
   cd server
   npm install
   ```
2. Install frontend dependencies:
   ```bash
   cd ../client
   npm install
   ```

## Backend server

- Start development server:
  ```bash
  cd server
  npm run dev
  ```
- Production start:
  ```bash
  npm start
  ```

## Frontend client

- Start React development server:
  ```bash
  cd client
  npm run dev
  ```
- Build production bundle:
  ```bash
  npm run build
  ```

## Environment variables

Create `server/.env` from `server/.env.example`:

```env
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_jwt_secret
CLIENT_URL=http://localhost:5173
PORT=5000
```

Create `client/.env` from `client/.env.example`:

```env
VITE_API_URL=http://localhost:5000/api
```

## Railway deployment

1. Push the project to GitHub.
2. Create a Railway project and connect the repository.
3. Set environment variables on Railway:
   - `MONGO_URI`
   - `JWT_SECRET`
   - `CLIENT_URL=https://<your-railway-site>.railway.app`
   - `PORT=5000`
   - `VITE_API_URL=https://<your-railway-site>.railway.app/api`
4. Configure two services if using Railway:
   - Backend: deploy `server` with `npm start` or `npm run dev`.
   - Frontend: deploy `client` with `npm run build` and `vite preview` or a static site service.

## API Endpoints

- `POST /api/auth/signup`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `POST /api/projects`
- `GET /api/projects`
- `GET /api/projects/:id`
- `PUT /api/projects/:id`
- `DELETE /api/projects/:id`
- `POST /api/tasks`
- `GET /api/tasks`
- `GET /api/tasks/:id`
- `PUT /api/tasks/:id`
- `DELETE /api/tasks/:id`
- `GET /api/dashboard`
- `GET /api/users` (Admin only)
