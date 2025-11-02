import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { LogOut, Users, History, Camera } from "lucide-react";
import CameraFeed from "@/components/CameraFeed";
import FaceRegistration from "@/components/FaceRegistration";
import LogsView from "@/components/LogsView";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("camera");
  const navigate = useNavigate();
  useEffect(() => {
    supabase.auth.getSession().then(({
      data: {
        session
      }
    }) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
      }
    });
    const {
      data: {
        subscription
      }
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
      }
    });
    return () => subscription.unsubscribe();
  }, [navigate]);
  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };
  if (!user) return null;
  return /*#__PURE__*/_jsx("div", {
    className: "min-h-screen p-4 md:p-8",
    children: /*#__PURE__*/_jsxs("div", {
      className: "max-w-7xl mx-auto space-y-6",
      children: [/*#__PURE__*/_jsx(Card, {
        className: "p-6 shadow-[var(--shadow-elevation)] border-primary/20",
        children: /*#__PURE__*/_jsxs("div", {
          className: "flex items-center justify-between",
          children: [/*#__PURE__*/_jsxs("div", {
            children: [/*#__PURE__*/_jsx("h1", {
              className: "text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent",
              children: "Smart Doorbell System"
            }), /*#__PURE__*/_jsxs("p", {
              className: "text-muted-foreground mt-1",
              children: ["Welcome back, ", user.user_metadata?.full_name || user.email]
            })]
          }), /*#__PURE__*/_jsxs(Button, {
            onClick: handleLogout,
            variant: "outline",
            className: "border-primary/20",
            children: [/*#__PURE__*/_jsx(LogOut, {
              className: "mr-2 h-4 w-4"
            }), "Logout"]
          })]
        })
      }), /*#__PURE__*/_jsxs("div", {
        className: "flex gap-2 flex-wrap",
        children: [/*#__PURE__*/_jsxs(Button, {
          onClick: () => setActiveTab("camera"),
          variant: activeTab === "camera" ? "default" : "outline",
          className: activeTab === "camera" ? "bg-gradient-to-r from-primary to-accent" : "border-primary/20",
          children: [/*#__PURE__*/_jsx(Camera, {
            className: "mr-2 h-4 w-4"
          }), "Live Camera"]
        }), /*#__PURE__*/_jsxs(Button, {
          onClick: () => setActiveTab("register"),
          variant: activeTab === "register" ? "default" : "outline",
          className: activeTab === "register" ? "bg-gradient-to-r from-primary to-accent" : "border-primary/20",
          children: [/*#__PURE__*/_jsx(Users, {
            className: "mr-2 h-4 w-4"
          }), "Register Faces"]
        }), /*#__PURE__*/_jsxs(Button, {
          onClick: () => setActiveTab("logs"),
          variant: activeTab === "logs" ? "default" : "outline",
          className: activeTab === "logs" ? "bg-gradient-to-r from-primary to-accent" : "border-primary/20",
          children: [/*#__PURE__*/_jsx(History, {
            className: "mr-2 h-4 w-4"
          }), "Activity Logs"]
        })]
      }), activeTab === "camera" && /*#__PURE__*/_jsx(CameraFeed, {
        userId: user.id
      }), activeTab === "register" && /*#__PURE__*/_jsx(FaceRegistration, {
        userId: user.id
      }), activeTab === "logs" && /*#__PURE__*/_jsx(LogsView, {
        userId: user.id
      })]
    })
  });
};
export default Dashboard;