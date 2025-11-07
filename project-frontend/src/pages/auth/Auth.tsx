import { useRef, useState } from "react";
import { Link } from "react-router";

import {
  loginWithEmailAndPassword,
  registerWithEmailAndPassword,
} from "../../firebase/firebase";

function Auth() {
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const [emailErrors, setEmailErrors] = useState<string>("");
  const [pwErrors, setPwErrors] = useState<string>("");

  const emailErr = {
    required: "email cannot be empty",
    pattern: "Invalid email address",
  };

  const pwErr = {
    required: "Password cannot be empty",
    minLength: "Password must be at least 6 characters long",
  };

  const ValidateField = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name } = e.target;
    const value = e.target.value;

    let errors: string = "";

    if (name === "email") {
      if (!value) {
        errors = emailErr.required;
      } else if (!/\S+@\S+\.\S+/.test(value)) {
        errors = emailErr.pattern;
      }
      setEmailErrors(errors);
    } else if (name === "password") {
      if (!value) {
        errors = pwErr.required;
      } else if (value.length < 6) {
        errors = pwErr.minLength;
      }
      setPwErrors(errors);
    }
  };

  const emailPwLogin = () => {
    const email: string = emailRef.current?.value ?? "";
    const password: string = passwordRef.current?.value ?? "";

    if (email && password) {
      loginWithEmailAndPassword(email, password, () => {
        console.log("callback: Login failed");
      });
    } else {
      console.log("Email or Password is empty");
    }
  };

  const emailPwRegister = () => {
    const email: string = emailRef.current?.value ?? "";
    const password: string = passwordRef.current?.value ?? "";

    if (email && password) {
      registerWithEmailAndPassword(email, password, () => {
        console.log("callback: Registration failed");
      });
    } else {
      console.log("Email or Password is empty");
    }
  };

  return (
    <div className="animate-fade-in flex items-center justify-center min-h-screen bg-gray-50">
      <title>Auth</title>
      <Link to="/" className="absolute top-5 ">
        <img src={"/logo.png"} alt="Logo" className="h-24" />
      </Link>

      <div className="w-full max-w-md p-8 bg-white rounded-4xl shadow-lg">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            User Authentication
          </h1>
          <p className="text-gray-600">Log in to your account</p>
        </div>

        <div id="auth-form" className="space-y-6">
          <div>
            <div className="flex justify-between">
              <label
                htmlFor="email"
                className=" text-sm font-medium text-gray-700 mb-2"
              >
                Email
              </label>
              <div
                className={`text-red-500 text-sm ${
                  emailErrors === "" && "hidden"
                }`}
              >
                {emailErrors}
              </div>
            </div>

            <input
              ref={emailRef}
              type="email"
              id="email"
              name="email"
              className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors ${
                emailErrors !== "" && "ring-3 ring-red-500 "
              }`}
              placeholder="Enter your email"
              onBlur={ValidateField}
            />
          </div>

          <div>
            <div className="flex justify-between">
              <label
                htmlFor="password"
                className="text-sm font-medium text-gray-700 mb-2"
              >
                Password
              </label>
              <div
                className={`text-red-500 text-sm  ${
                  pwErrors === "" && "hidden"
                }`}
              >
                {pwErrors}
              </div>
            </div>

            <input
              ref={passwordRef}
              type="password"
              id="password"
              name="password"
              className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors ${
                pwErrors !== "" && "ring-3 ring-red-500 "
              }`}
              placeholder="Enter your password"
              onBlur={ValidateField}
            />
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center">
              <input
                type="checkbox"
                className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
              />
              <span className="ml-2 text-sm text-gray-600">Remember Me</span>
            </label>
            <Link
              to="#"
              className="text-sm text-primary hover:text-orange-600 transition-colors"
            >
              Forget Password
            </Link>
          </div>

          <button
            className="w-full bg-primary text-white py-3 px-4 rounded-lg font-medium hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors"
            onClick={emailPwLogin}
          >
            Log In
          </button>
        </div>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            First time using?
            <button
              //to="#"
              className="text-primary font-medium hover:text-orange-600 transition-colors"
              onClick={emailPwRegister}
            >
              Register
            </button>
          </p>
        </div>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Other Methods</span>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <button
              type="button"
              className="w-full inline-flex justify-center py-3 px-4 border border-gray-300 rounded-lg bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 transition-colors"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              <span className="ml-2">Google</span>
            </button>

            <button
              type="button"
              className="w-full inline-flex justify-center py-3 px-4 border border-gray-300 rounded-lg bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 transition-colors"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              <span className="ml-2">Facebook</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Auth;
