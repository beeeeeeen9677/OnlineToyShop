import { Route, Routes, useNavigate, useLocation } from "react-router";
import { useEffect, useState } from "react";
// Component Imports
import Index from "./pages/index/Index";
import Auth from "./pages/auth/Auth";
// Firebase
import { monitorAuthState } from "./firebase/firebase";

function App() {
  const navigate = useNavigate();
  const currentPath = useLocation().pathname;

  // Monitor authentication state on app load
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  useEffect(() => {
    const logoutCallback = () => {
      console.log("User is logged out");
      const availablePaths = ["/", "/auth"];

      if (!availablePaths.includes(currentPath)) navigate("/");
    };
    monitorAuthState(logoutCallback, setIsLoggedIn);
    console.log("App mounted, monitoring auth state");
  }, []);

  return (
    <Routes>
      <Route index element={<Index isLoggedIn={isLoggedIn} />} />
      <Route path="/auth" element={<Auth />} />
    </Routes>
  );
}

export default App;
