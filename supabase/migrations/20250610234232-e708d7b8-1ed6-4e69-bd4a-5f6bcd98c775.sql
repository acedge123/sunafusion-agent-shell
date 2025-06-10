
-- Create a table for storing lead data
CREATE TABLE public.leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  loan_type TEXT NOT NULL CHECK (loan_type IN ('Home Purchase', 'Refinance', 'Investment Property', 'Jumbo Loan')),
  property_value DECIMAL(12,2),
  credit_score_range TEXT CHECK (credit_score_range IN ('Excellent (740+)', 'Good (670-739)', 'Fair (580-669)', 'Poor (Below 580)', 'Not Sure')),
  purchase_timeframe TEXT CHECK (purchase_timeframe IN ('ASAP', 'Within 30 days', 'Within 60 days', 'Within 90 days', 'Within 6 months', 'Just exploring')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security (RLS) to the leads table
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anyone to insert leads (for form submissions)
CREATE POLICY "Anyone can submit leads" 
  ON public.leads 
  FOR INSERT 
  WITH CHECK (true);

-- Create policy to allow authenticated users to view leads (for admin access)
CREATE POLICY "Authenticated users can view leads" 
  ON public.leads 
  FOR SELECT 
  USING (auth.role() = 'authenticated');

-- Create trigger to update the updated_at column
CREATE TRIGGER update_leads_updated_at
  BEFORE UPDATE ON public.leads
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Add indexes for better performance
CREATE INDEX idx_leads_email ON public.leads(email);
CREATE INDEX idx_leads_created_at ON public.leads(created_at);
CREATE INDEX idx_leads_loan_type ON public.leads(loan_type);
