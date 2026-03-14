# Tech Stack Architecture

## Overview

CloudFore uses a client-server architecture.

- `client/` contains the React single-page app responsible for authentication, dashboard rendering, service management, metrics visualization, and forecast presentation.
- `server/` contains the REST API, authentication layer, business logic, MongoDB models, forecast logic, and deployment bootstrapping.
- MongoDB stores users, projects, metric samples, forecasts, and recommendations.

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
- `components/`: route guard and reusable UI pieces

## Request Flow

1. User logs in from the React client.
2. Server validates credentials and returns a JWT.
3. Client stores the JWT and sends it with protected API requests.
4. Protected routes expose project CRUD, metrics, and forecast data.
5. Forecast endpoints derive predictions from stored metric samples and return recommendation summaries.
