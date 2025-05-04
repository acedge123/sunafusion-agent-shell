
interface TaskResultStepsProps {
  steps: Array<{
    step: number;
    action: string;
    result: string;
  }>;
}

export const TaskResultSteps = ({ steps }: TaskResultStepsProps) => {
  return (
    <div className="space-y-4">
      {steps.map((step, index) => (
        <div key={index} className="rounded-md border p-4">
          <h4 className="font-medium">
            Step {step.step}: {step.action}
          </h4>
          <p className="text-sm text-muted-foreground mt-1">
            {step.result}
          </p>
        </div>
      ))}
    </div>
  );
};
