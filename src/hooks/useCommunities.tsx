
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useRedditAuth } from '@/hooks/useRedditAuth';
import { useToast } from '@/hooks/use-toast';

export function useCommunities() {
  const { user } = useAuth();
  const { redditToken } = useRedditAuth();
  const [communities, setCommunities] = useState([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchCommunities();
    }
  }, [user]);

  const fetchCommunities = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('communities')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCommunities(data || []);
    } catch (error) {
      console.error('Error fetching communities:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchModeratedSubreddits = async () => {
    if (!redditToken) return;

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('reddit-api', {
        body: { 
          endpoint: 'subreddits/mine/moderator',
          token: redditToken
        }
      });

      if (error) throw error;

      if (data && data.data && data.data.children) {
        const subreddits = data.data.children.map((child: any) => child.data);
        
        // Save to database
        for (const subreddit of subreddits) {
          await supabase
            .from('communities')
            .upsert({
              user_id: user.id,
              subreddit_name: subreddit.display_name,
              subreddit_id: subreddit.id,
              display_name: subreddit.display_name_prefixed,
              description: subreddit.public_description,
              subscribers: subreddit.subscribers,
              is_moderator: true,
              status: 'active'
            });
        }

        await fetchCommunities();
        toast({
          title: "Success",
          description: `Found ${subreddits.length} moderated communities`,
        });
      }
    } catch (error) {
      console.error('Error fetching moderated subreddits:', error);
      toast({
        title: "Error",
        description: "Failed to fetch moderated communities",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return { 
    communities, 
    loading, 
    fetchCommunities, 
    fetchModeratedSubreddits 
  };
}
