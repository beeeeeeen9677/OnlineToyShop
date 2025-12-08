import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { useTranslation } from "../../i18n/hooks";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../services/api";
import { auth } from "../../firebase/firebase";
import type { AxiosError } from "axios";
import { useLoginContext, useUserContext } from "../../context/app";

function CompleteProfile() {
  const { t } = useTranslation("auth");
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isLoggedIn = useLoginContext();
  const user = useUserContext();

  // Check if OAuth user needs to complete profile
  const currentPath = useLocation().pathname;
  useEffect(() => {
    if (!isLoggedIn) navigate("/");

    if (isLoggedIn && user && user.profileComplete) {
      navigate("/");
    }
  }, [isLoggedIn, user, currentPath, navigate]);

  const firstNameRef = useRef<HTMLInputElement>(null);
  const lastNameRef = useRef<HTMLInputElement>(null);
  const genderRef = useRef<HTMLSelectElement>(null);
  const dateOfBirthRef = useRef<HTMLInputElement>(null);

  const [firstNameErrors, setFirstNameErrors] = useState<string>("");
  const [lastNameErrors, setLastNameErrors] = useState<string>("");
  const [dobErrors, setDobErrors] = useState<string>("");
  const [errPrompt, setErrPrompt] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const minAge = 16;
  const nameErr = {
    required: t("validation.name.required"),
    pattern: t("validation.name.pattern"),
  };

  const dobErr = {
    required: t("validation.dateOfBirth.required"),
    invalid: t("validation.dateOfBirth.invalid"),
    age: t("validation.dateOfBirth.age", { minAge }),
  };

  const validateFirstName = (value: string) => {
    if (!value.trim()) {
      setFirstNameErrors(nameErr.required);
      return false;
    }
    const namePattern = /^[a-zA-Z\s]+$/;
    if (!namePattern.test(value)) {
      setFirstNameErrors(nameErr.pattern);
      return false;
    }
    setFirstNameErrors("");
    return true;
  };

  const validateLastName = (value: string) => {
    if (!value.trim()) {
      setLastNameErrors(nameErr.required);
      return false;
    }
    const namePattern = /^[a-zA-Z\s]+$/;
    if (!namePattern.test(value)) {
      setLastNameErrors(nameErr.pattern);
      return false;
    }
    setLastNameErrors("");
    return true;
  };

  const validateDateOfBirth = (value: string) => {
    if (!value) {
      setDobErrors(dobErr.required);
      return false;
    }

    const dob = new Date(value);
    const today = new Date();

    if (isNaN(dob.getTime())) {
      setDobErrors(dobErr.invalid);
      return false;
    }

    const age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    const dayDiff = today.getDate() - dob.getDate();

    if (
      age < minAge ||
      (age === minAge && (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)))
    ) {
      setDobErrors(dobErr.age);
      return false;
    }

    setDobErrors("");
    return true;
  };

  const validateField = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name === "firstName") {
      validateFirstName(value);
    } else if (name === "lastName") {
      validateLastName(value);
    } else if (name === "dateOfBirth") {
      validateDateOfBirth(value);
    }
  };

  const { mutateAsync: completeProfile } = useMutation({
    mutationFn: async (data: {
      firstName: string;
      lastName: string;
      gender: string;
      dateOfBirth: string;
    }) => {
      const res = await api.post("/auth/complete-profile", data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["user", { id: auth.currentUser?.uid }],
      });
      navigate("/");
      window.location.reload();
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrPrompt("");

    const firstName = firstNameRef.current?.value || "";
    const lastName = lastNameRef.current?.value || "";
    const gender = genderRef.current?.value || "";
    const dateOfBirth = dateOfBirthRef.current?.value || "";

    // Validate all fields
    const isFirstNameValid = validateFirstName(firstName);
    const isLastNameValid = validateLastName(lastName);
    const isDobValid = validateDateOfBirth(dateOfBirth);

    if (!isFirstNameValid || !isLastNameValid || !isDobValid) {
      setErrPrompt(t("validation.fixErrors"));
      return;
    }

    if (!gender) {
      setErrPrompt(t("validation.gender.required"));
      return;
    }

    setIsLoading(true);

    try {
      //await api.post("/auth/complete-profile", {
      await completeProfile({
        firstName,
        lastName,
        gender,
        dateOfBirth,
      });
    } catch (error) {
      console.error("Error completing profile:", error);
      const axiosError = error as AxiosError<{ message: string }>;
      setErrPrompt(
        axiosError.response?.data?.message || t("errors.unexpected")
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-md p-8">
        <h2 className="text-2xl font-bold text-center mb-2 text-gray-900 dark:text-white">
          {t("completeProfile.title")}
        </h2>
        <p className="text-gray-600 dark:text-gray-400 text-center mb-6">
          {t("completeProfile.subtitle")}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* First Name */}
          <div>
            <label
              htmlFor="firstName"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              {t("fields.firstName")} <span className="text-red-500">*</span>
            </label>
            <input
              ref={firstNameRef}
              type="text"
              id="firstName"
              name="firstName"
              onBlur={validateField}
              className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
            />
            {firstNameErrors && (
              <p className="text-red-500 dark:text-red-400 text-sm mt-1">
                {firstNameErrors}
              </p>
            )}
          </div>

          {/* Last Name */}
          <div>
            <label
              htmlFor="lastName"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              {t("fields.lastName")} <span className="text-red-500">*</span>
            </label>
            <input
              ref={lastNameRef}
              type="text"
              id="lastName"
              name="lastName"
              onBlur={validateField}
              className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
            />
            {lastNameErrors && (
              <p className="text-red-500 dark:text-red-400 text-sm mt-1">
                {lastNameErrors}
              </p>
            )}
          </div>

          {/* Gender */}
          <div>
            <label
              htmlFor="gender"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              {t("fields.gender")} <span className="text-red-500">*</span>
            </label>
            <select
              ref={genderRef}
              id="gender"
              name="gender"
              className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
            >
              <option value="">{t("fields.selectGender")}</option>
              <option value="male">{t("fields.male")}</option>
              <option value="female">{t("fields.female")}</option>
              <option value="not answered">{t("fields.notAnswered")}</option>
            </select>
          </div>

          {/* Date of Birth */}
          <div>
            <label
              htmlFor="dateOfBirth"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              {t("fields.dateOfBirth")} <span className="text-red-500">*</span>
            </label>
            <input
              ref={dateOfBirthRef}
              type="date"
              id="dateOfBirth"
              name="dateOfBirth"
              onClick={(e) => {
                e.currentTarget.showPicker();
              }}
              onBlur={validateField}
              className="w-full px-3 py-2 cursor-pointer bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
            />
            {dobErrors && (
              <p className="text-red-500 dark:text-red-400 text-sm mt-1">
                {dobErrors}
              </p>
            )}
          </div>

          {/* Error Prompt */}
          {errPrompt && (
            <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded">
              {errPrompt}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary text-white py-2 px-4 rounded-md hover:bg-primary-hover cursor-pointer disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading
              ? t("completeProfile.submitting")
              : t("completeProfile.submit")}
          </button>
        </form>
      </div>
    </div>
  );
}

export default CompleteProfile;
