import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Unlock, UserCheck, UserX, Clock } from "lucide-react";

interface LogsViewProps {
  userId: string;
}

interface Log {
  id: string;
  recognized_person: string | null;
  action: string;
  timestamp: string;
  image_url: string | null;
}

const LogsView = ({ userId }: LogsViewProps) => {
  const [logs, setLogs] = useState<Log[]>([]);

  useEffect(() => {
    loadLogs();

    // Subscribe to realtime updates
    const channel = supabase
      .channel("logs_changes")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "logs",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          setLogs((prev) => [payload.new as Log, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  const loadLogs = async () => {
    const { data, error } = await supabase
      .from("logs")
      .select("*")
      .eq("user_id", userId)
      .order("timestamp", { ascending: false })
      .limit(50);

    if (!error && data) {
      setLogs(data);
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case "unlocked":
        return <Unlock className="h-4 w-4" />;
      case "recognized":
        return <UserCheck className="h-4 w-4" />;
      case "denied":
        return <UserX className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case "unlocked":
        return "bg-primary text-primary-foreground";
      case "recognized":
        return "bg-accent text-accent-foreground";
      case "denied":
        return "bg-destructive text-destructive-foreground";
      default:
        return "bg-secondary text-secondary-foreground";
    }
  };

  return (
    <Card className="shadow-[var(--shadow-elevation)] border-primary/20">
      <CardHeader>
        <CardTitle>Activity Logs</CardTitle>
        <CardDescription>Recent doorbell activity and access logs</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 max-h-[600px] overflow-y-auto">
          {logs.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No activity logs yet</p>
          ) : (
            logs.map((log) => (
              <div
                key={log.id}
                className="flex items-start gap-3 p-4 rounded-lg bg-secondary/30 border border-border hover:bg-secondary/50 transition-colors"
              >
                <div className={`p-2 rounded-full ${getActionColor(log.action)}`}>
                  {getActionIcon(log.action)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-medium">
                      {log.recognized_person || "Unknown Person"}
                    </p>
                    <Badge variant="outline" className="capitalize">
                      {log.action}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {new Date(log.timestamp).toLocaleString()}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default LogsView;