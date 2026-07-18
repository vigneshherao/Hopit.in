# AI Land Analyzer

Hopt It runs AI land analysis through backend-only provider integrations. React never receives provider API keys and never calls AI services directly.

## Environment Variables

```env
OPENAI_API_KEY=
OPENAI_MODEL=gpt-4o-mini
AI_REQUEST_TIMEOUT_MS=30000
AI_DAILY_REQUEST_LIMIT=25
```

When `OPENAI_API_KEY` is missing, AI endpoints return a clear `503` error. The backend does not generate fake recommendations.

## Request Flow

```text
React form -> TanStack mutation -> /api/v1/ai route -> auth -> validation -> ownership check -> prompt builder -> AI provider -> JSON parse -> Zod validation -> AIHistory -> response
```

## API Routes

- `POST /api/v1/ai/land-analysis`
- `POST /api/v1/ai/crop-recommendation`
- `POST /api/v1/ai/business-recommendation`
- `POST /api/v1/ai/chat`
- `GET /api/v1/ai/history`
- `GET /api/v1/ai/history/:id`
- `DELETE /api/v1/ai/history/:id`

All routes require authentication.

## Inputs

Users can select one of their lands or manually enter soil type, land area, area unit, state, district, season, temperature, rainfall, water availability, irrigation, budget, experience, farming type, preferred crops, market distance, road access, and owner participation.

If a land is selected, the backend verifies ownership before using land data.

## Response Schemas

Land analysis includes soil suitability, water assessment, climate suitability, strengths, limitations, risk score, risk level, preparation steps, suitable categories, and explanation.

Crop recommendations include at least five ranked crops with suitability score, duration, water, investment, yield, revenue, profit, ROI, market demand, risks, soil preparation, seed, irrigation, fertilizer, labour, and confidence.

Business recommendations include suitable agri-business options, costs, returns, infrastructure, workers, permissions, risks, and suitability.

Chat responses include answer, suggested questions, and confidence score.

## Security

- Provider secrets stay server-side.
- Requests require JWT authentication.
- Land ownership is enforced.
- Prompt injection text is sanitized and treated as data.
- Provider output must be strict JSON and pass Zod validation.
- Daily request limits and route rate limits are applied.
- Request timeouts and response-size limits are enforced.
- AI history stores normalized inputs and structured output, not secrets.

## Cost Controls

Use `AI_DAILY_REQUEST_LIMIT` to cap daily requests per user and per route limiter. Use `AI_REQUEST_TIMEOUT_MS` to avoid long provider calls. Use a low-cost model through `OPENAI_MODEL` for development and hackathon demos.

## Seed Data

The seed script creates demo AI history records for seeded lands with `metadata.seededDemo = true`. These records are clearly demo data and do not call an AI provider.

## Testing

Backend tests should mock provider responses for success, malformed JSON, provider failure, auth, ownership, validation, rate limits, and history access. Frontend tests should cover protected routes, form validation, loading state, result rendering, history rendering, and error messages.
