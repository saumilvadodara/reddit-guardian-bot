
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface HeaderProps {
  user?: {
    username: string;
    avatar?: string;
    isAuthenticated: boolean;
  };
}

export function Header({ user }: HeaderProps) {
  const { signOut } = useAuth();
  const { toast } = useToast();

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      toast({
        title: "Sign out failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <header className="border-b bg-white shadow-sm">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-4">
          <SidebarTrigger />
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Reddit Moderation Dashboard</h1>
            <p className="text-sm text-gray-500">Automate and streamline your community moderation</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          {user?.isAuthenticated ? (
            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                Signed In
              </Badge>
              <div className="flex items-center gap-2">
                {user.avatar && (
                  <img src={user.avatar} alt="User avatar" className="h-8 w-8 rounded-full" />
                )}
                <span className="text-sm font-medium text-gray-700">{user.username}</span>
              </div>
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                Sign Out
              </Button>
            </div>
          ) : (
            <Button className="bg-orange-500 hover:bg-orange-600 text-white">
              Sign In
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
