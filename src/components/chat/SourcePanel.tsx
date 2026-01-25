import { useState } from "react"
import { ChevronDown, ChevronUp, ExternalLink, Copy, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"

interface SourceData {
  repos_mentioned?: Array<{ name: string; origin: string; domain_summary?: string }>
  tables_mentioned?: Array<{ table: string; owner_repo: string }>
  functions_mentioned?: Array<{ function: string; repo: string; type: 'edge' | 'api' }>
  sql_query?: string | null
}

interface SourcePanelProps {
  sourceData: SourceData
}

export default function SourcePanel({ sourceData }: SourcePanelProps) {
  const [isOpen, setIsOpen] = useState(true)
  const [copied, setCopied] = useState<string | null>(null)
  const { toast } = useToast()

  const hasData = 
    (sourceData.repos_mentioned?.length ?? 0) > 0 ||
    (sourceData.tables_mentioned?.length ?? 0) > 0 ||
    (sourceData.functions_mentioned?.length ?? 0) > 0 ||
    sourceData.sql_query

  if (!hasData) return null

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    setCopied(label)
    toast({
      title: "Copied",
      description: `${label} copied to clipboard`
    })
    setTimeout(() => setCopied(null), 2000)
  }

  const openRepo = (origin: string) => {
    if (origin) {
      window.open(origin, '_blank', 'noopener,noreferrer')
    }
  }

  return (
    <Card className="mt-2 border-muted">
      <CardContent className="p-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full justify-between h-auto p-2"
        >
          <span className="text-sm font-medium">Sources & Actions</span>
          {isOpen ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </Button>

        {isOpen && (
          <div className="mt-3 space-y-3">
            {/* Repositories */}
            {sourceData.repos_mentioned && sourceData.repos_mentioned.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold text-muted-foreground mb-2">Repositories</h4>
                <div className="space-y-2">
                  {sourceData.repos_mentioned.map((repo, idx) => (
                    <div key={idx} className="text-sm">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-mono font-semibold">{repo.name}</span>
                        {repo.origin && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openRepo(repo.origin)}
                            className="h-6 px-2"
                          >
                            <ExternalLink className="h-3 w-3 mr-1" />
                            Open
                          </Button>
                        )}
                      </div>
                      {repo.domain_summary && (
                        <div className="text-xs text-muted-foreground mt-1 pl-2 border-l-2 border-muted">
                          {repo.domain_summary.split('\n').slice(0, 3).join(' ').substring(0, 200)}...
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tables */}
            {sourceData.tables_mentioned && sourceData.tables_mentioned.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold text-muted-foreground mb-2">Database Tables</h4>
                <div className="space-y-1">
                  {sourceData.tables_mentioned.map((table, idx) => (
                    <div key={idx} className="flex items-center justify-between text-sm">
                      <div>
                        <span className="font-mono">{table.table}</span>
                        <span className="text-muted-foreground text-xs ml-2">
                          ({table.owner_repo})
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Functions */}
            {sourceData.functions_mentioned && sourceData.functions_mentioned.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold text-muted-foreground mb-2">Functions & Routes</h4>
                <div className="space-y-1">
                  {sourceData.functions_mentioned.map((fn, idx) => (
                    <div key={idx} className="flex items-center justify-between text-sm">
                      <div>
                        <span className="font-mono">{fn.function}</span>
                        <span className="text-muted-foreground text-xs ml-2">
                          ({fn.type === 'edge' ? 'Edge Function' : 'API Route'} in {fn.repo})
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SQL Query */}
            {sourceData.sql_query && (
              <div>
                <h4 className="text-xs font-semibold text-muted-foreground mb-2">SQL Query</h4>
                <div className="relative">
                  <pre className="text-xs bg-muted p-2 rounded overflow-x-auto">
                    {sourceData.sql_query}
                  </pre>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(sourceData.sql_query!, "SQL query")}
                    className="absolute top-1 right-1 h-6 w-6 p-0"
                  >
                    {copied === "SQL query" ? (
                      <Check className="h-3 w-3" />
                    ) : (
                      <Copy className="h-3 w-3" />
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
