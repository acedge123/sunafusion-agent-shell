
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ExternalLink, Trash2, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Company {
  id: string;
  name: string;
  description?: string;
  website_url?: string;
  created_at: string;
}

interface CompanyListProps {
  companies: Company[];
  onRefresh: () => void;
  onSelectForFeed: (company: Company) => void;
}

export function CompanyList({ companies, onRefresh, onSelectForFeed }: CompanyListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { toast } = useToast();

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      const { error } = await supabase.from("companies").delete().eq("id", id);
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Company deleted successfully",
      });
      onRefresh();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete company",
        variant: "destructive",
      });
    } finally {
      setDeletingId(null);
    }
  };

  if (companies.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No companies yet. Create your first company to get started.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {companies.map((company) => (
        <Card key={company.id} className="border border-gray-200">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">{company.name}</h3>
                {company.description && (
                  <p className="text-sm text-gray-600 mt-1">{company.description}</p>
                )}
                {company.website_url && (
                  <a
                    href={company.website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 mt-2"
                  >
                    <ExternalLink className="h-3 w-3 mr-1" />
                    Visit Website
                  </a>
                )}
                <p className="text-xs text-gray-500 mt-2">
                  Created {new Date(company.created_at).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center space-x-2 ml-4">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onSelectForFeed(company)}
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Add Feed
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDelete(company.id)}
                  disabled={deletingId === company.id}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
