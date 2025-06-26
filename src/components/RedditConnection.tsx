
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Shield, AlertCircle, CheckCircle, Users } from "lucide-react";
import { useRedditAuth } from "@/hooks/useRedditAuth";

export function RedditConnection() {
  const { redditUser, loading, connectToReddit, disconnectReddit, isConnected } = useRedditAuth();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-orange-500" />
          Reddit Connection
        </CardTitle>
        <CardDescription>
          Connect your Reddit account to access moderation features
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isConnected && redditUser ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="font-medium">Connected as u/{redditUser.name}</span>
              </div>
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                Connected
              </Badge>
            </div>
            
            {redditUser.is_mod && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Users className="h-4 w-4" />
                <span>Moderator privileges detected</span>
              </div>
            )}

            <Button 
              variant="outline" 
              size="sm" 
              onClick={disconnectReddit}
              className="w-full"
            >
              Disconnect Reddit Account
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-orange-600">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">Reddit account not connected</span>
            </div>
            
            <div className="text-xs text-gray-500 space-y-1">
              <p>• Access to your moderated communities</p>
              <p>• View posts and comments for moderation</p>
              <p>• Manage flairs and user permissions</p>
            </div>

            <Button 
              onClick={connectToReddit}
              disabled={loading}
              className="w-full bg-orange-500 hover:bg-orange-600"
            >
              {loading ? "Connecting..." : "Connect Reddit Account"}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
