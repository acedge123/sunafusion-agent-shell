
import { Button } from "@/components/ui/button";
import { Brain } from "lucide-react";

interface ReasoningControlsProps {
  reasoningLevel: "low" | "medium" | "high";
  onLevelChange: (level: "low" | "medium" | "high") => void;
}

export const ReasoningControls = ({ reasoningLevel, onLevelChange }: ReasoningControlsProps) => {
  return (
    <div className="space-y-2">
      <div className="text-sm font-medium">Thinking level:</div>
      <div className="flex items-center gap-2">
        <Button 
          variant={reasoningLevel === "low" ? "default" : "outline"}
          size="sm"
          onClick={() => onLevelChange("low")}
          className="flex items-center gap-1"
        >
          <Brain className="h-4 w-4" />
          Basic
        </Button>
        <Button 
          variant={reasoningLevel === "medium" ? "default" : "outline"}
          size="sm"
          onClick={() => onLevelChange("medium")}
          className="flex items-center gap-1"
        >
          <Brain className="h-4 w-4" />
          Standard
        </Button>
        <Button 
          variant={reasoningLevel === "high" ? "default" : "outline"}
          size="sm"
          onClick={() => onLevelChange("high")}
          className="flex items-center gap-1"
        >
          <Brain className="h-4 w-4" />
          Detailed
        </Button>
      </div>
    </div>
  );
};
