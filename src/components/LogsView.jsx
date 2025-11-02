import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Unlock, UserCheck, UserX, Clock } from "lucide-react";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
const LogsView = ({
  userId
}) => {
  const [logs, setLogs] = useState([]);
  useEffect(() => {
    loadLogs();

    // Subscribe to realtime updates
    const channel = supabase.channel("logs_changes").on("postgres_changes", {
      event: "INSERT",
      schema: "public",
      table: "logs",
      filter: `user_id=eq.${userId}`
    }, payload => {
      setLogs(prev => [payload.new, ...prev]);
    }).subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);
  const loadLogs = async () => {
    const {
      data,
      error
    } = await supabase.from("logs").select("*").eq("user_id", userId).order("timestamp", {
      ascending: false
    }).limit(50);
    if (!error && data) {
      setLogs(data);
    }
  };
  const getActionIcon = action => {
    switch (action) {
      case "unlocked":
        return /*#__PURE__*/_jsx(Unlock, {
          className: "h-4 w-4"
        });
      case "recognized":
        return /*#__PURE__*/_jsx(UserCheck, {
          className: "h-4 w-4"
        });
      case "denied":
        return /*#__PURE__*/_jsx(UserX, {
          className: "h-4 w-4"
        });
      default:
        return null;
    }
  };
  const getActionColor = action => {
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
  return /*#__PURE__*/_jsxs(Card, {
    className: "shadow-[var(--shadow-elevation)] border-primary/20",
    children: [/*#__PURE__*/_jsxs(CardHeader, {
      children: [/*#__PURE__*/_jsx(CardTitle, {
        children: "Activity Logs"
      }), /*#__PURE__*/_jsx(CardDescription, {
        children: "Recent doorbell activity and access logs"
      })]
    }), /*#__PURE__*/_jsx(CardContent, {
      children: /*#__PURE__*/_jsx("div", {
        className: "space-y-2 max-h-[600px] overflow-y-auto",
        children: logs.length === 0 ? /*#__PURE__*/_jsx("p", {
          className: "text-center text-muted-foreground py-8",
          children: "No activity logs yet"
        }) : logs.map(log => /*#__PURE__*/_jsxs("div", {
          className: "flex items-start gap-3 p-4 rounded-lg bg-secondary/30 border border-border hover:bg-secondary/50 transition-colors",
          children: [/*#__PURE__*/_jsx("div", {
            className: `p-2 rounded-full ${getActionColor(log.action)}`,
            children: getActionIcon(log.action)
          }), /*#__PURE__*/_jsxs("div", {
            className: "flex-1 min-w-0",
            children: [/*#__PURE__*/_jsxs("div", {
              className: "flex items-center gap-2 flex-wrap",
              children: [/*#__PURE__*/_jsx("p", {
                className: "font-medium",
                children: log.recognized_person || "Unknown Person"
              }), /*#__PURE__*/_jsx(Badge, {
                variant: "outline",
                className: "capitalize",
                children: log.action
              })]
            }), /*#__PURE__*/_jsxs("div", {
              className: "flex items-center gap-2 mt-1 text-sm text-muted-foreground",
              children: [/*#__PURE__*/_jsx(Clock, {
                className: "h-3 w-3"
              }), new Date(log.timestamp).toLocaleString()]
            })]
          })]
        }, log.id))
      })
    })]
  });
};
export default LogsView;