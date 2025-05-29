
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Download, Image, Video } from "lucide-react";

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
        description: `${type === 'static' ? 'Image' : 'Video'} generated successfully!`,
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

  const downloadContent = (content: string, filename: string) => {
    const link = document.createElement('a');
    link.href = content;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-4">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-gray-900">
            AI Ad Generator
          </h1>
          <p className="text-lg text-gray-600">
            Create stunning static and video ads using Google Gemini's Imagen API
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Image className="h-5 w-5" />
              Generate Ads
            </CardTitle>
            <CardDescription>
              Enter a detailed prompt to generate your ad content
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
                <TabsTrigger value="video" className="flex items-center gap-2">
                  <Video className="h-4 w-4" />
                  Video Ad
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
                      Generating Static Ad...
                    </>
                  ) : (
                    <>
                      <Image className="mr-2 h-4 w-4" />
                      Generate Static Ad
                    </>
                  )}
                </Button>
              </TabsContent>

              <TabsContent value="video" className="space-y-4">
                <Button
                  onClick={() => handleGenerate('video')}
                  disabled={isLoading || !prompt.trim()}
                  className="w-full"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating Video Ad...
                    </>
                  ) : (
                    <>
                      <Video className="mr-2 h-4 w-4" />
                      Generate Video Ad
                    </>
                  )}
                </Button>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {generatedContent && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {generatedContent.type === 'static' ? (
                  <Image className="h-5 w-5" />
                ) : (
                  <Video className="h-5 w-5" />
                )}
                Generated {generatedContent.type === 'static' ? 'Image' : 'Video'}
                <Badge variant="secondary">
                  {generatedContent.type}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {generatedContent.data.candidates?.map((candidate: any, index: number) => (
                <div key={index} className="space-y-4">
                  {generatedContent.type === 'static' && candidate.image ? (
                    <div className="space-y-4">
                      <img
                        src={`data:image/jpeg;base64,${candidate.image.data}`}
                        alt="Generated ad"
                        className="w-full max-w-md mx-auto rounded-lg shadow-lg"
                      />
                      <Button
                        onClick={() => downloadContent(
                          `data:image/jpeg;base64,${candidate.image.data}`,
                          `ad-${Date.now()}.jpg`
                        )}
                        variant="outline"
                        className="w-full"
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Download Image
                      </Button>
                    </div>
                  ) : generatedContent.type === 'video' && candidate.video ? (
                    <div className="space-y-4">
                      <video
                        controls
                        className="w-full max-w-md mx-auto rounded-lg shadow-lg"
                      >
                        <source src={`data:video/mp4;base64,${candidate.video.data}`} type="video/mp4" />
                        Your browser does not support the video tag.
                      </video>
                      <Button
                        onClick={() => downloadContent(
                          `data:video/mp4;base64,${candidate.video.data}`,
                          `ad-${Date.now()}.mp4`
                        )}
                        variant="outline"
                        className="w-full"
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Download Video
                      </Button>
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
