
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { RefreshCw, AlertCircle, Check, AlertTriangle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const GoogleDriveStatus = () => {
  const [tokenStatus, setTokenStatus] = useState<'checking' | 'valid' | 'invalid' | 'unknown'>('checking');
  const [scopeStatus, setScopeStatus] = useState<'checking' | 'valid' | 'invalid' | 'unknown'>('checking');
  const [isChecking, setIsChecking] = useState(false);
  const { toast } = useToast();

  const checkDriveToken = async () => {
    setIsChecking(true);
    setTokenStatus('checking');
    setScopeStatus('checking');
    
    try {
      // First try to get token from session
      const { data: sessionData } = await supabase.auth.getSession();
      let accessToken = sessionData?.session?.provider_token;
      
      // If no token in session, try database
      if (!accessToken && sessionData?.session?.user) {
        try {
          const { data: tokenData } = await supabase
            .from('google_drive_access')
            .select('access_token')
            .eq('user_id', sessionData.session.user.id)
            .maybeSingle();
            
          accessToken = tokenData?.access_token;
        } catch (dbError) {
          console.error('Error retrieving token from database:', dbError);
        }
      }
      
      if (!accessToken) {
        setTokenStatus('unknown');
        setScopeStatus('unknown');
        toast({
          variant: "destructive",
          title: "No Access Token",
          description: "Could not find a Google Drive access token"
        });
        return;
      }
      
      // Validate token
      const response = await fetch('https://www.googleapis.com/oauth2/v3/tokeninfo?access_token=' + accessToken);
      
      if (response.ok) {
        const data = await response.json();
        console.log("Token validation response:", data);
        setTokenStatus('valid');
        
        // Check for required scopes
        const hasReadScope = data.scope && (
          data.scope.includes('https://www.googleapis.com/auth/drive.readonly') || 
          data.scope.includes('https://www.googleapis.com/auth/drive')
        );
        const hasMetadataScope = data.scope && data.scope.includes('https://www.googleapis.com/auth/drive.metadata.readonly');
        const hasFileScope = data.scope && data.scope.includes('https://www.googleapis.com/auth/drive.file');
        
        if (!hasReadScope || !hasMetadataScope || !hasFileScope) {
          setScopeStatus('invalid');
          toast({
            variant: "default", // Changed from "warning"
            title: "Token Scope Issue",
            description: "Your Google Drive token is missing some required scopes. Consider reconnecting."
          });
        } else {
          setScopeStatus('valid');
          toast({
            title: "Token Valid",
            description: "Your Google Drive connection is working correctly"
          });
        }
        
        // Test API call
        try {
          const filesResponse = await fetch('https://www.googleapis.com/drive/v3/files?fields=files(id,name,mimeType)&pageSize=1', {
            headers: {
              'Authorization': `Bearer ${accessToken}`
            }
          });
          
          if (!filesResponse.ok) {
            console.error(`API test failed: ${filesResponse.status} ${filesResponse.statusText}`);
            const errorText = await filesResponse.text();
            console.error(`API error: ${errorText}`);
            
            toast({
              variant: "destructive", // Changed from "warning"
              title: "API Access Issue",
              description: `API call test failed: ${filesResponse.status} ${filesResponse.statusText}`
            });
          } else {
            const filesData = await filesResponse.json();
            console.log(`API test returned ${filesData.files?.length || 0} files`);
            
            toast({
              variant: "default",
              title: "API Access Confirmed",
              description: "Successfully accessed Google Drive API"
            });
          }
        } catch (apiError) {
          console.error("API test error:", apiError);
        }
        
      } else {
        setTokenStatus('invalid');
        setScopeStatus('unknown');
        toast({
          variant: "destructive",
          title: "Invalid Token",
          description: "Your Google Drive token is invalid or expired"
        });
      }
    } catch (error) {
      console.error("Error checking token:", error);
      setTokenStatus('unknown');
      setScopeStatus('unknown');
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not verify Google Drive token status"
      });
    } finally {
      setIsChecking(false);
    }
  };
  
  // Check token on mount
  useEffect(() => {
    checkDriveToken();
  }, []);
  
  return (
    <div className="p-4 bg-muted/40 rounded-lg">
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          {tokenStatus === 'valid' && (
            <Check className="text-green-500 h-5 w-5" />
          )}
          {tokenStatus === 'invalid' && (
            <AlertCircle className="text-red-500 h-5 w-5" />
          )}
          {(tokenStatus === 'checking' || tokenStatus === 'unknown') && (
            <div className="h-5 w-5 rounded-full border-2 border-muted-foreground/20"></div>
          )}
          
          <div>
            <p className="font-medium">
              {tokenStatus === 'valid' && "Google Drive Connected"}
              {tokenStatus === 'invalid' && "Google Drive Connection Invalid"}
              {tokenStatus === 'checking' && "Checking Connection..."}
              {tokenStatus === 'unknown' && "Connection Status Unknown"}
            </p>
            <p className="text-xs text-muted-foreground">
              {tokenStatus === 'valid' && "Your account is successfully connected to Google Drive"}
              {tokenStatus === 'invalid' && "Your connection has expired or is invalid. Please reconnect."}
              {tokenStatus === 'checking' && "Verifying your Google Drive connection..."}
              {tokenStatus === 'unknown' && "Could not determine connection status"}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {scopeStatus === 'valid' && (
            <Check className="text-green-500 h-5 w-5" />
          )}
          {scopeStatus === 'invalid' && (
            <AlertTriangle className="text-amber-500 h-5 w-5" />
          )}
          {(scopeStatus === 'checking' || scopeStatus === 'unknown') && (
            <div className="h-5 w-5 rounded-full border-2 border-muted-foreground/20"></div>
          )}
          
          <div>
            <p className="font-medium">
              {scopeStatus === 'valid' && "Access Permissions Valid"}
              {scopeStatus === 'invalid' && "Limited Permissions"}
              {scopeStatus === 'checking' && "Checking Permissions..."}
              {scopeStatus === 'unknown' && "Permission Status Unknown"}
            </p>
            <p className="text-xs text-muted-foreground">
              {scopeStatus === 'valid' && "Your connection has all required permissions"}
              {scopeStatus === 'invalid' && "Some required permissions are missing. Consider reconnecting."}
              {scopeStatus === 'checking' && "Verifying access permissions..."}
              {scopeStatus === 'unknown' && "Could not determine permission status"}
            </p>
          </div>
        </div>
        
        <Button 
          variant="outline" 
          size="sm" 
          onClick={checkDriveToken}
          disabled={isChecking}
          className="self-end mt-2"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isChecking ? 'animate-spin' : ''}`} />
          Check Status
        </Button>
      </div>
    </div>
  );
};
