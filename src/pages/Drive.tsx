
import { DriveFileList } from "@/components/drive/DriveFileList"
import { useEffect, useState } from "react"

const Drive = () => {
  const [isLoading, setIsLoading] = useState(true)
  
  // Add a delay to allow the auth flow to complete and components to initialize
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1000)
    
    return () => clearTimeout(timer)
  }, [])
  
  return (
    <div className="container max-w-4xl mx-auto py-8">
      {isLoading ? (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        <DriveFileList />
      )}
    </div>
  )
}

export default Drive
