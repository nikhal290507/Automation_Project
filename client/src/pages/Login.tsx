import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { AuthLayout } from "../layouts/AuthLayout";
import { Input } from "../components/ui/Input";
import { Label } from "../components/ui/Label";
import { Button } from "../components/ui/Button";
import { useAuth } from "../hooks/useAuth";
import { apiErrorMessage } from "../lib/api";
import { AlertCircle } from "lucide-react";

interface FormValues {
  email: string;
  password: string;
}

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>();

  const onSubmit = async (values: FormValues) => {
    setError(null);
    try {
      const user = await login(values.email, values.password);
      navigate(user.onboarded ? "/dashboard" : "/onboarding");
    } catch (err) {
      setError(apiErrorMessage(err, "Couldn't log you in. Check your details and try again."));
    }
  };

  return (
    <AuthLayout title="Welcome back" subtitle="Log in to keep your automations running">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {error && (
          <div className="flex items-start gap-2 rounded-xl border border-state-danger/30 bg-state-danger/10 px-3.5 py-2.5 text-sm text-state-danger">
            <AlertCircle size={16} className="mt-0.5 shrink-0" /> {error}
          </div>
        )}
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" placeholder="you@example.com" {...register("email", { required: "Email is required" })} />
          {errors.email && <p className="mt-1 text-xs text-state-danger">{errors.email.message}</p>}
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" placeholder="••••••••" {...register("password", { required: "Password is required" })} />
          {errors.password && <p className="mt-1 text-xs text-state-danger">{errors.password.message}</p>}
        </div>
        <Button type="submit" className="w-full" loading={isSubmitting}>Log in</Button>
      </form>
      <p className="mt-6 text-center text-sm text-ink-muted">
        Don't have an account? <Link to="/register" className="text-accent-blue font-medium hover:underline">Sign up free</Link>
      </p>
      <p className="mt-3 text-center text-xs text-ink-faint">Demo login: demo@autoflow.app / password123</p>
    </AuthLayout>
  );
}
