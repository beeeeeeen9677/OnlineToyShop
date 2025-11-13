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
  browserSessionPersistence,
  signOut,
} from "firebase/auth";
import api from "../services/api";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBAJCHFjuh8mnlb5GgmUrGKBbo0XQqO8ww",
  authDomain: "premiumbentoys.firebaseapp.com",
  projectId: "premiumbentoys",
  storageBucket: "premiumbentoys.firebasestorage.app",
  messagingSenderId: "537243752189",
  appId: "1:537243752189:web:de9d6ff4c706554093d094",
  measurementId: "G-2HTP2DYQ7P",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Email & Password
const loginWithEmailAndPassword = async (
  email: string,
  password: string,
  loginSuccessCallback: () => void,
  loginFailCallback: (errorMessage: string) => void,
  rememberMe: boolean = false
) => {
  try {
    await setPersistence(
      auth,
      rememberMe ? browserLocalPersistence : browserSessionPersistence
    );

    // do not comment the sign in function

    // const userCredential =
    await signInWithEmailAndPassword(auth, email, password);
    // console.log("User logged in:", userCredential.user);
    loginSuccessCallback();
  } catch (error: unknown) {
    let errorMessage: string = "";

    if (typeof error === "object" && error !== null && "code" in error) {
      const firebaseError = error as { code: string };
      errorMessage = getFirebaseAuthErrorMessage(firebaseError.code);
    }

    // console.error("Login error:", error);
    loginFailCallback(errorMessage);
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
  registerFailCallback: (errorMessage: string) => void
) => {
  try {
    await setPersistence(auth, browserSessionPersistence);

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
    await sendEmailVerification(userCredential.user);
    userData.firebaseUID = userCredential.user.uid;
    await createNewUserInDB(userData);
    registerSuccessCallback();
  } catch (error: unknown) {
    let errorMessage: string = "";

    if (typeof error === "object" && error !== null && "code" in error) {
      const firebaseError = error as { code: string };
      errorMessage = getFirebaseAuthErrorMessage(firebaseError.code);
    }
    registerFailCallback(errorMessage);
  }
};

// Error Handling
export const getFirebaseAuthErrorMessage = (code: string): string => {
  let message = "An unexpected error occurred. Please try again.";

  switch (code) {
    case "auth/invalid-email":
      message = "The email address is not valid.";
      break;
    case "auth/user-disabled":
      message = "This user account has been disabled.";
      break;
    case "auth/user-not-found":
      message = "No user found with this email.";
      break;
    case "auth/wrong-password":
      message = "Incorrect password. Please try again.";
      break;
    case "auth/too-many-requests":
      message = "Too many login attempts. Please try again later.";
      break;
    case "auth/email-already-in-use":
      message = "This email is already in use.";
      break;
    case "auth/weak-password":
      message = "The password is too weak. Please choose a stronger one.";
      break;
    case "auth/network-request-failed":
      message = "Network error. Please check your internet connection.";
      break;
    case "auth/internal-error":
      message = "Internal server error. Please try again later.";
      break;
    case "auth/invalid-credential":
      message = "Email / Password is incorrect.";
      break;
    case "auth/operation-not-allowed":
      message = "This operation is not allowed. Please contact support.";
      break;
    case "auth/requires-recent-login":
      message = "Please log in again to perform this action.";
      break;
    case "auth/account-exists-with-different-credential":
      message = "An account already exists with a different sign-in method.";
      break;
    case "auth/popup-closed-by-user":
      message = "The popup was closed before completing the sign-in.";
      break;
    case "auth/cancelled-popup-request":
      message = "Popup request was cancelled. Please try again.";
      break;
    case "auth/invalid-verification-code":
      message = "The verification code is invalid.";
      break;
    case "auth/expired-action-code":
      message = "The action code has expired.";
      break;
    case "auth/invalid-action-code":
      message = "The action code is invalid.";
      break;
    case "auth/missing-verification-code":
      message = "Verification code is missing.";
      break;
    case "auth/missing-password":
      message = "Password is required.";
      break;
    // Add more cases as needed
    default:
      break;
  }

  return message;
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
  monitorAuthState,
  logout,
};
