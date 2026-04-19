# CareNest Platform

This repository contains a **Node/Express backend** and a **React frontend** for a simple caregiver/health dashboard app.

## ✅ Run in development mode (frontend + backend separately)
This is the fastest workflow for development (hot reloading).

From the project root:

```bash
npm run dev
```

- Backend runs on **http://localhost:5000**
- Frontend runs on **http://localhost:3001**

The frontend is configured to proxy API requests to the backend via `/api/*`.

## ✅ Run as a single app (frontend served by backend)
This builds the React app and serves it from the backend on one port.

From the project root:

```bash
npm start
```

Then open:

- **http://localhost:5000**

## 🧰 Project Structure
- `backend/` — Express server + SQLite database + API routes
- `frontend/` — React app (CRA)

## Notes
- The backend listens on port **5000** by default.
- The frontend proxies `/api` requests to the backend so you can call `fetch('/api/..')`.

---

If you want help adding authentication, persistence, or deployment instructions, just ask!