
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Users, Plus, Shield, Activity, Search, Settings } from "lucide-react";
import { useCommunities } from "@/hooks/useCommunities";
import { useRedditAuth } from "@/hooks/useRedditAuth";
import { useState } from "react";

const Communities = () => {
  const { communities, loading, fetchModeratedSubreddits } = useCommunities();
  const { isConnected } = useRedditAuth();
  const [searchTerm, setSearchTerm] = useState("");

  const filteredCommunities = communities.filter(community =>
    community.subreddit_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    community.display_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      case 'archived': return 'bg-gray-100 text-gray-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Communities</h1>
            <p className="text-gray-600 mt-2">Manage your Reddit communities and monitoring settings</p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={fetchModeratedSubreddits}
              disabled={!isConnected || loading}
              className="bg-orange-500 hover:bg-orange-600"
            >
              <Shield className="h-4 w-4 mr-2" />
              {loading ? "Syncing..." : "Sync Moderated Communities"}
            </Button>
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Community
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Community</DialogTitle>
                  <DialogDescription>
                    Add a Reddit community to monitor (you must be a moderator)
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="subreddit">Subreddit Name</Label>
                    <Input id="subreddit" placeholder="e.g., technology" />
                  </div>
                  <Button className="w-full">Add Community</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search communities..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Badge variant="secondary">
            {filteredCommunities.length} communities
          </Badge>
        </div>

        {!isConnected && (
          <Card className="border-orange-200 bg-orange-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 text-orange-800">
                <Shield className="h-5 w-5" />
                <p>Connect your Reddit account to sync your moderated communities</p>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCommunities.map((community) => (
            <Card key={community.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{community.display_name}</CardTitle>
                  <Badge className={getStatusColor(community.status)}>
                    {community.status}
                  </Badge>
                </div>
                <CardDescription className="line-clamp-2">
                  {community.description || "A Reddit community"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-gray-500" />
                    <span>{community.subscribers?.toLocaleString() || 0} members</span>
                  </div>
                  {community.is_moderator && (
                    <Badge variant="outline" className="text-green-600 border-green-600">
                      <Shield className="h-3 w-3 mr-1" />
                      Moderator
                    </Badge>
                  )}
                </div>
                
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Activity className="h-4 w-4 mr-2" />
                    View Activity
                  </Button>
                  <Button variant="outline" size="sm">
                    <Settings className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredCommunities.length === 0 && !loading && (
          <Card>
            <CardContent className="text-center py-12">
              <Users className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No communities found</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm ? "No communities match your search." : "Start by syncing your moderated communities from Reddit."}
              </p>
              {!searchTerm && isConnected && (
                <Button onClick={fetchModeratedSubreddits} disabled={loading}>
                  <Shield className="h-4 w-4 mr-2" />
                  Sync Communities
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Communities;
