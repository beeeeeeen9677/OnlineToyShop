import { useTranslation as useReactI18nextTranslation } from "react-i18next";
import { useState, useEffect } from "react";
import i18n from "../i18n";

// Type definitions for supported languages
export type SupportedLanguage = "en" | "zh";

// Type definitions for namespaces
export type Namespace =
  | "common"
  | "auth"
  | "admin"
  | "chat"
  | "header"
  | "goods"
  | "index"
  | "firebase";

// Custom hook for translation with namespace support
export const useTranslation = (namespace: Namespace = "common") => {
  const { t, i18n: i18nInstance } = useReactI18nextTranslation(namespace);

  return {
    t,
    i18n: i18nInstance,
    currentLanguage: i18nInstance.language as SupportedLanguage,
  };
};

// Custom hook for language management
export const useLanguage = () => {
  const [currentLanguage, setCurrentLanguage] = useState<SupportedLanguage>(
    (i18n.language as SupportedLanguage) || "en"
  );

  useEffect(() => {
    const handleLanguageChange = (lng: string) => {
      setCurrentLanguage(lng as SupportedLanguage);
    };

    i18n.on("languageChanged", handleLanguageChange);

    return () => {
      i18n.off("languageChanged", handleLanguageChange);
    };
  }, []);

  const changeLanguage = async (language: SupportedLanguage) => {
    try {
      await i18n.changeLanguage(language);
      localStorage.setItem("language", language);
    } catch (error) {
      console.error("Failed to change language:", error);
    }
  };

  return {
    currentLanguage,
    changeLanguage,
    isEnglish: currentLanguage === "en",
    isChinese: currentLanguage === "zh",
  };
};

// Helper function to get translation with fallback
export const translate = (
  key: string,
  namespace: Namespace = "common",
  options?: Record<string, unknown>
) => {
  return i18n.t(key, { ns: namespace, ...options });
};

// Export supported languages for UI components
export const SUPPORTED_LANGUAGES: {
  code: SupportedLanguage;
  name: string;
  nativeName: string;
}[] = [
  { code: "en", name: "English", nativeName: "English" },
  { code: "zh", name: "Chinese", nativeName: "中文" },
];
