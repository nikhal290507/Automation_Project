import { Link } from "react-router-dom";
import { ArrowRight, Mail, CalendarClock, Sparkles, Focus, BarChart3, Plug, GraduationCap, Briefcase, Laptop, Presentation, Code2 } from "lucide-react";
import { PublicNav } from "../components/PublicNav";
import { HeroFlowVisual } from "../components/HeroFlowVisual";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { FlowChip, FlowArrow } from "../components/FlowChip";
import { Logo } from "../components/Logo";

const features = [
  {
    icon: Mail,
    title: "Inbox that triages itself",
    description: "Detect important senders, keywords, or categories the moment an email lands, no manual filters to maintain.",
  },
  {
    icon: CalendarClock,
    title: "Calendar-aware automations",
    description: "Trigger Focus Mode, notifications, or follow-ups the instant a meeting starts, ends, or gets scheduled.",
  },
  {
    icon: Sparkles,
    title: "Describe it, don't build it",
    description: 'Type "notify me on Telegram when my professor emails" and AutoFlow writes the workflow for you.',
  },
  {
    icon: Focus,
    title: "Focus Mode on autopilot",
    description: "Automatically silence notifications during meetings, deep work blocks, or class hours.",
  },
  {
    icon: Plug,
    title: "One workflow, every app",
    description: "Gmail, Calendar, Telegram, Outlook, and WhatsApp all speak the same automation language.",
  },
  {
    icon: BarChart3,
    title: "See what's actually running",
    description: "Every trigger, condition, and action is logged, so you can trust automations you didn't have to watch.",
  },
];

const roles = [
  { icon: GraduationCap, title: "Students", blurb: "Never miss a professor's email or an assignment deadline again." },
  { icon: Briefcase, title: "Corporate Employees", blurb: "Let meetings trigger Focus Mode and route important threads automatically." },
  { icon: Laptop, title: "Freelancers", blurb: "Triage client emails and log new inquiries without lifting a finger." },
  { icon: Presentation, title: "Teachers", blurb: "Route student questions and schedule follow-ups from your inbox." },
  { icon: Code2, title: "Developers", blurb: "Chain alerts, calendar events, and notifications with a few clicks." },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-canvas">
      <PublicNav />

      {/* Hero */}
      <section className="mx-auto max-w-7xl px-4 pt-16 pb-20 lg:px-8 lg:pt-24 lg:pb-28">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div className="animate-fade-up">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium text-ink-muted">
              <Sparkles size={12} className="text-accent-blue" /> AI-assisted automation builder
            </span>
            <h1 className="mt-5 font-display text-4xl font-semibold leading-[1.1] text-ink sm:text-5xl lg:text-[3.25rem]">
              Automate your <span className="text-gradient">digital life.</span>
            </h1>
            <p className="mt-5 max-w-lg text-base text-ink-muted lg:text-lg">
              Connect Gmail, Calendar, and Telegram, then let AutoFlow watch for what matters and act on it, so you don't have to.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link to="/register">
                <Button size="lg">Get started free <ArrowRight size={16} /></Button>
              </Link>
              <a href="#product">
                <Button size="lg" variant="outline">See how it works</Button>
              </a>
            </div>
            <p className="mt-4 text-xs text-ink-faint">No credit card required &middot; Free plan includes 5 automations</p>
          </div>
          <div className="animate-fade-up" style={{ animationDelay: "0.15s" }}>
            <HeroFlowVisual />
          </div>
        </div>
      </section>

      {/* Product / features */}
      <section id="product" className="border-t border-border bg-surface/30 py-20">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="max-w-xl">
            <h2 className="font-display text-3xl font-semibold text-ink">Built for how automation actually works</h2>
            <p className="mt-3 text-ink-muted">Every automation is a simple chain: something happens, conditions get checked, actions run. AutoFlow makes each link visible.</p>
          </div>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <Card key={f.title} className="p-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-gradient-soft">
                  <f.icon size={18} className="text-accent-blue" />
                </div>
                <h3 className="mt-4 font-display text-base font-semibold text-ink">{f.title}</h3>
                <p className="mt-1.5 text-sm text-ink-muted">{f.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Example flows */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <h2 className="font-display text-3xl font-semibold text-ink text-center">Automations people actually build</h2>
          <div className="mt-10 space-y-3 max-w-3xl mx-auto">
            {[
              { t: "Gmail: sender is Professor", c: "Importance: high", a: "Telegram notification" },
              { t: "New calendar event", a: "Enable Focus Mode" },
              { t: "Keyword: schedule a call", a: "Create calendar event" },
              { t: "New email", a: "Auto reply" },
            ].map((row, i) => (
              <Card key={i} className="flex flex-wrap items-center gap-2 p-4">
                <FlowChip icon={Mail} label={row.t} tone="trigger" />
                {row.c && (
                  <>
                    <FlowArrow />
                    <FlowChip icon={Sparkles} label={row.c} tone="condition" />
                  </>
                )}
                <FlowArrow />
                <FlowChip icon={Focus} label={row.a} tone="action" />
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Roles */}
      <section id="roles" className="border-t border-border bg-surface/30 py-20">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <h2 className="font-display text-3xl font-semibold text-ink text-center">Recommended automations for how you work</h2>
          <p className="mt-3 text-center text-ink-muted">Pick a role during onboarding and AutoFlow pre-loads templates that fit.</p>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
            {roles.map((r) => (
              <Card key={r.title} className="p-5 text-center">
                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-accent-gradient-soft">
                  <r.icon size={18} className="text-accent-violet" />
                </div>
                <h3 className="mt-3 font-display text-sm font-semibold text-ink">{r.title}</h3>
                <p className="mt-1.5 text-xs text-ink-muted">{r.blurb}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing teaser */}
      <section id="pricing" className="py-20">
        <div className="mx-auto max-w-5xl px-4 lg:px-8">
          <h2 className="font-display text-3xl font-semibold text-ink text-center">Start free, upgrade when you outgrow it</h2>
          <div className="mt-10 grid gap-5 sm:grid-cols-2">
            <Card className="p-7">
              <p className="text-sm font-medium text-ink-muted">Free</p>
              <p className="mt-1 font-display text-3xl font-semibold text-ink">$0</p>
              <ul className="mt-5 space-y-2.5 text-sm text-ink-muted">
                <li>5 automations</li>
                <li>Basic templates</li>
                <li>Basic email rules</li>
                <li>Standard dashboard</li>
              </ul>
              <Link to="/register" className="block mt-6"><Button variant="outline" className="w-full">Get started</Button></Link>
            </Card>
            <Card className="p-7 border-accent-blue/40 shadow-glow relative overflow-hidden">
              <span className="absolute right-5 top-5 rounded-full bg-accent-gradient px-2.5 py-1 text-xs font-medium text-white">Most popular</span>
              <p className="text-sm font-medium text-accent-blue">Premium</p>
              <p className="mt-1 font-display text-3xl font-semibold text-ink">$12<span className="text-base text-ink-muted font-body">/mo</span></p>
              <ul className="mt-5 space-y-2.5 text-sm text-ink-muted">
                <li>Unlimited automations</li>
                <li>AI automation builder</li>
                <li>AI email classification &amp; auto-reply</li>
                <li>Advanced templates &amp; analytics</li>
              </ul>
              <Link to="/register" className="block mt-6"><Button className="w-full">Start free trial</Button></Link>
            </Card>
          </div>
        </div>
      </section>

      <footer className="border-t border-border py-10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 sm:flex-row lg:px-8">
          <Logo />
          <p className="text-xs text-ink-faint">© {new Date().getFullYear()} AutoFlow. Automate your digital life.</p>
        </div>
      </footer>
    </div>
  );
}
