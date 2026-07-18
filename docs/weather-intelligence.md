# Hopt It Weather Intelligence

Weather Intelligence predicts weather-driven crop stress, pest pressure, disease risk, irrigation changes and preventive actions for a farm plan.

## Architecture

Backend base route:

```text
/api/v1/weather
```

Core modules:

- `weather.provider.ts` abstracts forecast providers.
- `weather.cache.ts` reuses valid forecasts before calling providers again.
- `weather.service.ts` turns forecasts into alerts, insights and predictions.
- `weather.scheduler.ts` exposes scheduled refresh hooks for six-hour, twelve-hour and daily jobs.

The default provider is `local`, which produces deterministic development forecasts. Set `WEATHER_PROVIDER=openweathermap` and `OPENWEATHER_API_KEY` to use OpenWeather.

## Data Models

- `WeatherForecast`
- `WeatherInsight`
- `WeatherAlert`
- `PestPrediction`
- `DiseasePrediction`

Forecasts store temperature, humidity, pressure, wind, visibility, cloud coverage, UV, rain probability, rainfall, sunrise, sunset, condition, provider and forecast date.

## API Routes

- `GET /current?farmPlanId=...`
- `GET /forecast?farmPlanId=...`
- `GET /history?farmPlanId=...`
- `GET /insights?farmPlanId=...`
- `GET /alerts?farmPlanId=...`
- `POST /refresh`
- `GET /predictions/pests?farmPlanId=...`
- `GET /predictions/diseases?farmPlanId=...`
- `GET /predictions/stress?farmPlanId=...`
- `GET /predictions/water?farmPlanId=...`
- `GET /predictions/farm-health?farmPlanId=...`

All routes require authentication. Owners can only access their own farm plans; admins can access all.

## Prediction Flow

1. Resolve farm plan and land.
2. Use land coordinates when present, otherwise use a state-level fallback.
3. Fetch or reuse cached forecasts.
4. Calculate weather risk from rainfall, heat, humidity and wind.
5. Generate insights, alerts, pest predictions, disease predictions, stress scores and water recommendations.
6. Create notifications for high or critical alerts.

## Risk Engine

The first version uses deterministic agronomy rules:

- heavy rain increases flood, fungal disease and irrigation-delay risk
- high heat increases crop stress and water demand
- high humidity increases disease and pest scouting priority
- strong wind increases spraying and plant-support risks

This can be replaced later with provider-backed AI predictions without changing frontend routes.

## Frontend Routes

- `/farm-planner/:id/weather`
- `/farm-planner/:id/weather/forecast`
- `/farm-planner/:id/weather/alerts`
- `/farm-planner/:id/weather/insights`

The page includes forecast cards, rainfall/temperature/humidity/risk charts, weather alerts, pest predictions, disease predictions, crop stress meter and water requirement widget.

## Environment

```bash
WEATHER_PROVIDER=local
OPENWEATHER_API_KEY=
WEATHER_CACHE_TTL_MINUTES=60
```

Provider API keys are backend-only and never exposed to React.

## Limitations

This module does not implement drone image analysis, satellite imagery, live IoT sensors or NDVI processing.

