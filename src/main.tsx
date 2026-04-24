import ReactDOM from "react-dom/client";

import App from "./App";
import "./styles/tokens.css";
import "./styles/globals.css";

function hideLoading() {
  const loading = document.getElementById("loading");

  if (loading) {
    loading.style.display = "none";
  }
}

function showStartupError(error: unknown) {
  const loading = document.getElementById("loading");
  const message = error instanceof Error ? error.message : String(error);

  if (loading) {
    loading.innerHTML =
      '<div style="color:#c84040;font-size:14px;text-align:center;padding:20px">' +
      '載入失敗<br><small style="color:#8a4030">' +
      message +
      '</small><br><br>' +
      '<button onclick="location.reload()" style="margin-top:10px;padding:8px 20px;' +
      'background:#2a1a08;color:#c8961e;border:1px solid #8b5a14;cursor:pointer;' +
      'font-family:Cinzel,serif">重新載入</button></div>';
  }

  console.error(error);
}

try {
  ReactDOM.createRoot(document.getElementById("root")!).render(<App />);
  hideLoading();
} catch (error) {
  showStartupError(error);
}
