import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button.jsx';

export function NotFoundPage() {
  return (
    <section className="page-shell flex min-h-[60vh] flex-col items-center justify-center text-center">
      <p className="text-sm font-medium text-muted-foreground">404</p>
      <h1 className="mt-3 text-3xl font-bold">Page not found</h1>
      <p className="mt-3 max-w-md text-muted-foreground">
        The page you are looking for does not exist in the Hopit foundation.
      </p>
      <Button asChild className="mt-6">
        <Link to="/">Go home</Link>
      </Button>
    </section>
  );
}
