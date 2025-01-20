import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { ProfileMenu } from "./header/ProfileMenu";
import { ResetPasswordDialog } from "./header/ResetPasswordDialog";

const Header = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('first_name')
            .eq('id', user.id)
            .single();
          
          if (profile?.first_name) {
            setFirstName(profile.first_name);
          }
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
      }
    };

    fetchUserProfile();
  }, []);

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
    <div className="bg-[#F2EDE3] border-b border-white/20">
      <header className="w-full px-6 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Executive Career Catalyst</h1>
        <ProfileMenu
          firstName={firstName}
          onSignOut={handleSignOut}
          onResetPassword={() => setIsResetDialogOpen(true)}
        />
        <ResetPasswordDialog
          isOpen={isResetDialogOpen}
          onOpenChange={setIsResetDialogOpen}
          newPassword={newPassword}
          confirmPassword={confirmPassword}
          onNewPasswordChange={setNewPassword}
          onConfirmPasswordChange={setConfirmPassword}
          onSubmit={handleResetPassword}
        />
      </header>
    </div>
  );
};

export default Header;