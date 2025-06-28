
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Users, AlertCircle, Eye, Settings } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export function ActiveMonitoring() {
  const { user } = useAuth();
  const [monitoringRules, setMonitoringRules] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchActiveMonitoring();
    }
  }, [user]);

  const fetchActiveMonitoring = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('monitoring_rules')
        .select(`
          *,
          communities (
            subreddit_name,
            display_name,
            subscribers
          )
        `)
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(3);

      if (error) throw error;
      setMonitoringRules(data || []);
    } catch (error) {
      console.error('Error fetching active monitoring:', error);
    } finally {
      setLoading(false);
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

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Active Monitoring Sessions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-2">Loading...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Active Monitoring Sessions
        </CardTitle>
        <CardDescription>
          Communities currently being monitored for guideline violations
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {monitoringRules.map((rule) => (
          <div key={rule.id} className="border rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h3 className="font-semibold text-lg">
                  {rule.communities?.display_name || 'Unknown Community'}
                </h3>
                <Badge className={getTypeColor(rule.monitoring_type)}>
                  {rule.monitoring_type}
                </Badge>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Users className="h-4 w-4" />
                {rule.communities?.subscribers?.toLocaleString() || 0} members
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Rule: {rule.name}</span>
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  Active
                </Badge>
              </div>
              {rule.keywords && rule.keywords.length > 0 && (
                <div className="flex flex-wrap gap-1">
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
              )}
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm">
                <AlertCircle className="h-4 w-4 text-green-500" />
                <span>Monitoring active</span>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Eye className="h-4 w-4 mr-2" />
                  View Details
                </Button>
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}
        
        {monitoringRules.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No active monitoring sessions</p>
            <Button className="mt-4" onClick={() => window.location.href = '/monitoring'}>
              Start Monitoring
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
