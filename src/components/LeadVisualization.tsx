
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RefreshCw, Clock, User, Mail, Phone, DollarSign } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

interface Lead {
  id: string;
  last_name: string;
  email: string;
  phone: string;
  loan_type: string;
  property_value: number | null;
  credit_score_range: string | null;
  purchase_timeframe: string | null;
  created_at: string;
}

const LeadVisualization = () => {
  const [recentLeads, setRecentLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const { toast } = useToast();

  const fetchRecentLeads = async () => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) {
        throw error;
      }

      setRecentLeads(data || []);
      setLastRefresh(new Date());
    } catch (error) {
      console.error("Error fetching recent leads:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch recent leads"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRecentLeads();
    
    // Set up real-time subscription for new leads
    const subscription = supabase
      .channel('leads-changes')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'leads'
      }, (payload) => {
        console.log('New lead received:', payload);
        const newLead = payload.new as Lead;
        setRecentLeads(prev => [newLead, ...prev.slice(0, 9)]);
        toast({
          title: "New Lead Received!",
          description: `${newLead.last_name} - ${newLead.email}`
        });
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const formatCurrency = (value: number | null) => {
    if (!value) return "N/A";
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const getLoanTypeBadgeColor = (loanType: string) => {
    switch (loanType) {
      case "Home Purchase":
      case "Buy a new home":
        return "bg-blue-100 text-blue-800";
      case "Refinance":
        return "bg-green-100 text-green-800";
      case "Investment Property":
        return "bg-purple-100 text-purple-800";
      case "Jumbo Loan":
        return "bg-orange-100 text-orange-800";
      case "HELOC":
        return "bg-red-100 text-red-800";
      case "Just exploring":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Lead Data Visualization</h2>
          <p className="text-muted-foreground">
            Real-time view of leads received from ManyChat and other sources
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            Last updated: {format(lastRefresh, 'HH:mm:ss')}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchRecentLeads}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Recent Lead Submissions ({recentLeads.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentLeads.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No leads received yet. The endpoint is ready to receive data from ManyChat.
            </div>
          ) : (
            <div className="space-y-4">
              {recentLeads.map((lead) => (
                <div
                  key={lead.id}
                  className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold">{lead.last_name}</h3>
                      <div className="text-sm text-muted-foreground">
                        {format(new Date(lead.created_at), 'MMM d, yyyy • h:mm a')}
                      </div>
                    </div>
                    <Badge className={getLoanTypeBadgeColor(lead.loan_type)}>
                      {lead.loan_type}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span>{lead.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{lead.phone}</span>
                    </div>
                    {lead.property_value && (
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <span>{formatCurrency(lead.property_value)}</span>
                      </div>
                    )}
                  </div>
                  
                  {(lead.credit_score_range || lead.purchase_timeframe) && (
                    <div className="mt-3 pt-3 border-t grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                      {lead.credit_score_range && (
                        <div>
                          <span className="font-medium">Credit Score: </span>
                          <span>{lead.credit_score_range}</span>
                        </div>
                      )}
                      {lead.purchase_timeframe && (
                        <div>
                          <span className="font-medium">Timeframe: </span>
                          <span>{lead.purchase_timeframe}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>ManyChat Integration Info</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div>
              <h4 className="font-semibold">Endpoint URL:</h4>
              <code className="text-sm bg-muted px-2 py-1 rounded">
                https://nljlsqgldgmxlbylqazg.supabase.co/functions/v1/manychat-leads
              </code>
            </div>
            <div>
              <h4 className="font-semibold">Supported Fields:</h4>
              <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                <li><code>last_name</code> or <code>name</code> or <code>first_name</code> (required)</li>
                <li><code>email</code> or <code>user_email</code> (required)</li>
                <li><code>phone</code> or <code>phone_number</code> or <code>user_phone</code> (required)</li>
                <li><code>loan_type</code> or <code>loanType</code> (optional) - Valid values: "Home Purchase", "Refinance", "Investment Property", "Jumbo Loan", "HELOC", "Buy a new home", "Just exploring"</li>
                <li><code>property_value</code> (optional, numeric)</li>
                <li><code>credit_score_range</code> or <code>creditScore</code> or <code>credit__score_range</code> (optional) - Valid values: "Excellent (720+)", "Good (660–719)", "Fair (600–659)", "Below 600", "Prefer not to say"</li>
                <li><code>purchase_timeframe</code> or <code>timeframe</code> (optional) - Valid values: "ASAP / next 30 days", "1–3 months", "3–6 months", "6+ months"</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LeadVisualization;
