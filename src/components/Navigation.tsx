
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  Home, 
  BarChart3, 
  Users, 
  ArrowLeft,
  Bot,
  MessageSquare,
  FileText,
  Image
} from 'lucide-react';

const Navigation = () => {
  const location = useLocation();
  
  const navigationItems = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/lead-dashboard', label: 'Lead Dashboard', icon: BarChart3 },
    { href: '/lead-admin', label: 'Lead Admin', icon: Users },
    { href: '/agent', label: 'AI Agent', icon: Bot },
    { href: '/chat', label: 'Chat', icon: MessageSquare },
    { href: '/drive', label: 'Drive', icon: FileText },
    { href: '/imagen', label: 'Ad Generator', icon: Image },
  ];

  const isHomePage = location.pathname === '/';

  return (
    <nav className="bg-background border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-4">
            <Link to="/" className="text-xl font-bold text-primary">
              SunaFusion
            </Link>
            {!isHomePage && (
              <Link to="/">
                <Button variant="ghost" size="sm" className="flex items-center gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Dashboard
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

          {/* Mobile menu button - simplified for now */}
          <div className="md:hidden">
            <Link to="/">
              <Button variant="ghost" size="sm">
                <Home className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
