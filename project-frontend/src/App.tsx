// React Imports
import { Route, Routes, useNavigate, useLocation } from "react-router";
import { useEffect, useState, useEffectEvent } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

// Component Imports
import Index from "./pages/index/Index";
import Auth from "./pages/auth/Auth";
import AdminIndex from "./pages/admin/AdminIndex";
import AdminProductList from "./pages/admin/AdminProductList";
import AdminEditProduct from "./pages/admin/AdminEditProduct";
import Profile from "./pages/profile/Profile";
import ItemDetails from "./pages/itemDetails/ItemDetails";
import LoadingPanel from "./components/LoadingPanel";
import Search from "./pages/search/Search";
import NotFound from "./pages/NotFound";

// Firebase
import { auth, monitorAuthState } from "./firebase/firebase";

// Socket
import { io, type Socket } from "socket.io-client";
const socket: Socket = io(import.meta.env.VITE_SERVER_URL, {
  autoConnect: false,
});

// i18n
import { useLanguage, type SupportedLanguage } from "./i18n/hooks";

// Other Imports
import api from "./services/api";
import { AxiosError } from "axios";
import type { User } from "./interface/user";
import { LoginContext, UserContext } from "./context/app";
import { SocketContext } from "./context/socket";

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

  /*
  const [user, setUser] = useState<User | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);

  const setUserEvent = useEffectEvent(async () => {
    console.log("Fetching user data...");
    try {
      setIsLoading(true);
      if (!auth.currentUser) return;
      const firebaseUID = await auth.currentUser.uid;
      const res = await api.post("/user/", { firebaseUID });
      setUser(res.data);
      console.log("User data set in context.");
      setIsLoading(false);
      // console.log("User data fetched:\n", res.data);
    } catch (error) {
      const axiosError = error as AxiosError<{ error: string }>;
      console.error(
        "Error fetching user data:",
        axiosError.response?.data?.error
      );
      setIsLoading(false);
    } finally {
      setIsLoading(false);
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

  */

  const {
    data: user = undefined,
    isLoading,
    isError,
    error,
  } = useQuery<User, AxiosError>({
    queryKey: ["user"],
    enabled: isLoggedIn,
    queryFn: async () => {
      console.log("Try fetching user data");
      if (!auth.currentUser) throw new Error("No Firebase user");
      const firebaseUID = auth.currentUser.uid;
      const res = await api.post("/user/", { firebaseUID });
      console.log("User data set in context");
      return res.data;
    },
    refetchOnWindowFocus: false,
  });
  const queryClient = useQueryClient();

  // login/logout socket connection handling
  useEffect(() => {
    if (!isLoggedIn) {
      //setUser(undefined);
      socket.disconnect();
      queryClient.removeQueries({ queryKey: ["user"] });
      return;
    }
    if (isLoggedIn && user) {
      socket.auth = { userId: user._id };
      socket.connect();
    }
    // Fetch user data from backend
    //setUserEvent();
  }, [isLoggedIn, queryClient, user]);

  const { changeLanguage } = useLanguage();
  // language init
  useEffect(() => {
    let lang = localStorage.getItem("language");

    if (lang) {
      console.log("Setting language to:", lang);
    } else {
      lang = navigator.language.split("-")[0];
      console.log("Browser language detected:", lang);
    }

    changeLanguage(lang as SupportedLanguage);
  }, [changeLanguage]);

  if (isLoading) {
    return <LoadingPanel />;
  }

  if (isError) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <UserContext.Provider value={user}>
      <LoginContext.Provider value={isLoggedIn}>
        <SocketContext.Provider value={socket}>
          <RouteContainer />
        </SocketContext.Provider>
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
      <Route path="/admin/product" element={<AdminProductList />} />
      <Route path="/admin/edit-product/:id" element={<AdminEditProduct />} />
      <Route path="/user" element={<Profile />} />
      <Route path="/item/:id" element={<ItemDetails />} />
      <Route path="/search" element={<Search />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
