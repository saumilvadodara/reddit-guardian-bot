
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
    if (!redditToken) {
      toast({
        title: "Authentication Required",
        description: "Please connect your Reddit account first",
        variant: "destructive",
      });
      return;
    }

    if (!user) {
      toast({
        title: "User Error",
        description: "User not authenticated",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      console.log('Fetching moderated subreddits...');
      
      // Try to get moderated subreddits
      const { data, error } = await supabase.functions.invoke('reddit-api', {
        body: { 
          endpoint: 'subreddits/mine/moderator',
          token: redditToken
        }
      });

      console.log('Moderated subreddits response:', { data, error });

      if (error) {
        console.error('Supabase function error:', error);
        throw error;
      }

      if (data && data.error) {
        console.error('Reddit API returned error:', data.error);
        
        // If we get a 403, it might mean the user has no moderated subreddits
        // or the scope is insufficient. Let's inform the user appropriately.
        if (data.error.includes('403') || data.error.includes('Forbidden')) {
          toast({
            title: "No Moderated Communities",
            description: "You don't appear to moderate any subreddits, or your Reddit account needs additional permissions.",
            variant: "destructive",
          });
          return;
        }
        
        throw new Error(data.error);
      }

      // Check if we have valid data structure
      if (data && data.data && data.data.children && Array.isArray(data.data.children)) {
        const subreddits = data.data.children.map((child: any) => child.data);
        
        console.log(`Found ${subreddits.length} moderated subreddits:`, subreddits);
        
        if (subreddits.length === 0) {
          toast({
            title: "No Communities Found",
            description: "No moderated communities found for your account",
          });
          return;
        }

        // Save to database
        let successCount = 0;
        for (const subreddit of subreddits) {
          try {
            const { error: upsertError } = await supabase
              .from('communities')
              .upsert({
                user_id: user.id,
                subreddit_name: subreddit.display_name,
                subreddit_id: subreddit.id,
                display_name: subreddit.display_name_prefixed,
                description: subreddit.public_description || subreddit.description || '',
                subscribers: subreddit.subscribers || 0,
                is_moderator: true,
                status: 'active'
              }, {
                onConflict: 'user_id,subreddit_name'
              });

            if (upsertError) {
              console.error('Error upserting subreddit:', subreddit.display_name, upsertError);
            } else {
              successCount++;
            }
          } catch (error) {
            console.error('Error processing subreddit:', subreddit.display_name, error);
          }
        }

        await fetchCommunities();
        
        toast({
          title: "Success",
          description: `Successfully synced ${successCount} moderated communities`,
        });
      } else {
        console.log('Unexpected data structure:', data);
        toast({
          title: "Unexpected Response",
          description: "Received unexpected data from Reddit API",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error fetching moderated subreddits:', error);
      toast({
        title: "Sync Error",
        description: `Failed to sync communities: ${error.message}`,
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
