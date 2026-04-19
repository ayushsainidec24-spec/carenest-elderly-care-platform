<<<<<<< HEAD
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
=======
# CareNest - Elderly Healthcare Platform

CareNest is a full-stack web application designed to provide healthcare and daily assistance services for elderly people.

## Features

- Health Dashboard (BP, Heart Rate, Glucose)
- Caregiver Booking System
- Telemedicine (Video Consultation UI)
- Emergency SOS Alert System
- Medication Reminder
- Family Monitoring Dashboard

## Tech Stack

Frontend:
- React.js
- Tailwind CSS

Backend:
- Node.js
- Express.js

Database:
- SQLite / PostgreSQL

## Screenshots
![Home](<img width="1713" height="999" alt="image" src="https://github.com/user-attachments/assets/8f1b4b1f-68f1-4936-bee3-334cf8b38829" />)
![Dashboard](<img width="1713" height="1078" alt="image" src="https://github.com/user-attachments/assets/8ecc466b-d1f9-444e-b543-6982ca4a69ad" />)



## How to Run

### Backend
cd backend
npm install
node server.js

### Frontend
cd frontend
npm install
npm start

## Future Improvements

- AI Health Prediction
- Real Video Consultation
- Mobile App Integration

## Author

Ayush Saini
>>>>>>> fe91ec2681ffc35faab12541f1ca2a07c09513d1
