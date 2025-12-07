import { Activity, useEffect, useState } from "react";
import { useTranslation } from "../../i18n/hooks";
import { changePassword, verifyUserEmail } from "../../firebase/firebase";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AiOutlineCheckCircle, AiOutlineCloseCircle } from "react-icons/ai";
import api from "../../services/api";
import type { AxiosError } from "axios";
import type { User } from "../../interface/user";
import LoadingPanel from "../../components/LoadingPanel";
import { toHKDateString } from "../../utils/dateUtils";

export interface UserWithExtraData extends User {
  emailVerified?: boolean;
  isPasswordProvider?: boolean;
}

type UserFormProps = {
  user: UserWithExtraData;
  adminView?: boolean;
};

function UserForm({ user, adminView = false }: UserFormProps) {
  const { t, i18n } = useTranslation("common");
  const isPasswordProvider = user.isPasswordProvider;
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
      if (adminView) return null; // skip for admin view

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
    if (adminView) return;

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
  }, [lastEmailSentAt, resendInterval, adminView]);

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordErrorKeys, setPasswordErrorKeys] = useState<string[]>([]);
  const [firebaseErrors, setFirebaseErrors] = useState<string>("");
  const [isUpdateSuccessful, setIsUpdateSuccessful] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const translateFirebaseError = (errorCode: string) =>
    i18n.t(`errors.${errorCode}`, {
      ns: "firebase",
      defaultValue: i18n.t("errors.auth/unexpected-error", {
        ns: "firebase",
      }),
    });

  const validatePasswords = () => {
    const errors: string[] = [];
    if (!oldPassword || !newPassword || !confirmPassword) {
      errors.push("messages.password.required");
    }
    if (newPassword.length < 6) {
      errors.push("messages.password.minLength");
    }
    if (oldPassword && newPassword && oldPassword === newPassword) {
      errors.push("messages.password.sameAsOld");
    }
    if (newPassword !== confirmPassword) {
      errors.push("messages.password.mismatch");
    }
    setPasswordErrorKeys(errors);
    return errors.length === 0;
  };

  if (isLoading) {
    return <LoadingPanel />;
  }

  return (
    <>
      <Activity mode={isSubmitting ? "visible" : "hidden"}>
        <LoadingPanel />
      </Activity>
      <div className="w-full md:max-w-4/5 lg:max-w-3/5 mx-auto ">
        <div className="tw-user-form-field">
          {t("user.userId")}: {user._id}
        </div>

        <div className="tw-user-form-field ">
          {t("user.name")}: {user.firstName} - {user.lastName}
        </div>

        <div className="tw-user-form-field flex flex-col">
          <div className="justify-between flex items-center">
            <div>
              {t("user.email")}: {user.email}
              {"  " /* gap between text and icon */}
              <br className="sm:hidden" />
              {user.emailVerified ? (
                <span className="text-green-600 ">
                  <AiOutlineCheckCircle className="inline" />{" "}
                  {t("status.verified")}
                </span>
              ) : (
                <span className="text-red-600 ">
                  <AiOutlineCloseCircle className="inline" />
                  {t("status.unverified")}
                </span>
              )}
            </div>

            <div>
              <Activity mode={user.emailVerified ? "hidden" : "visible"}>
                {isError
                  ? error.message
                  : !adminView && (
                      <button
                        disabled={timeLeft > 0}
                        onClick={async () => {
                          if (timeLeft > 0) return;
                          try {
                            setIsSubmitting(true);
                            await verifyUserEmail();
                            await setLastEmailSentAt(new Date());
                            setIsSubmitting(false);
                            setTimeLeft(resendInterval);
                          } catch (error) {
                            console.error(
                              "Error sending verification email:",
                              error
                            );
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
          <div
            className={`${
              timeLeft > 0 ? "visible" : "hidden"
            }  animate-fade-in bg-amber-200 text-black w-full px-4 py-2 rounded-2xl mt-4`}
          >
            {t("messages.verificationEmailSent")}
          </div>
        </div>
        <div className="tw-user-form-field">
          {t("user.gender")}: {t(`user.${user.gender}`)}
        </div>
        <div className="tw-user-form-field">
          {t("user.dateOfBirth")}: {toHKDateString(user.dateOfBirth)}
        </div>
        <Activity
          mode={isPasswordProvider && !adminView ? "visible" : "hidden"}
        >
          <div className="tw-user-form-field flex flex-col gap-3">
            <div>{t("labels.changePassword")}</div>
            <div className="flex flex-col gap-4 ">
              <div className="flex items-center gap-2 md:w-2/3 xl:w-1/2">
                <label htmlFor="oldPassword" className="w-32 text-sm">
                  {t("labels.oldPassword")}
                </label>
                <input
                  type="password"
                  id="oldPassword"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  className="border-2 rounded-lg px-2 py-1 flex-1 min-w-0"
                />
              </div>
              <div className="flex items-center gap-2 md:w-2/3 xl:w-1/2">
                <label htmlFor="newPassword" className="w-32 text-sm">
                  {t("labels.newPassword")}
                </label>
                <input
                  type="password"
                  id="newPassword"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="border-2 rounded-lg px-2 py-1 flex-1 min-w-0"
                />
              </div>
              <div className="flex items-center gap-2 md:w-2/3 xl:w-1/2">
                <label htmlFor="confirmPassword" className="w-32 text-sm">
                  {t("labels.confirmPassword")}
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="border-2 rounded-lg px-2 py-1 flex-1 min-w-0"
                />
              </div>
            </div>
            {(passwordErrorKeys.length > 0 || firebaseErrors) && (
              <ul className="w-full p-2 text-red-600 bg-red-200 rounded-2xl animate-shake space-y-1">
                {passwordErrorKeys.map((err) => (
                  <li key={err}>{t(err, { min: 6 })}</li>
                ))}
                {firebaseErrors && (
                  <li>{translateFirebaseError(firebaseErrors)}</li>
                )}
              </ul>
            )}
            <Activity mode={isUpdateSuccessful ? "visible" : "hidden"}>
              <div className="w-full p-2 text-green-800 bg-green-200 rounded-2xl animate-fade-in-out">
                {t("messages.passwordUpdateSuccess")}
              </div>
            </Activity>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={async () => {
                  setPasswordErrorKeys([]);
                  setFirebaseErrors("");
                  if (!validatePasswords()) return;
                  // Firebase password update will be handled later

                  const successCB = () => {
                    setOldPassword("");
                    setNewPassword("");
                    setConfirmPassword("");
                    setPasswordErrorKeys([]);
                    setFirebaseErrors("");
                    setIsUpdateSuccessful(true);
                    setTimeout(() => {
                      setIsUpdateSuccessful(false);
                    }, 3000);
                  };
                  const failCB = (errorCode: string) => {
                    setFirebaseErrors(errorCode);
                  };

                  setIsSubmitting(true);
                  await changePassword(
                    oldPassword,
                    newPassword,
                    successCB,
                    failCB
                  );
                  setIsSubmitting(false);
                }}
                className="tw-button border-2 border-primary rounded-lg px-4 py-1 hover:bg-primary hover:text-white transition duration-150 cursor-pointer"
              >
                {t("buttons.savePassword")}
              </button>
              <button
                type="button"
                onClick={() => {
                  setOldPassword("");
                  setNewPassword("");
                  setConfirmPassword("");
                  setPasswordErrorKeys([]);
                  setFirebaseErrors("");
                }}
                className="tw-button border-2 border-gray-400 rounded-lg px-4 py-1 hover:bg-gray-200 hover:text-black transition duration-150 cursor-pointer"
              >
                {t("buttons.clear")}
              </button>
            </div>
          </div>
        </Activity>
      </div>
    </>
  );
}

export default UserForm;
