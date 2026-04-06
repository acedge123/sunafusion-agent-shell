import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { WikiPage } from "@/hooks/useWiki";
import { Search } from "lucide-react";

interface Props {
  pages: WikiPage[];
  loading: boolean;
  onFetch: (pageType?: string, search?: string) => void;
  onSelect: (page: WikiPage) => void;
}

const PAGE_TYPES = ["topic", "source_note", "entity", "index", "brief", "overview"];

export default function WikiPageList({ pages, loading, onFetch, onSelect }: Props) {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  useEffect(() => { onFetch(typeFilter === "all" ? undefined : typeFilter, search || undefined); }, [typeFilter]);

  const handleSearch = () => onFetch(typeFilter === "all" ? undefined : typeFilter, search || undefined);

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search pages..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSearch()}
            className="pl-9"
          />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-40"><SelectValue placeholder="All types" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            {PAGE_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {loading && <p className="text-sm text-muted-foreground">Loading...</p>}

      <div className="space-y-2">
        {pages.map(p => (
          <Card key={p.id} className="p-3 cursor-pointer hover:bg-accent/50 transition-colors" onClick={() => onSelect(p)}>
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="font-medium truncate">{p.title}</p>
                <p className="text-xs text-muted-foreground truncate">{p.slug}</p>
                {p.summary && <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{p.summary}</p>}
              </div>
              <div className="flex flex-col items-end gap-1 shrink-0">
                <Badge variant="secondary" className="text-xs">{p.page_type}</Badge>
                <span className="text-xs text-muted-foreground">{p.source_count} src</span>
              </div>
            </div>
          </Card>
        ))}
        {!loading && pages.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">No pages found</p>}
      </div>
    </div>
  );
}
