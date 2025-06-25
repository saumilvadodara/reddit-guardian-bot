
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, Chrome, Users, Lock } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

const Auth = () => {
  const { user, signInWithGoogle, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  const handleGoogleSignIn = async () => {
    const { error } = await signInWithGoogle();
    if (error) {
      toast({
        title: "Sign in failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <Shield className="h-16 w-16 text-blue-600 mx-auto mb-4 animate-spin" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <Shield className="h-16 w-16 text-blue-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900">ModBot</h1>
          <p className="text-gray-600 mt-2">Streamline your Reddit moderation workflow</p>
        </div>

        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-xl">Sign In to Continue</CardTitle>
            <CardDescription>
              Connect your Google account to get started with ModBot
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <Lock className="h-4 w-4 text-green-600" />
                <span>Secure Google OAuth authentication</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <Users className="h-4 w-4 text-green-600" />
                <span>Connect to your Reddit communities</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <Shield className="h-4 w-4 text-green-600" />
                <span>Automated moderation assistance</span>
              </div>
            </div>

            <Button 
              onClick={handleGoogleSignIn}
              className="w-full bg-white hover:bg-gray-50 text-gray-900 border border-gray-300 py-6 text-lg font-medium"
            >
              <Chrome className="h-5 w-5 mr-2" />
              Sign in with Google
            </Button>

            <p className="text-xs text-gray-500 text-center">
              By signing in, you agree to our terms of service and privacy policy
            </p>
          </CardContent>
        </Card>

        <div className="text-center text-sm text-gray-500">
          <p>After signing in, you'll connect your Reddit account to start moderating</p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
