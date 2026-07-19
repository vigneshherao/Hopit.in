# Frontend

The React/Vite SPA is organized into pages, layouts, shared components, feature hooks, services, and domain utilities. Axios is centralized in `services/apiClient.js`; TanStack Query configuration is centralized in `services/queryClient.js`; authentication and sockets are provided through application contexts/hooks.

Production builds split framework, query, maps, charts, and animation dependencies. The PWA manifest and service worker cache only same-origin static GET resources; API responses and authenticated data are never cached by the service worker. Protected and role routes improve navigation UX, while the backend remains authoritative for permissions.

Accessibility conventions include semantic controls, accessible form labels, focus styles, reduced-motion-aware styling, and responsive layouts. Automated Lighthouse results are not committed because they depend on the deployed environment.
