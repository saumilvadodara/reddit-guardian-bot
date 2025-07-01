
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Plus } from "lucide-react";

interface MonitoringEmptyStateProps {
  onCreateRule: () => void;
}

export function MonitoringEmptyState({ onCreateRule }: MonitoringEmptyStateProps) {
  return (
    <Card>
      <CardContent className="text-center py-12">
        <AlertTriangle className="h-16 w-16 mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No monitoring rules</h3>
        <p className="text-gray-600 mb-4">
          Create your first monitoring rule to start automated community moderation
        </p>
        <Button onClick={onCreateRule}>
          <Plus className="h-4 w-4 mr-2" />
          Create Monitoring Rule
        </Button>
      </CardContent>
    </Card>
  );
}
