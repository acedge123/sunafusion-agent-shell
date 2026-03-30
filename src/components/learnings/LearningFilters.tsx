import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Users, Globe, Layers } from "lucide-react";
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
  selectedDomain: string;
  onDomainChange: (domain: string) => void;
  selectedSurface: string;
  onSurfaceChange: (surface: string) => void;
}

const tabs = [
  { value: "all", label: "All" },
  { value: "decision", label: "Decisions" },
  { value: "playbook", label: "Playbooks" },
  { value: "gotcha", label: "Gotchas" },
  { value: "reference", label: "Reference" },
  { value: "research", label: "Research" },
];

export function LearningFilters({
  selectedKind,
  onKindChange,
  searchQuery,
  onSearchChange,
  selectedSubject,
  onSubjectChange,
  selectedDomain,
  onDomainChange,
  selectedSurface,
  onSurfaceChange,
}: LearningFiltersProps) {
  const [localSearch, setLocalSearch] = useState(searchQuery);
  const debouncedSearch = useDebounce(localSearch, 300);
  const [subjectNames, setSubjectNames] = useState<string[]>([]);
  const [domains, setDomains] = useState<string[]>([]);
  const [surfaces, setSurfaces] = useState<string[]>([]);

  useEffect(() => {
    onSearchChange(debouncedSearch);
  }, [debouncedSearch, onSearchChange]);

  // Fetch distinct subject_names, domains, and surface tags
  useEffect(() => {
    const fetchFilterData = async () => {
      // Fetch subjects
      const { data: subjectData } = await supabase
        .from("agent_learnings")
        .select("subject_name")
        .not("subject_name", "is", null)
        .order("subject_name");

      if (subjectData) {
        const unique = [...new Set(subjectData.map((d) => d.subject_name).filter(Boolean))] as string[];
        setSubjectNames(unique);
      }

      // Fetch domains from the domain column
      const { data: domainData } = await supabase
        .from("agent_learnings")
        .select("domain")
        .not("domain", "is", null);

      if (domainData) {
        const uniqueDomains = [...new Set(domainData.map((d) => d.domain).filter(Boolean))] as string[];
        setDomains(uniqueDomains.sort());
      }

      // Fetch surface tags (tags starting with "surface:")
      const { data: tagData } = await supabase
        .from("agent_learnings")
        .select("tags")
        .not("tags", "is", null);

      if (tagData) {
        const allSurfaces = new Set<string>();
        tagData.forEach((row) => {
          (row.tags || []).forEach((tag: string) => {
            if (tag.startsWith("surface:")) {
              allSurfaces.add(tag.replace("surface:", ""));
            }
          });
        });
        setSurfaces([...allSurfaces].sort());
      }
    };
    fetchFilterData();
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
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
            <SelectTrigger className="w-[140px]">
              <Users className="h-4 w-4 mr-2 text-muted-foreground" />
              <SelectValue placeholder="Everyone" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Everyone</SelectItem>
              {subjectNames.map((name) => (
                <SelectItem key={name} value={name}>{name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        {domains.length > 0 && (
          <Select value={selectedDomain} onValueChange={onDomainChange}>
            <SelectTrigger className="w-[150px]">
              <Globe className="h-4 w-4 mr-2 text-muted-foreground" />
              <SelectValue placeholder="All Domains" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Domains</SelectItem>
              {domains.map((d) => (
                <SelectItem key={d} value={d}>{d}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        {surfaces.length > 0 && (
          <Select value={selectedSurface} onValueChange={onSurfaceChange}>
            <SelectTrigger className="w-[140px]">
              <Layers className="h-4 w-4 mr-2 text-muted-foreground" />
              <SelectValue placeholder="All Sources" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sources</SelectItem>
              {surfaces.map((s) => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
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
