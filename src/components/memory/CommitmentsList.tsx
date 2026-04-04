import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, CheckCircle2, Clock, AlertCircle, Circle } from "lucide-react";
import { useState } from "react";
import { useCommitments, type Commitment } from "@/hooks/useRelationalMemory";
import { formatDistanceToNow, format } from "date-fns";

const statusIcons: Record<string, typeof Circle> = {
  open: Circle,
  in_progress: Clock,
  done: CheckCircle2,
  cancelled: AlertCircle,
};

const priorityColors: Record<string, string> = {
  low: "bg-muted text-muted-foreground",
  medium: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  high: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  urgent: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
};

export function CommitmentsList() {
  const [statusFilter, setStatusFilter] = useState("open");
  const { commitments, isLoading, error } = useCommitments({ status: statusFilter === "all" ? undefined : statusFilter });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-muted-foreground">
          {commitments.length} commitment{commitments.length !== 1 ? "s" : ""}
        </h3>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="done">Done</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading && (
        <div className="flex justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      )}

      {error && <p className="text-sm text-destructive text-center py-4">{error}</p>}

      {!isLoading && commitments.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-8">
          No commitments found. Commitments are created when the agent tracks promises, follow-ups, or open loops.
        </p>
      )}

      <div className="space-y-3">
        {commitments.map((c) => (
          <CommitmentCard key={c.id} commitment={c} />
        ))}
      </div>
    </div>
  );
}

function CommitmentCard({ commitment }: { commitment: Commitment }) {
  const StatusIcon = statusIcons[commitment.status] || Circle;
  const prioColor = priorityColors[commitment.priority] || priorityColors.medium;

  return (
    <Card className="hover:shadow-sm transition-shadow">
      <CardHeader className="pb-2 pt-4 px-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-2 min-w-0">
            <StatusIcon className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
            <CardTitle className="text-sm font-medium leading-snug">{commitment.title}</CardTitle>
          </div>
          <Badge variant="secondary" className={`text-xs shrink-0 ${prioColor}`}>
            {commitment.priority}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pb-3 px-4 pt-0">
        {commitment.description && (
          <p className="text-xs text-muted-foreground mb-2">{commitment.description}</p>
        )}
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="capitalize">{commitment.status.replace("_", " ")}</span>
          {commitment.due_at && (
            <span>Due {formatDistanceToNow(new Date(commitment.due_at), { addSuffix: true })}</span>
          )}
          <span>{formatDistanceToNow(new Date(commitment.created_at), { addSuffix: true })}</span>
        </div>
      </CardContent>
    </Card>
  );
}
