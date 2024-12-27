import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { useState } from "react";

const Header = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      toast({
        title: "Signed out successfully",
        duration: 2000,
      });
      
      navigate("/login");
    } catch (error) {
      console.error("Error signing out:", error);
      toast({
        variant: "destructive",
        title: "Error signing out",
        description: "Please try again",
      });
    }
  };

  const handleResetPassword = async () => {
    try {
      if (newPassword !== confirmPassword) {
        toast({
          variant: "destructive",
          title: "Passwords do not match",
          description: "Please make sure your passwords match",
        });
        return;
      }

      if (newPassword.length < 6) {
        toast({
          variant: "destructive",
          title: "Password too short",
          description: "Password must be at least 6 characters long",
        });
        return;
      }

      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      setIsResetDialogOpen(false);
      setNewPassword("");
      setConfirmPassword("");
      
      toast({
        title: "Password updated successfully",
        description: "Your password has been changed",
        duration: 5000,
      });
    } catch (error) {
      console.error("Error updating password:", error);
      toast({
        variant: "destructive",
        title: "Error updating password",
        description: "Please try again",
      });
    }
  };

  return (
    <>
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Executive Career Catalyst</h1>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <UserCircle className="h-6 w-6" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40 bg-white">
            <DropdownMenuItem 
              onClick={() => setIsResetDialogOpen(true)} 
              className="cursor-pointer bg-white hover:bg-gray-100"
            >
              Reset Password
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={handleSignOut} 
              className="cursor-pointer bg-white hover:bg-gray-100"
            >
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>

      <Dialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Reset Password</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="new-password">New Password</Label>
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="confirm-password">Confirm Password</Label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
              />
            </div>
            <Button onClick={handleResetPassword}>
              Update Password
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Header;