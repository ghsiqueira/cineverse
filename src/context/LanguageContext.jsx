import { createContext, useState, useEffect } from "react";

export const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    const storedLang = localStorage.getItem("cineverse_lang");
    if (storedLang) return storedLang;

    const browserLang = navigator.language || navigator.userLanguage;
    if (browserLang && (browserLang.includes("pt") || browserLang.includes("BR"))) {
      return "pt-BR";
    }
    
    return "en-US";
  });

  useEffect(() => {
    if (language === "pt-BR") {
      document.title = "CineVerse | Explorador de Filmes IA";
    } else {
      document.title = "CineVerse | AI Movie Explorer";
    }
    
    localStorage.setItem("cineverse_lang", language);
  }, [language]);

  const changeLanguage = (lang) => {
    setLanguage(lang);
  };

  return (
    <LanguageContext.Provider value={{ language, changeLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};