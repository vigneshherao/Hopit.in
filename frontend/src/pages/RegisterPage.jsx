import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button.jsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Label } from '@/components/ui/label.jsx';
import { userRoles } from '@/types/domain.js';

const registerSchema = z.object({
  name: z.string().min(2, 'Name is required.'),
  email: z.string().email('Enter a valid email address.'),
  role: z.enum(userRoles),
  password: z.string().min(8, 'Password must be at least 8 characters.'),
});

export function RegisterPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: 'farmer' },
  });

  const onSubmit = () => undefined;

  return (
    <section className="page-shell flex justify-center">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>Create account</CardTitle>
          <CardDescription>Set up the user role that best matches your work.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" {...register('name')} />
                {errors.name ? <p className="text-sm text-destructive">{errors.name.message}</p> : null}
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" {...register('email')} />
                {errors.email ? (
                  <p className="text-sm text-destructive">{errors.email.message}</p>
                ) : null}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <select
                id="role"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                {...register('role')}
              >
                <option value="land_owner">Land owner</option>
                <option value="farmer">Farmer</option>
                <option value="farm_worker">Farm worker</option>
              </select>
              {errors.role ? <p className="text-sm text-destructive">{errors.role.message}</p> : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" {...register('password')} />
              {errors.password ? (
                <p className="text-sm text-destructive">{errors.password.message}</p>
              ) : null}
            </div>
            <Button className="w-full" type="submit">
              Register
            </Button>
          </form>
        </CardContent>
      </Card>
    </section>
  );
}
