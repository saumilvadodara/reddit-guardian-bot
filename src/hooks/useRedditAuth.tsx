
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface RedditUser {
  name: string;
  id: string;
  is_mod: boolean;
}

export function useRedditAuth() {
  const [redditUser, setRedditUser] = useState<RedditUser | null>(null);
  const [redditToken, setRedditToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Check for stored Reddit token
    const storedToken = localStorage.getItem('reddit_token');
    if (storedToken) {
      setRedditToken(storedToken);
      fetchRedditUser(storedToken);
    }
  }, []);

  const fetchRedditUser = async (token: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('reddit-api', {
        body: { 
          endpoint: 'me',
          token: token
        }
      });

      if (error) throw error;
      setRedditUser(data);
    } catch (error) {
      console.error('Error fetching Reddit user:', error);
      toast({
        title: "Error",
        description: "Failed to fetch Reddit user data",
        variant: "destructive",
      });
    }
  };

  const connectToReddit = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('reddit-auth', {
        body: { action: 'getAuthUrl' }
      });

      if (error) throw error;
      
      // Redirect to Reddit OAuth
      window.location.href = data.authUrl;
    } catch (error) {
      console.error('Error connecting to Reddit:', error);
      toast({
        title: "Error",
        description: "Failed to connect to Reddit",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRedditCallback = async (code: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('reddit-auth', {
        body: { 
          action: 'exchangeCode',
          code: code
        }
      });

      if (error) throw error;

      setRedditToken(data.accessToken);
      localStorage.setItem('reddit_token', data.accessToken);
      await fetchRedditUser(data.accessToken);

      toast({
        title: "Success",
        description: "Successfully connected to Reddit!",
      });
    } catch (error) {
      console.error('Error handling Reddit callback:', error);
      toast({
        title: "Error",
        description: "Failed to complete Reddit authentication",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const disconnectReddit = () => {
    setRedditUser(null);
    setRedditToken(null);
    localStorage.removeItem('reddit_token');
    toast({
      title: "Disconnected",
      description: "Successfully disconnected from Reddit",
    });
  };

  return {
    redditUser,
    redditToken,
    loading,
    connectToReddit,
    handleRedditCallback,
    disconnectReddit,
    isConnected: !!redditToken
  };
}
