import { useRef, useState } from "react";
import { Link, useNavigate } from "react-router";

import {
  auth,
  loginWithEmailAndPassword,
  registerWithEmailAndPassword,
  // loginWithEmailLink,
  // authEmail,
  logout,
} from "../../firebase/firebase";
import LoadingPanel from "../../components/LoadingPanel";

function Auth() {
  const navigate = useNavigate();
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const firstNameRef = useRef<HTMLInputElement>(null);
  const lastNameRef = useRef<HTMLInputElement>(null);
  const genderRef = useRef<HTMLSelectElement>(null);
  const dateOfBirthRef = useRef<HTMLInputElement>(null);
  const rememberMeRef = useRef<HTMLInputElement>(null);
  const [emailErrors, setEmailErrors] = useState<string>("");
  const [pwErrors, setPwErrors] = useState<string>("");
  const [firstNameErrors, setFirstNameErrors] = useState<string>("");
  const [lastNameErrors, setLastNameErrors] = useState<string>("");
  const [dobErrors, setDobErrors] = useState<string>("");
  const [errPrompt, setErrPrompt] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  type Mode = "LOGIN" | "REGISTER";
  const [mode, setMode] = useState<Mode>("LOGIN");

  const emailErr = {
    required: "email cannot be empty",
    pattern: "Invalid email address",
  };

  const pwErr = {
    required: "Password cannot be empty",
    minLength: "Password must be at least 6 characters long",
  };

  const minAge = 16;
  const dobErr = {
    required: "Date of birth cannot be empty",
    invalid: "Please enter a valid date",
    age: `You must be at least ${minAge} years old to register`,
  };

  const nameErr = {
    required: "This field cannot be empty",
    pattern: "Name can only contain letters and spaces",
  };

  const validateField = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name } = e.target;
    const value = e.target.value;

    if (name === "email") {
      validateEmail(value);
    } else if (name === "password") {
      validatePassword(value);
    } else if (name === "dateOfBirth") {
      validateDateOfBirth(value);
    } else if (name === "firstName") {
      validateFirstName(value);
    } else if (name === "lastName") {
      validateLastName(value);
    }
  };
  const loginSuccessCallback = () => {
    console.log("callback: Login successful");
    setIsLoading(false);
    navigate("/");
  };

  // for both login and register fail
  const actionFailedCallback = (errorMessage: string) => {
    console.log("Login/Register Failed. Error message:", errorMessage);
    setErrPrompt(errorMessage);
    setIsLoading(false);
  };

  const emailPwLogin = () => {
    const email: string = emailRef.current?.value ?? "";
    const password: string = passwordRef.current?.value ?? "";
    const rememberMe: boolean = rememberMeRef.current?.checked ?? false;
    validateEmail(email);
    validatePassword(password);

    if (emailErrors !== "" || pwErrors !== "") return;

    if (email && password) {
      setErrPrompt("");

      setIsLoading(true);

      loginWithEmailAndPassword(
        email,
        password,
        loginSuccessCallback,
        actionFailedCallback,
        rememberMe
      );
    } else {
      console.log("Email or Password is empty");
    }
  };

  const emailPwRegister = () => {
    const email: string = emailRef.current?.value ?? "";
    const password: string = passwordRef.current?.value ?? "";
    const firstName: string = firstNameRef.current?.value ?? "";
    const lastName: string = lastNameRef.current?.value ?? "";
    const gender: string = genderRef.current?.value ?? "";
    const dateOfBirth: string = dateOfBirthRef.current?.value ?? "";

    validateEmail(email);
    validatePassword(password);
    validateFirstName(firstName);
    validateLastName(lastName);
    validateDateOfBirth(dateOfBirth);

    if (
      emailErrors !== "" ||
      pwErrors !== "" ||
      firstNameErrors !== "" ||
      lastNameErrors !== "" ||
      dobErrors !== ""
    )
      return;

    if (email && password && firstName && lastName && dateOfBirth) {
      // Here you could also use the gender value if needed
      // console.log("Registration data:", {
      //   email,
      //   password,
      //   firstName,
      //   lastName,
      //   gender,
      //   dateOfBirth,
      // });
      setErrPrompt("");

      const userData = {
        email,
        password,
        firstName,
        lastName,
        gender,
        dateOfBirth,
      };

      setIsLoading(true);

      registerWithEmailAndPassword(
        userData,
        loginSuccessCallback,
        actionFailedCallback
      );
    } else {
      console.log("Required fields are empty");
    }
  };

  const logoutAccount = async () => {
    setIsLoading(true);
    await logout();
    setIsLoading(false);
  };

  const switchMode = () => {
    setErrPrompt("");
    setMode(mode === "LOGIN" ? "REGISTER" : "LOGIN");
  };

  // const sendSignInLinkToEmail = () => {
  //   const email: string = emailRef.current?.value ?? "";
  //   if (email) {
  //     loginWithEmailLink(email);
  //   }
  // };

  // const authEmailLink = async () => {
  //   const email: string = emailRef.current?.value ?? "";
  //   if (email) {
  //     await authEmail(email);
  //   }
  // };

  return (
    <div className="animate-fade-in flex flex-col items-center justify-start min-h-screen bg-gray-50 dark:bg-gray-500">
      <title>Auth</title>
      <Link to="/" className=" my-8">
        <img src={"/logo.png"} alt="Logo" className="h-20" />
      </Link>
      <div className="w-full max-w-md p-8 bg-white rounded-4xl shadow-lg ">
        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            {!auth.currentUser
              ? mode === "LOGIN"
                ? "User Authentication"
                : "Register"
              : "Log Out"}
          </h1>
          <p className="text-gray-600">
            {!auth.currentUser
              ? mode === "LOGIN"
                ? "Log in to your account"
                : "Create a new account"
              : "Log out of your account?"}
          </p>
        </div>

        {/* Form Section */}
        <div
          id="login-register-form"
          className={" space-y-6 " + (auth.currentUser ? "hidden" : "")}
        >
          <div>
            <div className="flex justify-between">
              <label
                htmlFor="email"
                className=" text-sm font-medium text-gray-700 mb-2"
              >
                Email *
              </label>
              <div
                className={`text-red-500 text-sm ${
                  emailErrors === "" ? "hidden" : ""
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
                emailErrors !== "" ? "ring-3 ring-red-500 " : ""
              }`}
              placeholder="Enter your email"
              onBlur={validateField}
            />
          </div>
          <div>
            <div className="flex justify-between">
              <label
                htmlFor="password"
                className="text-sm font-medium text-gray-700 mb-2"
              >
                Password *
              </label>
              <div
                className={`text-red-500 text-sm  ${
                  pwErrors === "" ? "hidden" : ""
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
                pwErrors !== "" ? "ring-3 ring-red-500 " : ""
              }`}
              placeholder={
                mode === "LOGIN"
                  ? "Enter your password"
                  : "min length: 6 characters"
              }
              onBlur={validateField}
            />
          </div>
          {/* Name - For register only */}
          <div
            className={
              "grid grid-cols-2 gap-2 " + (mode === "LOGIN" ? "hidden" : "")
            }
          >
            <div>
              <label
                htmlFor="firstName"
                className="h-6 block text-sm font-medium text-gray-700 mb-2"
              >
                Name *
              </label>

              <input
                ref={firstNameRef}
                type="text"
                id="firstName"
                name="firstName"
                className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors ${
                  firstNameErrors !== "" ? "ring-3 ring-red-500 " : ""
                }`}
                placeholder="Enter your first name"
                onBlur={validateField}
              />
            </div>
            <div>
              <div id="name-errors" className="h-8  block">
                <div
                  className={`text-right text-red-500 text-xs ${
                    firstNameErrors === "" ? "hidden" : ""
                  }`}
                >
                  {firstNameErrors}
                </div>
                <div
                  className={`text-right text-red-500 text-xs ${
                    lastNameErrors === "" ? "hidden" : ""
                  }`}
                >
                  {lastNameErrors}
                </div>
              </div>

              <input
                ref={lastNameRef}
                type="text"
                id="lastName"
                name="lastName"
                className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors ${
                  lastNameErrors !== "" ? "ring-3 ring-red-500 " : ""
                }`}
                placeholder="Enter your last name"
                onBlur={validateField}
              />
            </div>
          </div>
          {/* Gender - For register only (optional) */}
          <div className={"" + (mode === "LOGIN" ? "hidden" : "")}>
            <label
              htmlFor="gender"
              className="text-sm font-medium text-gray-700 mb-2"
            >
              Gender
            </label>

            <select
              ref={genderRef}
              id="gender"
              name="gender"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
            >
              <option defaultChecked value="not answered">
                --
              </option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="not answered">Prefer not to say</option>
            </select>
          </div>
          {/* Date of Birth - For register only */}
          <div className={"" + (mode === "LOGIN" ? "hidden" : "")}>
            <div className="flex justify-between">
              <label
                htmlFor="date-of-birth"
                className="text-sm font-medium text-gray-700 mb-2"
              >
                Date of Birth *
              </label>
              <div
                className={`text-red-500 text-sm ${
                  dobErrors === "" ? "hidden" : ""
                }`}
              >
                {dobErrors}
              </div>
            </div>

            <input
              ref={dateOfBirthRef}
              type="date"
              id="date-of-birth"
              name="dateOfBirth"
              className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors ${
                dobErrors !== "" ? "ring-3 ring-red-500 " : ""
              }`}
              onBlur={validateField}
              onChange={validateField}
            />
          </div>
          {/* For login */}
          <div
            className={
              "flex items-center justify-between " +
              (mode === "REGISTER" ? "hidden" : "")
            }
          >
            <label className="flex items-center">
              <input
                ref={rememberMeRef}
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
          {/* For login */}
          <button
            className={
              "w-full bg-primary text-white py-3 px-4 rounded-lg font-medium hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors " +
              (mode === "REGISTER" ? "hidden" : "")
            }
            onClick={emailPwLogin}
          >
            Log In
          </button>
          {/* For register */}
          <button
            className={
              "w-full bg-primary text-white py-3 px-4 rounded-lg font-medium hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors " +
              (mode === "LOGIN" ? "hidden" : "")
            }
            onClick={emailPwRegister}
          >
            Register
          </button>

          {/* Error Message */}
          <div
            className={
              "w-full p-2 text-red-600 bg-red-200 rounded-2xl animate-shake " +
              (errPrompt === "" ? "hidden" : "")
            }
          >
            {errPrompt}
          </div>
        </div>
        <div
          id="logout-button-section"
          className={"space-y-6 " + (!auth.currentUser ? "hidden" : "")}
        >
          <button
            className="w-full bg-primary text-white py-3 px-4 rounded-lg font-medium hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors"
            onClick={logoutAccount}
          >
            Log Out
          </button>
          <button
            className="w-full bg-white text-primary border-primary border-2 py-3 px-4 rounded-lg font-medium hover:bg-gray-100 transition-colors"
            onClick={() => {
              navigate("/");
            }}
          >
            Back
          </button>
        </div>
        <div
          id="register-section"
          className={"mt-6 text-center " + (auth.currentUser ? "hidden" : "")}
        >
          <p className="text-gray-600">
            {mode === "LOGIN" ? "New User? " : "Already have an account? "}
            <button
              //to="#"
              className="text-primary font-medium hover:text-orange-600 transition-colors"
              onClick={switchMode}
            >
              {mode === "LOGIN" ? "Register" : "Log In"}
            </button>
          </p>
        </div>

        {/* Other login methods - hidden when logged in */}
        <div className={"mt-6 " + (auth.currentUser ? "hidden" : "")}>
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
      {isLoading && <LoadingPanel />}
    </div>
  );

  function validatePassword(value: string) {
    let errors: string = "";

    if (!value) {
      errors = pwErr.required;
    } else if (value.length < 6) {
      errors = pwErr.minLength;
    }
    setPwErrors(errors);
  }

  function validateEmail(value: string) {
    let errors: string = "";

    if (!value) {
      errors = emailErr.required;
    } else if (!/\S+@\S+\.\S+/.test(value)) {
      errors = emailErr.pattern;
    }
    setEmailErrors(errors);
  }

  function validateDateOfBirth(value: string) {
    let errors: string = "";

    if (!value) {
      errors = dobErr.required;
    } else {
      const selectedDate = new Date(value);
      const today = new Date();

      // Check if date is valid
      if (isNaN(selectedDate.getTime())) {
        errors = dobErr.invalid;
      } else {
        // Calculate age
        let age = today.getFullYear() - selectedDate.getFullYear();
        const monthDiff = today.getMonth() - selectedDate.getMonth();

        if (
          monthDiff < 0 ||
          (monthDiff === 0 && today.getDate() < selectedDate.getDate())
        ) {
          age--;
        }

        // Check minimum age requirement (16 years)
        if (age < minAge) {
          errors = dobErr.age;
        }

        // Check if date is in the future
        if (selectedDate > today) {
          errors = dobErr.invalid;
        }
      }
    }
    setDobErrors(errors);
  }

  function validateFirstName(value: string) {
    let errors: string = "";

    if (!value) {
      errors = nameErr.required;
    } else if (!/^[a-zA-Z\s]+$/.test(value)) {
      errors = nameErr.pattern;
    }
    setFirstNameErrors(errors);
  }

  function validateLastName(value: string) {
    let errors: string = "";

    if (!value) {
      errors = nameErr.required;
    } else if (!/^[a-zA-Z\s]+$/.test(value)) {
      errors = nameErr.pattern;
    }
    setLastNameErrors(errors);
  }
}

export default Auth;
