
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useRedditAuth } from '@/hooks/useRedditAuth';
import { useToast } from '@/hooks/use-toast';

export function useUserProfile() {
  const { user } = useAuth();
  const { redditUser } = useRedditAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (user && redditUser) {
      createOrUpdateProfile();
    }
  }, [user, redditUser]);

  const createOrUpdateProfile = async () => {
    if (!user || !redditUser) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .upsert({
          user_id: user.id,
          reddit_username: redditUser.name,
          reddit_id: redditUser.id,
          is_mod: redditUser.is_mod || false,
          total_karma: redditUser.total_karma || 0
        })
        .select()
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Error managing user profile:', error);
      toast({
        title: "Profile Error",
        description: "Failed to sync Reddit profile data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return { profile, loading };
}
