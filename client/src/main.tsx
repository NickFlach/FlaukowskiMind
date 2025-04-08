import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import WebFont from "webfontloader";

WebFont.load({
  google: {
    families: [
      'Cinzel:400,700',
      'Space Mono:400,700',
      'Alegreya:400,700,400i'
    ]
  }
});

createRoot(document.getElementById("root")!).render(<App />);
