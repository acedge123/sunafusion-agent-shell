
import { AlertTriangle, ExternalLink } from "lucide-react"

interface GoogleDriveConfigGuideProps {
  hasRedirectError: boolean
  productionDomain: string
}

export const GoogleDriveConfigGuide = ({ hasRedirectError, productionDomain }: GoogleDriveConfigGuideProps) => {
  const currentDomain = window.location.origin

  return (
    <div className="space-y-2 text-xs text-muted-foreground mt-1">
      {hasRedirectError && (
        <div className="bg-amber-50 border border-amber-200 p-3 rounded-md flex items-start gap-3 w-full">
          <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-amber-800">
            <p className="font-medium mb-1">Redirect URL Issue Detected</p>
            <p>Your OAuth flow seems to be redirecting to localhost instead of your app's URL.</p>
            <p className="mt-2 font-medium">To fix this:</p>
            <ol className="list-decimal list-inside pl-2 space-y-1">
              <li>Go to your Supabase Authentication settings</li>
              <li>Verify Site URL is set to: <code className="bg-amber-100 px-1 rounded">{currentDomain}</code></li>
              <li>Add <code className="bg-amber-100 px-1 rounded">{currentDomain}/drive</code> to Redirect URLs</li>
            </ol>
          </div>
        </div>
      )}
      
      <p>Make sure you've enabled the Google provider in your Supabase project</p>
      <p>Current URL: <code className="bg-muted px-1 rounded text-xs">{currentDomain}</code></p>
      <p>Production URL: <code className="bg-muted px-1 rounded text-xs">https://{productionDomain}</code></p>
      <p>Add both URLs as authorized JavaScript origins in Google Cloud Console</p>
      <p>Redirect URLs for Google Cloud:</p>
      <ul className="list-disc list-inside pl-2">
        <li><code className="bg-muted px-1 rounded text-xs">{`${currentDomain}/drive`}</code></li>
        <li><code className="bg-muted px-1 rounded text-xs">{`https://${productionDomain}/drive`}</code></li>
      </ul>
      <div className="bg-muted/50 p-2 rounded-md mt-3">
        <p className="font-medium mb-1">⚠️ Important: Supabase URL Configuration</p>
        <p>Make sure to set these in Supabase Authentication settings:</p>
        <ul className="list-disc list-inside pl-2">
          <li>Site URL: <code className="bg-muted px-1 rounded text-xs">{currentDomain}</code></li>
          <li>Redirect URLs:</li>
          <ul className="list-disc list-inside pl-5">
            <li><code className="bg-muted px-1 rounded text-xs">{`${currentDomain}/drive`}</code></li>
            <li><code className="bg-muted px-1 rounded text-xs">{`https://${productionDomain}/drive`}</code></li>
          </ul>
        </ul>
      </div>
      <p className="pt-2 flex gap-2">
        <a 
          href="https://console.cloud.google.com/apis/credentials" 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center text-blue-500 hover:underline"
        >
          Open Google Cloud Console <ExternalLink className="ml-1 h-3 w-3" />
        </a>
        <a 
          href="https://supabase.com/dashboard/project/nljlsqgldgmxlbylqazg/auth/providers" 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center text-blue-500 hover:underline"
        >
          Supabase Auth Settings <ExternalLink className="ml-1 h-3 w-3" />
        </a>
      </p>
    </div>
  )
}
