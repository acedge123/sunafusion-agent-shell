import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { 
  Brain, 
  Mail, 
  Search, 
  GitBranch, 
  Database, 
  Zap, 
  MessageSquare,
  Image,
  Lightbulb,
  Code
} from "lucide-react";
import type { Learning } from "@/hooks/useLearnings";

interface LearningCardProps {
  learning: Learning;
  onClick?: () => void;
}

const kindConfig: Record<string, { label: string; icon: typeof Brain; color: string }> = {
  general: { label: "General", icon: Lightbulb, color: "bg-gray-100 text-gray-700" },
  research_summary: { label: "Research", icon: Search, color: "bg-blue-100 text-blue-700" },
  email_summary: { label: "Email", icon: Mail, color: "bg-purple-100 text-purple-700" },
  memory: { label: "Memory", icon: Brain, color: "bg-green-100 text-green-700" },
  decision: { label: "Decision", icon: Lightbulb, color: "bg-amber-100 text-amber-700" },
  github_push_summary: { label: "GitHub", icon: GitBranch, color: "bg-slate-100 text-slate-700" },
  code_change: { label: "Code", icon: Code, color: "bg-indigo-100 text-indigo-700" },
  db_query_result: { label: "Database", icon: Database, color: "bg-cyan-100 text-cyan-700" },
  composio_trigger: { label: "Trigger", icon: Zap, color: "bg-orange-100 text-orange-700" },
  chat_query: { label: "Chat Query", icon: MessageSquare, color: "bg-rose-100 text-rose-700" },
  chat_response: { label: "Response", icon: MessageSquare, color: "bg-emerald-100 text-emerald-700" },
  image_generation: { label: "Image", icon: Image, color: "bg-pink-100 text-pink-700" },
};

function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + "...";
}

export function LearningCard({ learning, onClick }: LearningCardProps) {
  const config = kindConfig[learning.kind || "general"] || kindConfig.general;
  const IconComponent = config.icon;
  
  const timeAgo = formatDistanceToNow(new Date(learning.created_at), { addSuffix: true });
  const displayTitle = learning.title || truncateText(learning.learning, 80);
  const displayBody = learning.summary || truncateText(learning.learning, 200);

  return (
    <Card 
      className="hover:shadow-md transition-shadow cursor-pointer border-l-4 border-l-primary/20"
      onClick={onClick}
    >
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <IconComponent className="h-4 w-4 text-muted-foreground shrink-0" />
            <Badge variant="secondary" className={`text-xs shrink-0 ${config.color}`}>
              {config.label}
            </Badge>
            {learning.subject_name && (
              <Badge variant="outline" className="text-xs shrink-0">
                {learning.subject_name}
              </Badge>
            )}
            {learning.source && !learning.subject_name && (
              <span className="text-xs text-muted-foreground truncate">
                via {learning.source}
              </span>
            )}
          </div>
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            {timeAgo}
          </span>
        </div>
        {learning.title && (
          <h3 className="text-sm font-medium mt-1 leading-snug">{learning.title}</h3>
        )}
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-sm text-muted-foreground leading-relaxed">{displayBody}</p>
        {learning.tags && learning.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {learning.tags.slice(0, 3).map((tag, i) => (
              <Badge key={i} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
            {learning.tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{learning.tags.length - 3}
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
