import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw, Brain, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { useLearnings, type Learning } from "@/hooks/useLearnings";
import { useLearningsRealtime } from "@/hooks/useLearningsRealtime";
import { LearningCard } from "@/components/learnings/LearningCard";
import { LearningFilters } from "@/components/learnings/LearningFilters";
import { LearningDetail } from "@/components/learnings/LearningDetail";

const Learnings = () => {
  const [selectedKind, setSelectedKind] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("all");
  const [selectedLearning, setSelectedLearning] = useState<Learning | null>(null);

  const {
    learnings,
    isLoading,
    error,
    totalCount,
    hasMore,
    loadMore,
    refresh,
  } = useLearnings({
    kind: selectedKind === "all" ? undefined : selectedKind,
    search: searchQuery || undefined,
    subjectName: selectedSubject === "all" ? undefined : selectedSubject,
  });

  // Handle new realtime learnings
  const handleNewLearning = useCallback((newLearning: Learning) => {
    refresh();
  }, [refresh]);

  useLearningsRealtime({
    kindFilter: selectedKind,
    onNewLearning: handleNewLearning,
    enabled: true,
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Home
                </Button>
              </Link>
              <div className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-primary" />
                <h1 className="text-xl font-bold">Learnings Feed</h1>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                {totalCount} total
              </span>
              <Button variant="outline" size="sm" onClick={refresh} disabled={isLoading}>
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
                Refresh
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="container mx-auto px-4 py-6">
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Filters */}
          <LearningFilters
            selectedKind={selectedKind}
            onKindChange={setSelectedKind}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedSubject={selectedSubject}
            onSubjectChange={setSelectedSubject}
          />

          {/* Error state */}
          {error && (
            <div className="text-center py-8">
              <p className="text-destructive">{error}</p>
              <Button variant="outline" className="mt-4" onClick={refresh}>
                Try Again
              </Button>
            </div>
          )}

          {/* Loading state */}
          {isLoading && learnings.length === 0 && (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          )}

          {/* Empty state */}
          {!isLoading && !error && learnings.length === 0 && (
            <div className="text-center py-12">
              <Brain className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-medium text-muted-foreground">No learnings yet</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {searchQuery
                  ? "Try a different search term"
                  : "Your Edge Bot hasn't recorded any learnings yet"}
              </p>
            </div>
          )}

          {/* Learnings list */}
          {learnings.length > 0 && (
            <div className="space-y-4">
              {learnings.map((learning) => (
                <LearningCard
                  key={learning.id}
                  learning={learning}
                  onClick={() => setSelectedLearning(learning)}
                />
              ))}
            </div>
          )}

          {/* Load more */}
          {hasMore && !isLoading && (
            <div className="flex justify-center pt-4">
              <Button variant="outline" onClick={loadMore}>
                Load More
              </Button>
            </div>
          )}

          {/* Loading more indicator */}
          {isLoading && learnings.length > 0 && (
            <div className="flex justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          )}
        </div>
      </main>

      {/* Detail slide-over */}
      {selectedLearning && (
        <LearningDetail
          learning={selectedLearning}
          onClose={() => setSelectedLearning(null)}
        />
      )}
    </div>
  );
};

export default Learnings;
