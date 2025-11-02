import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Lock, Camera, Users, Shield, Zap, Bell } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Camera,
      title: "Live Video Feed",
      description: "Real-time camera monitoring with HD quality streaming"
    },
    {
      icon: Users,
      title: "Face Recognition",
      description: "AI-powered facial recognition for instant identification"
    },
    {
      icon: Shield,
      title: "Secure Access",
      description: "Bank-level security for your smart doorbell system"
    },
    {
      icon: Zap,
      title: "Instant Unlock",
      description: "Quick and seamless door unlocking for recognized faces"
    },
    {
      icon: Bell,
      title: "Real-time Alerts",
      description: "Get notified instantly when someone is at your door"
    },
    {
      icon: Lock,
      title: "Activity Logs",
      description: "Complete history of all doorbell events and access"
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-accent/20 pointer-events-none" />
        <div className="container mx-auto px-4 py-20 relative">
          <div className="text-center space-y-6 max-w-4xl mx-auto">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-primary to-accent shadow-[var(--shadow-glow)] mb-4">
              <Lock className="w-10 h-10 text-primary-foreground" />
            </div>
            <h1 className="text-5xl md:text-7xl font-bold">
              <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                Smart Doorbell
              </span>
              <br />
              <span className="text-foreground">Recognition System</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Next-generation facial recognition technology for your home security.
              Monitor, identify, and control access with AI-powered precision.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Button
                size="lg"
                onClick={() => navigate("/auth")}
                className="bg-gradient-to-r from-primary to-accent text-lg px-8 shadow-[var(--shadow-glow)] hover:opacity-90 transition-all"
              >
                Get Started
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate("/auth")}
                className="text-lg px-8 border-primary/20"
              >
                Sign In
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="container mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Powerful Features for
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent"> Complete Control</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            Everything you need for a smart, secure doorbell system
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card
                key={index}
                className="p-6 shadow-[var(--shadow-elevation)] border-primary/20 hover:border-primary/40 transition-all duration-300 hover:shadow-[var(--shadow-glow)]"
              >
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </Card>
            );
          })}
        </div>
      </div>

      {/* CTA Section */}
      <div className="container mx-auto px-4 py-20">
        <Card className="p-12 text-center bg-gradient-to-br from-card via-card to-secondary border-primary/20 shadow-[var(--shadow-elevation)]">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Upgrade Your Home Security?
          </h2>
          <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">
            Join thousands of users who trust our AI-powered facial recognition system
            to keep their homes safe and secure.
          </p>
          <Button
            size="lg"
            onClick={() => navigate("/auth")}
            className="bg-gradient-to-r from-primary to-accent text-lg px-8 shadow-[var(--shadow-glow)]"
          >
            Start Free Trial
          </Button>
        </Card>
      </div>
    </div>
  );
};

export default Index;