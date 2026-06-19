import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.tsx";
import { CourseProvider } from "./context/CourseContext";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <CourseProvider>
      <App />
    </CourseProvider>
  </BrowserRouter>
);