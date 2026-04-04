import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ReactMarkdown from "react-markdown";
import { ArrowLeft, Link as LinkIcon } from "lucide-react";
import { WikiPage } from "@/hooks/useWiki";

interface Props {
  page: WikiPage & { linked_sources?: any[] };
  onBack: () => void;
  onFetchFull: (pageId: string) => void;
}

export default function WikiPageDetail({ page, onBack, onFetchFull }: Props) {
  useEffect(() => { onFetchFull(page.id); }, [page.id]);

  return (
    <div className="space-y-4">
      <Button variant="ghost" size="sm" onClick={onBack} className="flex items-center gap-1">
        <ArrowLeft className="h-4 w-4" /> Back to list
      </Button>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2 flex-wrap">
            <CardTitle className="text-xl">{page.title}</CardTitle>
            <Badge variant="secondary">{page.page_type}</Badge>
            <Badge variant="outline">{page.slug}</Badge>
          </div>
          {page.summary && <p className="text-sm text-muted-foreground">{page.summary}</p>}
          <p className="text-xs text-muted-foreground">Updated: {new Date(page.updated_at).toLocaleString()} · {page.source_count} sources</p>
        </CardHeader>
        <CardContent>
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <ReactMarkdown>{page.body_markdown}</ReactMarkdown>
          </div>
        </CardContent>
      </Card>

      {page.linked_sources && page.linked_sources.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-base">Linked Sources</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {page.linked_sources.map((ls: any) => {
                const s = ls.wiki_sources;
                if (!s) return null;
                return (
                  <div key={ls.id} className="flex items-center gap-2 text-sm">
                    <LinkIcon className="h-3 w-3 text-muted-foreground shrink-0" />
                    <span className="font-medium">{s.title || s.source_type}</span>
                    {ls.role && <Badge variant="outline" className="text-xs">{ls.role}</Badge>}
                    {s.source_url && (
                      <a href={s.source_url} target="_blank" rel="noopener" className="text-primary text-xs underline truncate max-w-[200px]">{s.source_url}</a>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
