
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, Plus, Play, Pause, Clock, Settings } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useCommunities } from '@/hooks/useCommunities';
import { useToast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';

type ScheduleFrequency = Database['public']['Enums']['schedule_frequency'];

const Schedules = () => {
  const { user } = useAuth();
  const { communities } = useCommunities();
  const { toast } = useToast();
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newSchedule, setNewSchedule] = useState({
    name: '',
    description: '',
    community_id: '',
    frequency: 'daily' as ScheduleFrequency,
    is_active: true
  });

  useEffect(() => {
    if (user) {
      fetchSchedules();
    }
  }, [user]);

  const fetchSchedules = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('schedules')
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
      setSchedules(data || []);
    } catch (error) {
      console.error('Error fetching schedules:', error);
    } finally {
      setLoading(false);
    }
  };

  const createSchedule = async () => {
    if (!user || !newSchedule.name || !newSchedule.frequency) return;

    setLoading(true);
    try {
      // Calculate next run time based on frequency
      const nextRun = new Date();
      switch (newSchedule.frequency) {
        case 'hourly':
          nextRun.setHours(nextRun.getHours() + 1);
          break;
        case 'daily':
          nextRun.setDate(nextRun.getDate() + 1);
          break;
        case 'weekly':
          nextRun.setDate(nextRun.getDate() + 7);
          break;
        case 'monthly':
          nextRun.setMonth(nextRun.getMonth() + 1);
          break;
      }

      const { error } = await supabase
        .from('schedules')
        .insert({
          user_id: user.id,
          name: newSchedule.name,
          description: newSchedule.description,
          community_id: newSchedule.community_id || null,
          frequency: newSchedule.frequency,
          next_run: nextRun.toISOString(),
          is_active: newSchedule.is_active
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Schedule created successfully",
      });

      setIsDialogOpen(false);
      setNewSchedule({
        name: '',
        description: '',
        community_id: '',
        frequency: 'daily' as ScheduleFrequency,
        is_active: true
      });
      
      await fetchSchedules();
    } catch (error) {
      console.error('Error creating schedule:', error);
      toast({
        title: "Error",
        description: "Failed to create schedule",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleScheduleStatus = async (scheduleId: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('schedules')
        .update({ is_active: !isActive })
        .eq('id', scheduleId);

      if (error) throw error;
      await fetchSchedules();

      toast({
        title: "Success",
        description: `Schedule ${!isActive ? 'activated' : 'paused'}`,
      });
    } catch (error) {
      console.error('Error toggling schedule status:', error);
      toast({
        title: "Error",
        description: "Failed to update schedule",
        variant: "destructive",
      });
    }
  };

  const getFrequencyColor = (frequency: string) => {
    switch (frequency) {
      case 'hourly': return 'bg-red-100 text-red-800';
      case 'daily': return 'bg-blue-100 text-blue-800';
      case 'weekly': return 'bg-green-100 text-green-800';
      case 'monthly': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatNextRun = (nextRun: string) => {
    const date = new Date(nextRun);
    const now = new Date();
    const diff = date.getTime() - now.getTime();
    const hours = Math.round(diff / (1000 * 60 * 60));
    
    if (hours < 24) {
      return `in ${hours} hours`;
    } else {
      const days = Math.round(hours / 24);
      return `in ${days} days`;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Schedules</h1>
            <p className="text-gray-600 mt-2">Automate your moderation tasks with scheduled actions</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Schedule
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Create Schedule</DialogTitle>
                <DialogDescription>
                  Set up automated tasks for your communities
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="schedule-name">Schedule Name</Label>
                  <Input
                    id="schedule-name"
                    placeholder="e.g., Daily Report Generation"
                    value={newSchedule.name}
                    onChange={(e) => setNewSchedule({ ...newSchedule, name: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="What does this schedule do?"
                    value={newSchedule.description}
                    onChange={(e) => setNewSchedule({ ...newSchedule, description: e.target.value })}
                  />
                </div>
                
                <div>
                  <Label htmlFor="community">Community (Optional)</Label>
                  <Select
                    value={newSchedule.community_id}
                    onValueChange={(value) => setNewSchedule({ ...newSchedule, community_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All communities" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All communities</SelectItem>
                      {communities.map((community) => (
                        <SelectItem key={community.id} value={community.id}>
                          {community.display_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="frequency">Frequency</Label>
                  <Select
                    value={newSchedule.frequency}
                    onValueChange={(value) => setNewSchedule({ ...newSchedule, frequency: value as ScheduleFrequency })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hourly">Hourly</SelectItem>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="active"
                    checked={newSchedule.is_active}
                    onCheckedChange={(checked) => setNewSchedule({ ...newSchedule, is_active: checked })}
                  />
                  <Label htmlFor="active">Active</Label>
                </div>

                <Button onClick={createSchedule} disabled={loading} className="w-full">
                  {loading ? "Creating..." : "Create Schedule"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {schedules.map((schedule) => (
            <Card key={schedule.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{schedule.name}</CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge className={getFrequencyColor(schedule.frequency)}>
                      {schedule.frequency}
                    </Badge>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => toggleScheduleStatus(schedule.id, schedule.is_active)}
                    >
                      {schedule.is_active ? (
                        <Pause className="h-4 w-4 text-orange-600" />
                      ) : (
                        <Play className="h-4 w-4 text-green-600" />
                      )}
                    </Button>
                  </div>
                </div>
                <CardDescription className="line-clamp-2">
                  {schedule.description || "Automated moderation task"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">Status:</span>
                    <Badge variant={schedule.is_active ? "default" : "secondary"}>
                      {schedule.is_active ? "Active" : "Paused"}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">Community:</span>
                    <span className="text-gray-600">
                      {schedule.communities?.display_name || 'All'}
                    </span>
                  </div>

                  {schedule.next_run && schedule.is_active && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">Next run:</span>
                      <span className="text-gray-600">
                        {formatNextRun(schedule.next_run)}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 pt-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Clock className="h-4 w-4 mr-2" />
                    View History
                  </Button>
                  <Button variant="outline" size="sm">
                    <Settings className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {schedules.length === 0 && !loading && (
          <Card>
            <CardContent className="text-center py-12">
              <Calendar className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No schedules</h3>
              <p className="text-gray-600 mb-4">
                Create scheduled tasks to automate your moderation workflow
              </p>
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Schedule
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Schedules;
