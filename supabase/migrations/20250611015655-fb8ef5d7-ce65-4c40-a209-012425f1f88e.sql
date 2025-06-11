
-- Update purchase_timeframe constraint to allow ManyChat values
ALTER TABLE public.leads 
DROP CONSTRAINT IF EXISTS leads_purchase_timeframe_check;

ALTER TABLE public.leads 
ADD CONSTRAINT leads_purchase_timeframe_check 
CHECK (purchase_timeframe IN ('ASAP / next 30 days', '1–3 months', '3–6 months', '6+ months'));

-- Update credit_score_range constraint to allow ManyChat values
ALTER TABLE public.leads 
DROP CONSTRAINT IF EXISTS leads_credit_score_range_check;

ALTER TABLE public.leads 
ADD CONSTRAINT leads_credit_score_range_check 
CHECK (credit_score_range IN ('Excellent (720+)', 'Good (660–719)', 'Fair (600–659)', 'Below 600', 'Prefer not to say'));

-- Update loan_type constraint to include ManyChat values
ALTER TABLE public.leads 
DROP CONSTRAINT IF EXISTS leads_loan_type_check;

ALTER TABLE public.leads 
ADD CONSTRAINT leads_loan_type_check 
CHECK (loan_type IN ('Home Purchase', 'Refinance', 'Investment Property', 'Jumbo Loan', 'HELOC', 'Buy a new home', 'Just exploring'));
