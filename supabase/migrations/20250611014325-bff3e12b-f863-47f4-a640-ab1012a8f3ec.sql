
-- Update the leads table to include "HELOC" as a valid loan type
ALTER TABLE public.leads 
DROP CONSTRAINT IF EXISTS leads_loan_type_check;

-- Add the updated constraint with "HELOC" included
ALTER TABLE public.leads 
ADD CONSTRAINT leads_loan_type_check 
CHECK (loan_type IN ('Home Purchase', 'Refinance', 'Investment Property', 'Jumbo Loan', 'HELOC'));
