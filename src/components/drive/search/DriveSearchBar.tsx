
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, FileType } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { MIME_TYPE_FILTERS } from "../utils/driveConstants"

interface DriveSearchBarProps {
  searchQuery: string
  selectedMimeType: string
  loading: boolean
  onSearchQueryChange: (value: string) => void
  onMimeTypeChange: (value: string) => void
  onSearch: () => void
}

export const DriveSearchBar = ({
  searchQuery,
  selectedMimeType,
  loading,
  onSearchQueryChange,
  onMimeTypeChange,
  onSearch
}: DriveSearchBarProps) => {
  return (
    <div className="flex gap-2">
      <div className="flex-1">
        <Input
          placeholder="Search files..."
          value={searchQuery}
          onChange={(e) => onSearchQueryChange(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && onSearch()}
        />
      </div>
      <Select
        value={selectedMimeType}
        onValueChange={onMimeTypeChange}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="File type" />
        </SelectTrigger>
        <SelectContent>
          {Object.entries(MIME_TYPE_FILTERS).map(([label, value]) => (
            <SelectItem key={value} value={value}>
              <div className="flex items-center">
                <FileType className="h-4 w-4 mr-2" />
                {label}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button onClick={onSearch} disabled={loading}>
        <Search className="h-4 w-4 mr-2" />
        Search
      </Button>
    </div>
  )
}
