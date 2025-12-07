import { useEffect, useEffectEvent, useRef, useState } from "react";
import { Link, useNavigate } from "react-router";
import type { AxiosError } from "axios";
import { useTranslation } from "../../i18n/hooks";
import { FcGoogle } from "react-icons/fc";
import { FaFacebook } from "react-icons/fa";
import {
  auth,
  loginWithEmailAndPassword,
  registerWithEmailAndPassword,
  logInWithGooglePopup,
  logInWithFacebookPopup,
  // loginWithEmailLink,
  // authEmail,
  logout,
} from "../../firebase/firebase";

import LoadingPanel from "../../components/LoadingPanel";
import api from "../../services/api";

function Auth() {
  const { t, i18n } = useTranslation("auth");
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
    required: t("validation.email.required"),
    pattern: t("validation.email.pattern"),
  };

  const pwErr = {
    required: t("validation.password.required"),
    minLength: t("validation.password.minLength"),
  };

  const minAge = 16;
  const dobErr = {
    required: t("validation.dateOfBirth.required"),
    invalid: t("validation.dateOfBirth.invalid"),
    age: t("validation.dateOfBirth.age", { minAge }),
  };

  useEffect(() => {
    if (typeof window === "undefined") return;
    const storageKey = "premiumbentoys:rememberMe";
    const savedCredentials = localStorage.getItem(storageKey);
    if (!savedCredentials) return;
    try {
      const parsed: { email?: string; password?: string } =
        JSON.parse(savedCredentials);
      if (parsed.email && emailRef.current) {
        emailRef.current.value = parsed.email;
      }
      if (parsed.password && passwordRef.current) {
        passwordRef.current.value = parsed.password;
      }
      if (rememberMeRef.current) {
        rememberMeRef.current.checked = true;
      }
    } catch (parseError) {
      console.warn("Failed to parse remembered credentials", parseError);
      localStorage.removeItem(storageKey);
    }
  }, []);

  const nameErr = {
    required: t("validation.name.required"),
    pattern: t("validation.name.pattern"),
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
  const actionFailedCallback = (errorCode: string) => {
    console.log("Login/Register Failed. Error code:", errorCode);
    const localizedMessage = i18n.t(`errors.${errorCode}`, {
      ns: "firebase",
      defaultValue: i18n.t("errors.auth/unexpected-error", {
        ns: "firebase",
      }),
    });
    setErrPrompt(localizedMessage);
    setIsLoading(false);
    if (passwordRef.current) {
      passwordRef.current.value = "";
    }
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

  const googleLogin = async () => {
    try {
      await logInWithGooglePopup(loginSuccessCallback, actionFailedCallback);
    } catch (error) {
      console.error("Google login failed:", error);
    }
  };

  const facebookLogin = async () => {
    try {
      await logInWithFacebookPopup(loginSuccessCallback, actionFailedCallback);
    } catch (error) {
      console.error("Facebook login failed:", error);
    }
  };

  const expressLogout = useEffectEvent(async () => {
    // call backend api to clear session
    try {
      const res = await api.post("/auth/logout");
      console.log("Backend logout response:", res.data);
    } catch (error) {
      const axiosError = error as AxiosError<{ error: string }>;
      console.error(
        "Error during backend logout:",
        axiosError.response?.data?.error
      );
    }
  });

  const logoutAccount = async () => {
    setIsLoading(true);
    await expressLogout();
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

  // handle keyboard Enter
  const handleEnterEvent = useEffectEvent(
    (event: { key: string }, mode: string) => {
      if (event.key === "Enter") {
        if (mode === "LOGIN") {
          emailPwLogin();
        } else {
          emailPwRegister();
        }
      }
    }
  );

  useEffect(() => {
    const handleKeyDown = (event: { key: string }) => {
      handleEnterEvent(event, mode);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [mode]);

  return (
    <div className="animate-fade-in flex flex-col items-center justify-start min-h-screen bg-gray-50 dark:bg-gray-500">
      <title>AUTH | PREMIUM BEN TOYS</title>
      <Link to="/" className=" my-8">
        <img src={"/logo.png"} alt="Logo" className="h-20" />
      </Link>
      <div className="w-full max-w-md p-8 bg-white dark:bg rounded-4xl shadow-lg ">
        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            {!auth.currentUser
              ? mode === "LOGIN"
                ? t("titles.authentication")
                : t("titles.register")
              : t("titles.logout")}
          </h1>
          <p className="text-gray-600">
            {!auth.currentUser
              ? mode === "LOGIN"
                ? t("descriptions.loginPrompt")
                : t("descriptions.registerPrompt")
              : t("descriptions.logoutPrompt")}
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
                {t("labels.email")} *
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
              className={`w-full px-4 py-3 dark:bg-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors ${
                emailErrors !== "" ? "ring-3 ring-red-500 " : ""
              }`}
              placeholder={t("placeholders.enterEmail")}
              onBlur={validateField}
            />
          </div>
          <div>
            <div className="flex justify-between">
              <label
                htmlFor="password"
                className="text-sm font-medium text-gray-700 mb-2"
              >
                {t("labels.password")} *
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
              className={`w-full px-4 py-3 border dark:bg-gray-900 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors ${
                pwErrors !== "" ? "ring-3 ring-red-500 " : ""
              }`}
              placeholder={
                mode === "LOGIN"
                  ? t("placeholders.enterPassword")
                  : t("placeholders.passwordMinLength")
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
                {t("labels.firstName")} *
              </label>

              <input
                ref={firstNameRef}
                type="text"
                id="firstName"
                name="firstName"
                className={`w-full px-4 py-3 border dark:bg-gray-900 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors ${
                  firstNameErrors !== "" ? "ring-3 ring-red-500 " : ""
                }`}
                placeholder={t("placeholders.enterFirstName")}
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
                className={`w-full px-4 py-3 dark:bg-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors ${
                  lastNameErrors !== "" ? "ring-3 ring-red-500 " : ""
                }`}
                placeholder={t("placeholders.enterLastName")}
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
              {t("labels.gender")}
            </label>

            <select
              ref={genderRef}
              id="gender"
              name="gender"
              className="w-full px-4 py-3 border dark:bg-gray-900 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
            >
              <option defaultChecked value="not answered">
                {t("genderOptions.notAnswered")}
              </option>
              <option value="male">{t("genderOptions.male")}</option>
              <option value="female">{t("genderOptions.female")}</option>
              <option value="not answered">
                {t("genderOptions.preferNotToSay")}
              </option>
            </select>
          </div>
          {/* Date of Birth - For register only */}
          <div className={"" + (mode === "LOGIN" ? "hidden" : "")}>
            <div className="flex justify-between">
              <label
                htmlFor="date-of-birth"
                className="text-sm font-medium text-gray-700 mb-2"
              >
                {t("labels.dateOfBirth")} *
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
              className={`w-full px-4 py-3 cursor-pointer dark:bg-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors ${
                dobErrors !== "" ? "ring-3 ring-red-500 " : ""
              }`}
              onBlur={validateField}
              onChange={validateField}
              onClick={() => {
                dateOfBirthRef.current?.showPicker();
              }}
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
              <span className="ml-2 text-sm text-gray-600">
                {t("labels.rememberMe")}
              </span>
            </label>
            <Link
              to="/auth/forget-password"
              className="text-sm text-primary hover:text-orange-600 transition-colors"
            >
              {t("buttons.forgetPassword")}
            </Link>
          </div>
          {/* For login */}
          <button
            className={
              "w-full bg-primary cursor-pointer text-white py-3 px-4 rounded-lg font-medium hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors " +
              (mode === "REGISTER" ? "hidden" : "")
            }
            onClick={emailPwLogin}
          >
            {t("buttons.login")}
          </button>
          {/* For register */}
          <button
            className={
              "w-full bg-primary cursor-pointer text-white py-3 px-4 rounded-lg font-medium hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors " +
              (mode === "LOGIN" ? "hidden" : "")
            }
            onClick={emailPwRegister}
          >
            {t("buttons.register")}
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
            className="w-full bg-primary cursor-pointer text-white py-3 px-4 rounded-lg font-medium hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors"
            onClick={logoutAccount}
          >
            {t("buttons.logout")}
          </button>
          <button
            className="w-full bg-white cursor-pointer text-primary border-primary border-2 py-3 px-4 rounded-lg font-medium hover:bg-gray-100 transition-colors"
            onClick={() => {
              navigate("/");
            }}
          >
            {t("buttons.back")}
          </button>
        </div>
        <div
          id="register-section"
          className={"mt-6 text-center " + (auth.currentUser ? "hidden" : "")}
        >
          <p className="text-gray-600">
            {mode === "LOGIN"
              ? t("links.newUser") + " "
              : t("links.alreadyHaveAccount") + " "}
            <button
              //to="#"
              className="text-primary cursor-pointer font-medium hover:text-orange-600 transition-colors"
              onClick={switchMode}
            >
              {mode === "LOGIN" ? t("buttons.register") : t("buttons.login")}
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
              <span className="px-2 bg-white text-gray-500">
                {t("links.otherMethods")}
              </span>
            </div>
          </div>

          <div className="mt-6 flex gap-3">
            <button
              type="button"
              className="cursor-pointer w-full inline-flex justify-center py-3 px-4 border border-gray-300 rounded-lg bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 transition-colors"
              onClick={googleLogin}
            >
              <FcGoogle size={20} />
              <span className="ml-2">{t("providers.google")}</span>
            </button>

            {/* <button
              type="button"
              className="cursor-pointer w-full inline-flex justify-center py-3 px-4 border border-gray-300 rounded-lg bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 transition-colors"
              onClick={facebookLogin}
            >
              <FaFacebook size={20} color="#1877F2" />
              <span className="ml-2">{t("providers.facebook")}</span>
            </button> */}
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
