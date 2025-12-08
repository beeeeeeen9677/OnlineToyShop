import { Link } from "react-router";
import { useTranslation } from "../../i18n/hooks";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import api from "../../services/api";
import { sendResetEmail } from "../../firebase/firebase";
import LoadingPanel from "../../components/LoadingPanel";

function ForgetPw() {
  const { t } = useTranslation("auth");
  const [email, setEmail] = useState("");
  const [emailErrors, setEmailErrors] = useState("");
  function validateEmail(email: string) {
    let errors: string = "";

    if (!email) {
      errors = emailErr.required;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors = emailErr.pattern;
    }
    setEmailErrors(errors);
  }
  const emailErr = {
    required: t("validation.email.required"),
    pattern: t("validation.email.pattern"),
  };

  const resendInterval = 60; // in second, 1 minute
  const queryClient = useQueryClient();
  const {
    data: lastEmailSentAt,
    isLoading,
    isError,
    error,
  } = useQuery<Date | null, AxiosError>({
    queryKey: ["lastResetEmailSentAt"],
    queryFn: async () => {
      const res = await api.get("/auth/last-reset-email");
      const raw = res.data;
      if (!raw) return null;
      return new Date(raw);
    },
  });

  const { mutateAsync: setLastResetEmailSentAt } = useMutation({
    mutationFn: async (timeStamp: Date) => {
      const res = await api.post("/auth/last-reset-email", {
        // do not rename to timestamp (case sensitive) as backend use timeStamp
        timeStamp: timeStamp.toISOString(),
      });
      return res.data; // maybe convert to Date again if needed
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lastResetEmailSentAt"] });
      alert(t("messages.resetEmailSent"));
    },
  });

  const [timeLeft, setTimeLeft] = useState<number>(0);

  useEffect(() => {
    if (!lastEmailSentAt) {
      setTimeLeft(0);
      return;
    }

    const updateCountdown = () => {
      const elapsedSeconds = (Date.now() - lastEmailSentAt.getTime()) / 1000;
      const remaining = Math.max(0, Math.ceil(resendInterval - elapsedSeconds));
      setTimeLeft(remaining);
    };

    updateCountdown();
    const timerId = window.setInterval(updateCountdown, 1000);

    return () => {
      window.clearInterval(timerId);
    };
  }, [lastEmailSentAt, resendInterval]);

  const sendResetPWEmail = async (email: string) => {
    validateEmail(email);
    if (emailErrors !== "") return;

    try {
      await sendResetEmail(email);
      await setLastResetEmailSentAt(new Date());
    } catch (error) {
      console.error("Error sending reset email:", error);
    }
  };

  if (isLoading) {
    return <LoadingPanel />;
  }

  if (isError) {
    return (
      <div>
        Error: {(error as AxiosError<{ error: string }>).response?.data?.error}
      </div>
    );
  }

  return (
    <div className="animate-fade-in flex flex-col items-center justify-start min-h-screen bg-gray-50 dark:bg-gray-500">
      <title>FORGET PASSWORD | PREMIUM BEN TOYS</title>
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
            value={email}
          />
          <button
            className={
              "w-full bg-primary cursor-pointer text-white py-3 px-4 rounded-lg font-medium hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors disabled:bg-gray-500 disabled:cursor-default"
            }
            onClick={() => sendResetPWEmail(email)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                sendResetPWEmail(email);
              }
            }}
            disabled={timeLeft > 0}
          >
            {timeLeft > 0 ? timeLeft : t("buttons.sendResetLink")}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ForgetPw;
