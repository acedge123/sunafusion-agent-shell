import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Brain, Users, FolderOpen, Activity, MessageSquare, GitBranch } from "lucide-react";
import { DashboardStats } from "@/hooks/useDashboardData";

interface StatsCardsProps {
  stats: DashboardStats;
}

export const StatsCards: React.FC<StatsCardsProps> = ({ stats }) => {
  const cards = [
    {
      label: "Total Learnings",
      value: stats.totalLearnings,
      icon: Brain,
      color: "text-primary",
    },
    {
      label: "People Tracked",
      value: stats.bySubject.length,
      icon: Users,
      color: "text-primary",
    },
    {
      label: "Knowledge Types",
      value: Object.keys(stats.byKind).length,
      icon: FolderOpen,
      color: "text-muted-foreground",
    },
    {
      label: "Chat Interactions",
      value: (stats.byKind["chat_query"] || 0) + (stats.byKind["chat_response"] || 0),
      icon: MessageSquare,
      color: "text-muted-foreground",
    },
    {
      label: "Triggers Processed",
      value: stats.byKind["composio_trigger"] || 0,
      icon: Activity,
      color: "text-muted-foreground",
    },
    {
      label: "Domains",
      value: stats.byDomain.length || "—",
      icon: GitBranch,
      color: "text-muted-foreground",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      {cards.map((card) => (
        <Card key={card.label} className="border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <card.icon className={`h-4 w-4 ${card.color}`} />
              <span className="text-xs text-muted-foreground truncate">{card.label}</span>
            </div>
            <div className="text-2xl font-bold text-foreground">{card.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
