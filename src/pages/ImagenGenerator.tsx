
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Download, Image, Video, AlertCircle } from "lucide-react";

export default function ImagenGenerator() {
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<{
    type: 'static' | 'video';
    data: any;
  } | null>(null);
  const [activeTab, setActiveTab] = useState<'static' | 'video'>('static');

  const handleGenerate = async (type: 'static' | 'video') => {
    if (!prompt.trim()) {
      toast({
        title: "Error",
        description: "Please enter a prompt",
        variant: "destructive",
      });
      return;
    }

    if (type === 'video') {
      toast({
        title: "Not Available",
        description: "Video generation is not currently supported by the Imagen API",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('imagen-generator', {
        body: { prompt: prompt.trim(), type }
      });

      if (error) {
        throw error;
      }

      if (data.error) {
        throw new Error(data.error);
      }

      setGeneratedContent({ type, data: data.data });
      
      toast({
        title: "Success",
        description: "Ad description generated successfully!",
      });

    } catch (error) {
      console.error('Generation error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to generate content",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: "Copied",
        description: "Description copied to clipboard",
      });
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-4">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-gray-900">
            AI Ad Generator
          </h1>
          <p className="text-lg text-gray-600">
            Generate detailed ad descriptions using Google Gemini AI
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Image className="h-5 w-5" />
              Generate Ad Descriptions
            </CardTitle>
            <CardDescription>
              Enter a detailed prompt to generate professional ad descriptions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="prompt" className="text-sm font-medium">
                Ad Prompt
              </label>
              <Textarea
                id="prompt"
                placeholder="Describe your ad: A modern tech product advertisement featuring a sleek smartphone with vibrant colors and professional lighting..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="min-h-[100px]"
              />
            </div>

            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'static' | 'video')}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="static" className="flex items-center gap-2">
                  <Image className="h-4 w-4" />
                  Static Ad
                </TabsTrigger>
                <TabsTrigger value="video" className="flex items-center gap-2" disabled>
                  <Video className="h-4 w-4" />
                  Video Ad (Coming Soon)
                </TabsTrigger>
              </TabsList>

              <TabsContent value="static" className="space-y-4">
                <Button
                  onClick={() => handleGenerate('static')}
                  disabled={isLoading || !prompt.trim()}
                  className="w-full"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating Ad Description...
                    </>
                  ) : (
                    <>
                      <Image className="mr-2 h-4 w-4" />
                      Generate Ad Description
                    </>
                  )}
                </Button>
              </TabsContent>

              <TabsContent value="video" className="space-y-4">
                <div className="flex items-center gap-2 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                  <AlertCircle className="h-4 w-4 text-yellow-600" />
                  <span className="text-sm text-yellow-800">
                    Video generation is not currently available through the Imagen API
                  </span>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {generatedContent && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Image className="h-5 w-5" />
                Generated Ad Description
                <Badge variant="secondary">
                  {generatedContent.type}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {generatedContent.data.candidates?.map((candidate: any, index: number) => (
                <div key={index} className="space-y-4">
                  {candidate.generatedText ? (
                    <div className="space-y-4">
                      <div className="p-4 bg-gray-50 rounded-lg border">
                        <p className="text-sm text-gray-800 whitespace-pre-wrap">
                          {candidate.generatedText}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => copyToClipboard(candidate.generatedText)}
                          variant="outline"
                          className="flex-1"
                        >
                          <Download className="mr-2 h-4 w-4" />
                          Copy Description
                        </Button>
                      </div>
                      {candidate.description && (
                        <p className="text-xs text-gray-500">{candidate.description}</p>
                      )}
                    </div>
                  ) : (
                    <div className="text-center text-gray-500">
                      Content generated but format not recognized
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
