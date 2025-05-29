
import { useState } from "react";
import { useCreatorIQLists } from "@/hooks/useCreatorIQLists";
import { ListCollection } from "./ListCollection";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Loader2 } from "lucide-react";

export const ListPagination = () => {
  const {
    isLoading,
    listsData,
    fetchLists,
    searchLists
  } = useCreatorIQLists();
  const [searchInput, setSearchInput] = useState("");
  
  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    searchLists(searchInput);
  };
  
  // Adapter function to make fetchLists compatible with ListCollection's onPageChange
  const handlePageChange = (page?: number, limit?: number, fetchAll?: boolean) => {
    return fetchLists(page || 1, searchInput, limit || 5000);
  };
  
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Lists</h3>
      
      <form onSubmit={handleSearch} className="flex space-x-2">
        <div className="relative flex-grow">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search lists..."
            className="pl-8"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </div>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Search"}
        </Button>
      </form>
      
      {isLoading && !listsData && (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}
      
      {listsData && (
        <ListCollection 
          endpoint={listsData} 
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
};
