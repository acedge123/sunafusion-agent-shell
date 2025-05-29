
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const productFeedSchema = z.object({
  feed_name: z.string().min(1, "Feed name is required"),
  company_id: z.string().min(1, "Company is required"),
  feed_url: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  feed_format: z.enum(["xml", "csv", "json", "other"]),
});

type ProductFeedFormData = z.infer<typeof productFeedSchema>;

interface Company {
  id: string;
  name: string;
}

interface ProductFeedFormProps {
  companies: Company[];
  selectedCompany?: Company | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export function ProductFeedForm({ companies, selectedCompany, onSuccess, onCancel }: ProductFeedFormProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProductFeedFormData>({
    resolver: zodResolver(productFeedSchema),
    defaultValues: {
      company_id: selectedCompany?.id || "",
    },
  });

  const watchedCompanyId = watch("company_id");

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      // Auto-detect format based on file extension
      const extension = file.name.split('.').pop()?.toLowerCase();
      if (extension === 'xml') setValue("feed_format", "xml");
      else if (extension === 'csv') setValue("feed_format", "csv");
      else if (extension === 'json') setValue("feed_format", "json");
      else setValue("feed_format", "other");
    }
  };

  const onSubmit = async (data: ProductFeedFormData) => {
    if (!user) return;

    setLoading(true);
    try {
      let feedData = null;

      // If a file is selected, read and parse it
      if (selectedFile) {
        const text = await selectedFile.text();
        
        try {
          if (data.feed_format === 'json') {
            feedData = JSON.parse(text);
          } else if (data.feed_format === 'xml') {
            // For XML, store as text for now
            feedData = { content: text, type: 'xml' };
          } else if (data.feed_format === 'csv') {
            // For CSV, store as text for now
            feedData = { content: text, type: 'csv' };
          } else {
            feedData = { content: text, type: 'other' };
          }
        } catch (parseError) {
          toast({
            title: "Error",
            description: "Failed to parse the uploaded file",
            variant: "destructive",
          });
          setLoading(false);
          return;
        }
      }

      const { error } = await supabase.from("product_feeds").insert({
        feed_name: data.feed_name,
        company_id: data.company_id,
        feed_url: data.feed_url || null,
        feed_format: data.feed_format,
        feed_data: feedData,
        user_id: user.id,
        status: 'active',
        last_updated: new Date().toISOString(),
      });

      if (error) throw error;
      onSuccess();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create product feed",
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
            <CardTitle>Add Product Feed</CardTitle>
            <Button variant="ghost" size="sm" onClick={onCancel}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="feed_name">Feed Name</Label>
              <Input
                id="feed_name"
                {...register("feed_name")}
                placeholder="Enter feed name"
              />
              {errors.feed_name && (
                <p className="text-sm text-red-600 mt-1">{errors.feed_name.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="company_id">Company</Label>
              <Select value={watchedCompanyId} onValueChange={(value) => setValue("company_id", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a company" />
                </SelectTrigger>
                <SelectContent>
                  {companies.map((company) => (
                    <SelectItem key={company.id} value={company.id}>
                      {company.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.company_id && (
                <p className="text-sm text-red-600 mt-1">{errors.company_id.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="feed_url">Feed URL (Optional)</Label>
              <Input
                id="feed_url"
                {...register("feed_url")}
                placeholder="https://example.com/feed.xml"
                type="url"
              />
              {errors.feed_url && (
                <p className="text-sm text-red-600 mt-1">{errors.feed_url.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="feed_format">Feed Format</Label>
              <Select onValueChange={(value) => setValue("feed_format", value as any)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="xml">XML</SelectItem>
                  <SelectItem value="csv">CSV</SelectItem>
                  <SelectItem value="json">JSON</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              {errors.feed_format && (
                <p className="text-sm text-red-600 mt-1">{errors.feed_format.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="file">Upload Feed File (Optional)</Label>
              <div className="mt-1">
                <label htmlFor="file" className="flex items-center justify-center w-full h-20 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400">
                  <div className="text-center">
                    <Upload className="h-6 w-6 mx-auto mb-1 text-gray-400" />
                    <p className="text-sm text-gray-500">
                      {selectedFile ? selectedFile.name : "Click to upload file"}
                    </p>
                  </div>
                  <input
                    id="file"
                    type="file"
                    className="hidden"
                    accept=".xml,.csv,.json,.txt"
                    onChange={handleFileChange}
                  />
                </label>
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Creating..." : "Create Feed"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
