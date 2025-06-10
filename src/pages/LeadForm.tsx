
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

interface LeadFormData {
  last_name: string;
  email: string;
  phone: string;
  loan_type: string;
  property_value: string;
  credit_score_range: string;
  purchase_timeframe: string;
}

const LOAN_TYPES = [
  "Home Purchase",
  "Refinance", 
  "Investment Property",
  "Jumbo Loan"
];

const CREDIT_SCORE_RANGES = [
  "Excellent (740+)",
  "Good (670-739)",
  "Fair (580-669)", 
  "Poor (Below 580)",
  "Not Sure"
];

const PURCHASE_TIMEFRAMES = [
  "ASAP",
  "Within 30 days",
  "Within 60 days",
  "Within 90 days", 
  "Within 6 months",
  "Just exploring"
];

const LeadForm = () => {
  const [formData, setFormData] = useState<LeadFormData>({
    last_name: "",
    email: "",
    phone: "",
    loan_type: "",
    property_value: "",
    credit_score_range: "",
    purchase_timeframe: ""
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleInputChange = (field: keyof LeadFormData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }));
  };

  const handleSelectChange = (field: keyof LeadFormData) => (value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = (): boolean => {
    if (!formData.last_name.trim()) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Last name is required"
      });
      return false;
    }

    if (!formData.email.trim() || !formData.email.includes("@")) {
      toast({
        variant: "destructive", 
        title: "Validation Error",
        description: "Valid email is required"
      });
      return false;
    }

    if (!formData.phone.trim()) {
      toast({
        variant: "destructive",
        title: "Validation Error", 
        description: "Phone number is required"
      });
      return false;
    }

    if (!formData.loan_type) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Loan type is required"
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const submitData = {
        ...formData,
        property_value: formData.property_value ? parseFloat(formData.property_value) : null
      };

      const { error } = await supabase
        .from('leads')
        .insert([submitData]);

      if (error) {
        throw error;
      }

      toast({
        title: "Success!",
        description: "Your information has been submitted successfully. We'll be in touch soon!"
      });

      // Reset form
      setFormData({
        last_name: "",
        email: "",
        phone: "",
        loan_type: "",
        property_value: "",
        credit_score_range: "",
        purchase_timeframe: ""
      });

    } catch (error) {
      console.error("Error submitting lead:", error);
      toast({
        variant: "destructive",
        title: "Submission Error",
        description: "There was an error submitting your information. Please try again."
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container max-w-2xl mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl text-center">Get Your Loan Quote</CardTitle>
          <p className="text-center text-muted-foreground">
            Fill out the form below and we'll help you find the best loan options
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="last_name">Last Name *</Label>
                <Input
                  id="last_name"
                  value={formData.last_name}
                  onChange={handleInputChange("last_name")}
                  placeholder="Enter your last name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange("email")}
                  placeholder="your.email@example.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={handleInputChange("phone")}
                placeholder="(555) 123-4567"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="loan_type">Loan Type *</Label>
              <Select value={formData.loan_type} onValueChange={handleSelectChange("loan_type")}>
                <SelectTrigger>
                  <SelectValue placeholder="Select loan type" />
                </SelectTrigger>
                <SelectContent>
                  {LOAN_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="property_value">Property Value</Label>
              <Input
                id="property_value"
                type="number"
                value={formData.property_value}
                onChange={handleInputChange("property_value")}
                placeholder="Enter estimated property value"
                min="0"
                step="1000"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="credit_score_range">Credit Score Range</Label>
              <Select value={formData.credit_score_range} onValueChange={handleSelectChange("credit_score_range")}>
                <SelectTrigger>
                  <SelectValue placeholder="Select credit score range" />
                </SelectTrigger>
                <SelectContent>
                  {CREDIT_SCORE_RANGES.map((range) => (
                    <SelectItem key={range} value={range}>
                      {range}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="purchase_timeframe">Purchase Timeframe</Label>
              <Select value={formData.purchase_timeframe} onValueChange={handleSelectChange("purchase_timeframe")}>
                <SelectTrigger>
                  <SelectValue placeholder="Select purchase timeframe" />
                </SelectTrigger>
                <SelectContent>
                  {PURCHASE_TIMEFRAMES.map((timeframe) => (
                    <SelectItem key={timeframe} value={timeframe}>
                      {timeframe}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Lead Information"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default LeadForm;
