import { Activity, useEffect, useState } from "react";
import { useTranslation } from "../../i18n/hooks";
import { auth, verifyUserEmail } from "../../firebase/firebase";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AiOutlineCheckCircle, AiOutlineCloseCircle } from "react-icons/ai";
import api from "../../services/api";
import type { AxiosError } from "axios";
import type { User } from "../../interface/user";
import LoadingPanel from "../../components/LoadingPanel";
type UserFormProps = {
  user: User;
};

function UserForm({ user }: UserFormProps) {
  const { t } = useTranslation("common");

  const resendInterval = 60; // in second, 1 minute
  const queryClient = useQueryClient();
  const {
    data: lastEmailSentAt,
    isLoading,
    isError,
    error,
  } = useQuery<Date | null, AxiosError>({
    queryKey: ["lastEmailSentAt"],
    queryFn: async () => {
      const res = await api.get("/user/last-verification-email");
      const raw = res.data;
      if (!raw) return null;
      return new Date(raw);
    },
  });

  const { mutateAsync: setLastEmailSentAt } = useMutation({
    mutationFn: async (timeStamp: Date) => {
      const res = await api.post("/user/last-verification-email", {
        // do not rename to timestamp (case sensitive) as backend use timeStamp
        timeStamp: timeStamp.toISOString(),
      });
      return res.data; // maybe convert to Date again if needed
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lastEmailSentAt"] });
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

  if (isLoading) {
    return <LoadingPanel />;
  }

  return (
    <div className="w-full md:max-w-4/5 lg:max-w-3/5 mx-auto">
      <div className="tw-user-form-field">
        {t("user.userId")}: {user._id}
      </div>

      <div className="tw-user-form-field ">
        {t("user.name")}: {user.firstName} - {user.lastName}
      </div>

      <div className="tw-user-form-field justify-between flex items-center">
        <div>
          {t("user.email")}: {user.email}
          {"  "}
          <br className="sm:hidden" />
          {auth.currentUser?.emailVerified ? (
            <span className="text-green-600 ">
              <AiOutlineCheckCircle className="inline" /> {t("status.verified")}
            </span>
          ) : (
            <span className="text-red-600 ">
              <AiOutlineCloseCircle className="inline" />
              {t("status.unverified")}
            </span>
          )}
        </div>
        <div>
          <Activity
            mode={auth.currentUser?.emailVerified ? "hidden" : "visible"}
          >
            {isError ? (
              error.message
            ) : (
              <button
                disabled={timeLeft > 0}
                onClick={async () => {
                  if (timeLeft > 0) return;
                  try {
                    await verifyUserEmail();
                    await setLastEmailSentAt(new Date());
                    alert(t("messages.verificationEmailSent"));
                    setTimeLeft(resendInterval);
                  } catch (error) {
                    console.error("Error sending verification email:", error);
                  }
                }}
                className={`tw-button border-2 ${
                  timeLeft <= 0
                    ? "border-primary hover:bg-primary cursor-pointer  hover:text-white"
                    : "border-gray-400"
                }  rounded-lg px-4 py-1  transition duration-150 `}
              >
                {timeLeft <= 0 ? t("buttons.verify") : `${timeLeft}s`}
              </button>
            )}
          </Activity>
        </div>
      </div>
      <div className="tw-user-form-field">
        {t("user.gender")}: {t(`user.${user.gender}`)}
      </div>
      <div className="tw-user-form-field">
        {t("user.dateOfBirth")}: {user.dateOfBirth.toString().split("T")[0]}
      </div>
    </div>
  );
}

export default UserForm;
