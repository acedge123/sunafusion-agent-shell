import { Button } from "@/components/ui/button"
import { Database, GitBranch, Webhook, Zap, Lightbulb } from "lucide-react"

interface OperatorButtonsProps {
  onSelectQuery: (query: string) => void
}

const OPERATOR_QUERIES = [
  {
    icon: GitBranch,
    label: "What repo owns X?",
    query: "What repo owns"
  },
  {
    icon: Database,
    label: "What breaks if we change table Y?",
    query: "What breaks if we change table"
  },
  {
    icon: Webhook,
    label: "Where is webhook handling?",
    query: "Where is webhook handling"
  },
  {
    icon: Zap,
    label: "Which repos use CreatorIQ?",
    query: "Which repos use CreatorIQ"
  },
  {
    icon: Lightbulb,
    label: "Suggest next integrations",
    query: "Suggest next integrations based on our current setup"
  }
]

export default function OperatorButtons({ onSelectQuery }: OperatorButtonsProps) {
  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {OPERATOR_QUERIES.map((op, idx) => {
        const Icon = op.icon
        return (
          <Button
            key={idx}
            variant="outline"
            size="sm"
            onClick={() => onSelectQuery(op.query)}
            className="text-xs"
          >
            <Icon className="h-3 w-3 mr-1.5" />
            {op.label}
          </Button>
        )
      })}
    </div>
  )
}
