
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Eye, Plus, Play, Pause, Settings, AlertTriangle } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useCommunities } from '@/hooks/useCommunities';
import { useToast } from '@/hooks/use-toast';

const Monitoring = () => {
  const { user } = useAuth();
  const { communities } = useCommunities();
  const { toast } = useToast();
  const [monitoringRules, setMonitoringRules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newRule, setNewRule] = useState({
    name: '',
    community_id: '',
    monitoring_type: 'comments',
    keywords: '',
    is_active: true
  });

  useEffect(() => {
    if (user) {
      fetchMonitoringRules();
    }
  }, [user]);

  const fetchMonitoringRules = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('monitoring_rules')
        .select(`
          *,
          communities (
            subreddit_name,
            display_name
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMonitoringRules(data || []);
    } catch (error) {
      console.error('Error fetching monitoring rules:', error);
    } finally {
      setLoading(false);
    }
  };

  const createMonitoringRule = async () => {
    if (!user || !newRule.name || !newRule.community_id) return;

    setLoading(true);
    try {
      const keywordsArray = newRule.keywords.split(',').map(k => k.trim()).filter(k => k);
      
      const { error } = await supabase
        .from('monitoring_rules')
        .insert({
          user_id: user.id,
          name: newRule.name,
          community_id: newRule.community_id,
          monitoring_type: newRule.monitoring_type,
          keywords: keywordsArray,
          is_active: newRule.is_active
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Monitoring rule created successfully",
      });

      setIsDialogOpen(false);
      setNewRule({
        name: '',
        community_id: '',
        monitoring_type: 'comments',
        keywords: '',
        is_active: true
      });
      
      await fetchMonitoringRules();
    } catch (error) {
      console.error('Error creating monitoring rule:', error);
      toast({
        title: "Error",
        description: "Failed to create monitoring rule",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleRuleStatus = async (ruleId: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('monitoring_rules')
        .update({ is_active: !isActive })
        .eq('id', ruleId);

      if (error) throw error;
      await fetchMonitoringRules();

      toast({
        title: "Success",
        description: `Monitoring rule ${!isActive ? 'activated' : 'paused'}`,
      });
    } catch (error) {
      console.error('Error toggling rule status:', error);
      toast({
        title: "Error",
        description: "Failed to update monitoring rule",
        variant: "destructive",
      });
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'posts': return 'bg-blue-100 text-blue-800';
      case 'comments': return 'bg-green-100 text-green-800';
      case 'modqueue': return 'bg-yellow-100 text-yellow-800';
      case 'reports': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Active Monitoring</h1>
            <p className="text-gray-600 mt-2">Configure and manage your Reddit monitoring rules</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Monitoring Rule
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Create Monitoring Rule</DialogTitle>
                <DialogDescription>
                  Set up automated monitoring for your communities
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="rule-name">Rule Name</Label>
                  <Input
                    id="rule-name"
                    placeholder="e.g., Spam Detection"
                    value={newRule.name}
                    onChange={(e) => setNewRule({ ...newRule, name: e.target.value })}
                  />
                </div>
                
                <div>
                  <Label htmlFor="community">Community</Label>
                  <Select
                    value={newRule.community_id}
                    onValueChange={(value) => setNewRule({ ...newRule, community_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a community" />
                    </SelectTrigger>
                    <SelectContent>
                      {communities.map((community) => (
                        <SelectItem key={community.id} value={community.id}>
                          {community.display_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="monitoring-type">Monitoring Type</Label>
                  <Select
                    value={newRule.monitoring_type}
                    onValueChange={(value) => setNewRule({ ...newRule, monitoring_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="posts">Posts</SelectItem>
                      <SelectItem value="comments">Comments</SelectItem>
                      <SelectItem value="modqueue">Mod Queue</SelectItem>
                      <SelectItem value="reports">Reports</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="keywords">Keywords (comma-separated)</Label>
                  <Textarea
                    id="keywords"
                    placeholder="spam, promotion, affiliate, buy now"
                    value={newRule.keywords}
                    onChange={(e) => setNewRule({ ...newRule, keywords: e.target.value })}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="active"
                    checked={newRule.is_active}
                    onCheckedChange={(checked) => setNewRule({ ...newRule, is_active: checked })}
                  />
                  <Label htmlFor="active">Active</Label>
                </div>

                <Button onClick={createMonitoringRule} disabled={loading} className="w-full">
                  {loading ? "Creating..." : "Create Rule"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {monitoringRules.map((rule) => (
            <Card key={rule.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{rule.name}</CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge className={getTypeColor(rule.monitoring_type)}>
                      {rule.monitoring_type}
                    </Badge>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => toggleRuleStatus(rule.id, rule.is_active)}
                    >
                      {rule.is_active ? (
                        <Pause className="h-4 w-4 text-orange-600" />
                      ) : (
                        <Play className="h-4 w-4 text-green-600" />
                      )}
                    </Button>
                  </div>
                </div>
                <CardDescription>
                  {rule.communities?.display_name || 'Unknown Community'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Status:</span>
                  <Badge variant={rule.is_active ? "default" : "secondary"}>
                    {rule.is_active ? "Active" : "Paused"}
                  </Badge>
                </div>

                {rule.keywords && rule.keywords.length > 0 && (
                  <div>
                    <span className="text-sm font-medium">Keywords:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {rule.keywords.slice(0, 3).map((keyword, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {keyword}
                        </Badge>
                      ))}
                      {rule.keywords.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{rule.keywords.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Eye className="h-4 w-4 mr-2" />
                    View Alerts
                  </Button>
                  <Button variant="outline" size="sm">
                    <Settings className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {monitoringRules.length === 0 && !loading && (
          <Card>
            <CardContent className="text-center py-12">
              <AlertTriangle className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No monitoring rules</h3>
              <p className="text-gray-600 mb-4">
                Create your first monitoring rule to start automated community moderation
              </p>
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Monitoring Rule
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Monitoring;
