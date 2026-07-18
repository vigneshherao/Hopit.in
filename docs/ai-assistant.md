# Hopt It AI Farm Assistant

The AI Farm Assistant is a lifecycle advisor for generated farm plans. It uses summarized farm context instead of raw MongoDB documents, then answers questions, generates smart insight cards, forecasts operational outcomes, and creates markdown-ready reports.

## Backend Routes

All routes require authentication and are mounted under `/api/v1/assistant`.

- `POST /chat` - AI chat using farm plan context.
- `POST /analyze` - Provider-backed farm analysis and insight generation.
- `GET /insights/:farmPlanId` - Smart insight cards grouped by priority.
- `GET /recommendations/:farmPlanId` - Decision support recommendations.
- `GET /forecast/:farmPlanId` - Forecast engine output.
- `POST /generate-report` - Weekly, monthly, financial, task, harvest, worker or complete farm report.
- `GET /conversations` - Recent assistant conversations.

## Context Builder

`ai-assistant.context-builder.ts` loads only safe summaries:

- land title, location, area, soil, water and road access
- crop, season, status, harvest date, progress and risk
- upcoming, completed and overdue tasks
- upcoming calendar events
- estimated investment, revenue, profit and ROI
- harvest readiness
- existing AI recommendation summary

Expense, income and harvest transaction records are marked unavailable when those modules are not present in the workspace. The assistant must not invent missing values.

## Prompt System

`ai-assistant.prompts.ts` builds strict JSON prompts for:

- farm chat
- smart farm analysis
- forecast explanation
- report generation

User text is sanitized before it enters prompts, and the system prompt instructs the provider to treat user text as data rather than instructions.

## Forecast Engine

The GET forecast endpoint uses deterministic farm-plan and task data so the dashboard remains useful even when an AI provider is unavailable. Forecasts cover:

- Harvest
- Profit
- ROI
- Risk
- Labour

Provider-backed reporting and chat still require `OPENAI_API_KEY`.

## Security

- Every route requires JWT authentication.
- Owners can only access their own farm plans.
- Admins can access all plans.
- API keys never leave the backend.
- Raw prompts are never returned to React.
- AI requests are rate limited using `AI_DAILY_REQUEST_LIMIT`.
- AI JSON responses are validated with Zod before being stored or returned.

## Frontend Routes

- `/farm-planner/:id/assistant`
- `/farm-planner/:id/insights`

The assistant page includes suggested questions, conversation history, copy response, markdown export, report generation, forecast confidence charts and smart insight cards.

## Environment Variables

Existing AI variables are reused:

```bash
OPENAI_API_KEY=
OPENAI_MODEL=gpt-4o-mini
AI_REQUEST_TIMEOUT_MS=30000
AI_DAILY_REQUEST_LIMIT=25
```

## Limitations

This milestone does not implement drone monitoring, satellite imaging, IoT sensors or computer vision. PDF and Excel exports are represented as structured report data for frontend export; full binary PDF/XLSX rendering can be added later.

