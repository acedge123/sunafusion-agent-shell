
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Loader2, CornerDownLeft } from "lucide-react";

interface TaskInputProps {
  onSubmit: (task: string) => void;
  isProcessing: boolean;
  initialTask?: string;
}

export const TaskInput = ({ onSubmit, isProcessing, initialTask = "" }: TaskInputProps) => {
  const [task, setTask] = useState(initialTask);

  const handleSubmit = () => {
    if (!task.trim() || isProcessing) return;
    onSubmit(task);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && e.ctrlKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="space-y-4">
      <Textarea
        value={task}
        onChange={(e) => setTask(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Describe your task in detail... (e.g., 'Find recent articles about climate change and summarize the main points')"
        disabled={isProcessing}
        className="min-h-[120px]"
      />
      <Button 
        onClick={handleSubmit} 
        disabled={!task.trim() || isProcessing}
        className="w-full"
      >
        {isProcessing ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Running task...
          </>
        ) : (
          <>
            <Send className="mr-2 h-4 w-4" />
            Run Task
          </>
        )}
      </Button>
    </div>
  );
};
