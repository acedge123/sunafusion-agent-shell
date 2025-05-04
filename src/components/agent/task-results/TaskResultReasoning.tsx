
interface TaskResultReasoningProps {
  reasoning: string;
}

export const TaskResultReasoning = ({ reasoning }: TaskResultReasoningProps) => {
  return (
    <div className="prose prose-sm dark:prose-invert max-w-none">
      {reasoning.split('\n').map((line, i) => (
        <p key={i}>{line}</p>
      ))}
    </div>
  );
};
