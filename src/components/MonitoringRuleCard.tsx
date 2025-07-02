
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, Play, Pause, Settings, Brain } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface MonitoringRuleCardProps {
  rule: any;
  onRuleUpdated: () => void;
}

export function MonitoringRuleCard({ rule, onRuleUpdated }: MonitoringRuleCardProps) {
  const { toast } = useToast();

  const toggleRuleStatus = async (ruleId: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('monitoring_rules')
        .update({ is_active: !isActive })
        .eq('id', ruleId);

      if (error) throw error;
      onRuleUpdated();

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
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle className="text-lg">{rule.name}</CardTitle>
            {rule.use_openai && (
              <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                <Brain className="h-3 w-3 mr-1" />
                AI
              </Badge>
            )}
          </div>
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

        {rule.use_openai ? (
          <div>
            <span className="text-sm font-medium">AI Prompt:</span>
            <p className="text-sm text-gray-600 mt-1 line-clamp-2">
              {rule.openai_prompt || 'No prompt configured'}
            </p>
          </div>
        ) : (
          rule.keywords && rule.keywords.length > 0 && (
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
          )
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
  );
}
