// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  sendSignInLinkToEmail,
  //linkWithCredential,
  reauthenticateWithCredential,
  EmailAuthProvider,
  isSignInWithEmailLink,
  signInWithEmailLink,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  setPersistence,
  browserLocalPersistence,
  signOut,
  updatePassword,
  sendPasswordResetEmail,
  signInWithPopup,
  GoogleAuthProvider,
  FacebookAuthProvider,
} from "firebase/auth";
import api from "../services/api";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
const facebookProvider = new FacebookAuthProvider();

// Email & Password
const loginWithEmailAndPassword = async (
  email: string,
  password: string,
  loginSuccessCallback: () => void,
  loginFailCallback: (errorCode: string) => void,
  rememberMe: boolean = false
) => {
  try {
    await setPersistence(auth, browserLocalPersistence);

    // do not comment the sign in function

    // const userCredential =
    await signInWithEmailAndPassword(auth, email, password);
    // console.log("User logged in:", userCredential.user);

    // store in local if rememberMe is true
    if (typeof window !== "undefined") {
      const storageKey = "premiumbentoys:rememberMe";
      if (rememberMe) {
        localStorage.setItem(storageKey, JSON.stringify({ email, password }));
      } else {
        localStorage.removeItem(storageKey);
      }
    }

    loginSuccessCallback();
  } catch (error: unknown) {
    let errorCode: string = "auth/unexpected-error";

    if (typeof error === "object" && error !== null && "code" in error) {
      const firebaseError = error as { code: string };
      errorCode = getFirebaseAuthErrorMessage(firebaseError.code);
    }

    loginFailCallback(errorCode);
  }
};

const createNewUserInDB = async (userData: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  gender: string;
  dateOfBirth: string;
}) => {
  try {
    const response = await api.post("/auth/register", userData);
    console.log("User created in DB:", response.data);
  } catch (err) {
    console.error(err);
  }
};

const registerWithEmailAndPassword = async (
  userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    gender: string;
    dateOfBirth: string;
    firebaseUID?: string;
  },
  registerSuccessCallback: () => void,
  registerFailCallback: (errorCode: string) => void
) => {
  try {
    await setPersistence(auth, browserLocalPersistence);

    const {
      email,
      password,
      //firstName, lastName, gender, dateOfBirth
    } = userData;

    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    //console.log("User registered:", userCredential.user);
    // await sendEmailVerification(userCredential.user);
    // let user send manually in profile page
    userData.firebaseUID = userCredential.user.uid;
    await createNewUserInDB(userData);
    registerSuccessCallback();
  } catch (error: unknown) {
    let errorCode: string = "auth/unexpected-error";

    if (typeof error === "object" && error !== null && "code" in error) {
      const firebaseError = error as { code: string };
      errorCode = getFirebaseAuthErrorMessage(firebaseError.code);
    }
    registerFailCallback(errorCode);
  }
};

// Error Handling
const KNOWN_FIREBASE_AUTH_ERROR_CODES = new Set<string>([
  "auth/unexpected-error",
  "auth/invalid-email",
  "auth/user-disabled",
  "auth/user-not-found",
  "auth/wrong-password",
  "auth/too-many-requests",
  "auth/email-already-in-use",
  "auth/weak-password",
  "auth/network-request-failed",
  "auth/internal-error",
  "auth/invalid-credential",
  "auth/operation-not-allowed",
  "auth/requires-recent-login",
  "auth/account-exists-with-different-credential",
  "auth/popup-closed-by-user",
  "auth/cancelled-popup-request",
  "auth/invalid-verification-code",
  "auth/expired-action-code",
  "auth/invalid-action-code",
  "auth/missing-verification-code",
  "auth/missing-password",
  "auth/old-password-incorrect",
]);

export const getFirebaseAuthErrorMessage = (code: string): string => {
  if (KNOWN_FIREBASE_AUTH_ERROR_CODES.has(code)) {
    return code;
  }

  return "auth/unexpected-error";
};

// Email Link
const actionCodeSettings = {
  // URL you want to redirect back to. The domain (www.example.com) for this
  // URL must be in the authorized domains list in the Firebase Console.
  url: "http://localhost:5173/",
  // This must be true.
  handleCodeInApp: true,
};

const loginWithEmailLink = async (email: string) => {
  try {
    console.log("Sending sign-in link to email:", email);
    await sendSignInLinkToEmail(auth, email, actionCodeSettings);

    //if (!isSignInWithEmailLink(auth, window.location.href)) return;
    await signInWithEmailLink(auth, email, window.location.href);
  } catch (error) {
    console.error("Error sending email link:", error);
  }
};

const authEmail = async (email: string) => {
  try {
    if (!isSignInWithEmailLink(auth, window.location.href)) {
      throw new Error();
    }
    console.log("Authenticating email link for:", email);
    // Construct the email link credential from the current URL.
    const credential = EmailAuthProvider.credentialWithLink(
      email,
      window.location.href
    );
    console.log("Email link credential constructed.");
    const newAuth = getAuth();
    if (newAuth.currentUser) {
      console.log("Re-authenticating user with email link credential.");
      const usercred = await reauthenticateWithCredential(
        newAuth.currentUser,
        credential
      );
      console.log("User re-authenticated:", usercred.user);
    }
  } catch (error) {
    console.error("Error linking email link credential:", error);
  }
};

const verifyUserEmail = async () => {
  if (auth.currentUser) {
    try {
      await sendEmailVerification(auth.currentUser);
      console.log("Verification email sent.");
    } catch (error) {
      console.error("Error sending verification email:", error);
    }
  }
};

const changePassword = async (
  oldPassword: string,
  newPassword: string,
  successCallback: () => void,
  failCallback: (errorCode: string) => void
) => {
  if (auth.currentUser && auth.currentUser.email) {
    try {
      const credential = EmailAuthProvider.credential(
        auth.currentUser.email,
        oldPassword
      );
      await reauthenticateWithCredential(auth.currentUser, credential);
      await updatePassword(auth.currentUser, newPassword);
      console.log("Password changed successfully.");
      successCallback();
    } catch (error: unknown) {
      let errorCode: string = "auth/unexpected-error";

      if (typeof error === "object" && error !== null && "code" in error) {
        const firebaseError = error as { code: string };
        const normalizedCode =
          firebaseError.code === "auth/invalid-credential"
            ? "auth/old-password-incorrect"
            : firebaseError.code;

        errorCode = getFirebaseAuthErrorMessage(normalizedCode);
      }
      failCallback(errorCode);
    }
  }
};

const sendResetEmail = async (email: string) => {
  try {
    await sendPasswordResetEmail(auth, email);
    console.log("Password reset email sent.");
  } catch (error) {
    console.error("Error sending password reset email:", error);
  }
};

const logInWithGooglePopup = async (
  loginSuccessCallback: () => void,
  loginFailCallback: (errorCode: string) => void
) => {
  try {
    await setPersistence(auth, browserLocalPersistence);
    //const result =
    await signInWithPopup(auth, googleProvider);
    loginSuccessCallback();
  } catch (error: unknown) {
    let errorCode: string = "auth/unexpected-error";

    if (typeof error === "object" && error !== null && "code" in error) {
      const firebaseError = error as { code: string };
      errorCode = getFirebaseAuthErrorMessage(firebaseError.code);
    }

    loginFailCallback(errorCode);
  }
};

const logInWithFacebookPopup = async (
  loginSuccessCallback: () => void,
  loginFailCallback: (errorCode: string) => void
) => {
  try {
    await setPersistence(auth, browserLocalPersistence);
    //const result =
    await signInWithPopup(auth, facebookProvider);
    loginSuccessCallback();
  } catch (error: unknown) {
    let errorCode: string = "auth/unexpected-error";

    if (typeof error === "object" && error !== null && "code" in error) {
      const firebaseError = error as { code: string };
      errorCode = getFirebaseAuthErrorMessage(firebaseError.code);
    }

    loginFailCallback(errorCode);
  }
};

// Monitor
const monitorAuthState = async (
  logoutCallback: () => void,
  setIsLoggedIn: (isLoggedIn: boolean) => void
) => {
  onAuthStateChanged(auth, (user) => {
    // console.log("Auth state changed.");
    if (user) {
      // User is signed in, see docs for a list of available properties
      // https://firebase.google.com/docs/reference/js/auth.user
      //const uid = user.uid;
      console.log("Monitor state changed: logged in");
      setIsLoggedIn(true);
    } else {
      // User is signed out
      logoutCallback();
      setIsLoggedIn(false);
    }
  });
};

// Log out
const logout = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Error signing out:", error);
  }
};

export {
  auth,
  loginWithEmailAndPassword,
  registerWithEmailAndPassword,
  loginWithEmailLink,
  authEmail,
  verifyUserEmail,
  changePassword,
  sendResetEmail,
  logInWithGooglePopup,
  logInWithFacebookPopup,
  monitorAuthState,
  logout,
};
