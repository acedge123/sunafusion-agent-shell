
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  MessageSquare, 
  FileText, 
  Database, 
  Zap,
  Bot,
  Image,
  Video
} from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  const features = [
    {
      title: "AI Agent",
      description: "Interact with our intelligent AI agent for complex tasks and data analysis",
      icon: Bot,
      href: "/agent",
      badge: "AI Powered"
    },
    {
      title: "Chat Assistant", 
      description: "Have natural conversations with our AI assistant",
      icon: MessageSquare,
      href: "/chat",
      badge: "Interactive"
    },
    {
      title: "Google Drive Integration",
      description: "Connect and analyze your Google Drive files with AI assistance",
      icon: FileText,
      href: "/drive",
      badge: "Cloud Connected"
    },
    {
      title: "AI Ad Generator",
      description: "Create stunning static and video ads using Google Gemini's Imagen API",
      icon: Image,
      href: "/imagen",
      badge: "New"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Welcome to <span className="text-blue-600">SunaFusion</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Your intelligent AI-powered platform for productivity, creativity, and data analysis. 
            Explore our suite of tools designed to enhance your workflow.
          </p>
          <div className="flex justify-center gap-4">
            <Badge variant="secondary" className="text-sm px-3 py-1">
              <Zap className="w-3 h-3 mr-1" />
              AI Powered
            </Badge>
            <Badge variant="secondary" className="text-sm px-3 py-1">
              <Database className="w-3 h-3 mr-1" />
              Cloud Connected
            </Badge>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow duration-300 border-0 shadow-md">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between mb-2">
                  <feature.icon className="h-8 w-8 text-blue-600" />
                  <Badge variant="outline" className="text-xs">
                    {feature.badge}
                  </Badge>
                </div>
                <CardTitle className="text-xl font-semibold text-gray-900">
                  {feature.title}
                </CardTitle>
                <CardDescription className="text-gray-600">
                  {feature.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <Link to={feature.href}>
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                    Get Started
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-16">
          <p className="text-gray-600 mb-4">
            Ready to supercharge your productivity with AI?
          </p>
          <Link to="/agent">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3">
              Start with AI Agent
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Index;
