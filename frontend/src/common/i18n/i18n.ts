import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import * as de from "src/common/i18n/translations/de.json";
import * as en from "src/common/i18n/translations/en.json";

const i18nCmp = i18n.createInstance();

i18nCmp.use(initReactI18next).init({
  fallbackLng: "de",
  resources: {
    de: { translation: de },
    en: { translation: en },
  },
});

export default i18nCmp;
