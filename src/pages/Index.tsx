import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  MessageSquare, 
  Bot,
  Brain,
  Zap,
  Mail,
  Search,
  GitBranch,
  Database
} from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  const features = [
    {
      title: "Edge Bot Chat",
      description: "Send messages to your OpenClaw agent - it can search, email, code, and more",
      icon: Bot,
      href: "/chat",
      badge: "Edge Bot",
      skills: [
        { icon: Mail, label: "Email" },
        { icon: Brain, label: "Memory" },
        { icon: Search, label: "Search" },
        { icon: GitBranch, label: "GitHub" },
        { icon: Database, label: "Database" },
      ]
    },
    {
      title: "Learnings Feed",
      description: "See what your agent has discovered, decided, and remembered",
      icon: Brain,
      href: "/learnings",
      badge: "Live",
      skills: []
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <div className="flex justify-center mb-6">
            <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Bot className="h-8 w-8 text-primary" />
            </div>
          </div>
          <h1 className="text-5xl font-bold text-foreground mb-6">
            Edge Bot <span className="text-primary">Control Center</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Your intelligent AI assistant powered by OpenClaw. Chat with your agent and track what it learns.
          </p>
          <div className="flex justify-center gap-4">
            <Badge variant="secondary" className="text-sm px-3 py-1">
              <Zap className="w-3 h-3 mr-1" />
              AI Powered
            </Badge>
            <Badge variant="secondary" className="text-sm px-3 py-1">
              <Brain className="w-3 h-3 mr-1" />
              Continuous Learning
            </Badge>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {features.map((feature, index) => (
            <Card key={index} className="hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/20">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {feature.badge}
                  </Badge>
                </div>
                <CardTitle className="text-2xl font-semibold text-foreground">
                  {feature.title}
                </CardTitle>
                <CardDescription className="text-muted-foreground text-base">
                  {feature.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                {feature.skills.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-6">
                    {feature.skills.map((skill, i) => (
                      <Badge key={i} variant="secondary" className="text-xs">
                        <skill.icon className="h-3 w-3 mr-1" />
                        {skill.label}
                      </Badge>
                    ))}
                  </div>
                )}
                <Link to={feature.href}>
                  <Button className="w-full" size="lg">
                    {feature.title === "Edge Bot Chat" ? (
                      <>
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Start Chatting
                      </>
                    ) : (
                      <>
                        <Brain className="h-4 w-4 mr-2" />
                        View Feed
                      </>
                    )}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-16">
          <p className="text-muted-foreground mb-4">
            Your Edge Bot can handle emails, search the web, manage GitHub, and more.
          </p>
          <Link to="/chat">
            <Button size="lg" variant="outline" className="px-8">
              <Bot className="h-4 w-4 mr-2" />
              Talk to Edge Bot
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Index;
