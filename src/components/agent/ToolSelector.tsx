
import { Button } from "@/components/ui/button";
import { Check, X, Search, File, FileSearch, LogIn, Briefcase, Package } from "lucide-react";
import { Link } from "react-router-dom";

interface ToolSelectorProps {
  selectedTools: string[];
  onToolToggle: (toolId: string) => void;
  driveConnected?: boolean;
}

export const ToolSelector = ({ selectedTools, onToolToggle, driveConnected = false }: ToolSelectorProps) => {
  const tools = [
    {
      id: "web_search",
      name: "Web Search",
      description: "Search the web for information",
      icon: <Search className="h-4 w-4" />
    },
    {
      id: "file_search",
      name: "Google Drive Search",
      description: "Search through your Google Drive files",
      icon: <FileSearch className="h-4 w-4" />,
      requiresDrive: true
    },
    {
      id: "file_analysis",
      name: "File Analysis",
      description: "Analyze files from Google Drive",
      icon: <File className="h-4 w-4" />,
      requiresDrive: true
    },
    {
      id: "product_feed_search",
      name: "Product Feed Search",
      description: "Search and analyze products from uploaded product feeds",
      icon: <Package className="h-4 w-4" />
    },
    {
      id: "creator_iq",
      name: "Creator IQ",
      description: "Access publisher, campaign, and list data from Creator IQ platform",
      icon: <Briefcase className="h-4 w-4" />
    }
  ];

  // Add debug logging to see what's happening with tool selection
  const handleToolToggle = (toolId: string) => {
    console.log('Tool toggle clicked:', toolId);
    console.log('Current selected tools:', selectedTools);
    console.log('Is tool currently selected:', selectedTools.includes(toolId));
    onToolToggle(toolId);
  };

  return (
    <div className="space-y-2">
      <h3 className="font-medium text-sm">Select tools to use:</h3>
      <div className="text-xs text-muted-foreground mb-2">
        Selected tools: {selectedTools.length > 0 ? selectedTools.join(', ') : 'None'}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
        {tools.map((tool) => {
          const isSelected = selectedTools.includes(tool.id);
          const isDriveAndDisconnected = tool.requiresDrive && !driveConnected;
          
          return (
            <div 
              key={tool.id}
              className={`border rounded-md p-3 cursor-pointer transition-colors ${
                isSelected 
                  ? 'bg-primary/10 border-primary/30' 
                  : 'bg-muted/40 hover:bg-muted'
              } ${isDriveAndDisconnected ? 'opacity-70' : ''}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {tool.icon}
                  <span className="font-medium">{tool.name}</span>
                </div>
                {isDriveAndDisconnected ? (
                  <Button asChild size="sm" variant="ghost" className="px-2 h-7">
                    <Link to="/product-feeds">
                      <LogIn className="h-3 w-3 mr-1" /> Setup
                    </Link>
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant={isSelected ? "default" : "outline"}
                    className="px-2 h-7"
                    onClick={() => handleToolToggle(tool.id)}
                  >
                    {isSelected ? (
                      <><Check className="h-3 w-3 mr-1" /> On</>
                    ) : (
                      <><X className="h-3 w-3 mr-1" /> Off</>
                    )}
                  </Button>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {tool.description}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
