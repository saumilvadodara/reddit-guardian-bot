
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, MessageSquare, Clock } from "lucide-react";

export function RecentAlerts() {
  // Mock data for recent alerts
  const alerts = [
    {
      id: 1,
      community: "r/technology",
      type: "Spam",
      severity: "high",
      comment: "Check out this amazing deal on crypto...",
      author: "u/spambot123",
      time: "2 minutes ago",
      action: "pending",
    },
    {
      id: 2,
      community: "r/programming",
      type: "Harassment",
      severity: "medium",
      comment: "Your code is terrible and you should...",
      author: "u/toxicuser",
      time: "15 minutes ago",
      action: "pending",
    },
    {
      id: 3,
      community: "r/webdev",
      type: "Off-topic",
      severity: "low",
      comment: "What's your favorite pizza topping?",
      author: "u/randomuser",
      time: "1 hour ago",
      action: "resolved",
    },
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high": return "bg-red-100 text-red-800";
      case "medium": return "bg-yellow-100 text-yellow-800";
      case "low": return "bg-blue-100 text-blue-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          Recent Alerts
        </CardTitle>
        <CardDescription>
          Latest guideline violations detected across your communities
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {alerts.map((alert) => (
          <div key={alert.id} className="border rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Badge variant="secondary" className={getSeverityColor(alert.severity)}>
                  {alert.severity} - {alert.type}
                </Badge>
                <span className="text-sm text-gray-600">{alert.community}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Clock className="h-4 w-4" />
                {alert.time}
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-start gap-3">
                <MessageSquare className="h-4 w-4 mt-1 text-gray-400" />
                <div className="flex-1">
                  <p className="text-sm text-gray-700 italic">"{alert.comment}"</p>
                  <p className="text-xs text-gray-500 mt-1">by {alert.author}</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <Badge variant={alert.action === "resolved" ? "secondary" : "outline"}>
                {alert.action === "resolved" ? "Resolved" : "Pending Review"}
              </Badge>
              {alert.action === "pending" && (
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    Approve
                  </Button>
                  <Button variant="destructive" size="sm">
                    Remove
                  </Button>
                  <Button variant="secondary" size="sm">
                    Warn User
                  </Button>
                </div>
              )}
            </div>
          </div>
        ))}
        
        {alerts.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No recent alerts</p>
            <p className="text-sm">Your communities are running smoothly!</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
