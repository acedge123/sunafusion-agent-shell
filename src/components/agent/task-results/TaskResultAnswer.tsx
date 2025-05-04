
import { ReactMarkdown } from "react-markdown/lib/react-markdown";

interface TaskResultAnswerProps {
  answer: string;
}

export const TaskResultAnswer = ({ answer }: TaskResultAnswerProps) => {
  return (
    <div className="prose prose-sm dark:prose-invert max-w-none">
      <ReactMarkdown>
        {answer}
      </ReactMarkdown>
    </div>
  );
};
