
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/components/auth/AuthProvider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { cleanupAuthState, forceSignOut } from "@/utils/authCleanup";

const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!loading && !user) {
      console.log('No user found, redirecting to auth');
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  const handleSignOut = async () => {
    try {
      console.log('Signing out user:', user?.email);
      
      // Clean up auth state first
      cleanupAuthState();
      
      // Attempt to sign out
      await forceSignOut(supabase);
      
      toast({
        title: "Signed out",
        description: "You have been signed out successfully.",
      });
      
      // Force a complete page refresh for clean state
      window.location.href = "/auth";
    } catch (error: any) {
      console.error('Sign out error:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to sign out",
      });
      
      // Even if sign out fails, redirect to auth page
      window.location.href = "/auth";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to auth page
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Product Feed Manager</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              Welcome, {user.email}
            </span>
            <Button variant="outline" onClick={handleSignOut}>
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow" 
                onClick={() => navigate("/product-feeds")}>
            <CardHeader>
              <CardTitle>Product Feeds</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Manage your product feeds and companies
              </p>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow" 
                onClick={() => navigate("/drive")}>
            <CardHeader>
              <CardTitle>Google Drive</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Access and analyze your Google Drive files
              </p>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow" 
                onClick={() => navigate("/agent")}>
            <CardHeader>
              <CardTitle>AI Agent</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Interact with AI agents and tools
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Index;
