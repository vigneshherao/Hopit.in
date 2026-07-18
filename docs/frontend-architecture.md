# Frontend Architecture

The Hopt It frontend is a Vite React application written in JavaScript and JSX.

## Structure

- `src/pages`: route-level screens
- `src/layouts`: app and admin shells
- `src/components/ui`: reusable design-system primitives
- `src/components/shared`: cross-feature product shell components
- `src/components/<feature>`: feature-specific components
- `src/hooks`: TanStack Query hooks and frontend state hooks
- `src/services`: Axios API clients
- `src/utils`: constants, labels, formatting, feature data
- `src/theme`: design tokens
- `src/assets`: global styles and static imported assets

## Routing

`src/routes/router.jsx` owns all route definitions. Protected routes remain centralized through `ProtectedRoute` and `RoleRoute`.

## Data Fetching

Feature pages should call TanStack Query hooks from `src/hooks`. API calls belong in `src/services`; route components should not call Axios directly.

## UI Composition

Use the shared app shell for global navigation, search, breadcrumbs, and mobile navigation. New pages should reuse UI primitives from `components/ui` and feature constants from `utils`.

## Performance

- Keep maps and charts lazy where practical.
- Use query keys per feature and invalidate after mutations.
- Prefer lazy-loaded images with stable aspect ratios.
- Keep large feature arrays outside render functions.

## Accessibility

Use real buttons and links, visible labels, focus states, and semantic regions. The command palette supports keyboard access with `Ctrl+K` or `Cmd+K`.
