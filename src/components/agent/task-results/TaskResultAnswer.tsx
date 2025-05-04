
interface TaskResultAnswerProps {
  answer: string;
}

export const TaskResultAnswer = ({ answer }: TaskResultAnswerProps) => {
  return (
    <div className="prose prose-sm dark:prose-invert max-w-none">
      {answer.split('\n').map((line, i) => (
        <p key={i}>{line}</p>
      ))}
    </div>
  );
};
