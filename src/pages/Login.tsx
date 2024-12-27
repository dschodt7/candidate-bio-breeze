import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const Login = () => {
  const navigate = useNavigate();
  const [showResetAlert, setShowResetAlert] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Check if user is already logged in
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate("/");
      }
    };
    
    checkUser();

    // Listen for auth changes and errors
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state change event:", event);
      
      if (session) {
        navigate("/");
      }
      
      // Show reset alert if we detect a password reset attempt
      if (event === 'PASSWORD_RECOVERY') {
        setShowResetAlert(true);
      }

      // Handle authentication errors through URL parameters instead of events
    });

    // Check URL parameters for password reset
    const params = new URLSearchParams(window.location.search);
    if (params.get('type') === 'recovery') {
      setShowResetAlert(true);
    }

    // Check for error parameter
    const error = params.get('error');
    const errorDescription = params.get('error_description');
    if (error) {
      console.error("Auth error:", error, errorDescription);
      toast({
        variant: "destructive",
        title: "Authentication Error",
        description: errorDescription || "There was a problem with authentication. Please try again.",
      });
    }

    return () => subscription.unsubscribe();
  }, [navigate, toast]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Executive Career Catalyst
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Sign in to your account
          </p>
        </div>
        {showResetAlert && (
          <Alert variant="default" className="mb-4 border-blue-200 bg-blue-50">
            <AlertCircle className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-700">
              Check your email for the password reset link. The email will come from noreply@olwrgthvydukavmpfeiw.supabase.co. 
              If you don't see it, please check your spam folder.
            </AlertDescription>
          </Alert>
        )}
        <div className="mt-8">
          <Auth
            supabaseClient={supabase}
            appearance={{ 
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: '#10b981',
                    brandAccent: '#059669',
                  },
                },
              },
            }}
            theme="light"
            providers={[]}
            redirectTo={window.location.origin}
          />
        </div>
      </div>
    </div>
  );
};

export default Login;