import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
const NotFound = () => {
  const location = useLocation();
  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);
  return /*#__PURE__*/_jsx("div", {
    className: "flex min-h-screen items-center justify-center bg-gray-100",
    children: /*#__PURE__*/_jsxs("div", {
      className: "text-center",
      children: [/*#__PURE__*/_jsx("h1", {
        className: "mb-4 text-4xl font-bold",
        children: "404"
      }), /*#__PURE__*/_jsx("p", {
        className: "mb-4 text-xl text-gray-600",
        children: "Oops! Page not found"
      }), /*#__PURE__*/_jsx("a", {
        href: "/",
        className: "text-blue-500 underline hover:text-blue-700",
        children: "Return to Home"
      })]
    })
  });
};
export default NotFound;