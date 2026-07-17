import { Bot, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button.jsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx';

export function AiPage() {
  return (
    <section className="page-shell">
      <Card>
        <CardHeader>
          <div className="flex h-12 w-12 items-center justify-center rounded-md bg-secondary">
            <Bot className="h-6 w-6" />
          </div>
          <CardTitle>AI farming recommendations</CardTitle>
          <CardDescription>
            Prepared for crop recommendations, soil insights, weather risk, and farming advisory workflows.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button>
            <Sparkles className="h-4 w-4" />
            Recommendation module ready
          </Button>
        </CardContent>
      </Card>
    </section>
  );
}
