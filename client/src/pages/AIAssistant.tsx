import { useState } from "react";
import { Link } from "react-router-dom";
import { Sparkles, Wand2, MessageSquareText, Workflow, ArrowRight, Lock } from "lucide-react";
import { AppLayout } from "../layouts/AppLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Label } from "../components/ui/Label";
import { Textarea } from "../components/ui/Textarea";
import { Badge } from "../components/ui/Badge";
import { aiApi } from "../services/ai";
import { apiErrorMessage } from "../lib/api";

export default function AIAssistant() {
  return (
    <AppLayout title="AI Assistant">
      <div className="mb-6 flex items-center gap-2">
        <Badge tone="accent"><Sparkles size={11} /> Premium features</Badge>
        <p className="text-sm text-ink-muted">These tools use your Anthropic API key if configured, otherwise a deterministic local mock.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <ClassifierCard />
        <ReplyCard />
      </div>

      <Card className="mt-6 p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-gradient-soft shrink-0">
            <Workflow size={18} className="text-accent-blue" />
          </div>
          <div>
            <p className="font-display text-sm font-semibold text-ink">Describe an automation in plain English</p>
            <p className="text-sm text-ink-muted mt-0.5">Let AI turn a sentence into a full trigger → condition → action workflow.</p>
          </div>
        </div>
        <Link to="/automations/new"><Button>Open automation builder <ArrowRight size={15} /></Button></Link>
      </Card>
    </AppLayout>
  );
}

function ClassifierCard() {
  const [sender, setSender] = useState("");
  const [subject, setSubject] = useState("");
  const [snippet, setSnippet] = useState("");
  const [result, setResult] = useState<{ category: string; importance: string; reasoning: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = async () => {
    setLoading(true);
    setError(null);
    try {
      const { classification } = await aiApi.classifyEmail({ sender, subject, snippet });
      setResult(classification);
    } catch (err) {
      setError(apiErrorMessage(err, "Email classification requires AutoFlow Premium."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader className="flex-row items-center gap-2">
        <Wand2 size={16} className="text-accent-blue" />
        <div><CardTitle>Email classifier</CardTitle><CardDescription>Preview how AutoFlow would categorize an email</CardDescription></div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div><Label>Sender</Label><Input value={sender} onChange={(e) => setSender(e.target.value)} placeholder="professor.smith@university.edu" /></div>
        <div><Label>Subject</Label><Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Reminder: assignment due" /></div>
        <div><Label>Snippet (optional)</Label><Textarea rows={2} value={snippet} onChange={(e) => setSnippet(e.target.value)} placeholder="Message preview..." /></div>
        {error && <p className="flex items-center gap-1.5 text-sm text-state-danger"><Lock size={13} /> {error}</p>}
        <Button size="sm" onClick={run} loading={loading} disabled={!sender || !subject}>Classify</Button>
        {result && (
          <div className="rounded-xl border border-border bg-surface-raised p-3.5 space-y-1.5">
            <div className="flex items-center gap-2">
              <Badge tone="accent">{result.category}</Badge>
              <Badge tone={result.importance === "high" ? "danger" : result.importance === "normal" ? "warning" : "neutral"}>{result.importance}</Badge>
            </div>
            <p className="text-xs text-ink-muted">{result.reasoning}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ReplyCard() {
  const [subject, setSubject] = useState("");
  const [snippet, setSnippet] = useState("");
  const [tone, setTone] = useState("friendly and professional");
  const [reply, setReply] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = async () => {
    setLoading(true);
    setError(null);
    try {
      const { reply: generated } = await aiApi.generateReply({ subject, snippet, tone });
      setReply(generated);
    } catch (err) {
      setError(apiErrorMessage(err, "Auto-reply generation requires AutoFlow Premium."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader className="flex-row items-center gap-2">
        <MessageSquareText size={16} className="text-accent-violet" />
        <div><CardTitle>Auto-reply generator</CardTitle><CardDescription>Draft a reply you can use in the Auto Reply action</CardDescription></div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div><Label>Original subject</Label><Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Can we schedule a call?" /></div>
        <div><Label>Original message</Label><Textarea rows={2} value={snippet} onChange={(e) => setSnippet(e.target.value)} placeholder="Message preview..." /></div>
        <div><Label>Tone</Label><Input value={tone} onChange={(e) => setTone(e.target.value)} /></div>
        {error && <p className="flex items-center gap-1.5 text-sm text-state-danger"><Lock size={13} /> {error}</p>}
        <Button size="sm" onClick={run} loading={loading} disabled={!subject || !snippet}>Generate reply</Button>
        {reply && <div className="rounded-xl border border-border bg-surface-raised p-3.5 text-sm text-ink-muted">{reply}</div>}
      </CardContent>
    </Card>
  );
}
