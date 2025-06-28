
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Bell, Mail, Webhook, Save, TestTube } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

const Notifications = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [settings, setSettings] = useState({
    email: { enabled: false, address: '' },
    webhook: { enabled: false, url: '' },
    in_app: { enabled: true }
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchNotificationSettings();
    }
  }, [user]);

  const fetchNotificationSettings = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('notification_settings')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;

      const newSettings = { ...settings };
      data?.forEach((setting) => {
        if (setting.notification_type === 'email') {
          newSettings.email = {
            enabled: setting.is_enabled,
            address: setting.email_address || ''
          };
        } else if (setting.notification_type === 'webhook') {
          newSettings.webhook = {
            enabled: setting.is_enabled,
            url: setting.webhook_url || ''
          };
        } else if (setting.notification_type === 'in_app') {
          newSettings.in_app = { enabled: setting.is_enabled };
        }
      });
      setSettings(newSettings);
    } catch (error) {
      console.error('Error fetching notification settings:', error);
    }
  };

  const saveNotificationSettings = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Upsert email settings
      await supabase
        .from('notification_settings')
        .upsert({
          user_id: user.id,
          notification_type: 'email',
          is_enabled: settings.email.enabled,
          email_address: settings.email.address
        });

      // Upsert webhook settings
      await supabase
        .from('notification_settings')
        .upsert({
          user_id: user.id,
          notification_type: 'webhook',
          is_enabled: settings.webhook.enabled,
          webhook_url: settings.webhook.url
        });

      // Upsert in-app settings
      await supabase
        .from('notification_settings')
        .upsert({
          user_id: user.id,
          notification_type: 'in_app',
          is_enabled: settings.in_app.enabled
        });

      toast({
        title: "Success",
        description: "Notification settings saved successfully",
      });
    } catch (error) {
      console.error('Error saving notification settings:', error);
      toast({
        title: "Error",
        description: "Failed to save notification settings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const testNotification = async (type: string) => {
    toast({
      title: "Test Notification",
      description: `This would send a test ${type} notification`,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
            <p className="text-gray-600 mt-2">Configure how you receive alerts and updates</p>
          </div>
          <Button onClick={saveNotificationSettings} disabled={loading}>
            <Save className="h-4 w-4 mr-2" />
            {loading ? "Saving..." : "Save Settings"}
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* In-App Notifications */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Bell className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <CardTitle>In-App Notifications</CardTitle>
                  <CardDescription>Receive notifications within the application</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="in-app-enabled" className="font-medium">
                    Enable in-app notifications
                  </Label>
                  <p className="text-sm text-gray-600">Show alerts in the browser</p>
                </div>
                <Switch
                  id="in-app-enabled"
                  checked={settings.in_app.enabled}
                  onCheckedChange={(checked) =>
                    setSettings({
                      ...settings,
                      in_app: { enabled: checked }
                    })
                  }
                />
              </div>
              
              <div className="pt-2">
                <Badge variant={settings.in_app.enabled ? "default" : "secondary"}>
                  {settings.in_app.enabled ? "Enabled" : "Disabled"}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Email Notifications */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Mail className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <CardTitle>Email Notifications</CardTitle>
                  <CardDescription>Receive alerts via email</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="email-enabled" className="font-medium">
                    Enable email notifications
                  </Label>
                  <p className="text-sm text-gray-600">Send alerts to your email</p>
                </div>
                <Switch
                  id="email-enabled"
                  checked={settings.email.enabled}
                  onCheckedChange={(checked) =>
                    setSettings({
                      ...settings,
                      email: { ...settings.email, enabled: checked }
                    })
                  }
                />
              </div>

              {settings.email.enabled && (
                <div className="space-y-2">
                  <Label htmlFor="email-address">Email Address</Label>
                  <Input
                    id="email-address"
                    type="email"
                    placeholder="your@email.com"
                    value={settings.email.address}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        email: { ...settings.email, address: e.target.value }
                      })
                    }
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => testNotification('email')}
                    className="w-full"
                  >
                    <TestTube className="h-4 w-4 mr-2" />
                    Test Email
                  </Button>
                </div>
              )}
              
              <div className="pt-2">
                <Badge variant={settings.email.enabled ? "default" : "secondary"}>
                  {settings.email.enabled ? "Enabled" : "Disabled"}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Webhook Notifications */}
          <Card className="md:col-span-2">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Webhook className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <CardTitle>Webhook Notifications</CardTitle>
                  <CardDescription>Send alerts to external services via HTTP webhooks</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="webhook-enabled" className="font-medium">
                    Enable webhook notifications
                  </Label>
                  <p className="text-sm text-gray-600">Send POST requests to your endpoint</p>
                </div>
                <Switch
                  id="webhook-enabled"
                  checked={settings.webhook.enabled}
                  onCheckedChange={(checked) =>
                    setSettings({
                      ...settings,
                      webhook: { ...settings.webhook, enabled: checked }
                    })
                  }
                />
              </div>

              {settings.webhook.enabled && (
                <div className="space-y-2">
                  <Label htmlFor="webhook-url">Webhook URL</Label>
                  <Input
                    id="webhook-url"
                    type="url"
                    placeholder="https://your-service.com/webhook"
                    value={settings.webhook.url}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        webhook: { ...settings.webhook, url: e.target.value }
                      })
                    }
                  />
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => testNotification('webhook')}
                      className="flex-1"
                    >
                      <TestTube className="h-4 w-4 mr-2" />
                      Test Webhook
                    </Button>
                  </div>
                  <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
                    <p className="font-medium mb-1">Webhook Payload Format:</p>
                    <code className="text-xs">
                      {JSON.stringify({
                        alert_id: "uuid",
                        title: "Alert Title",
                        severity: "high",
                        community: "r/example",
                        timestamp: "ISO 8601"
                      }, null, 2)}
                    </code>
                  </div>
                </div>
              )}
              
              <div className="pt-2">
                <Badge variant={settings.webhook.enabled ? "default" : "secondary"}>
                  {settings.webhook.enabled ? "Enabled" : "Disabled"}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Notification Preferences */}
        <Card>
          <CardHeader>
            <CardTitle>Alert Preferences</CardTitle>
            <CardDescription>Choose which types of alerts you want to receive</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { label: "High Severity Alerts", description: "Critical issues requiring immediate attention" },
                { label: "Medium Severity Alerts", description: "Moderate issues for review" },
                { label: "Low Severity Alerts", description: "Minor issues and informational alerts" },
                { label: "Daily Summaries", description: "Summary of moderation activity" },
                { label: "Weekly Reports", description: "Comprehensive weekly analysis" },
                { label: "System Updates", description: "Application updates and maintenance" }
              ].map((pref, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{pref.label}</p>
                    <p className="text-sm text-gray-600">{pref.description}</p>
                  </div>
                  <Switch defaultChecked={index < 3} />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Notifications;
