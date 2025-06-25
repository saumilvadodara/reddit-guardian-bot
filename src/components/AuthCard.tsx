
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, Lock, Users } from "lucide-react";

export function AuthCard() {
  const handleRedditLogin = () => {
    // This will be implemented with actual Reddit OAuth
    console.log("Initiating Reddit OAuth flow...");
    // For now, show a placeholder
    alert("Reddit OAuth integration will be set up with Supabase backend!");
  };

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
            <CardTitle className="text-xl">Connect Your Reddit Account</CardTitle>
            <CardDescription>
              Authorize ModBot to help moderate your communities more efficiently
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <Lock className="h-4 w-4 text-green-600" />
                <span>Secure OAuth 2.0 authentication</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <Users className="h-4 w-4 text-green-600" />
                <span>Access to your moderated communities</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <Shield className="h-4 w-4 text-green-600" />
                <span>Read-only access to posts and comments</span>
              </div>
            </div>

            <Button 
              onClick={handleRedditLogin}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white py-6 text-lg font-medium"
            >
              Connect with Reddit
            </Button>

            <p className="text-xs text-gray-500 text-center">
              By connecting, you agree to our terms and Reddit's API usage policies
            </p>
          </CardContent>
        </Card>

        <div className="text-center text-sm text-gray-500">
          <p>New to Reddit moderation? Learn more about community guidelines</p>
        </div>
      </div>
    </div>
  );
}
