import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ProfileMenuProps {
  firstName: string;
  onSignOut: () => void;
  onResetPassword: () => void;
}

export const ProfileMenu = ({ firstName, onSignOut, onResetPassword }: ProfileMenuProps) => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-9 w-9">
            <UserCircle className="h-6 w-6" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40 bg-white">
          <DropdownMenuItem 
            onClick={() => navigate("/profile")} 
            className="cursor-pointer bg-white hover:bg-gray-100"
          >
            Profile Details
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={onResetPassword} 
            className="cursor-pointer bg-white hover:bg-gray-100"
          >
            Reset Password
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={onSignOut} 
            className="cursor-pointer bg-white hover:bg-gray-100"
          >
            Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      {firstName && <span className="text-sm text-gray-600 mt-1">{firstName}</span>}
    </div>
  );
};