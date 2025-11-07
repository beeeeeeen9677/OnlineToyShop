import { Route, Routes } from "react-router";
import { useEffect } from "react";
// Component Imports
import Index from "./pages/index/Index";
import Auth from "./pages/auth/Auth";
// Firebase
import { monitorAuthState } from "./firebase/firebase";

function App() {
  // Monitor authentication state on app load
  const loginCallback = () => {
    console.log("User is logged in");
  };
  const logoutCallback = () => {
    console.log("User is logged out");
  };
  useEffect(() => {
    monitorAuthState(loginCallback, logoutCallback);
    console.log("App mounted, monitoring auth state");
  }, []);

  return (
    <Routes>
      <Route index element={<Index />} />
      <Route path="/auth" element={<Auth />} />
    </Routes>
  );
}

export default App;
