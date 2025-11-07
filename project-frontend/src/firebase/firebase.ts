// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  //signInWithEmailLink,
  createUserWithEmailAndPassword,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
  signOut,
} from "firebase/auth";
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

const loginWithEmailAndPassword = async (
  email: string,
  password: string,
  loginSuccessCallback: () => void,
  loginFailCallback: () => void,
  rememberMe: boolean = false
) => {
  try {
    await setPersistence(
      auth,
      rememberMe ? browserLocalPersistence : browserSessionPersistence
    );

    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    console.log("User logged in:", userCredential.user);
    loginSuccessCallback();
  } catch (error) {
    console.error("Error signing in with email and password:", error);
    loginFailCallback();
  }
};

const registerWithEmailAndPassword = async (
  email: string,
  password: string,
  registerSuccessCallback: () => void,
  registerFailCallback: () => void
) => {
  try {
    await setPersistence(auth, browserSessionPersistence);

    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    console.log("User registered:", userCredential.user);
    registerSuccessCallback();
  } catch (error) {
    console.error("Error registering with email and password:", error);
    registerFailCallback();
  }
};

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
  monitorAuthState,
  logout,
};
