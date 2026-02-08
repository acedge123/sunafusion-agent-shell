import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search } from "lucide-react";
import { useState, useEffect } from "react";
import { useDebounce } from "@/hooks/useDebounce";

interface LearningFiltersProps {
  selectedKind: string;
  onKindChange: (kind: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

const tabs = [
  { value: "all", label: "All" },
  { value: "research", label: "Research" },
  { value: "memory", label: "Memory" },
  { value: "decision", label: "Decisions" },
  { value: "email", label: "Email" },
  { value: "github", label: "GitHub" },
  { value: "composio", label: "Triggers" },
];

export function LearningFilters({
  selectedKind,
  onKindChange,
  searchQuery,
  onSearchChange,
}: LearningFiltersProps) {
  const [localSearch, setLocalSearch] = useState(searchQuery);
  const debouncedSearch = useDebounce(localSearch, 300);

  useEffect(() => {
    onSearchChange(debouncedSearch);
  }, [debouncedSearch, onSearchChange]);

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search learnings..."
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
          className="pl-9"
        />
      </div>
      <Tabs value={selectedKind} onValueChange={onKindChange}>
        <TabsList className="w-full justify-start overflow-x-auto">
          {tabs.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value} className="text-sm">
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </div>
  );
}
