# Database Schema

## Collections

### `users`

- `name`
- `email` (unique)
- `password` (hashed)
- `role`
- `projectName`
- `avatarUrl`
- `settings.emailNotifications`
- `settings.darkMode`
- `settings.autoForecast`
- `lastLoginAt`
- `createdAt`
- `updatedAt`

### `projects`

- `name`
- `description`
- `status`
- `type`
- `environment`
- `region`
- `autoStart`
- `owner` -> `users._id`
- `currentUsage.cpuUsage`
- `currentUsage.memoryUsage`
- `currentUsage.storageUsage`
- `forecastSummary.cpuForecast`
- `forecastSummary.memoryForecast`
- `forecastSummary.confidence`
- `forecastSummary.riskLevel`
- `createdAt`
- `updatedAt`

### `metrics`

- `project` -> `projects._id` or `null`
- `cpuUsage`
- `memoryUsage`
- `loadAverage.load1`
- `loadAverage.load5`
- `loadAverage.load15`
- `source`
- `createdAt`
- `updatedAt`

### `forecasts`

- `project` -> `projects._id` or `null`
- `cpuForecast`
- `memoryForecast`
- `confidence`
- `method`
- `createdAt`
- `updatedAt`

### `recommendations`

- `project` -> `projects._id` or `null`
- `title`
- `message`
- `severity`
- `createdAt`
- `updatedAt`
