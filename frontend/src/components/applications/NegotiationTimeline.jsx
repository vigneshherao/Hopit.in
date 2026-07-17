import { useState } from 'react';
import { Button } from '@/components/ui/button.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Label } from '@/components/ui/label.jsx';

export function NegotiationTimeline({ negotiations = [], canAccept, onAccept, onCounter }) {
  const [message, setMessage] = useState('');
  const [monthlyRent, setMonthlyRent] = useState('');
  const [annualLeaseAmount, setAnnualLeaseAmount] = useState('');
  const [durationMonths, setDurationMonths] = useState('');

  function submitCounter() {
    onCounter({
      message,
      proposedTerms: {
        ...(durationMonths ? { durationMonths: Number(durationMonths) } : {}),
        ...(monthlyRent ? { monthlyRent: Number(monthlyRent) } : {}),
        ...(annualLeaseAmount ? { annualLeaseAmount: Number(annualLeaseAmount) } : {}),
      },
    });
    setMessage('');
    setMonthlyRent('');
    setAnnualLeaseAmount('');
    setDurationMonths('');
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Negotiation timeline</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          {negotiations.map((item) => (
            <div key={item._id ?? item.round} className="rounded-md border p-3">
              <div className="flex flex-wrap justify-between gap-2 text-sm">
                <span className="font-medium">Round {item.round} · {item.action}</span>
                <span className="text-muted-foreground">{item.createdByRole}</span>
              </div>
              {item.message ? <p className="mt-2 text-sm text-muted-foreground">{item.message}</p> : null}
              <p className="mt-2 text-sm">
                Duration: {item.proposedTerms?.durationMonths ?? '-'} months · Monthly: {money(item.proposedTerms?.monthlyRent)} · Annual: {money(item.proposedTerms?.annualLeaseAmount)}
              </p>
            </div>
          ))}
          {!negotiations.length ? <p className="text-sm text-muted-foreground">No negotiation entries yet.</p> : null}
        </div>

        <div className="grid gap-3 border-t pt-4 md:grid-cols-4">
          <div className="md:col-span-4">
            <Label>Message</Label>
            <Input value={message} onChange={(event) => setMessage(event.target.value)} />
          </div>
          <div>
            <Label>Duration</Label>
            <Input type="number" value={durationMonths} onChange={(event) => setDurationMonths(event.target.value)} />
          </div>
          <div>
            <Label>Monthly rent</Label>
            <Input type="number" value={monthlyRent} onChange={(event) => setMonthlyRent(event.target.value)} />
          </div>
          <div>
            <Label>Annual lease</Label>
            <Input type="number" value={annualLeaseAmount} onChange={(event) => setAnnualLeaseAmount(event.target.value)} />
          </div>
          <div className="flex items-end gap-2">
            <Button type="button" onClick={submitCounter}>Counter</Button>
            <Button type="button" variant="outline" disabled={!canAccept} onClick={onAccept}>Accept terms</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function money(value) {
  return value ? `₹${Number(value).toLocaleString('en-IN')}` : '-';
}
