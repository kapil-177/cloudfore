# CloudFore

CloudFore is a cloud resource forecasting dashboard built with a React frontend and an Express + MongoDB backend. The UI concept stays focused on cloud services management, live system metrics, and short-term forecast insights.

## Tech Stack

- Frontend: React, Vite, Axios, React Router
- Backend: Node.js, Express, Mongoose, JWT, Express Validator
- Database: MongoDB
- Deployment: Docker, docker-compose, Vercel, Render, GitHub Actions

## Project Structure

```text
cloudfore/
  client/      # React frontend
  server/      # Express API + MongoDB integration
  docs/        # Architecture, schema, and wireframe docs
```

## Evaluation Coverage

- Phase 1: architecture docs, database schema docs, UI wireframe components, GitHub-ready folder structure
- Phase 2: REST API, MongoDB integration, JWT auth, full CRUD for projects, validation and error handling
- Phase 3: polished UI flow, forecast logic, cleaner code organization, performance-minded API/UI structure, deployment-ready configuration

## Phase 3 Highlights

- Refined multi-page UI with protected routes, cleaner empty states, retry states, and session restore loading
- Search, filter, and sort support on the services page for better usability during demos
- Paginated services API and UI controls for smoother performance on larger datasets
- Live metrics dashboard with CPU, memory, load, and CSV export
- Short-term forecasting using recent metric history and derived prediction summaries
- Toast feedback, route-level code splitting, and lightweight OpenAPI documentation
- Production deployment setup for Vercel frontend, Render backend, and MongoDB Atlas

## Core Features

- Demo login with JWT-based authentication
- Protected dashboard, services, metrics, forecast, profile, and settings pages
- Create, update, delete, and monitor cloud services
- Search services by name, type, environment, and region
- Filter services by status and type
- Sort services by newest, oldest, and alphabetical order
- Paginate service results with backend-supported page metadata
- Track live CPU, memory, and system load data
- Export CPU metrics history to CSV
- Forecast upcoming CPU and memory usage from recent samples

## Viva Summary

### Problem Statement

CloudFore helps users monitor cloud-style services, observe live system resource usage, and make short-term capacity decisions using forecasted CPU and memory trends.

### Why This Project Is Useful

- Basic CRUD apps only store records
- CloudFore adds live monitoring and prediction on top of CRUD
- This makes the project more practical for planning and operational decision-making

### Architecture Flow

1. The user logs in through the React frontend.
2. The Express backend validates credentials and returns a JWT.
3. The frontend stores the token and attaches it to protected API requests.
4. Project and metrics routes return live system and stored data from MongoDB.
5. The forecast service processes historical metrics and returns predicted usage values.

### Tech Stack Explanation

- React + Vite: fast single-page frontend
- Axios: API communication layer
- Express: REST API backend
- MongoDB + Mongoose: persistent storage for users, projects, and metrics
- JWT: authentication and protected routes
- Vercel + Render + MongoDB Atlas: production deployment stack

## Testing And Edge Cases Covered

- Invalid login credentials return an error instead of a blank screen
- Protected routes wait for session restore before rendering
- Services page handles:
  empty service list
  failed API request
  filtered results returning zero matches
- Metrics and forecast pages handle:
  backend disconnects
  missing live samples
  retry and fallback UI states
- Production login avoids accidental localhost API calls in deployed builds

## Challenges Faced And Solutions

- Deployment login failed because the frontend could resolve to a localhost API URL in production
- Solution: production API base URL logic now ignores localhost config on hosted builds and falls back to the Vercel `/api` rewrite

- Metrics and forecast pages could feel broken when the backend was slow or unavailable
- Solution: added explicit loading, empty, and retry/error states

- Services management was functional but not evaluator-friendly
- Solution: added search, filter, sort, and better list feedback for usability

## Screenshots

Add these before final submission:

- Login page
- Dashboard
- Services with search/filter/sort
- Metrics page
- Forecast page
- Deployment/live URL

## Demo Login

- Email: `demo@cloudfore.dev`
- Password: `demo12345`

The backend auto-seeds this demo account on startup.

## Local Run

### 1. Start MongoDB

Use Docker:

```bash
docker compose up -d mongo
```

### 2. Run the server

```bash
cd server
npm install
npm run dev
```

### 3. Run the client

```bash
cd client
npm install
npm run dev
```

## Docker Run

```bash
docker compose up --build
```

Frontend: `http://localhost:5173`

Backend: `http://localhost:5000`

## Production Deployment

This project includes production deployment configuration for:

- Frontend on Vercel: [client/vercel.json](/d:/COLLEGE/PROJECT/cloudfore/client/vercel.json)
- Backend on Render: [render.yaml](/d:/COLLEGE/PROJECT/cloudfore/render.yaml)
- CI/CD with GitHub Actions: [.github/workflows/ci-cd.yml](/d:/COLLEGE/PROJECT/cloudfore/.github/workflows/ci-cd.yml)
- API docs: [server/src/docs/openapi.js](/d:/COLLEGE/PROJECT/cloudfore/server/src/docs/openapi.js)

### 1. Deploy MongoDB

Use MongoDB Atlas and create a database named `cloudfore`.

### 2. Deploy Backend on Render

Create a Render Web Service connected to this repository or use the included `render.yaml`.

Set these environment variables in Render:

- `MONGODB_URI`
- `MONGODB_DB=cloudfore`
- `JWT_SECRET`
- `JWT_EXPIRES_IN=1d`
- `CLIENT_URL=https://your-vercel-app.vercel.app`
- `DEMO_EMAIL=demo@cloudfore.dev`
- `DEMO_PASSWORD=demo12345`
- `DEMO_NAME=Cloud Admin`

After deployment, your backend URL will look like:

```text
https://cloudfore-api.onrender.com
```

### 3. Deploy Frontend on Vercel

Import the `client` folder into Vercel and set:

- `VITE_API_URL=https://cloudfore-api.onrender.com/api`

After deployment, your frontend URL will look like:

```text
https://cloudfore.vercel.app
```

### 4. Configure CI/CD

Push the project to GitHub, then add these GitHub repository secrets:

- `VITE_API_URL`
- `RENDER_DEPLOY_HOOK`
- `VERCEL_DEPLOY_HOOK`

The included GitHub Actions workflow builds the app on every pull request and push to `main`, then triggers deploy hooks for Render and Vercel on `main`.

## Required For A Real Public URL

This repository now contains production deployment config, but a real public deployment URL exists only after you:

1. Push the project to GitHub
2. Deploy the backend to Render
3. Deploy the frontend to Vercel
4. Add GitHub Actions secrets

Until then, the working local URLs are:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5000`
- API docs: `http://localhost:5000/api/docs`

## Submission Checklist

- Frontend deployed and accessible from Vercel
- Backend deployed and accessible from Render
- MongoDB Atlas connected
- Demo login working on the live site
- README updated with features, architecture, and deployment
- Screenshots added for final report or PPT
