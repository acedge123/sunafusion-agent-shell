
import React from "react";
import { 
  Settings,
  MoreVertical,
  MinusCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface AgentHeaderProps {
  agentName: string;
  agentImage?: string;
  onSettings?: () => void;
  onMinimize?: () => void;
  className?: string;
}

const AgentHeader: React.FC<AgentHeaderProps> = ({ 
  agentName, 
  agentImage,
  onSettings,
  onMinimize,
  className 
}) => {
  return (
    <header className={`flex items-center justify-between p-4 bg-background border-b ${className}`}>
      <div className="flex items-center gap-2">
        {agentImage && (
          <div className="h-8 w-8 rounded-full overflow-hidden bg-muted">
            <img 
              src={agentImage} 
              alt={agentName} 
              className="h-full w-full object-cover"
            />
          </div>
        )}
        <h1 className="text-lg font-medium">{agentName}</h1>
      </div>

      <div className="flex items-center gap-2">
        {onMinimize && (
          <Button variant="ghost" size="icon" onClick={onMinimize}>
            <MinusCircle className="h-5 w-5" />
            <span className="sr-only">Minimize</span>
          </Button>
        )}
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-5 w-5" />
              <span className="sr-only">More options</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onSettings}>
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Clear conversation</DropdownMenuItem>
            <DropdownMenuItem>Export conversation</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default AgentHeader;
