import { FileText, Download, Calendar, HardDrive, Tag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { AgentFile } from "@/hooks/useAgentFiles";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

function formatBytes(bytes: number | null): string {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function mimeIcon(mime: string | null): string {
  if (!mime) return "📄";
  if (mime.includes("csv") || mime.includes("spreadsheet")) return "📊";
  if (mime.includes("json")) return "🔧";
  if (mime.includes("pdf")) return "📕";
  if (mime.includes("image")) return "🖼️";
  if (mime.includes("zip") || mime.includes("tar") || mime.includes("gzip")) return "📦";
  return "📄";
}

interface FileListProps {
  files: AgentFile[];
}

export function FileList({ files }: FileListProps) {
  const handleDownload = async (file: AgentFile) => {
    try {
      const { data, error } = await supabase.storage
        .from("agent-files")
        .createSignedUrl(file.storage_path, 300);

      if (error) throw error;
      if (data?.signedUrl) {
        window.open(data.signedUrl, "_blank");
      }
    } catch (e: any) {
      toast.error("Failed to get download URL: " + (e.message || "Unknown error"));
    }
  };

  if (files.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
        <h3 className="text-lg font-medium text-muted-foreground">No files uploaded</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Files uploaded by your agent will appear here
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {files.map((file) => (
        <Card key={file.id} className="hover:bg-muted/30 transition-colors">
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 min-w-0 flex-1">
                <span className="text-2xl mt-0.5">{mimeIcon(file.mime_type)}</span>
                <div className="min-w-0 flex-1">
                  <h4 className="font-medium text-sm truncate">{file.filename}</h4>
                  {file.description && (
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                      {file.description}
                    </p>
                  )}
                  <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <HardDrive className="h-3 w-3" />
                      {formatBytes(file.size_bytes)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatDate(file.created_at)}
                    </span>
                    {file.source && (
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                        {file.source}
                      </Badge>
                    )}
                  </div>
                  {file.tags && file.tags.length > 0 && (
                    <div className="flex items-center gap-1 mt-1.5 flex-wrap">
                      <Tag className="h-3 w-3 text-muted-foreground" />
                      {file.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-[10px] px-1.5 py-0">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="shrink-0"
                onClick={() => handleDownload(file)}
                title="Download"
              >
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
