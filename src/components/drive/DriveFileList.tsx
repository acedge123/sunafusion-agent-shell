
import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Loader2, Search, LogIn, RefreshCw } from "lucide-react"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/components/ui/use-toast"
import { Input } from "@/components/ui/input"
import { GoogleDriveAuth } from "./GoogleDriveAuth"

export const DriveFileList = () => {
  const [files, setFiles] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [analyzing, setAnalyzing] = useState<string | null>(null)
  const [batchQuery, setBatchQuery] = useState("")
  const [batchProcessing, setBatchProcessing] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const { toast } = useToast()

  // Check if user has authenticated with Google Drive
  useEffect(() => {
    const checkGoogleAuth = async () => {
      try {
        const { data: userData } = await supabase.auth.getUser();
        if (!userData.user) {
          setIsAuthenticated(false);
          return;
        }
        
        // Check if user has Google Drive access
        const { data: accessData, error } = await supabase
          .from('google_drive_access')
          .select('access_token')
          .eq('user_id', userData.user.id)
          .maybeSingle();

        // Also check session for provider
        const { data: sessionData } = await supabase.auth.getSession();
        const hasGoogleProvider = sessionData.session?.user?.app_metadata?.provider === 'google';

        setIsAuthenticated(!!accessData?.access_token || hasGoogleProvider);
        
        // If authenticated, fetch files automatically
        if (!!accessData?.access_token || hasGoogleProvider) {
          fetchFiles();
        }
      } catch (error) {
        console.error("Error checking Google auth:", error);
        setIsAuthenticated(false);
      }
    };

    checkGoogleAuth();
  }, []);

  const fetchFiles = async () => {
    setLoading(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        throw new Error("User not authenticated");
      }
      
      // First try to get from google_drive_access table
      const { data: accessData } = await supabase
        .from('google_drive_access')
        .select('access_token')
        .eq('user_id', userData.user.id)
        .single();
      
      let accessToken = accessData?.access_token;
      
      // If not found, try to get from the session
      if (!accessToken) {
        const { data: sessionData } = await supabase.auth.getSession();
        accessToken = sessionData.session?.provider_token;
      }

      if (accessToken) {
        console.log("Using access token to fetch files");
        const response = await fetch('https://www.googleapis.com/drive/v3/files?fields=files(id,name,mimeType)', {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        });
        
        if (!response.ok) {
          throw new Error(`Google API error: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        setFiles(data.files || []);
        setIsAuthenticated(true);
      } else {
        console.log("No access token found");
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error("Error fetching files:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch files. Please reconnect your Google Drive."
      });
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const analyzeFile = async (fileId: string) => {
    setAnalyzing(fileId);
    try {
      const response = await supabase.functions.invoke('drive-ai-assistant', {
        body: {
          action: "Please analyze this document and provide a summary.",
          fileId
        }
      });

      if (response.error) throw response.error;

      toast({
        title: "Analysis Complete",
        description: response.data.result
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Analysis Failed",
        description: error instanceof Error ? error.message : "An unexpected error occurred"
      });
    } finally {
      setAnalyzing(null);
    }
  };

  const handleBatchQuery = async () => {
    if (!batchQuery.trim()) {
      toast({
        variant: "destructive",
        title: "Query Required",
        description: "Please enter a query to analyze files"
      });
      return;
    }

    setBatchProcessing(true);
    try {
      const response = await supabase.functions.invoke('unified-agent', {
        body: {
          query: batchQuery,
          include_web: true,
          include_drive: true
        }
      });

      if (response.error) throw response.error;

      toast({
        title: "Analysis Complete",
        description: "The agent has processed your query successfully."
      });

      window.location.href = `/chat?query=${encodeURIComponent(batchQuery)}&result=${encodeURIComponent(JSON.stringify(response.data))}`;
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Query Failed",
        description: error instanceof Error ? error.message : "An unexpected error occurred"
      });
    } finally {
      setBatchProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <GoogleDriveAuth />
      
      {isAuthenticated && (
        <div className="p-4 border rounded-lg bg-card">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Your Google Drive Files</h2>
            <Button 
              onClick={fetchFiles} 
              variant="outline" 
              disabled={loading}
              size="sm"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Refresh
            </Button>
          </div>
          
          <div className="p-4 border border-muted rounded-lg bg-muted/50 mb-4">
            <h3 className="font-medium mb-2">Ask about your documents</h3>
            <div className="flex gap-2">
              <Input
                placeholder="Enter a question about your documents..."
                value={batchQuery}
                onChange={(e) => setBatchQuery(e.target.value)}
                disabled={batchProcessing}
                className="flex-1"
              />
              <Button 
                onClick={handleBatchQuery}
                disabled={batchProcessing || !batchQuery.trim()}
              >
                {batchProcessing ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...</>
                ) : (
                  <><Search className="mr-2 h-4 w-4" /> Search</>
                )}
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Ask questions about your documents or search for specific information across your files.
            </p>
          </div>
          
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              <span>Loading files...</span>
            </div>
          ) : (
            <div className="grid gap-4">
              {files.length === 0 ? (
                <div className="text-center p-8 text-muted-foreground">
                  <p>No files found in your Google Drive.</p>
                  <p className="text-sm mt-2">Files you have access to will appear here.</p>
                </div>
              ) : (
                files.map((file) => (
                  <div key={file.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1 truncate mr-4">
                      <span className="font-medium">{file.name}</span>
                      <p className="text-xs text-muted-foreground">{file.mimeType}</p>
                    </div>
                    <Button 
                      onClick={() => analyzeFile(file.id)}
                      disabled={analyzing === file.id}
                      size="sm"
                    >
                      {analyzing === file.id ? (
                        <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analyzing...</>
                      ) : (
                        'Analyze with AI'
                      )}
                    </Button>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
