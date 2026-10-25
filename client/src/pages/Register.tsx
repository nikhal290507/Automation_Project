import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { AuthLayout } from "../layouts/AuthLayout";
import { Input } from "../components/ui/Input";
import { Label } from "../components/ui/Label";
import { Button } from "../components/ui/Button";
import { useAuth } from "../hooks/useAuth";
import { apiErrorMessage } from "../lib/api";
import { AlertCircle } from "lucide-react";

interface FormValues {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export default function Register() {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const {
    register,
    handleSubmit,
    getValues,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>();
  const password = watch("password", "");
  const confirmPassword = watch("confirmPassword", "");

  const onSubmit = async (values: FormValues) => {
    setError(null);
    try {
      await registerUser(values.name.trim(), values.email.trim().toLowerCase(), values.password);
      navigate("/onboarding");
    } catch (err) {
      setError(apiErrorMessage(err, "Couldn't create your account. Please try again."));
    }
  };

  return (
    <AuthLayout title="Create your account" subtitle="Start automating in under two minutes">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {error && (
          <div className="flex items-start gap-2 rounded-xl border border-state-danger/30 bg-state-danger/10 px-3.5 py-2.5 text-sm text-state-danger">
            <AlertCircle size={16} className="mt-0.5 shrink-0" /> {error}
          </div>
        )}
        <div>
          <Label htmlFor="name">Full name</Label>
          <Input id="name" autoComplete="name" placeholder="Alex Rivera" aria-invalid={!!errors.name} aria-describedby={errors.name ? "name-error" : undefined} {...register("name", {
            required: "Name is required",
            validate: (value) => value.trim().length >= 2 || "Enter at least 2 characters",
          })} />
          {errors.name && <p id="name-error" className="mt-1 text-xs text-state-danger" role="alert">{errors.name.message}</p>}
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" autoComplete="email" placeholder="you@example.com" aria-invalid={!!errors.email} aria-describedby={errors.email ? "email-error" : undefined} {...register("email", {
            required: "Email is required",
            pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Enter a valid email address" },
          })} />
          {errors.email && <p id="email-error" className="mt-1 text-xs text-state-danger" role="alert">{errors.email.message}</p>}
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="At least 8 characters"
              className="pr-11"
              aria-invalid={!!errors.password}
              aria-describedby={errors.password ? "password-error" : "password-hint"}
              {...register("password", {
                required: "Password is required",
                minLength: { value: 8, message: "Password must be at least 8 characters" },
                validate: (value) => /[A-Za-z]/.test(value) && /\d/.test(value) || "Use at least one letter and one number",
              })}
            />
            <button type="button" onClick={() => setShowPassword((visible) => !visible)} aria-label={showPassword ? "Hide password" : "Show password"} className="absolute inset-y-0 right-3 text-ink-faint hover:text-ink">
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errors.password ? <p id="password-error" className="mt-1 text-xs text-state-danger" role="alert">{errors.password.message}</p> : <p id="password-hint" className="mt-1 text-xs text-ink-faint">Use 8+ characters with at least one letter and one number.</p>}
        </div>
        <div>
          <Label htmlFor="confirmPassword">Confirm password</Label>
          <Input
            id="confirmPassword"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            placeholder="Re-enter your password"
            aria-invalid={!!errors.confirmPassword}
            aria-describedby={errors.confirmPassword ? "confirm-password-error" : undefined}
            {...register("confirmPassword", {
              required: "Please confirm your password",
              validate: (value) => value === getValues("password") || "Passwords do not match",
            })}
          />
          {errors.confirmPassword && <p id="confirm-password-error" className="mt-1 text-xs text-state-danger" role="alert">{errors.confirmPassword.message}</p>}
          {!errors.confirmPassword && confirmPassword.length > 0 && confirmPassword === password && <p className="mt-1 text-xs text-state-success">Passwords match</p>}
        </div>
        <Button type="submit" className="w-full" loading={isSubmitting}>Create account</Button>
      </form>
      <p className="mt-6 text-center text-sm text-ink-muted">
        Already have an account? <Link to="/login" className="text-accent-blue font-medium hover:underline">Log in</Link>
      </p>
    </AuthLayout>
  );
}
