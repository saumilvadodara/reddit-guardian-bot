
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface RedditUser {
  name: string;
  id: string;
  is_mod: boolean;
  total_karma?: number;
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
    console.log('Fetching Reddit user with token...');
    try {
      const { data, error } = await supabase.functions.invoke('reddit-api', {
        body: { 
          endpoint: 'api/v1/me',
          token: token
        }
      });

      console.log('Reddit user fetch response:', { data, error });

      if (error) {
        console.error('Supabase function error:', error);
        throw new Error(error.message || 'Failed to fetch Reddit user data');
      }
      
      if (data && data.error) {
        console.error('Reddit API returned error:', data.error);
        throw new Error(data.error);
      }

      if (!data || !data.name) {
        throw new Error('Invalid user data received from Reddit');
      }

      console.log('Reddit user data received:', data);
      
      // Map the Reddit API response to our RedditUser interface
      const mappedUser: RedditUser = {
        name: data.name,
        id: data.id,
        is_mod: data.is_mod || false,
        total_karma: data.total_karma || 0
      };
      
      setRedditUser(mappedUser);
      
      toast({
        title: "Success",
        description: `Connected as u/${data.name}`,
      });
    } catch (error) {
      console.error('Error fetching Reddit user:', error);
      
      // Clear invalid token
      localStorage.removeItem('reddit_token');
      setRedditToken(null);
      setRedditUser(null);
      
      toast({
        title: "Authentication Error",
        description: error.message || "Failed to fetch Reddit user data. Please reconnect your account.",
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
