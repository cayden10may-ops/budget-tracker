# Budget Tracker
![CI](https://github.com/cayden10may-ops/budget-tracker/actions/workflows/ci.yml/badge.svg)
A full-stack expense tracker with user accounts, built to practise REST APIs, authentication and database security.

**Live demo:** https://budget-tracker-pied-two.vercel.app

> Hosted on free tiers, so the first load may take up to a minute while the server wakes up.

![Budget Tracker screenshot](screenshot.png)

## Features
- Sign up, log in and log out (Supabase Auth)
- Add, edit and delete expenses
- Each user only sees their own data, enforced with Postgres Row Level Security
- Running total in South African rand (ZAR)
- Loading and error states in the UI

## Tech stack
- **Frontend:** React (Vite), deployed on Vercel
- **Backend:** Node.js, Express REST API, deployed on Render
- **Database and auth:** PostgreSQL via Supabase

## How it works
The React app signs users in with Supabase Auth and sends the login token with every request. The Express API passes that token to Supabase, so Row Level Security policies decide which rows each user can read or change.

## API endpoints
| Method | Route | Description |
|---|---|---|
| GET | `/api/expenses` | List the logged-in user's expenses |
| POST | `/api/expenses` | Create an expense |
| PUT | `/api/expenses/:id` | Update an expense |
| DELETE | `/api/expenses/:id` | Delete an expense |

All routes require a valid login token.

## Running locally

**Backend**
```
cd backend
npm install
npm run dev
```
Create `backend/.env`:
```
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_anon_key
PORT=5000
```

**Frontend**
```
cd frontend
npm install
npm run dev
```
Create `frontend/.env`:
```
VITE_API_URL=http://localhost:5000
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

## What I learned
- Building a REST API with Express and connecting it to PostgreSQL
- Authentication flows and securing data with Row Level Security
- Managing React state with hooks and handling loading and error states
- Deploying a separate frontend and backend, and configuring environment variables per environment
- Debugging CORS, environment and deployment issues
