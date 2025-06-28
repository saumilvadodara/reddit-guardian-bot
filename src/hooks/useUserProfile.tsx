
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
      console.log('Creating/updating profile for user:', user.id, 'reddit user:', redditUser);
      
      const { data, error } = await supabase
        .from('user_profiles')
        .upsert({
          user_id: user.id,
          reddit_username: redditUser.name,
          reddit_id: redditUser.id,
          is_mod: redditUser.is_mod || false,
          total_karma: redditUser.total_karma || 0
        }, {
          onConflict: 'user_id'
        })
        .select()
        .single();

      if (error) {
        console.error('Profile upsert error:', error);
        throw error;
      }
      
      console.log('Profile created/updated successfully:', data);
      setProfile(data);
      
      toast({
        title: "Profile Synced",
        description: "Reddit profile data has been synchronized",
      });
    } catch (error) {
      console.error('Error managing user profile:', error);
      toast({
        title: "Profile Sync Error",
        description: "Failed to sync Reddit profile data. Please try reconnecting your Reddit account.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return { profile, loading, createOrUpdateProfile };
}
