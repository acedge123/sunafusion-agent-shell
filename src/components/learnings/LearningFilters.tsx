import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Users } from "lucide-react";
import { useState, useEffect } from "react";
import { useDebounce } from "@/hooks/useDebounce";
import { supabase } from "@/integrations/supabase/client";

interface LearningFiltersProps {
  selectedKind: string;
  onKindChange: (kind: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedSubject: string;
  onSubjectChange: (subject: string) => void;
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
  selectedSubject,
  onSubjectChange,
}: LearningFiltersProps) {
  const [localSearch, setLocalSearch] = useState(searchQuery);
  const debouncedSearch = useDebounce(localSearch, 300);
  const [subjectNames, setSubjectNames] = useState<string[]>([]);

  useEffect(() => {
    onSearchChange(debouncedSearch);
  }, [debouncedSearch, onSearchChange]);

  // Fetch distinct subject_names
  useEffect(() => {
    const fetchSubjects = async () => {
      const { data } = await supabase
        .from("agent_learnings")
        .select("subject_name")
        .not("subject_name", "is", null)
        .order("subject_name");

      if (data) {
        const unique = [...new Set(data.map((d) => d.subject_name).filter(Boolean))] as string[];
        setSubjectNames(unique);
      }
    };
    fetchSubjects();
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search learnings..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        {subjectNames.length > 0 && (
          <Select value={selectedSubject} onValueChange={onSubjectChange}>
            <SelectTrigger className="w-[160px]">
              <Users className="h-4 w-4 mr-2 text-muted-foreground" />
              <SelectValue placeholder="Everyone" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Everyone</SelectItem>
              {subjectNames.map((name) => (
                <SelectItem key={name} value={name}>
                  {name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
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
