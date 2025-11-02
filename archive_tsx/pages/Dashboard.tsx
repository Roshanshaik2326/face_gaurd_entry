import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { LogOut, Users, History, Camera } from "lucide-react";
import CameraFeed from "@/components/CameraFeed";
import FaceRegistration from "@/components/FaceRegistration";
import LogsView from "@/components/LogsView";

const Dashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<"camera" | "register" | "logs">("camera");
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
      }
    });

    const {
      data: { subscription },
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

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <Card className="p-6 shadow-[var(--shadow-elevation)] border-primary/20">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Smart Doorbell System
              </h1>
              <p className="text-muted-foreground mt-1">
                Welcome back, {user.user_metadata?.full_name || user.email}
              </p>
            </div>
            <Button onClick={handleLogout} variant="outline" className="border-primary/20">
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </Card>

        {/* Navigation Tabs */}
        <div className="flex gap-2 flex-wrap">
          <Button
            onClick={() => setActiveTab("camera")}
            variant={activeTab === "camera" ? "default" : "outline"}
            className={activeTab === "camera" ? "bg-gradient-to-r from-primary to-accent" : "border-primary/20"}
          >
            <Camera className="mr-2 h-4 w-4" />
            Live Camera
          </Button>
          <Button
            onClick={() => setActiveTab("register")}
            variant={activeTab === "register" ? "default" : "outline"}
            className={activeTab === "register" ? "bg-gradient-to-r from-primary to-accent" : "border-primary/20"}
          >
            <Users className="mr-2 h-4 w-4" />
            Register Faces
          </Button>
          <Button
            onClick={() => setActiveTab("logs")}
            variant={activeTab === "logs" ? "default" : "outline"}
            className={activeTab === "logs" ? "bg-gradient-to-r from-primary to-accent" : "border-primary/20"}
          >
            <History className="mr-2 h-4 w-4" />
            Activity Logs
          </Button>
        </div>

        {/* Content */}
        {activeTab === "camera" && <CameraFeed userId={user.id} />}
        {activeTab === "register" && <FaceRegistration userId={user.id} />}
        {activeTab === "logs" && <LogsView userId={user.id} />}
      </div>
    </div>
  );
};

export default Dashboard;