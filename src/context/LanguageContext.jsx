import { createContext, useState, useEffect } from "react";

export const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState("en-US");

  useEffect(() => {
    const storedLang = localStorage.getItem("cineverse_lang");
    
    if (storedLang) {
      setLanguage(storedLang);
    } else {
      const browserLang = navigator.language || navigator.userLanguage;
      if (browserLang.includes("pt") || browserLang.includes("BR")) {
        setLanguage("pt-BR");
        localStorage.setItem("cineverse_lang", "pt-BR");
      } else {
        setLanguage("en-US");
        localStorage.setItem("cineverse_lang", "en-US");
      }
    }
  }, []);

  const changeLanguage = (lang) => {
    setLanguage(lang);
    localStorage.setItem("cineverse_lang", lang);
    window.location.reload(); 
  };

  return (
    <LanguageContext.Provider value={{ language, changeLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};