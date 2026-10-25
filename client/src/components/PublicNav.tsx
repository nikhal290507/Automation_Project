import { Link } from "react-router-dom";
import { Logo } from "./Logo";
import { Button } from "./ui/Button";

export function PublicNav() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-canvas/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 lg:px-8">
        <Link to="/"><Logo /></Link>
        <nav className="hidden md:flex items-center gap-8 text-sm text-ink-muted">
          <a href="#product" className="hover:text-ink transition-colors">Product</a>
          <a href="#roles" className="hover:text-ink transition-colors">Who it's for</a>
          <a href="#pricing" className="hover:text-ink transition-colors">Pricing</a>
        </nav>
        <div className="flex items-center gap-2">
          <Link to="/login"><Button variant="ghost" size="sm">Log in</Button></Link>
          <Link to="/register"><Button size="sm">Get started free</Button></Link>
        </div>
      </div>
    </header>
  );
}
