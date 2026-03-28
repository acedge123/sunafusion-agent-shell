
import React from "react";
import { UserCircle, LogOut } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { GoogleDriveAuth } from "@/components/drive/GoogleDriveAuth";
import { SlackAuth } from "@/components/slack/SlackAuth";
import { useAuth } from "@/components/auth/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

interface ProfileDropdownProps {
  className?: string;
}

export const ProfileDropdown: React.FC<ProfileDropdownProps> = ({ className }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  if (!user) return null;

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth", { replace: true });
  };
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className={className}>
          <UserCircle className="h-5 w-5" />
          <span className="sr-only">User profile</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-4 bg-popover">
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b">
            <UserCircle className="h-6 w-6" />
            <div>
              <p className="font-medium">{user.email}</p>
              <p className="text-xs text-muted-foreground">Connected Services</p>
            </div>
          </div>
          
          <GoogleDriveAuth />
          <SlackAuth />

          <Button
            variant="outline"
            size="sm"
            className="w-full mt-2"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign out
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
