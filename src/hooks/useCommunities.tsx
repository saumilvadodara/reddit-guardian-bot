import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useRedditAuth } from '@/hooks/useRedditAuth';
import { useToast } from '@/hooks/use-toast';

export function useCommunities() {
  const { user } = useAuth();
  const { redditToken, disconnectReddit } = useRedditAuth();
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
      
      const { data, error } = await supabase.functions.invoke('reddit-api', {
        body: { 
          endpoint: 'subreddits/mine/moderator',
          token: redditToken
        }
      });

      console.log('Moderated subreddits response:', { data, error });

      if (error) {
        console.error('Supabase function error:', error);
        throw new Error(error.message || 'Failed to fetch moderated subreddits');
      }

      // Handle the case where we need re-authentication
      if (data && data.needsReauth) {
        toast({
          title: "Re-authentication Required",
          description: "Your Reddit permissions need to be updated. Please disconnect and reconnect your Reddit account.",
          variant: "destructive",
        });
        disconnectReddit();
        return;
      }

      // Handle error responses from our edge function
      if (data && data.error) {
        console.error('Reddit API returned error:', data.error);
        
        // If it's a permission issue with empty data, show helpful message
        if (data.data && data.data.children && data.data.children.length === 0) {
          toast({
            title: "No Moderated Communities Found",
            description: data.message || "You don't appear to moderate any subreddits, or you need to reconnect with updated permissions.",
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
            description: "No moderated communities found for your account. Make sure you are a moderator of at least one subreddit, then try reconnecting your Reddit account.",
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
        console.log('Unexpected data structure or empty response:', data);
        
        toast({
          title: "Sync Issue",
          description: "Unable to process community data. Please try disconnecting and reconnecting your Reddit account with full moderator permissions.",
        });
      }
    } catch (error) {
      console.error('Error fetching moderated subreddits:', error);
      toast({
        title: "Sync Error",
        description: `Failed to sync communities: ${error.message}. Try reconnecting your Reddit account.`,
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
