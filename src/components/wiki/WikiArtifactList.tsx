import { useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ReactMarkdown from "react-markdown";
import { WikiArtifact } from "@/hooks/useWiki";

interface Props {
  artifacts: WikiArtifact[];
  loading: boolean;
  onFetch: () => void;
}

export default function WikiArtifactList({ artifacts, loading, onFetch }: Props) {
  useEffect(() => { onFetch(); }, []);

  if (loading) return <p className="text-sm text-muted-foreground">Loading...</p>;

  if (artifacts.length === 0) return <p className="text-sm text-muted-foreground text-center py-8">No artifacts yet</p>;

  return (
    <div className="space-y-3">
      {artifacts.map(a => (
        <Card key={a.id}>
          <CardHeader className="py-3">
            <div className="flex items-center gap-2">
              <CardTitle className="text-sm">{a.title}</CardTitle>
              <Badge variant="secondary" className="text-xs">{a.artifact_type}</Badge>
            </div>
            <p className="text-xs text-muted-foreground">{new Date(a.created_at).toLocaleString()}</p>
          </CardHeader>
          {a.body_markdown && (
            <CardContent className="pt-0">
              <div className="prose prose-sm dark:prose-invert max-w-none max-h-40 overflow-y-auto">
                <ReactMarkdown>{a.body_markdown}</ReactMarkdown>
              </div>
            </CardContent>
          )}
        </Card>
      ))}
    </div>
  );
}
