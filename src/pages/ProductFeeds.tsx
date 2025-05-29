
import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Building2, Upload } from "lucide-react";
import { CompanyForm } from "@/components/product-feeds/CompanyForm";
import { ProductFeedForm } from "@/components/product-feeds/ProductFeedForm";
import { CompanyList } from "@/components/product-feeds/CompanyList";
import { ProductFeedList } from "@/components/product-feeds/ProductFeedList";
import { useToast } from "@/hooks/use-toast";

export default function ProductFeeds() {
  const { user, session } = useAuth();
  const [companies, setCompanies] = useState([]);
  const [productFeeds, setProductFeeds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCompanyForm, setShowCompanyForm] = useState(false);
  const [showFeedForm, setShowFeedForm] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const { toast } = useToast();

  useEffect(() => {
    if (session) {
      fetchData();
    }
  }, [session]);

  const fetchData = async () => {
    try {
      const [companiesResponse, feedsResponse] = await Promise.all([
        supabase.from("companies").select("*").order("created_at", { ascending: false }),
        supabase.from("product_feeds").select("*, companies(name)").order("created_at", { ascending: false })
      ]);

      if (companiesResponse.error) throw companiesResponse.error;
      if (feedsResponse.error) throw feedsResponse.error;

      setCompanies(companiesResponse.data || []);
      setProductFeeds(feedsResponse.data || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCompanyCreated = () => {
    setShowCompanyForm(false);
    fetchData();
    toast({
      title: "Success",
      description: "Company created successfully",
    });
  };

  const handleFeedCreated = () => {
    setShowFeedForm(false);
    setSelectedCompany(null);
    fetchData();
    toast({
      title: "Success",
      description: "Product feed created successfully",
    });
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>
              Please sign in to access the product feeds management system.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => window.location.href = '/auth'} className="w-full">
              Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Product Feed Management</h1>
          <p className="text-gray-600">Manage your companies and their product feeds</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Companies Section */}
          <div>
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Building2 className="h-5 w-5" />
                      Companies
                    </CardTitle>
                    <CardDescription>
                      Manage your e-commerce companies
                    </CardDescription>
                  </div>
                  <Button onClick={() => setShowCompanyForm(true)} size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Company
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <CompanyList 
                  companies={companies} 
                  onRefresh={fetchData}
                  onSelectForFeed={(company) => {
                    setSelectedCompany(company);
                    setShowFeedForm(true);
                  }}
                />
              </CardContent>
            </Card>
          </div>

          {/* Product Feeds Section */}
          <div>
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Upload className="h-5 w-5" />
                      Product Feeds
                    </CardTitle>
                    <CardDescription>
                      Upload and manage product feeds
                    </CardDescription>
                  </div>
                  <Button 
                    onClick={() => setShowFeedForm(true)} 
                    size="sm"
                    disabled={companies.length === 0}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Feed
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {companies.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Upload className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Create a company first to add product feeds</p>
                  </div>
                ) : (
                  <ProductFeedList feeds={productFeeds} onRefresh={fetchData} />
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Modals */}
        {showCompanyForm && (
          <CompanyForm 
            onSuccess={handleCompanyCreated}
            onCancel={() => setShowCompanyForm(false)}
          />
        )}

        {showFeedForm && (
          <ProductFeedForm 
            companies={companies}
            selectedCompany={selectedCompany}
            onSuccess={handleFeedCreated}
            onCancel={() => {
              setShowFeedForm(false);
              setSelectedCompany(null);
            }}
          />
        )}
      </div>
    </div>
  );
}
