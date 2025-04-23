
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
      const response = await supabase.functions.invoke('unified-agent', {
        body: {
          query: batchQuery,
          include_web: true,
          include_drive: true
        }
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
