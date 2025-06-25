
import { useState } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { AuthCard } from "@/components/AuthCard";
import { DashboardStats } from "@/components/DashboardStats";
import { ActiveMonitoring } from "@/components/ActiveMonitoring";
import { RecentAlerts } from "@/components/RecentAlerts";

const Index = () => {
  // Mock authentication state - will be replaced with real auth
  const [user, setUser] = useState({
    username: "moderator_user",
    avatar: "https://i.pravatar.cc/32",
    isAuthenticated: true, // Set to false to see login screen
  });

  if (!user.isAuthenticated) {
    return <AuthCard />;
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gray-50">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          <Header user={user} />
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
