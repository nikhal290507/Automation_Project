import { Link } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { Logo } from "../components/Logo";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-canvas flex flex-col items-center justify-center px-4 text-center">
      <Logo className="mb-8" />
      <p className="font-display text-5xl font-semibold text-ink">404</p>
      <p className="mt-2 text-sm text-ink-muted">This page doesn't exist, or the flow led nowhere.</p>
      <Link to="/" className="mt-6"><Button>Back home</Button></Link>
    </div>
  );
}
