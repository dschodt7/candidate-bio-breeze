import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-white to-gray-50">
      <div className="relative w-full max-w-md">
        {/* Background blur effect */}
        <div className="absolute inset-0 bg-white/40 backdrop-blur-sm rounded-2xl" />
        
        <div className="relative z-10 w-full space-y-6 bg-white/60 p-8 rounded-2xl shadow-sm border border-gray-200/30">
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-violet-500 bg-clip-text text-transparent">
              Executive Career Catalyst
            </h1>
            <p className="text-lg text-gray-600">
              Sign in to your account
            </p>
          </div>
          
          {showResetAlert && (
            <Alert variant="default" className="border-blue-200/50 bg-blue-50/50 backdrop-blur-sm">
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
                      brand: '#0EA5E9',
                      brandAccent: '#0284C7',
                      brandButtonText: 'white',
                      defaultButtonBackground: 'white',
                      defaultButtonBackgroundHover: '#f9fafb',
                      inputBackground: 'white',
                      inputBorder: '#e5e7eb',
                      inputBorderHover: '#9ca3af',
                      inputBorderFocus: '#0EA5E9',
                    },
                    borderWidths: {
                      buttonBorderWidth: '1px',
                      inputBorderWidth: '1px',
                    },
                    radii: {
                      borderRadiusButton: '0.75rem',
                      buttonBorderRadius: '0.75rem',
                      inputBorderRadius: '0.75rem',
                    },
                    space: {
                      inputPadding: '0.75rem',
                      buttonPadding: '0.75rem',
                    },
                    fonts: {
                      bodyFontFamily: `ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"`,
                      buttonFontFamily: `ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"`,
                    },
                  },
                },
                className: {
                  container: 'space-y-4',
                  label: 'text-sm font-medium text-gray-700',
                  button: 'w-full flex justify-center py-2 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors',
                  input: 'appearance-none block w-full px-3 py-2 border border-gray-200/60 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent sm:text-sm bg-white/80',
                },
              }}
              theme="light"
              providers={[]}
              redirectTo={window.location.origin}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;