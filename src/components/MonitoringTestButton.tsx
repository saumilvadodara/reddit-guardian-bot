
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Play, Loader2 } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export function MonitoringTestButton() {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const triggerMonitoring = async () => {
    setLoading(true);
    try {
      console.log('Triggering Reddit monitoring...');
      
      const { data, error } = await supabase.functions.invoke('reddit-monitor');

      console.log('Monitoring response:', { data, error });

      if (error) {
        throw error;
      }

      toast({
        title: "Monitoring Triggered",
        description: data?.message || "Reddit monitoring process has been triggered successfully",
      });

    } catch (error) {
      console.error('Error triggering monitoring:', error);
      toast({
        title: "Error",
        description: "Failed to trigger Reddit monitoring. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button 
      onClick={triggerMonitoring} 
      disabled={loading}
      variant="outline"
      className="flex items-center gap-2"
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Play className="h-4 w-4" />
      )}
      {loading ? "Checking..." : "Check for Alerts"}
    </Button>
  );
}
