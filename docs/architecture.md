# Hopt It Architecture

Hopt It is structured as a modular monolith. The frontend owns user experience, route composition, form ergonomics, API access, and client state. The backend owns API boundaries, validation, persistence, security middleware, and operational lifecycle.

## Backend Module Flow

```text
route -> validator -> controller -> service -> model
```

Routes stay thin, controllers translate HTTP concerns, services contain application operations, and models contain persistence definitions.

## Frontend Module Flow

```text
page -> hook/context -> service -> api client
```

Pages compose UI and call hooks. Services isolate HTTP calls. Shared UI primitives live in `components/ui`.
