
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { DashboardStats } from "@/components/DashboardStats";
import { ActiveMonitoring } from "@/components/ActiveMonitoring";
import { RecentAlerts } from "@/components/RecentAlerts";
import { useAuth } from "@/hooks/useAuth";

const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to auth page
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gray-50">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          <Header user={{
            username: user.user_metadata?.full_name || user.email || "User",
            avatar: user.user_metadata?.avatar_url,
            isAuthenticated: true
          }} />
          <main className="flex-1 p-6 space-y-6">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-gray-900">Dashboard Overview</h2>
              <p className="text-gray-600">Monitor your Reddit communities and streamline moderation tasks</p>
            </div>
            
            <DashboardStats />
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ActiveMonitoring />
              <RecentAlerts />
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Index;
