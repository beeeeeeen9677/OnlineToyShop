import type { User } from "../interface/user";
import { createContext, useContext } from "react";

// User Context
export const UserContext = createContext<User | undefined>(undefined);
export const useUserContext = () => {
  const user = useContext(UserContext);
  if (user === undefined) {
    // user may be undefined before login
    //throw new Error("useUserContext must be used within a UserContext.Provider");
    return undefined;
  }
  return user;
};

// Login Context
export const LoginContext = createContext<boolean>(false);
export const useLoginContext = () => {
  return useContext(LoginContext);
};
