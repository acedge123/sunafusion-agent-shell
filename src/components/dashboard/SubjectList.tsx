import React from "react";
import { Badge } from "@/components/ui/badge";
import { User, GitBranch, Server, Cpu } from "lucide-react";

interface SubjectListProps {
  subjects: { name: string; type: string | null; count: number }[];
}

const TYPE_ICON: Record<string, React.ElementType> = {
  person: User,
  repo: GitBranch,
  service: Server,
  system: Cpu,
};

export const SubjectList: React.FC<SubjectListProps> = ({ subjects }) => {
  if (subjects.length === 0) {
    return <div className="text-muted-foreground text-sm text-center py-4">No subjects tracked yet</div>;
  }

  return (
    <div className="space-y-2">
      {subjects.map((s) => {
        const Icon = TYPE_ICON[s.type || ""] || User;
        return (
          <div key={s.name} className="flex items-center justify-between py-1.5 px-2 rounded-md hover:bg-muted/50 transition-colors">
            <div className="flex items-center gap-2">
              <Icon className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">{s.name}</span>
              {s.type && (
                <Badge variant="secondary" className="text-xs">
                  {s.type}
                </Badge>
              )}
            </div>
            <span className="text-xs text-muted-foreground">{s.count} learnings</span>
          </div>
        );
      })}
    </div>
  );
};
