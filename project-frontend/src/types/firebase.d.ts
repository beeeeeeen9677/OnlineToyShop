// src/firebase/firebase.d.ts

import { Auth } from "firebase/auth";

declare module "./firebase/firebase" {
  export const auth: Auth;

  export function loginWithEmailAndPassword(
    email: string,
    password: string,
    loginSuccessCallback: () => void,
    loginFailCallback: () => void,
    rememberMe: boolean
  ): Promise<void>;

  export function registerWithEmailAndPassword(
    email: string,
    password: string,
    registerFailCallback: () => void
  ): Promise<void>;

  export function monitorAuthState(
    logoutCallback: () => void,
    setIsLoggedIn: (isLoggedIn: boolean) => void
  ): Promise<void>;

  export function logout(): Promise<void>;
}
