
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trash2, ExternalLink, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ProductFeed {
  id: string;
  feed_name: string;
  feed_url?: string;
  feed_format: string;
  status: string;
  last_updated?: string;
  created_at: string;
  companies: {
    name: string;
  };
  feed_data?: any;
}

interface ProductFeedListProps {
  feeds: ProductFeed[];
  onRefresh: () => void;
}

export function ProductFeedList({ feeds, onRefresh }: ProductFeedListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { toast } = useToast();

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      const { error } = await supabase.from("product_feeds").delete().eq("id", id);
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Product feed deleted successfully",
      });
      onRefresh();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete product feed",
        variant: "destructive",
      });
    } finally {
      setDeletingId(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'error': return 'bg-red-100 text-red-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const downloadFeedData = (feed: ProductFeed) => {
    if (!feed.feed_data) return;
    
    const data = JSON.stringify(feed.feed_data, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${feed.feed_name}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (feeds.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No product feeds yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {feeds.map((feed) => (
        <Card key={feed.id} className="border border-gray-200">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-semibold text-gray-900">{feed.feed_name}</h3>
                  <Badge className={getStatusColor(feed.status)}>
                    {feed.status}
                  </Badge>
                  <Badge variant="outline">
                    {feed.feed_format.toUpperCase()}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  Company: {feed.companies.name}
                </p>
                {feed.feed_url && (
                  <a
                    href={feed.feed_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 mb-2"
                  >
                    <ExternalLink className="h-3 w-3 mr-1" />
                    View Feed URL
                  </a>
                )}
                <div className="text-xs text-gray-500">
                  <p>Created: {new Date(feed.created_at).toLocaleDateString()}</p>
                  {feed.last_updated && (
                    <p>Last Updated: {new Date(feed.last_updated).toLocaleDateString()}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-2 ml-4">
                {feed.feed_data && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => downloadFeedData(feed)}
                  >
                    <Download className="h-3 w-3 mr-1" />
                    Download
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDelete(feed.id)}
                  disabled={deletingId === feed.id}
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
