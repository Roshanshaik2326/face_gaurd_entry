import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Lock, Camera, Users, Shield, Zap, Bell } from "lucide-react";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
const Index = () => {
  const navigate = useNavigate();
  const features = [{
    icon: Camera,
    title: "Live Video Feed",
    description: "Real-time camera monitoring with HD quality streaming"
  }, {
    icon: Users,
    title: "Face Recognition",
    description: "AI-powered facial recognition for instant identification"
  }, {
    icon: Shield,
    title: "Secure Access",
    description: "Bank-level security for your smart doorbell system"
  }, {
    icon: Zap,
    title: "Instant Unlock",
    description: "Quick and seamless door unlocking for recognized faces"
  }, {
    icon: Bell,
    title: "Real-time Alerts",
    description: "Get notified instantly when someone is at your door"
  }, {
    icon: Lock,
    title: "Activity Logs",
    description: "Complete history of all doorbell events and access"
  }];
  return /*#__PURE__*/_jsxs("div", {
    className: "min-h-screen",
    children: [/*#__PURE__*/_jsxs("div", {
      className: "relative overflow-hidden",
      children: [/*#__PURE__*/_jsx("div", {
        className: "absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-accent/20 pointer-events-none"
      }), /*#__PURE__*/_jsx("div", {
        className: "container mx-auto px-4 py-20 relative",
        children: /*#__PURE__*/_jsxs("div", {
          className: "text-center space-y-6 max-w-4xl mx-auto",
          children: [/*#__PURE__*/_jsx("div", {
            className: "inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-primary to-accent shadow-[var(--shadow-glow)] mb-4",
            children: /*#__PURE__*/_jsx(Lock, {
              className: "w-10 h-10 text-primary-foreground"
            })
          }), /*#__PURE__*/_jsxs("h1", {
            className: "text-5xl md:text-7xl font-bold",
            children: [/*#__PURE__*/_jsx("span", {
              className: "bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent",
              children: "Smart Doorbell"
            }), /*#__PURE__*/_jsx("br", {}), /*#__PURE__*/_jsx("span", {
              className: "text-foreground",
              children: "Recognition System"
            })]
          }), /*#__PURE__*/_jsx("p", {
            className: "text-xl text-muted-foreground max-w-2xl mx-auto",
            children: "Next-generation facial recognition technology for your home security. Monitor, identify, and control access with AI-powered precision."
          }), /*#__PURE__*/_jsxs("div", {
            className: "flex gap-4 justify-center flex-wrap",
            children: [/*#__PURE__*/_jsx(Button, {
              size: "lg",
              onClick: () => navigate("/auth"),
              className: "bg-gradient-to-r from-primary to-accent text-lg px-8 shadow-[var(--shadow-glow)] hover:opacity-90 transition-all",
              children: "Get Started"
            }), /*#__PURE__*/_jsx(Button, {
              size: "lg",
              variant: "outline",
              onClick: () => navigate("/auth"),
              className: "text-lg px-8 border-primary/20",
              children: "Sign In"
            })]
          })]
        })
      })]
    }), /*#__PURE__*/_jsxs("div", {
      className: "container mx-auto px-4 py-20",
      children: [/*#__PURE__*/_jsxs("div", {
        className: "text-center mb-12",
        children: [/*#__PURE__*/_jsxs("h2", {
          className: "text-3xl md:text-4xl font-bold mb-4",
          children: ["Powerful Features for", /*#__PURE__*/_jsx("span", {
            className: "bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent",
            children: " Complete Control"
          })]
        }), /*#__PURE__*/_jsx("p", {
          className: "text-muted-foreground text-lg",
          children: "Everything you need for a smart, secure doorbell system"
        })]
      }), /*#__PURE__*/_jsx("div", {
        className: "grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto",
        children: features.map((feature, index) => {
          const Icon = feature.icon;
          return /*#__PURE__*/_jsxs(Card, {
            className: "p-6 shadow-[var(--shadow-elevation)] border-primary/20 hover:border-primary/40 transition-all duration-300 hover:shadow-[var(--shadow-glow)]",
            children: [/*#__PURE__*/_jsx("div", {
              className: "w-12 h-12 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mb-4",
              children: /*#__PURE__*/_jsx(Icon, {
                className: "w-6 h-6 text-primary"
              })
            }), /*#__PURE__*/_jsx("h3", {
              className: "text-xl font-semibold mb-2",
              children: feature.title
            }), /*#__PURE__*/_jsx("p", {
              className: "text-muted-foreground",
              children: feature.description
            })]
          }, index);
        })
      })]
    }), /*#__PURE__*/_jsx("div", {
      className: "container mx-auto px-4 py-20",
      children: /*#__PURE__*/_jsxs(Card, {
        className: "p-12 text-center bg-gradient-to-br from-card via-card to-secondary border-primary/20 shadow-[var(--shadow-elevation)]",
        children: [/*#__PURE__*/_jsx("h2", {
          className: "text-3xl md:text-4xl font-bold mb-4",
          children: "Ready to Upgrade Your Home Security?"
        }), /*#__PURE__*/_jsx("p", {
          className: "text-muted-foreground text-lg mb-8 max-w-2xl mx-auto",
          children: "Join thousands of users who trust our AI-powered facial recognition system to keep their homes safe and secure."
        }), /*#__PURE__*/_jsx(Button, {
          size: "lg",
          onClick: () => navigate("/auth"),
          className: "bg-gradient-to-r from-primary to-accent text-lg px-8 shadow-[var(--shadow-glow)]",
          children: "Start Free Trial"
        })]
      })
    })]
  });
};
export default Index;