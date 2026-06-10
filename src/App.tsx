import { useEffect, useState } from "react";
import GameApp from "./game/GameApp";
import { LanguageProvider } from "./game/i18n/LanguageContext";
import { Footer } from "./layout/Footer";
import { SaveSlotSelect } from "./components/SaveSlotSelect";
import { migrateLegacyToSlot1 } from "./game/persistence";
import type { SaveSlot } from "./game/constants/storage";
import { SLOT_KEY } from "./game/constants/storage";

export default function App() {
  const [activeSlot, setActiveSlot] = useState<SaveSlot | null>(() => {
    if (typeof window === "undefined") return null;
    migrateLegacyToSlot1();
    const saved = window.localStorage.getItem(SLOT_KEY);
    const n = Number(saved);
    if (n === 1 || n === 2 || n === 3) return n;
    return null;
  });

  useEffect(() => {
    if (activeSlot !== null) {
      window.localStorage.setItem(SLOT_KEY, String(activeSlot));
    }
  }, [activeSlot]);

  return (
    <LanguageProvider>
      {activeSlot === null ? (
        <SaveSlotSelect onSelect={(slot) => setActiveSlot(slot)} />
      ) : (
        <>
          <GameApp slot={activeSlot} onExitToMenu={() => {
            window.localStorage.removeItem(SLOT_KEY);
            setActiveSlot(null);
          }} />
          <Footer />
        </>
      )}
    </LanguageProvider>
  );
}
