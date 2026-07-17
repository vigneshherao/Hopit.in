import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx';

export function WorkersPage() {
  return (
    <section className="page-shell">
      <Card>
        <CardHeader>
          <CardTitle>Workers</CardTitle>
          <CardDescription>
            Foundation for agricultural job discovery, worker profiles, skills, and availability.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {['Profiles', 'Jobs', 'Availability'].map((item) => (
              <div key={item} className="rounded-md border p-4 font-medium">
                {item}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
