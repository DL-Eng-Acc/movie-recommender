import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./common.css";
import App from "./App.tsx";
import MovieDetail from "./pages/MovieDetail.tsx";

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error('index.html is missing the <div id="root"> element');
}

createRoot(rootElement).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/movie/:id" element={<MovieDetail />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
);
