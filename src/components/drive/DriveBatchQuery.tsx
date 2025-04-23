
import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2, Search } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { supabase } from "@/integrations/supabase/client"

export const DriveBatchQuery = () => {
  const [batchQuery, setBatchQuery] = useState("")
  const [batchProcessing, setBatchProcessing] = useState(false)
  const { toast } = useToast()

  const handleBatchQuery = async () => {
    if (!batchQuery.trim()) {
      toast({
        variant: "destructive",
        title: "Query Required",
        description: "Please enter a query to analyze files"
      })
      return
    }

    setBatchProcessing(true)
    try {
      // Get the current session for the auth token
      const { data: sessionData } = await supabase.auth.getSession()
      const authToken = sessionData?.session?.access_token
      const providerToken = sessionData?.session?.provider_token
      
      // If no provider token in session, try to get from database
      let storedToken = null;
      if (!providerToken && sessionData?.session?.user) {
        try {
          const { data: tokenData } = await supabase
            .from('google_drive_access')
            .select('access_token')
            .eq('user_id', sessionData.session.user.id)
            .maybeSingle();
            
          storedToken = tokenData?.access_token;
          console.log("DriveBatchQuery: Retrieved stored token from database:", !!storedToken);
        } catch (dbError) {
          console.error("DriveBatchQuery: Error retrieving token from database:", dbError);
        }
      }

      // Store the provider token if available
      if (providerToken && sessionData?.session?.user?.id) {
        try {
          // First check if the record exists
          const { data: existingRecord, error: queryError } = await supabase
            .from('google_drive_access')
            .select('id')
            .eq('user_id', sessionData.session.user.id)
            .maybeSingle();
          
          if (queryError) {
            console.error("Error checking for existing record:", queryError);
          }
          
          if (existingRecord) {
            // Update existing record
            const { error: updateError } = await supabase
              .from('google_drive_access')
              .update({
                access_token: providerToken,
                token_expires_at: new Date(Date.now() + 3600 * 1000).toISOString(),
                updated_at: new Date().toISOString()
              })
              .eq('user_id', sessionData.session.user.id);
            
            if (updateError) {
              console.error("Error updating Google Drive token:", updateError);
            } else {
              console.log("Successfully updated Google Drive token for future use");
            }
          } else {
            // Insert new record
            const { error: insertError } = await supabase
              .from('google_drive_access')
              .insert({
                user_id: sessionData.session.user.id,
                access_token: providerToken,
                token_expires_at: new Date(Date.now() + 3600 * 1000).toISOString(),
                updated_at: new Date().toISOString()
              });
            
            if (insertError) {
              console.error("Error inserting Google Drive token:", insertError);
            } else {
              console.log("Successfully inserted Google Drive token for future use");
            }
          }
        } catch (storeError) {
          console.error("Error in token storage:", storeError);
        }
      }

      const response = await supabase.functions.invoke('unified-agent', {
        body: {
          query: batchQuery,
          include_web: true,
          include_drive: true,
          provider_token: providerToken || storedToken, // Try both tokens
          debug_token_info: {
            hasProviderToken: !!providerToken,
            hasStoredToken: !!storedToken,
            userHasSession: !!sessionData?.session
          }
        },
        headers: authToken ? {
          Authorization: `Bearer ${authToken}`
        } : undefined
      })

      if (response.error) throw response.error

      toast({
        title: "Analysis Complete",
        description: "The agent has processed your query successfully."
      })

      window.location.href = `/chat?query=${encodeURIComponent(batchQuery)}&result=${encodeURIComponent(JSON.stringify(response.data))}`
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Query Failed",
        description: error instanceof Error ? error.message : "An unexpected error occurred"
      })
    } finally {
      setBatchProcessing(false)
    }
  }

  return (
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
  )
}
