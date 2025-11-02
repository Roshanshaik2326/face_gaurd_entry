import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
const queryClient = new QueryClient();
const App = () => /*#__PURE__*/_jsx(QueryClientProvider, {
  client: queryClient,
  children: /*#__PURE__*/_jsxs(TooltipProvider, {
    children: [/*#__PURE__*/_jsx(Toaster, {}), /*#__PURE__*/_jsx(Sonner, {}), /*#__PURE__*/_jsx(BrowserRouter, {
      children: /*#__PURE__*/_jsxs(Routes, {
        children: [/*#__PURE__*/_jsx(Route, {
          path: "/",
          element: /*#__PURE__*/_jsx(Index, {})
        }), /*#__PURE__*/_jsx(Route, {
          path: "/auth",
          element: /*#__PURE__*/_jsx(Auth, {})
        }), /*#__PURE__*/_jsx(Route, {
          path: "/dashboard",
          element: /*#__PURE__*/_jsx(Dashboard, {})
        }), /*#__PURE__*/_jsx(Route, {
          path: "*",
          element: /*#__PURE__*/_jsx(NotFound, {})
        })]
      })
    })]
  })
});
export default App;