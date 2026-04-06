import { useEffect, useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { WikiSource } from "@/hooks/useWiki";
import { FileText, Zap } from "lucide-react";

interface Props {
  sources: WikiSource[];
  loading: boolean;
  onFetch: (status?: string, sourceType?: string) => void;
  onCompile: (sourceId: string) => Promise<void>;
}

const SOURCE_TYPES = ["url", "tweet", "note", "article", "paper", "chat", "manual"];
const STATUSES = ["raw", "normalized", "compiled", "rejected"];

export default function WikiSourceList({ sources, loading, onFetch, onCompile }: Props) {
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => { onFetch(statusFilter === "all" ? undefined : statusFilter, typeFilter === "all" ? undefined : typeFilter); }, [typeFilter, statusFilter]);

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-36"><SelectValue placeholder="All types" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            {SOURCE_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-36"><SelectValue placeholder="All statuses" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {loading && <p className="text-sm text-muted-foreground">Loading...</p>}

      <div className="space-y-2">
        {sources.map(s => (
          <Card key={s.id} className="p-3">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex items-start gap-2">
                <FileText className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium truncate">{s.title || s.source_type}</p>
                  {s.source_url && <p className="text-xs text-muted-foreground truncate max-w-[300px]">{s.source_url}</p>}
                  <p className="text-xs text-muted-foreground">Ingested: {new Date(s.ingested_at).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Badge variant={s.status === "compiled" ? "default" : "secondary"} className="text-xs">{s.status}</Badge>
                <Badge variant="outline" className="text-xs">{s.source_type}</Badge>
                {s.status === "raw" && (
                  <Button size="sm" variant="outline" onClick={() => onCompile(s.id)}>
                    <Zap className="h-3 w-3 mr-1" /> Compile
                  </Button>
                )}
              </div>
            </div>
          </Card>
        ))}
        {!loading && sources.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">No sources found</p>}
      </div>
    </div>
  );
}
