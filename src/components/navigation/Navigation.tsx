
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/components/auth/AuthProvider";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { 
  Home, 
  HardDrive, 
  Package, 
  Bot, 
  MessageSquare, 
  Image,
  LogOut 
} from "lucide-react";

const Navigation = () => {
  const { user } = useAuth();
  const location = useLocation();

  const navigationItems = [
    { path: "/", label: "Home", icon: Home },
    { path: "/drive", label: "Drive", icon: HardDrive },
    { path: "/product-feeds", label: "Product Feeds", icon: Package },
    { path: "/agent", label: "AI Agent", icon: Bot },
    { path: "/chat", label: "Chat", icon: MessageSquare },
    { path: "/imagen", label: "Imagen", icon: Image },
  ];

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  if (!user) {
    return null; // Don't show navigation if user is not authenticated
  }

  return (
    <nav className="border-b bg-background">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link to="/" className="text-xl font-bold text-primary">
              Product Feed Manager
            </Link>
            
            <div className="hidden md:flex items-center space-x-4">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={cn(
                      "flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                      isActive(item.path)
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <span className="text-sm text-muted-foreground hidden sm:block">
              {user.email}
            </span>
            <Button variant="outline" size="sm" asChild>
              <Link to="/auth">
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
