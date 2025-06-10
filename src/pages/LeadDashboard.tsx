
import React from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import LeadVisualization from "@/components/LeadVisualization";
import { Card, CardContent } from "@/components/ui/card";

const LeadDashboard = () => {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="container max-w-4xl mx-auto py-8">
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">Please log in to access the lead dashboard.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-6xl mx-auto py-8">
      <LeadVisualization />
    </div>
  );
};

export default LeadDashboard;
