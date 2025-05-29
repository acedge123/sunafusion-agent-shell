
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cleanupAuthState, forceSignOut } from "@/utils/authCleanup";

const Auth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [isResetMode, setIsResetMode] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleCompleteCleanup = async () => {
    try {
      console.log('Starting complete auth cleanup...');
      
      // Clear all storage
      cleanupAuthState();
      
      // Clear additional browser storage
      try {
        // Clear all cookies
        document.cookie.split(";").forEach((c) => {
          const eqPos = c.indexOf("=");
          const name = eqPos > -1 ? c.substr(0, eqPos) : c;
          document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
          document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=." + window.location.hostname;
        });
      } catch (e) {
        console.log('Cookie cleanup failed (continuing anyway):', e);
      }

      // Force sign out
      await forceSignOut(supabase);
      
      // Clear any cached data
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map(name => caches.delete(name)));
      }
      
      toast({
        title: "Storage Cleared",
        description: "All auth data has been cleared. Try signing up again.",
      });
      
    } catch (error) {
      console.error('Cleanup error:', error);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter your email address.",
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth?reset=true`,
      });
      
      if (error) throw error;
      
      toast({
        title: "Password Reset Email Sent",
        description: "Check your email for password reset instructions.",
      });
      setIsResetMode(false);
    } catch (error: any) {
      console.error("Password reset error:", error);
      toast({
        variant: "destructive",
        title: "Password Reset Error",
        description: error.message || "Failed to send password reset email",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter both email and password.",
      });
      return;
    }

    if (password.length < 6) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Password must be at least 6 characters long.",
      });
      return;
    }

    setLoading(true);

    try {
      // Clean up any existing auth state first
      cleanupAuthState();
      await forceSignOut(supabase);
      
      // Wait a moment for cleanup to complete
      await new Promise(resolve => setTimeout(resolve, 100));

      if (isSignUp) {
        console.log('Attempting signup for:', email);
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });
        
        if (error) throw error;
        
        if (data.user) {
          toast({
            title: "Success!",
            description: "Account created successfully. You can now sign in.",
          });
          setIsSignUp(false);
          setPassword(""); // Clear password for security
        }
      } else {
        console.log('Attempting signin for:', email);
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (error) throw error;
        
        if (data.user && data.session) {
          console.log('Sign in successful for:', email);
          toast({
            title: "Success!",
            description: "Signed in successfully.",
          });
          
          // Force a complete page refresh to ensure clean state
          window.location.href = "/";
          return;
        }
      }
    } catch (error: any) {
      console.error("Auth error:", error);
      
      let errorMessage = "An unexpected error occurred.";
      
      if (error.message?.includes("Invalid login credentials")) {
        errorMessage = "Invalid email or password. Please check your credentials and try again.";
      } else if (error.message?.includes("Email not confirmed")) {
        errorMessage = "Please check your email and click the confirmation link before signing in.";
      } else if (error.message?.includes("User already registered")) {
        errorMessage = "An account with this email already exists. Try signing in instead, or use the 'Clear All Data' button if you're having issues.";
        setIsSignUp(false);
      } else if (error.message?.includes("signup is disabled")) {
        errorMessage = "Account creation is currently disabled. Please contact support.";
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        variant: "destructive",
        title: "Authentication Error",
        description: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    setIsSignUp(!isSignUp);
    setIsResetMode(false);
    setPassword(""); // Clear password when switching modes
  };

  const switchToReset = () => {
    setIsResetMode(true);
    setIsSignUp(false);
    setPassword("");
  };

  const switchToAuth = () => {
    setIsResetMode(false);
  };

  if (isResetMode) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Reset Password</CardTitle>
            <p className="text-muted-foreground text-center">
              Enter your email to receive password reset instructions
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordReset} className="space-y-4">
              <div>
                <Input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                  autoComplete="email"
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Sending..." : "Send Reset Email"}
              </Button>
            </form>

            <div className="text-center mt-4 space-y-2">
              <button
                type="button"
                onClick={switchToAuth}
                className="text-sm text-muted-foreground hover:text-primary"
                disabled={loading}
              >
                Back to sign in
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">
            {isSignUp ? "Create Account" : "Welcome Back"}
          </CardTitle>
          <p className="text-muted-foreground text-center">
            {isSignUp ? "Sign up to get started" : "Sign in to continue"}
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAuth} className="space-y-4">
            <div>
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                autoComplete="email"
              />
            </div>
            <div>
              <Input
                type="password"
                placeholder="Password (min 6 characters)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                disabled={loading}
                autoComplete={isSignUp ? "new-password" : "current-password"}
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Loading..." : isSignUp ? "Sign Up" : "Sign In"}
            </Button>
          </form>

          <div className="text-center mt-4 space-y-2">
            <button
              type="button"
              onClick={switchMode}
              className="text-sm text-muted-foreground hover:text-primary block w-full"
              disabled={loading}
            >
              {isSignUp ? "Already have an account? Sign in" : "Need an account? Sign up"}
            </button>
            
            {!isSignUp && (
              <button
                type="button"
                onClick={switchToReset}
                className="text-sm text-muted-foreground hover:text-primary block w-full"
                disabled={loading}
              >
                Forgot your password?
              </button>
            )}

            <div className="border-t pt-4 mt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleCompleteCleanup}
                className="w-full text-xs"
                disabled={loading}
              >
                Clear All Auth Data (If Having Issues)
              </Button>
              <p className="text-xs text-muted-foreground mt-2 text-center">
                Use this if you're getting "account exists" errors
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
