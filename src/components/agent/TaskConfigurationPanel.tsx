
import { ToolSelector } from "./ToolSelector";
import { ReasoningControls } from "./ReasoningControls";
import { DriveErrorAlert } from "@/components/drive/error/DriveErrorAlert";

interface TaskConfigurationPanelProps {
  selectedTools: string[];
  onToolToggle: (toolId: string) => void;
  driveConnected: boolean;
  reasoningLevel: "low" | "medium" | "high";
  onReasoningLevelChange: (level: "low" | "medium" | "high") => void;
  driveError: string | null;
  onDriveReconnect: () => void;
  showToolSelection?: boolean;
  showReasoningControls?: boolean;
}

export const TaskConfigurationPanel = ({
  selectedTools,
  onToolToggle,
  driveConnected,
  reasoningLevel,
  onReasoningLevelChange,
  driveError,
  onDriveReconnect,
  showToolSelection = true,
  showReasoningControls = true
}: TaskConfigurationPanelProps) => {
  return (
    <div className="space-y-4">
      {showToolSelection && (
        <ToolSelector 
          selectedTools={selectedTools}
          onToolToggle={onToolToggle}
          driveConnected={driveConnected}
        />
      )}
      
      <DriveErrorAlert 
        error={driveError} 
        onReconnect={onDriveReconnect}
      />
      
      {showReasoningControls && (
        <ReasoningControls
          reasoningLevel={reasoningLevel}
          onLevelChange={onReasoningLevelChange}
        />
      )}
    </div>
  );
};
