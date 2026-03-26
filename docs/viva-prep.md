# Viva Prep

## Project Summary

CloudFore is a full-stack cloud resource forecasting dashboard that helps a user manage cloud services, monitor live system metrics, and predict short-term resource demand. The goal is to make cloud usage more visible and easier to plan before performance or cost issues appear.

## Tech Stack

- Frontend: React, Vite, Axios, React Router
- Backend: Node.js, Express
- Database: MongoDB with Mongoose
- Authentication: JWT
- Validation: Express Validator
- Deployment targets: Vercel, Render, MongoDB Atlas

## Architecture Explanation

The frontend sends requests to the Express backend through REST APIs. The backend authenticates the user, stores and reads data from MongoDB, captures live metric samples, and generates forecast summaries. The frontend then presents that data through dashboards, charts, filters, and service-management workflows.

## Features To Mention

- Secure login with JWT authentication
- CRUD operations for cloud services
- Search, filter, and sort for service records
- Server-side pagination for service records
- Live CPU, memory, and load monitoring
- CPU and memory forecasting using recent historical samples
- Recommendation generation based on forecast severity
- Responsive UI with loading, empty, error, and toast states
- Dark and light mode support
- OpenAPI documentation exposed from the backend
- Deployment-ready configuration for cloud hosting

## Advanced Logic

- Service search checks multiple fields such as name, type, environment, and region.
- Filters narrow the data by status and service type.
- Sorting supports both alphabetical and time-based ordering.
- Forecasting uses moving average and trend-based calculations from recent metric samples.
- Recommendation generation converts forecast values into helpful suggestions for scaling or optimization.

## Performance And Reliability Points

- Metrics and forecast polling pause when the browser tab is hidden.
- Shared loading and error-state components prevent blank screens.
- Metrics history limits are clamped on the backend to avoid oversized requests.
- Protected routes restore the user session before rendering secured pages.
- The backend includes global error handling for invalid routes and runtime failures.

## Challenges Faced And Solutions

### 1. UI inconsistency across pages

Challenge:
Different pages had separate inline styles and looked like separate mini-projects.

Solution:
Built a shared app shell, common layout system, and reusable UI states so the product feels consistent.

### 2. Metrics polling was wasteful

Challenge:
Polling every few seconds can create unnecessary requests when the page is not visible.

Solution:
Added a polling helper that pauses refreshes when the browser tab is hidden and resumes when it becomes active.

### 3. Forecast output needed to feel useful

Challenge:
Showing only raw numbers does not clearly communicate what the prediction means.

Solution:
Added confidence, risk-level summaries, and recommendation cards to explain the forecast in practical terms.

### 4. Demo failures from empty or broken API responses

Challenge:
A missing dataset or failed request can make the app look incomplete during evaluation.

Solution:
Added explicit loading, empty, retry, and recoverable-error states across the major pages.

## Likely Viva Questions

### Why did you use MongoDB?

MongoDB works well for this project because the service, metric, and forecast documents are flexible and map naturally to JSON responses used by the frontend.

### How does the forecast work?

The backend reads the latest metric samples, calculates a moving average and simple trend, clamps the prediction to a valid percentage range, and returns forecast values with confidence and recommendations.

### How is the application secured?

The backend returns a JWT after login, and the frontend sends that token with protected API requests. Protected routes block unauthenticated users from entering the dashboard screens.

### What makes this Phase 3 and not just CRUD?

CloudFore includes live monitoring, forecasting logic, recommendation generation, filters, sorting, polished UX states, theme support, automated tests, and deployment configuration.
