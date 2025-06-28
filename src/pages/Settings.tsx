
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings as SettingsIcon, User, Shield, Database, Trash2, Download, Upload } from "lucide-react";
import { useAuth } from '@/hooks/useAuth';
import { useRedditAuth } from '@/hooks/useRedditAuth';
import { useToast } from '@/hooks/use-toast';

const Settings = () => {
  const { user, signOut } = useAuth();
  const { redditUser, disconnectReddit, isConnected } = useRedditAuth();
  const { toast } = useToast();

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      toast({
        title: "Error",
        description: "Failed to sign out",
        variant: "destructive",
      });
    }
  };

  const exportData = () => {
    toast({
      title: "Export Started",
      description: "Your data export will be ready shortly",
    });
  };

  const deleteAccount = () => {
    toast({
      title: "Account Deletion",
      description: "This feature will be available soon",
      variant: "destructive",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-2">Manage your account and application preferences</p>
        </div>

        <Tabs defaultValue="account" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="account">Account</TabsTrigger>
            <TabsTrigger value="reddit">Reddit</TabsTrigger>
            <TabsTrigger value="preferences">Preferences</TabsTrigger>
            <TabsTrigger value="data">Data</TabsTrigger>
          </TabsList>

          <TabsContent value="account" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <User className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle>Account Information</CardTitle>
                    <CardDescription>Your basic account details</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Email Address</Label>
                    <Input value={user?.email || ''} disabled />
                  </div>
                  <div>
                    <Label>User ID</Label>
                    <Input value={user?.id || ''} disabled className="font-mono text-xs" />
                  </div>
                  <div>
                    <Label>Account Created</Label>
                    <Input value={user?.created_at ? new Date(user.created_at).toLocaleDateString() : ''} disabled />
                  </div>
                  <div>
                    <Label>Last Sign In</Label>
                    <Input value={user?.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString() : ''} disabled />
                  </div>
                </div>
                
                <div className="pt-4 border-t">
                  <Button onClick={handleSignOut} variant="outline">
                    Sign Out
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reddit" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Shield className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <CardTitle>Reddit Integration</CardTitle>
                    <CardDescription>Manage your Reddit account connection</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {isConnected && redditUser ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg bg-green-50">
                      <div>
                        <p className="font-medium text-green-900">Connected as u/{redditUser.name}</p>
                        <p className="text-sm text-green-700">Reddit account is connected and active</p>
                      </div>
                      <Badge className="bg-green-100 text-green-800">Connected</Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Reddit Username</Label>
                        <Input value={`u/${redditUser.name}`} disabled />
                      </div>
                      <div>
                        <Label>Reddit ID</Label>
                        <Input value={redditUser.id || ''} disabled className="font-mono text-xs" />
                      </div>
                      <div>
                        <Label>Moderator Status</Label>
                        <div className="flex items-center gap-2 pt-2">
                          <Badge variant={redditUser.is_mod ? "default" : "secondary"}>
                            {redditUser.is_mod ? "Moderator" : "Regular User"}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 border-t">
                      <Button onClick={disconnectReddit} variant="destructive">
                        Disconnect Reddit Account
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Shield className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Reddit Not Connected</h3>
                    <p className="text-gray-600 mb-4">Connect your Reddit account to start using moderation features</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="preferences" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Application Preferences</CardTitle>
                <CardDescription>Customize your ModBot experience</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="font-medium">Dark Mode</Label>
                      <p className="text-sm text-gray-600">Use dark theme for the interface</p>
                    </div>
                    <Switch />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="font-medium">Auto-refresh Dashboard</Label>
                      <p className="text-sm text-gray-600">Automatically update dashboard data</p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="font-medium">Sound Notifications</Label>
                      <p className="text-sm text-gray-600">Play sound for important alerts</p>
                    </div>
                    <Switch />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="font-medium">Compact View</Label>
                      <p className="text-sm text-gray-600">Use condensed layout for lists</p>
                    </div>
                    <Switch />
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <div className="space-y-3">
                    <Label className="font-medium">Refresh Interval</Label>
                    <select className="w-full p-2 border rounded-md">
                      <option value="30">30 seconds</option>
                      <option value="60" selected>1 minute</option>
                      <option value="300">5 minutes</option>
                      <option value="600">10 minutes</option>
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="data" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Database className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <CardTitle>Data Management</CardTitle>
                    <CardDescription>Export, import, or delete your data</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center space-y-3">
                        <Download className="h-8 w-8 mx-auto text-blue-600" />
                        <h3 className="font-semibold">Export Data</h3>
                        <p className="text-sm text-gray-600">Download all your data in JSON format</p>
                        <Button onClick={exportData} className="w-full">
                          Export Data
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center space-y-3">
                        <Upload className="h-8 w-8 mx-auto text-green-600" />
                        <h3 className="font-semibold">Import Data</h3>
                        <p className="text-sm text-gray-600">Restore data from a previous export</p>
                        <Button variant="outline" className="w-full">
                          Import Data
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card className="border-red-200">
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <Trash2 className="h-5 w-5 text-red-600" />
                        <div>
                          <h3 className="font-semibold text-red-900">Danger Zone</h3>
                          <p className="text-sm text-red-700">Permanently delete your account and data</p>
                        </div>
                      </div>
                      <div className="bg-red-50 p-4 rounded-lg">
                        <p className="text-sm text-red-800">
                          This action cannot be undone. All your communities, monitoring rules, and alerts will be permanently deleted.
                        </p>
                      </div>
                      <Button onClick={deleteAccount} variant="destructive">
                        Delete Account
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Settings;
