
import ReactMarkdown from "react-markdown";

interface TaskResultReasoningProps {
  reasoning: string;
}

export const TaskResultReasoning = ({ reasoning }: TaskResultReasoningProps) => {
  return (
    <div className="prose prose-sm dark:prose-invert max-w-none">
      <ReactMarkdown>
        {reasoning}
      </ReactMarkdown>
    </div>
  );
};
