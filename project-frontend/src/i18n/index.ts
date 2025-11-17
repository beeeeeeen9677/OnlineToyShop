import i18n from "i18next";
import { initReactI18next } from "react-i18next";

// Import translation files
import enCommon from "../locales/en/common.json";
import enAuth from "../locales/en/auth.json";
import enAdmin from "../locales/en/admin.json";
import enHeader from "../locales/en/header.json";
import enGoods from "../locales/en/goods.json";
import enIndex from "../locales/en/index.json";

import zhCommon from "../locales/zh/common.json";
import zhAuth from "../locales/zh/auth.json";
import zhAdmin from "../locales/zh/admin.json";
import zhHeader from "../locales/zh/header.json";
import zhGoods from "../locales/zh/goods.json";
import zhIndex from "../locales/zh/index.json";

// Define resources
const resources = {
  en: {
    common: enCommon,
    auth: enAuth,
    admin: enAdmin,
    header: enHeader,
    goods: enGoods,
    index: enIndex,
  },
  zh: {
    common: zhCommon,
    auth: zhAuth,
    admin: zhAdmin,
    header: zhHeader,
    goods: zhGoods,
    index: zhIndex,
  },
};

i18n.use(initReactI18next).init({
  resources,
  lng: "en", // Default language
  fallbackLng: "en", // Fallback language

  // Default namespace
  defaultNS: "common",

  // Namespace configuration
  ns: ["common", "auth", "admin", "header", "goods", "index"],

  interpolation: {
    escapeValue: false, // React already does escaping
  },

  // Development configuration
  debug: process.env.NODE_ENV === "development",

  // Load path configuration
  load: "languageOnly", // Ignore region code (e.g., use 'zh' instead of 'zh-CN')

  // Detection options (you can add browser language detection later)
  detection: {
    order: ["localStorage", "navigator"],
    caches: ["localStorage"],
  },
});

export default i18n;
