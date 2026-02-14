import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw, Network, BarChart3, Users, Sparkles } from "lucide-react";
import Navigation from "@/components/Navigation";
import { useDashboardData } from "@/hooks/useDashboardData";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { KnowledgeGraph } from "@/components/dashboard/KnowledgeGraph";
import { ActivityTimeline } from "@/components/dashboard/ActivityTimeline";
import { KindBreakdown } from "@/components/dashboard/KindBreakdown";
import { SubjectList } from "@/components/dashboard/SubjectList";
import { Skeleton } from "@/components/ui/skeleton";

const Dashboard: React.FC = () => {
  const { stats, isLoading, error, refresh } = useDashboardData();

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="container mx-auto px-4 py-6 space-y-6 max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Network className="h-6 w-6 text-primary" />
              Knowledge Dashboard
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Visual map of everything your agent has learned
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={refresh} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-1.5 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>

        {error && (
          <div className="p-4 bg-destructive/10 text-destructive rounded-lg text-sm">
            {error}
          </div>
        )}

        {isLoading && !stats ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-20 rounded-lg" />
              ))}
            </div>
            <Skeleton className="h-96 rounded-lg" />
          </div>
        ) : stats ? (
          <>
            {/* Stats overview */}
            <StatsCards stats={stats} />

            {/* Main grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Knowledge Graph - takes 2/3 */}
              <Card className="lg:col-span-2 border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Network className="h-5 w-5 text-primary" />
                    Knowledge Graph
                  </CardTitle>
                  <CardDescription>
                    Hover nodes to explore connections between people, domains, and knowledge types
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <KnowledgeGraph nodes={stats.nodes} edges={stats.edges} />
                </CardContent>
              </Card>

              {/* Right column */}
              <div className="space-y-6">
                {/* Subjects */}
                <Card className="border-border">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Users className="h-4 w-4 text-primary" />
                      Tracked Entities
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <SubjectList subjects={stats.bySubject} />
                  </CardContent>
                </Card>

                {/* Kind breakdown */}
                <Card className="border-border">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <BarChart3 className="h-4 w-4 text-primary" />
                      Knowledge Distribution
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <KindBreakdown byKind={stats.byKind} />
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Activity timeline */}
            <Card className="border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-primary" />
                  Learning Activity (Last 30 Days)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ActivityTimeline data={stats.recentActivity} />
              </CardContent>
            </Card>

            {/* AI Digest placeholder */}
            <Card className="border-border border-dashed">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  AI Knowledge Digest
                </CardTitle>
                <CardDescription>
                  Coming soon — Edge Bot will auto-generate daily/weekly summaries of key learnings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center py-8 text-muted-foreground text-sm">
                  AI digest generation will be enabled once the Edge Bot begins posting approved learnings with domain tags
                </div>
              </CardContent>
            </Card>
          </>
        ) : null}
      </main>
    </div>
  );
};

export default Dashboard;
