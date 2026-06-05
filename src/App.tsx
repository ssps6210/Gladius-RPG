import GameApp from "./game/GameApp";
import { LanguageProvider } from "./game/i18n/LanguageContext";
import { Footer } from "./layout/Footer";

export default function App() {
  return (
    <LanguageProvider>
      <GameApp />
      <Footer />
    </LanguageProvider>
  );
}
