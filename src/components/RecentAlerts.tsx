
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, MessageSquare, Clock } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export function RecentAlerts() {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchRecentAlerts();
    }
  }, [user]);

  const fetchRecentAlerts = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('alerts')
        .select(`
          *,
          communities (
            subreddit_name,
            display_name
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      setAlerts(data || []);
    } catch (error) {
      console.error('Error fetching recent alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical": return "bg-red-100 text-red-800";
      case "high": return "bg-red-100 text-red-800";
      case "medium": return "bg-yellow-100 text-yellow-800";
      case "low": return "bg-blue-100 text-blue-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const markAsRead = async (alertId: string) => {
    try {
      await supabase
        .from('alerts')
        .update({ is_read: true })
        .eq('id', alertId);
      
      await fetchRecentAlerts();
    } catch (error) {
      console.error('Error marking alert as read:', error);
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const alertTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - alertTime.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes} minutes ago`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)} hours ago`;
    } else {
      return `${Math.floor(diffInMinutes / 1440)} days ago`;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Recent Alerts
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
          <AlertTriangle className="h-5 w-5" />
          Recent Alerts
        </CardTitle>
        <CardDescription>
          Latest guideline violations detected across your communities
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {alerts.map((alert) => (
          <div key={alert.id} className="border rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Badge variant="secondary" className={getSeverityColor(alert.severity)}>
                  {alert.severity} 
                </Badge>
                <span className="text-sm text-gray-600">
                  {alert.communities?.display_name || 'Unknown Community'}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Clock className="h-4 w-4" />
                {formatTimeAgo(alert.created_at)}
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-start gap-3">
                <MessageSquare className="h-4 w-4 mt-1 text-gray-400" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{alert.title}</p>
                  {alert.description && (
                    <p className="text-sm text-gray-600 mt-1">{alert.description}</p>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <Badge variant={alert.is_read ? "secondary" : "outline"}>
                {alert.is_read ? "Read" : "Unread"}
              </Badge>
              {!alert.is_read && (
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => markAsRead(alert.id)}
                  >
                    Mark as Read
                  </Button>
                  <Button variant="destructive" size="sm">
                    Take Action
                  </Button>
                </div>
              )}
            </div>
          </div>
        ))}
        
        {alerts.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No recent alerts</p>
            <p className="text-sm">Your communities are running smoothly!</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
