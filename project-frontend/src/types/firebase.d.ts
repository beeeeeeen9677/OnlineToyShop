// src/firebase/firebase.d.ts

import { Auth } from "firebase/auth";

declare module "./firebase/firebase" {
  export const auth: Auth;

  export function loginWithEmailAndPassword(
    email: string,
    password: string,
    loginSuccessCallback: () => void,
    loginFailCallback: (errorMessage: string) => void,
    rememberMe: boolean
  ): Promise<void>;

  export function registerWithEmailAndPassword(
    userData: {
      email: string;
      password: string;
      firstName: string;
      lastName: string;
      gender: string;
      dateOfBirth: string;
    },
    registerSuccessCallback: () => void,
    registerFailCallback: (errorMessage: string) => void
  ): Promise<void>;

  export function loginWithEmailLink(email: string): Promise<void>;

  export function authEmail(email: string): Promise<void>;

  export function verifyUserEmail(): Promise<void>;

  export function monitorAuthState(
    logoutCallback: () => void,
    setIsLoggedIn: (isLoggedIn: boolean) => void
  ): Promise<void>;

  export function logout(): Promise<void>;
}
