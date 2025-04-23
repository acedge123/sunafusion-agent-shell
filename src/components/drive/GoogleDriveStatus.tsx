
import { Check } from "lucide-react"

export const GoogleDriveStatus = () => {
  return (
    <div className="bg-green-50 border border-green-200 p-3 rounded-md flex items-start gap-3 w-full">
      <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
      <div className="text-sm text-green-800">
        <p className="font-medium">Google Drive Connected</p>
        <p>Your Google Drive account has been successfully connected.</p>
      </div>
    </div>
  )
}
