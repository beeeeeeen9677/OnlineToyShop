import { Link } from "react-router";
import { useTranslation } from "../../i18n/hooks";
import { useEffect, useRef, useState } from "react";
import { sendResetEmail } from "../../firebase/firebase";
import LoadingPanel from "../../components/LoadingPanel";

const getResetEmailTimestamp = (): string | null => {
  return localStorage.getItem("resetEmailTimestamps") ?? null;
};

const setResetEmailTimestamp = () => {
  localStorage.setItem("resetEmailTimestamps", new Date().toISOString());
};

function ForgetPw() {
  const { t } = useTranslation("auth");
  const emailElem = useRef<HTMLInputElement>(null);
  const setEmail = (value: string) => {
    if (emailElem.current) {
      emailElem.current.value = value;
    }
  };
  const [emailErrors, setEmailErrors] = useState("");
  const [isSentEmailPending, setIsSentEmailPending] = useState(false);

  const resendInterval = 60; // in seconds, 1 minute
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [lastSentTimestamp, setLastSentTimestamp] = useState<string | null>(
    () => getResetEmailTimestamp()
  );

  function validateEmail(email: string): string {
    let errors: string = "";

    if (!email) {
      errors = emailErr.required;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors = emailErr.pattern;
    }
    setEmailErrors(errors);
    return errors;
  }
  const emailErr = {
    required: t("validation.email.required"),
    pattern: t("validation.email.pattern"),
  };

  // Load timestamp and update countdown
  useEffect(() => {
    if (!lastSentTimestamp) {
      setTimeLeft(0);
      return;
    }

    const updateCountdown = () => {
      const elapsedSeconds =
        (Date.now() - new Date(lastSentTimestamp).getTime()) / 1000;
      const remaining = Math.max(0, Math.ceil(resendInterval - elapsedSeconds));
      setTimeLeft(remaining);
    };

    updateCountdown();
    const timerId = window.setInterval(updateCountdown, 1000);

    return () => {
      window.clearInterval(timerId);
    };
  }, [lastSentTimestamp, resendInterval]);

  const sendResetPWEmail = async () => {
    if (!emailElem.current) return;

    if (validateEmail(emailElem.current.value) !== "") return;
    setIsSentEmailPending(true);
    try {
      // Send Firebase reset email
      await sendResetEmail(emailElem.current.value);

      // Store timestamp in localStorage
      setResetEmailTimestamp();

      // Update state to trigger countdown
      const newTimestamp = new Date().toISOString();
      setLastSentTimestamp(newTimestamp);

      alert(t("messages.resetEmailSent"));
    } catch (error) {
      console.error("Error sending reset email:", error);
    } finally {
      setIsSentEmailPending(false);
    }
  };

  return (
    <div className="animate-fade-in flex flex-col items-center justify-start min-h-screen bg-gray-50 dark:bg-gray-500">
      <title>FORGET PASSWORD | PREMIUM BEN TOYS</title>
      {isSentEmailPending && <LoadingPanel />}
      <Link to="/" className=" my-8">
        <img src={"/logo.png"} alt="Logo" className="h-20" />
      </Link>
      <div className="w-full max-w-md p-8 bg-white dark:bg rounded-4xl shadow-lg relative">
        <Link
          to="/auth"
          className="absolute top-4 left-4 text-primary hover:text-orange-600"
        >
          &lt; {t("buttons.login")}
        </Link>
        <h1 className="text-3xl font-bold text-center mb-2  text-gray-800">
          {t("titles.forgetPassword")}
        </h1>
        <div>
          <div className="flex justify-between">
            <label
              htmlFor="email"
              className=" text-sm font-medium text-gray-700 mb-2"
            >
              {t("labels.email")}
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
            type="email"
            id="email"
            name="email"
            className={`w-full px-4 py-3 mb-6 dark:bg-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors ${
              emailErrors !== "" ? "ring-3 ring-red-500 " : ""
            }`}
            placeholder={t("placeholders.enterEmail")}
            onBlur={(e) => validateEmail(e.target.value)}
            onChange={(e) => setEmail(e.target.value)}
            ref={emailElem}
          />
          <button
            className={
              "w-full bg-primary cursor-pointer text-white py-3 px-4 rounded-lg font-medium hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors disabled:bg-gray-500 disabled:cursor-default"
            }
            onClick={() => sendResetPWEmail()}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                sendResetPWEmail();
              }
            }}
            disabled={timeLeft > 0 || isSentEmailPending}
          >
            {timeLeft > 0 ? timeLeft : t("buttons.sendResetLink")}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ForgetPw;
