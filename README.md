# Bus Travel Platform

Full-stack bus travel platform with community posts, route planning, reviews, advanced notifications, and internationalization.

- **Frontend**: React + Vite + Tailwind
- **Backend**: Node.js + Express + MongoDB (Mongoose)

## 🌐 Live Deployment

- Frontend: https://ted-bus-frontend.onrender.com
- Backend API: https://bus-backend-wq82.onrender.com

## ✨ Features

- Community & user-generated content (posts, likes, comments, reports)
- Trending posts based on engagement
- Advanced notifications (email + optional push) with user preferences
- i18n (English/Spanish/French) using `react-i18next`
- Interactive route planning (Google Maps integration)
- Dark mode (persisted)
- Reviews system (verified users, journey-based, moderation)
- API metrics endpoint (Prometheus/Grafana-friendly)

## 🧰 Repo Layout

- `backend/` — Express API server
- `frontend/` — React web app

## ✅ Prerequisites

- Node.js (v18+ recommended)
- MongoDB Atlas (or local MongoDB)
- Google Maps API key (for route planning)
- Email credentials (Gmail recommended) for notification/email flows

## 🔧 Local Development

### 1) Install dependencies

From repo root:

```bash
npm install
cd backend && npm install
cd ../frontend && npm install
```

### 2) Configure environment variables

#### Backend (`backend/production.env.example` → create `backend/.env`)

Create `backend/.env`:

```env
NODE_ENV=development
PORT=5000

MONGODB_URI=mongodb+srv://<user>:<pass>@<cluster-host>/<db>?retryWrites=true&w=majority
JWT_SECRET=change-me-use-32plus-bytes

FRONTEND_URL=http://localhost:5173
GOOGLE_MAPS_API_KEY=

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=
EMAIL_PASS=

# Optional: metrics protection
METRICS_TOKEN=
```

Backend env validation (fail-fast): `NODE_ENV`, `PORT`, `MONGODB_URI`, `JWT_SECRET`, `FRONTEND_URL` must be present.

#### Frontend (`frontend/` → create `frontend/.env`)

```env
VITE_GOOGLE_MAPS_API_KEY=your-google-maps-api-key
# (Optional but recommended) if your API base URL differs from default
# VITE_API_URL=http://localhost:5000
```

> Frontend Axios base URL is read from `import.meta.env.VITE_API_URL`.

### 3) Run

Terminal 1 (Backend):

```bash
cd backend
npm run dev
```

Terminal 2 (Frontend):

```bash
cd frontend
npm run dev
```

Default local URLs:
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

## 🚀 Deployment Notes (Render)

### Frontend

The frontend uses `frontend/render.yaml` with a standard static web build.

Ensure you set `VITE_GOOGLE_MAPS_API_KEY` (and `VITE_API_URL` if needed) in the Render environment.

### Backend

Backend entrypoint: `backend/src/server.js`.

Set the required env vars in your Render service:
- `NODE_ENV`, `PORT`, `MONGODB_URI`, `JWT_SECRET`, `FRONTEND_URL`

Backend also supports:
- `GOOGLE_MAPS_API_KEY`
- Cloudinary vars
- Email vars
- `METRICS_TOKEN` (optional)

## 📌 API Endpoints

Base paths are mounted in `backend/src/app.js`.

### Authentication
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`

### Users
- `GET /api/users/*` (see `backend/routes/user.routes.js`)

### Posts
- `GET /api/posts`
- `GET /api/posts/trending`
- `GET /api/posts/:id`
- `POST /api/posts` (verified users only)
- `POST /api/posts/:id/like`
- `POST /api/posts/:id/comment`
- `POST /api/posts/:id/report`

### Notifications
- `GET /api/notifications`
- `PUT /api/notifications/:id/read`
- `PUT /api/notifications/read-all`
- `GET /api/notifications/preferences`
- `PUT /api/notifications/preferences`

### Route Planning
- `POST /api/route-planning/plan`
- `POST /api/route-planning/save`
- `GET /api/route-planning/saved`
- `POST /api/route-planning/compare`

### Reviews
- `GET /api/reviews/route/:routeId`
- `POST /api/reviews` (verified users only)
- `PUT /api/reviews/:id`
- `POST /api/reviews/:id/upvote`
- `POST /api/reviews/:id/report`

### Uploads
- `POST /api/uploads/*` (see `backend/routes/upload.routes.js`)

### Admin
- `POST /api/admin/*` (see `backend/routes/admin.routes.js`)

### Health / Metrics
- `GET /api/health`
- `GET /metrics` (metrics route; may require `METRICS_TOKEN`)

## 🧪 Testing

There is no dedicated test runner documented in this repo snapshot.

## 📝 License

Educational/internship project.

