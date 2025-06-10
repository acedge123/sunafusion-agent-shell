
import React from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import LeadVisualization from "@/components/LeadVisualization";
import Navigation from "@/components/Navigation";
import { Card, CardContent } from "@/components/ui/card";

const LeadDashboard = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container max-w-6xl mx-auto py-8">
        {!user ? (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-muted-foreground">Please log in to access the lead dashboard.</p>
            </CardContent>
          </Card>
        ) : (
          <LeadVisualization />
        )}
      </div>
    </div>
  );
};

export default LeadDashboard;
