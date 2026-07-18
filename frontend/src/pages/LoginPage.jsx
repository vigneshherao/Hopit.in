import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowRight, Eye, EyeOff, LockKeyhole, Mail, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { Button } from '@/components/ui/button.jsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Label } from '@/components/ui/label.jsx';
import { useAuth } from '@/context/AuthContext.jsx';
import { getApiErrorMessage } from '@/utils/authErrors.js';
import { roleDashboards } from '@/types/domain.js';
import webLogo from '@/assets/weblogo.png';

const demoAccounts = [
  ['Owner', 'owner@hoptit.demo'],
  ['Land Seeker', 'farmer@hoptit.demo'],
  ['Worker', 'worker@hoptit.demo'],
  ['Admin', 'admin@hoptit.demo'],
];

const loginSchema = z.object({
  email: z.string().email('Enter a valid email address.'),
  password: z.string().min(8, 'Password must be at least 8 characters.'),
});

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, user } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState('');
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(loginSchema) });

  if (isAuthenticated && user?.role) {
    return <Navigate to={roleDashboards[user.role]} replace />;
  }

  const onSubmit = async (values) => {
    setFormError('');
    try {
      const session = await login(values);
      const redirectTo = location.state?.from?.pathname ?? roleDashboards[session.user.role] ?? '/dashboard';
      navigate(redirectTo, { replace: true });
    } catch (error) {
      setFormError(getApiErrorMessage(error, 'Invalid email or password.'));
    }
  };

  return (
    <section className="relative min-h-[calc(100vh-96px)] overflow-hidden px-4 py-10 sm:px-6 lg:px-8">
      <div className="absolute inset-0 bg-[linear-gradient(180deg,#ffffff_0%,#f7fbf8_48%,#ffffff_100%)]" />

      <div className="relative mx-auto flex min-h-[calc(100vh-150px)] max-w-md flex-col justify-center">
        <div className="mb-6 text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center overflow-hidden">
            <img src={webLogo} alt="Hopt It" className="h-20 w-20 scale-125 object-cover" />
          </div>
          <div className="mt-4 inline-flex max-w-full items-center gap-2 rounded-full border border-emerald-100 bg-white px-4 py-2 text-[11px] font-bold uppercase tracking-[0.14em] text-emerald-700 shadow-sm sm:text-xs sm:tracking-[0.18em]">
            <ShieldCheck className="h-3.5 w-3.5" />
            Secure workspace
          </div>
          <h1 className="mt-5 text-3xl font-semibold leading-tight tracking-tight text-slate-950 sm:text-4xl">Sign in to Hopt It</h1>
          <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-slate-500 sm:text-base sm:leading-7">
            Manage land, proposals, workers, AI plans, and agreements from one agriculture workspace.
          </p>
        </div>

        <Card className="rounded-[34px] border-emerald-100 bg-white shadow-[0_28px_90px_rgba(15,23,42,0.10)]">
          <CardHeader className="sr-only">
            <CardTitle>Login</CardTitle>
            <CardDescription>Access your Hopt It workspace.</CardDescription>
          </CardHeader>
          <CardContent className="p-5 sm:p-6">
          <form className="space-y-4" noValidate onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input id="email" className="h-12 rounded-2xl border-slate-200 bg-slate-50/80 pl-10" type="email" {...register('email')} />
              </div>
              {errors.email ? <p className="text-sm text-destructive">{errors.email.message}</p> : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input id="password" className="h-12 rounded-2xl border-slate-200 bg-slate-50/80 pl-10 pr-11" type={showPassword ? 'text' : 'password'} {...register('password')} />
                <button
                  type="button"
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground"
                  onClick={() => setShowPassword((value) => !value)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password ? (
                <p className="text-sm text-destructive">{errors.password.message}</p>
              ) : null}
            </div>
            {formError ? <p className="rounded-2xl border border-rose-100 bg-rose-50 p-3 text-sm font-medium text-rose-700">{formError}</p> : null}
            <Button className="h-12 w-full rounded-2xl text-base" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Logging in...' : 'Login'}
              <ArrowRight className="h-4 w-4" />
            </Button>
            <div className="rounded-[26px] border border-slate-100 bg-slate-50/80 p-3">
              <div className="flex items-center justify-between gap-3 px-1">
                <p className="text-sm font-semibold text-slate-950">Demo accounts</p>
                <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-500">Password: HoptIt@123</span>
              </div>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {demoAccounts.map(([role, email]) => (
                  <div key={email} className="rounded-2xl border border-white bg-white px-3 py-2 text-sm shadow-sm">
                    <p className="font-semibold text-slate-800">{role}</p>
                    <p className="truncate text-slate-500">{email}</p>
                  </div>
                ))}
              </div>
            </div>
            <button className="w-full text-sm text-muted-foreground" type="button" disabled>
              Forgot password flow is not enabled yet.
            </button>
            <p className="text-center text-sm text-muted-foreground">
              New to Hopt It?{' '}
              <Link className="font-medium text-primary" to="/register">
                Create account
              </Link>
            </p>
          </form>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
