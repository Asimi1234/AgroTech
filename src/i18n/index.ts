import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import enLanding from './locales/en/landing.json';
import haLanding from './locales/ha/landing.json';
import yoLanding from './locales/yo/landing.json';
import igLanding from './locales/ig/landing.json';
import enAuth from './locales/en/auth.json';
import haAuth from './locales/ha/auth.json';
import yoAuth from './locales/yo/auth.json';
import igAuth from './locales/ig/auth.json';
import enCommon from './locales/en/common.json';
import haCommon from './locales/ha/common.json';
import yoCommon from './locales/yo/common.json';
import igCommon from './locales/ig/common.json';
import enDashboard from './locales/en/dashboard.json';
import haDashboard from './locales/ha/dashboard.json';
import yoDashboard from './locales/yo/dashboard.json';
import igDashboard from './locales/ig/dashboard.json';
import enMarketplace from './locales/en/marketplace.json';
import haMarketplace from './locales/ha/marketplace.json';
import yoMarketplace from './locales/yo/marketplace.json';
import igMarketplace from './locales/ig/marketplace.json';
import enGroups from './locales/en/groups.json';
import haGroups from './locales/ha/groups.json';
import yoGroups from './locales/yo/groups.json';
import igGroups from './locales/ig/groups.json';
import enProduct from './locales/en/product.json';
import haProduct from './locales/ha/product.json';
import yoProduct from './locales/yo/product.json';
import igProduct from './locales/ig/product.json';
import enAdmin from './locales/en/admin.json';
import haAdmin from './locales/ha/admin.json';
import yoAdmin from './locales/yo/admin.json';
import igAdmin from './locales/ig/admin.json';

export const defaultNS = 'landing';

export const resources = {
  en: { landing: enLanding, auth: enAuth, common: enCommon, dashboard: enDashboard, marketplace: enMarketplace, groups: enGroups, product: enProduct, admin: enAdmin },
  ha: { landing: haLanding, auth: haAuth, common: haCommon, dashboard: haDashboard, marketplace: haMarketplace, groups: haGroups, product: haProduct, admin: haAdmin },
  yo: { landing: yoLanding, auth: yoAuth, common: yoCommon, dashboard: yoDashboard, marketplace: yoMarketplace, groups: yoGroups, product: yoProduct, admin: yoAdmin },
  ig: { landing: igLanding, auth: igAuth, common: igCommon, dashboard: igDashboard, marketplace: igMarketplace, groups: igGroups, product: igProduct, admin: igAdmin },
} as const;

void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    supportedLngs: ['en', 'ha', 'yo', 'ig'],
    lowerCaseLng: true,
    load: 'languageOnly',
    ns: ['landing', 'auth', 'common', 'dashboard', 'marketplace', 'groups', 'product', 'admin'],
    defaultNS,
    returnEmptyString: false,
    interpolation: { escapeValue: false },
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      lookupLocalStorage: 'agrotech-lang',
      caches: ['localStorage'],
    },
  });

const applyHtmlLang = (lng: string) => {
  document.documentElement.lang = lng;
};
applyHtmlLang(i18n.resolvedLanguage ?? 'en');
i18n.on('languageChanged', applyHtmlLang);

export default i18n;
