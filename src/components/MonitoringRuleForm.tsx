
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Plus } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';

type MonitoringType = Database['public']['Enums']['monitoring_type'];

interface MonitoringRuleFormProps {
  communities: any[];
  onRuleCreated: () => void;
}

export function MonitoringRuleForm({ communities, onRuleCreated }: MonitoringRuleFormProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newRule, setNewRule] = useState({
    name: '',
    community_id: '',
    monitoring_type: 'comments' as MonitoringType,
    keywords: '',
    is_active: true
  });

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
        monitoring_type: 'comments' as MonitoringType,
        keywords: '',
        is_active: true
      });
      
      onRuleCreated();
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

  return (
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
              onValueChange={(value) => setNewRule({ ...newRule, monitoring_type: value as MonitoringType })}
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
  );
}
