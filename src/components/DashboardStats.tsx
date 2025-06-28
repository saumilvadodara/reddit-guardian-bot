
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Clock, CheckCircle, AlertTriangle } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export function DashboardStats() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    communities: 0,
    monitoringRules: 0,
    alerts: 0,
    schedules: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchStats();
    }
  }, [user]);

  const fetchStats = async () => {
    if (!user) return;

    try {
      const [communitiesRes, rulesRes, alertsRes, schedulesRes] = await Promise.all([
        supabase.from('communities').select('id', { count: 'exact' }).eq('user_id', user.id),
        supabase.from('monitoring_rules').select('id', { count: 'exact' }).eq('user_id', user.id).eq('is_active', true),
        supabase.from('alerts').select('id', { count: 'exact' }).eq('user_id', user.id).eq('is_read', false),
        supabase.from('schedules').select('id', { count: 'exact' }).eq('user_id', user.id).eq('is_active', true)
      ]);

      setStats({
        communities: communitiesRes.count || 0,
        monitoringRules: rulesRes.count || 0,
        alerts: alertsRes.count || 0,
        schedules: schedulesRes.count || 0
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statItems = [
    {
      title: "Communities Monitored",
      value: loading ? "..." : stats.communities.toString(),
      description: "Active communities",
      icon: Shield,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "Active Rules",
      value: loading ? "..." : stats.monitoringRules.toString(),
      description: "Monitoring rules running",
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "Unread Alerts",
      value: loading ? "..." : stats.alerts.toString(),
      description: "Awaiting review",
      icon: AlertTriangle,
      color: "text-yellow-600",
      bgColor: "bg-yellow-100",
    },
    {
      title: "Active Schedules",
      value: loading ? "..." : stats.schedules.toString(),
      description: "Automated tasks",
      icon: Clock,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statItems.map((stat) => (
        <Card key={stat.title} className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              {stat.title}
            </CardTitle>
            <div className={`p-2 rounded-lg ${stat.bgColor}`}>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
            <p className="text-xs text-gray-500 mt-1">{stat.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
