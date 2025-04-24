
import { Badge } from "@/components/ui/badge";
import { Search, FileSearch, FileText } from "lucide-react";

interface Tool {
  id: string;
  name: string;
  icon: JSX.Element;
}

interface ToolSelectorProps {
  selectedTools: string[];
  onToolToggle: (toolId: string) => void;
}

export const ToolSelector = ({ selectedTools, onToolToggle }: ToolSelectorProps) => {
  const availableTools: Tool[] = [
    { id: "web_search", name: "Web Search", icon: <Search className="h-4 w-4" /> },
    { id: "file_search", name: "Drive Search", icon: <FileSearch className="h-4 w-4" /> },
    { id: "file_analysis", name: "File Analysis", icon: <FileText className="h-4 w-4" /> },
  ];

  return (
    <div className="space-y-2">
      <div className="text-sm font-medium">Tools to use:</div>
      <div className="flex flex-wrap gap-2">
        {availableTools.map(tool => (
          <Badge 
            key={tool.id}
            variant={selectedTools.includes(tool.id) ? "default" : "outline"} 
            className="cursor-pointer"
            onClick={() => onToolToggle(tool.id)}
          >
            <span className="mr-1">{tool.icon}</span>
            {tool.name}
          </Badge>
        ))}
      </div>
    </div>
  );
};
