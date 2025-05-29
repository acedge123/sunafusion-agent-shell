
import React from "react";
import { Button } from "@/components/ui/button";
import { Home, Bot, HardDrive, MessageSquare, Image } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const PageNavigation = () => {
  const location = useLocation();
  
  const navItems = [
    { to: "/", label: "Home", icon: Home },
    { to: "/agent", label: "AI Agent", icon: Bot },
    { to: "/chat", label: "Chat", icon: MessageSquare },
    { to: "/drive", label: "Drive", icon: HardDrive },
    { to: "/imagen", label: "AI Ads", icon: Image },
  ];

  return (
    <nav className="flex items-center gap-2 p-4 border-b bg-background">
      <div className="flex items-center gap-2 overflow-x-auto">
        {navItems.map((item) => (
          <Button
            key={item.to}
            variant={location.pathname === item.to ? "default" : "ghost"}
            size="sm"
            asChild
            className="flex items-center gap-2 whitespace-nowrap"
          >
            <Link to={item.to}>
              <item.icon className="h-4 w-4" />
              <span className="hidden sm:inline">{item.label}</span>
            </Link>
          </Button>
        ))}
      </div>
    </nav>
  );
};

export default PageNavigation;
