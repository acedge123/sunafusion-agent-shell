import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  Home, 
  ArrowLeft,
  Bot,
  MessageSquare,
  Brain
} from 'lucide-react';

const Navigation = () => {
  const location = useLocation();
  
  const navigationItems = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/chat', label: 'Chat', icon: MessageSquare },
    { href: '/learnings', label: 'Learnings', icon: Brain },
  ];

  const isHomePage = location.pathname === '/';

  return (
    <nav className="bg-background border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-4">
            <Link to="/" className="flex items-center gap-2 text-xl font-bold text-primary">
              <Bot className="h-5 w-5" />
              Edge Bot
            </Link>
            {!isHomePage && (
              <Link to="/">
                <Button variant="ghost" size="sm" className="flex items-center gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </Button>
              </Link>
            )}
          </div>
          
          <div className="hidden md:flex items-center space-x-2">
            {navigationItems.map((item) => (
              <Link key={item.href} to={item.href}>
                <Button 
                  variant={location.pathname === item.href ? "default" : "ghost"} 
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Button>
              </Link>
            ))}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center gap-2">
            <Link to="/chat">
              <Button variant="ghost" size="sm">
                <MessageSquare className="h-4 w-4" />
              </Button>
            </Link>
            <Link to="/learnings">
              <Button variant="ghost" size="sm">
                <Brain className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
