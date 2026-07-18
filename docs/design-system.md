# Hopt It Design System

Hopt It uses a bright white product theme with fresh green as the primary action color, soft blue as the intelligence accent, and restrained purple for AI moments.

## Foundations

- Typography: heavy display headings, compact section labels, readable body copy.
- Spacing: page shells use responsive padding with mobile bottom-nav clearance.
- Radius: rounded app surfaces are standardized through shared UI components and `.glass-card`.
- Shadows: soft elevation for cards, stronger elevation for dialogs and floating navigation.
- Motion: short entrance, hover, loading, and shimmer animations with reduced-motion support.
- Accessibility: visible focus rings, semantic buttons, ARIA labels, keyboard command menu.

## Component Library

Reusable primitives live in `frontend/src/components/ui`.

- Core: `Button`, `Input`, `Textarea`, `Select`, `Checkbox`, `Radio`, `Switch`, `Slider`
- Navigation: `SearchBox`, `Tabs`, `Accordion`, `Pagination`
- Feedback: `Alert`, `Toast`, `EmptyState`, `LoadingSpinner`, `Skeleton`
- Data display: `Avatar`, `Chip`, `Tag`, `StatCard`, `MetricCard`, `Timeline`, `DataTable`
- Overlays: `Dialog`, `Drawer`, `Popover`, `Tooltip`, `Dropdown`

Shared shell components live in `frontend/src/components/shared/AppShellEnhancements.jsx`.

- Command palette
- Breadcrumbs
- Premium sidebar rail
- Floating quick actions
- Mobile bottom navigation
- Offline banner

## Usage

Prefer importing primitives directly:

```jsx
import { Button } from '@/components/ui/button.jsx';
import { EmptyState } from '@/components/ui/feedback.jsx';
```

Use `frontend/src/theme/designTokens.js` for product-level decisions and `frontend/src/utils/experienceData.js` for command/navigation data.

## Page Guidance

- Start screens with a clear page title and one primary action.
- Keep cards focused on repeated content, tools, dialogs, and metrics.
- Use `page-shell`, `glass-card`, `interactive-card`, `section-eyebrow`, and `gradient-headline` for consistent page structure.
- Keep feature constants in `utils` files instead of embedding large arrays in page components.
