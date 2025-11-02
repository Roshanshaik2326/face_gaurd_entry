import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Lock } from "lucide-react";
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const {
    toast
  } = useToast();
  const handleAuth = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        const {
          error
        } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        if (error) throw error;
        toast({
          title: "Welcome back!",
          description: "You've successfully logged in."
        });
        navigate("/dashboard");
      } else {
        const {
          error
        } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName
            },
            emailRedirectTo: `${window.location.origin}/dashboard`
          }
        });
        if (error) throw error;
        toast({
          title: "Account created!",
          description: "You can now log in with your credentials."
        });
        setIsLogin(true);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  return /*#__PURE__*/_jsx("div", {
    className: "flex min-h-screen items-center justify-center p-4",
    children: /*#__PURE__*/_jsxs(Card, {
      className: "w-full max-w-md shadow-[var(--shadow-elevation)] border-primary/20",
      children: [/*#__PURE__*/_jsxs(CardHeader, {
        className: "space-y-3 text-center",
        children: [/*#__PURE__*/_jsx("div", {
          className: "mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-[var(--shadow-glow)]",
          children: /*#__PURE__*/_jsx(Lock, {
            className: "w-8 h-8 text-primary-foreground"
          })
        }), /*#__PURE__*/_jsx(CardTitle, {
          className: "text-3xl font-bold",
          children: "Smart Doorbell"
        }), /*#__PURE__*/_jsx(CardDescription, {
          children: isLogin ? "Welcome back! Sign in to continue." : "Create your account to get started."
        })]
      }), /*#__PURE__*/_jsxs(CardContent, {
        children: [/*#__PURE__*/_jsxs("form", {
          onSubmit: handleAuth,
          className: "space-y-4",
          children: [!isLogin && /*#__PURE__*/_jsxs("div", {
            className: "space-y-2",
            children: [/*#__PURE__*/_jsx(Label, {
              htmlFor: "fullName",
              children: "Full Name"
            }), /*#__PURE__*/_jsx(Input, {
              id: "fullName",
              type: "text",
              placeholder: "John Doe",
              value: fullName,
              onChange: e => setFullName(e.target.value),
              required: !isLogin
            })]
          }), /*#__PURE__*/_jsxs("div", {
            className: "space-y-2",
            children: [/*#__PURE__*/_jsx(Label, {
              htmlFor: "email",
              children: "Email"
            }), /*#__PURE__*/_jsx(Input, {
              id: "email",
              type: "email",
              placeholder: "you@example.com",
              value: email,
              onChange: e => setEmail(e.target.value),
              required: true
            })]
          }), /*#__PURE__*/_jsxs("div", {
            className: "space-y-2",
            children: [/*#__PURE__*/_jsx(Label, {
              htmlFor: "password",
              children: "Password"
            }), /*#__PURE__*/_jsx(Input, {
              id: "password",
              type: "password",
              placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022",
              value: password,
              onChange: e => setPassword(e.target.value),
              required: true
            })]
          }), /*#__PURE__*/_jsx(Button, {
            type: "submit",
            className: "w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity",
            disabled: loading,
            children: loading ? /*#__PURE__*/_jsxs(_Fragment, {
              children: [/*#__PURE__*/_jsx(Loader2, {
                className: "mr-2 h-4 w-4 animate-spin"
              }), "Processing..."]
            }) : isLogin ? "Sign In" : "Create Account"
          })]
        }), /*#__PURE__*/_jsx("div", {
          className: "mt-4 text-center",
          children: /*#__PURE__*/_jsx(Button, {
            variant: "link",
            onClick: () => setIsLogin(!isLogin),
            className: "text-primary hover:text-accent transition-colors",
            children: isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"
          })
        })]
      })]
    })
  });
};
export default Auth;