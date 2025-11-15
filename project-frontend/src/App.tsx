// React Imports
import { Route, Routes, useNavigate, useLocation } from "react-router";
import { useEffect, useState, useEffectEvent } from "react";
// Component Imports
import Index from "./pages/index/Index";
import Auth from "./pages/auth/Auth";
import AdminIndex from "./pages/admin/AdminIndex";
import NotFound from "./pages/NotFound";

// Firebase
import { auth, monitorAuthState } from "./firebase/firebase";
// Other Imports
import api from "./services/api";
import { AxiosError } from "axios";
import type { User } from "./interface/user";
import { LoginContext, UserContext } from "./context/app";

function App() {
  const navigate = useNavigate();
  const currentPath = useLocation().pathname;

  const checkPathEvent = useEffectEvent(() => {
    const availablePaths = ["/", "/auth"];
    if (!availablePaths.includes(currentPath)) navigate("/");
  });
  // Monitor authentication state on app load
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  useEffect(() => {
    const logoutCallback = () => {
      console.log("User is logged out");
      checkPathEvent();
    };
    monitorAuthState(logoutCallback, setIsLoggedIn);
    console.log("App mounted, monitoring auth state");
  }, []);

  const [user, setUser] = useState<User | undefined>(undefined);

  const setUserEvent = useEffectEvent(async () => {
    console.log("Fetching user data...");
    try {
      if (!auth.currentUser) return;
      const firebaseUID = await auth.currentUser.uid;
      const res = await api.post("/user/", { firebaseUID });
      setUser(res.data);
      console.log("User data set in context.");
      // console.log("User data fetched:\n", res.data);
    } catch (error) {
      const axiosError = error as AxiosError<{ error: string }>;
      console.error(
        "Error fetching user data:",
        axiosError.response?.data?.error
      );
    }
  });

  useEffect(() => {
    if (!isLoggedIn) {
      setUser(undefined);
      return;
    }
    // Fetch user data from backend

    setUserEvent();
  }, [isLoggedIn]);

  return (
    <UserContext.Provider value={user}>
      <LoginContext.Provider value={isLoggedIn}>
        <RouteContainer />
      </LoginContext.Provider>
    </UserContext.Provider>
  );
}

function RouteContainer() {
  return (
    <Routes>
      <Route index element={<Index />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/admin" element={<AdminIndex />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
