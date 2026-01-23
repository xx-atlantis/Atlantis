"use client";
import React, { createContext, useContext } from "react";

const LocaleContext = createContext();

export function LocaleProvider({ locale, messages, children }) {
  return (
    <LocaleContext.Provider value={{ locale, messages }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  return useContext(LocaleContext);
}
