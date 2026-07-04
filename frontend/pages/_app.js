import { useEffect, useState, createContext, useContext } from "react";
import "../styles/globals.css";

const ThemeContext = createContext({ dark: false, toggleDark: () => {} });
export const useTheme = () => useContext(ThemeContext);

export default function App({ Component, pageProps }) {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("crm_theme");
    const prefersDark = saved
      ? saved === "dark"
      : window.matchMedia("(prefers-color-scheme: dark)").matches;
    setDark(prefersDark);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("crm_theme", dark ? "dark" : "light");
  }, [dark]);

  const toggleDark = () => setDark((d) => !d);

  return (
    <ThemeContext.Provider value={{ dark, toggleDark }}>
      <Component {...pageProps} />
    </ThemeContext.Provider>
  );
}
