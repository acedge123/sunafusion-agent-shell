
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { RefreshCw, AlertCircle, Check } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const GoogleDriveStatus = () => {
  const [tokenStatus, setTokenStatus] = useState<'checking' | 'valid' | 'invalid' | 'unknown'>('checking');
  const [isChecking, setIsChecking] = useState(false);
  const { toast } = useToast();

  const checkDriveToken = async () => {
    setIsChecking(true);
    setTokenStatus('checking');
    
    try {
      // First try to get token from session
      const { data: sessionData } = await supabase.auth.getSession();
      let accessToken = sessionData?.session?.provider_token;
      
      // If no token in session, try database
      if (!accessToken && sessionData?.session?.user) {
        const { data: tokenData } = await supabase
          .from('google_drive_access')
          .select('access_token')
          .eq('user_id', sessionData.session.user.id)
          .maybeSingle();
          
        accessToken = tokenData?.access_token;
      }
      
      if (!accessToken) {
        setTokenStatus('unknown');
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
        
        if (!data.scope || !data.scope.includes('drive')) {
          setTokenStatus('invalid');
          toast({
            variant: "destructive",
            title: "Token Scope Issue",
            description: "Your Google Drive token does not have the required scopes"
          });
        } else {
          setTokenStatus('valid');
          toast({
            title: "Token Valid",
            description: "Your Google Drive connection is working correctly"
          });
        }
      } else {
        setTokenStatus('invalid');
        toast({
          variant: "destructive",
          title: "Invalid Token",
          description: "Your Google Drive token is invalid or expired"
        });
      }
    } catch (error) {
      console.error("Error checking token:", error);
      setTokenStatus('unknown');
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
      <div className="flex justify-between items-center">
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
        
        <Button 
          variant="outline" 
          size="sm" 
          onClick={checkDriveToken}
          disabled={isChecking}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isChecking ? 'animate-spin' : ''}`} />
          Check Status
        </Button>
      </div>
    </div>
  );
};
