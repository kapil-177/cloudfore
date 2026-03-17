# Tech Stack Architecture

## Overview

CloudFore uses a client-server architecture.

- `client/` contains the React single-page app responsible for authentication, dashboard rendering, service management, metrics visualization, and forecast presentation.
- `server/` contains the REST API, authentication layer, business logic, MongoDB models, forecast logic, and deployment bootstrapping.
- MongoDB stores users, projects, metric samples, forecasts, and recommendations.
- Production hosting uses Vercel for the frontend, Render for the backend API, and MongoDB Atlas for persistent cloud storage.

## Backend Layers

- `config/`: database connection
- `controllers/`: HTTP request handlers
- `middlewares/`: auth, validation, global error handling
- `models/`: Mongoose schemas
- `routes/`: API route definitions
- `services/`: reusable business logic for auth, metrics, forecasting, and recommendations
- `utils/`: async wrapper, custom error, JWT helper, system metrics helper, forecast helper

## Frontend Layers

- `pages/`: screen-level UI such as Login, Dashboard, Services, Metrics, Forecast, Profile, Settings
- `api/`: Axios wrappers for backend communication
- `context/`: auth state management
- `components/`: route guard, loading states, empty states, and reusable UI pieces

## Key Runtime Flows

### Authentication Flow

1. User submits credentials from the login page.
2. The backend validates the user or demo credentials.
3. A JWT token is returned to the frontend.
4. The frontend stores the token in local storage.
5. Protected routes restore the session and redirect unauthenticated users.

### Service Management Flow

1. The frontend requests project data from the backend.
2. The backend returns normalized project objects for the logged-in user.
3. The services page supports searching, filtering, sorting, and CRUD actions.
4. Empty and error states guide the user when data is missing or requests fail.

### Metrics And Forecast Flow

1. Metrics endpoints collect or return live CPU, memory, and load data.
2. Historical metric samples are stored in MongoDB when available.
3. Forecast logic reads recent samples and calculates predicted CPU and memory usage.
4. The frontend visualizes current values, history, and short-term forecasts.

## Request Flow

1. User logs in from the React client.
2. Server validates credentials and returns a JWT.
3. Client stores the JWT and sends it with protected API requests.
4. Protected routes expose project CRUD, metrics, and forecast data.
5. Forecast endpoints derive predictions from stored metric samples and return recommendation summaries.

## Reliability Notes

- The frontend uses reusable loading, empty, and error states to avoid blank screens.
- The deployed frontend avoids using a localhost API target in production builds.
- Service and dashboard data can fall back to cached client data where available for smoother demo behavior.

