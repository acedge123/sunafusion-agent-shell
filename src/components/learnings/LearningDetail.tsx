import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";
import { 
  X, 
  Brain, 
  Mail, 
  Search, 
  GitBranch, 
  Database, 
  Zap, 
  MessageSquare,
  Image,
  Lightbulb,
  Code,
  Clock,
  Tag,
  ChevronDown,
  ChevronRight
} from "lucide-react";
import { useState } from "react";
import type { Learning } from "@/hooks/useLearnings";

interface LearningDetailProps {
  learning: Learning;
  onClose: () => void;
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

export function LearningDetail({ learning, onClose }: LearningDetailProps) {
  const [showMetadata, setShowMetadata] = useState(false);
  const config = kindConfig[learning.kind || "general"] || kindConfig.general;
  const IconComponent = config.icon;

  const formattedDate = format(new Date(learning.created_at), "PPpp");

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
      <div className="fixed inset-y-0 right-0 w-full max-w-lg border-l bg-background shadow-lg">
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b p-4">
            <div className="flex items-center gap-2">
              <IconComponent className="h-5 w-5 text-muted-foreground" />
              <Badge className={config.color}>{config.label}</Badge>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Content */}
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-6">
              {/* Main content */}
              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">
                    {learning.learning}
                  </p>
                </CardContent>
              </Card>

              {/* Meta info */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>{formattedDate}</span>
                </div>

                {learning.source && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Zap className="h-4 w-4" />
                    <span>Source: {learning.source}</span>
                  </div>
                )}

                {learning.category && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Tag className="h-4 w-4" />
                    <span>Category: {learning.category}</span>
                  </div>
                )}

                {learning.confidence !== null && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Brain className="h-4 w-4" />
                    <span>Confidence: {Math.round(learning.confidence * 100)}%</span>
                  </div>
                )}
              </div>

              {/* Tags */}
              {learning.tags && learning.tags.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Tags</h4>
                  <div className="flex flex-wrap gap-2">
                    {learning.tags.map((tag, i) => (
                      <Badge key={i} variant="outline">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <Separator />

              {/* Metadata (collapsible) */}
              {learning.metadata && Object.keys(learning.metadata).length > 0 && (
                <div className="space-y-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start p-0 h-auto font-medium"
                    onClick={() => setShowMetadata(!showMetadata)}
                  >
                    {showMetadata ? (
                      <ChevronDown className="h-4 w-4 mr-2" />
                    ) : (
                      <ChevronRight className="h-4 w-4 mr-2" />
                    )}
                    Metadata
                  </Button>
                  {showMetadata && (
                    <pre className="text-xs bg-muted p-3 rounded-md overflow-x-auto">
                      {JSON.stringify(learning.metadata, null, 2)}
                    </pre>
                  )}
                </div>
              )}

              {/* ID for reference */}
              <div className="text-xs text-muted-foreground">
                ID: {learning.id}
              </div>
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}
