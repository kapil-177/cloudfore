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
