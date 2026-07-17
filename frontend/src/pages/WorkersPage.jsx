import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx';

export function WorkersPage() {
  return (
    <section className="page-shell">
      <Card className="mx-auto max-w-5xl">
        <CardHeader>
          <CardTitle className="text-3xl">Workers</CardTitle>
          <CardDescription>
            Foundation for agricultural job discovery, worker profiles, skills, and availability.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {['Profiles', 'Jobs', 'Availability'].map((item) => (
              <div key={item} className="rounded-3xl border border-emerald-100 bg-emerald-50/60 p-5 font-medium text-slate-800">
                {item}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
