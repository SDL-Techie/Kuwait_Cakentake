import { createContext, useEffect, useState, type ReactNode, type Dispatch, type SetStateAction } from "react";

type Settings = {
  language: string;
  currency: string;
};

type SettingsContextType = {
  settings: Settings | null;
  setSettings: Dispatch<SetStateAction<Settings | null>>;
};

export const SettingsContext = createContext<SettingsContextType | null>(
  null
);

type SettingsProviderProps = {
  children: ReactNode;
};

export const SettingsProvider = ({
  children,
}: SettingsProviderProps) => {
  const [settings, setSettings] = useState<Settings | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("settings");

    if (saved) {
      setSettings(JSON.parse(saved));
      return;
    }

    // fetch("https://ipapi.co/json/")
     fetch("https://ipinfo.io/json")
      .then((res) => res.json())
      .then((data) => {
        const country = data.country_code;

        let config: Settings = {
          language: "en",
          currency: "USD",
        };

        if (country === "AE") {
          config = {
            language: "ar",
            currency: "AED",
          };
        }

        if (country === "SA") {
          config = {
            language: "ar",
            currency: "SAR",
          };
        }

        if (country === "IN") {
          config = {
            language: "en",
            currency: "INR",
          };
        }

        localStorage.setItem(
          "settings",
          JSON.stringify(config)
        );

        setSettings(config);

      
        
      });
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, setSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}

