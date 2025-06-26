
import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useRedditAuth } from '@/hooks/useRedditAuth';
import { Shield } from 'lucide-react';

const RedditCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { handleRedditCallback } = useRedditAuth();

  useEffect(() => {
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    if (error) {
      console.error('Reddit OAuth error:', error);
      navigate('/?reddit_error=' + error);
      return;
    }

    if (code) {
      handleRedditCallback(code).then(() => {
        navigate('/?reddit_connected=true');
      }).catch(() => {
        navigate('/?reddit_error=callback_failed');
      });
    } else {
      navigate('/');
    }
  }, [searchParams, handleRedditCallback, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center">
        <Shield className="h-16 w-16 text-blue-600 mx-auto mb-4 animate-spin" />
        <h1 className="text-xl font-semibold text-gray-900 mb-2">Connecting to Reddit...</h1>
        <p className="text-gray-600">Please wait while we complete the authentication process.</p>
      </div>
    </div>
  );
};

export default RedditCallback;
