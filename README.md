# Budget Tracker
**Live demo:** https://budget-tracker-pied-two.vercel.app/
> Hosted on free tiers, so the first load may take up to a minute while the server wakes up.
A full-stack expense tracking app built to practice CRUD operations, REST APIs, and database integration.

## Features
- Add new expenses with amount, category, and note
- View all expenses in a live-updating list
- Delete expenses
- Data persisted in a PostgreSQL database (Supabase)

## Tech Stack
- **Frontend:** React (Vite)
- **Backend:** Node.js, Express
- **Database:** PostgreSQL (via Supabase)

## Running it locally

**Backend**
\`\`\`
cd backend
npm install
npm run dev
\`\`\`

**Frontend**
\`\`\`
cd frontend
npm install
npm run dev
\`\`\`

You'll need a `.env` file in `/backend` with your own Supabase credentials:
\`\`\`
SUPABASE_URL=your_url
SUPABASE_KEY=your_anon_key
PORT=5000
\`\`\`

## What I learned
- Building a REST API from scratch with Express
- Connecting a frontend to a backend via fetch requests
- Managing React state with useState/useEffect
- Basic database security (Row Level Security in Supabase)