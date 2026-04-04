import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, Search, AlertTriangle, BookOpen } from "lucide-react";

interface Props {
  loading: boolean;
  onReindex: () => Promise<void>;
  onLint: () => Promise<string[] | null>;
  onCompileTopic: (topic: string) => Promise<void>;
  onAnswer: (question: string, save: boolean) => Promise<any>;
}

export default function WikiActions({ loading, onReindex, onLint, onCompileTopic, onAnswer }: Props) {
  const [topic, setTopic] = useState("");
  const [question, setQuestion] = useState("");
  const [lintFindings, setLintFindings] = useState<string[] | null>(null);
  const [answerResult, setAnswerResult] = useState<string | null>(null);

  const handleLint = async () => {
    const findings = await onLint();
    setLintFindings(findings);
  };

  const handleAnswer = async () => {
    if (!question.trim()) return;
    const result = await onAnswer(question, true);
    if (result?.answer) setAnswerResult(result.answer);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="py-3"><CardTitle className="text-sm flex items-center gap-2"><RefreshCw className="h-4 w-4" /> Reindex</CardTitle></CardHeader>
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground mb-2">Rebuild index, log, and overview pages</p>
            <Button size="sm" onClick={onReindex} disabled={loading}>Reindex Now</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="py-3"><CardTitle className="text-sm flex items-center gap-2"><AlertTriangle className="h-4 w-4" /> Lint</CardTitle></CardHeader>
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground mb-2">Check for orphan pages, missing sources, stale content</p>
            <Button size="sm" variant="outline" onClick={handleLint} disabled={loading}>Run Lint</Button>
            {lintFindings && (
              <div className="mt-2 space-y-1">
                {lintFindings.length === 0 ? (
                  <Badge variant="default">All clear ✓</Badge>
                ) : (
                  lintFindings.map((f, i) => <p key={i} className="text-xs text-destructive">• {f}</p>)
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="py-3"><CardTitle className="text-sm flex items-center gap-2"><BookOpen className="h-4 w-4" /> Compile Topic</CardTitle></CardHeader>
          <CardContent className="pt-0">
            <div className="flex gap-2">
              <Input placeholder="Topic name..." value={topic} onChange={e => setTopic(e.target.value)} className="text-sm" />
              <Button size="sm" onClick={() => { if (topic.trim()) onCompileTopic(topic); }} disabled={loading || !topic.trim()}>Compile</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="py-3"><CardTitle className="text-sm flex items-center gap-2"><Search className="h-4 w-4" /> Ask Wiki</CardTitle></CardHeader>
          <CardContent className="pt-0">
            <div className="flex gap-2">
              <Input placeholder="Ask a question..." value={question} onChange={e => setQuestion(e.target.value)} className="text-sm" onKeyDown={e => e.key === "Enter" && handleAnswer()} />
              <Button size="sm" onClick={handleAnswer} disabled={loading || !question.trim()}>Ask</Button>
            </div>
            {answerResult && (
              <div className="mt-2 text-xs text-muted-foreground border rounded p-2 max-h-40 overflow-y-auto whitespace-pre-wrap">
                {answerResult}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
