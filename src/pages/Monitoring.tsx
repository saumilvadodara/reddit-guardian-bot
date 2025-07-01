
import { useState, useEffect } from "react";
import { useAuth } from '@/hooks/useAuth';
import { useCommunities } from '@/hooks/useCommunities';
import { supabase } from '@/integrations/supabase/client';
import { BackButton } from '@/components/BackButton';
import { MonitoringRuleForm } from '@/components/MonitoringRuleForm';
import { MonitoringRuleCard } from '@/components/MonitoringRuleCard';
import { MonitoringEmptyState } from '@/components/MonitoringEmptyState';

const Monitoring = () => {
  const { user } = useAuth();
  const { communities } = useCommunities();
  const [monitoringRules, setMonitoringRules] = useState([]);
  const [loading, setLoading] = useState(false);

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

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <BackButton to="/" />
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Active Monitoring</h1>
            <p className="text-gray-600 mt-2">Configure and manage your Reddit monitoring rules</p>
          </div>
          <MonitoringRuleForm communities={communities} onRuleCreated={fetchMonitoringRules} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {monitoringRules.map((rule) => (
            <MonitoringRuleCard 
              key={rule.id} 
              rule={rule} 
              onRuleUpdated={fetchMonitoringRules} 
            />
          ))}
        </div>

        {monitoringRules.length === 0 && !loading && (
          <MonitoringEmptyState onCreateRule={() => {}} />
        )}
      </div>
    </div>
  );
};

export default Monitoring;
