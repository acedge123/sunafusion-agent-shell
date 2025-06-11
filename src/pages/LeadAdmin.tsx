
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/auth/AuthProvider";
import { Loader2, Mail, Phone, DollarSign, Calendar } from "lucide-react";
import { format } from "date-fns";
import Navigation from "@/components/Navigation";

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
  updated_at: string;
}

const LeadAdmin = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Access Denied",
        description: "You must be logged in to view leads"
      });
      return;
    }

    fetchLeads();
  }, [user]);

  const fetchLeads = async () => {
    try {
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setLeads(data || []);
    } catch (error) {
      console.error("Error fetching leads:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load leads data"
      });
    } finally {
      setIsLoading(false);
    }
  };

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
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container max-w-6xl mx-auto py-8">
        {!user ? (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-muted-foreground">Please log in to access the admin panel.</p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Lead Management Dashboard
              </CardTitle>
              <p className="text-muted-foreground">
                View and manage submitted lead information
              </p>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                  <span className="ml-2">Loading leads...</span>
                </div>
              ) : leads.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No leads have been submitted yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="text-sm text-muted-foreground">
                    Showing {leads.length} lead{leads.length !== 1 ? 's' : ''}
                  </div>
                  
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Contact</TableHead>
                          <TableHead>Loan Details</TableHead>
                          <TableHead>Property Value</TableHead>
                          <TableHead>Credit Score</TableHead>
                          <TableHead>Timeframe</TableHead>
                          <TableHead>Submitted</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {leads.map((lead) => (
                          <TableRow key={lead.id}>
                            <TableCell>
                              <div className="space-y-1">
                                <div className="font-medium">{lead.last_name}</div>
                                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                  <Mail className="h-3 w-3" />
                                  {lead.email}
                                </div>
                                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                  <Phone className="h-3 w-3" />
                                  {lead.phone}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge className={getLoanTypeBadgeColor(lead.loan_type)}>
                                {lead.loan_type}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <DollarSign className="h-3 w-3" />
                                {formatCurrency(lead.property_value)}
                              </div>
                            </TableCell>
                            <TableCell>
                              {lead.credit_score_range || "Not specified"}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {lead.purchase_timeframe || "Not specified"}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">
                                {format(new Date(lead.created_at), 'MMM d, yyyy')}
                                <div className="text-xs text-muted-foreground">
                                  {format(new Date(lead.created_at), 'h:mm a')}
                                </div>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default LeadAdmin;
