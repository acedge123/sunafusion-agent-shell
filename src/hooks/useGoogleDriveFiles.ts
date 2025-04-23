
import { useState, useEffect } from 'react'
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/components/ui/use-toast"

export interface DriveFile {
  id: string
  name: string
  mimeType: string
}

export const useGoogleDriveFiles = () => {
  const [files, setFiles] = useState<DriveFile[]>([])
  const [loading, setLoading] = useState(false)
  const [analyzing, setAnalyzing] = useState<string | null>(null)
  const { toast } = useToast()

  const fetchFiles = async () => {
    setLoading(true)
    try {
      const { data: userData, error: userError } = await supabase.auth.getUser()
      
      if (userError) {
        console.error("Error getting user:", userError);
        throw new Error("User not authenticated")
      }
      
      if (!userData.user) {
        throw new Error("User not authenticated")
      }
      
      // First get the session to check for provider_token
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError) {
        console.error("Error getting session:", sessionError);
      }
      
      let accessToken = sessionData?.session?.provider_token
      
      console.log("Provider token from session:", !!accessToken);
      
      // Always store the provider token if we have it - this ensures the token is available for other components
      if (accessToken && userData.user.id) {
        try {
          console.log("Storing provider token from session to database");
          
          // Using INSERT instead of UPSERT since there's a missing unique constraint
          // First check if the record exists
          const { data: existingRecord, error: queryError } = await supabase
            .from('google_drive_access')
            .select('id')
            .eq('user_id', userData.user.id)
            .maybeSingle();
          
          if (queryError) {
            console.error("Error checking for existing record:", queryError);
          }
          
          if (existingRecord) {
            // Update existing record
            const { error: updateError } = await supabase
              .from('google_drive_access')
              .update({
                access_token: accessToken,
                token_expires_at: new Date(Date.now() + 3600 * 1000).toISOString(),
                updated_at: new Date().toISOString()
              })
              .eq('user_id', userData.user.id);
            
            if (updateError) {
              console.error("Error updating Google Drive token:", updateError);
            } else {
              console.log("Successfully updated Google Drive token");
            }
          } else {
            // Insert new record
            const { error: insertError } = await supabase
              .from('google_drive_access')
              .insert({
                user_id: userData.user.id,
                access_token: accessToken,
                token_expires_at: new Date(Date.now() + 3600 * 1000).toISOString(),
                updated_at: new Date().toISOString()
              });
            
            if (insertError) {
              console.error("Error inserting Google Drive token:", insertError);
            } else {
              console.log("Successfully inserted Google Drive token");
            }
          }
        } catch (storeError) {
          console.error("Error in token storage:", storeError);
        }
      }
      
      // If no provider token available, try to get from the database
      if (!accessToken) {
        console.log("No provider token in session, checking database");
        const { data: accessData, error: accessError } = await supabase
          .from('google_drive_access')
          .select('access_token')
          .eq('user_id', userData.user.id)
          .maybeSingle()
        
        if (accessError) {
          console.error("Error retrieving token from database:", accessError);
        } else {
          accessToken = accessData?.access_token;
          if (accessToken) {
            console.log("Retrieved access token from database");
          } else {
            console.log("No access token found in database");
          }
        }
      }

      if (accessToken) {
        console.log("Making request to Google Drive API");
        try {
          // First validate the token
          const validationResponse = await fetch('https://www.googleapis.com/oauth2/v3/tokeninfo?access_token=' + accessToken);
          
          if (!validationResponse.ok) {
            const validationErrorText = await validationResponse.text();
            console.error(`Token validation failed: ${validationErrorText}`);
            throw new Error(`Invalid Google Drive token. Validation failed: ${validationResponse.status} ${validationResponse.statusText}`);
          }
          
          const validationData = await validationResponse.json();
          console.log('Token validation response scope:', validationData.scope);
          
          // Now make the actual files request - removed orderBy parameter that was causing issues
          const response = await fetch('https://www.googleapis.com/drive/v3/files?fields=files(id,name,mimeType)', {
            headers: {
              'Authorization': `Bearer ${accessToken}`
            }
          })
          
          if (!response.ok) {
            const errorText = await response.text();
            console.error(`Google API error (${response.status}): ${errorText}`);
            
            if (response.status === 401) {
              toast({
                variant: "destructive",
                title: "Authentication Error",
                description: "Your Google Drive access token has expired. Please reconnect your Google Drive."
              });
            } else if (response.status === 403) {
              toast({
                variant: "destructive",
                title: "Permission Error",
                description: "You don't have permission to access Google Drive. Please reconnect with proper permissions."
              });
            } else {
              toast({
                variant: "destructive",
                title: "Google Drive Error",
                description: `Error accessing Google Drive: ${response.status} ${response.statusText}`
              });
            }
            
            throw new Error(`Google Drive API error: ${response.status} ${response.statusText} - ${errorText}`)
          }
          
          const data = await response.json()
          console.log(`Received ${data.files?.length || 0} files from Google Drive`);
          setFiles(data.files || [])
        } catch (apiError) {
          console.error("Error calling Google Drive API:", apiError);
          toast({
            variant: "destructive",
            title: "API Error",
            description: apiError instanceof Error ? apiError.message : "Failed to fetch files from Google Drive"
          });
          setFiles([]);
        }
      } else {
        console.log("No access token found")
        setFiles([])
        toast({
          variant: "destructive",
          title: "Authorization Required",
          description: "Please connect your Google Drive account to access your files."
        });
      }
    } catch (error) {
      console.error("Error fetching files:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch files. Please reconnect your Google Drive."
      })
      setFiles([]);
    } finally {
      setLoading(false)
    }
  }

  const analyzeFile = async (fileId: string) => {
    setAnalyzing(fileId)
    try {
      // Get the current session for the auth token
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError) {
        console.error("Error getting session:", sessionError);
        throw new Error("Failed to get authentication session");
      }
      
      const authToken = sessionData?.session?.access_token
      const providerToken = sessionData?.session?.provider_token
      
      console.log("AnalyzeFile: Provider token available from session:", !!providerToken);
      
      // If no provider token in session, try to get from database
      let storedToken = null;
      if (sessionData?.session?.user) {
        try {
          const { data: tokenData, error: tokenError } = await supabase
            .from('google_drive_access')
            .select('access_token')
            .eq('user_id', sessionData.session.user.id)
            .maybeSingle();
            
          if (tokenError) {
            console.error("AnalyzeFile: Error querying token from database:", tokenError);
          } else {
            storedToken = tokenData?.access_token;
            console.log("AnalyzeFile: Retrieved stored token from database:", !!storedToken);
          }
        } catch (dbError) {
          console.error("AnalyzeFile: Error retrieving token from database:", dbError);
        }
      }

      // Store the token if we have it
      if (providerToken && sessionData?.session?.user?.id) {
        try {
          // First check if the record exists
          const { data: existingRecord, error: queryError } = await supabase
            .from('google_drive_access')
            .select('id')
            .eq('user_id', sessionData.session.user.id)
            .maybeSingle();
          
          if (queryError) {
            console.error("Error checking for existing record:", queryError);
          }
          
          if (existingRecord) {
            // Update existing record
            const { error: updateError } = await supabase
              .from('google_drive_access')
              .update({
                access_token: providerToken,
                token_expires_at: new Date(Date.now() + 3600 * 1000).toISOString(),
                updated_at: new Date().toISOString()
              })
              .eq('user_id', sessionData.session.user.id);
            
            if (updateError) {
              console.error("Error updating Google Drive token:", updateError);
            } else {
              console.log("Successfully updated Google Drive token for future use");
            }
          } else {
            // Insert new record
            const { error: insertError } = await supabase
              .from('google_drive_access')
              .insert({
                user_id: sessionData.session.user.id,
                access_token: providerToken,
                token_expires_at: new Date(Date.now() + 3600 * 1000).toISOString(),
                updated_at: new Date().toISOString()
              });
            
            if (insertError) {
              console.error("Error inserting Google Drive token:", insertError);
            } else {
              console.log("Successfully inserted Google Drive token for future use");
            }
          }
        } catch (storeError) {
          console.error("Error in token storage:", storeError);
        }
      }
      
      // Use either the provider token or stored token, with proper debug info
      const response = await supabase.functions.invoke('drive-ai-assistant', {
        body: {
          action: "Please analyze this document and provide a summary.",
          fileId,
          provider_token: providerToken || storedToken,
          debug_token_info: {
            hasProviderToken: !!providerToken,
            hasStoredToken: !!storedToken,
            userHasSession: !!sessionData?.session,
            tokenSource: providerToken ? 'provider_token' : (storedToken ? 'database' : 'none')
          }
        },
        headers: authToken ? {
          Authorization: `Bearer ${authToken}`
        } : undefined
      })

      if (response.error) throw response.error

      toast({
        title: "Analysis Complete",
        description: response.data.result
      })
    } catch (error) {
      console.error("Error analyzing file:", error);
      toast({
        variant: "destructive",
        title: "Analysis Failed",
        description: error instanceof Error ? error.message : "An unexpected error occurred"
      })
    } finally {
      setAnalyzing(null)
    }
  }

  return {
    files,
    loading,
    analyzing,
    fetchFiles,
    analyzeFile
  }
}
