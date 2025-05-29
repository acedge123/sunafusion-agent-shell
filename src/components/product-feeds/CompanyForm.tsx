
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/auth/AuthProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const companySchema = z.object({
  name: z.string().min(1, "Company name is required"),
  description: z.string().optional(),
  website_url: z.string().url("Must be a valid URL").optional().or(z.literal("")),
});

type CompanyFormData = z.infer<typeof companySchema>;

interface CompanyFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export function CompanyForm({ onSuccess, onCancel }: CompanyFormProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CompanyFormData>({
    resolver: zodResolver(companySchema),
  });

  const onSubmit = async (data: CompanyFormData) => {
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase.from("companies").insert({
        name: data.name,
        description: data.description || null,
        website_url: data.website_url || null,
        user_id: user.id,
      });

      if (error) throw error;
      onSuccess();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create company",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Add New Company</CardTitle>
            <Button variant="ghost" size="sm" onClick={onCancel}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="name">Company Name</Label>
              <Input
                id="name"
                {...register("name")}
                placeholder="Enter company name"
              />
              {errors.name && (
                <p className="text-sm text-red-600 mt-1">{errors.name.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                {...register("description")}
                placeholder="Brief description of the company"
              />
              {errors.description && (
                <p className="text-sm text-red-600 mt-1">{errors.description.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="website_url">Website URL</Label>
              <Input
                id="website_url"
                {...register("website_url")}
                placeholder="https://example.com"
                type="url"
              />
              {errors.website_url && (
                <p className="text-sm text-red-600 mt-1">{errors.website_url.message}</p>
              )}
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Creating..." : "Create Company"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
