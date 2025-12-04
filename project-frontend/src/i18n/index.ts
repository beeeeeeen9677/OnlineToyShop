import i18n from "i18next";
import { initReactI18next } from "react-i18next";

// Import translation files
import enCommon from "../locales/en/common.json";
import enAuth from "../locales/en/auth.json";
import enAdmin from "../locales/en/admin.json";
import enChat from "../locales/en/chat.json";
import enHeader from "../locales/en/header.json";
import enGoods from "../locales/en/goods.json";
import enIndex from "../locales/en/index.json";
import enFirebase from "../locales/en/firebase.json";
import enSearch from "../locales/en/search.json";
import enShoppingCart from "../locales/en/shoppingCart.json";

import zhCommon from "../locales/zh/common.json";
import zhAuth from "../locales/zh/auth.json";
import zhAdmin from "../locales/zh/admin.json";
import zhChat from "../locales/zh/chat.json";
import zhHeader from "../locales/zh/header.json";
import zhGoods from "../locales/zh/goods.json";
import zhIndex from "../locales/zh/index.json";
import zhFirebase from "../locales/zh/firebase.json";
import zhSearch from "../locales/zh/search.json";
import zhShoppingCart from "../locales/zh/shoppingCart.json";

// Define resources
const resources = {
  en: {
    common: enCommon,
    auth: enAuth,
    admin: enAdmin,
    chat: enChat,
    header: enHeader,
    goods: enGoods,
    index: enIndex,
    firebase: enFirebase,
    search: enSearch,
    shoppingCart: enShoppingCart,
  },
  zh: {
    common: zhCommon,
    auth: zhAuth,
    admin: zhAdmin,
    chat: zhChat,
    header: zhHeader,
    goods: zhGoods,
    index: zhIndex,
    firebase: zhFirebase,
    search: zhSearch,
    shoppingCart: zhShoppingCart,
  },
};

i18n.use(initReactI18next).init({
  resources,
  lng: "en", // Default language
  fallbackLng: "en", // Fallback language

  // Default namespace
  defaultNS: "common",

  // Namespace configuration
  ns: [
    "common",
    "auth",
    "admin",
    "chat",
    "header",
    "goods",
    "index",
    "firebase",
    "search",
    "shoppingCart",
  ],

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
