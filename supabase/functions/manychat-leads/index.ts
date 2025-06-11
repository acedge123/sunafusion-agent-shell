
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }), 
      { 
        status: 405, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Parse the request body
    const requestData = await req.json()
    
    console.log('Received ManyChat data:', JSON.stringify(requestData, null, 2))

    // Extract lead data from ManyChat payload
    // ManyChat typically sends data in different formats, so we'll be flexible
    const leadData = {
      last_name: requestData.last_name || requestData.lastName || requestData.name || 'Unknown',
      email: requestData.email || requestData.user_email || '',
      phone: requestData.phone || requestData.phone_number || requestData.user_phone || '',
      loan_type: requestData.loan_type || requestData.loanType || 'Home Purchase',
      property_value: requestData.property_value ? parseFloat(requestData.property_value) : null,
      credit_score_range: requestData.credit_score_range || requestData.creditScore || null,
      purchase_timeframe: requestData.purchase_timeframe || requestData.timeframe || null
    }

    // Validate required fields
    if (!leadData.email || !leadData.phone) {
      return new Response(
        JSON.stringify({ 
          error: 'Missing required fields: email and phone are required',
          received_data: requestData
        }), 
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Validate loan_type to ensure it's one of the accepted values
    const validLoanTypes = ['Home Purchase', 'Refinance', 'Investment Property', 'Jumbo Loan', 'HELOC'];
    if (!validLoanTypes.includes(leadData.loan_type)) {
      console.log(`Invalid loan type received: ${leadData.loan_type}. Defaulting to 'Home Purchase'`);
      leadData.loan_type = 'Home Purchase';
    }

    // Insert lead into database
    const { data, error } = await supabase
      .from('leads')
      .insert([leadData])
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      return new Response(
        JSON.stringify({ 
          error: 'Failed to save lead data',
          details: error.message,
          received_data: requestData
        }), 
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log('Lead saved successfully:', data)

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Lead data received and saved successfully',
        lead_id: data.id,
        processed_data: leadData
      }), 
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error processing request:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        message: error.message 
      }), 
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
})
