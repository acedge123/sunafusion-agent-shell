import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Search, User, Building2, FolderGit2, GitBranch, Server, Ticket } from "lucide-react";
import { useEntities, type Entity } from "@/hooks/useRelationalMemory";
import { useDebounce } from "@/hooks/useDebounce";

const typeIcons: Record<string, typeof User> = {
  person: User,
  org: Building2,
  project: FolderGit2,
  repo: GitBranch,
  system: Server,
  ticket: Ticket,
};

export function EntityList() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const debouncedSearch = useDebounce(search, 300);

  const { entities, isLoading, error } = useEntities({
    search: debouncedSearch || undefined,
    entityType: typeFilter === "all" ? undefined : typeFilter,
  });

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search entities..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            <SelectItem value="person">People</SelectItem>
            <SelectItem value="org">Orgs</SelectItem>
            <SelectItem value="project">Projects</SelectItem>
            <SelectItem value="repo">Repos</SelectItem>
            <SelectItem value="system">Systems</SelectItem>
            <SelectItem value="ticket">Tickets</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading && (
        <div className="flex justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      )}

      {error && <p className="text-sm text-destructive text-center py-4">{error}</p>}

      {!isLoading && entities.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-8">
          No entities found. Entities are created when the agent processes learnings with named people, orgs, projects, etc.
        </p>
      )}

      <div className="grid gap-3">
        {entities.map((entity) => (
          <EntityCard key={entity.id} entity={entity} />
        ))}
      </div>
    </div>
  );
}

function EntityCard({ entity }: { entity: Entity }) {
  const Icon = typeIcons[entity.entity_type] || User;

  return (
    <Card className="hover:shadow-sm transition-shadow">
      <CardHeader className="pb-2 pt-4 px-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-sm font-medium">{entity.name}</CardTitle>
          </div>
          <Badge variant="outline" className="text-xs capitalize">
            {entity.entity_type}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pb-3 px-4 pt-0">
        {entity.summary && (
          <p className="text-xs text-muted-foreground">{entity.summary}</p>
        )}
        {entity.aliases.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {entity.aliases.map((alias, i) => (
              <Badge key={i} variant="secondary" className="text-xs">
                {alias}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
