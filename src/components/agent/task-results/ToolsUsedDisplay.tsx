
import { Wrench } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ToolsUsedDisplayProps {
  tools: string[];
}

export const ToolsUsedDisplay = ({ tools }: ToolsUsedDisplayProps) => {
  if (!tools || tools.length === 0) return null;

  return (
    <div className="flex items-center gap-2">
      <Wrench className="h-4 w-4 text-muted-foreground" />
      <div className="flex flex-wrap gap-1">
        {tools.map(tool => (
          <Badge key={tool} variant="secondary" className="text-xs">
            {tool}
          </Badge>
        ))}
      </div>
    </div>
  );
};
