
import { Badge } from "@/components/ui/badge";
import { LockClosedIcon } from "@radix-ui/react-icons";

interface ToolSelectorProps {
  selectedTools: string[];
  onToolToggle: (toolId: string) => void;
  driveConnected: boolean;
}

type Tool = {
  id: string;
  name: string;
  description: string;
  disabled?: boolean;
  needsAuth?: boolean;
  authType?: "drive" | "slack";
};

export function ToolSelector({ selectedTools, onToolToggle, driveConnected }: ToolSelectorProps) {
  const availableTools: Tool[] = [
    {
      id: "web_search",
      name: "Web Search",
      description: "Search the web for real-time information"
    },
    {
      id: "file_search",
      name: "File Search",
      description: "Search through your Google Drive files",
      disabled: !driveConnected,
      needsAuth: true,
      authType: "drive"
    },
    {
      id: "file_analysis",
      name: "File Analysis",
      description: "Analyze the content of your Google Drive files",
      disabled: !driveConnected,
      needsAuth: true,
      authType: "drive"
    },
    {
      id: "slack_search",
      name: "Slack Search",
      description: "Search through your Slack messages and channels",
      disabled: true, // Disabled until Slack is connected
      needsAuth: true,
      authType: "slack"
    }
  ];

  return (
    <div className="space-y-3">
      <div className="text-sm font-medium">Available Tools</div>
      <div className="flex flex-wrap gap-2">
        {availableTools.map((tool) => {
          const isSelected = selectedTools.includes(tool.id);
          return (
            <div key={tool.id} className="relative">
              <Badge
                className={`px-3 py-1.5 text-xs cursor-pointer hover:bg-accent ${
                  isSelected
                    ? "bg-primary text-primary-foreground hover:bg-primary/90"
                    : "bg-secondary text-secondary-foreground"
                } ${tool.disabled ? "opacity-60 cursor-not-allowed" : ""}`}
                onClick={() => {
                  if (!tool.disabled) {
                    onToolToggle(tool.id);
                  }
                }}
              >
                {tool.name}
                {tool.needsAuth && !driveConnected && tool.authType === "drive" && (
                  <LockClosedIcon className="w-3 h-3 ml-1.5 inline-block" />
                )}
              </Badge>
              {tool.disabled && tool.needsAuth && (
                <div className="absolute -top-1 -right-1">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      <div className="text-xs text-muted-foreground">
        Select the tools you want the agent to use. Some tools require authentication.
      </div>
    </div>
  );
}
