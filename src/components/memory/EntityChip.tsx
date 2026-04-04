import { Badge } from "@/components/ui/badge";
import { User, Building2, FolderGit2, Server, GitBranch, Ticket } from "lucide-react";
import type { Entity } from "@/hooks/useRelationalMemory";

const typeIcons: Record<string, typeof User> = {
  person: User,
  org: Building2,
  project: FolderGit2,
  repo: GitBranch,
  system: Server,
  ticket: Ticket,
};

const typeColors: Record<string, string> = {
  person: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  org: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
  project: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
  repo: "bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-300",
  system: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
  ticket: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300",
};

interface EntityChipProps {
  entity: Entity;
  role?: string | null;
  onClick?: () => void;
}

export function EntityChip({ entity, role, onClick }: EntityChipProps) {
  const Icon = typeIcons[entity.entity_type] || User;
  const color = typeColors[entity.entity_type] || "bg-muted text-muted-foreground";

  return (
    <Badge
      variant="secondary"
      className={`${color} cursor-pointer hover:opacity-80 transition-opacity text-xs gap-1`}
      onClick={onClick}
    >
      <Icon className="h-3 w-3" />
      {entity.name}
      {role && <span className="opacity-60">({role})</span>}
    </Badge>
  );
}

interface EntityChipListProps {
  entities: Array<{ entity?: Entity; role?: string | null }>;
  maxShow?: number;
}

export function EntityChipList({ entities, maxShow = 3 }: EntityChipListProps) {
  const visible = entities.filter(e => e.entity).slice(0, maxShow);
  const remaining = entities.filter(e => e.entity).length - maxShow;

  if (visible.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1 mt-2">
      {visible.map((link, i) => (
        <EntityChip key={i} entity={link.entity!} role={link.role} />
      ))}
      {remaining > 0 && (
        <Badge variant="outline" className="text-xs">
          +{remaining} more
        </Badge>
      )}
    </div>
  );
}
