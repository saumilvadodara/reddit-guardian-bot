
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Clock, Users, AlertCircle } from "lucide-react";

export function ActiveMonitoring() {
  // Mock data for active monitoring sessions
  const activeMonitoring = [
    {
      community: "r/technology",
      members: "14.2M",
      duration: "3 days remaining",
      progress: 60,
      violations: 5,
      status: "active",
    },
    {
      community: "r/programming",
      members: "5.1M",
      duration: "1 day remaining",
      progress: 85,
      violations: 12,
      status: "active",
    },
    {
      community: "r/webdev",
      members: "892K",
      duration: "5 days remaining",
      progress: 25,
      violations: 2,
      status: "active",
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Active Monitoring Sessions
        </CardTitle>
        <CardDescription>
          Communities currently being monitored for guideline violations
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {activeMonitoring.map((session) => (
          <div key={session.community} className="border rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h3 className="font-semibold text-lg">{session.community}</h3>
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  {session.status}
                </Badge>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Users className="h-4 w-4" />
                {session.members} members
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Monitoring Progress</span>
                <span className="font-medium">{session.duration}</span>
              </div>
              <Progress value={session.progress} className="h-2" />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm">
                <AlertCircle className="h-4 w-4 text-yellow-500" />
                <span>{session.violations} potential violations detected</span>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  View Details
                </Button>
                <Button variant="outline" size="sm">
                  Pause
                </Button>
              </div>
            </div>
          </div>
        ))}
        
        {activeMonitoring.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No active monitoring sessions</p>
            <Button className="mt-4">Start Monitoring</Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
