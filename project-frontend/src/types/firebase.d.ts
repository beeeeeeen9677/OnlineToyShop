// src/firebase/firebase.d.ts

import { Auth } from "firebase/auth";

declare module "./firebase/firebase" {
  export const auth: Auth;

  export function loginWithEmailAndPassword(
    email: string,
    password: string,
    loginSuccessCallback: () => void,
    loginFailCallback: (errorCode: string) => void,
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
    registerFailCallback: (errorCode: string) => void
  ): Promise<void>;

  export function loginWithEmailLink(email: string): Promise<void>;

  export function authEmail(email: string): Promise<void>;

  export function verifyUserEmail(): Promise<void>;

  export function changePassword(
    oldPassword: string,
    newPassword: string,
    successCallback: () => void,
    failCallback: (errorCode: string) => void
  ): Promise<void>;

  export function logout(): Promise<void>;
}
