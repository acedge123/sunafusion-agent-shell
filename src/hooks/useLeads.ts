
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

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

export const useLeads = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchLeads = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) {
        throw fetchError;
      }

      setLeads(data || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch leads';
      setError(errorMessage);
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage
      });
    } finally {
      setIsLoading(false);
    }
  };

  const submitLead = async (leadData: Omit<Lead, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error: submitError } = await supabase
        .from('leads')
        .insert([leadData])
        .select()
        .single();

      if (submitError) {
        throw submitError;
      }

      toast({
        title: "Success!",
        description: "Lead submitted successfully"
      });

      // Refresh the leads list
      await fetchLeads();
      
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to submit lead';
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage
      });
      throw err;
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  return {
    leads,
    isLoading,
    error,
    fetchLeads,
    submitLead
  };
};
